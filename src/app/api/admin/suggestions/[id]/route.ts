import { NextResponse } from 'next/server';
import { getMysqlPool } from '@/lib/mysql';

export const dynamic = 'force-dynamic';

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const payload = await request.json();
    const pool = getMysqlPool();
    await pool.query('UPDATE suggestions SET is_read = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [payload.read ? 1 : 0, Number(id)]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ message: 'Gagal memperbarui saran.', error: String(error) }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const pool = getMysqlPool();
    await pool.query('UPDATE suggestions SET deleted_at = NOW(), updated_at = CURRENT_TIMESTAMP WHERE id = ?', [Number(id)]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ message: 'Gagal menghapus saran.', error: String(error) }, { status: 500 });
  }
}
