import { NextRequest, NextResponse } from "next/server";
import { complaintSchema } from "@/lib/validation";
import { checkRateLimit, getClientKey } from "@/lib/rate-limit";
import { generateReferenceCode } from "@/lib/constants";
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
      // Return success silently
      return NextResponse.json({ success: true, referenceCode: generateReferenceCode() });
    }

    // Check rate limit
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0];
    const key = getClientKey(ip, "/api/public/complaints");
    const rl = await checkRateLimit(key);
    if (!rl.allowed) {
      return NextResponse.json({ error: "Demasiados intentos" }, { status: 429 });
    }

const parsed = complaintSchema.safeParse(body);
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

    const referenceCode = generateReferenceCode();

    // Create complaint - NEVER log the message, submitter info, or hCaptcha token
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

    return NextResponse.json({ success: true, referenceCode }, { status: 200 });
  } catch {
return NextResponse.json(
        { error: "حدث خطأ. يرجى المحاولة لاحقًا." },
        { status: 500 }
      );
  }
}
