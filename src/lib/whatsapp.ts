export const DEFAULT_WHATSAPP_NUMBER = '6282295592545';

export function normalizeWhatsAppNumber(phone?: string | null) {
  const digits = phone?.replace(/\D/g, '');

  if (!digits) {
    return DEFAULT_WHATSAPP_NUMBER;
  }

  if (digits.startsWith('62')) {
    return digits;
  }

  if (digits.startsWith('0')) {
    return `62${digits.slice(1)}`;
  }

  if (digits.startsWith('8')) {
    return `62${digits}`;
  }

  return DEFAULT_WHATSAPP_NUMBER;
}

export function buildWhatsAppUrl(phone?: string | null, message?: string) {
  const waNumber = normalizeWhatsAppNumber(phone);

  if (!message) {
    return `https://wa.me/${waNumber}`;
  }

  return `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;
}
