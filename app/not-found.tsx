import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
      <p className="text-xl mb-6">الصفحة غير موجودة</p>
      <Link href="/" className="bg-primary text-primary-foreground px-4 py-2 rounded-md">العودة للصفحة الرئيسية</Link>
    </div>
  );
}
