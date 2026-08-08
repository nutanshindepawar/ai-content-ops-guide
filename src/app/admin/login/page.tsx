import { Suspense } from "react";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";

// Never cache this page. It was previously static and got served stale from
// Vercel's edge cache across deployments, causing signed-in-user redirects
// to silently use outdated client JS (old redirect URLs) for many minutes
// after a fix had already shipped.
export const dynamic = "force-dynamic";

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <AdminLoginForm />
    </Suspense>
  );
}
