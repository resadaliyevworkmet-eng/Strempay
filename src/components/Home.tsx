import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  ShieldCheck, 
  Layout, 
  Smartphone, 
  ArrowRight,
  CheckCircle2,
  Twitch,
  Youtube,
  Instagram,
  Music2,
  Heart,
  Trophy
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useApp } from '../AppContext';
import { SignInButton, SignUpButton, UserButton, SignedIn, SignedOut, useAuth } from '@clerk/clerk-react';
import { PLATFORM_NAME, PLATFORM_LOGO } from '../constants';

// Custom Kick Icon
const KickIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M19.5 3H4.5C3.67 3 3 3.67 3 4.5V19.5C3 20.33 3.67 21 4.5 21H19.5C20.33 21 21 20.33 21 19.5V4.5C21 3.67 20.33 3 19.5 3ZM16.5 15.75H14.25V18H12V15.75H9.75V13.5H12V11.25H9.75V9H12V6.75H14.25V9H16.5V11.25H14.25V13.5H16.5V15.75Z" />
  </svg>
);

export default function Home() {
  const { state } = useApp();
  const { isLoaded, isSignedIn } = useAuth();
  const isDark = true; // Force dark mode
  const [previewAmount, setPreviewAmount] = useState('10');
  const [previewSender, setPreviewSender] = useState('İzləyici');

  const features = [
    {
      icon: Zap,
      title: "Sürətli Ödənişlər",
      description: "Dəstəkləriniz anında balansınıza köçür və istədiyiniz vaxt çıxarış edə bilərsiniz.",
      color: "text-amber-500",
      bg: "bg-amber-500/10"
    },
    {
      icon: Layout,
      title: "Tam Özəlləşdirmə",
      description: "OBS alertlərinizi, hədəf barlarınızı öz zövqünüzə uyğun dizayn edin.",
      color: "text-indigo-500",
      bg: "bg-indigo-500/10"
    },
    {
      icon: ShieldCheck,
      title: "Təhlükəsizlik",
      description: "Bütün əməliyyatlar ən yüksək təhlükəsizlik standartları ilə qorunur.",
      color: "text-emerald-500",
      bg: "bg-emerald-500/10"
    },
    {
      icon: Smartphone,
      title: "Mobil Uyğunluq",
      description: "Həm strimerlər, həm də izləyicilər üçün mükəmməl mobil təcrübə.",
      color: "text-rose-500",
      bg: "bg-rose-500/10"
    }
  ];

  const mockStreamers = [
    { name: "SuperStreamer", viewers: "1.2k", avatar: "https://picsum.photos/seed/s1/100/100", color: "from-indigo-500 to-purple-500" },
    { name: "GameMaster", viewers: "850", avatar: "https://picsum.photos/seed/s2/100/100", color: "from-emerald-500 to-teal-500" },
    { name: "TechGuru", viewers: "2.4k", avatar: "https://picsum.photos/seed/s3/100/100", color: "from-rose-500 to-orange-500" }
  ];

  return (
    <div className={cn(
      "min-h-screen font-sans transition-colors duration-500",
      isDark ? "bg-neutral-950 text-white" : "bg-white text-neutral-900"
    )}>
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b transition-colors duration-500 bg-neutral-950/80 border-neutral-800/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <img 
              src={state.platformSettings.logoUrl || PLATFORM_LOGO} 
              alt="Logo" 
              className="w-8 h-8 sm:w-10 sm:h-10 object-contain group-hover:scale-110 transition-transform"
              referrerPolicy="no-referrer"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (target.src !== PLATFORM_LOGO) {
                  target.src = PLATFORM_LOGO;
                }
              }}
            />
            <span className="text-xl sm:text-2xl font-display font-black tracking-tighter">{PLATFORM_NAME}</span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-4">
            {!isLoaded ? (
              <div className="w-20 sm:w-24 h-10 bg-neutral-800 animate-pulse rounded-xl" />
            ) : isSignedIn ? (
              <>
                <Link 
                  to={`/donate/${state.profile.username}`}
                  className="hidden sm:block px-6 py-2.5 rounded-xl text-sm font-black transition-all hover:scale-105 active:scale-95 text-neutral-400 hover:text-white"
                >
                  Dəstək Ol
                </Link>
                <Link 
                  to="/dashboard"
                  className="px-4 sm:px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-xs sm:text-sm font-black hover:bg-emerald-700 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/20"
                >
                  Panel
                </Link>
                <UserButton afterSignOutUrl="/" />
              </>
            ) : (
              <>
                <SignInButton mode="modal">
                  <button className="px-3 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all hover:scale-105 active:scale-95 text-neutral-400 hover:text-white">
                    Giriş
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="px-4 sm:px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-xs sm:text-sm font-black hover:bg-emerald-700 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/20">
                    Qeydiyyat
                  </button>
                </SignUpButton>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-48 pb-32 overflow-hidden text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[600px] bg-emerald-600/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <div className="space-y-10">
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex justify-center"
              >
                <span className="px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-[0.1em] sm:tracking-[0.2em] border border-emerald-500/20 inline-block max-w-[280px] sm:max-w-none leading-relaxed">
                  Azərbaycanın yeni nəsil dəstək platforması
                </span>
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-black tracking-tight leading-[1.1] px-4 sm:px-0"
              >
                Yaradıcılığınızı <br className="hidden sm:block" />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400">
                  Qazanca Çevirin
                </span>
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-lg sm:text-xl font-medium max-w-2xl mx-auto leading-relaxed text-neutral-400 px-4 sm:px-0"
              >
                Birstream ilə YouTube, Instagram və digər platformalardakı izləyicilərinizdən asanlıqla dəstək toplayın, OBS alertlərinizi fərdiləşdirin və karyeranızı peşəkar səviyyəyə qaldırın.
              </motion.p>
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col items-center gap-12"
            >
              <div className="flex flex-col items-center gap-8">
                <div className="flex flex-wrap items-center justify-center gap-6">
                  {!isLoaded ? (
                    <div className="w-48 h-16 bg-neutral-800 animate-pulse rounded-[2rem]" />
                  ) : isSignedIn ? (
                    <Link 
                      to="/dashboard"
                      className="px-12 py-6 bg-emerald-600 text-white rounded-[2rem] font-black text-xl hover:bg-emerald-700 transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-emerald-500/40 flex items-center justify-center gap-3"
                    >
                      İdarəetmə panelinə Get
                      <ArrowRight size={24} />
                    </Link>
                  ) : (
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                      <SignUpButton mode="modal">
                        <button className="w-full sm:w-auto px-12 py-6 bg-emerald-600 text-white rounded-[2rem] font-black text-xl hover:bg-emerald-700 transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-emerald-500/40 flex items-center justify-center gap-3 group">
                          İndi Başla
                          <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                      </SignUpButton>
                      
                      <Link 
                        to="/donate/demo" 
                        className="w-full sm:w-auto px-8 sm:px-16 py-5 sm:py-8 border-4 rounded-[2.5rem] font-black text-xl sm:text-2xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-4 group relative overflow-hidden shadow-2xl border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10 shadow-emerald-500/10"
                      >
                        <motion.div 
                          animate={{ opacity: [0.1, 0.3, 0.1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="absolute inset-0 bg-emerald-500" 
                        />
                        Dəstək Ol
                        <Heart size={32} className="group-hover:scale-125 transition-transform text-rose-500" fill="currentColor" />
                      </Link>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-6 px-8 py-5 rounded-3xl bg-neutral-500/5 border border-neutral-500/10 backdrop-blur-md">
                  <KickIcon size={28} className="text-emerald-500 hover:scale-110 transition-transform cursor-pointer" />
                  <Twitch size={28} className="text-purple-500 hover:scale-110 transition-transform cursor-pointer" />
                  <Youtube size={28} className="text-red-600 hover:scale-110 transition-transform cursor-pointer" />
                  <Instagram size={28} className="text-rose-500 hover:scale-110 transition-transform cursor-pointer" />
                  <Music2 size={28} className="text-neutral-400 hover:scale-110 transition-transform cursor-pointer" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 transition-colors duration-500 bg-neutral-900/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-4xl md:text-5xl font-display font-black tracking-tight">Niyə Birstream?</h2>
            <p className="text-lg font-medium max-w-2xl mx-auto text-neutral-400">
              Məzmun yaradıcılarının ehtiyac duyduğu hər şeyi bir platformada birləşdirdik.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -10 }}
                className="p-8 rounded-[2.5rem] border transition-all duration-500 bg-neutral-900/50 border-neutral-800/50 hover:border-emerald-500/50"
              >
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6", feature.bg)}>
                  <feature.icon className={feature.color} size={28} />
                </div>
                <h3 className="text-xl font-display font-black mb-4">{feature.title}</h3>
                <p className="text-sm leading-relaxed font-medium text-neutral-400">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits for Creators */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-10">
              <div className="space-y-4">
                <h2 className="text-4xl md:text-5xl font-display font-black tracking-tight">Yaradıcılar üçün <br /> <span className="text-emerald-600">Vədlərimiz</span></h2>
                <p className="text-lg font-medium text-neutral-400">
                  Yalnız dəstək toplamaq deyil, həm də məzmun keyfiyyətinizi artırmaq üçün çalışırıq.
                </p>
              </div>

              <div className="space-y-6">
                {[
                  "7/24 Texniki dəstək və yardım",
                  "Bütün yerli bank kartlarına anında çıxarış",
                  "Yüksek keyfiyyətli OBS overlay dəstəyi",
                  "Söz filtri və süni intellektli moderasiya"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center text-white shrink-0">
                      <CheckCircle2 size={14} />
                    </div>
                    <span className="font-bold">{item}</span>
                  </div>
                ))}
              </div>

                <SignedIn>
                  <Link 
                    to="/dashboard"
                    className="inline-flex items-center gap-3 px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20"
                  >
                    İdarəetmə panelinə Get
                    <ArrowRight size={20} />
                  </Link>
                </SignedIn>
                
                <SignedOut>
                  <SignUpButton mode="modal">
                    <button className="inline-flex items-center gap-3 px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20">
                      Qeydiyyatdan Keç
                      <ArrowRight size={20} />
                    </button>
                  </SignUpButton>
                </SignedOut>
            </div>

            <div className="relative">
              <div className="p-10 rounded-[3rem] border shadow-2xl space-y-8 relative z-10 bg-neutral-900/40 border-neutral-800/50 backdrop-blur-xl">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-500/10 rounded-2xl">
                    <Trophy className="text-emerald-500" size={32} />
                  </div>
                  <div>
                    <h4 className="text-2xl font-display font-black">Liderlik Paneli</h4>
                    <p className="text-sm text-neutral-500 font-medium">Ən çox dəstək olan izləyiciləriniz.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    { name: "Anar M.", amount: "250 ₼", rank: 1, color: "bg-amber-400" },
                    { name: "Leyla S.", amount: "180 ₼", rank: 2, color: "bg-neutral-300" },
                    { name: "Elvin K.", amount: "120 ₼", rank: 3, color: "bg-orange-400" }
                  ].map((user, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-neutral-500/5 border border-neutral-500/10">
                      <div className="flex items-center gap-3">
                        <span className={cn("w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black text-neutral-900", user.color)}>
                          {user.rank}
                        </span>
                        <span className="font-bold text-sm">{user.name}</span>
                      </div>
                      <span className="font-black text-emerald-500">{user.amount}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t transition-colors duration-500 bg-neutral-950 border-neutral-800/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="flex items-center gap-2">
              <img 
                src={state.platformSettings.logoUrl || PLATFORM_LOGO} 
                alt="Logo" 
                className="w-8 h-8 object-contain"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (target.src !== PLATFORM_LOGO) {
                    target.src = PLATFORM_LOGO;
                  }
                }}
              />
              <span className="text-xl font-display font-black tracking-tighter">{PLATFORM_NAME}</span>
            </div>
            
            <div className="flex gap-8 text-sm font-bold text-neutral-500">
              <Link to="/terms" className="hover:text-emerald-500 transition-colors">İstifadə Şərtləri</Link>
              <Link to="/privacy" className="hover:text-emerald-500 transition-colors">Gizlilik Siyasəti</Link>
              <Link to="/about" className="hover:text-emerald-500 transition-colors">Haqqımızda</Link>
            </div>

            <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
              © 2026 {PLATFORM_NAME}. Bütün hüquqlar qorunur.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
