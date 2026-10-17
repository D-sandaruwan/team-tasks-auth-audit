import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function createTask(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: me } = await supabase.from("profiles").select("team_id").eq("id", user.id).single();
  if (!me?.team_id) return;
  // RLS also enforces team_id = current_team_id()
  await supabase.from("tasks").insert({
    title: String(formData.get("title") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim() || null,
    assigned_to: String(formData.get("assigned_to") ?? "") || null,
    team_id: me.team_id,
  });
  revalidatePath("/dashboard");
}

export default async function Dashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: me } = await supabase.from("profiles").select("full_name, team_id, teams(name)").eq("id", user.id).single();
  if (!me?.team_id) {
    return <p>You're not on a team yet. Ask an admin to add you.</p>;
  }

  const [{ data: tasks }, { data: members }] = await Promise.all([
    supabase.from("tasks").select("id, title, status, assignee:profiles(full_name)").order("created_at", { ascending: false }),
    supabase.from("profiles").select("id, full_name").eq("team_id", me.team_id),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">{(me.teams as any)?.name} tasks</h1>

      <form action={createTask} className="space-y-2 rounded bg-white p-4 shadow">
        <input name="title" placeholder="New task title" required className="w-full rounded border px-3 py-2" />
        <textarea name="description" placeholder="Description (optional)" className="w-full rounded border px-3 py-2" />
        <div className="flex gap-2">
          <select name="assigned_to" className="rounded border px-3 py-2" defaultValue="">
            <option value="">Unassigned</option>
            {members?.map((m) => <option key={m.id} value={m.id}>{m.full_name ?? m.id.slice(0, 8)}</option>)}
          </select>
          <button className="rounded bg-black px-4 py-2 text-white">Add task</button>
        </div>
      </form>

      <ul className="divide-y rounded bg-white shadow">
        {tasks?.map((t: any) => (
          <li key={t.id}>
            <Link href={`/tasks/${t.id}`} className="flex justify-between p-4 hover:bg-gray-50">
              <span>{t.title}</span>
              <span className="text-sm text-gray-500">{t.status} · {t.assignee?.full_name ?? "unassigned"}</span>
            </Link>
          </li>
        ))}
        {!tasks?.length && <li className="p-4 text-gray-500">No tasks yet.</li>}
      </ul>
    </div>
  );
}
