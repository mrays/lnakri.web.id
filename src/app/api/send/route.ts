import { NextResponse } from "next/server";
import { Resend } from "resend";
import ComplaintCreatedEmail from "@/components/emails/ComplaintCreatedEmail";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { reportId } = await request.json();

    if (!reportId) {
      return NextResponse.json(
        { error: "reportId is required" },
        { status: 400 }
      );
    }

    const { data, error } = await resend.emails.send({
      from: "LNAKRI NGO <noreply@lnakri.web.id>",
      to: ["muhamadazizul11@gmail.com"],
      subject: `Laporan Baru Telah Dibuat - ${reportId}`,
      react: ComplaintCreatedEmail({
        reporterName: 'Tim Admin',
        requestCode: reportId,
        subject: 'Laporan baru telah dibuat',
        type: 'keluhan',
        createdAt: new Date().toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) + ' WIB',
      }),
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}