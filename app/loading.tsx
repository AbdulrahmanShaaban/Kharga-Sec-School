export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center" role="status" aria-label="جارٍ التحميل">
      <div className="flex flex-col items-center gap-4">
        <span className="h-10 w-10 animate-spin rounded-full border-4 border-primary/15 border-t-primary" />
        <p className="text-sm font-semibold text-muted-foreground">جارٍ التحميل…</p>
      </div>
    </div>
  );
}
