import Link from "next/link";
import Image from "next/image";
import { MessageSquare } from "lucide-react";
import { constants } from "@/lib/constants";
import { getSiteSettings, schoolDisplayName } from "@/lib/settings";
import { DesktopNav, MobileNav } from "./nav";

/**
 * Public site header — school identity on the right, navigation on the left.
 * Static shell; the logo falls back to /logo.jpg until the school approves
 * its official asset from the admin settings.
 */
export async function SiteHeader() {
  let schoolName: string = constants.APP_NAME;
  let logoUrl: string | null = "/logo.jpg";
  try {
    const settings = await getSiteSettings();
    schoolName = schoolDisplayName(settings);
    if (settings.logoUrl) logoUrl = settings.logoUrl;
  } catch {
    // keep defaults
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
      <div className="mx-auto flex h-[4.5rem] max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl ring-1 ring-border">
            <Image
              src={logoUrl ?? "/logo.jpg"}
              alt={`شعار ${schoolName}`}
              fill
              sizes="44px"
              className="object-cover"
              priority
            />
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-[17px] font-extrabold leading-tight text-primary">{schoolName}</span>
            <span className="truncate text-xs font-medium text-muted-foreground">البوابة الرسمية</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <DesktopNav />
          <Link
            href="/complaints"
            className="hidden items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-bold text-accent-foreground shadow-sm transition-transform hover:-translate-y-0.5 hover:bg-accent/90 sm:inline-flex"
          >
            <MessageSquare className="h-4 w-4" aria-hidden />
            تقديم شكوى
          </Link>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
