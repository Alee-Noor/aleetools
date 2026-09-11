// 1D Barcode Generator & Pure JavaScript Decoder Engine
// Supports Code 128, Code 39, EAN-13, EAN-8, UPC-A, and ISBN

export type BarcodeFormat = 'CODE128' | 'CODE39' | 'EAN13' | 'EAN8' | 'UPCA' | 'ISBN';

// ─── 1. CODE 128 ENCODING & PATTERNS ───────────────────────────
const CODE128_PATTERNS: string[] = [
  "212222", "222122", "222221", "121223", "121322", "131222", "122213", "122312", "132212", "221213",
  "221312", "231212", "112232", "122132", "122231", "113222", "123122", "123221", "223211", "221132",
  "221231", "213212", "223112", "312131", "311222", "321122", "321221", "312212", "322112", "322211",
  "212123", "212321", "202121", "111323", "131123", "131321", "112313", "132113", "132311", "211313",
  "231113", "231311", "112133", "112331", "132131", "113123", "113321", "133121", "313121", "211331",
  "231131", "213113", "213311", "213131", "311123", "311321", "331121", "312113", "312311", "332111",
  "314111", "221411", "431111", "111224", "111422", "121124", "121421", "141122", "141221", "112214",
  "112412", "122114", "122411", "142112", "142211", "241211", "221114", "413111", "241112", "134111",
  "111242", "121142", "121241", "114212", "124112", "124211", "411212", "421112", "421211", "212141",
  "214121", "412121", "111143", "111341", "131141", "114113", "114311", "411113", "411311", "113141",
  "114131", "311141", "411131", "211412", "211214", "211232", "2331112"
];

function patternToBits(widths: string): string {
  let bits = "";
  for (let i = 0; i < widths.length; i++) {
    const len = parseInt(widths[i], 10);
    const isBar = i % 2 === 0;
    bits += (isBar ? "1" : "0").repeat(len);
  }
  return bits;
}

export function encodeCode128(text: string): string {
  if (!text) text = "12345678";

  let checksum = 104;
  let resultBits = patternToBits(CODE128_PATTERNS[104]);

  for (let i = 0; i < text.length; i++) {
    let charCode = text.charCodeAt(i) - 32;
    if (charCode < 0 || charCode > 95) charCode = 0;
    checksum += charCode * (i + 1);
    resultBits += patternToBits(CODE128_PATTERNS[charCode]);
  }

  const checkIndex = checksum % 103;
  resultBits += patternToBits(CODE128_PATTERNS[checkIndex]);
  resultBits += patternToBits(CODE128_PATTERNS[106]);

  return resultBits;
}

// ─── 2. CODE 39 ENCODING ───────────────────────────────────────
const CODE39_MAP: Record<string, string> = {
  '0': '101001101101', '1': '110100101011', '2': '101100101011', '3': '110110010101',
  '4': '101001101011', '5': '110100110101', '6': '101100110101', '7': '101001011011',
  '8': '110100101101', '9': '101100101101', 'A': '110101001011', 'B': '101101001011',
  'C': '110110100101', 'D': '101011001011', 'E': '110101100101', 'F': '101101100101',
  'G': '101010011011', 'H': '110101001101', 'I': '101101001101', 'J': '101011001101',
  'K': '110101010011', 'L': '101101010011', 'M': '110110101001', 'N': '101011010011',
  'O': '110101101001', 'P': '101101101001', 'Q': '101010110011', 'R': '110101011001',
  'S': '101101011001', 'T': '101011011001', 'U': '110010101011', 'V': '100110101011',
  'W': '110011010101', 'X': '100101101011', 'Y': '110010110101', 'Z': '100110110101',
  '-': '100101011011', '.': '110010101101', ' ': '100110101101', '*': '100101101101',
  '$': '100100100101', '/': '100100101001', '+': '100101001001', '%': '101001001001'
};

export function encodeCode39(text: string): string {
  const clean = ('*' + text.toUpperCase().replace(/[^A-Z0-9\-\. \$\/\+\%]/g, '') + '*');
  let bits = '';
  for (let i = 0; i < clean.length; i++) {
    const char = clean[i];
    const pat = CODE39_MAP[char] || CODE39_MAP['*'];
    bits += pat + '0';
  }
  return bits;
}

// ─── 3. EAN-13 ENCODING ────────────────────────────────────────
export function calculateEanCheckDigit(digits12: string): number {
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const d = parseInt(digits12[i] || '0', 10);
    sum += i % 2 === 0 ? d : d * 3;
  }
  return (10 - (sum % 10)) % 10;
}

