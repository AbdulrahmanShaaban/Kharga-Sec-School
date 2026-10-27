"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const schema = z.object({
  type: z.string(),
  title: z.string().min(1),
  slug: z.string().min(1),
  excerpt: z.string().optional(),
  body: z.string().min(1),
  status: z.string(),
  publishedAt: z.string().optional(),
  eventStartAt: z.string().optional(),
  eventEndAt: z.string().optional(),
  location: z.string().optional(),
  conditions: z.string().optional(),
  results: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w-]/g, "");
}

export default function NewContentPage() {
  const router = useRouter();
  const { register, handleSubmit, setValue, watch } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { type: "news", status: "draft" },
  });
  const title = watch("title");
  const [error, setError] = useState("");

  async function onSubmit(data: FormValues) {
    setError("");
    try {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(j.error || "فشل الحفظ");
        return;
      }
      router.push("/admin/content");
    } catch {
      setError("حدث خطأ");
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">إنشاء محتوى جديد</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label>النوع</Label>
          <Select defaultValue="news" onValueChange={(v) => setValue("type", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="news">خبر</SelectItem>
              <SelectItem value="activity">نشاط</SelectItem>
              <SelectItem value="competition">مسابقة</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>العنوان</Label>
          <Input {...register("title")} onChange={(e) => { register("title").onChange(e); setValue("slug", slugify(e.target.value)); }} />
        </div>
        <div>
          <Label>المعرف (slug)</Label>
          <Input {...register("slug")} />
        </div>
        <div>
          <Label>المقتطف</Label>
          <Textarea {...register("excerpt")} />
        </div>
        <div>
          <Label>المحتوى</Label>
          <Textarea {...register("body")} rows={8} />
        </div>
        <div>
          <Label>الحالة</Label>
          <Select defaultValue="draft" onValueChange={(v) => setValue("status", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">مسودة</SelectItem>
              <SelectItem value="published">منشور</SelectItem>
              <SelectItem value="scheduled">مجدول</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>تاريخ النشر</Label>
          <Input type="datetime-local" {...register("publishedAt")} />
        </div>
        <div>
          <Label>بداية الحدث</Label>
          <Input type="datetime-local" {...register("eventStartAt")} />
        </div>
        <div>
          <Label>نهاية الحدث</Label>
          <Input type="datetime-local" {...register("eventEndAt")} />
        </div>
        <div>
          <Label>الموقع</Label>
          <Input {...register("location")} />
        </div>
        <div>
          <Label>الشروط</Label>
          <Textarea {...register("conditions")} />
        </div>
        <div>
          <Label>النتائج</Label>
          <Textarea {...register("results")} />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <Button type="submit">حفظ</Button>
      </form>
    </div>
  );
}
