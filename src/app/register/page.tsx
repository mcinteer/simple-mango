import { RegisterForm } from "@/components/features/auth/register-form";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-obsidian px-4">
      <h1 className="text-2xl font-bold text-gold mb-6">Create Account</h1>
      <RegisterForm />
      <p className="mt-4 text-sm text-gray-400">
        Already have an account?{" "}
        <Link href="/login" className="text-gold hover:underline">
          Sign in
        </Link>
      </p>
    </main>
  );
}
