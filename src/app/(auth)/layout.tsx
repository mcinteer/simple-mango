export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-obsidian">
      <nav className="border-b border-gray-800 px-6 py-3">
        <span className="text-gold font-bold text-lg">Simple Mango</span>
      </nav>
      <main className="p-6">{children}</main>
    </div>
  );
}
