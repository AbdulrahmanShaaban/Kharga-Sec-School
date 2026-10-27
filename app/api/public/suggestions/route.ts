import { NextRequest, NextResponse } from "next/server";
import { suggestionSchema } from "@/lib/validation";
import { checkRateLimit, getClientKey } from "@/lib/rate-limit";
import { prisma } from "@/lib/db";

const MAX_BODY_SIZE = 10 * 1024; // 10KB

export async function GET() {
  return NextResponse.json(
    { error: "Method Not Allowed" },
    { status: 405 }
  );
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
return NextResponse.json(
        { error: "نوع المحتوى غير صحيح" },
        { status: 400 }
      );
    }

    const bodyText = await request.text();
    if (Buffer.byteLength(bodyText, "utf8") > MAX_BODY_SIZE) {
return NextResponse.json(
        { error: "حجم الطلب كبير جدًا" },
        { status: 400 }
      );
    }

    let body: unknown;
    try {
      body = JSON.parse(bodyText);
    } catch {
return NextResponse.json(
        { error: "الطلب غير صحيح" },
        { status: 400 }
      );
    }

    // Check honeypot - if filled, reject silently to prevent enumeration
    if (
      body &&
      typeof body === "object" &&
      "website" in body &&
      (body as { website?: string }).website &&
      (body as { website?: string }).website!.trim() !== ""
    ) {
return NextResponse.json({
        success: true,
        message: "تم استلام الاقتراح. سيتم مراجعته من قبل إدارة المدرسة.",
      });
    }

    // Check rate limit
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0];
    const key = getClientKey(ip, "/api/public/suggestions");
    const rl = await checkRateLimit(key);
    if (!rl.allowed) {
      return NextResponse.json({ error: "Demasiados intentos" }, { status: 429 });
    }

const parsed = suggestionSchema.safeParse(body);
    if (!parsed.success) {
      const fieldErrors: Record<string, string[]> = {};
      parsed.error.issues.forEach((err) => {
        const path = err.path.join(".");
        if (!fieldErrors[path]) fieldErrors[path] = [];
        fieldErrors[path].push(err.message);
      });
return NextResponse.json(
        { error: "بيانات غير صحيحة", fieldErrors },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Verify hCaptcha
    try {
      const hcaptchaRes = await fetch("https://api.hcaptcha.com/siteverify", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          secret: process.env.HCAPTCHA_SECRET!,
          response: data.hcaptcha,
        }),
      });
      const hcaptchaData = await hcaptchaRes.json();
      if (!hcaptchaData.success) {
return NextResponse.json(
        { error: "التحقق من الأمان فشل. يرجى المحاولة مرة أخرى." },
        { status: 400 }
      );
      }
    } catch {
return NextResponse.json(
        { error: "حدث خطأ في التحقق. يرجى المحاولة مرة أخرى." },
        { status: 400 }
      );
    }

    // Create SuggestionPrivate record with status="PENDING" - do NOT create PublishedSuggestion
    await prisma.suggestionPrivate.create({
      data: {
        suggestionText: data.suggestionText,
        submitterName: data.submitterName || null,
        contactEmail: data.contactEmail || null,
        contactPhone: data.contactPhone || null,
        status: "PENDING",
      },
    });

return NextResponse.json(
        {
          success: true,
          message: "تم استلام الاقتراح. سيتم مراجعته من قبل إدارة المدرسة.",
        },
        { status: 200 }
      );
  } catch {
return NextResponse.json(
        { error: "حدث خطأ. يرجى المحاولة لاحقًا." },
        { status: 500 }
      );
  }
}
