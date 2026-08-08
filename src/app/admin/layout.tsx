import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentEditorOrAdmin } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentEditorOrAdmin();

  if (!user) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-light-grey-bg px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Link
            href="/admin"
            className="font-mono text-xs uppercase tracking-widest text-warm-grey hover:text-pistachio"
          >
            StackNarrative Admin
          </Link>
          <span className="font-mono text-xs uppercase tracking-widest text-warm-grey">
            {user.email} &middot; {user.role}
          </span>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-6 py-10">{children}</main>
    </div>
  );
}
