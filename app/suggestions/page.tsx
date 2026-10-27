"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { suggestionSchema, type SuggestionInput } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SiteHeader, SiteFooter } from "@/components/layout";
import { useState, useRef } from "react";

declare global {
  interface Window {
    hcaptcha?: { getResponse: () => string; reset: () => void };
  }
}

export default function SuggestionsPage() {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const honeypotRef = useRef<HTMLInputElement>(null);

  const form = useForm<SuggestionInput>({
    resolver: zodResolver(suggestionSchema),
  });

  const onSubmit = async (data: SuggestionInput) => {
    if (honeypotRef.current?.value) return;
    setSubmitting(true);
    setError(null);
    const token = window.hcaptcha?.getResponse() ?? "";
    try {
      const res = await fetch("/api/public/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, hcaptcha: token }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "حدث خطأ");
      setSuccess(true);
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
            <CardTitle>تقديم اقتراح</CardTitle>
          </CardHeader>
          <CardContent>
            {success ? (
              <p className="text-green-600">تم إرسال الاقتراح. سيتم نشره بعد مراجعة الإدارة.</p>
            ) : (
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <input type="text" name="website" ref={honeypotRef} className="hidden" tabIndex={-1} autoComplete="off" />
                <div>
                  <Label>نص الاقتراح *</Label>
                  <Textarea {...form.register("suggestionText")} maxLength={2000} />
                  {form.formState.errors.suggestionText && <p className="text-red-600 text-sm">{form.formState.errors.suggestionText.message}</p>}
                </div>
                <div>
                  <Label>اسم مقدم الاقتراح (اختياري)</Label>
                  <Input {...form.register("submitterName")} />
                </div>
                <div>
                  <Label>البريد الإلكتروني (اختياري)</Label>
                  <Input type="email" {...form.register("contactEmail")} />
                </div>
                <div>
                  <Label>رقم الهاتف (اختياري)</Label>
                  <Input {...form.register("contactPhone")} />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" required />
                  <Label>أوافق على أن الاقتراح سينشر فقط بعد مراجعة الإدارة</Label>
                </div>
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
