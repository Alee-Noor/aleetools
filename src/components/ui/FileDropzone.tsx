'use client';

import { useState, useRef, type DragEvent, type ChangeEvent } from 'react';
import { UploadCloud, ShieldCheck, AlertCircle } from 'lucide-react';

interface FileDropzoneProps {
  accept?: string;
  multiple?: boolean;
  maxSizeBytes?: number; // default 50MB
  title?: string;
  subtitle?: string;
  onFilesSelected: (files: File[]) => void;
  className?: string;
}

export function FileDropzone({
  accept = 'image/*',
  multiple = false,
  maxSizeBytes = 50 * 1024 * 1024,
  title = 'Drop your file here, or browse',
  subtitle = 'Supports common formats. Max 50MB per file.',
  onFilesSelected,
  className = '',
}: FileDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateAndPass = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setErrorMsg(null);

    const validFiles: File[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      if (file.size > maxSizeBytes) {
        const sizeMb = Math.round(maxSizeBytes / (1024 * 1024));
        setErrorMsg(`"${file.name}" is too large. Please select a file under ${sizeMb}MB.`);
        return;
      }
      validFiles.push(file);
      if (!multiple) break;
    }

    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    validateAndPass(e.dataTransfer.files);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    validateAndPass(e.target.files);
    // reset input so selecting the same file triggers change
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className={`w-full ${className}`}>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
        className={`dropzone relative flex flex-col items-center justify-center p-8 sm:p-12 transition-all cursor-pointer select-none ${
          isDragOver ? 'drag-over scale-[0.99]' : ''
        }`}
        style={{
          borderRadius: 'var(--radius-lg)',
          border: isDragOver
            ? '2px dashed var(--color-accent-primary)'
            : '2px dashed var(--border)',
          background: isDragOver
            ? 'var(--color-accent-primary-soft)'
            : 'var(--surface)',
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          className="hidden"
        />

        <div
          className="mb-4 flex h-16 w-16 items-center justify-center rounded-[14px]"
          style={{
            background: 'var(--color-accent-primary-soft)',
            color: 'var(--color-accent-primary)',
          }}
        >
          <UploadCloud size={32} />
        </div>

        <h3 className="text-lg font-semibold mb-1" style={{ color: 'var(--ink)' }}>
          {title}
        </h3>
        <p className="text-sm text-stone-500 dark:text-stone-400 mb-4 max-w-sm text-center">
          {subtitle}
        </p>

        {/* Feature badge */}
        <div
          className="inline-flex items-center gap-1.5 px-3 py-1 text-xs rounded-[10px] font-medium"
          style={{
            background: 'rgba(61, 107, 92, 0.1)',
            color: 'var(--color-accent-primary)',
          }}
        >
          <ShieldCheck size={14} />
          <span>Instant Processing — Fast, Private & Secure</span>
        </div>
      </div>

      {errorMsg && (
        <div className="mt-3 flex items-center gap-2 p-3 rounded-[10px] text-xs font-medium text-red-700 bg-red-50 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-900">
          <AlertCircle size={15} className="shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}
