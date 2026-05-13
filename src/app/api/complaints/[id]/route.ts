import { NextResponse } from 'next/server';
import { getMysqlPool } from '@/lib/mysql';

export const dynamic = 'force-dynamic';

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const { status } = await request.json();

    if (!status) {
      return NextResponse.json({ message: 'Status wajib diisi.' }, { status: 400 });
    }

    const pool = getMysqlPool();
    await pool.query(
      `UPDATE case_requests
       SET status = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [status, Number(id)]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ message: 'Gagal memperbarui status keluhan.', error: String(error) }, { status: 500 });
  }
}
