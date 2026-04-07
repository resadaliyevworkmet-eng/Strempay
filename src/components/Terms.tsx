import React from 'react';
import { motion } from 'motion/react';
import { Zap, FileText, ShieldAlert, CreditCard, AlertCircle, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../AppContext';
import { cn } from '../lib/utils';

export default function Terms() {
  const { state } = useApp();
  const isDark = state.profile.theme === 'dark';

  return (
    <div className={cn(
      "min-h-screen font-sans transition-colors duration-500",
      isDark ? "bg-neutral-950 text-white" : "bg-white text-neutral-900"
    )}>
      {/* Simple Nav */}
      <nav className={cn(
        "fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b transition-colors duration-500",
        isDark ? "bg-neutral-950/80 border-neutral-800/50" : "bg-white/80 border-neutral-100"
      )}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <img 
              src="https://storage.googleapis.com/static.mira.ai/ai-studio-build/4377041a-9669-4560-848e-289874a7813a.png" 
              alt="Logo" 
              className="w-10 h-10 object-contain group-hover:scale-110 transition-transform"
              referrerPolicy="no-referrer"
            />
            <span className="text-2xl font-display font-black tracking-tighter">Birstream</span>
          </Link>
          <Link 
            to="/" 
            className={cn(
              "px-6 py-2.5 rounded-xl text-sm font-black transition-all hover:scale-105 active:scale-95",
              isDark ? "text-neutral-400 hover:text-white" : "text-neutral-500 hover:text-neutral-900"
            )}
          >
            Ana Səhifəyə Qayıt
          </Link>
        </div>
      </nav>

      <main className="pt-40 pb-32 px-6">
        <div className="max-w-4xl mx-auto space-y-16">
          {/* Header */}
          <section className="text-center space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-4"
            >
              <h1 className="text-5xl md:text-7xl font-display font-black tracking-tight">İstifadə Şərtləri</h1>
              <p className={cn("text-xl font-medium max-w-2xl mx-auto uppercase tracking-widest text-indigo-500")}>
                Terms and Conditions
              </p>
            </motion.div>
          </section>

          {/* Intro Card */}
          <section className={cn(
            "p-10 md:p-12 rounded-[3rem] border shadow-xl space-y-8 relative overflow-hidden",
            isDark ? "bg-neutral-900/40 border-neutral-800/50 backdrop-blur-xl" : "bg-white border-neutral-200/50"
          )}>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-500/10 rounded-2xl">
                <FileText className="text-indigo-500" size={32} />
              </div>
              <h2 className="text-2xl font-display font-black">Platforma Qaydaları</h2>
            </div>
            <p className={cn("text-lg font-medium leading-relaxed", isDark ? "text-neutral-300" : "text-neutral-600")}>
              Bu şərtlər Birstream platformasından istifadə qaydalarını tənzimləyir. Sayta daxil olmaqla siz aşağıdakı şərtləri qəbul etmiş sayılırısınız:
            </p>
          </section>

          {/* Terms Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className={cn(
              "p-10 rounded-[2.5rem] border space-y-6",
              isDark ? "bg-neutral-900/40 border-neutral-800/50" : "bg-neutral-50 border-neutral-100"
            )}>
              <Zap className="text-indigo-500" size={32} />
              <h3 className="text-xl font-display font-black">Xidmətin Mahiyyəti</h3>
              <p className="text-sm text-neutral-500 font-medium leading-relaxed">
                Platforma yaradıcılara dəstək (support) qəbul etmək və izləyicilərlə ünsiyyət qurmaq üçün vasitəçilik xidməti göstərir.
              </p>
            </div>

            <div className={cn(
              "p-10 rounded-[2.5rem] border space-y-6",
              isDark ? "bg-neutral-900/40 border-neutral-800/50" : "bg-neutral-50 border-neutral-100"
            )}>
              <ShieldAlert className="text-amber-500" size={32} />
              <h3 className="text-xl font-display font-black">İstifadəçi Öhdəlikləri</h3>
              <p className="text-sm text-neutral-500 font-medium leading-relaxed">
                İstifadəçilər saxta ödənişlərdən, təhqiredici məzmundan və platformanın işinə mane olacaq fəaliyyətlərdən çəkinməlidirlər.
              </p>
            </div>

            <div className={cn(
              "p-10 rounded-[2.5rem] border space-y-6",
              isDark ? "bg-neutral-900/40 border-neutral-800/50" : "bg-neutral-50 border-neutral-100"
            )}>
              <CreditCard className="text-emerald-500" size={32} />
              <h3 className="text-xl font-display font-black">Ödənişlər və Geri Qaytarma</h3>
              <p className="text-sm text-neutral-500 font-medium leading-relaxed">
                Dəstəklər (support) könüllü xarakter daşıyır. Qanunla nəzərdə tutulmuş hallar istisna olmaqla, uğurla tamamlanmış dəstəklərin geri qaytarılması nəzərdə tutulmur.
              </p>
            </div>

            <div className={cn(
              "p-10 rounded-[2.5rem] border space-y-6",
              isDark ? "bg-neutral-900/40 border-neutral-800/50" : "bg-neutral-50 border-neutral-100"
            )}>
              <AlertCircle className="text-rose-500" size={32} />
              <h3 className="text-xl font-display font-black">Məsuliyyət</h3>
              <p className="text-sm text-neutral-500 font-medium leading-relaxed">
                Platforma streamerlərin yayım zamanı paylaşdığı məzmuna görə birbaşa məsuliyyət daşımır, lakin qaydaları pozan hesabları bloklamaq hüququnu özündə saxlayır.
              </p>
            </div>

            <div className={cn(
              "p-10 rounded-[2.5rem] border space-y-6 md:col-span-2",
              isDark ? "bg-neutral-900/40 border-neutral-800/50" : "bg-neutral-50 border-neutral-100"
            )}>
              <RefreshCw className="text-indigo-500" size={32} />
              <h3 className="text-xl font-display font-black">Dəyişikliklər</h3>
              <p className="text-sm text-neutral-500 font-medium leading-relaxed">
                Birstream istənilən vaxt bu şərtlərdə dəyişiklik etmək hüququna malikdir. Yenilənmiş şərtlər saytda dərc edildiyi andan qüvvəyə minir.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className={cn(
        "py-20 border-t transition-colors duration-500",
        isDark ? "bg-neutral-950 border-neutral-800/50" : "bg-neutral-50 border-neutral-100"
      )}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="flex items-center gap-2">
              <img 
                src="https://storage.googleapis.com/static.mira.ai/ai-studio-build/4377041a-9669-4560-848e-289874a7813a.png" 
                alt="Logo" 
                className="w-8 h-8 object-contain"
                referrerPolicy="no-referrer"
              />
              <span className="text-xl font-display font-black tracking-tighter">Birstream</span>
            </div>
            
            <div className="flex gap-8 text-sm font-bold text-neutral-500">
              <Link to="/terms" className="hover:text-indigo-500 transition-colors">İstifadə Şərtləri</Link>
              <Link to="/privacy" className="hover:text-indigo-500 transition-colors">Gizlilik Siyasəti</Link>
              <Link to="/about" className="hover:text-indigo-500 transition-colors">Haqqımızda</Link>
            </div>

            <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
              © 2026 Birstream. Bütün hüquqlar qorunur.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
