"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Prisma } from "@prisma/client";

export default function SuggestionDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [s, setS] = useState<Prisma.SuggestionPrivateGetPayload<{}> | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/suggestions")
      .then((r) => r.json())
      .then((list: Prisma.SuggestionPrivateGetPayload<{}>[]) => {
        const found = list.find((x) => x.id === id);
        if (found) {
          setS(found);
          setReviewNote(found.reviewNote ?? "");
        }
        setLoading(false);
      });
  }, [id]);

  async function act(status: string) {
    await fetch("/api/admin/suggestions", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status, reviewNote }),
    });
    router.push("/admin/suggestions");
  }

  if (loading || !s) return <p>جاري التحميل...</p>;

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">تفاصيل الاقتراح</h1>
      <p className="whitespace-pre-wrap">{s.suggestionText}</p>
      <div>
        <Label>ملاحظة المراجعة</Label>
        <Textarea value={reviewNote} onChange={(e) => setReviewNote(e.target.value)} />
      </div>
      <div className="flex gap-3">
        <Button onClick={() => act("APPROVED")}>اعتماد</Button>
        <Button variant="outline" onClick={() => act("REJECTED")}>/examples</Button>
        <Button variant="ghost" onClick={() => act("HIDDEN")}>إخفاء</Button>
      </div>
    </div>
  );
}