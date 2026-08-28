import React, { useState, useRef, useEffect } from 'react';
import { usePlacement } from '../../context/PlacementContext';
import { 
  User, 
  Settings, 
  LogOut, 
  ChevronDown, 
  ShieldCheck, 
  GraduationCap,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

export default function ProfileMenu({ onOpenSettings }) {
  const { 
    currentUser, 
    userRole, 
    studentProfile, 
    setOfficerTab, 
    setStudentTab, 
    handleLogout 
  } = usePlacement();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const isOfficer = userRole === 'placement_officer' || currentUser?.role === 'placement_officer';
  
  const displayName = isOfficer 
    ? (currentUser?.name || 'Dr. Ramanathan S.')
    : (studentProfile?.name || currentUser?.name || 'Rahul Sharma');

  const displaySubtitle = isOfficer
    ? (currentUser?.designation || 'Head - Placement & Corporate Relations')
    : (studentProfile?.id || currentUser?.student_id || 'STU001');

  const displayEmail = currentUser?.email || (isOfficer ? 'officer@example.com' : 'student@example.com');

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleProfileClick = () => {
    setIsOpen(false);
    if (isOfficer) {
      setOfficerTab('dashboard');
    } else {
      setStudentTab('profile');
    }
  };

  const handleSettingsClick = () => {
    setIsOpen(false);
    if (onOpenSettings) {
      onOpenSettings();
    } else if (isOfficer) {
      setOfficerTab('settings');
    } else {
      setStudentTab('profile');
    }
  };

  const handleSignOutClick = async () => {
    setIsOpen(false);
    await handleLogout();
  };

  return (
    <div className="relative select-none" ref={dropdownRef}>
      {/* Profile Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 pl-2 pr-2.5 py-1.5 rounded-xl hover:bg-[#151C32] transition-all border border-transparent hover:border-[#27324A] group cursor-pointer"
      >
        {/* Avatar Badge */}
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shadow-xs transition-transform group-hover:scale-105 ${
          isOfficer 
            ? 'bg-[#0B1020] text-[#A78BFA] border border-[#27324A]' 
            : 'bg-[#7C3AED]/20 text-[#C4B5FD] border border-[#7C3AED]/40'
        }`}>
          {isOfficer ? (
            <ShieldCheck className="w-4 h-4 text-[#A78BFA]" />
          ) : (
            <GraduationCap className="w-4 h-4 text-[#C4B5FD]" />
          )}
        </div>

        {/* User Labels */}
        <div className="hidden sm:block text-left">
          <div className="text-xs font-semibold text-[#F8FAFC] leading-tight flex items-center gap-1">
            <span>{displayName}</span>
          </div>
          <div className="text-[10px] text-[#94A3B8] font-mono leading-tight mt-0.5">
            {displaySubtitle}
          </div>
        </div>

        <ChevronDown className={`w-3.5 h-3.5 text-[#94A3B8] transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#A78BFA]' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-[#151C32] rounded-2xl border border-[#27324A] shadow-2xl py-2 z-50 animate-scaleIn text-xs text-[#F8FAFC]">
          {/* Header Card */}
          <div className="px-4 py-3 border-b border-[#27324A] bg-[#0F172A] rounded-t-2xl">
            <div className="font-semibold text-sm text-[#F8FAFC]">{displayName}</div>
            <div className="text-[11px] text-[#94A3B8] truncate mt-0.5">{displayEmail}</div>
            <div className="mt-2 flex items-center gap-1.5">
              <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                isOfficer
                  ? 'bg-[#0B1020] text-[#C4B5FD] border-[#27324A]'
                  : 'bg-[#7C3AED]/20 text-[#C4B5FD] border-[#7C3AED]/40'
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
                {isOfficer ? 'Placement Officer' : 'Student (Batch 2026)'}
              </span>
              {!isOfficer && (
                <span className="text-[10px] font-mono text-[#94A3B8] bg-[#111827] px-1.5 py-0.5 rounded border border-[#27324A]">
                  {displaySubtitle}
                </span>
              )}
            </div>
          </div>

          {/* Menu Options */}
          <div className="p-1.5 space-y-0.5">
            <button
              type="button"
              onClick={handleProfileClick}
              className="w-full text-left px-3 py-2 rounded-xl text-[#CBD5E1] hover:bg-[#1B2340] hover:text-white flex items-center gap-2.5 transition-colors font-medium cursor-pointer"
            >
              <User className="w-4 h-4 text-[#A78BFA]" />
              <span>{isOfficer ? 'Officer Profile' : 'My Profile & Academics'}</span>
            </button>

            <button
              type="button"
              onClick={handleSettingsClick}
              className="w-full text-left px-3 py-2 rounded-xl text-[#CBD5E1] hover:bg-[#1B2340] hover:text-white flex items-center gap-2.5 transition-colors font-medium cursor-pointer"
            >
              <Settings className="w-4 h-4 text-[#A78BFA]" />
              <span>Account Settings</span>
            </button>
          </div>

          {/* Sign Out Action */}
          <div className="pt-1 mt-1 border-t border-[#27324A] p-1.5">
            <button
              type="button"
              onClick={handleSignOutClick}
              className="w-full text-left px-3 py-2 rounded-xl text-[#EF4444] hover:bg-rose-950/40 hover:text-rose-400 flex items-center gap-2.5 transition-colors font-semibold cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
