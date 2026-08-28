import React, { useState } from 'react';
import { usePlacement } from '../../context/PlacementContext';
import {
  LayoutDashboard,
  User,
  Briefcase,
  FileCheck,
  Bell,
  GraduationCap,
  Menu,
  X
} from 'lucide-react';
import ProfileMenu from '../common/ProfileMenu';
import FloatingPlacementAgent from '../common/FloatingPlacementAgent';

export default function StudentLayout({ children }) {
  const {
    studentTab,
    setStudentTab,
    unreadNotifCount
  } = usePlacement();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'drives', label: 'Placement Drives', icon: Briefcase },
    { id: 'applications', label: 'My Applications & Results', icon: FileCheck },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadNotifCount },
  ];

  return (
    <div className="min-h-screen bg-[#0B1020] flex flex-col antialiased text-[#F8FAFC] font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-[#111827]/95 backdrop-blur-md border-b border-[#27324A] shadow-soft">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            {/* Left: Brand */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white flex items-center justify-center font-bold flex-shrink-0 shadow-purple">
                <GraduationCap className="w-4 h-4 text-white" />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm tracking-tight text-[#F8FAFC]">
                  Apex Placement
                </span>
                <span className="text-[11px] font-semibold text-[#A78BFA] bg-[#7C3AED]/20 px-2 py-0.5 rounded-full border border-[#7C3AED]/40">
                  Student Portal
                </span>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = studentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setStudentTab(item.id)}
                    className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white font-semibold shadow-purple'
                        : 'text-[#CBD5E1] hover:text-white hover:bg-[#151C32]'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-[#94A3B8]'}`} />
                    <span>{item.label}</span>
                    {item.badge > 0 && (
                      <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-[#EF4444] text-white">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Right: Profile Menu & Mobile Toggle */}
            <div className="flex items-center gap-2">
              <ProfileMenu />

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-1.5 rounded-lg text-[#94A3B8] hover:bg-[#151C32] hover:text-white cursor-pointer"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#27324A] bg-[#111827] px-4 py-2 space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = studentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setStudentTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white font-semibold'
                      : 'text-[#CBD5E1] hover:bg-[#151C32]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge > 0 && (
                    <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-[#EF4444] text-white">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>

      {/* Persistent Student Placement Agent */}
      <FloatingPlacementAgent />

      {/* Footer */}
      <footer className="border-t border-[#27324A] bg-[#080C18] py-4 px-6 text-center text-xs text-[#94A3B8]">
        Apex Institute of Technology &middot; Office of Career Services &copy; 2026
      </footer>
    </div>
  );
}
