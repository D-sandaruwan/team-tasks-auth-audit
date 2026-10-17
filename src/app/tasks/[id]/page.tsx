import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function TaskPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  // RLS limits this to the caller's team; other teams' tasks come back empty -> 404
  const { data: task } = await supabase
    .from("tasks")
    .select("*, assignee:profiles(full_name)")
    .eq("id", id)
    .maybeSingle();
  if (!task) notFound();

  return (
    <div className="space-y-3 rounded bg-white p-6 shadow">
      <Link href="/dashboard" className="text-sm text-gray-600 underline">← Back</Link>
      <h1 className="text-2xl font-semibold">{task.title}</h1>
      <p className="text-sm text-gray-500">
        {task.status} · assigned to {task.assignee?.full_name ?? "nobody"} · {new Date(task.created_at).toLocaleString()}
      </p>
      <p className="whitespace-pre-wrap">{task.description || "No description."}</p>
    </div>
  );
}
