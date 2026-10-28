import type { Metadata } from "next";
import { PageCopyEditor } from "@/components/admin/page-copy-editor";
import { COPY_BLOCKS } from "@/lib/page-copy";
import type { PageCopyEditorProps } from "@/components/admin/page-copy-editor";

export const instant = false;

export const metadata: Metadata = { title: "نصوص الصفحات" };

const INITIAL_BLOCKS: PageCopyEditorProps["initialBlocks"] = COPY_BLOCKS.map((block) => ({
  page: block.page,
  title: block.title,
  hint: block.hint ?? null,
  fields: block.fields.map((f) => ({
    key: f.key,
    label: f.label,
    textarea: Boolean(f.textarea),
    value: f.defaultValue,
    isDefault: true,
  })),
}));

/**
 * Full-CMS copy editor. Declared blocks come from `lib/page-copy.ts`
 * (labels + defaults); the editor itself loads saved values from the admin
 * API on mount and merges them over these defaults.
 */
export default function AdminPageCopyPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-primary">نصوص الصفحات</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          عدّل النصوص التي تظهر للزوار في كل صفحة. أي حقل تتركه فارغًا يعود إلى نصّه الافتراضي.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <PageCopyEditor initialBlocks={INITIAL_BLOCKS} />
      </div>
    </div>
  );
}
