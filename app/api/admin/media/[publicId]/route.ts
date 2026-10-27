import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { v2 as cloudinary } from "cloudinary";

async function checkAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || (session.user as any).role !== "ADMIN") {
    return null;
  }
  return session;
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ publicId: string }> }
) {
  const session = await checkAdmin();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { publicId } = await params;
    const decodedPublicId = decodeURIComponent(publicId);

    const mediaInUse = await prisma.contentMedia.findFirst({
      where: { publicId: decodedPublicId },
    });

    if (mediaInUse) {
      return NextResponse.json(
        { error: "لا يمكن حذف الوسائط لأنها قيد الاستخدام" },
        { status: 400 }
      );
    }

    await cloudinary.uploader.destroy(decodedPublicId);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}