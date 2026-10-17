"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function Login() {
  const supabase = createClient();
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
          emailRedirectTo: `${location.origin}/auth/callback`,
        },
      });
      if (error) return setMsg(error.message);
      if (!data.session) return setMsg("Check your email to confirm your account.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return setMsg(error.message);
    }
    router.push("/dashboard");
    router.refresh();
  }

  async function google() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
  }

  const input = "w-full rounded border px-3 py-2";
  return (
    <div className="mx-auto mt-16 max-w-sm space-y-4 rounded bg-white p-6 shadow">
      <h1 className="text-xl font-semibold">{mode === "login" ? "Log in" : "Sign up"}</h1>
      <form onSubmit={submit} className="space-y-3">
        {mode === "signup" && (
          <input className={input} placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
        )}
        <input className={input} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className={input} type="password" placeholder="Password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button className="w-full rounded bg-black py-2 text-white">{mode === "login" ? "Log in" : "Create account"}</button>
      </form>
      <button onClick={google} className="w-full rounded border py-2">Sign in with Google</button>
      {msg && <p className="text-sm text-red-600">{msg}</p>}
      <button className="text-sm text-gray-600 underline" onClick={() => setMode(mode === "login" ? "signup" : "login")}>
        {mode === "login" ? "Need an account? Sign up" : "Have an account? Log in"}
      </button>
    </div>
  );
}
