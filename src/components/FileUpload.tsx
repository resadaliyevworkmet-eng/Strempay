import React, { useState, useRef } from 'react';
import { Upload, X, FileAudio, FileImage, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import toast from 'react-hot-toast';

interface FileUploadProps {
  onUploadSuccess: (url: string) => void;
  accept: string;
  label: string;
  maxSize?: number; // in MB
  type: 'audio' | 'image';
  currentUrl?: string;
}

export default function FileUpload({ onUploadSuccess, accept, label, maxSize = 10, type, currentUrl }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (file.size > maxSize * 1024 * 1024) {
      toast.error(`Fayl çox böyükdür. Maksimum ${maxSize}MB.`);
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Yükləmə uğursuz oldu');

      const data = await response.json();
      onUploadSuccess(data.url);
      toast.success('Fayl uğurla yükləndi');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Fayl yüklənərkən xəta baş verdi');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-bold text-neutral-500 uppercase tracking-wider">{label}</label>
      
      <div
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "relative border-2 border-dashed rounded-2xl p-6 transition-all cursor-pointer group flex flex-col items-center justify-center gap-3",
          dragActive ? "border-indigo-500 bg-indigo-500/5" : "border-neutral-200 dark:border-neutral-800 hover:border-indigo-500/50 hover:bg-neutral-50 dark:hover:bg-neutral-900/50",
          isUploading && "pointer-events-none opacity-60"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="hidden"
        />

        {isUploading ? (
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        ) : currentUrl ? (
          <div className="flex items-center gap-3 text-emerald-500">
            <CheckCircle2 size={24} />
            <span className="text-sm font-bold">Fayl seçilib</span>
          </div>
        ) : (
          <>
            <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
              {type === 'audio' ? <FileAudio size={24} /> : <FileImage size={24} />}
            </div>
            <div className="text-center">
              <p className="text-sm font-bold">Klikləyin və ya sürükləyin</p>
              <p className="text-xs text-neutral-500 mt-1">{accept.replace(/\./g, '').toUpperCase()} (Maks. {maxSize}MB)</p>
            </div>
          </>
        )}
      </div>

      {currentUrl && (
        <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-3 overflow-hidden">
            {type === 'audio' ? <FileAudio size={16} className="text-indigo-500 shrink-0" /> : <FileImage size={16} className="text-indigo-500 shrink-0" />}
            <span className="text-xs font-medium truncate opacity-60">{currentUrl}</span>
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); onUploadSuccess(''); }}
            className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-lg transition-colors text-neutral-400 hover:text-rose-500"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
