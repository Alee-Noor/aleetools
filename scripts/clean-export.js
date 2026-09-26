const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '..', 'out');

if (!fs.existsSync(outDir)) {
  console.log('[clean-export] No out directory found, skipping.');
  process.exit(0);
}

function getDirSize(dir) {
  let size = 0;
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) {
      size += getDirSize(full);
    } else {
      size += fs.statSync(full).size;
    }
  }
  return size;
}

const initialSize = getDirSize(outDir);
console.log(`[clean-export] Initial export size: ${(initialSize / (1024 * 1024)).toFixed(2)} MB (${initialSize} bytes)`);

let removedCount = 0;
let removedBytes = 0;

function cleanInternalNextFiles(dir) {
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, item.name);
    
    // Check if this is an internal Next.js flight directory or file
    const isInternal =
      item.name.startsWith('__next.') ||
      item.name === '_full.txt' ||
      item.name === '_tree.txt' ||
      item.name === '__PAGE__.txt';

    if (isInternal) {
      if (item.isDirectory()) {
        const dirSize = getDirSize(full);
        fs.rmSync(full, { recursive: true, force: true });
        removedCount++;
        removedBytes += dirSize;
      } else {
        const fileSize = fs.statSync(full).size;
        fs.unlinkSync(full);
        removedCount++;
        removedBytes += fileSize;
      }
      continue;
    }

    if (item.isDirectory()) {
      cleanInternalNextFiles(full);
      // If directory is now empty, remove it
      try {
        if (fs.readdirSync(full).length === 0) {
          fs.rmdirSync(full);
        }
      } catch {}
    }
  }
}

cleanInternalNextFiles(outDir);

let postCleanSize = getDirSize(outDir);
console.log(`[clean-export] Removed ${removedCount} internal __next files/directories (${(removedBytes / (1024 * 1024)).toFixed(2)} MB saved)`);
console.log(`[clean-export] Post-cleanup export size: ${(postCleanSize / (1024 * 1024)).toFixed(2)} MB (${postCleanSize} bytes)`);

// Azure Static Web Apps Free / Student limit: 262,144,000 bytes (250 MB)
const AZURE_MAX_BYTES = 250 * 1024 * 1024; // 262,144,000 bytes
const SAFE_TARGET_BYTES = 220 * 1024 * 1024; // 220 MB target

if (postCleanSize > SAFE_TARGET_BYTES) {
  console.log(`[clean-export] Size (${(postCleanSize / (1024 * 1024)).toFixed(2)} MB) still exceeds safe limit (220 MB). Pruning extra RSC payload .txt files...`);
  
  let rscRemoved = 0;
  function removeRscPayloads(dir) {
    for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, item.name);
      if (item.isDirectory()) {
        removeRscPayloads(full);
      } else if (item.name.endsWith('.txt') && item.name !== 'robots.txt') {
        fs.unlinkSync(full);
        rscRemoved++;
      }
    }
  }
  
  removeRscPayloads(outDir);
  postCleanSize = getDirSize(outDir);
  console.log(`[clean-export] Pruned ${rscRemoved} RSC .txt files. Final size: ${(postCleanSize / (1024 * 1024)).toFixed(2)} MB (${postCleanSize} bytes)`);
}

if (postCleanSize <= AZURE_MAX_BYTES) {
  console.log(`[clean-export] SUCCESS: Output size is ${(postCleanSize / (1024 * 1024)).toFixed(2)} MB, well within Azure 250 MB student/free plan limit!`);
} else {
  console.warn(`[clean-export] WARNING: Output size still exceeds Azure limit!`);
}
