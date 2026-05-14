import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

type PaymentCallbackPayload = {
  order_id?: string;
  status?: string;
  amount?: number;
  total_amount?: number;
  payment_date?: string;
  created_at?: string;
  updated_at?: string;
  keterangan?: string;
  direct_url?: string;
  signature?: string;
};

const KLIKQRIS_BASE_URL = process.env.KLIKQRIS_BASE_URL || 'https://klikqris.com/api';
const KLIKQRIS_API_KEY = process.env.KLIKQRIS_API_KEY;
const KLIKQRIS_MERCHANT_ID = process.env.KLIKQRIS_MERCHANT_ID;

async function verifyTransaction(orderId: string) {
  if (!KLIKQRIS_API_KEY || !KLIKQRIS_MERCHANT_ID) {
    return null;
  }

  const response = await fetch(`${KLIKQRIS_BASE_URL}/qris/status/${orderId}`, {
    method: 'GET',
    headers: {
      'x-api-key': KLIKQRIS_API_KEY,
      id_merchant: KLIKQRIS_MERCHANT_ID,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    return null;
  }

  return response.json();
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as PaymentCallbackPayload;

    if (!payload.order_id) {
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    const verified = await verifyTransaction(payload.order_id);

    console.info('QRIS donation callback received', {
      orderId: payload.order_id,
      callbackStatus: payload.status,
      verifiedStatus: verified?.data?.status,
      totalAmount: payload.total_amount,
      paymentDate: payload.payment_date,
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error('Failed to handle QRIS donation callback:', error);
    return NextResponse.json({ ok: true }, { status: 200 });
  }
}
