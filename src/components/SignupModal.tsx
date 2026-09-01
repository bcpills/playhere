import React, { useState } from 'react';
import { UserAccount } from '../types';
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
  Lock, 
  ArrowRight, 
  Mail, 
  LogIn, 
  UserPlus, 
  ArrowLeft, 
  KeyRound,
  DollarSign,
  Gift
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
  const [flowMode, setFlowMode] = useState<AuthFlowMode>('landing');
  const [authMethod, setAuthMethod] = useState<'google' | 'email'>('email');

  // Form states
  const [email, setEmail] = useState<string>(initialAccount?.email || '');
  const [password, setPassword] = useState<string>('');
  const [username, setUsername] = useState<string>(initialAccount?.username || '');
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
    
    const derivedName = username.trim() || email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_');
    
    onCompleteSignup({
      username: derivedName,
      email: email.trim(),
      authMethod: 'email',
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

    sound.playWin(true);
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });

    onCompleteSignup({
      username: username.trim(),
      email: email.trim(),
      authMethod: googleLinked ? 'google' : 'email',
      avatar,
      isRegistered: true,
      googleLinked,
      googleEmail: googleLinked ? googleEmail : undefined,
      googleName: googleLinked ? googleName : undefined,
      googlePicture: googleLinked ? googlePicture : undefined,
      cashBalance: 2.00, // $2 Sign up bonus
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-lg rounded-3xl bg-zinc-950 border-2 border-purple-500/50 shadow-2xl p-5 sm:p-7 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* LANDING SCREEN: 2 BIG STACKED TILES */}
        {flowMode === 'landing' && (
          <div className="space-y-5">
            <div className="text-center space-y-1.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-amber-500 flex items-center justify-center text-2xl mx-auto shadow-xl shadow-purple-500/30">
                🃏
              </div>
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-zinc-100">
                Welcome to ChipZone
              </h2>
              <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                Real money payouts, 12 AM EST daily wager tournaments, and high-roller rewards.
              </p>
            </div>

            {/* Bonus Banner */}
            <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-zinc-900 to-amber-950/60 border border-emerald-500/50 text-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 block mb-0.5">
                New Player Welcome Package
              </span>
              <div className="text-sm sm:text-base font-black text-white flex items-center justify-center gap-2">
                <span className="text-emerald-300 font-mono">$2.00 Real Cash</span>
                <span className="text-zinc-500">+</span>
                <span className="text-amber-300 font-mono">1,000,000 Gold Coins</span>
              </div>
            </div>

            {/* Two Big Stacked Tiles */}
            <div className="space-y-3 pt-1">
              
              {/* Tile 1: Sign In Existing User */}
              <button
                type="button"
                onClick={() => {
                  sound.playChip();
                  setFlowMode('signin');
                  setError('');
                }}
                className="w-full p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-950/60 via-zinc-900 to-zinc-900 border-2 border-purple-500/50 hover:border-purple-400 transition-all text-left flex items-center justify-between group shadow-lg shadow-purple-950/30 cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-purple-600/20 border border-purple-500/40 text-purple-300 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <LogIn className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-sm sm:text-base font-black text-zinc-100 uppercase tracking-wider block">
                      Sign In
                    </span>
                    <span className="text-[11px] text-zinc-400 block">
                      Access your existing high-roller profile & bankroll
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-purple-400 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Tile 2: Sign Up New User */}
              <button
                type="button"
                onClick={() => {
                  sound.playChip();
                  setFlowMode('signup');
                  setError('');
                }}
                className="w-full p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-950/60 via-zinc-900 to-zinc-900 border-2 border-amber-500/50 hover:border-amber-400 transition-all text-left flex items-center justify-between group shadow-lg shadow-amber-950/30 cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-sm sm:text-base font-black text-zinc-100 uppercase tracking-wider block">
                      Create VIP Account
                    </span>
                    <span className="text-[11px] text-emerald-300 font-bold block">
                      Instant $2.00 Cash + 1,000,000 Coins Bonus
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-amber-400 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        )}

        {/* SIGN IN FLOW */}
        {flowMode === 'signin' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  sound.playChip();
                  setFlowMode('landing');
                  setError('');
                }}
                className="flex items-center gap-1 text-xs font-bold text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <h2 className="text-sm font-black uppercase tracking-wider text-zinc-200">
                Sign In to ChipZone
              </h2>
              <div className="w-10" />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/60 text-rose-300 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* 1-Click Google Sign In */}
            <button
              type="button"
              onClick={() => handleGoogleAuth(true)}
              disabled={isGoogleLoading}
              className="w-full py-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 font-bold text-xs flex items-center justify-center gap-2.5 transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              <GoogleIcon className="w-4 h-4" />
              <span>{isGoogleLoading ? 'Connecting Google...' : 'Continue with Google'}</span>
            </button>

            <div className="flex items-center gap-3 my-2">
              <div className="flex-1 h-px bg-zinc-800" />
              <span className="text-[10px] uppercase font-bold text-zinc-500">Or sign in with email</span>
              <div className="flex-1 h-px bg-zinc-800" />
            </div>

            <form onSubmit={handleEmailSignIn} className="space-y-3">
              <div>
                <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your.email@gmail.com"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-purple-600/30 transition-all cursor-pointer mt-2"
              >
                Sign In
              </button>
            </form>
          </div>
        )}

        {/* SIGN UP FLOW */}
        {flowMode === 'signup' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  sound.playChip();
                  setFlowMode('landing');
                  setError('');
                }}
                className="flex items-center gap-1 text-xs font-bold text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <h2 className="text-sm font-black uppercase tracking-wider text-zinc-200">
                Create Gambler Account
              </h2>
              <div className="w-10" />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/60 text-rose-300 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* 1-Click Google Sign Up */}
            <button
              type="button"
              onClick={() => handleGoogleAuth(false)}
              disabled={isGoogleLoading}
              className="w-full py-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 font-bold text-xs flex items-center justify-center gap-2.5 transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              <GoogleIcon className="w-4 h-4" />
              <span>{isGoogleLoading ? 'Connecting Google...' : 'Auto-Fill with Google (1-Click)'}</span>
            </button>

            <div className="flex items-center gap-3 my-2">
              <div className="flex-1 h-px bg-zinc-800" />
              <span className="text-[10px] uppercase font-bold text-zinc-500">Account Credentials</span>
              <div className="flex-1 h-px bg-zinc-800" />
            </div>

            <form onSubmit={handleSignupSubmit} className="space-y-3">
              <div>
                <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Choose Avatar</label>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                  {AVATAR_OPTIONS.map(a => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => setAvatar(a)}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 border cursor-pointer ${
                        avatar === a ? 'bg-amber-500/30 border-amber-400 ring-2 ring-amber-400/40' : 'bg-zinc-900 border-zinc-800'
                      }`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Display Name</label>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="e.g. Thomas_J"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your.email@gmail.com"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-amber-500 to-yellow-400 hover:from-emerald-400 hover:to-yellow-300 text-zinc-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all cursor-pointer mt-2"
              >
                Complete Registration (Get $2.00 Cash + 1,000,000 GC)
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
