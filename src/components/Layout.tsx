import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, User, Settings, LogOut, Heart, ExternalLink, Moon, Sun, Menu, X, BarChart3, Star } from 'lucide-react';
import { cn } from '../lib/utils';
import { useApp } from '../AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { UserButton, useUser } from '@clerk/clerk-react';
import { toast } from 'react-hot-toast';

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { state, updateProfile } = useApp();
  const { user, isLoaded } = useUser();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isDark = state.profile.theme === 'dark';

  const toggleTheme = () => {
    updateProfile({ theme: isDark ? 'light' : 'dark' });
  };

  const navItems = [
    { label: 'İdarəetmə paneli', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Analitika', icon: BarChart3, path: '/analytics' },
    { label: 'Dəstəklər', icon: Heart, path: '/donations' },
    { label: 'Profil', icon: User, path: '/profile' },
    { label: 'Abunəliklər', icon: Star, path: '/subscriptions' },
    { label: 'Parametrlər', icon: Settings, path: '/settings' },
    { label: 'Yayım Ayarları', icon: ExternalLink, path: '/stream-settings' },
  ];

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  // Don't show sidebar on public donation page or overlay
  const isPublicPage = location.pathname.startsWith('/donate') || location.pathname.startsWith('/overlay') || location.pathname.startsWith('/goal');

  if (isPublicPage) return <>{children}</>;

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className={cn("p-6 border-b flex items-center justify-between", isDark ? "border-neutral-800" : "border-neutral-100")}>
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Heart size={20} fill="currentColor" />
          </div>
          <span className={cn("text-xl font-display font-bold tracking-tight", isDark ? "text-white" : "text-indigo-900")}>Birstream</span>
        </Link>
        <button 
          onClick={toggleTheme}
          className={cn(
            "p-2 rounded-xl transition-all hover:scale-110 active:scale-95",
            isDark ? "bg-neutral-800 text-amber-400 hover:bg-neutral-700" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
          )}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden",
              location.pathname === item.path
                ? (isDark ? "bg-indigo-500/10 text-indigo-400 font-medium" : "bg-indigo-50 text-indigo-600 font-medium")
                : (isDark ? "text-neutral-400 hover:bg-neutral-800 hover:text-white" : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900")
            )}
          >
            {location.pathname === item.path && (
              <motion.div
                layoutId="nav-active"
                className="absolute left-0 w-1 h-6 bg-indigo-600 rounded-r-full"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            <item.icon size={20} className={cn("transition-transform group-hover:scale-110", location.pathname === item.path ? "text-indigo-500" : "")} />
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className={cn("p-4 border-t", isDark ? "border-neutral-800" : "border-neutral-100")}>
        <div className={cn(
          "p-4 rounded-2xl border transition-all hover:shadow-lg flex items-center justify-between",
          isDark ? "bg-neutral-800/50 border-neutral-700 hover:bg-neutral-800" : "bg-neutral-50 border-neutral-100 hover:bg-white"
        )}>
          {!isLoaded ? (
            <div className="flex items-center gap-3 w-full">
              <div className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-700 animate-pulse" />
              <div className="space-y-2 flex-1">
                <div className="w-24 h-3 bg-neutral-200 dark:bg-neutral-700 animate-pulse rounded" />
                <div className="w-32 h-2 bg-neutral-200 dark:bg-neutral-700 animate-pulse rounded" />
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 overflow-hidden">
                <UserButton afterSignOutUrl="/" />
                <div className="overflow-hidden">
                  <p className="text-sm font-semibold truncate">{user?.fullName || state.profile.displayName}</p>
                  <p className="text-xs text-neutral-500 truncate">{user?.primaryEmailAddress?.emailAddress || state.profile.username}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/donate/${state.profile.username}`);
                    toast.success('Dəstək linki kopyalandı!');
                  }}
                  className={cn(
                    "p-2.5 border rounded-xl text-xs font-bold transition-all active:scale-95",
                    isDark ? "bg-neutral-900 border-neutral-700 hover:bg-neutral-950 text-white" : "bg-white border-neutral-200 hover:bg-neutral-100 text-neutral-600"
                  )}
                  title="Linki Kopyala"
                >
                  <Star size={14} className="text-emerald-500" />
                </button>
                <button
                  onClick={() => navigate('/donate/' + state.profile.username)}
                  className={cn(
                    "p-2.5 border rounded-xl text-xs font-bold transition-all active:scale-95",
                    isDark ? "bg-neutral-900 border-neutral-700 hover:bg-neutral-950 text-white" : "bg-white border-neutral-200 hover:bg-neutral-100 text-neutral-600"
                  )}
                  title="Dəstək Səhifəsi"
                >
                  <ExternalLink size={14} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className={cn(
      "flex min-h-screen font-sans transition-colors duration-500",
      isDark ? "bg-neutral-950 text-white" : "bg-neutral-50 text-neutral-900"
    )}>
      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden lg:flex w-72 border-r flex-col fixed h-full transition-all duration-500 z-30",
        isDark ? "bg-neutral-900/80 border-neutral-800/50 backdrop-blur-xl" : "bg-white/80 border-neutral-200/50 backdrop-blur-xl"
      )}>
        <SidebarContent />
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-md z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%", opacity: 0.5 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-100%", opacity: 0.5 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className={cn(
                "fixed inset-y-0 left-0 w-[85%] max-w-[320px] z-50 lg:hidden shadow-2xl overflow-hidden",
                isDark ? "bg-neutral-900 border-r border-neutral-800" : "bg-white border-r border-neutral-100"
              )}
            >
              <SidebarContent />
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="absolute top-6 right-4 p-2 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 lg:hidden"
              >
                <X size={20} />
              </button>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className={cn(
          "lg:hidden flex items-center justify-between p-4 sticky top-0 z-20 border-b backdrop-blur-xl transition-colors duration-500",
          isDark ? "bg-neutral-950/70 border-neutral-800/50" : "bg-white/70 border-neutral-200/50"
        )}>
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Heart size={22} fill="currentColor" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-violet-500">Birstream</span>
          </Link>
          <button
            onClick={() => setIsSidebarOpen(true)}
            className={cn(
              "p-2.5 rounded-2xl transition-all active:scale-90 shadow-sm",
              isDark ? "bg-neutral-800 text-white border border-neutral-700" : "bg-white text-neutral-900 border border-neutral-200"
            )}
          >
            <Menu size={24} />
          </button>
        </header>

        {/* Content */}
        <main className={cn(
          "flex-1 p-4 md:p-10 lg:ml-72 transition-all duration-500",
          isDark ? "selection:bg-indigo-500/20" : "selection:bg-indigo-100"
        )}>
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-6xl mx-auto"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
