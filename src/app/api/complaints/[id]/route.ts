import { NextResponse } from 'next/server';
import { getMysqlPool } from '@/lib/mysql';
import { sendComplaintStatusUpdatedEmail } from '@/lib/complaint-email';

export const dynamic = 'force-dynamic';

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const { status } = await request.json();

    if (!status) {
      return NextResponse.json({ message: 'Status wajib diisi.' }, { status: 400 });
    }

    const pool = getMysqlPool();
    const [existingRows] = await pool.query<any[]>(
      `SELECT id, request_code, reporter_name, email, subject, status
       FROM case_requests
       WHERE id = ?`,
      [Number(id)]
    );

    if (existingRows.length === 0) {
      return NextResponse.json({ message: 'Keluhan tidak ditemukan.' }, { status: 404 });
    }

    const complaint = existingRows[0];
    const previousStatus = complaint.status;
    await pool.query(
      `UPDATE case_requests
       SET status = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [status, Number(id)]
    );

    await sendComplaintStatusUpdatedEmail({
      to: complaint.email,
      reporterName: complaint.reporter_name,
      requestCode: complaint.request_code,
      subject: complaint.subject || 'Laporan Pengaduan',
      currentStatus: status,
      previousStatus,
      updatedAt: new Date().toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) + ' WIB',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ message: 'Gagal memperbarui status keluhan.', error: String(error) }, { status: 500 });
  }
}
