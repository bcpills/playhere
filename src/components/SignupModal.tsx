import React, { useState } from 'react';
import { UserAccount, ContactPlatform } from '../types';
import { AVATAR_OPTIONS } from '../utils/leaderboard';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import { 
  Sparkles, 
  Coins, 
  Trophy, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  ShieldCheck,
  Send,
  MessageSquare
} from 'lucide-react';

interface SignupModalProps {
  isOpen: boolean;
  onCompleteSignup: (account: Partial<UserAccount>) => void;
  initialAccount?: UserAccount;
}

export const SignupModal: React.FC<SignupModalProps> = ({
  isOpen,
  onCompleteSignup,
  initialAccount,
}) => {
  const [username, setUsername] = useState<string>(initialAccount?.username || '');
  const [platform, setPlatform] = useState<ContactPlatform>(initialAccount?.contactPlatform || 'discord');
  const [handle, setHandle] = useState<string>(initialAccount?.contactHandle || '');
  const [avatar, setAvatar] = useState<string>(initialAccount?.avatar || '👑');
  const [error, setError] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Please enter a Gambler nickname / display name.');
      return;
    }
    if (!handle.trim()) {
      setError(`Please provide your ${platform === 'discord' ? 'Discord' : 'Telegram'} handle for manual winner payouts.`);
      return;
    }

    sound.playWin(true);
    confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });

    onCompleteSignup({
      username: username.trim(),
      contactPlatform: platform,
      contactHandle: handle.trim(),
      avatar,
      isRegistered: true,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-3xl bg-zinc-950 border-2 border-amber-500/60 shadow-2xl p-5 sm:p-7 relative overflow-hidden text-center animate-in fade-in zoom-in-95 duration-200">
        {/* Ambient Top Glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-amber-500/10 via-transparent to-transparent pointer-events-none" />

        {/* Casino Badge */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-500 p-0.5 shadow-xl shadow-amber-500/30 flex items-center justify-center mx-auto mb-3">
          <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center text-3xl font-black text-amber-300">
            🎰
          </div>
        </div>

        <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-zinc-100">
          The Bullshit Casino
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-md mx-auto">
          Register your Gambler ID to join daily tournament leaderboards and claim your <strong>1,000 Starting Chips</strong>.
        </p>

        {/* Rule Badges */}
        <div className="grid grid-cols-3 gap-2 my-4 text-left">
          <div className="p-2.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex flex-col">
            <div className="flex items-center gap-1 text-amber-400 text-xs font-black">
              <Coins className="w-3.5 h-3.5 shrink-0" />
              <span>1,000 Daily</span>
            </div>
            <span className="text-[10px] text-zinc-400 mt-1">
              Refilled at 12:00 AM EST. No resets.
            </span>
          </div>

          <div className="p-2.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex flex-col">
            <div className="flex items-center gap-1 text-emerald-400 text-xs font-black">
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <span>5x ATM Reloads</span>
            </div>
            <span className="text-[10px] text-zinc-400 mt-1">
              100 chips each, 10 min cooldown.
            </span>
          </div>

          <div className="p-2.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex flex-col">
            <div className="flex items-center gap-1 text-purple-400 text-xs font-black">
              <Trophy className="w-3.5 h-3.5 shrink-0" />
              <span>Daily Winner</span>
            </div>
            <span className="text-[10px] text-zinc-400 mt-1">
              Top chip height paid out manually!
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {/* Display Name Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
              Player Nickname / Display Name
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

          {/* Contact Platform Selector (Discord or Telegram - required) */}
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
                className={`py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-black uppercase transition-all ${
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
                className={`py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-black uppercase transition-all ${
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
            <p className="text-[10px] text-zinc-500 mt-1">
              {platform === 'discord' 
                ? 'Your Discord tag will be logged in the Moderator Payout portal if you win.' 
                : 'Your Telegram username will be contacted by the Casino Moderator for manual payout.'}
            </p>
          </div>

          {/* Avatar Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
              Choose Your High-Roller Avatar
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
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-xl transition-all ${
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
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-zinc-950 font-black text-sm uppercase tracking-wider shadow-xl shadow-amber-500/20 transition-all transform hover:scale-102 flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <CheckCircle2 className="w-5 h-5 text-zinc-950" />
            <span>Enter Casino & Claim 1,000 Chips</span>
          </button>
        </form>

        <div className="mt-3 text-center">
          <span className="text-[10px] text-zinc-600">
            By entering, you acknowledge the 12:00 AM EST reset and daily tournament rules.
          </span>
        </div>
      </div>
    </div>
  );
};
