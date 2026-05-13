import { NextResponse } from 'next/server';
import { getMysqlPool } from '@/lib/mysql';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { buildStoredFileName, getComplaintUploadDir, getComplaintUploadUrl } from '@/lib/upload-storage';
import { sendComplaintCreatedEmail } from '@/lib/complaint-email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const pool = getMysqlPool();
    const [rows] = await pool.query(
      `SELECT c.id, c.request_code, c.reporter_name, c.email, c.subject, c.description, c.status, c.created_at, c.request_type, c.location,
              (SELECT COUNT(*) FROM case_request_attachments WHERE case_request_id = c.id) > 0 AS has_dokumen
       FROM case_requests c
       ORDER BY c.created_at DESC`
    );

    const complaintRows = rows as any[];
    const complaintIds = complaintRows.map((row) => row.id);
    const attachmentsByCaseId = new Map<number, { fileUrl: string; fileName: string; originalFileName: string | null }[]>();

    if (complaintIds.length > 0) {
      const placeholders = complaintIds.map(() => '?').join(', ');
      const [attachmentRows] = await pool.query(
        `SELECT case_request_id, file_url, file_name, original_file_name
         FROM case_request_attachments
         WHERE case_request_id IN (${placeholders})
         ORDER BY created_at ASC`,
        complaintIds
      );

      for (const attachment of attachmentRows as any[]) {
        const existing = attachmentsByCaseId.get(attachment.case_request_id) || [];
        existing.push({
          fileUrl: attachment.file_url,
          fileName: attachment.file_name,
          originalFileName: attachment.original_file_name,
        });
        attachmentsByCaseId.set(attachment.case_request_id, existing);
      }
    }

    const complaints = complaintRows.map((row) => {
      const attachments = attachmentsByCaseId.get(row.id) || [];

      return {
        id: String(row.id),
        requestCode: row.request_code,
        reporterName: row.reporter_name,
        email: row.email,
        subject: row.subject,
        kronologis: row.description,
        status: row.status,
        date: new Date(row.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
        time: new Date(row.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
        type: row.request_type,
        hasDokumen: attachments.length > 0 || Boolean(row.has_dokumen),
        attachmentUrl: attachments[0]?.fileUrl || null,
        attachmentName: attachments[0]?.originalFileName || attachments[0]?.fileName || null,
        attachmentCount: attachments.length,
        attachments,
        location: row.location,
      };
    });

    return NextResponse.json({ complaints });
  } catch (error) {
    return NextResponse.json({ message: 'Gagal mengambil data keluhan.', error: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const pool = getMysqlPool();

    const requestCode = formData.get('requestCode') as string || 'LNAKRI-' + Date.now().toString().slice(-6);
    
    // Extract fields
    const type = formData.get('type') as string || 'keluhan';
    const reporterName = formData.get('reporterName') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string || null;
    const subjectFromForm = formData.get('subject') as string || null;
    const location = formData.get('location') as string || null;
    const description = formData.get('description') as string || formData.get('kronologis') as string;
    const involvedParties = formData.get('involvedParties') as string || null;
    const estimatedLoss = formData.get('estimatedLoss') as string || null;
    const sourcePage = formData.get('sourcePage') as string || 'public-complaint-form';
    const extraDataStr = formData.get('extraData') as string || null;

    const sql = `
      INSERT INTO case_requests (
        request_code, request_type, status, reporter_name, email, phone, 
        subject, location, description, involved_parties, estimated_loss, 
        source_page, extra_data
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      requestCode,
      type,
      'diterima',
      reporterName,
      email,
      phone,
      subjectFromForm,
      location,
      description,
      involvedParties,
      estimatedLoss,
      sourcePage,
      extraDataStr
    ];

    const [result]: any = await pool.query(sql, values);
    const caseRequestId = result.insertId;

    // Handle file uploads
    const files = formData.getAll('files') as File[];
    
    if (files.length > 0) {
      const uploadDir = getComplaintUploadDir(requestCode);

      try {
        await mkdir(uploadDir, { recursive: true });

        for (const file of files) {
          if (file.size === 0) continue;

          try {
            const buffer = Buffer.from(await file.arrayBuffer());
            const fileName = buildStoredFileName(file.name);
            const filePath = path.join(uploadDir, fileName);

            await writeFile(filePath, buffer);

            const fileUrl = getComplaintUploadUrl(requestCode, fileName);

            await pool.query(
              `INSERT INTO case_request_attachments (
                case_request_id, file_name, original_file_name, file_url, 
                mime_type, file_size_bytes, storage_driver, uploaded_by
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                caseRequestId,
                fileName,
                file.name,
                fileUrl,
                file.type,
                file.size,
                'ephemeral',
                'user'
              ]
            );
          } catch (attachmentError) {
            console.error('Failed to save complaint attachment:', attachmentError);
          }
        }
      } catch (uploadError) {
        console.error('Failed to prepare complaint upload directory:', uploadError);
      }
    }

    const emailSubject = formData.get('subject') as string || 'Laporan Pengaduan';
    const createdAtLabel = new Date().toLocaleString('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    if (email) {
      try {
        await sendComplaintCreatedEmail({
          to: email,
            reporterName,
            requestCode,
            subject: emailSubject,
            type,
            location,
            attachmentCount: files.filter((file) => file.size > 0).length,
            createdAt: createdAtLabel,
        });
      } catch (emailError) {
        console.error('Failed to send email via Resend:', emailError);
        // Kita tidak menggagalkan response utama jika email gagal terkirim
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Laporan berhasil disimpan', 
      id: caseRequestId,
      requestCode: requestCode
    });
  } catch (error) {
    console.error('Failed to save complaint with files:', error);
    return NextResponse.json({ message: 'Gagal menyimpan laporan.', error: String(error) }, { status: 500 });
  }
}
