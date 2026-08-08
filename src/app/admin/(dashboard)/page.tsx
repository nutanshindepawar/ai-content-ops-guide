import Link from "next/link";

export default function AdminHome() {
  return (
    <div>
      <h1 className="font-serif text-3xl text-premium-black">Admin</h1>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/admin/new"
          className="inline-block border border-pistachio px-4 py-2 text-sm text-premium-black hover:bg-pistachio/10"
        >
          + New Automation
        </Link>
        <Link
          href="/admin/taxonomy"
          className="inline-block border border-light-grey-bg px-4 py-2 text-sm text-premium-black hover:border-pistachio"
        >
          Phase &amp; Process Taxonomy
        </Link>
      </div>
    </div>
  );
}
