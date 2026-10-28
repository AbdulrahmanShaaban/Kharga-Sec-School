/** Shared Arabic labels + badge tones for the review workflows. */

export const complaintStatusMeta: Record<string, { label: string; className: string }> = {
  NEW: { label: "جديدة", className: "bg-destructive-soft text-destructive border-destructive/20" },
  UNDER_REVIEW: { label: "قيد المراجعة", className: "bg-warning-soft text-warning border-warning/20" },
  IN_PROGRESS: { label: "قيد المعالجة", className: "bg-secondary-soft text-secondary border-secondary/20" },
  RESOLVED: { label: "تم الحل", className: "bg-success-soft text-success border-success/20" },
  CLOSED: { label: "مغلقة", className: "bg-muted text-muted-foreground border-border" },
};

export const complaintStatusOptions = [
  { value: "NEW", label: "جديدة" },
  { value: "UNDER_REVIEW", label: "قيد المراجعة" },
  { value: "IN_PROGRESS", label: "قيد المعالجة" },
  { value: "RESOLVED", label: "تم الحل" },
  { value: "CLOSED", label: "مغلقة" },
] as const;

export const suggestionStatusMeta: Record<string, { label: string; className: string }> = {
  PENDING: { label: "بانتظار المراجعة", className: "bg-warning-soft text-warning border-warning/20" },
  APPROVED: { label: "معتمد ومنشور", className: "bg-success-soft text-success border-success/20" },
  REJECTED: { label: "مرفوض", className: "bg-destructive-soft text-destructive border-destructive/20" },
  HIDDEN: { label: "مخفي", className: "bg-muted text-muted-foreground border-border" },
};
