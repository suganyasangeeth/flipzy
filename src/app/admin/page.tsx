"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import FlashcardUploadDialog from "@/components/FlashcardUploadDialog";

interface Topic {
  id: string;
  subject_id: string;
  name: string;
  description: string;
  order: number;
}

interface Subject {
  id: string;
  name: string;
  color: string;
  icon: string;
  order: number;
  visible: boolean;
}

const COLOR_SWATCHES = [
  "#ffdbca",
  "#ffdad6",
  "#e9ddff",
  "#d8e3fb",
  "#8cfa9f",
  "#dee8ff",
  "#bae6fd",
  "#fecdd3",
  "#fef08a",
  "#d9f99d",
];

const ICON_OPTIONS = [
  "pets",
  "restaurant",
  "mood",
  "science",
  "family_home",
  "palette",
  "sports_esports",
  "music_note",
  "brush",
  "calculate",
  "history_edu",
  "public",
];

export default function AdminPage() {
  const router = useRouter();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topicsBySubject, setTopicsBySubject] = useState<
    Record<string, Topic[]>
  >({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [subjectName, setSubjectName] = useState("");
  const [subjectColor, setSubjectColor] = useState(COLOR_SWATCHES[0]);
  const [subjectIcon, setSubjectIcon] = useState(ICON_OPTIONS[0]);

  const [showTopicModal, setShowTopicModal] = useState(false);
  const [topicSubjectId, setTopicSubjectId] = useState("");
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [topicName, setTopicName] = useState("");
  const [topicDesc, setTopicDesc] = useState("");

  const [confirmDelete, setConfirmDelete] = useState<{
    type: "subject" | "topic";
    id: string;
    name: string;
  } | null>(null);

  const [flashcardDialog, setFlashcardDialog] = useState<{
    topicId: string;
    topicName: string;
  } | null>(null);

  useEffect(() => {
    fetchSubjects();
  }, []);

  async function fetchSubjects() {
    const { data } = await supabase
      .from("subjects")
      .select("*")
      .order("order", { ascending: true });
    if (data) {
      setSubjects(data);
      data.forEach((s) => fetchTopics(s.id));
    }
  }

  async function fetchTopics(subjectId: string) {
    const { data } = await supabase
      .from("topics")
      .select("*")
      .eq("subject_id", subjectId)
      .order("order", { ascending: true });
    if (data) {
      setTopicsBySubject((prev) => ({ ...prev, [subjectId]: data }));
    }
  }

  function toggleExpand(subjectId: string) {
    setExpanded((prev) => ({ ...prev, [subjectId]: !prev[subjectId] }));
  }

  function openAddSubject() {
    setEditingSubject(null);
    setSubjectName("");
    setSubjectColor(COLOR_SWATCHES[0]);
    setSubjectIcon(ICON_OPTIONS[0]);
    setShowSubjectModal(true);
  }

  function openEditSubject(s: Subject) {
    setEditingSubject(s);
    setSubjectName(s.name);
    setSubjectColor(s.color);
    setSubjectIcon(s.icon);
    setShowSubjectModal(true);
  }

  async function saveSubject() {
    if (!subjectName.trim()) return;
    if (editingSubject) {
      await supabase
        .from("subjects")
        .update({ name: subjectName, color: subjectColor, icon: subjectIcon })
        .eq("id", editingSubject.id);
    } else {
      const maxOrder =
        subjects.length > 0
          ? Math.max(...subjects.map((s) => s.order))
          : 0;
      await supabase.from("subjects").insert({
        name: subjectName,
        color: subjectColor,
        icon: subjectIcon,
        order: maxOrder + 1,
        visible: true,
      });
    }
    setShowSubjectModal(false);
    fetchSubjects();
  }

  async function deleteSubject(id: string) {
    await supabase.from("subjects").delete().eq("id", id);
    setConfirmDelete(null);
    fetchSubjects();
  }

  function openAddTopic(subjectId: string) {
    setEditingTopic(null);
    setTopicSubjectId(subjectId);
    setTopicName("");
    setTopicDesc("");
    setShowTopicModal(true);
  }

  function openEditTopic(t: Topic) {
    setEditingTopic(t);
    setTopicSubjectId(t.subject_id);
    setTopicName(t.name);
    setTopicDesc(t.description);
    setShowTopicModal(true);
  }

  async function saveTopic() {
    if (!topicName.trim()) return;
    if (editingTopic) {
      await supabase
        .from("topics")
        .update({ name: topicName, description: topicDesc })
        .eq("id", editingTopic.id);
    } else {
      const existing = topicsBySubject[topicSubjectId] || [];
      const maxOrder =
        existing.length > 0
          ? Math.max(...existing.map((t) => t.order))
          : 0;
      await supabase.from("topics").insert({
        subject_id: topicSubjectId,
        name: topicName,
        description: topicDesc,
        order: maxOrder + 1,
      });
    }
    setShowTopicModal(false);
    fetchTopics(topicSubjectId);
  }

  async function deleteTopic(id: string, subjectId: string) {
    await supabase.from("topics").delete().eq("id", id);
    setConfirmDelete(null);
    fetchTopics(subjectId);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <div className="bg-background text-on-background min-h-screen flex">
      {/* Sidebar */}
      <nav className="hidden md:flex flex-col h-screen p-unit gap-stack-gap bg-arcade-surface w-72 border-r-4 border-primary sticky top-0 z-50">
        <div className="px-gutter pt-gutter pb-4">
          <h1 className="font-headline-lg text-headline-lg text-primary uppercase">
            Admin Panel
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Manage Flipzy Content
          </p>
        </div>
        <div className="flex-1 flex flex-col gap-2 px-gutter">
          <a
            className="flex items-center gap-3 p-3 bg-primary text-on-primary rounded-xl font-label-caps text-label-caps"
            href="#"
          >
            <span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              menu_book
            </span>
            <span>Subjects</span>
          </a>
          <a
            className="flex items-center gap-3 p-3 text-on-surface-variant hover:text-primary font-label-caps text-label-caps hover:translate-x-1 transition-transform"
            href="/admin/kids"
          >
            <span className="material-symbols-outlined">child_care</span>
            <span>Kid Accounts</span>
          </a>
        </div>
      </nav>

      {/* Main */}
      <main className="flex-1 flex flex-col min-h-screen bg-background">
        {/* Top bar */}
        <header className="flex items-center justify-between px-gutter w-full sticky top-0 z-40 h-20 border-b-4 border-primary bg-arcade-surface shadow-chunky-primary">
          <div className="flex items-center gap-4">
            <button className="md:hidden p-2 text-primary">
              <span className="material-symbols-outlined">menu</span>
            </button>
            <span
              className="font-display-hero text-headline-lg text-primary uppercase tracking-tighter hidden md:block"
              style={{ fontSize: "32px", lineHeight: "40px" }}
            >
              Flipzy Admin
            </span>
            <span className="font-headline-md text-headline-md text-primary font-bold md:hidden">
              SUBJECTS
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleLogout}
              className="p-2 text-primary hover:bg-surface-variant rounded-full transition-colors"
            >
              <span className="material-symbols-outlined">logout</span>
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="p-container-padding md:p-card-padding flex-1 max-w-7xl mx-auto w-full flex flex-col gap-8">
          {/* Page header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="font-display-hero text-display-hero text-on-background">
                Subject Manager
              </h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant mt-2">
                Organize content categories and topics for learners.
              </p>
            </div>
            <button
              onClick={openAddSubject}
              className="bg-primary text-on-primary px-6 py-3 rounded-xl border-4 border-white font-label-caps text-label-caps uppercase flex items-center gap-2 chunky-btn active:translate-x-[6px] active:translate-y-[6px] active:shadow-none transition-all"
            >
              <span
                className="material-symbols-outlined"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                add_circle
              </span>
              Add Subject
            </button>
          </div>

          {/* Subject cards grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-stack-gap">
            {subjects.map((subject) => {
              const topics = topicsBySubject[subject.id] || [];
              const isExpanded = expanded[subject.id] !== false;
              return (
                <div
                  key={subject.id}
                  className="bg-arcade-surface rounded-2xl border-2 border-primary overflow-hidden shadow-card-ambient flex flex-col"
                >
                  {/* Subject header */}
                  <div className="p-card-padding border-b-2 border-primary/10 flex justify-between items-center bg-gradient-to-r from-accent-space/20 to-transparent">
                    <div className="flex items-center gap-4">
                      <div
                        className="w-16 h-16 bg-white rounded-xl border-2 border-primary flex items-center justify-center"
                        style={{
                          boxShadow: "4px 4px 0px 0px rgba(0,0,0,0.2)",
                        }}
                      >
                        <span
                          className="material-symbols-outlined text-4xl"
                          style={{
                            color: subject.color,
                            fontVariationSettings: "'FILL' 1",
                          }}
                        >
                          {subject.icon}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-headline-lg text-headline-lg text-primary">
                          {subject.name}
                        </h3>
                        <p className="font-body-md text-body-md text-on-surface-variant">
                          {topics.length} Topic{topics.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditSubject(subject)}
                        className="p-2 text-primary hover:bg-surface-variant rounded-lg transition-colors"
                        title="Edit subject"
                      >
                        <span className="material-symbols-outlined">edit</span>
                      </button>
                      <button
                        onClick={() =>
                          setConfirmDelete({
                            type: "subject",
                            id: subject.id,
                            name: subject.name,
                          })
                        }
                        className="p-2 text-error hover:bg-error-container rounded-lg transition-colors"
                        title="Delete subject"
                      >
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                      <button
                        onClick={() => toggleExpand(subject.id)}
                        className="p-2 text-primary bg-white rounded-lg border-2 border-primary active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
                        style={{
                          boxShadow: "4px 4px 0px 0px rgba(0,0,0,0.2)",
                        }}
                      >
                        <span className="material-symbols-outlined">
                          {isExpanded ? "expand_less" : "expand_more"}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Topics list */}
                  {isExpanded && (
                    <div className="p-card-padding flex flex-col gap-4 bg-white/50 flex-1">
                      {topics.map((topic) => (
                        <div
                          key={topic.id}
                          className="bg-white rounded-xl border-2 border-outline-variant p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-primary transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-surface-container rounded-lg flex items-center justify-center text-primary">
                              <span className="material-symbols-outlined">
                                topic
                              </span>
                            </div>
                            <div>
                              <h4 className="font-headline-md text-headline-md text-on-surface">
                                {topic.name}
                              </h4>
                              {topic.description && (
                                <p className="font-body-md text-body-md text-on-surface-variant text-sm">
                                  {topic.description}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 w-full md:w-auto">
                            <button
                              onClick={() =>
                                setFlashcardDialog({
                                  topicId: topic.id,
                                  topicName: topic.name,
                                })
                              }
                              className="flex-1 md:flex-none bg-surface-variant text-primary px-4 py-2 rounded-lg font-label-caps text-label-caps text-sm border-2 border-transparent hover:border-primary transition-all flex items-center justify-center gap-2"
                            >
                              <span className="material-symbols-outlined text-sm">
                                upload_file
                              </span>
                              Flashcards
                            </button>
                            <button
                              onClick={() => openEditTopic(topic)}
                              className="p-2 text-primary hover:bg-surface-variant rounded-lg transition-colors"
                              title="Edit"
                            >
                              <span className="material-symbols-outlined">
                                edit
                              </span>
                            </button>
                            <button
                              onClick={() =>
                                setConfirmDelete({
                                  type: "topic",
                                  id: topic.id,
                                  name: topic.name,
                                })
                              }
                              className="p-2 text-error hover:bg-error-container rounded-lg transition-colors"
                              title="Remove"
                            >
                              <span className="material-symbols-outlined">
                                delete
                              </span>
                            </button>
                          </div>
                        </div>
                      ))}

                      <button
                        onClick={() => openAddTopic(subject.id)}
                        className="w-full mt-2 border-2 border-dashed border-primary/40 bg-surface-container-low text-primary p-4 rounded-xl font-label-caps text-label-caps flex items-center justify-center gap-2 hover:bg-surface-variant transition-colors"
                      >
                        <span className="material-symbols-outlined">add</span>
                        Add Topic to {subject.name}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Subject Modal */}
      {showSubjectModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
          <div className="bg-arcade-surface rounded-2xl border-2 border-primary p-card-padding w-full max-w-md shadow-card-ambient">
            <h3 className="font-headline-lg text-headline-lg text-primary mb-stack-gap">
              {editingSubject ? "Edit Subject" : "Add Subject"}
            </h3>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block font-label-caps text-label-caps text-on-surface mb-unit">
                  Name
                </label>
                <input
                  className="w-full px-4 py-3 rounded-xl border-2 border-outline-variant bg-surface-container-lowest text-on-surface focus:border-primary focus:ring-0 transition-colors font-body-md"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  placeholder="Subject name"
                />
              </div>
              <div>
                <label className="block font-label-caps text-label-caps text-on-surface mb-unit">
                  Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {COLOR_SWATCHES.map((c) => (
                    <button
                      key={c}
                      onClick={() => setSubjectColor(c)}
                      className="w-10 h-10 rounded-xl border-2 transition-all"
                      style={{
                        backgroundColor: c,
                        borderColor:
                          subjectColor === c ? "#A81D1D" : "transparent",
                        boxShadow:
                          subjectColor === c
                            ? "0 0 0 2px #A81D1D"
                            : "none",
                      }}
                    />
                  ))}
                </div>
              </div>
              <div>
                <label className="block font-label-caps text-label-caps text-on-surface mb-unit">
                  Icon
                </label>
                <div className="flex flex-wrap gap-2">
                  {ICON_OPTIONS.map((ic) => (
                    <button
                      key={ic}
                      onClick={() => setSubjectIcon(ic)}
                      className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all ${
                        subjectIcon === ic
                          ? "bg-primary text-on-primary border-primary"
                          : "bg-surface-container-lowest text-primary border-outline-variant hover:border-primary"
                      }`}
                    >
                      <span className="material-symbols-outlined">{ic}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-stack-gap justify-end">
              <button
                onClick={() => setShowSubjectModal(false)}
                className="px-6 py-3 rounded-xl border-2 border-outline-variant font-label-caps text-label-caps hover:bg-surface-variant transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveSubject}
                className="px-6 py-3 rounded-xl bg-primary text-on-primary font-label-caps text-label-caps border-2 border-on-primary/20 chunky-btn active:translate-x-[6px] active:translate-y-[6px] active:shadow-none transition-all"
              >
                {editingSubject ? "Save" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Topic Modal */}
      {showTopicModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
          <div className="bg-arcade-surface rounded-2xl border-2 border-primary p-card-padding w-full max-w-md shadow-card-ambient">
            <h3 className="font-headline-lg text-headline-lg text-primary mb-stack-gap">
              {editingTopic ? "Edit Topic" : "Add Topic"}
            </h3>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block font-label-caps text-label-caps text-on-surface mb-unit">
                  Topic Name
                </label>
                <input
                  className="w-full px-4 py-3 rounded-xl border-2 border-outline-variant bg-surface-container-lowest text-on-surface focus:border-primary focus:ring-0 transition-colors font-body-md"
                  value={topicName}
                  onChange={(e) => setTopicName(e.target.value)}
                  placeholder="Topic name"
                />
              </div>
              <div>
                <label className="block font-label-caps text-label-caps text-on-surface mb-unit">
                  Description
                </label>
                <textarea
                  className="w-full px-4 py-3 rounded-xl border-2 border-outline-variant bg-surface-container-lowest text-on-surface focus:border-primary focus:ring-0 transition-colors font-body-md resize-none"
                  value={topicDesc}
                  onChange={(e) => setTopicDesc(e.target.value)}
                  placeholder="Short description"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-stack-gap justify-end">
              <button
                onClick={() => setShowTopicModal(false)}
                className="px-6 py-3 rounded-xl border-2 border-outline-variant font-label-caps text-label-caps hover:bg-surface-variant transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveTopic}
                className="px-6 py-3 rounded-xl bg-primary text-on-primary font-label-caps text-label-caps border-2 border-on-primary/20 chunky-btn active:translate-x-[6px] active:translate-y-[6px] active:shadow-none transition-all"
              >
                {editingTopic ? "Save" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
          <div className="bg-arcade-surface rounded-2xl border-2 border-error p-card-padding w-full max-w-sm shadow-card-ambient text-center">
            <span className="material-symbols-outlined text-6xl text-error mb-4">
              delete
            </span>
            <h3 className="font-headline-md text-headline-md text-on-surface mb-2">
              Delete {confirmDelete.type === "subject" ? "Subject" : "Topic"}?
            </h3>
            <p className="font-body-md text-body-md text-on-surface-variant mb-stack-gap">
              &ldquo;{confirmDelete.name}&rdquo; will be permanently removed.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-6 py-3 rounded-xl border-2 border-outline-variant font-label-caps text-label-caps hover:bg-surface-variant transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  confirmDelete.type === "subject"
                    ? deleteSubject(confirmDelete.id)
                    : deleteTopic(confirmDelete.id, topicSubjectId)
                }
                className="px-6 py-3 rounded-xl bg-error text-on-error font-label-caps text-label-caps border-2 border-on-error/20 chunky-btn active:translate-x-[6px] active:translate-y-[6px] active:shadow-none transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Flashcard Upload Dialog */}
      {flashcardDialog && (
        <FlashcardUploadDialog
          topicId={flashcardDialog.topicId}
          topicName={flashcardDialog.topicName}
          onClose={() => setFlashcardDialog(null)}
          onUploaded={() => {
            setFlashcardDialog(null);
            fetchSubjects();
          }}
        />
      )}
    </div>
  );
}