const EAN_L: Record<string, string> = {
  '0': '0001101', '1': '0011001', '2': '0010011', '3': '0111101', '4': '0100011',
  '5': '0110001', '6': '0101111', '7': '0111011', '8': '0110111', '9': '0001011'
};
const EAN_G: Record<string, string> = {
  '0': '0100111', '1': '0110011', '2': '0011011', '3': '0100001', '4': '0011101',
  '5': '0111001', '6': '0000101', '7': '0010001', '8': '0001001', '9': '0010111'
};
const EAN_R: Record<string, string> = {
  '0': '1110010', '1': '1100110', '2': '1101100', '3': '1000010', '4': '1011100',
  '5': '1001110', '6': '1010000', '7': '1000100', '8': '1001000', '9': '1110100'
};

const EAN_PARITY: Record<string, string> = {
  '0': 'LLLLLL', '1': 'LLGLGG', '2': 'LLGGLG', '3': 'LLGGGL', '4': 'LGLLLG',
  '5': 'LGGLLG', '6': 'LGGGLL', '7': 'LGLGLG', '8': 'LGLGGL', '9': 'LGGLGL'
};

export function encodeEan13(digits: string): { bits: string; fullCode: string } {
  let clean = digits.replace(/[^0-9]/g, '');
  if (clean.length < 12) clean = clean.padEnd(12, '0');
  clean = clean.slice(0, 12);
  const check = calculateEanCheckDigit(clean);
  const fullCode = clean + check;

  const firstDigit = fullCode[0];
  const parity = EAN_PARITY[firstDigit] || 'LLLLLL';

  let bits = '101';
  for (let i = 1; i <= 6; i++) {
    const digit = fullCode[i];
    const useG = parity[i - 1] === 'G';
    bits += useG ? EAN_G[digit] : EAN_L[digit];
  }
  bits += '01010';
  for (let i = 7; i <= 12; i++) {
    const digit = fullCode[i];
    bits += EAN_R[digit];
  }
  bits += '101';

  return { bits, fullCode };
}

export function encodeBarcode(format: BarcodeFormat, text: string): { bits: string; label: string } {
  if (format === 'EAN13' || format === 'ISBN') {
    let payload = text.replace(/[^0-9]/g, '');
    if (format === 'ISBN' && !payload.startsWith('978') && !payload.startsWith('979')) {
      payload = '978' + payload;
    }
    const { bits, fullCode } = encodeEan13(payload);
    return { bits, label: fullCode };
  }

  if (format === 'UPCA') {
    let payload = '0' + text.replace(/[^0-9]/g, '');
    const { bits, fullCode } = encodeEan13(payload);
    return { bits, label: fullCode.slice(1) };
  }

  if (format === 'CODE39') {
    const bits = encodeCode39(text || 'ALEETOOLS');
    return { bits, label: (text || 'ALEETOOLS').toUpperCase() };
  }

  const bits = encodeCode128(text || '12345678');
  return { bits, label: text || '12345678' };
}

export function renderBarcodeToCanvas(
  canvas: HTMLCanvasElement,
  bits: string,
  displayText: string,
  fgColor: string = '#0F0E0C',
  bgColor: string = '#FFFFFF'
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const quietZone = 28;
  const barWidth = 3;
  const barHeight = 110;
  const fontHeight = 28;
  const totalWidth = Math.max(360, bits.length * barWidth + quietZone * 2);
  const totalHeight = barHeight + fontHeight + quietZone;

  canvas.width = totalWidth;
  canvas.height = totalHeight;

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, totalWidth, totalHeight);

  const barsTotalWidth = bits.length * barWidth;
  const startX = Math.floor((totalWidth - barsTotalWidth) / 2);

  ctx.fillStyle = fgColor;
  for (let i = 0; i < bits.length; i++) {
    if (bits[i] === '1') {
      ctx.fillRect(startX + i * barWidth, quietZone / 2, barWidth, barHeight);
    }
  }

  if (displayText) {
    ctx.font = '600 16px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = fgColor;
    ctx.fillText(displayText, totalWidth / 2, totalHeight - 10);
  }
}

