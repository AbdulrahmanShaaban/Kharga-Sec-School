"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ComplaintDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [complaint, setComplaint] = useState<any>(null);
  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetch(`/api/admin/complaints/${id}`).then((r) => r.json()).then((d) => {
      setComplaint(d);
      setStatus(d.status ?? "NEW");
    });
  }, [id]);

  async function handleUpdate() {
    await fetch(`/api/admin/complaints/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, internalNotes: notes }),
    });
  }

  if (!complaint) return <p>جاري التحميل...</p>;

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">تفاصيل الشكوى</h1>
      <div className="space-y-2">
        <p><strong>المرجع:</strong> {complaint.referenceCode}</p>
        <p><strong>الموضوع:</strong> {complaint.subject}</p>
        <p><strong>الفئة:</strong> {complaint.category}</p>
        <p><strong>الرسالة:</strong> {complaint.message}</p>
        <p><strong>مقدم الشكوى:</strong> {complaint.submitterName ?? "-"}</p>
        <p><strong>البريد:</strong> {complaint.contactEmail ?? "-"}</p>
        <p><strong>الهاتف:</strong> {complaint.contactPhone ?? "-"}</p>
        <p><strong>الصف/الفصل:</strong> {complaint.gradeClass ?? "-"}</p>
      </div>
      <div>
        <label>الحالة</label>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="NEW">جديدة</SelectItem>
            <SelectItem value="IN_PROGRESS">قيد المعالجة</SelectItem>
            <SelectItem value="RESOLVED">تم الحل</SelectItem>
            <SelectItem value="CLOSED">مغلقة</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <label>ملاحظات داخلية</label>
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>
      <Button onClick={handleUpdate}>حفظ</Button>
    </div>
  );
}
