"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AgeGate } from "./age-gate";

export function RegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    ageVerified: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  function validate() {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.email.trim()) errs.email = "Email is required";
    if (!form.password) errs.password = "Password is required";
    else if (form.password.length < 8)
      errs.password = "Password must be at least 8 characters";
    if (form.password !== form.confirmPassword)
      errs.confirmPassword = "Passwords do not match";
    if (!form.ageVerified)
      errs.ageVerified = "You must confirm you are 18 or older";
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          ageVerified: form.ageVerified,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrors({ form: data.error?.message || "Registration failed" });
        return;
      }

      const signInRes = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (signInRes?.ok) {
        router.push("/dashboard");
      } else {
        setErrors({ form: "Registration succeeded but sign-in failed" });
      }
    } catch {
      setErrors({ form: "An unexpected error occurred" });
    } finally {
      setLoading(false);
    }
  }

  function update(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      delete next.form;
      return next;
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-sm">
      {errors.form && (
        <p className="text-red-400 text-sm text-center">{errors.form}</p>
      )}

      <div className="flex flex-col gap-1">
        <input
          type="text"
          placeholder="Name"
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
          className="bg-obsidian border border-gray-700 rounded px-3 py-2 text-white focus:border-gold focus:outline-none"
        />
        {errors.name && <p className="text-red-400 text-xs">{errors.name}</p>}
      </div>

      <div className="flex flex-col gap-1">
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          className="bg-obsidian border border-gray-700 rounded px-3 py-2 text-white focus:border-gold focus:outline-none"
        />
        {errors.email && <p className="text-red-400 text-xs">{errors.email}</p>}
      </div>

      <div className="flex flex-col gap-1">
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => update("password", e.target.value)}
          className="bg-obsidian border border-gray-700 rounded px-3 py-2 text-white focus:border-gold focus:outline-none"
        />
        {errors.password && (
          <p className="text-red-400 text-xs">{errors.password}</p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <input
          type="password"
          placeholder="Confirm Password"
          value={form.confirmPassword}
          onChange={(e) => update("confirmPassword", e.target.value)}
          className="bg-obsidian border border-gray-700 rounded px-3 py-2 text-white focus:border-gold focus:outline-none"
        />
        {errors.confirmPassword && (
          <p className="text-red-400 text-xs">{errors.confirmPassword}</p>
        )}
      </div>

      <AgeGate
        checked={form.ageVerified}
        onChange={(checked) => update("ageVerified", checked)}
        error={errors.ageVerified}
      />

      <button
        type="submit"
        disabled={loading}
        className="bg-gold text-obsidian font-semibold py-2 px-4 rounded hover:bg-yellow-500 disabled:opacity-50 transition-colors"
      >
        {loading ? "Creating Account..." : "Create Account"}
      </button>

      <button
        type="button"
        onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
        className="border border-gray-600 text-white py-2 px-4 rounded hover:border-gold transition-colors"
      >
        Sign in with Google
      </button>
    </form>
  );
}
