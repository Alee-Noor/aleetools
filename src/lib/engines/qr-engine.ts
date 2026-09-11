// lib/engines/qr-engine.ts
// Pure client-side QR Code rendering and formatting helpers

export interface QrOptions {
  text: string;
  size?: number;
  darkColor?: string;
  lightColor?: string;
  margin?: number;
}

export function formatVCard(data: {
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  org?: string;
  title?: string;
  url?: string;
}): string {
  return [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${data.lastName};${data.firstName};;;`,
    `FN:${data.firstName} ${data.lastName}`,
    data.org ? `ORG:${data.org}` : '',
    data.title ? `TITLE:${data.title}` : '',
    data.phone ? `TEL;TYPE=CELL:${data.phone}` : '',
    data.email ? `EMAIL:${data.email}` : '',
    data.url ? `URL:${data.url}` : '',
    'END:VCARD',
  ]
    .filter(Boolean)
    .join('\n');
}

export function formatEmailQr(email: string, subject: string = '', body: string = ''): string {
  const params: string[] = [];
  if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
  if (body) params.push(`body=${encodeURIComponent(body)}`);
  return `mailto:${email}${params.length ? '?' + params.join('&') : ''}`;
}

export function formatPhoneQr(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, '')}`;
}

export function formatSmsQr(phone: string, message: string = ''): string {
  return `sms:${phone.replace(/[^\d+]/g, '')}${message ? '?body=' + encodeURIComponent(message) : ''}`;
}

export function formatWifiQr(ssid: string, password: string = '', authType: 'WPA' | 'WEP' | 'nopass' = 'WPA'): string {
  return `WIFI:T:${authType};S:${ssid};P:${password};;`;
}
