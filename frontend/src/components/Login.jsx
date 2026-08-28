import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Sparkles, 
  Shield, 
  ShieldCheck, 
  Mail, 
<<<<<<< HEAD
=======
  Lock, 
  Eye, 
  EyeOff, 
>>>>>>> 7ea430ac41087f03137a7143ffe3d545e060af90
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  KeyRound, 
  RefreshCw, 
  ArrowLeft, 
  Check 
} from 'lucide-react';
import { usePlacement } from '../context/PlacementContext';

export default function Login({ onLogin }) {
  const { handleInitiateLogin, handleVerifyOtp, handleResendOtp } = usePlacement();
  
  // Step State: 'credentials' | 'otp'
  const [step, setStep] = useState('credentials');
<<<<<<< HEAD
  const [role, setRole] = useState('student'); // 'officer' | 'student'
  const [email, setEmail] = useState('');
=======
  const [role, setRole] = useState('officer'); // 'officer' | 'student'
  const [email, setEmail] = useState('tpo@apexinstitute.edu');
  const [password, setPassword] = useState('officer123');
  const [showPassword, setShowPassword] = useState(false);
>>>>>>> 7ea430ac41087f03137a7143ffe3d545e060af90
  const [keepSignedIn, setKeepSignedIn] = useState(true);
  
  // OTP Session State
  const [sessionId, setSessionId] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
<<<<<<< HEAD
=======
  const [devOtp, setDevOtp] = useState('');
  const [isDevMode, setIsDevMode] = useState(false);
  const [devModeMessage, setDevModeMessage] = useState('');
>>>>>>> 7ea430ac41087f03137a7143ffe3d545e060af90
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [cooldown, setCooldown] = useState(0);
  const [resending, setResending] = useState(false);
  
  // UI Status State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const otpInputRefs = useRef([]);

  // Countdown timer for OTP resend cooldown
  useEffect(() => {
    let timer = null;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [cooldown]);

  // Focus first OTP box when entering OTP step
  useEffect(() => {
    if (step === 'otp') {
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 150);
    }
  }, [step]);

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setError('');
    setSuccessMsg('');
    setStep('credentials');
    setOtpDigits(['', '', '', '', '', '']);
    if (newRole === 'officer') {
      setEmail('tpo@apexinstitute.edu');
<<<<<<< HEAD
    } else {
      setEmail('');
=======
      setPassword('officer123');
    } else {
      setEmail('student@example.com');
      setPassword('student123');
>>>>>>> 7ea430ac41087f03137a7143ffe3d545e060af90
    }
  };

  // STEP 1: Submit Credentials
  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
