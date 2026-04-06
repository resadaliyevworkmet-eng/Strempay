import React, { useState, useRef } from 'react';
import { Upload, X, FileAudio, FileImage, CheckCircle2, AlertCircle, Loader2, Camera } from 'lucide-react';
import { cn } from '../lib/utils';
import toast from 'react-hot-toast';

interface FileUploadProps {
  onUploadSuccess: (url: string) => void;
  accept: string;
  label: string;
  maxSize?: number; // in MB
  type: 'audio' | 'image';
  currentUrl?: string;
  variant?: 'default' | 'minimal';
}

export default function FileUpload({ onUploadSuccess, accept, label, maxSize = 10, type, currentUrl, variant = 'default' }: FileUploadProps) {
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

  if (variant === 'minimal') {
    return (
      <div className="relative">
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className={cn(
            "w-12 h-12 rounded-2xl shadow-xl transition-all active:scale-90 flex items-center justify-center group/btn overflow-hidden relative",
            "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-500/40",
            isUploading && "opacity-50 cursor-not-allowed"
          )}
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity" />
          {isUploading ? (
            <Loader2 className="w-5 h-5 animate-spin relative z-10" />
          ) : (
            <Camera size={20} className="relative z-10 group-hover/btn:scale-110 transition-transform" />
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <label className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] ml-1">{label}</label>
      
      <div
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "relative border-2 border-dashed rounded-[2rem] p-8 transition-all cursor-pointer group flex flex-col items-center justify-center gap-4 min-h-[160px]",
          dragActive 
            ? "border-indigo-500 bg-indigo-500/5 scale-[1.02]" 
            : "border-neutral-200 dark:border-neutral-800 hover:border-indigo-500/40 hover:bg-neutral-50 dark:hover:bg-neutral-900/40",
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
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
            </div>
            <p className="text-xs font-black text-indigo-500 uppercase tracking-widest">Yüklənir...</p>
          </div>
        ) : currentUrl ? (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shadow-inner">
              <CheckCircle2 size={32} />
            </div>
            <div className="text-center">
              <p className="text-sm font-black text-emerald-500 uppercase tracking-widest">Fayl Seçilib</p>
              <p className="text-[10px] text-neutral-400 mt-1 font-bold">Dəyişmək üçün klikləyin</p>
            </div>
          </div>
        ) : (
          <>
            <div className="w-16 h-16 bg-indigo-500/5 rounded-[1.5rem] flex items-center justify-center text-indigo-500 group-hover:scale-110 group-hover:bg-indigo-500/10 transition-all duration-500 shadow-sm">
              {type === 'audio' ? <FileAudio size={28} /> : <FileImage size={28} />}
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-black tracking-tight group-hover:text-indigo-500 transition-colors">Klikləyin və ya sürükləyin</p>
              <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">
                {accept.replace(/\./g, '').split(',').join(' / ')} • Maks. {maxSize}MB
              </p>
            </div>
          </>
        )}
      </div>

      {currentUrl && (
        <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-900/50 rounded-2xl border border-neutral-200/50 dark:border-neutral-800/50 group/item hover:border-indigo-500/30 transition-colors">
          <div className="flex items-center gap-4 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
              {type === 'audio' ? <FileAudio size={14} className="text-indigo-500" /> : <FileImage size={14} className="text-indigo-500" />}
            </div>
            <span className="text-[10px] font-bold truncate opacity-40 group-hover/item:opacity-100 transition-opacity">{currentUrl}</span>
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); onUploadSuccess(''); }}
            className="w-8 h-8 flex items-center justify-center hover:bg-red-500/10 rounded-lg transition-all text-neutral-400 hover:text-red-500 active:scale-90"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
