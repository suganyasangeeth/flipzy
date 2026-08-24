"use client";

import { useState, useRef } from "react";
import Papa from "papaparse";
import { supabase } from "@/lib/supabase/client";

interface ParsedCard {
  front_text: string;
  back_text: string;
  error?: string;
}

interface FlashcardUploadDialogProps {
  topicId: string;
  topicName: string;
  onClose: () => void;
  onUploaded: () => void;
}

export default function FlashcardUploadDialog({
  topicId,
  topicName,
  onClose,
  onUploaded,
}: FlashcardUploadDialogProps) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [parsedCards, setParsedCards] = useState<ParsedCard[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    success: boolean;
    count: number;
  } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function parseCSV(text: string): { cards: ParsedCard[]; errors: string[] } {
    const parseErrors: string[] = [];
    const cards: ParsedCard[] = [];

    const result = Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h: string) => h.trim().toLowerCase().replace(/^"|"$/g, ""),
    });

    if (result.errors.length > 0) {
      result.errors.forEach((e) => {
        parseErrors.push(`Row ${e.row ?? "?"}: ${e.message}`);
      });
    }

    const fields = result.meta.fields ?? [];
    const frontKey = fields.find(
      (f) => f === "front_text" || f === "front" || f === "term"
    );
    const backKey = fields.find(
      (f) => f === "back_text" || f === "back" || f === "definition"
    );

    if (!frontKey || !backKey) {
      return {
        cards: [],
        errors: [
          'CSV must have "front_text" and "back_text" columns (also accepts "front"/"term" and "back"/"definition").',
        ],
      };
    }

    const rows = result.data as Record<string, string>[];

    if (rows.length === 0) {
      return { cards: [], errors: ["CSV file is empty or has no data rows."] };
    }

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const front = (row[frontKey] ?? "").trim();
      const back = (row[backKey] ?? "").trim();

      if (!front && !back) continue;

      if (!front) {
        parseErrors.push(`Row ${i + 2}: Missing front text (term).`);
        continue;
      }
      if (!back) {
        parseErrors.push(`Row ${i + 2}: Missing back text (definition).`);
        continue;
      }

      cards.push({ front_text: front, back_text: back });
    }

    if (cards.length === 0 && parseErrors.length === 0) {
      parseErrors.push("No valid flashcards found in the file.");
    }

    return { cards, errors: parseErrors };
  }

  function handleFile(selected: File) {
    if (!selected.name.endsWith(".csv")) {
      setErrors(["Only CSV files are allowed (.csv)."]);
      return;
    }
    if (selected.size > 5 * 1024 * 1024) {
      setErrors(["File size must be under 5MB."]);
      return;
    }

    setFile(selected);
    setErrors([]);
    setUploadResult(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const result = parseCSV(text);
      setParsedCards(result.cards);
      setErrors(result.errors);
    };
    reader.readAsText(selected);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragActive(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFile(dropped);
  }

  function onBrowse(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (selected) handleFile(selected);
  }

  async function handleUpload() {
    if (parsedCards.length === 0) return;
    setUploading(true);

    const rows = parsedCards.map((c) => ({
      topic_id: topicId,
      front_text: c.front_text,
      back_text: c.back_text,
      status: "published" as const,
    }));

    const { error } = await supabase.from("flashcards").insert(rows);

    if (error) {
      setErrors([`Upload failed: ${error.message}`]);
      setUploading(false);
      return;
    }

    setUploadResult({ success: true, count: rows.length });
    setUploading(false);
  }

  function downloadTemplate() {
    const csv = 'front_text,back_text\nHello,Hi there\n"A Plant grows, reproduces and so on.",Photosynthesis\n"The sun, moon, and stars",Celestial bodies';
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "flashcard_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-arcade-surface rounded-2xl w-full max-w-2xl relative overflow-hidden flex flex-col border-t-4 border-primary shadow-card-ambient max-h-[90vh]">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-on-surface-variant p-2 rounded-full hover:bg-surface-variant z-10 hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined text-3xl">close</span>
        </button>

        {/* Header */}
        <div className="p-card-padding pb-0 text-center">
          <h2 className="font-headline-lg text-headline-lg text-primary uppercase mb-2">
            Upload Flashcards
          </h2>
          <p className="font-body-md text-on-surface-variant">
            For Topic: <span className="font-bold text-on-surface">{topicName}</span>
          </p>
        </div>

        {/* Content */}
        <div className="p-card-padding flex flex-col gap-6 flex-1 overflow-y-auto">
          {/* Success state */}
          {uploadResult?.success ? (
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="w-20 h-20 rounded-full bg-tertiary-fixed flex items-center justify-center">
                <span className="material-symbols-outlined text-5xl text-tertiary">
                  check_circle
                </span>
              </div>
              <h3 className="font-headline-md text-headline-md text-on-surface text-center">
                {uploadResult.count} Flashcard{uploadResult.count !== 1 ? "s" : ""} Uploaded!
              </h3>
              <button
                onClick={onUploaded}
                className="px-8 py-3 rounded-xl bg-primary text-on-primary font-label-caps text-label-caps uppercase chunky-btn border-4 border-on-primary/20"
              >
                Done
              </button>
            </div>
          ) : (
            <>
              {/* Download template */}
              <div className="flex justify-end">
                <button
                  onClick={downloadTemplate}
                  className="flex items-center gap-2 font-label-caps text-label-caps hover:underline text-primary"
                >
                  <span className="material-symbols-outlined text-3xl">download</span>
                  Download CSV Template
                </button>
              </div>

              {/* Drag & drop area */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={onDrop}
                onClick={() => inputRef.current?.click()}
                className={`border-4 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-4 cursor-pointer transition-colors ${
                  dragActive
                    ? "border-primary bg-primary/5"
                    : "border-outline-variant bg-surface-container hover:bg-surface-container-high hover:border-primary"
                }`}
              >
                <div className="bg-surface rounded-xl p-4 shadow-sm border-2 border-outline-variant">
                  <span className="material-symbols-outlined text-4xl text-primary">
                    upload_file
                  </span>
                </div>
                <div className="text-center">
                  <p className="font-body-lg text-on-surface mb-1">
                    Drag and drop your CSV file here
                  </p>
                  <p className="font-body-md text-on-surface-variant">
                    or click to browse from your computer
                  </p>
                </div>
                <input
                  ref={inputRef}
                  type="file"
                  accept=".csv"
                  onChange={onBrowse}
                  className="hidden"
                />
              </div>

              {/* File info */}
              {file && (
                <div className="flex items-center gap-3 bg-surface-container-low p-3 rounded-lg">
                  <span className="material-symbols-outlined text-3xl text-primary">
                    description
                  </span>
                  <div className="flex-1">
                    <p className="font-body-md text-on-surface font-semibold text-sm">
                      {file.name}
                    </p>
                    <p className="font-body-md text-on-surface-variant text-xs">
                      {(file.size / 1024).toFixed(1)} KB
                      {parsedCards.length > 0 &&
                        ` — ${parsedCards.length} card${parsedCards.length !== 1 ? "s" : ""} found`}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                      setParsedCards([]);
                      setErrors([]);
                    }}
                    className="p-1 text-on-surface-variant hover:text-error transition-colors"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
              )}

              {/* Errors */}
              {errors.length > 0 && (
                <div className="bg-error-container/30 p-4 rounded-lg border-l-4 border-error flex gap-3">
                  <span className="material-symbols-outlined text-3xl text-error shrink-0">
                    error
                  </span>
                  <div>
                    <p className="font-body-md text-on-surface font-semibold text-sm">
                      {errors.length === 1 ? "Issue found:" : `${errors.length} issues found:`}
                    </p>
                    <ul className="list-disc list-inside text-sm text-on-surface-variant mt-1">
                      {errors.map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Requirements */}
              <div className="bg-surface-container-low p-4 rounded-lg border-l-4 border-accent-objects flex gap-3">
                <span className="material-symbols-outlined text-3xl text-primary shrink-0">
                  info
                </span>
                <div>
                  <p className="font-body-md text-on-surface font-semibold text-sm">
                    File Requirements
                  </p>
                  <ul className="list-disc list-inside text-sm text-on-surface-variant mt-1">
                    <li>CSV format only (.csv)</li>
                    <li>Maximum file size: 5MB</li>
                    <li>
                      Must contain <strong>front_text</strong> and{" "}
                      <strong>back_text</strong> columns
                    </li>
                    <li>
                      Also accepts <strong>front/term</strong> and{" "}
                      <strong>back/definition</strong> as column names
                    </li>
                    <li className="text-primary font-semibold">
                      Wrap fields containing commas in double quotes (e.g. &quot;Paris, France&quot;)
                    </li>
                  </ul>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!uploadResult?.success && (
          <div className="p-card-padding bg-surface-container-high border-t-2 border-outline-variant flex justify-end gap-4">
            <button
              onClick={onClose}
              className="px-6 py-3 font-label-caps text-label-caps text-on-surface hover:bg-surface-variant rounded-lg transition-colors border-2 border-transparent"
            >
              CANCEL
            </button>
            <button
              onClick={handleUpload}
              disabled={parsedCards.length === 0 || uploading}
              className="chunky-btn bg-primary text-on-primary font-label-caps text-label-caps px-8 py-3 rounded-xl border-4 border-on-primary/20 uppercase flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined">save</span>
              {uploading ? "Uploading..." : "Save Flashcards"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
