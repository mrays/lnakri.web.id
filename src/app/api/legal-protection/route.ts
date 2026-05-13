import { NextResponse } from 'next/server';
import { getMysqlPool } from '@/lib/mysql';
import { sendComplaintCreatedEmail, sendInternalNotificationEmail } from '@/lib/complaint-email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const pool = getMysqlPool();

    const requestCode = (formData.get('requestCode') as string) || `LPSK-DRAFT-${Date.now().toString().slice(-6)}`;
    const fullName = (formData.get('fullName') as string) || '';
    const email = (formData.get('email') as string) || '';
    const phone = (formData.get('phone') as string) || null;
    const nik = (formData.get('nik') as string) || '';
    const address = (formData.get('address') as string) || '';
    const peranDalamKasus = (formData.get('peranDalamKasus') as string) || '';
    const namaKasus = (formData.get('namaKasus') as string) || '';
    const instansiTerkait = (formData.get('instansiTerkait') as string) || null;
    const ancamanYangDiterima = (formData.get('ancamanYangDiterima') as string) || '';
    const kronologis = (formData.get('kronologis') as string) || '';
    const sudahLaporLPSK = (formData.get('sudahLaporLPSK') as string) || 'belum';
    const butuhPerlindunganFisik = formData.get('butuhPerlindunganFisik') === 'true' || formData.get('butuhPerlindunganFisik') === 'on';
    const butuhPerlindunganIdentitas = formData.get('butuhPerlindunganIdentitas') === 'true' || formData.get('butuhPerlindunganIdentitas') === 'on';
    const butuhPerlindunganHukum = formData.get('butuhPerlindunganHukum') === 'true' || formData.get('butuhPerlindunganHukum') === 'on';
    const agreeTerms = formData.get('agreeTerms') === 'true' || formData.get('agreeTerms') === 'on';
    const sourcePage = (formData.get('sourcePage') as string) || 'legal-protection-form';
    const files = formData.getAll('files') as File[];

    if (!fullName || !email || !nik || !address || !peranDalamKasus || !namaKasus || !ancamanYangDiterima || !kronologis || !agreeTerms) {
      return NextResponse.json({ message: 'Data wajib belum lengkap.' }, { status: 400 });
    }

    const extraData = {
      nik,
      peranDalamKasus,
      sudahLaporLPSK,
      butuhPerlindunganFisik,
      butuhPerlindunganIdentitas,
      butuhPerlindunganHukum,
      hasDokumen: files.filter((file) => file.size > 0).length > 0,
    };

    const [result]: any = await pool.query(
      `INSERT INTO case_requests (
        request_code, request_type, status, reporter_name, email, phone,
        subject, location, description, involved_parties, estimated_loss,
        source_page, extra_data, public_note
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        requestCode,
        'perlindungan',
        'draft',
        fullName,
        email,
        phone,
        'Draft Permohonan Perlindungan Hukum Saksi',
        address,
        `${namaKasus}\n\nAncaman yang diterima: ${ancamanYangDiterima}\n\nKronologis:\n${kronologis}`,
        instansiTerkait,
        null,
        sourcePage,
        JSON.stringify(extraData),
        'Identitas dijaga kerahasiaannya',
      ]
    );

    const createdAtLabel = new Date().toLocaleString('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    try {
      await sendComplaintCreatedEmail({
        to: email,
        reporterName: fullName,
        requestCode,
        subject: 'Draft Permohonan Perlindungan Hukum Saksi',
        type: 'perlindungan',
        location: address,
        attachmentCount: files.filter((file) => file.size > 0).length,
        createdAt: createdAtLabel,
      });
    } catch (emailError) {
      console.error('Failed to send legal protection reporter email via Resend:', emailError);
    }

    try {
      await sendInternalNotificationEmail({
        reportId: requestCode,
        reportType: 'perlindungan',
        reporterName: fullName,
        subject: 'Draft Permohonan Perlindungan Hukum Saksi',
      });
    } catch (emailError) {
      console.error('Failed to send legal protection organization email via Resend:', emailError);
    }

    return NextResponse.json({
      success: true,
      message: 'Draft permohonan perlindungan hukum berhasil disimpan',
      id: result.insertId,
      requestCode,
    });
  } catch (error) {
    console.error('Failed to save legal protection draft:', error);
    return NextResponse.json({ message: 'Gagal menyimpan draft perlindungan hukum.', error: String(error) }, { status: 500 });
  }
}