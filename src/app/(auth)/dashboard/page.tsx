import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gold">
        Welcome, {session.user.name || session.user.email}!
      </h1>
    </div>
  );
}
