import Link from "next/link";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-soft text-primary">
        <FileQuestion className="h-8 w-8" aria-hidden />
      </span>
      <h1 className="mt-6 text-2xl font-extrabold text-primary sm:text-3xl">الصفحة غير موجودة</h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
        ربما تم نقل الصفحة أو أن الرابط غير صحيح. يمكنك العودة إلى الرئيسية أو تصفح الأقسام الرسمية.
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition-transform hover:-translate-y-0.5"
        >
          الرئيسية
        </Link>
        <Link
          href="/news"
          className="rounded-xl border-2 border-primary px-6 py-3 text-sm font-bold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
        >
          الأخبار
        </Link>
      </div>
    </div>
  );
}
