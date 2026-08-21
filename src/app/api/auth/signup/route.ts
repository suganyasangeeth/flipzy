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

export async function POST(request: Request) {
  const { name, email, password } = await request.json();

  if (!name || !email || !password) {
    return NextResponse.json(
      { error: "Name, email, and password are required" },
      { status: 400 }
    );
  }

  const { data: userData, error: createError } =
    await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, role: "kid" },
    });

  if (createError) {
    return NextResponse.json({ error: createError.message }, { status: 400 });
  }

  const { error: kidError } = await supabaseAdmin.from("kid_accounts").insert({
    id: userData.user.id,
    name,
    email,
    status: "active",
  });

  if (kidError) {
    return NextResponse.json({ error: kidError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
