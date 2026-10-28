import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";

// The shared header/footer read site settings from the database.
export const instant = false;

export const metadata: Metadata = {
  title: "سياسة الخصوصية",
  robots: { index: false },
};

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:px-6">
        <h1 className="text-3xl font-extrabold text-primary">إشعار الخصوصية</h1>
        <p className="mt-2 text-sm text-muted-foreground">آخر تحديث: أكتوبر ٢٠٢٦</p>

        <div className="prose-arabic mt-8 space-y-6 text-[1.02rem]">
          <section>
            <h2 className="mb-2 text-xl font-extrabold text-primary">البيانات التي نجمعها</h2>
            <p>
              تجمع هذه البوابة بيانات الشكاوى والمقترحات المقدمة عبر النماذج الرسمية فقط، وتشمل نص الشكوى أو المقترح،
              ووسيلة التواصل إن تم إدخالها طوعًا.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-extrabold text-primary">سرية الشكاوى</h2>
            <p>
              الشكاوى سرية بالكامل ولا تُعرض للعامة، وتصل إلى الإدارة المختصة فقط. أما المقترحات فتُنشر على الموقع
              بنصّها فقط بعد موافقة الإدارة المختصة، دون نشر أي بيانات تعريفية لمقدّم المقترح.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-extrabold text-primary">الغرض من استخدام البيانات</h2>
            <p>
              تُستخدم البيانات لمجرد متابعة الشكاوى والمقترحات ومعالجتها من قبل الإدارة المختصة، ولا تُستخدم لأي غرض
              تسويقي ولا تُشارك مع أي طرف ثالث.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-extrabold text-primary">الاحتفاظ بالبيانات</h2>
            <p>
              تُحفظ الشكاوى والمقترحات ضمن سجل المدرسة الرسمي لفترة تكفي متابعة الحالات، وفقًا لأنظمة المدرسة.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-extrabold text-primary">حقوقك</h2>
            <p>
              يمكنك التواصل مع إدارة المدرسة للاستفسار عن بياناتك أو طلب تعديل أي بيانات تواصل تم إدخالها في النماذج.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-extrabold text-primary">الاتصال</h2>
            <p>
              لأي استفسار حول الخصوصية، راجع صفحة{" "}
              <Link href="/contact" className="font-bold text-secondary underline-offset-4 hover:underline">
                التواصل
              </Link>{" "}
              أو تواصل مع إدارة المدرسة عبر القنوات الرسمية المعتمدة.
            </p>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