// ─── 4. PURE JAVASCRIPT 1D BARCODE DECODER ────────────────────
export function decode1DBarcodeFromCanvas(canvas: HTMLCanvasElement): { text: string; format: string } | null {
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const w = canvas.width;
  const h = canvas.height;
  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;

  // Scan across multiple horizontal scanlines (avoiding top margins and bottom text labels)
  const yRatios = [0.2, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7];

  for (const yRatio of yRatios) {
    const y = Math.floor(h * yRatio);
    let minL = 255;
    let maxL = 0;
    const lums = new Uint8Array(w);

    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      const l = Math.floor((data[idx] + data[idx + 1] + data[idx + 2]) / 3);
      lums[x] = l;
      if (l < minL) minL = l;
      if (l > maxL) maxL = l;
    }

    if (maxL - minL < 20) continue; // Skip blank or low-contrast lines

    const mid = (minL + maxL) / 2;
    const bits = new Uint8Array(w);
    for (let x = 0; x < w; x++) {
      bits[x] = lums[x] < mid ? 1 : 0;
    }

    // Convert bits to run lengths
    const runs: { isBar: boolean; len: number }[] = [];
    let curBar = bits[0] === 1;
    let curLen = 0;

    for (let x = 0; x < w; x++) {
      const isBar = bits[x] === 1;
      if (isBar === curBar) {
        curLen++;
      } else {
        runs.push({ isBar: curBar, len: curLen });
        curBar = isBar;
        curLen = 1;
      }
    }
    runs.push({ isBar: curBar, len: curLen });

    // 1. Try EAN-13 / ISBN / UPC-A Decoder
    const ean = decodeEan13Runs(runs);
    if (ean) {
      const format = ean.startsWith('978') || ean.startsWith('979') ? 'ISBN / EAN-13' : 'EAN-13';
      return { text: ean, format };
    }

    // 2. Try Code 128 Decoder
    const c128 = decodeCode128Runs(runs);
    if (c128) return { text: c128, format: 'CODE 128' };

    // 3. Try Code 39 Decoder
    const c39 = decodeCode39Runs(runs);
    if (c39) return { text: c39, format: 'CODE 39' };
  }

  return null;
}

// ─── EAN-13 / ISBN / UPC-A RUN-LENGTH DECODER ────────────────
const EAN_L_RUNS: Record<string, string> = {
  '0': '3211', '1': '2221', '2': '2122', '3': '1411', '4': '1132',
  '5': '1231', '6': '1114', '7': '1312', '8': '1213', '9': '3112'
};
const EAN_G_RUNS: Record<string, string> = {
  '0': '1123', '1': '1222', '2': '2212', '3': '1141', '4': '2311',
  '5': '1321', '6': '4111', '7': '2131', '8': '3121', '9': '2113'
};
const EAN_R_RUNS: Record<string, string> = {
  '0': '3211', '1': '2221', '2': '2122', '3': '1411', '4': '1132',
  '5': '1231', '6': '1114', '7': '1312', '8': '1213', '9': '3112'
};

const EAN_PARITY_MAP: Record<string, string> = {
  'LLLLLL': '0', 'LLGLGG': '1', 'LLGGLG': '2', 'LLGGGL': '3', 'LGLLLG': '4',
  'LGGLLG': '5', 'LGGGLL': '6', 'LGLGLG': '7', 'LGLGGL': '8', 'LGGLGL': '9'
};

function matchEanDigit(widths: string, table: Record<string, string>): string | null {
  for (const [digit, pat] of Object.entries(table)) {
    let diff = 0;
    for (let i = 0; i < 4; i++) {
      diff += Math.abs(parseInt(widths[i], 10) - parseInt(pat[i], 10));
    }
    if (diff <= 1) return digit;
  }
  return null;
}

function decodeEan13Runs(runs: { isBar: boolean; len: number }[]): string | null {
  if (runs.length < 50) return null;

  // Search for EAN-13 Start Guard (bar-space-bar)
  for (let startIdx = 0; startIdx <= runs.length - 57; startIdx++) {
    if (!runs[startIdx].isBar) continue;

    // Start Guard: bar, space, bar
    let currIdx = startIdx + 3;

    let leftDigits = '';
    let parityPattern = '';

    // Decode 6 Left Digits
    let leftValid = true;
    for (let d = 0; d < 6; d++) {
      if (currIdx + 4 > runs.length) { leftValid = false; break; }
      const widths = getNormalizedWidths(runs, currIdx, 4, 7);
      if (!widths) { leftValid = false; break; }

      const lMatch = matchEanDigit(widths, EAN_L_RUNS);
      const gMatch = matchEanDigit(widths, EAN_G_RUNS);

      if (lMatch !== null) {
        leftDigits += lMatch;
        parityPattern += 'L';
      } else if (gMatch !== null) {
        leftDigits += gMatch;
        parityPattern += 'G';
      } else {
        leftValid = false;
        break;
      }
      currIdx += 4;
    }

    if (!leftValid || parityPattern.length !== 6) continue;

    const firstDigit = EAN_PARITY_MAP[parityPattern];
    if (firstDigit === undefined) continue;

    // Center Guard: space, bar, space, bar, space (5 runs)
    if (currIdx + 5 > runs.length) continue;
    currIdx += 5;

    // Decode 6 Right Digits
    let rightDigits = '';
    let rightValid = true;
    for (let d = 0; d < 6; d++) {
      if (currIdx + 4 > runs.length) { rightValid = false; break; }
      const widths = getNormalizedWidths(runs, currIdx, 4, 7);
      if (!widths) { rightValid = false; break; }

      const rMatch = matchEanDigit(widths, EAN_R_RUNS);
      if (rMatch !== null) {
        rightDigits += rMatch;
      } else {
        rightValid = false;
        break;
      }
      currIdx += 4;
    }

    if (!rightValid || rightDigits.length !== 6) continue;

    // Construct full 13-digit code
    const fullCode = firstDigit + leftDigits + rightDigits;

    // Verify Checksum
    const calcCheck = calculateEanCheckDigit(fullCode.slice(0, 12));
    if (calcCheck === parseInt(fullCode[12], 10)) {
      return fullCode;
    }
  }

  return null;
}

