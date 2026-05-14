import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

type KlikQrisCreateResponse = {
  status?: boolean;
  message?: string;
  data?: {
    order_id?: string;
    signature?: string;
    redirect_url?: string;
    qris_url?: string | null;
    qris_image?: string | null;
    amount?: string;
    amount_uniq?: string;
    total_amount?: string;
    status?: string;
    expired_at?: string;
    nama_toko?: string;
  };
};

const KLIKQRIS_BASE_URL = process.env.KLIKQRIS_BASE_URL || 'https://klikqris.com/api';
const KLIKQRIS_API_KEY = process.env.KLIKQRIS_API_KEY;
const KLIKQRIS_MERCHANT_ID = process.env.KLIKQRIS_MERCHANT_ID;

function toPositiveInteger(value: unknown) {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return null;
  }

  const rounded = Math.floor(amount);
  return rounded > 0 ? rounded : null;
}

function sanitizeText(value: unknown, fallback = '') {
  return typeof value === 'string' ? value.trim().slice(0, 180) : fallback;
}

export async function POST(request: Request) {
  if (!KLIKQRIS_API_KEY || !KLIKQRIS_MERCHANT_ID) {
    return NextResponse.json({ error: 'Konfigurasi KlikQRIS belum lengkap.' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const amount = toPositiveInteger(body.amount);

    if (!amount) {
      return NextResponse.json(
        { error: 'Nominal donasi harus berupa angka lebih dari 0.' },
        { status: 400 }
      );
    }

    const donorName = sanitizeText(body.donorName, 'Donatur');
    const donorEmail = sanitizeText(body.donorEmail);
    const note = sanitizeText(body.keterangan);
    const orderId = `DON-${Date.now()}-${Math.floor(Math.random() * 9000 + 1000)}`;
    const keterangan = [
      `Donasi LNAKRI NGO dari ${donorName}`,
      donorEmail ? `(${donorEmail})` : '',
      note ? `- ${note}` : '',
    ]
      .filter(Boolean)
      .join(' ');

    const klikQrisResponse = await fetch(`${KLIKQRIS_BASE_URL}/qris/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': KLIKQRIS_API_KEY,
        id_merchant: KLIKQRIS_MERCHANT_ID,
      },
      body: JSON.stringify({
        order_id: orderId,
        id_merchant: KLIKQRIS_MERCHANT_ID,
        amount,
        keterangan,
      }),
      cache: 'no-store',
    });

    const result = (await klikQrisResponse.json()) as KlikQrisCreateResponse;

    if (!klikQrisResponse.ok || !result.status || !result.data?.signature) {
      return NextResponse.json(
        {
          error: result.message || 'Gagal membuat transaksi donasi KlikQRIS.',
        },
        { status: klikQrisResponse.ok ? 502 : klikQrisResponse.status }
      );
    }

    return NextResponse.json({
      success: true,
      donation: {
        orderId: result.data.order_id,
        signature: result.data.signature,
        redirectUrl: result.data.redirect_url,
        qrisUrl: result.data.qris_url,
        qrisImage: result.data.qris_image,
        amount: result.data.amount,
        amountUniq: result.data.amount_uniq,
        totalAmount: result.data.total_amount,
        status: result.data.status,
        expiredAt: result.data.expired_at,
        merchantName: result.data.nama_toko,
      },
    });
  } catch (error) {
    console.error('Failed to create KlikQRIS donation:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat membuat transaksi donasi.' },
      { status: 500 }
    );
  }
}
