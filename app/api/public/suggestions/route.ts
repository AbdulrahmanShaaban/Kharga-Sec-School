import { NextRequest, NextResponse } from "next/server";
import { suggestionSchema } from "@/lib/validation";
import { evaluateSubmissionGuard, fieldErrorsFromZod } from "@/lib/form-guard";
import { prisma } from "@/lib/db";

const MAX_BODY_SIZE = 10 * 1024; // 10 KB — suggestions are text-only (spec §18)

/**
 * Public suggestion submission (spec §6).
 *
 * The suggestion is stored ONLY in `SuggestionPrivate` with status PENDING.
 * It becomes public exclusively after an admin approves it, and then only
 * its text is copied into `PublishedSuggestion` (no personal data).
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
      routeKey: "/api/public/suggestions",
      ip,
      honeypot: candidate.website,
    });

    if (guard.kind === "silentSuccess") {
      return NextResponse.json({
        success: true,
        message: "تم استلام الاقتراح. سيتم مراجعته من قبل إدارة المدرسة.",
      });
    }
    if (guard.kind === "error") return guard.response;

    const parsed = suggestionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "بيانات غير صحيحة", fieldErrors: fieldErrorsFromZod(parsed.error.issues) },
        { status: 400 }
      );
    }

    const data = parsed.data;

    await prisma.suggestionPrivate.create({
      data: {
        suggestionText: data.suggestionText,
        submitterName: data.submitterName || null,
        contactEmail: data.contactEmail || null,
        contactPhone: data.contactPhone || null,
        status: "PENDING",
      },
    });

    // NOTE: suggestion text and contact data are intentionally never logged.
    return NextResponse.json(
      { success: true, message: "تم استلام الاقتراح. سيتم مراجعته من قبل إدارة المدرسة." },
      { status: 200 }
    );
  } catch {
    console.error("[suggestions] submission failed");
    return NextResponse.json({ error: "حدث خطأ. يرجى المحاولة لاحقًا." }, { status: 500 });
  }
}
