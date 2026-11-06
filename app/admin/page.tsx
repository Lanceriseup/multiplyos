import AdminDashboard from "@/components/admin/AdminDashboard";
import { reportTimeZone } from "@/lib/admin/config";

// Signed-in check happens in middleware.ts before this page renders.
export const dynamic = "force-dynamic";

export default function AdminPage() {
  return <AdminDashboard timeZone={reportTimeZone()} />;
}
