// lib/engines/generator-engine.ts
// Generators: UUID v4, Strong Passwords, Hashes (SHA-256)

export function generateUuidV4(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function generateBulkUuids(count: number = 5, uppercase: boolean = false, hyphens: boolean = true): string[] {
  const result: string[] = [];
  const safeCount = Math.min(Math.max(1, count), 100);
  for (let i = 0; i < safeCount; i++) {
    let uuid = generateUuidV4();
    if (!hyphens) uuid = uuid.replace(/-/g, '');
    if (uppercase) uuid = uuid.toUpperCase();
    result.push(uuid);
  }
  return result;
}

export interface PasswordOptions {
  length?: number;
  includeUppercase?: boolean;
  includeLowercase?: boolean;
  includeNumbers?: boolean;
  includeSymbols?: boolean;
  excludeAmbiguous?: boolean; // exclude 1, l, I, 0, O, o
}

export function generatePassword(options: PasswordOptions = {}): string {
  const {
    length = 16,
    includeUppercase = true,
    includeLowercase = true,
    includeNumbers = true,
    includeSymbols = true,
    excludeAmbiguous = false,
  } = options;

  let upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let lower = 'abcdefghijklmnopqrstuvwxyz';
  let nums = '0123456789';
  let syms = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  if (excludeAmbiguous) {
    upper = upper.replace(/[IO]/g, '');
    lower = lower.replace(/[lo]/g, '');
    nums = nums.replace(/[01]/g, '');
  }

  let pool = '';
  const requiredChars: string[] = [];

  if (includeUppercase) {
    pool += upper;
    requiredChars.push(upper[Math.floor(Math.random() * upper.length)]);
  }
  if (includeLowercase) {
    pool += lower;
    requiredChars.push(lower[Math.floor(Math.random() * lower.length)]);
  }
  if (includeNumbers) {
    pool += nums;
    requiredChars.push(nums[Math.floor(Math.random() * nums.length)]);
  }
  if (includeSymbols) {
    pool += syms;
    requiredChars.push(syms[Math.floor(Math.random() * syms.length)]);
  }

  if (!pool) pool = lower; // fallback

  const passLength = Math.min(Math.max(4, length), 128);
  const passwordChars: string[] = [...requiredChars];

  // Cryptographically secure random bytes if available
  const needed = passLength - passwordChars.length;
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint32Array(needed);
    crypto.getRandomValues(array);
    for (let i = 0; i < needed; i++) {
      passwordChars.push(pool[array[i] % pool.length]);
    }
  } else {
    for (let i = 0; i < needed; i++) {
      passwordChars.push(pool[Math.floor(Math.random() * pool.length)]);
    }
  }

  // Shuffle
  return passwordChars.sort(() => Math.random() - 0.5).join('');
}

export async function generateHash(text: string, algorithm: 'SHA-256' | 'SHA-1' | 'SHA-512' = 'SHA-256'): Promise<string> {
  if (typeof crypto === 'undefined' || !crypto.subtle) {
    return 'Web Crypto API not supported';
  }
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest(algorithm, data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}