// ─── CODE 39 RUN-LENGTH DECODER ───────────────────────────────
function decodeCode39Runs(runs: { isBar: boolean; len: number }[]): string | null {
  if (runs.length < 19) return null;

  // Code 39 character consists of 9 elements (5 bars, 4 spaces)
  for (let startIdx = 0; startIdx <= runs.length - 19; startIdx++) {
    if (!runs[startIdx].isBar) continue;

    let decoded = '';
    let currIdx = startIdx;

    while (currIdx + 9 <= runs.length) {
      // Normalize 9 elements to wide/narrow binary pattern (3 wide elements, 6 narrow elements)
      let totalLen = 0;
      for (let i = 0; i < 9; i++) totalLen += runs[currIdx + i].len;
      const avgLen = totalLen / 9;

      let bitPattern = '';
      for (let i = 0; i < 9; i++) {
        bitPattern += runs[currIdx + i].len > avgLen ? '11' : '1';
      }

      // Match against Code 39 map
      let matchedChar: string | null = null;
      for (const [char, pat] of Object.entries(CODE39_MAP)) {
        if (pat === bitPattern) {
          matchedChar = char;
          break;
        }
      }

      if (!matchedChar) break;
      decoded += matchedChar;
      currIdx += 10; // 9 elements + 1 inter-character space
    }

    if (decoded.startsWith('*') && decoded.endsWith('*') && decoded.length >= 3) {
      return decoded.slice(1, -1);
    }
  }

  return null;
}

// Code 128 Pattern Run Length Decoder
function decodeCode128Runs(runs: { isBar: boolean; len: number }[]): string | null {
  if (runs.length < 10) return null;

  for (let startIdx = 0; startIdx < runs.length - 8; startIdx++) {
    if (!runs[startIdx].isBar) continue; // Start pattern must begin with a black bar

    let decodedChars = '';
    let currIdx = startIdx;
    let isValid = false;

    // First symbol must match Start A (103), Start B (104), or Start C (105)
    const startPattern = getNormalizedWidths(runs, currIdx, 6, 11);
    if (!startPattern) continue;

    const startMatch = matchCode128Pattern(startPattern);
    if (startMatch !== 104 && startMatch !== 103 && startMatch !== 105) continue;

    currIdx += 6;

    // Decode subsequent 6-element symbols
    while (currIdx < runs.length) {
      // Check if current 7 elements match Stop Code (index 106: "2331112", 13 modules total)
      if (currIdx + 7 <= runs.length) {
        const stopWidths = getNormalizedWidths(runs, currIdx, 7, 13);
        if (stopWidths && matchCode128Pattern(stopWidths) === 106) {
          isValid = true;
          break;
        }
      }

      if (currIdx + 6 > runs.length) break;
      const widths = getNormalizedWidths(runs, currIdx, 6, 11);
      if (!widths) break;

      const codeVal = matchCode128Pattern(widths);
      if (codeVal >= 0 && codeVal <= 95) {
        decodedChars += String.fromCharCode(codeVal + 32);
      } else {
        break;
      }

      currIdx += 6;
    }

    if (isValid && decodedChars.length > 0) {
      // Return decoded text (strip trailing check digit character)
      return decodedChars.slice(0, decodedChars.length - 1);
    }
  }

  return null;
}

function getNormalizedWidths(
  runs: { isBar: boolean; len: number }[],
  start: number,
  count: number,
  targetModules: number
): string | null {
  if (start + count > runs.length) return null;
  let totalWidth = 0;
  for (let i = 0; i < count; i++) {
    totalWidth += runs[start + i].len;
  }
  if (totalWidth === 0) return null;

  let pattern = '';
  for (let i = 0; i < count; i++) {
    const norm = Math.max(1, Math.round((runs[start + i].len * targetModules) / totalWidth));
    pattern += norm.toString();
  }
  return pattern;
}

function matchCode128Pattern(widths: string): number {
  for (let i = 0; i < CODE128_PATTERNS.length; i++) {
    const pat = CODE128_PATTERNS[i];
    if (pat.length !== widths.length) continue;
    let diff = 0;
    for (let j = 0; j < pat.length; j++) {
      diff += Math.abs(parseInt(pat[j], 10) - parseInt(widths[j], 10));
    }
    if (diff <= 1) return i;
  }
  return -1;
}
