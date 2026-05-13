import { NextResponse } from 'next/server';
import { getMysqlPool } from '@/lib/mysql';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, context: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await context.params;
    const pool = getMysqlPool();

    // Fetch complaint by request_code
    const [rows]: any = await pool.query(
      `SELECT id, request_code, subject, status, created_at, request_type
       FROM case_requests
       WHERE request_code = ?`,
      [code]
    );

    if (rows.length === 0) {
      return NextResponse.json({ message: 'Laporan tidak ditemukan.' }, { status: 404 });
    }

    const complaint = rows[0];

    // Fetch history
    const [historyRows]: any = await pool.query(
      `SELECT new_status, note, created_at
       FROM case_request_status_history
       WHERE case_request_id = ?
       ORDER BY created_at ASC`,
      [complaint.id]
    );

    const updates = historyRows.map((h: any) => ({
      time: new Date(h.created_at).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) + ' WIB',
      status: h.new_status,
      note: h.note || `Status diperbarui menjadi ${h.new_status}`
    }));

    // If no history, add the initial state
    if (updates.length === 0) {
      updates.push({
        time: new Date(complaint.created_at).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) + ' WIB',
        status: complaint.status,
        note: 'Laporan diterima oleh sistem LNAKRI NGO.'
      });
    }

    return NextResponse.json({
      status: complaint.status,
      subject: complaint.subject || `Laporan ${complaint.request_type}`,
      date: new Date(complaint.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      updates: updates
    });

  } catch (error) {
    console.error('Failed to fetch complaint status:', error);
    return NextResponse.json({ message: 'Gagal mengambil status laporan.', error: String(error) }, { status: 500 });
  }
}
