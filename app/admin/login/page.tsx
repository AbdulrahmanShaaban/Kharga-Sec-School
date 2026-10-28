"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2, LockKeyhole } from "lucide-react";
import { constants } from "@/lib/constants";

const inputClass =
  "w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-[15px] text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/sign-in/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        setError("بيانات الدخول غير صحيحة. تحقق من البريد الإلكتروني وكلمة المرور.");
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("تعذر الاتصال بالخادم. حاول مرة أخرى.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-primary px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="relative h-20 w-20 overflow-hidden rounded-2xl bg-white/10 ring-2 ring-white/20">
            <Image src="/logo.jpg" alt={`شعار ${constants.APP_NAME}`} fill sizes="80px" className="object-cover" priority />
          </span>
          <h1 className="mt-5 text-2xl font-extrabold text-white">لوحة تحكم المدرسة</h1>
          <p className="mt-2 text-sm text-white/70">{constants.APP_NAME}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl bg-card p-6 shadow-xl sm:p-8" noValidate>
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-bold text-foreground">
              البريد الإلكتروني
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
              dir="ltr"
              className={`${inputClass} text-left`}
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-bold text-foreground">
              كلمة المرور
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              dir="ltr"
              className={`${inputClass} text-left`}
            />
          </div>

          {error && (
            <p role="alert" className="rounded-xl bg-destructive-soft px-4 py-3 text-sm font-semibold text-destructive">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition-transform hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-60"
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <LockKeyhole className="h-4 w-4" aria-hidden />}
            {pending ? "جارٍ الدخول…" : "تسجيل الدخول"}
          </button>

          <p className="text-center text-xs leading-relaxed text-muted-foreground">
            الدخول مقصور على حسابات الإدارة المعتمدة. لا يوجد تسجيل عام على هذا الموقع.
          </p>
        </form>
      </div>
    </div>
  );
}
