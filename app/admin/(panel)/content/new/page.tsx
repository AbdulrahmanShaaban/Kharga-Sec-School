import type { Metadata } from "next";
import { ContentForm } from "@/components/admin/content-form";

export const instant = false;

export const metadata: Metadata = { title: "محتوى جديد" };

export default function NewContentPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-extrabold text-primary">إنشاء محتوى جديد</h1>
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <ContentForm />
      </div>
    </div>
  );
}
