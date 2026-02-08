import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { RaceList } from "@/components/features/dashboard";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-amber-500">
            Today&apos;s Race Meetings
          </h1>
          <p className="text-zinc-400 mt-1">
            Welcome back, {session.user.name || session.user.email}
          </p>
        </header>

        {/* Race List */}
        <RaceList />
      </div>
    </div>
  );
}
