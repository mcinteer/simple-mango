import { LoginForm } from "@/components/features/auth/login-form";
import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-obsidian px-4">
      <h1 className="text-2xl font-bold text-gold mb-6">Sign In</h1>
      <LoginForm />
      <p className="mt-4 text-sm text-gray-400">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-gold hover:underline">
          Create one
        </Link>
      </p>
    </main>
  );
}
