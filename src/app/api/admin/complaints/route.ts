import { NextResponse } from 'next/server';
import { getMysqlPool } from '@/lib/mysql';
import { sendComplaintStatusUpdatedEmail } from '@/lib/complaint-email';

export const dynamic = 'force-dynamic';

function parseExtraData(extraData: unknown): Record<string, any> {
  if (!extraData) return {};
  if (typeof extraData === 'object') return extraData as Record<string, any>;
  if (typeof extraData === 'string') {
    try {
      return JSON.parse(extraData);
    } catch {
      return {};
    }
  }
  return {};
}

export async function GET() {
  try {
    const pool = getMysqlPool();
    const [rows] = await pool.query(
      `SELECT
         cr.id,
         cr.request_code,
         cr.request_type,
         cr.status,
         cr.reporter_name,
         cr.email,
         cr.subject,
         cr.description,
         cr.location,
         cr.created_at,
         cr.extra_data,
         COALESCE(att.total_attachments, 0) AS total_attachments
       FROM case_requests cr
       LEFT JOIN (
         SELECT case_request_id, COUNT(*) AS total_attachments
         FROM case_request_attachments
         GROUP BY case_request_id
       ) att ON att.case_request_id = cr.id
       WHERE cr.request_type IN ('keluhan', 'mbg', 'bantuan_hukum')
       ORDER BY cr.created_at DESC`
    );

    const complaints = (rows as any[]).map((row) => {
      const createdAt = new Date(row.created_at);
      const extraData = parseExtraData(row.extra_data);
      return {
        id: String(row.id),
        requestCode: row.request_code,
        reporterName: row.reporter_name,
        email: row.email,
        subject: row.subject,
        kronologis: row.description,
        status: row.status,
        type: row.request_type,
        location: row.location,
        hasDokumen: Number(row.total_attachments) > 0 || Boolean(extraData.hasDokumen),
        createdAt: row.created_at,
        date: createdAt.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
        time: createdAt.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      };
    });

    return NextResponse.json({ complaints });
  } catch (error) {
    return NextResponse.json({ message: 'Gagal memuat keluhan.', error: String(error) }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const payload = await request.json();
    const { id, status, note } = payload;

    if (!id || !['diterima', 'diproses', 'selesai'].includes(status)) {
      return NextResponse.json({ message: 'Data status tidak valid.' }, { status: 400 });
    }

    const pool = getMysqlPool();
    const [existingRows] = await pool.query<any[]>(
      `SELECT status, request_code, reporter_name, email, subject
       FROM case_requests
       WHERE id = ?`,
      [Number(id)]
    );

    if (existingRows.length === 0) {
      return NextResponse.json({ message: 'Keluhan tidak ditemukan.' }, { status: 404 });
    }

    const complaint = existingRows[0];
    const oldStatus = complaint.status;

    await pool.query(
      `UPDATE case_requests
       SET status = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [status, Number(id)]
    );

    await pool.query(
      `INSERT INTO case_request_status_history (case_request_id, old_status, new_status, note, changed_by_admin_id)
       VALUES (?, ?, ?, ?, 1)`,
      [Number(id), oldStatus, status, note || 'Status diperbarui dari admin route']
    );

    await sendComplaintStatusUpdatedEmail({
      to: complaint.email,
      reporterName: complaint.reporter_name,
      requestCode: complaint.request_code,
      subject: complaint.subject || 'Laporan Pengaduan',
      currentStatus: status,
      previousStatus: oldStatus,
      note: note || 'Status diperbarui dari admin route',
      updatedAt: new Date().toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) + ' WIB',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ message: 'Gagal memperbarui status keluhan.', error: String(error) }, { status: 500 });
  }
}
