"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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

export default function EditContentPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { register, handleSubmit, setValue, reset } = useForm<FormValues>({ resolver: zodResolver(schema) });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/content?limit=1000`)
      .then((r) => r.json())
      .then((j) => {
        const item = (j.items || []).find((x: any) => x.id === id);
        if (item) {
          reset({
            type: item.type?.toLowerCase(),
            title: item.title,
            slug: item.slug,
            excerpt: item.excerpt ?? "",
            body: item.body,
            status: item.status?.toLowerCase(),
            publishedAt: item.publishedAt ? item.publishedAt.slice(0, 16) : "",
            eventStartAt: item.eventStartAt ? item.eventStartAt.slice(0, 16) : "",
            eventEndAt: item.eventEndAt ? item.eventEndAt.slice(0, 16) : "",
            location: item.location ?? "",
            conditions: item.conditions ?? "",
            results: item.results ?? "",
          });
        }
        setLoading(false);
      });
  }, [id, reset]);

  async function onSubmit(data: FormValues) {
    setError("");
    const res = await fetch(`/api/admin/content/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      setError("فشل الحفظ");
      return;
    }
    router.push("/admin/content");
  }

  if (loading) return <p>جاري التحميل...</p>;

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">تعديل المحتوى</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label>النوع</Label>
          <Select onValueChange={(v) => setValue("type", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="news">خبر</SelectItem>
              <SelectItem value="activity">نشاط</SelectItem>
              <SelectItem value="competition">مسابقة</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div><Label>العنوان</Label><Input {...register("title")} /></div>
        <div><Label>المعرف</Label><Input {...register("slug")} /></div>
        <div><Label>المقتطف</Label><Textarea {...register("excerpt")} /></div>
        <div><Label>المحتوى</Label><Textarea {...register("body")} rows={8} /></div>
        <div>
          <Label>الحالة</Label>
          <Select onValueChange={(v) => setValue("status", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">مسودة</SelectItem>
              <SelectItem value="published">منشور</SelectItem>
              <SelectItem value="scheduled">مجدول</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div><Label>تاريخ النشر</Label><Input type="datetime-local" {...register("publishedAt")} /></div>
        <div><Label>بداية الحدث</Label><Input type="datetime-local" {...register("eventStartAt")} /></div>
        <div><Label>نهاية الحدث</Label><Input type="datetime-local" {...register("eventEndAt")} /></div>
        <div><Label>الموقع</Label><Input {...register("location")} /></div>
        <div><Label>الشروط</Label><Textarea {...register("conditions")} /></div>
        <div><Label>النتائج</Label><Textarea {...register("results")} /></div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <Button type="submit">حفظ</Button>
      </form>
    </div>
  );
}
