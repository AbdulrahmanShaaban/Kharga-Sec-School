"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-3xl font-bold text-destructive mb-4">حدث خطأ</h1>
      <p className="text-muted-foreground mb-6">نعتذر، حدث خطأ غير متوقع.</p>
      <div className="flex gap-3">
        <button onClick={reset} className="bg-primary text-primary-foreground px-4 py-2 rounded-md">إعادة المحاولة</button>
        <Link href="/" className="border px-4 py-2 rounded-md">الصفحة الرئيسية</Link>
      </div>
    </div>
  );
}
