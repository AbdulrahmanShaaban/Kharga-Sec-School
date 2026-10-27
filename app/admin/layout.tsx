import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "ADMIN") {
    redirect("/admin/login");
  }
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-primary text-white p-4">
        <div className="container mx-auto flex items-center justify-between">
          <span className="font-bold">لوحة التحكم</span>
          <div className="flex gap-4">
            <a href="/admin" className="hover:underline">الرئيسي</a>
            <a href="/admin/content" className="hover:underline">المحتوى</a>
            <a href="/admin/complaints" className="hover:underline">الشكاوى</a>
            <a href="/admin/suggestions" className="hover:underline">المقترحات</a>
            <a href="/admin/settings" className="hover:underline">الإعدادات</a>
            <a href="/admin/media" className="hover:underline">الوسائط</a>
            <form action="/api/auth/sign-out" method="POST">
              <button type="submit" className="hover:underline">تسجيل الخروج</button>
            </form>
          </div>
        </div>
      </nav>
      <main className="container mx-auto p-6">{children}</main>
    </div>
  );
}