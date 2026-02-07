import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-obsidian px-4">
      <h1 className="text-4xl font-bold text-gold mb-2">Simple Mango</h1>
      <p className="text-gray-400 mb-8">Your racing intelligence dashboard</p>
      <div className="flex gap-4">
        <Link
          href="/login"
          className="bg-gold text-obsidian font-semibold py-2 px-6 rounded hover:bg-yellow-500 transition-colors"
        >
          Sign In
        </Link>
        <Link
          href="/register"
          className="border border-gold text-gold py-2 px-6 rounded hover:bg-gold hover:text-obsidian transition-colors"
        >
          Register
        </Link>
      </div>
    </main>
  );
}
