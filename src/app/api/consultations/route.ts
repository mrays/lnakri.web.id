import { NextResponse } from 'next/server';
import { getMysqlPool } from '@/lib/mysql';
import { sendConsultationCreatedEmail, sendInternalNotificationEmail } from '@/lib/complaint-email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const pool = getMysqlPool();

    const requestCode = (formData.get('requestCode') as string) || `KONS-${Date.now().toString().slice(-6)}`;
    const name = (formData.get('name') as string) || '';
    const email = (formData.get('email') as string) || '';
    const phone = (formData.get('phone') as string) || null;
    const topik = (formData.get('topik') as string) || 'Konsultasi Real Time';
    const pertanyaan = (formData.get('pertanyaan') as string) || '';

    if (!name || !email || !topik || !pertanyaan) {
      return NextResponse.json({ message: 'Data wajib belum lengkap.' }, { status: 400 });
    }

    const [result]: any = await pool.query(
      `INSERT INTO case_requests (
        request_code, request_type, status, reporter_name, email, phone,
        subject, location, description, source_page, extra_data, public_note
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        requestCode,
        'konsultasi',
        'draft',
        name,
        email,
        phone,
        topik,
        'Online',
        pertanyaan,
        'consultation-form',
        JSON.stringify({ topik }),
        'Konsultasi masuk dan menunggu tindak lanjut tim LNAKRI',
      ]
    );

    const createdAtLabel = new Date().toLocaleString('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    try {
      await sendConsultationCreatedEmail({
        to: email,
        reporterName: name,
        requestCode,
        subject: topik,
        createdAt: createdAtLabel,
      });
    } catch (emailError) {
      console.error('Failed to send consultation reporter email via Resend:', emailError);
    }

    try {
      await sendInternalNotificationEmail({
        reportId: requestCode,
        reportType: 'konsultasi',
        reporterName: name,
        subject: topik,
      });
    } catch (emailError) {
      console.error('Failed to send consultation organization email via Resend:', emailError);
    }

    return NextResponse.json({
      success: true,
      message: 'Konsultasi berhasil diterima',
      id: result.insertId,
      requestCode,
    });
  } catch (error) {
    console.error('Failed to save consultation:', error);
    return NextResponse.json({ message: 'Gagal menyimpan konsultasi.', error: String(error) }, { status: 500 });
  }
}