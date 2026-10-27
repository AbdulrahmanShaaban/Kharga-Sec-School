"use client";

import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { complaintSchema, type ComplaintInput } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SiteHeader, SiteFooter } from "@/components/layout";
import { useState, useRef } from "react";

declare global {
  interface Window {
    hcaptcha?: { getResponse: () => string; reset: () => void };
  }
}

export default function ComplaintsPage() {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const honeypotRef = useRef<HTMLInputElement>(null);

  const form = useForm<ComplaintInput>({
    resolver: zodResolver(complaintSchema),
    defaultValues: { consent: true as const },
  });

  const onSubmit: SubmitHandler<ComplaintInput> = async (data) => {
    if (honeypotRef.current?.value) return;
    setSubmitting(true);
    setError(null);
    const token = window.hcaptcha?.getResponse() ?? "";
    try {
      const res = await fetch("/api/public/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, hcaptcha: token }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "حدث خطأ");
      setSuccess(json?.referenceCode ?? "تم الإرسال");
    } catch (e: any) {
      setError(e?.message ?? "حدث خطأ");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <SiteHeader />
      <script src="https://js.hcaptcha.com/1/api.js" async defer />
      <main className="flex-1 container mx-auto px-4 py-10">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>تقديم شكوى</CardTitle>
          </CardHeader>
          <CardContent>
            {success ? (
              <p className="text-green-600">تم إرسال الشكوى. رقم المرجع: {success}</p>
            ) : (
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <input type="text" name="website" ref={honeypotRef} className="hidden" tabIndex={-1} autoComplete="off" />
                <div>
                  <Label>الموضوع *</Label>
                  <Input {...form.register("subject")} />
                  {form.formState.errors.subject && <p className="text-red-600 text-sm">{form.formState.errors.subject.message}</p>}
                </div>
<div>
                   <Label>الفئة</Label>
                   <Select onValueChange={(v) => form.setValue("category", v)} defaultValue="general">
                     <SelectTrigger><SelectValue /></SelectTrigger>
                     <SelectContent>
                       <SelectItem value="academic">أكاديمي</SelectItem>
                       <SelectItem value="discipline">انضباط</SelectItem>
                       <SelectItem value="facility">المر facilities</SelectItem>
                       <SelectItem value="other">أ أخرى</SelectItem>
                     </SelectContent>
                   </Select>
                 </div>
                <div>
                  <Label>الرسالة *</Label>
                  <Textarea {...form.register("message")} maxLength={2000} />
                  {form.formState.errors.message && <p className="text-red-600 text-sm">{form.formState.errors.message.message}</p>}
                </div>
                <div>
                  <Label>اسم مقدم الشكوى</Label>
                  <Input {...form.register("submitterName")} />
                </div>
                <div>
                  <Label>البريد الإلكتروني</Label>
                  <Input type="email" {...form.register("contactEmail")} />
                </div>
                <div>
                  <Label>رقم الهاتف</Label>
                  <Input {...form.register("contactPhone")} />
                </div>
                <div>
                  <Label>الصف/الفصل</Label>
                  <Input {...form.register("gradeClass")} />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" {...form.register("consent")} />
                  <Label>أوافق على معالجة البيانات</Label>
                </div>
                {form.formState.errors.consent && <p className="text-red-600 text-sm">{form.formState.errors.consent.message}</p>}
                <div className="h-captcha" data-sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || ""} />
                {error && <p className="text-red-600 text-sm">{error}</p>}
                <Button type="submit" disabled={submitting}>{submitting ? "جارٍ الإرسال..." : "إرسال"}</Button>
              </form>
            )}
          </CardContent>
        </Card>
      </main>
      <SiteFooter />
    </div>
  );
}
