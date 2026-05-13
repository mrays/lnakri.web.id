import { NextResponse } from "next/server";
import { Resend } from "resend";
import ComplaintCreatedEmail from "@/components/emails/ComplaintCreatedEmail";
import { getMysqlPool } from "@/lib/mysql";

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

    const pool = getMysqlPool();
    const [rows] = await pool.query('SELECT email FROM organization_profiles WHERE id = 1 LIMIT 1');
    const organizationEmail = String((rows as any[])[0]?.email || '').trim();

    if (!organizationEmail) {
      return NextResponse.json({ error: 'Organization email not configured' }, { status: 400 });
    }

    const { data, error } = await resend.emails.send({
      from: "LNAKRI NGO <noreply@lnakri.web.id>",
      to: [organizationEmail],
      subject: `Laporan Baru Masuk - ${reportId}`,
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