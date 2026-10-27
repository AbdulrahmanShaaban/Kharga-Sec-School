import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { siteSettingsSchema } from "@/lib/validation";

async function checkAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || (session.user as any).role !== "ADMIN") {
    return null;
  }
  return session;
}

export async function GET() {
  const session = await checkAdmin();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    let settings = await prisma.siteSettings.findFirst();
    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: {},
      });
    }
    return NextResponse.json(settings);
  } catch {
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const session = await checkAdmin();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const parsed = siteSettingsSchema.safeParse(body);
    if (!parsed.success) {
const fieldErrors: Record<string, string[]> = {};
      const issues = (parsed.error as any).issues || (parsed.error as any).errors || [];
      issues.forEach((err: any) => {
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
    let settings = await prisma.siteSettings.findFirst();
    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: {
          ...data,
          updatedBy: (session.user as any).id,
        },
      });
    } else {
      settings = await prisma.siteSettings.update({
        where: { id: settings.id },
        data: {
          ...data,
          updatedBy: (session.user as any).id,
        },
      });
    }

    return NextResponse.json(settings);
  } catch {
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
