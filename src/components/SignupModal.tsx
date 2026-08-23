import React, { useState } from 'react';
import { UserAccount, ContactPlatform } from '../types';
import { AVATAR_OPTIONS } from '../utils/leaderboard';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import { GoogleIcon } from './GoogleIcon';
import { 
  Sparkles, 
  Coins, 
  Trophy, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  ShieldCheck,
  Send,
  MessageSquare,
  Lock,
  ArrowRight,
  Mail,
  LogIn,
  UserPlus,
  ArrowLeft,
  KeyRound
} from 'lucide-react';

interface SignupModalProps {
  isOpen: boolean;
  onCompleteSignup: (account: Partial<UserAccount>) => void;
  initialAccount?: UserAccount;
}

type AuthFlowMode = 'landing' | 'signin' | 'signup';

export const SignupModal: React.FC<SignupModalProps> = ({
  isOpen,
  onCompleteSignup,
  initialAccount,
}) => {
  // Mode: 'landing' (2 big stacked tiles), 'signin', 'signup'
  const [flowMode, setFlowMode] = useState<AuthFlowMode>('landing');
  
  // Method within sign in / sign up: 'google' or 'email'
  const [authMethod, setAuthMethod] = useState<'google' | 'email'>('email');

  // Form states
  const [email, setEmail] = useState<string>(initialAccount?.email || '');
  const [password, setPassword] = useState<string>('');
  const [username, setUsername] = useState<string>(initialAccount?.username || '');
  const [platform, setPlatform] = useState<ContactPlatform>(initialAccount?.contactPlatform || 'discord');
  const [handle, setHandle] = useState<string>(initialAccount?.contactHandle || '');
  const [avatar, setAvatar] = useState<string>(initialAccount?.avatar || '👑');
  const [googleLinked, setGoogleLinked] = useState<boolean>(initialAccount?.googleLinked || false);
  const [googleEmail, setGoogleEmail] = useState<string>(initialAccount?.googleEmail || '');
  const [googleName, setGoogleName] = useState<string>(initialAccount?.googleName || '');
  const [googlePicture, setGooglePicture] = useState<string>(initialAccount?.googlePicture || '');
  const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  if (!isOpen) return null;

  // Quick 1-Click Google Sign-in flow
  const handleGoogleAuth = (isExistingUserSignIn: boolean) => {
    setIsGoogleLoading(true);
    sound.playChip();

    setTimeout(() => {
      const detectedEmail = email.trim() || 'thomasjoe55@gmail.com';
      const detectedName = username.trim() || (isExistingUserSignIn ? 'Thomas J' : detectedEmail.split('@')[0] || 'Thomas J');
      const avatarPic = 'https://lh3.googleusercontent.com/a/default-user';

      setGoogleLinked(true);
      setGoogleEmail(detectedEmail);
      setGoogleName(detectedName);
      setGooglePicture(avatarPic);
      setEmail(detectedEmail);
      if (!username.trim()) {
        setUsername(detectedName.replace(/\s+/g, '_'));
      }
      setIsGoogleLoading(false);
      sound.playProfit();

      // If signing in, complete directly
      if (isExistingUserSignIn) {
        sound.playWin(true);
        confetti({ particleCount: 70, spread: 55, origin: { y: 0.6 } });
        onCompleteSignup({
          username: detectedName.replace(/\s+/g, '_'),
          contactPlatform: platform,
          contactHandle: handle.trim() || `${detectedName}#0001`,
          avatar,
          isRegistered: true,
          authMethod: 'google',
          email: detectedEmail,
          googleLinked: true,
          googleEmail: detectedEmail,
          googleName: detectedName,
          googlePicture: avatarPic,
        });
      }
    }, 600);
  };

  // Sign in existing user with Email
  const handleEmailSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 4) {
      setError('Please enter your account password (at least 4 characters).');
      return;
    }

    sound.playWin(true);
    confetti({ particleCount: 70, spread: 55, origin: { y: 0.6 } });
    
    // Derive name from email if no username saved
    const derivedName = username.trim() || email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_');
    
    onCompleteSignup({
      username: derivedName,
      email: email.trim(),
      authMethod: 'email',
      contactPlatform: platform,
      contactHandle: handle.trim() || `${derivedName}#0001`,
      avatar,
      isRegistered: true,
    });
  };

  // Sign up new user
  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Please enter a Gambler nickname / display name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 4) {
      setError('Please enter a secure password (at least 4 characters).');
      return;
    }
    if (!handle.trim()) {
      setError(`Please provide your ${platform === 'discord' ? 'Discord' : 'Telegram'} handle for manual winner payouts.`);
      return;
    }

    sound.playWin(true);
    confetti({ particleCount: 90, spread: 65, origin: { y: 0.6 } });

    onCompleteSignup({
      username: username.trim(),
      email: email.trim(),
      authMethod: googleLinked ? 'google' : 'email',
      contactPlatform: platform,
      contactHandle: handle.trim(),
      avatar,
      isRegistered: true,
      googleLinked,
      googleEmail: googleLinked ? googleEmail : undefined,
      googleName: googleLinked ? googleName : undefined,
      googlePicture: googleLinked ? googlePicture : undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-3xl bg-zinc-950 border-2 border-amber-500/60 shadow-2xl p-5 sm:p-7 relative overflow-hidden text-center animate-in fade-in zoom-in-95 duration-200 max-h-[94vh] overflow-y-auto">
        {/* Ambient Top Glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-amber-500/10 via-transparent to-transparent pointer-events-none" />

        {/* Casino Badge */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-500 p-0.5 shadow-xl shadow-amber-500/30 flex items-center justify-center mx-auto mb-3">
          <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center text-3xl font-black text-amber-300">
            🎰
          </div>
        </div>

        <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-zinc-100">
          FreebiesOnly
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-md mx-auto mb-5">
          Daily High-Stakes Leaderboards • 12:00 AM EST Balance Reset • Manual Cash Payouts
        </p>

        {/* ========================================================================= */}
        {/* DEFAULT VIEW: 2 BIG TILES STACKED VERTICALLY (SIGN IN / SIGN UP)          */}
        {/* ========================================================================= */}
        {flowMode === 'landing' && (
          <div className="space-y-3.5 my-2">
            {/* TILE 1: SIGN IN (BIG TILE) */}
            <button
              id="landing-sign-in-tile"
              type="button"
              onClick={() => {
                sound.playChip();
                setError('');
                setFlowMode('signin');
              }}
              className="w-full p-5 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-zinc-950 border-2 border-zinc-700/80 hover:border-amber-400/80 text-left transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] group shadow-xl relative overflow-hidden cursor-pointer"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <LogIn className="w-20 h-20 text-amber-400" />
              </div>

              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 group-hover:scale-110 transition-transform">
                    <LogIn className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black uppercase tracking-wider text-zinc-100 group-hover:text-amber-300 transition-colors flex items-center gap-2">
                      <span>Sign In</span>
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Already have an account? Sign in with Email or Google
                    </p>
                  </div>
                </div>

                <div className="w-8 h-8 rounded-full bg-zinc-800 group-hover:bg-amber-400 group-hover:text-zinc-950 text-zinc-400 flex items-center justify-center transition-colors shrink-0">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </button>

            {/* TILE 2: SIGN UP (BIG TILE) */}
            <button
              id="landing-sign-up-tile"
              type="button"
              onClick={() => {
                sound.playChip();
                setError('');
                setFlowMode('signup');
              }}
              className="w-full p-5 rounded-2xl bg-gradient-to-br from-amber-500/20 via-yellow-500/10 to-zinc-950 border-2 border-amber-500/60 hover:border-amber-400 text-left transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] group shadow-2xl relative overflow-hidden cursor-pointer"
            >
              <div className="absolute top-0 right-0 p-4 opacity-15 group-hover:opacity-25 transition-opacity">
                <Sparkles className="w-20 h-20 text-yellow-400" />
              </div>

              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 p-0.5 shadow-lg flex items-center justify-center text-zinc-950 font-black group-hover:scale-110 transition-transform">
                    <UserPlus className="w-6 h-6 text-zinc-950" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-black uppercase tracking-wider text-amber-300 group-hover:text-amber-200 transition-colors">
                        Sign Up
                      </h3>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-400 text-zinc-950">
                        +1,000 Free Chips
                      </span>
                    </div>
                    <p className="text-xs text-zinc-300 mt-0.5">
                      Create your Gambler ID with Email or Google
                    </p>
                  </div>
                </div>

                <div className="w-8 h-8 rounded-full bg-amber-500 text-zinc-950 flex items-center justify-center font-bold transition-transform group-hover:translate-x-1 shrink-0">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </button>

            {/* Quick 3 Feature Badges */}
            <div className="grid grid-cols-3 gap-2 pt-2 text-left">
              <div className="p-2.5 rounded-2xl bg-zinc-900/70 border border-zinc-800 text-center">
                <Coins className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                <span className="text-[10px] font-bold text-zinc-300 block">1,000 Daily</span>
                <span className="text-[9px] text-zinc-500">12:00 AM EST reset</span>
              </div>
              <div className="p-2.5 rounded-2xl bg-zinc-900/70 border border-zinc-800 text-center">
                <Clock className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                <span className="text-[10px] font-bold text-zinc-300 block">5x ATM Refills</span>
                <span className="text-[9px] text-zinc-500">100 chips reload</span>
              </div>
              <div className="p-2.5 rounded-2xl bg-zinc-900/70 border border-zinc-800 text-center">
                <Trophy className="w-4 h-4 text-purple-400 mx-auto mb-1" />
                <span className="text-[10px] font-bold text-zinc-300 block">Daily Payouts</span>
                <span className="text-[9px] text-zinc-500">Discord & Telegram</span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW: SIGN IN FLOW (EMAIL & GOOGLE)                                       */}
        {/* ========================================================================= */}
        {flowMode === 'signin' && (
          <div className="space-y-4 text-left animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
              <button
                type="button"
                onClick={() => {
                  sound.playChip();
                  setError('');
                  setFlowMode('landing');
                }}
                className="text-xs font-bold text-zinc-400 hover:text-zinc-200 flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <span className="text-xs font-black uppercase text-amber-400">Sign In to Casino</span>
            </div>

            {/* Quick 1-Click Google Sign-In */}
            <button
              type="button"
              disabled={isGoogleLoading}
              onClick={() => handleGoogleAuth(true)}
              className="w-full py-3 px-4 rounded-xl bg-white hover:bg-zinc-100 text-zinc-900 font-bold text-xs flex items-center justify-center gap-2.5 shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              <GoogleIcon className="w-4 h-4" />
              <span>{isGoogleLoading ? 'Connecting Google Account...' : 'Continue with Google'}</span>
            </button>

            <div className="flex items-center gap-3 my-2 text-zinc-600">
              <div className="h-px bg-zinc-800 flex-1" />
              <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-500">Or with Email</span>
              <div className="h-px bg-zinc-800 flex-1" />
            </div>

            {/* Email Sign In Form */}
            <form onSubmit={handleEmailSignIn} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold uppercase text-zinc-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-zinc-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => {
                      setEmail(e.target.value);
                      setError('');
                    }}
                    placeholder="gambler@example.com"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-zinc-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3 top-3 text-zinc-500" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => {
                      setPassword(e.target.value);
                      setError('');
                    }}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {error && (
                <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 text-zinc-950 font-black text-xs uppercase tracking-wider shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-1"
              >
                <LogIn className="w-4 h-4 text-zinc-950" />
                <span>Sign In to Casino</span>
              </button>
            </form>

            <div className="text-center pt-2">
              <span className="text-xs text-zinc-400">
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => {
                    sound.playChip();
                    setError('');
                    setFlowMode('signup');
                  }}
                  className="text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer"
                >
                  Create one now
                </button>
              </span>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW: SIGN UP FLOW (EMAIL / GOOGLE WITH DISCORD/TELEGRAM PAYOUT HANDLE)   */}
        {/* ========================================================================= */}
        {flowMode === 'signup' && (
          <div className="space-y-4 text-left animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
              <button
                type="button"
                onClick={() => {
                  sound.playChip();
                  setError('');
                  setFlowMode('landing');
                }}
                className="text-xs font-bold text-zinc-400 hover:text-zinc-200 flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <span className="text-xs font-black uppercase text-amber-400">Create Gambler Account</span>
            </div>

            {/* Quick 1-Click Google Sign-In Card */}
            <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                  <GoogleIcon className="w-3.5 h-3.5" />
                  <span>1-Click Google Sign-Up</span>
                </span>
                {googleLinked && (
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Linked</span>
                  </span>
                )}
              </div>

              {!googleLinked ? (
                <button
                  type="button"
                  disabled={isGoogleLoading}
                  onClick={() => handleGoogleAuth(false)}
                  className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-zinc-100 text-zinc-900 font-bold text-xs flex items-center justify-center gap-2.5 shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  <GoogleIcon className="w-4 h-4" />
                  <span>{isGoogleLoading ? 'Connecting Google Account...' : 'Continue with Google'}</span>
                </button>
              ) : (
                <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-emerald-500/30 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-sm font-bold text-emerald-300">
                      {googleName ? googleName.charAt(0).toUpperCase() : 'G'}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-zinc-100 flex items-center gap-1">
                        <span>{googleName || 'Google User'}</span>
                        <span className="text-[10px] text-emerald-400 font-normal">(Linked)</span>
                      </div>
                      <div className="text-[11px] font-mono text-zinc-400">
                        {googleEmail}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      sound.playChip();
                      setGoogleLinked(false);
                    }}
                    className="text-[10px] text-zinc-500 hover:text-zinc-300 underline cursor-pointer"
                  >
                    Change
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 my-1 text-zinc-600">
              <div className="h-px bg-zinc-800 flex-1" />
              <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-500">Account Credentials</span>
              <div className="h-px bg-zinc-800 flex-1" />
            </div>

            <form onSubmit={handleSignupSubmit} className="space-y-3.5">
              {/* Display Name Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1">
                  Gambler Display Name
                </label>
                <input
                  type="text"
                  required
                  maxLength={24}
                  value={username}
                  onChange={e => {
                    setUsername(e.target.value);
                    setError('');
                  }}
                  placeholder="e.g. Satoshi_Rolls, HighRollerDan"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-sm font-semibold text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Email & Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => {
                      setEmail(e.target.value);
                      setError('');
                    }}
                    placeholder="gambler@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => {
                      setPassword(e.target.value);
                      setError('');
                    }}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Contact Platform Selector (Discord or Telegram - required for payouts) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                    Contact For Winner Payouts <span className="text-amber-400">*</span>
                  </label>
                  <span className="text-[10px] text-zinc-500 uppercase font-mono">
                    Required for daily prizes
                  </span>
                </div>

                {/* Platform Toggle */}
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => {
                      sound.playChip();
                      setPlatform('discord');
                    }}
                    className={`py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-black uppercase transition-all cursor-pointer ${
                      platform === 'discord'
                        ? 'bg-[#5865F2]/20 border-[#5865F2] text-indigo-300 ring-2 ring-[#5865F2]/30 shadow-md'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4 text-[#5865F2]" />
                    <span>Discord</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      sound.playChip();
                      setPlatform('telegram');
                    }}
                    className={`py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-black uppercase transition-all cursor-pointer ${
                      platform === 'telegram'
                        ? 'bg-[#229ED9]/20 border-[#229ED9] text-sky-300 ring-2 ring-[#229ED9]/30 shadow-md'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <Send className="w-4 h-4 text-[#229ED9]" />
                    <span>Telegram</span>
                  </button>
                </div>

                {/* Handle Input */}
                <div className="relative">
                  <input
                    type="text"
                    required
                    maxLength={40}
                    value={handle}
                    onChange={e => {
                      setHandle(e.target.value);
                      setError('');
                    }}
                    placeholder={platform === 'discord' ? 'e.g. username#1234 or @username' : 'e.g. @telegram_handle'}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-sm font-mono text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Avatar Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                  Choose Persona Avatar
                </label>
                <div className="grid grid-cols-8 gap-1.5 p-2 rounded-2xl bg-zinc-900/60 border border-zinc-800">
                  {AVATAR_OPTIONS.map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => {
                        sound.playChip();
                        setAvatar(emoji);
                      }}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-xl transition-all cursor-pointer ${
                        avatar === emoji
                          ? 'bg-amber-500/30 border-2 border-amber-400 scale-110 shadow-md'
                          : 'hover:bg-zinc-800 border border-transparent'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 text-zinc-950 font-black text-sm uppercase tracking-wider shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <CheckCircle2 className="w-5 h-5 text-zinc-950" />
                <span>Create Account & Claim 1,000 Chips</span>
              </button>
            </form>

            <div className="text-center pt-1">
              <span className="text-xs text-zinc-400">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    sound.playChip();
                    setError('');
                    setFlowMode('signin');
                  }}
                  className="text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer"
                >
                  Sign In
                </button>
              </span>
            </div>
          </div>
        )}

        <div className="mt-4 text-center">
          <span className="text-[10px] text-zinc-600">
            By entering, you acknowledge the 12:00 AM EST balance reset and daily tournament rules.
          </span>
        </div>
      </div>
    </div>
  );
};
