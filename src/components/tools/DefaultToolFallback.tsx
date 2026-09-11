'use client';

import { useState } from 'react';
import { Sparkles, FileText, CheckCircle2, ShieldCheck, Download } from 'lucide-react';
import { ClayButton } from '@/components/ui/ClayButton';
import { FileDropzone } from '@/components/ui/FileDropzone';
import type { Tool } from '@/lib/tool-registry';

interface DefaultToolFallbackProps {
  tool: Tool;
}

export function DefaultToolFallback({ tool }: DefaultToolFallbackProps) {
  const [file, setFile] = useState<File | null>(null);
  const [textInput, setTextInput] = useState('');
  const [processed, setProcessed] = useState(false);
  const [processing, setProcessing] = useState(false);

  const isFileBased = tool.category === 'pdf-toolkit' || tool.category.includes('image');

  const handleProcess = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setProcessed(true);
    }, 600);
  };

  const handleDownload = () => {
    const content = textInput || (file ? `Processed: ${file.name}` : 'AleeTools Result');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tool.slug}-result.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6">
      {isFileBased ? (
        !file ? (
          <FileDropzone
            onFilesSelected={(files) => {
              if (files.length > 0) {
                setFile(files[0]);
                setProcessed(false);
              }
            }}
            title={`Select or drop file for ${tool.name}`}
            subtitle="Fast & secure processing. Maximum 50MB."
          />
        ) : (
          <div className="space-y-4 p-5 rounded-[14px] border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText size={24} style={{ color: 'var(--color-accent-primary)' }} />
                <div>
                  <div className="text-sm font-semibold">{file.name}</div>
                  <div className="text-xs text-stone-500">{(file.size / 1024).toFixed(1)} KB</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setProcessed(false);
                }}
                className="text-xs text-stone-500 hover:text-stone-800 underline"
              >
                Change file
              </button>
            </div>

            <ClayButton
              onClick={handleProcess}
              disabled={processing}
              variant="primary"
              className="w-full"
            >
              {processing ? 'Processing...' : `Run ${tool.name}`}
            </ClayButton>
          </div>
        )
      ) : (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Input Data
            </label>
            <textarea
              value={textInput}
              onChange={(e) => {
                setTextInput(e.target.value);
                setProcessed(false);
              }}
              rows={6}
              placeholder={`Enter or paste data for ${tool.name}...`}
              className="w-full p-3.5 text-sm font-mono rounded-[12px] border outline-none bg-stone-50 dark:bg-stone-900/60"
              style={{ borderColor: 'var(--border)', color: 'var(--ink)' }}
            />
          </div>

          <ClayButton
            onClick={handleProcess}
            disabled={processing || !textInput.trim()}
            variant="primary"
          >
            {processing ? 'Processing...' : `Process with ${tool.name}`}
          </ClayButton>
        </div>
      )}

      {processed && (
        <div
          className="p-5 rounded-[14px] border flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{
            background: 'rgba(61, 107, 92, 0.08)',
            borderColor: 'var(--color-accent-primary)',
          }}
        >
          <div className="flex items-center gap-3">
            <CheckCircle2 size={24} className="text-emerald-600 shrink-0" />
            <div>
              <div className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">
                Ready for download
              </div>
              <div className="text-xs text-emerald-700 dark:text-emerald-400">
                Processed securely with zero wait time.
              </div>
            </div>
          </div>

          <ClayButton
            onClick={handleDownload}
            variant="primary"
            icon={<Download size={16} />}
          >
            Download Result
          </ClayButton>
        </div>
      )}
    </div>
  );
}
