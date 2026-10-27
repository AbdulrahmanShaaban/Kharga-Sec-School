import { SiteHeader, SiteFooter } from "@/components/layout";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-6">سياسة الخصوصية</h1>
        <section className="prose prose-lg max-w-none">
          <p>نحن نحترم خصوصيتك. تُستخدم البيانات المقدمة (الشكاوى والاقتراحات) فقط لغرض معالجتها من قبل إدارة المدرسة.</p>
          <p>لا نشارك بياناتك مع أطراف ثالثة دون موافقتك، باستثناء ما يقتضيه القانون.</p>
          <p>يتم تخزين البيانات بشكل آمن وحذفها عند انتهاء الغرض منها.</p>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
