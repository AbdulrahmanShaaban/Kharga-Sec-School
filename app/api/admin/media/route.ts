import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { v2 as cloudinary } from "cloudinary";

async function checkAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || (session.user as any).role !== "ADMIN") {
    return null;
  }
  return session;
}

export async function POST(request: NextRequest) {
  const session = await checkAdmin();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { folder, allowedTypes } = body;

    // Validate folder, allowed types
    if (!folder) {
      return NextResponse.json({ error: "المجلد مطلوب" }, { status: 400 });
    }

    const timestamp = Math.round(new Date().getTime() / 1000);
    const randomSuffix = Math.random().toString(36).substring(2, 10);
    const publicId = `${folder}/${randomSuffix}`;

    // Generate a short-lived signature using Cloudinary
    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp,
        folder,
        public_id: publicId,
      },
      process.env.CLOUDINARY_API_SECRET!
    );

    // NEVER return API_SECRET
    return NextResponse.json({
      timestamp,
      signature,
      apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      folder,
      publicId,
    });
  } catch {
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
