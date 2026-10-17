import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function Admin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (me?.role !== "admin") notFound(); // RLS independently hides other users from non-admins

  const { data: users } = await supabase.from("profiles").select("id, full_name, role, teams(name)").order("full_name");

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">All users</h1>
      <table className="w-full rounded bg-white text-left text-sm shadow">
        <thead><tr className="border-b"><th className="p-3">Name</th><th className="p-3">Role</th><th className="p-3">Team</th></tr></thead>
        <tbody>
          {users?.map((u: any) => (
            <tr key={u.id} className="border-b last:border-0">
              <td className="p-3">{u.full_name ?? u.id.slice(0, 8)}</td>
              <td className="p-3">{u.role}</td>
              <td className="p-3">{u.teams?.name ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
