import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

  const { id } = await params;
  const suggestion = await prisma.suggestionPrivate.findUnique({
    where: { id },
    include: { published: true },
  });
  if (!suggestion) return NextResponse.json({ error: "المقتراح غير موجود" }, { status: 404 });
  return NextResponse.json(suggestion);
}
