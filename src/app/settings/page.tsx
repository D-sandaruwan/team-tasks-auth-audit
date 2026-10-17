import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function saveName(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  await supabase.from("profiles").update({ full_name: String(formData.get("full_name") ?? "").trim() }).eq("id", user.id);
  revalidatePath("/settings");
}

export default async function Settings() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("full_name, role").eq("id", user.id).single();

  return (
    <form action={saveName} className="max-w-sm space-y-3 rounded bg-white p-6 shadow">
      <h1 className="text-xl font-semibold">Profile</h1>
      <p className="text-sm text-gray-500">{user.email} · {profile?.role}</p>
      <input name="full_name" defaultValue={profile?.full_name ?? ""} placeholder="Your name" required className="w-full rounded border px-3 py-2" />
      <button className="rounded bg-black px-4 py-2 text-white">Save</button>
    </form>
  );
}
