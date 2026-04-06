import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { Save, RefreshCcw, UserCircle, Settings as SettingsIcon, Globe, Instagram, Youtube, Music2, Camera, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { toast } from 'react-hot-toast';
import FileUpload from './FileUpload';

export default function Profile() {
  const { state, updateProfile, resetData } = useApp();
  const isDark = state.profile.theme === 'dark';
  const [profile, setProfile] = useState(state.profile);
  const [isResetting, setIsResetting] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');

  const isDirty = JSON.stringify(profile) !== JSON.stringify(state.profile);

  React.useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(profile);
    setSaveStatus('saved');
    toast.success('Profil yeniləndi');
    setTimeout(() => setSaveStatus('idle'), 3000);
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-neutral-900 to-neutral-500 dark:from-white dark:to-neutral-500">
            Profil Məlumatları
          </h1>
          <p className="text-neutral-500 mt-2 font-medium">Dəstək səhifənizdə görünən əsas məlumatlar.</p>
        </div>
        <button
          onClick={handleSave}
          className="px-10 py-4 bg-indigo-600 text-white rounded-[1.25rem] font-black text-sm hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-indigo-500/20 active:scale-95"
        >
          <Save size={20} />
          {saveStatus === 'saved' ? 'Yadda Saxlanıldı!' : 'Yadda Saxla'}
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8">
          <form onSubmit={handleSave} className={cn(
            "p-10 rounded-[2.5rem] border shadow-sm space-y-10 transition-all duration-500",
            isDark ? "bg-neutral-900/40 border-neutral-800/50 backdrop-blur-xl text-white" : "bg-white border-neutral-200/50 text-neutral-900"
          )}>
            <div className={cn("flex flex-col md:flex-row items-center gap-10 pb-10 border-b", isDark ? "border-neutral-800/50" : "border-neutral-100")}>
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
                <img
                  src={profile.avatarUrl || null}
                  alt="Preview"
                  className={cn("relative w-40 h-40 rounded-full border-4 shadow-2xl object-cover", isDark ? "border-neutral-800" : "border-white")}
                  referrerPolicy="no-referrer"
                />
                <div className="absolute bottom-2 right-2 z-20">
                  <FileUpload 
                    type="image"
                    accept=".png,.jpg,.jpeg"
                    label=""
                    variant="minimal"
                    currentUrl={profile.avatarUrl}
                    onUploadSuccess={(url) => setProfile({ ...profile, avatarUrl: url })}
                  />
                </div>
              </div>
              <div className="flex-1 space-y-2">
                <h2 className="text-2xl font-display font-bold tracking-tight">Profil Şəkli</h2>
                <p className="text-sm text-neutral-500 font-medium">Yüksək keyfiyyətli şəkil yükləməyiniz tövsiyə olunur.</p>
              </div>
            </div>

            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className={cn("text-xs font-black uppercase tracking-widest opacity-60", isDark ? "text-neutral-400" : "text-neutral-500")}>Görünən Ad</label>
                  <input
                    type="text"
                    value={profile.displayName || ''}
                    onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                    className={cn(
                      "w-full px-6 py-4 border rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium",
                      isDark ? "bg-neutral-800/50 border-neutral-700 text-white" : "bg-neutral-50 border-neutral-200 text-neutral-900"
                    )}
                  />
                </div>
                <div className="space-y-2 opacity-60">
                  <label className={cn("text-xs font-black uppercase tracking-widest opacity-60", isDark ? "text-neutral-400" : "text-neutral-500")}>İstifadəçi Adı</label>
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-neutral-400 font-bold">@</span>
                    <input
                      type="text"
                      disabled
                      value={profile.username}
                      className={cn(
                        "w-full pl-10 pr-6 py-4 border rounded-2xl outline-none cursor-not-allowed transition-all font-bold",
                        isDark ? "bg-neutral-900/50 border-neutral-800 text-neutral-500" : "bg-neutral-100 border-neutral-200 text-neutral-400"
                      )}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className={cn("text-xs font-black uppercase tracking-widest opacity-60", isDark ? "text-neutral-400" : "text-neutral-500")}>Haqqında (Bio)</label>
                <textarea
                  value={profile.bio || ''}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  rows={4}
                  placeholder="Özünüz haqqında qısa məlumat..."
                  className={cn(
                    "w-full px-6 py-4 border rounded-[1.5rem] outline-none focus:ring-2 focus:ring-indigo-500 resize-none transition-all font-medium leading-relaxed",
                    isDark ? "bg-neutral-800/50 border-neutral-700 text-white" : "bg-neutral-50 border-neutral-200 text-neutral-900"
                  )}
                />
              </div>

              <div className="space-y-6">
                <h3 className={cn("font-display font-bold text-xl flex items-center gap-3", isDark ? "text-neutral-200" : "text-neutral-800")}>
                  <div className="p-2 bg-indigo-500/10 rounded-lg">
                    <Globe size={20} className="text-indigo-500" />
                  </div>
                  Sosial Şəbəkələr
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { icon: Instagram, key: 'instagram', label: 'Instagram' },
                    { icon: Youtube, key: 'youtube', label: 'YouTube' },
                    { icon: Music2, key: 'tiktok', label: 'TikTok' }
                  ].map((social) => (
                    <div key={social.key} className="relative group">
                      <social.icon className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                      <input
                        type="text"
                        value={profile.socials[social.key as keyof typeof profile.socials] || ''}
                        onChange={(e) => setProfile({ ...profile, socials: { ...profile.socials, [social.key]: e.target.value } })}
                        placeholder={social.label}
                        className={cn(
                          "w-full pl-14 pr-6 py-4 border rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-bold transition-all",
                          isDark ? "bg-neutral-800/50 border-neutral-700 text-white" : "bg-neutral-50 border-neutral-200 text-neutral-900"
                        )}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <div className={cn(
            "p-8 rounded-[2.5rem] border transition-all duration-500",
            isDark ? "bg-red-950/10 border-red-900/20" : "bg-red-50 border-red-100"
          )}>
            <h3 className={cn("font-display font-bold text-xl mb-3", isDark ? "text-red-400" : "text-red-900")}>Təhlükəli Zona</h3>
            <p className={cn("text-sm font-medium mb-6 leading-relaxed opacity-70", isDark ? "text-red-400/70" : "text-red-700")}>Bütün dəstək tarixçəsini və balansı sıfırlayın. Bu əməliyyat geri qaytarıla bilməz.</p>
            
            {isResetting ? (
              <div className="space-y-3">
                <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.2em] text-center">Əminsiniz?</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      resetData();
                      setIsResetting(false);
                    }}
                    className="flex-1 py-4 bg-red-600 text-white rounded-2xl text-xs font-black hover:bg-red-700 transition-all active:scale-95 shadow-lg shadow-red-500/20"
                  >
                    Bəli, Sil
                  </button>
                  <button
                    onClick={() => setIsResetting(false)}
                    className={cn(
                      "flex-1 py-4 border rounded-2xl text-xs font-black transition-all active:scale-95",
                      isDark ? "bg-neutral-800 border-neutral-700 text-neutral-400 hover:bg-neutral-700" : "bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                    )}
                  >
                    Xeyr
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsResetting(true)}
                className={cn(
                  "w-full py-4 border rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-2 active:scale-95",
                  isDark ? "bg-red-900/20 text-red-400 border-red-900/30 hover:bg-red-900/40" : "bg-white text-red-600 border-red-200 hover:bg-red-100"
                )}
              >
                <RefreshCcw size={18} />
                Məlumatları Sıfırla
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
