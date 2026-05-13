import { NextResponse } from "next/server";
import { Resend } from "resend";
import ReportEmail from "@/components/emails/ReportEmail";

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
      from: "LNAKRI <no-reply@lnakri.web.id>",
      to: ["muhamadazizul11@gmail.com"], // Ganti dengan email tujuan
      subject: "Laporan Baru Telah Dibuat",
      react: ReportEmail({ reportId }),
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