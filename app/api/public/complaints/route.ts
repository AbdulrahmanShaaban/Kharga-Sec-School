import { NextRequest, NextResponse } from "next/server";
import { complaintSchema } from "@/lib/validation";
import { evaluateSubmissionGuard, fieldErrorsFromZod } from "@/lib/form-guard";
import { generateReferenceCode } from "@/lib/constants";
import { prisma } from "@/lib/db";

const MAX_BODY_SIZE = 10 * 1024; // 10 KB — complaints are text-only (spec §18)

/**
 * Public complaint submission.
 *
 * Privacy rules (spec §6):
 * - No GET: complaints are never listed publicly.
 * - The response only contains a random reference code; the message and
 *   submitter data are never echoed back or logged.
 */
export async function GET() {
  return NextResponse.json({ error: "الطريقة غير مسموحة" }, { status: 405 });
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return NextResponse.json({ error: "نوع المحتوى غير صحيح" }, { status: 400 });
    }

    const bodyText = await request.text();
    if (Buffer.byteLength(bodyText, "utf8") > MAX_BODY_SIZE) {
      return NextResponse.json({ error: "حجم الطلب كبير جدًا" }, { status: 400 });
    }

    let body: unknown;
    try {
      body = JSON.parse(bodyText);
    } catch {
      return NextResponse.json({ error: "الطلب غير صحيح" }, { status: 400 });
    }

    const candidate = (body ?? {}) as { website?: string };
    const ip = request.headers.get("x-forwarded-for");

    const guard = await evaluateSubmissionGuard({
      routeKey: "/api/public/complaints",
      ip,
      honeypot: candidate.website,
    });

    if (guard.kind === "silentSuccess") {
      // Fake success so bots learn nothing; nothing is stored.
      return NextResponse.json({ success: true, referenceCode: generateReferenceCode() });
    }
    if (guard.kind === "error") return guard.response;

    const parsed = complaintSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "بيانات غير صحيحة", fieldErrors: fieldErrorsFromZod(parsed.error.issues) },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const referenceCode = generateReferenceCode();

    await prisma.complaint.create({
      data: {
        referenceCode,
        subject: data.subject,
        category: data.category || "general",
        message: data.message,
        submitterName: data.submitterName || null,
        contactEmail: data.contactEmail || null,
        contactPhone: data.contactPhone || null,
        gradeClass: data.gradeClass || null,
        status: "NEW",
      },
    });

    // NOTE: the message and submitter data are intentionally never logged.
    return NextResponse.json({ success: true, referenceCode }, { status: 200 });
  } catch {
    // No request/response details in the log — complaints are confidential.
    console.error("[complaints] submission failed");
    return NextResponse.json({ error: "حدث خطأ. يرجى المحاولة لاحقًا." }, { status: 500 });
  }
}
