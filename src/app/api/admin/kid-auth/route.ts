import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const kidId = searchParams.get("id");
  if (!kidId) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin.auth.admin.getUserById(kidId);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    email_confirmed_at: data.user.email_confirmed_at,
    email: data.user.email,
  });
}

export async function PATCH(request: Request) {
  const { kidId, email } = await request.json();
  if (!kidId || !email) {
    return NextResponse.json(
      { error: "kidId and email are required" },
      { status: 400 }
    );
  }

  const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
    kidId,
    { email }
  );
  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 400 });
  }

  const { error: dbError } = await supabaseAdmin
    .from("kid_accounts")
    .update({ email })
    .eq("id", kidId);
  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