<<<<<<< HEAD
    if (!email.trim()) {
      setError('Please enter your email address.');
=======
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email or ID and password.');
>>>>>>> 7ea430ac41087f03137a7143ffe3d545e060af90
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
<<<<<<< HEAD
      const res = await handleInitiateLogin(email.trim(), '', 'email', role);
=======
      const res = await handleInitiateLogin(email.trim(), password.trim());
>>>>>>> 7ea430ac41087f03137a7143ffe3d545e060af90
      if (res.status === 'otp_required') {
        setSessionId(res.session_id);
        setMaskedEmail(res.email_masked || email.trim());
        setCooldown(res.cooldown_seconds || 60);
<<<<<<< HEAD
=======
        setIsDevMode(Boolean(res.dev_mode));
        setDevModeMessage(res.dev_mode_message || 'OTP delivery is in development mode.');
        if (res.dev_otp) {
          setDevOtp(res.dev_otp);
        }
>>>>>>> 7ea430ac41087f03137a7143ffe3d545e060af90
        setStep('otp');
        setSuccessMsg(res.message || 'OTP sent successfully.');
      } else if (res.token && onLogin) {
        onLogin(res.user);
      }
    } catch (err) {
<<<<<<< HEAD
      setError(err.message || 'Unable to send the verification code. Please check the email address.');
=======
      setError(err.message || 'Invalid credentials. Please verify your email and password.');
>>>>>>> 7ea430ac41087f03137a7143ffe3d545e060af90
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Handle Individual OTP Box Input
  const handleOtpDigitChange = (index, value) => {
    // Only accept numeric characters
    const cleanVal = value.replace(/\D/g, '');
    
    // If user pasted or typed multiple digits in one box
    if (cleanVal.length > 1) {
      handleOtpPasteString(cleanVal);
      return;
    }

    const newDigits = [...otpDigits];
    newDigits[index] = cleanVal;
    setOtpDigits(newDigits);
    setError('');

    // Move to next input box if a digit was entered
    if (cleanVal && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otpDigits[index] && index > 0) {
        // Current box empty: move to previous and clear it
        const newDigits = [...otpDigits];
        newDigits[index - 1] = '';
        setOtpDigits(newDigits);
        otpInputRefs.current[index - 1]?.focus();
      } else {
        // Clear current box
        const newDigits = [...otpDigits];
        newDigits[index] = '';
        setOtpDigits(newDigits);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text');
    handleOtpPasteString(pasteData);
  };

  const handleOtpPasteString = (str) => {
    const cleanDigits = str.replace(/\D/g, '').slice(0, 6);
    if (!cleanDigits) return;

    const newDigits = ['', '', '', '', '', ''];
    for (let i = 0; i < cleanDigits.length; i++) {
      newDigits[i] = cleanDigits[i];
    }
    setOtpDigits(newDigits);
    setError('');

    // Focus last filled or next empty box
    const nextIndex = Math.min(cleanDigits.length, 5);
    otpInputRefs.current[nextIndex]?.focus();
  };

  // STEP 2: Submit OTP Verification
  const handleVerifyOtpSubmit = async (e) => {
    if (e) e.preventDefault();
    const enteredOtp = otpDigits.join('');
    if (enteredOtp.length < 6) {
      setError('Please enter all 6 digits of the verification code.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await handleVerifyOtp(sessionId, enteredOtp);
      if (res.token && onLogin) {
        onLogin(res.user);
      }
    } catch (err) {
      setError(err.message || 'Incorrect OTP. Please check the code and try again.');
      otpInputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP Action
  const handleResendClick = async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await handleResendOtp(sessionId);
      setCooldown(res.cooldown_seconds || 60);
      setOtpDigits(['', '', '', '', '', '']);
<<<<<<< HEAD
=======
      if (res.dev_otp) {
        setDevOtp(res.dev_otp);
      }
>>>>>>> 7ea430ac41087f03137a7143ffe3d545e060af90
      setSuccessMsg('A new 6-digit OTP has been sent to your registered email.');
      otpInputRefs.current[0]?.focus();
    } catch (err) {
      setError(err.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setResending(false);
    }
  };

<<<<<<< HEAD
=======
  // Quick fill helper for development/demo
  const handleFillDevOtp = () => {
    if (devOtp && devOtp.length === 6) {
      handleOtpPasteString(devOtp);
    }
  };

>>>>>>> 7ea430ac41087f03137a7143ffe3d545e060af90
  const handleBackToCredentials = () => {
    setStep('credentials');
    setError('');
    setSuccessMsg('');
    setOtpDigits(['', '', '', '', '', '']);
  };

  // Format seconds as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-[#0B1020] text-[#F8FAFC] flex flex-col justify-between font-sans antialiased selection:bg-[#7C3AED] selection:text-white">
      
      {/* Top Global Navigation Bar */}
      <header className="px-6 py-4 border-b border-[#27324A] bg-[#111827]/90 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          {/* Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white flex items-center justify-center shadow-purple flex-shrink-0">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-[#F8FAFC]">
                  AI Placement Operations Agent
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#A78BFA] bg-[#7C3AED]/20 border border-[#7C3AED]/40 px-2 py-0.5 rounded-full font-mono">
                  <Sparkles className="w-3 h-3 text-[#A78BFA]" />
                  v2.0 Operations
                </span>
              </div>
              <span className="text-xs text-[#94A3B8] block font-normal mt-0.5">
                Apex Institute of Technology &middot; Office of Career Services &amp; Placement
              </span>
            </div>
          </div>

          {/* Top-Right Live Status Pill */}
          <div className="flex items-center gap-2 bg-[#22C55E]/15 text-[#4ADE80] border border-[#22C55E]/30 px-3 py-1.5 rounded-xl text-xs font-medium shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse flex-shrink-0" />
            <div className="leading-tight">
              <div className="font-bold text-[11px] text-[#4ADE80]">Agent Operations: Online</div>
              <div className="text-[10px] text-[#22C55E]">256-bit Encrypted Portal</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Centered Sign-In Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16 flex items-center justify-center">
        <div className="w-full max-w-lg mx-auto">
          
          {/* Centered Auth Card */}
          <div className="bg-[#151C32] border border-[#27324A] rounded-3xl p-7 sm:p-9 shadow-2xl flex flex-col justify-between text-[#F8FAFC]">
            
            {/* ========================================================================= */}
            {/* STEP 1: CREDENTIALS ENTRY SCREEN */}
            {/* ========================================================================= */}
            {step === 'credentials' ? (
              <div className="space-y-5">
                {/* Header & Badge */}
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-[#7C3AED]/20 text-[#A78BFA] flex items-center justify-center border border-[#7C3AED]/40">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#94A3B8] bg-[#111827] border border-[#27324A] px-2.5 py-1 rounded-full font-mono">
                    STEP 1 OF 2 &middot; CREDENTIALS
                  </span>
                </div>

                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-[#F8FAFC]">
                    Placement Portal Sign In
                  </h2>
                  <p className="text-xs text-[#94A3B8] mt-1">
<<<<<<< HEAD
                    Enter any email address to receive a secure one-time verification code.
=======
                    Sign in with your campus credentials to initiate secure 2-step OTP verification.
>>>>>>> 7ea430ac41087f03137a7143ffe3d545e060af90
                  </p>
                </div>

                {/* Role Selector */}
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] mb-1.5">
                    Select Access Role
                  </div>
                  <div className="grid grid-cols-2 gap-2 p-1 bg-[#111827] border border-[#27324A] rounded-xl">
                    <button
                      type="button"
                      onClick={() => handleRoleChange('officer')}
                      className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                        role === 'officer'
                          ? 'bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white shadow-purple'
                          : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                      }`}
                    >
                      Placement Officer
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRoleChange('student')}
                      className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                        role === 'student'
                          ? 'bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white shadow-purple'
                          : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                      }`}
                    >
                      Student Candidate
                    </button>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800 text-xs text-rose-300 flex items-start gap-2 animate-fadeIn">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Form Fields */}
                <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                  {/* Email / ID */}
                  <div>
                    <label className="block text-xs font-semibold text-[#CBD5E1] mb-1.5">
                      EMAIL ADDRESS OR STUDENT ID
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-3" />
                      <input
                        type="text"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
<<<<<<< HEAD
                        placeholder={role === 'officer' ? 'approved.officer@example.com' : 'you@example.com'}
=======
                        placeholder={role === 'officer' ? 'tpo@apexinstitute.edu' : 'student@example.com'}
>>>>>>> 7ea430ac41087f03137a7143ffe3d545e060af90
                        disabled={loading}
                        className="w-full bg-[#111827] border border-[#334155] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all"
                        required
                      />
                    </div>
                  </div>

<<<<<<< HEAD
=======
                  {/* Password */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-[#CBD5E1]">
                        PASSWORD
                      </label>
                      <button
                        type="button"
                        onClick={() => setError(role === 'officer' ? 'Demo Officer: officer123' : 'Demo Student: student123')}
                        className="text-[11px] text-[#A78BFA] hover:underline font-medium cursor-pointer"
                      >
                        Demo credentials?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-3" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        disabled={loading}
                        className="w-full bg-[#111827] border border-[#334155] rounded-xl pl-10 pr-10 py-2.5 text-xs text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-2.5 text-[#94A3B8] hover:text-white cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-[#94A3B8]" />}
                      </button>
                    </div>
                  </div>

>>>>>>> 7ea430ac41087f03137a7143ffe3d545e060af90
                  {/* Keep Signed In */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="keepSignedIn"
                      checked={keepSignedIn}
                      onChange={(e) => setKeepSignedIn(e.target.checked)}
                      className="w-4 h-4 text-[#7C3AED] rounded border-[#334155] bg-[#111827] focus:ring-[#7C3AED]"
                    />
                    <label htmlFor="keepSignedIn" className="text-xs text-[#94A3B8] cursor-pointer select-none">
                      Keep me signed in on this workstation
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] hover:from-[#4338CA] hover:to-[#6D28D9] text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-purple disabled:opacity-50 active:scale-[0.99] cursor-pointer"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Validating credentials...</span>
                      </div>
                    ) : (
                      <>
                        <span>Continue to OTP Verification</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            ) : (
              /* ========================================================================= */
              /* STEP 2: 6-BOX OTP VERIFICATION SCREEN */
              /* ========================================================================= */
              <div className="space-y-5 animate-fadeIn">
                {/* Header & Back Button */}
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleBackToCredentials}
                    className="inline-flex items-center gap-1.5 text-xs text-[#94A3B8] hover:text-white transition-colors cursor-pointer py-1 px-2 rounded-lg hover:bg-[#111827]"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#A78BFA] bg-[#7C3AED]/20 border border-[#7C3AED]/40 px-2.5 py-1 rounded-full font-mono">
                    STEP 2 OF 2 &middot; 2FA VERIFICATION
                  </span>
                </div>

                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-[#F8FAFC] flex items-center gap-2">
                    <KeyRound className="w-6 h-6 text-[#A78BFA]" />
                    <span>Verify your account</span>
                  </h2>
                  <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed">
                    Enter the 6-digit OTP sent to your registered email/mobile.
                  </p>
                  {maskedEmail && (
                    <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-mono text-[#06B6D4] bg-[#06B6D4]/10 border border-[#06B6D4]/30 px-2.5 py-1 rounded-lg">
                      <Mail className="w-3.5 h-3.5" />
                      <span>{maskedEmail}</span>
                    </div>
                  )}
                </div>

<<<<<<< HEAD
=======
                {/* Development Mode Notice Banner */}
                {isDevMode && (
                  <div className="p-3 rounded-2xl bg-gradient-to-r from-[#1E1B4B] to-[#151C32] border border-[#7C3AED]/50 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#A78BFA] flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                        <Sparkles className="w-3.5 h-3.5 text-[#06B6D4]" />
                        {devModeMessage}
                      </span>
                      {devOtp && (
                        <button
                          type="button"
                          onClick={handleFillDevOtp}
                          className="px-2 py-0.5 rounded-md bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-[10px] font-bold cursor-pointer transition-all active:scale-95 shadow-xs"
                        >
                          Auto-Fill
                        </button>
                      )}
                    </div>
                    {devOtp && (
                      <div className="text-[11px] text-[#CBD5E1] flex items-center justify-between pt-1 border-t border-white/10 font-mono">
                        <span>Generated OTP: <strong className="text-white tracking-widest text-xs">{devOtp}</strong></span>
                        <span className="text-[10px] text-[#94A3B8]">(Demo visible)</span>
                      </div>
                    )}
                  </div>
                )}

>>>>>>> 7ea430ac41087f03137a7143ffe3d545e060af90
                {/* Error / Success Messages */}
                {error && (
                  <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800 text-xs text-rose-300 flex items-start gap-2 animate-fadeIn">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
                    <span>{error}</span>
                  </div>
                )}

                {successMsg && !error && (
                  <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800 text-xs text-emerald-300 flex items-start gap-2 animate-fadeIn">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-400" />
                    <span>{successMsg}</span>
                  </div>
                )}

                {/* 6 Individual OTP Boxes */}
                <form onSubmit={handleVerifyOtpSubmit} className="space-y-5">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] mb-2 text-center">
                      6-DIGIT VERIFICATION CODE
                    </label>
                    <div className="flex items-center justify-between gap-2 sm:gap-2.5" onPaste={handleOtpPaste}>
                      {otpDigits.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={(el) => (otpInputRefs.current[idx] = el)}
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                          disabled={loading}
                          className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-bold font-mono rounded-xl bg-[#111827] border transition-all focus:outline-none ${
                            digit
                              ? 'border-[#7C3AED] text-white shadow-purple bg-[#1B1938]'
                              : 'border-[#334155] text-[#CBD5E1] focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/40'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Verify Action Button */}
                  <button
                    type="submit"
                    disabled={loading || otpDigits.join('').length < 6}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] hover:from-[#4338CA] hover:to-[#6D28D9] disabled:opacity-40 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-purple active:scale-[0.99] cursor-pointer"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Verifying OTP code...</span>
                      </div>
                    ) : (
                      <>
                        <span>Verify OTP &amp; {role === 'officer' ? 'Open Dashboard' : 'Open Student Portal'}</span>
                        <Check className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  {/* Resend OTP Button & Countdown */}
                  <div className="pt-2 flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={handleResendClick}
                      disabled={cooldown > 0 || resending}
                      className="font-medium text-[#A78BFA] hover:text-white disabled:text-[#64748B] disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      {resending && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                      <span>Resend OTP</span>
                    </button>

                    {cooldown > 0 ? (
                      <span className="font-mono text-[#94A3B8] text-xs">
                        Resend in <strong className="text-[#F8FAFC]">{formatTime(cooldown)}</strong>
                      </span>
                    ) : (
                      <span className="text-[11px] text-[#4ADE80] font-medium">Ready to resend</span>
                    )}
                  </div>
                </form>
              </div>
            )}

            {/* Bottom Security Footer */}
            <div className="pt-6 mt-6 border-t border-[#27324A] text-center space-y-1">
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#94A3B8] font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-[#22C55E]" />
                <span className="uppercase tracking-wider font-semibold text-[#CBD5E1]">Secure Placement Operations</span>
              </div>
              <p className="text-[10px] text-[#64748B]">
                Authorized personnel only &middot; Multi-factor verification active
              </p>
            </div>

          </div>

        </div>
      </main>

      {/* Global Footer */}
      <footer className="border-t border-[#27324A] bg-[#080C18] py-3 px-6 text-center text-xs text-[#94A3B8]">
        &copy; 2026 Apex Institute of Technology &middot; Office of Career Services &amp; Placement
      </footer>
    </div>
  );
}