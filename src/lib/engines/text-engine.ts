// lib/engines/text-engine.ts
// Client-side JSON and text processing functions

export interface JsonValidationResult {
  isValid: boolean;
  error?: string;
  line?: number;
  formatted?: string;
}

export function formatJson(input: string, indent: number | string = 2): JsonValidationResult {
  if (!input.trim()) {
    return { isValid: false, error: 'Input is empty' };
  }
  try {
    const parsed = JSON.parse(input);
    const formatted = JSON.stringify(parsed, null, indent);
    return { isValid: true, formatted };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    // Extract line number if present in error message
    const lineMatch = errorMsg.match(/at position (\d+)/i) || errorMsg.match(/line (\d+)/i);
    let line: number | undefined = undefined;
    if (lineMatch && lineMatch[1]) {
      const pos = parseInt(lineMatch[1], 10);
      line = input.substring(0, pos).split('\n').length;
    }
    return { isValid: false, error: errorMsg, line };
  }
}

export function minifyJson(input: string): JsonValidationResult {
  if (!input.trim()) {
    return { isValid: false, error: 'Input is empty' };
  }
  try {
    const parsed = JSON.parse(input);
    const formatted = JSON.stringify(parsed);
    return { isValid: true, formatted };
  } catch (err: unknown) {
    return { isValid: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export function encodeBase64(text: string): string {
  // UTF-8 safe base64 encoding
  const utf8Bytes = new TextEncoder().encode(text);
  let binary = '';
  for (let i = 0; i < utf8Bytes.length; i++) {
    binary += String.fromCharCode(utf8Bytes[i]);
  }
  return btoa(binary);
}

export function decodeBase64(base64: string): { success: boolean; result: string; error?: string } {
  try {
    const binary = atob(base64.trim());
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const decoded = new TextDecoder().decode(bytes);
    return { success: true, result: decoded };
  } catch (err: unknown) {
    return {
      success: false,
      result: '',
      error: 'Invalid Base64 string: ' + (err instanceof Error ? err.message : String(err)),
    };
  }
}

export function encodeUrl(str: string): string {
  return encodeURIComponent(str);
}

export function decodeUrl(str: string): string {
  try {
    return decodeURIComponent(str);
  } catch {
    return 'Error: Malformed URI sequence';
  }
}
