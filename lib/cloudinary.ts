import { v2 as cloudinary } from "cloudinary";

let configured = false;

export function configureCloudinary() {
  if (configured) return;
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    console.warn("Cloudinary credentials not configured");
    return;
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
  configured = true;
}

export function getCloudinary() {
  configureCloudinary();
  return cloudinary;
}

export async function deleteCloudinaryAsset(publicId: string, resourceType: "image" | "video" = "image") {
  const c = getCloudinary();
  try {
    await c.api.delete_resources([publicId], { resource_type: resourceType });
  } catch (err) {
    console.error("Cloudinary delete error:", err);
  }
}

export function isCloudinaryConfigured(): boolean {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
}