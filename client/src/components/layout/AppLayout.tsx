import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import TopNav from "./TopNav";
import MobileNav from "./MobileNav";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="fixed left-0 top-0 h-full w-72">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Desktop Layout */}
      <div className="flex flex-col min-h-screen">
        {/* Combined Header and Navigation */}
        <div className="glass-card border-0 border-b border-white/20 dark:border-slate-700/50">
          <div className="flex items-center justify-between px-4 sm:px-6 py-2">
            {/* Mobile Menu Button and Logo */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl glass"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 sm:w-10 h-8 sm:h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-white text-sm sm:text-lg font-bold">ॐ</span>
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-lg sm:text-xl font-bold gradient-text">Namhatta</h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Management System</p>
                </div>
              </div>
            </div>

            {/* Desktop Navigation - Centered */}
            <div className="hidden lg:block flex-1">
              <TopNav />
            </div>

            {/* Theme Toggle */}
            <Header onMenuClick={() => setSidebarOpen(true)} />
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto pb-16 lg:pb-0">
          <div className="animate-fade-in">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav />
    </div>
  );
}
