export function validatePhone(phone: string): string | null {
  const clean = phone.replace(/\D/g, '');

  if (clean.startsWith('55') &&( clean.length === 13)) return "+"+clean;

  if (!clean.startsWith('55') && clean.length === 11) {
    return '+55' + clean;
  }

  return null;
}
