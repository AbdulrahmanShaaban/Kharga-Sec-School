import { prisma } from "./db";

/**
 * Administrative audit trail (spec §9 `admin_audit_logs`).
 *
 * Records WHO did WHAT to WHICH entity. Never pass complaint/suggestion
 * text, contact details, or captcha tokens into `metadata` — only ids,
 * counts, and non-sensitive status values.
 *
 * Auditing must never break the main operation: failures are swallowed
 * after a server-side log line without sensitive data.
 */
export type AuditEvent = {
  actorId: string;
  action: string;
  entityType: "content" | "media" | "complaint" | "suggestion" | "settings" | "auth" | "page-copy";
  entityId: string;
  metadata?: Record<string, string | number | boolean | null>;
};

export async function writeAuditLog(event: AuditEvent): Promise<void> {
  try {
    await prisma.adminAuditLog.create({
      data: {
        actorId: event.actorId,
        action: event.action,
        entityType: event.entityType,
        entityId: event.entityId,
        metadata: event.metadata ? JSON.stringify(event.metadata) : null,
      },
    });
  } catch (err) {
    console.error("[audit] failed to write audit log", err instanceof Error ? err.message : "unknown");
  }
}
