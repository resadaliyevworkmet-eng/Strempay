import React, { useState, useEffect } from 'react';
import { useApp } from '../AppContext';
import { Save, Bell, Target, ArrowUpRight, Heart, Play, ShieldAlert, Volume2, Plus, X, Music, Image as ImageIcon, AlertTriangle } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'react-hot-toast';
import FileUpload from './FileUpload';

export default function StreamSettings() {
  const { state, updateProfile, addDonation } = useApp();
  const isDark = state.profile.theme === 'dark';
  const [activeTab, setActiveTab] = useState<'alerts' | 'goal' | 'moderation'>('alerts');
  const [profile, setProfile] = useState(state.profile);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');
  const [copiedAlert, setCopiedAlert] = useState(false);
  const [copiedGoal, setCopiedGoal] = useState(false);
  const [newWord, setNewWord] = useState('');

  const isDirty = JSON.stringify(profile) !== JSON.stringify(state.profile);

  useEffect(() => {
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
    toast.success('Dəyişikliklər yadda saxlanıldı');
    setTimeout(() => setSaveStatus('idle'), 3000);
  };

  const testAlert = () => {
    const testDonation = {
      sender: 'Test Dəstəkçi',
      amount: 50,
      message: 'Bu bir test mesajıdır! Yayımın uğurlu keçsin!',
    };
    window.dispatchEvent(new CustomEvent('new-donation', { detail: { ...testDonation, id: 'test', timestamp: Date.now() } }));
  };

  const copyLink = (type: 'alert' | 'goal') => {
    const url = type === 'alert' 
      ? `${window.location.origin}/overlay/${state.profile.username}?token=${state.profile.obsToken}`
      : `${window.location.origin}/goal/${state.profile.username}?token=${state.profile.obsToken}`;
    
    navigator.clipboard.writeText(url);
    toast.success('Link kopyalandı');
    if (type === 'alert') {
      setCopiedAlert(true);
      setTimeout(() => setCopiedAlert(false), 2000);
    } else {
      setCopiedGoal(true);
      setTimeout(() => setCopiedGoal(false), 2000);
    }
  };

  const addModerationWord = () => {
    if (newWord && !profile.moderationWords.includes(newWord)) {
      setProfile({ ...profile, moderationWords: [...profile.moderationWords, newWord] });
      setNewWord('');
    }
  };

  const removeModerationWord = (word: string) => {
    setProfile({ ...profile, moderationWords: profile.moderationWords.filter(w => w !== word) });
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-neutral-900 to-neutral-500 dark:from-white dark:to-neutral-500">
            Yayım Ayarları
          </h1>
          <p className="text-neutral-500 mt-2 font-medium">OBS alertləri, hədəf barı və moderasiyanı tənzimləyin.</p>
        </div>
        <div className="flex items-center gap-4">
          <AnimatePresence>
            {isDirty && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold",
                  isDark ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "bg-amber-50 text-amber-600 border border-amber-100"
                )}
              >
                <AlertTriangle size={14} />
                Yadda saxlanılmamış dəyişikliklər var
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={handleSave}
            className="px-10 py-4 bg-indigo-600 text-white rounded-[1.25rem] font-black text-sm hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-indigo-500/20 active:scale-95"
          >
            <Save size={20} />
            {saveStatus === 'saved' ? 'Yadda Saxlanıldı!' : 'Yadda Saxla'}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          {/* Tabs */}
          <div className={cn("flex gap-2 p-1.5 rounded-[1.5rem] w-fit border", isDark ? "bg-neutral-900/50 border-neutral-800/50 backdrop-blur-md" : "bg-white border-neutral-200 shadow-sm")}>
            {[
              { id: 'alerts', label: 'Alert Dizaynı', icon: Bell },
              { id: 'goal', label: 'Dəstək Hədəfi', icon: Target },
              { id: 'moderation', label: 'Moderasiya', icon: ShieldAlert },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black transition-all relative",
                  activeTab === tab.id 
                    ? (isDark ? "text-indigo-400" : "text-indigo-600") 
                    : "text-neutral-500 hover:text-neutral-700"
                )}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="active-tab-bg"
                    className={cn("absolute inset-0 rounded-xl shadow-sm", isDark ? "bg-neutral-800" : "bg-white")}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <tab.icon size={18} className="relative z-10" />
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'alerts' && (
              <motion.div
                key="alerts"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-8"
              >
                <div className={cn(
                  "p-10 rounded-[2.5rem] border shadow-sm space-y-10 transition-all duration-500",
                  isDark ? "bg-neutral-900/40 border-neutral-800/50 backdrop-blur-xl" : "bg-white border-neutral-200/50"
                )}>
                  <div className="flex items-center justify-between">
                    <h3 className="font-display font-bold text-2xl">Alert Mesajı Ayarları</h3>
                    <button 
                      onClick={testAlert}
                      className="flex items-center gap-2 px-6 py-3 bg-indigo-500/10 text-indigo-500 rounded-2xl text-sm font-black hover:bg-indigo-500/20 transition-all active:scale-95"
                    >
                      <Play size={18} fill="currentColor" />
                      Test Alert
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className={cn("text-xs font-black uppercase tracking-widest opacity-60", isDark ? "text-neutral-400" : "text-neutral-500")}>Görünmə Müddəti (saniyə)</label>
                      <input
                        type="number"
                        value={profile.alertSettings.duration ?? 0}
                        onChange={(e) => setProfile({ ...profile, alertSettings: { ...profile.alertSettings, duration: Number(e.target.value) } })}
                        className={cn(
                          "w-full px-6 py-4 border rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium",
                          isDark ? "bg-neutral-800/50 border-neutral-700 text-white" : "bg-neutral-50 border-neutral-200 text-neutral-900"
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className={cn("text-xs font-black uppercase tracking-widest opacity-60", isDark ? "text-neutral-400" : "text-neutral-500")}>Şəkil Ölçüsü (px)</label>
                      <input
                        type="number"
                        value={profile.alertSettings.imageSize ?? 0}
                        onChange={(e) => setProfile({ ...profile, alertSettings: { ...profile.alertSettings, imageSize: Number(e.target.value) } })}
                        className={cn(
                          "w-full px-6 py-4 border rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium",
                          isDark ? "bg-neutral-800/50 border-neutral-700 text-white" : "bg-neutral-50 border-neutral-200 text-neutral-900"
                        )}
                      />
                    </div>
                  </div>

                  {/* Preview Section */}
                  <div className="space-y-4">
                    <p className={cn("text-xs font-black uppercase tracking-widest opacity-60", isDark ? "text-neutral-400" : "text-neutral-500")}>Alert Ön Baxış</p>
                    <div className="bg-neutral-950 rounded-[2rem] p-10 flex flex-col items-center text-center relative overflow-hidden min-h-[350px] justify-center shadow-2xl">
                      <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent" />
                      {profile.alertSettings.imageUrl ? (
                        <img 
                          src={profile.alertSettings.imageUrl} 
                          alt="Alert" 
                          className="mb-6 relative z-10 object-contain shadow-2xl"
                          style={{ width: profile.alertSettings.imageSize, height: profile.alertSettings.imageSize }}
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div 
                          className="bg-indigo-600 rounded-full flex items-center justify-center text-white mb-6 shadow-2xl shadow-indigo-500/40 relative z-10"
                          style={{ width: profile.alertSettings.imageSize / 2, height: profile.alertSettings.imageSize / 2 }}
                        >
                          <Heart size={profile.alertSettings.imageSize * 0.25} fill="currentColor" />
                        </div>
                      )}
                      <h2 
                        className="relative z-10 font-display"
                        style={{ 
                          fontSize: profile.alertSettings.senderFont.size / 2, 
                          color: profile.alertSettings.senderFont.color, 
                          fontWeight: profile.alertSettings.senderFont.style === 'bold' ? '900' : 'normal',
                          fontStyle: profile.alertSettings.senderFont.style === 'italic' ? 'italic' : 'normal'
                        }}
                      >
                        Göndərən Adı
                      </h2>
                      <p 
                        className="relative z-10 font-display"
                        style={{ 
                          fontSize: profile.alertSettings.amountFont.size / 2, 
                          color: profile.alertSettings.amountFont.color, 
                          fontWeight: profile.alertSettings.amountFont.style === 'bold' ? '900' : 'normal'
                        }}
                      >
                        50 AZN dəstək oldu!
                      </p>
                      <div className="bg-white/5 backdrop-blur-md p-6 rounded-3xl mt-6 max-w-xs border border-white/10 relative z-10">
                        <p 
                          style={{ 
                            fontSize: profile.alertSettings.messageFont.size / 2, 
                            color: profile.alertSettings.messageFont.color,
                            fontStyle: profile.alertSettings.messageFont.style === 'italic' ? 'italic' : 'normal'
                          }}
                        >
                          "Bu bir test mesajıdır!"
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Detailed Font Settings */}
                  <div className="space-y-8">
                    {/* Sound & Media Settings */}
                    <div className={cn("p-8 rounded-[2rem] border space-y-8", isDark ? "bg-neutral-800/50 border-neutral-700" : "bg-neutral-50/50 border-neutral-100")}>
                      <h4 className={cn("font-display font-bold text-lg flex items-center gap-3", isDark ? "text-neutral-200" : "text-neutral-800")}>
                        <div className="p-2 bg-indigo-500/10 rounded-lg">
                          <Music size={20} className="text-indigo-500" />
                        </div>
                        Media Ayarları
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FileUpload 
                          type="audio"
                          accept=".mp3,.wav,.ogg"
                          label="Alert Səsi (MP3)"
                          currentUrl={profile.alertSettings.soundUrl}
                          onUploadSuccess={(url) => setProfile({ ...profile, alertSettings: { ...profile.alertSettings, soundUrl: url } })}
                        />
                        <FileUpload 
                          type="image"
                          accept=".png,.jpg,.jpeg,.gif"
                          label="Alert Şəkli (GIF/PNG)"
                          currentUrl={profile.alertSettings.imageUrl}
                          onUploadSuccess={(url) => setProfile({ ...profile, alertSettings: { ...profile.alertSettings, imageUrl: url } })}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-neutral-400">Səs Səviyyəsi ({Math.round(profile.alertSettings.soundVolume * 100)}%)</label>
                        <div className="pt-4">
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={profile.alertSettings.soundVolume ?? 0}
                            onChange={(e) => setProfile({ ...profile, alertSettings: { ...profile.alertSettings, soundVolume: Number(e.target.value) } })}
                            className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Font Sections */}
                    {[
                      { title: 'Göndərən Adı', key: 'senderFont' },
                      { title: 'Məbləğ Mətni', key: 'amountFont' },
                      { title: 'Mesaj Mətni', key: 'messageFont' }
                    ].map((section) => (
                      <div key={section.key} className={cn("p-8 rounded-[2rem] border space-y-6", isDark ? "bg-neutral-800/50 border-neutral-700" : "bg-neutral-50/50 border-neutral-100")}>
                        <h4 className={cn("font-display font-bold text-lg", isDark ? "text-neutral-200" : "text-neutral-800")}>{section.title}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-neutral-400">Ölçü (px)</label>
                            <input
                              type="number"
                              value={(profile.alertSettings as any)[section.key].size ?? 0}
                              onChange={(e) => setProfile({ ...profile, alertSettings: { ...profile.alertSettings, [section.key]: { ...(profile.alertSettings as any)[section.key], size: Number(e.target.value) } } })}
                              className={cn(
                                "w-full px-6 py-3 border rounded-2xl text-sm font-bold transition-all",
                                isDark ? "bg-neutral-900/50 border-neutral-700 text-white" : "bg-white border-neutral-200 text-neutral-900"
                              )}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-neutral-400">Rəng</label>
                            <input
                              type="color"
                              value={(profile.alertSettings as any)[section.key].color || '#000000'}
                              onChange={(e) => setProfile({ ...profile, alertSettings: { ...profile.alertSettings, [section.key]: { ...(profile.alertSettings as any)[section.key], color: e.target.value } } })}
                              className="w-full h-11 rounded-2xl cursor-pointer border-none"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-neutral-400">Stil</label>
                            <select
                              value={(profile.alertSettings as any)[section.key].style || 'normal'}
                              onChange={(e) => setProfile({ ...profile, alertSettings: { ...profile.alertSettings, [section.key]: { ...(profile.alertSettings as any)[section.key], style: e.target.value } } })}
                              className={cn(
                                "w-full px-6 py-3 border rounded-2xl text-sm font-bold transition-all",
                                isDark ? "bg-neutral-900/50 border-neutral-700 text-white" : "bg-white border-neutral-200 text-neutral-900"
                              )}
                            >
                              <option value="normal">Normal</option>
                              <option value="bold">Qalın (Bold)</option>
                              <option value="italic">Kursiv (Italic)</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'goal' && (
              <motion.div
                key="goal"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-8"
              >
                <div className={cn(
                  "p-10 rounded-[2.5rem] border shadow-sm space-y-10 transition-all duration-500",
                  isDark ? "bg-neutral-900/40 border-neutral-800/50 backdrop-blur-xl" : "bg-white border-neutral-200/50"
                )}>
                  <div className="flex items-center justify-between">
                    <h3 className="font-display font-bold text-2xl">Dəstək Hədəfi Ayarları</h3>
                    <label className="relative inline-flex items-center cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={profile.goal.enabled}
                        onChange={(e) => setProfile({ ...profile, goal: { ...profile.goal, enabled: e.target.checked } })}
                        className="sr-only peer"
                      />
                      <div className="w-14 h-7 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-6 after:transition-all peer-checked:bg-indigo-600 shadow-inner"></div>
                      <span className={cn("ml-4 text-sm font-black uppercase tracking-widest", isDark ? "text-neutral-400" : "text-neutral-700")}>Aktiv</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className={cn("text-xs font-black uppercase tracking-widest opacity-60", isDark ? "text-neutral-400" : "text-neutral-500")}>Başlıq</label>
                      <input
                        type="text"
                        value={profile.goal.title || ''}
                        onChange={(e) => setProfile({ ...profile, goal: { ...profile.goal, title: e.target.value } })}
                        className={cn(
                          "w-full px-6 py-4 border rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium",
                          isDark ? "bg-neutral-800/50 border-neutral-700 text-white" : "bg-neutral-50 border-neutral-200 text-neutral-900"
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className={cn("text-xs font-black uppercase tracking-widest opacity-60", isDark ? "text-neutral-400" : "text-neutral-500")}>Hədəf Məbləğ (₼)</label>
                      <input
                        type="number"
                        value={profile.goal.targetAmount ?? 0}
                        onChange={(e) => setProfile({ ...profile, goal: { ...profile.goal, targetAmount: Number(e.target.value) } })}
                        className={cn(
                          "w-full px-6 py-4 border rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium",
                          isDark ? "bg-neutral-800/50 border-neutral-700 text-white" : "bg-neutral-50 border-neutral-200 text-neutral-900"
                        )}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className={cn("text-xs font-black uppercase tracking-widest opacity-60", isDark ? "text-neutral-400" : "text-neutral-500")}>Bar Ön Baxış</p>
                    <div className="bg-neutral-950 p-10 rounded-[2rem] shadow-2xl">
                      <div 
                        className="w-full rounded-full overflow-hidden relative shadow-inner"
                        style={{ height: profile.goal.barThickness / 2, backgroundColor: profile.goal.barBgColor }}
                      >
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, (profile.goal.currentAmount / profile.goal.targetAmount) * 100)}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="h-full flex items-center justify-center relative"
                          style={{ backgroundColor: profile.goal.barColor }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent" />
                          <span className="text-[10px] font-black text-white whitespace-nowrap px-4 relative z-10 drop-shadow-md">
                            {profile.goal.currentAmount} ₼ ({Math.round((profile.goal.currentAmount / profile.goal.targetAmount) * 100)}%)
                          </span>
                        </motion.div>
                      </div>
                      <p className="text-center font-display font-black text-white mt-4 text-lg tracking-tight uppercase">{profile.goal.title}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className={cn("text-xs font-black uppercase tracking-widest opacity-60", isDark ? "text-neutral-400" : "text-neutral-500")}>Bar Rəngi</label>
                      <input
                        type="color"
                        value={profile.goal.barColor || '#000000'}
                        onChange={(e) => setProfile({ ...profile, goal: { ...profile.goal, barColor: e.target.value } })}
                        className="w-full h-14 rounded-2xl cursor-pointer border-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className={cn("text-xs font-black uppercase tracking-widest opacity-60", isDark ? "text-neutral-400" : "text-neutral-500")}>Arxa Plan Rəngi</label>
                      <input
                        type="color"
                        value={profile.goal.barBgColor || '#000000'}
                        onChange={(e) => setProfile({ ...profile, goal: { ...profile.goal, barBgColor: e.target.value } })}
                        className="w-full h-14 rounded-2xl cursor-pointer border-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className={cn("text-xs font-black uppercase tracking-widest opacity-60", isDark ? "text-neutral-400" : "text-neutral-500")}>Bar Qalınlığı ({profile.goal.barThickness}px)</label>
                    <div className="pt-4">
                      <input
                        type="range"
                        min="20"
                        max="100"
                        value={profile.goal.barThickness ?? 0}
                        onChange={(e) => setProfile({ ...profile, goal: { ...profile.goal, barThickness: Number(e.target.value) } })}
                        className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'moderation' && (
              <motion.div
                key="moderation"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-8"
              >
                <div className={cn(
                  "p-10 rounded-[2.5rem] border shadow-sm space-y-10 transition-all duration-500",
                  isDark ? "bg-neutral-900/40 border-neutral-800/50 backdrop-blur-xl" : "bg-white border-neutral-200/50"
                )}>
                  <div className="space-y-4">
                    <h3 className="font-display font-bold text-2xl flex items-center gap-3">
                      <div className="p-2 bg-red-500/10 rounded-lg">
                        <ShieldAlert className="text-red-500" size={24} />
                      </div>
                      Söz Filtri
                    </h3>
                    <p className="text-sm font-medium text-neutral-500 leading-relaxed">
                      Bu siyahıdakı sözləri ehtiva edən mesajlar alert olaraq ekranda görünməyəcək. Yayımınızı təmiz saxlayın.
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div className="flex flex-col md:flex-row gap-4">
                      <input
                        type="text"
                        value={newWord || ''}
                        onChange={(e) => setNewWord(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addModerationWord()}
                        placeholder="Yasaqlanmış söz əlavə et..."
                        className={cn(
                          "flex-1 px-6 py-4 border rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium",
                          isDark ? "bg-neutral-800/50 border-neutral-700 text-white" : "bg-neutral-50 border-neutral-200 text-neutral-900"
                        )}
                      />
                      <button
                        onClick={addModerationWord}
                        className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
                      >
                        <Plus size={20} />
                        Əlavə Et
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <AnimatePresence>
                        {profile.moderationWords.map(word => (
                          <motion.span 
                            key={word} 
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className={cn(
                              "px-5 py-2.5 border rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-3 transition-all group",
                              isDark ? "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20" : "bg-red-50 text-red-600 border-red-100 hover:bg-red-100"
                            )}
                          >
                            {word}
                            <button onClick={() => removeModerationWord(word)} className="hover:scale-125 transition-transform">
                              <X size={16} />
                            </button>
                          </motion.span>
                        ))}
                      </AnimatePresence>
                      {profile.moderationWords.length === 0 && (
                        <div className="w-full py-10 text-center border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-3xl">
                          <p className="text-sm text-neutral-400 font-bold italic">Heç bir yasaqlanmış söz yoxdur.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* OBS Links Sidebar */}
        <div className="space-y-8">
          <div className={cn(
            "p-8 rounded-[2.5rem] border shadow-sm space-y-8 transition-all duration-500",
            isDark ? "bg-neutral-900/40 border-neutral-800/50 backdrop-blur-xl" : "bg-white border-neutral-200 shadow-sm"
          )}>
            <h3 className="font-display font-bold text-xl flex items-center gap-3">
              <div className="p-2 bg-indigo-500/10 rounded-lg">
                <ArrowUpRight className="text-indigo-500" size={20} />
              </div>
              OBS Bağlantıları
            </h3>
            
            <div className="space-y-8">
              {[
                { label: 'Alert Overlay', key: 'alert', path: `/overlay/${state.profile.username}`, copied: copiedAlert },
                { label: 'Hədəf Barı (Goal)', key: 'goal', path: `/goal/${state.profile.username}`, copied: copiedGoal }
              ].map((link) => (
                <div key={link.key} className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-widest text-neutral-400">{link.label}</label>
                  <div className={cn(
                    "p-4 rounded-2xl border font-mono text-[10px] break-all transition-all leading-relaxed",
                    isDark ? "bg-neutral-800/50 border-neutral-700 text-indigo-300" : "bg-neutral-50 border-neutral-100 text-neutral-600"
                  )}>
                    {window.location.origin}{link.path}
                  </div>
                  <button
                    onClick={() => copyLink(link.key as any)}
                    className="w-full py-3.5 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-500/20"
                  >
                    {link.copied ? 'Kopyalandı!' : 'Linki Kopyala'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className={cn(
            "p-8 rounded-[2.5rem] border transition-all duration-500 relative overflow-hidden group",
            isDark ? "bg-indigo-500/10 border-indigo-500/20" : "bg-indigo-50 border-indigo-100"
          )}>
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-20 h-20 bg-indigo-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
            <h4 className={cn("font-display font-bold text-lg mb-3 relative z-10", isDark ? "text-indigo-400" : "text-indigo-900")}>Kömək Lazımdır?</h4>
            <p className={cn("text-xs font-medium leading-relaxed relative z-10 opacity-80", isDark ? "text-indigo-300/70" : "text-indigo-700")}>
              Bu linkləri OBS-də "Browser Source" olaraq əlavə edin. Genişlik və hündürlüyü yayım proqramınızda ekranınıza uyğun tənzimləyin. Adətən 1920x1080 və ya 800x600 istifadə olunur.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
