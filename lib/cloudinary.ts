import { v2 as cloudinary } from "cloudinary";

let configured = false;

/** The cloud name is public; accept either the server-only or the NEXT_PUBLIC spelling. */
export function getCloudinaryCloudName(): string | undefined {
  return process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || undefined;
}

export function isCloudinaryConfigured(): boolean {
  return Boolean(
    getCloudinaryCloudName() && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET
  );
}

export function configureCloudinary(): void {
  if (configured) return;
  if (!isCloudinaryConfigured()) {
    throw new Error("Cloudinary is not configured (CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET)");
  }
  cloudinary.config({
    cloud_name: getCloudinaryCloudName(),
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  configured = true;
}

export function getCloudinary() {
  configureCloudinary();
  return cloudinary;
}

/** Verify that a public_id really exists in OUR cloud before trusting it. */
export async function assetExistsInCloudinary(publicId: string): Promise<{
  exists: boolean;
  bytes?: number;
  width?: number;
  height?: number;
  format?: string;
  secureUrl?: string;
}> {
  try {
    const c = getCloudinary();
    const result = await c.api.resource(publicId);
    return {
      exists: true,
      bytes: result.bytes,
      width: result.width,
      height: result.height,
      format: result.format,
      secureUrl: result.secure_url,
    };
  } catch {
    return { exists: false };
  }
}

/**
 * Delete an asset from Cloudinary. Used only after the server confirmed the
 * asset is not referenced by any content (see the media delete route).
 */
export async function deleteCloudinaryAsset(publicId: string, resourceType: "image" | "video" = "image"): Promise<boolean> {
  try {
    const c = getCloudinary();
    const result = await c.uploader.destroy(publicId, { resource_type: resourceType });
    return result.result === "ok";
  } catch (err) {
    console.error("[cloudinary] delete failed", err instanceof Error ? err.message : "unknown");
    return false;
  }
}
