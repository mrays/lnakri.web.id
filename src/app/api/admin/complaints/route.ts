import { NextResponse } from 'next/server';
import { getMysqlPool } from '@/lib/mysql';

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
