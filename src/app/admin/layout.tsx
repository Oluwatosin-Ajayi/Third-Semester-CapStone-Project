import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminSidebar from "@/components/admin/AdminSideBar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return <>{children}</>;
  }

  const { data: user } = await supabase
    .from("users")
    .select("role, email")
    .eq("id", session.user.id)
    .single();

  if (user?.role !== "admin") redirect("/");

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar email={user.email} />
      <main className="flex-1 min-w-0 p-6 lg:p-8">{children}</main>
    </div>
  );
}
