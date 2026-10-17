import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // RLS scopes to the caller's team
  const { data: task, error } = await supabase.from("tasks").select("*").eq("id", id).maybeSingle();
  if (error) return NextResponse.json({ error: "Bad request" }, { status: 400 }); // e.g. malformed uuid
  if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(task);
}
