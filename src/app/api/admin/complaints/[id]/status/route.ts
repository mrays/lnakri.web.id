import { NextResponse } from 'next/server';
import { getMysqlPool } from '@/lib/mysql';

export const dynamic = 'force-dynamic';

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const payload = await request.json();
    const newStatus = payload.status;

    if (!['diterima', 'diproses', 'selesai'].includes(newStatus)) {
      return NextResponse.json({ message: 'Status tidak valid.' }, { status: 400 });
    }

    const pool = getMysqlPool();
    const [existingRows] = await pool.query<any[]>('SELECT status FROM case_requests WHERE id = ?', [Number(id)]);
    if (existingRows.length === 0) {
      return NextResponse.json({ message: 'Keluhan tidak ditemukan.' }, { status: 404 });
    }

    const oldStatus = existingRows[0].status;
    await pool.query(
      `UPDATE case_requests
       SET status = ?, closed_at = CASE WHEN ? = 'selesai' THEN NOW() ELSE closed_at END, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [newStatus, newStatus, Number(id)]
    );

    await pool.query(
      `INSERT INTO case_request_status_history (case_request_id, old_status, new_status, note, changed_by_admin_id)
       VALUES (?, ?, ?, ?, 1)`,
      [Number(id), oldStatus, newStatus, payload.note || 'Status diperbarui dari panel admin']
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ message: 'Gagal memperbarui status.', error: String(error) }, { status: 500 });
  }
}
