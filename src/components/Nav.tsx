import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function signOut() {
  "use server";
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export default async function Nav() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();

  return (
    <nav className="flex items-center gap-4 border-b bg-white px-6 py-3 text-sm">
      <Link href="/dashboard" className="font-semibold">Team Tasks</Link>
      <Link href="/settings">Settings</Link>
      {profile?.role === "admin" && <Link href="/admin">Admin</Link>}
      <form action={signOut} className="ml-auto">
        <button className="text-gray-600 hover:underline">Sign out</button>
      </form>
    </nav>
  );
}
