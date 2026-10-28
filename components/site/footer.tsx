import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { constants } from "@/lib/constants";
import { getSiteSettings, schoolDisplayName } from "@/lib/settings";

const footerLinks = [
  { href: "/news", label: "الأخبار" },
  { href: "/activities", label: "الأنشطة" },
  { href: "/competitions", label: "المسابقات" },
  { href: "/about", label: "عن المدرسة" },
  { href: "/contact", label: "التواصل" },
  { href: "/complaints", label: "تقديم شكوى" },
  { href: "/suggestions", label: "تقديم مقترح" },
  { href: "/privacy", label: "سياسة الخصوصية" },
];

/**
 * Public site footer. Contact details are rendered only when the school has
 * entered and approved them in the admin settings — no invented data (spec §5).
 */
export async function SiteFooter() {
  let schoolName: string = constants.APP_NAME;
  let footerText: string | null = null;
  let address: string | null = null;
  let phone: string | null = null;
  let email: string | null = null;
  let hours: string | null = null;

  try {
    const settings = await getSiteSettings();
    schoolName = schoolDisplayName(settings);
    footerText = settings.footerText;
    address = settings.address;
    phone = settings.phone;
    email = settings.email;
    hours = settings.hours;
  } catch {
    // keep defaults
  }

  const contactItems = [
    address ? { icon: MapPin, text: address, href: null } : null,
    phone ? { icon: Phone, text: phone, href: `tel:${phone.replace(/\s/g, "")}` } : null,
    email ? { icon: Mail, text: email, href: `mailto:${email}` } : null,
    hours ? { icon: Clock, text: hours, href: null } : null,
  ].filter((item): item is { icon: typeof MapPin; text: string; href: string | null } => item !== null);

  return (
    <footer className="mt-auto bg-primary text-primary-foreground">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-3">
              <span className="relative h-12 w-12 overflow-hidden rounded-xl ring-1 ring-white/20">
                <Image src="/logo.jpg" alt={`شعار ${schoolName}`} fill sizes="48px" className="object-cover" />
              </span>
              <span className="text-lg font-extrabold">{schoolName}</span>
            </div>
            {footerText ? (
              <p className="mt-4 text-sm leading-relaxed text-white/80">{footerText}</p>
            ) : (
              <p className="mt-4 text-sm leading-relaxed text-white/70">البوابة الرسمية للمدرسة — محتوى رسمي معتمد.</p>
            )}
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide text-white/90">روابط سريعة</h3>
            <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-white/75 transition-colors hover:text-accent">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide text-white/90">بيانات التواصل</h3>
            {contactItems.length === 0 ? (
              <p className="mt-4 text-sm leading-relaxed text-white/60">
                تُضاف بيانات التواصل الرسمية من لوحة التحكم بعد اعتمادها من المدرسة.
              </p>
            ) : (
              <ul className="mt-4 space-y-3 text-sm text-white/80">
                {contactItems.map((item, index) => {
                  const Icon = item.icon;
                  const content = (
                    <span className="flex items-start gap-2">
                      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
                      <span className="leading-relaxed" dir="auto">
                        {item.text}
                      </span>
                    </span>
                  );
                  return (
                    <li key={index}>
                      {item.href ? (
                        <a href={item.href} className="transition-colors hover:text-accent">
                          {content}
                        </a>
                      ) : (
                        content
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-2 border-t border-white/10 pt-6 text-sm text-white/60 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {schoolName} — جميع الحقوق محفوظة.
          </p>
          <Link href="/privacy" className="transition-colors hover:text-accent">
            إشعار الخصوصية
          </Link>
        </div>
      </div>
    </footer>
  );
}
