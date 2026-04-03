import React from 'react';
import { motion } from 'motion/react';
import { Zap, Info, Shield, Users, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../AppContext';
import { cn } from '../lib/utils';

export default function About() {
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
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
              <Zap size={24} fill="currentColor" />
            </div>
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
        <div className="max-w-4xl mx-auto space-y-20">
          {/* Hero Section */}
          <section className="text-center space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-4"
            >
              <h1 className="text-5xl md:text-7xl font-display font-black tracking-tight">Haqqımızda</h1>
              <p className={cn("text-xl font-medium max-w-2xl mx-auto", isDark ? "text-neutral-400" : "text-neutral-500")}>
                Rəqəmsal yaradıcılığın gələcəyini birlikdə qururuq.
              </p>
            </motion.div>
          </section>

          {/* Main Content */}
          <section className={cn(
            "p-10 md:p-16 rounded-[3rem] border shadow-2xl space-y-12 relative overflow-hidden",
            isDark ? "bg-neutral-900/40 border-neutral-800/50 backdrop-blur-xl" : "bg-white border-neutral-200/50"
          )}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 rounded-full -mr-32 -mt-32 blur-3xl" />
            
            <div className="space-y-8 relative z-10">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-500/10 rounded-2xl">
                  <Info className="text-indigo-500" size={32} />
                </div>
                <h2 className="text-3xl font-display font-black">Biz Kimik?</h2>
              </div>
              
              <div className={cn(
                "space-y-6 text-lg font-medium leading-relaxed",
                isDark ? "text-neutral-300" : "text-neutral-600"
              )}>
                <p>
                  Birstream rəqəmsal məzmun yaradıcıları və onların auditoriyası arasında birbaşa və interaktiv əlaqə qurmaq üçün yaradılmış innovativ platformadır. Bizim məqsədimiz yerli və qlobal streamerlərə öz yaradıcılıqlarını monetizasiya etmək, izləyicilərə isə sevdikləri yayımçıları asan və təhlükəsiz şəkildə dəstəkləmək imkanı yaratmaqdır.
                </p>
                <p>
                  Müasir texnologiyalar və istifadəçi dostu interfeysimizlə biz yayım dünyasında şəffaflığı və sürəti təmin edirik. İstər oyun, istər təhsil, istərsə də əyləncə sahəsində olsun – biz hər bir yaradıcının öz potensialını reallaşdırmasına kömək edirik.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 border-t border-neutral-500/10">
              <div className="space-y-3">
                <div className="text-indigo-500 font-black text-3xl">100%</div>
                <p className="text-sm font-bold text-neutral-500 uppercase tracking-widest">Yerli İnnovasiya</p>
              </div>
              <div className="space-y-3">
                <div className="text-indigo-500 font-black text-3xl">7/24</div>
                <p className="text-sm font-bold text-neutral-500 uppercase tracking-widest">Texniki Dəstək</p>
              </div>
              <div className="space-y-3">
                <div className="text-indigo-500 font-black text-3xl">Sürətli</div>
                <p className="text-sm font-bold text-neutral-500 uppercase tracking-widest">Ödəniş Sistemi</p>
              </div>
            </div>
          </section>

          {/* Values */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className={cn(
              "p-10 rounded-[2.5rem] border space-y-6",
              isDark ? "bg-neutral-900/40 border-neutral-800/50" : "bg-neutral-50 border-neutral-100"
            )}>
              <Shield className="text-emerald-500" size={32} />
              <h3 className="text-xl font-display font-black">Təhlükəsizlik</h3>
              <p className="text-sm text-neutral-500 font-medium leading-relaxed">
                İstifadəçilərimizin məlumatları və maliyyə əməliyyatları ən yüksək təhlükəsizlik standartları ilə qorunur.
              </p>
            </div>
            <div className={cn(
              "p-10 rounded-[2.5rem] border space-y-6",
              isDark ? "bg-neutral-900/40 border-neutral-800/50" : "bg-neutral-50 border-neutral-100"
            )}>
              <Users className="text-indigo-500" size={32} />
              <h3 className="text-xl font-display font-black">İcma</h3>
              <p className="text-sm text-neutral-500 font-medium leading-relaxed">
                Biz yaradıcılar və izləyicilər arasında güclü və interaktiv bir icma qurmağa inanırıq.
              </p>
            </div>
          </section>
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
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                <Zap size={18} fill="currentColor" />
              </div>
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
