import AdminLogin from "@/components/admin/AdminLogin";
import { reportTimeZone } from "@/lib/admin/config";

// Signed-in visitors are sent on to /admin by middleware.ts.
export const dynamic = "force-dynamic";

export default function AdminLoginPage() {
  return <AdminLogin timeZone={reportTimeZone()} />;
}
