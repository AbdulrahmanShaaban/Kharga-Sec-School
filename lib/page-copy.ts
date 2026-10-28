import { prisma } from "./db";

/**
 * Full-CMS page copy registry.
 *
 * Every editable text on the public site is declared here as a (page, key)
 * block with a sensible default. School staff edit the values from
 * /admin/pages; the public pages read them through `getPageCopy()`, which
 * falls back to the default when a value has never been saved.
 *
 * Adding a new editable text = add an entry here and render `copy[key]`.
 */

export type CopyField = {
  key: string;
  label: string;
  /** Render a multi-line editor instead of a single-line input. */
  textarea?: boolean;
  /** The value used until the staff member saves their own. */
  defaultValue: string;
};

export type CopyBlock = {
  /** Stable id stored in the DB (`page` column) and shown in the admin UI. */
  page: string;
  /** Arabic title of the block in the admin editor. */
  title: string;
  /** Short guidance for the person editing. */
  hint?: string;
  fields: CopyField[];
};

export const COPY_BLOCKS: CopyBlock[] = [
  {
    page: "home",
    title: "الصفحة الرئيسية",
    hint: "الواجهة الرئيسية ونداءات الدعوة وشريط «شاركنا رأيك».",
    fields: [
      { key: "hero.subtitle", label: "نص الترحيب تحت اسم المدرسة", textarea: true, defaultValue: "البوابة الرسمية للمدرسة — تابع آخر الأخبار والأنشطة والمسابقات، وتواصل معنا لتقديم الشكاوى والمقترحات." },
      { key: "hero.ctaNews", label: "زر «آخر الأخبار»", defaultValue: "آخر الأخبار" },
      { key: "hero.ctaCompetitions", label: "زر «المسابقات»", defaultValue: "المسابقات" },
      { key: "hero.ctaSuggestions", label: "زر «مقترحات»", defaultValue: "مقترحات" },
      { key: "news.heading", label: "عنوان قسم الأخبار", defaultValue: "آخر الأخبار" },
      { key: "activities.heading", label: "عنوان قسم الأنشطة", defaultValue: "آخر الأنشطة" },
      { key: "competitions.heading", label: "عنوان قسم المسابقات", defaultValue: "المسابقات" },
      { key: "feedback.title", label: "عنوان شريط المشاركة", defaultValue: "شاركنا رأيك" },
      { key: "feedback.body", label: "نص شريط المشاركة", textarea: true, defaultValue: "نرحّب بشكاويكم ومقترحاتكم لتحسين الخدمة التعليمية. تُراجع الشكاوى والمقترحات من الإدارة المخوّلة، وتُنشر المقترحات بنصّها فقط وبعد موافقة الإدارة." },
      { key: "feedback.ctaComplaint", label: "زر «تقديم شكوى»", defaultValue: "تقديم شكوى" },
      { key: "feedback.ctaSuggestion", label: "زر «تقديم مقترح»", defaultValue: "تقديم مقترح" },
      { key: "about.heading", label: "عنوان قسم «عن المدرسة»", defaultValue: "عن المدرسة" },
      { key: "about.linkLabel", label: "رابط «معرفة المزيد»", defaultValue: "معرفة المزيد" },
    ],
  },
  {
    page: "about",
    title: "صفحة «عن المدرسة»",
    fields: [
      { key: "hero.subtitle", label: "سطر العنوان الفرعي", defaultValue: "نبذة رسمية مقدمة من إدارة المدرسة." },
      { key: "intro.heading", label: "عنوان النبذة", defaultValue: "نبذة عن المدرسة" },
      { key: "intro.body", label: "جسم النبذة", textarea: true, defaultValue: "تُضاف النبذة الرسمية للمدرسة من لوحة التحكم بعد اعتمادها من إدارة المدرسة." },
      { key: "contact.heading", label: "عنوان بيانات التواصل", defaultValue: "بيانات التواصل" },
    ],
  },
  {
    page: "news",
    title: "صفحة الأخبار",
    fields: [
      { key: "hero.title", label: "عنوان الصفحة", defaultValue: "أخبار المدرسة" },
      { key: "hero.subtitle", label: "العنوان الفرعي", defaultValue: "آخر الأخبار والإعلانات الرسمية المعتمدة من إدارة المدرسة." },
      { key: "empty.title", label: "عنوان حالة الفراغ", defaultValue: "لا توجد أخبار منشورة حتى الآن" },
      { key: "empty.hint", label: "شرح حالة الفراغ", defaultValue: "ستظهر الأخبار هنا فور نشرها من لوحة التحكم." },
    ],
  },
  {
    page: "activities",
    title: "صفحة الأنشطة",
    fields: [
      { key: "hero.title", label: "عنوان الصفحة", defaultValue: "الأنشطة المدرسية" },
      { key: "hero.subtitle", label: "العنوان الفرعي", defaultValue: "الأنشطة والفعاليات المدرسية المعتمدة من إدارة المدرسة." },
      { key: "empty.title", label: "عنوان حالة الفراغ", defaultValue: "لا توجد أنشطة منشورة حتى الآن" },
      { key: "empty.hint", label: "شرح حالة الفراغ", defaultValue: "ستظهر الأنشطة هنا فور نشرها من لوحة التحكم." },
    ],
  },
  {
    page: "competitions",
    title: "صفحة المسابقات",
    fields: [
      { key: "hero.title", label: "عنوان الصفحة", defaultValue: "المسابقات" },
      { key: "hero.subtitle", label: "العنوان الفرعي", defaultValue: "مسابقات المدرسة وشروط المشاركة ومواعيدها ونتائجها." },
      { key: "empty.title", label: "عنوان حالة الفراغ", defaultValue: "لا توجد مسابقات منشورة حتى الآن" },
      { key: "empty.hint", label: "شرح حالة الفراغ", defaultValue: "ستظهر المسابقات هنا فور نشرها من لوحة التحكم." },
    ],
  },
  {
    page: "complaints",
    title: "صفحة الشكاوى",
    fields: [
      { key: "hero.title", label: "عنوان الصفحة", defaultValue: "تقديم شكوى" },
      { key: "hero.subtitle", label: "العنوان الفرعي", defaultValue: "نموذج تقديم الشكاوى الرسمية — تصل إلى الإدارة المختصة وتُعامل بسرية تامة." },
      { key: "intro", label: "ملاحظة أعلى النموذج", textarea: true, defaultValue: "تُراجع الشكاوى من الإدارة المختصة فقط ولا تُعرض للعامة. يُفضّل ترك وسيلة تواصل لتسريع المتابعة." },
    ],
  },
  {
    page: "suggestions",
    title: "صفحة المقترحات",
    fields: [
      { key: "hero.title", label: "عنوان الصفحة", defaultValue: "تقديم مقترح" },
      { key: "hero.subtitle", label: "العنوان الفرعي", defaultValue: "نموذج تقديم المقترحات — تُنشر المقترحات بنصّها فقط بعد موافقة الإدارة." },
      { key: "intro", label: "ملاحظة أعلى النموذج", textarea: true, defaultValue: "شكرًا لمشاركتك. لن تُنشر أي بيانات تعريفية مع المقترح." },
      { key: "published.heading", label: "عنوان قسم المقترحات المنشورة", defaultValue: "مقترحات منشورة" },
    ],
  },
  {
    page: "contact",
    title: "صفحة التواصل",
    fields: [
      { key: "hero.title", label: "عنوان الصفحة", defaultValue: "تواصل معنا" },
      { key: "hero.subtitle", label: "العنوان الفرعي", defaultValue: "قنوات التواصل الرسمية مع إدارة المدرسة." },
      { key: "note", label: "ملاحظة تواصل", textarea: true, defaultValue: "للاستفسارات والمقترحات والشكاوى، استخدم النماذج الرسمية على الموقع أو تواصل عبر بيانات التواصل أدناه." },
    ],
  },
];

/** Flattened default map for one page: { key: defaultValue }. */
export function defaultCopyFor(page: string): Record<string, string> {
  const block = COPY_BLOCKS.find((b) => b.page === page);
  if (!block) return {};
  return Object.fromEntries(block.fields.map((f) => [f.key, f.defaultValue]));
}

/**
 * Read the live copy for a page. Saved values override the defaults; any key
 * that was never saved keeps its default, so a partially-filled page still
 * renders complete text.
 */
export async function getPageCopy(page: string): Promise<Record<string, string>> {
  const merged = defaultCopyFor(page);
  try {
    const rows = await prisma.pageCopy.findMany({ where: { page } });
    for (const row of rows) {
      if (row.key in merged) merged[row.key] = row.value;
    }
  } catch {
    // DB unavailable → defaults only (page must still render).
  }
  return merged;
}

/** Read copy for several pages at once. */
export async function getPagesCopy(pages: string[]): Promise<Record<string, Record<string, string>>> {
  const entries = await Promise.all(
    pages.map(async (page): Promise<[string, Record<string, string>]> => [page, await getPageCopy(page)])
  );
  return Object.fromEntries(entries);
}
