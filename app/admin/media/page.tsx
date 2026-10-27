"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export default function MediaPage() {
  const [assets, setAssets] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/admin/media").then((r) => r.json()).then((d) => setAssets(d.assets || d || []));
  }, []);

  async function handleUpload() {
    const res = await fetch("/api/admin/media", { method: "POST" });
    const data = await res.json();
    if (data.uploadUrl) {
      const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.onchange = async () => {
        const file = fileInput.files?.[0];
        if (!file) return;
        await fetch(data.uploadUrl, { method: "PUT", body: file });
      };
      fileInput.click();
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">الوسائط</h1>
        <Button onClick={handleUpload}>رفع ملف</Button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {assets.map((a: any) => (
          <div key={a.id ?? a.publicId} className="border p-2 rounded">
            <p className="text-xs truncate">{a.publicId ?? a.url}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
