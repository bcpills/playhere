import React, { useState } from 'react';
import { UserAccount, CasinoStats, VIPTier, ContactPlatform } from '../types';
import { 
  AVATAR_OPTIONS, 
  getVIPTier, 
  getVIPTierInfo, 
  VIP_TIER_THRESHOLDS 
} from '../utils/leaderboard';
import { sound } from '../utils/audio';
import { GoogleIcon } from './GoogleIcon';
import { 
  Award, 
  Edit3, 
  Save, 
  ShieldCheck,
  Send,
  MessageSquare,
  Flame,
  Coins,
  CheckCircle2,
  Lock,
  UserCheck
} from 'lucide-react';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: UserAccount;
  stats: CasinoStats;
  balance: number;
  onUpdateAccount: (updater: (prev: UserAccount) => UserAccount) => void;
}

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  account,
  stats,
  balance,
  onUpdateAccount,
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editUsername, setEditUsername] = useState<string>(account.username);
  const [editAvatar, setEditAvatar] = useState<string>(account.avatar);
  const [editTitle, setEditTitle] = useState<string>(account.title);
  const [editBio, setEditBio] = useState<string>(account.bio);
  const [editLuckyNumber, setEditLuckyNumber] = useState<number>(account.luckyNumber);
  const [editPlatform, setEditPlatform] = useState<ContactPlatform>(account.contactPlatform || 'discord');
  const [editHandle, setEditHandle] = useState<string>(account.contactHandle || '');
  const [isLinkingGoogle, setIsLinkingGoogle] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentVIPTier = getVIPTier(stats.totalWagered);
  const currentTierInfo = getVIPTierInfo(currentVIPTier);
  
  // Calculate next tier threshold
  const currentTierIndex = VIP_TIER_THRESHOLDS.findIndex(t => t.tier === currentVIPTier);
  const nextTier = currentTierIndex < VIP_TIER_THRESHOLDS.length - 1 ? VIP_TIER_THRESHOLDS[currentTierIndex + 1] : null;
  
  let progressPercent = 100;
  let remainingWager = 0;
  if (nextTier) {
    const currentBase = currentTierInfo.minWager;
    const nextTarget = nextTier.minWager;
    const progress = (stats.totalWagered - currentBase) / (nextTarget - currentBase);
    progressPercent = Math.min(100, Math.max(0, Math.round(progress * 100)));
    remainingWager = Math.max(0, nextTarget - stats.totalWagered);
  }

  const handleLinkGoogle = () => {
    setIsLinkingGoogle(true);
    sound.playChip();

    setTimeout(() => {
      onUpdateAccount(prev => ({
        ...prev,
        googleLinked: true,
        googleEmail: 'thomasjoe55@gmail.com',
        googleName: prev.username || 'Thomas J',
      }));
      setIsLinkingGoogle(false);
      sound.playProfit();
    }, 500);
  };

  const handleUnlinkGoogle = () => {
    sound.playChip();
    onUpdateAccount(prev => ({
      ...prev,
      googleLinked: false,
      googleEmail: undefined,
      googleName: undefined,
      googlePicture: undefined,
    }));
  };

  const handleSaveProfile = () => {
    sound.playChip();
    onUpdateAccount(prev => ({
      ...prev,
      username: editUsername.trim() || 'Anonymous Gambler',
      avatar: editAvatar,
      title: editTitle.trim() || 'Casino High-Roller',
      bio: editBio.trim() || 'Daily tournament contender.',
      luckyNumber: editLuckyNumber,
      contactPlatform: editPlatform,
      contactHandle: editHandle.trim() || prev.contactHandle,
    }));
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-xl bg-zinc-950 border-2 border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-2xl max-h-[92vh] overflow-y-auto relative">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-lg shadow-inner">
              👑
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-zinc-100">
                VIP Gambler Profile
              </h2>
              <span className="text-[11px] text-zinc-400">
                Member for {Math.max(1, Math.round((Date.now() - account.createdAt) / 86400000))} Days • 12:00 AM EST Daily Cycle
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playChip();
              onClose();
            }}
            className="p-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-700 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Profile Card & Avatar */}
        <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 shadow-inner mb-4 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            {/* Big Avatar */}
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-600/30 to-yellow-400/20 border-2 border-amber-400/50 flex items-center justify-center text-4xl shadow-xl shrink-0">
              {account.avatar}
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center sm:text-left space-y-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h3 className="text-lg font-black text-zinc-100">
                  {account.username}
                </h3>
                <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${currentTierInfo.badgeBg}`}>
                  {currentVIPTier}
                </span>

                {/* Google Linked Badge */}
                {account.googleLinked ? (
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                    <GoogleIcon className="w-3 h-3" />
                    <span>Google Linked</span>
                  </span>
                ) : (
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">
                    Guest Session
                  </span>
                )}
              </div>

              {/* Contact Handle Badge */}
              <div className="flex items-center justify-center sm:justify-start gap-2 pt-0.5">
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded flex items-center gap-1 ${
                  account.contactPlatform === 'discord'
                    ? 'bg-[#5865F2]/20 text-indigo-300 border border-[#5865F2]/40'
                    : 'bg-[#229ED9]/20 text-sky-300 border border-[#229ED9]/40'
                }`}>
                  {account.contactPlatform === 'discord' ? <MessageSquare className="w-3 h-3" /> : <Send className="w-3 h-3" />}
                  <span>{account.contactPlatform}</span>
                </span>
                <span className="text-xs font-mono font-bold text-zinc-300">
                  {account.contactHandle || 'Not specified'}
                </span>
              </div>

              {account.googleEmail && (
                <div className="text-[11px] font-mono text-zinc-400 flex items-center justify-center sm:justify-start gap-1">
                  <span className="text-zinc-500">Google:</span>
                  <span>{account.googleEmail}</span>
                </div>
              )}

              <p className="text-xs font-bold text-amber-400 pt-0.5">
                "{account.title}"
              </p>

              <p className="text-xs text-zinc-400 italic max-w-sm">
                {account.bio}
              </p>

              <div className="flex items-center justify-center sm:justify-start gap-3 pt-2 text-[11px] text-zinc-400">
                <span className="flex items-center gap-1 font-mono">
                  <Coins className="w-3.5 h-3.5 text-amber-400" />
                  <strong>Balance: {balance.toLocaleString()} Chips</strong>
                </span>
                <span>•</span>
                <span className="font-mono">
                  Peak All-Time: <strong className="text-amber-300">{Math.max(account.peakBalanceAllTime || 0, balance).toLocaleString()}</strong>
                </span>
              </div>
            </div>

            {/* Edit Button */}
            {!isEditing && (
              <button
                onClick={() => {
                  sound.playChip();
                  setIsEditing(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-bold flex items-center gap-1 shrink-0"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Google Account Link Module */}
        <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 text-left">
            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-md shrink-0">
              <GoogleIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-zinc-100 flex items-center gap-1.5">
                <span>Google Account Status</span>
                {account.googleLinked && (
                  <span className="text-[10px] text-emerald-400 font-normal">
                    (Verified)
                  </span>
                )}
              </div>
              <p className="text-[11px] text-zinc-400">
                {account.googleLinked 
                  ? `Linked to ${account.googleEmail || 'Google Account'}` 
                  : 'Link your Google ID for instant 1-click identity verification'}
              </p>
            </div>
          </div>

          <div>
            {!account.googleLinked ? (
              <button
                type="button"
                disabled={isLinkingGoogle}
                onClick={handleLinkGoogle}
                className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-bold flex items-center gap-1.5 shadow transition-all cursor-pointer disabled:opacity-50"
              >
                <GoogleIcon className="w-3.5 h-3.5" />
                <span>{isLinkingGoogle ? 'Linking...' : 'Link Google'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleUnlinkGoogle}
                className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-rose-950/60 hover:border-rose-500/50 hover:text-rose-300 text-zinc-400 border border-zinc-700 text-xs font-bold transition-colors"
              >
                Unlink
              </button>
            )}
          </div>
        </div>

        {/* Edit Profile Form (Conditional) */}
        {isEditing && (
          <div className="p-4 rounded-2xl bg-zinc-900 border border-amber-500/40 space-y-3 mb-4 animate-fade-in">
            <h4 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Edit3 className="w-3.5 h-3.5" />
              <span>Update Profile & Payout Contact</span>
            </h4>

            {/* Avatar Selector Grid */}
            <div>
              <label className="text-[10px] font-black uppercase text-zinc-400 block mb-1.5">
                Select Persona Avatar
              </label>
              <div className="grid grid-cols-8 gap-1.5">
                {AVATAR_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => {
                      sound.playChip();
                      setEditAvatar(emoji);
                    }}
                    className={`h-9 rounded-xl border text-lg flex items-center justify-center transition-all ${
                      editAvatar === emoji
                        ? 'bg-amber-500 text-zinc-950 border-amber-300 scale-110 shadow-md'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Nickname & Platform */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="text-[10px] font-black uppercase text-zinc-400 block mb-1">
                  Gambler Nickname
                </label>
                <input
                  type="text"
                  maxLength={24}
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-bold text-zinc-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-zinc-400 block mb-1">
                  VIP Title
                </label>
                <input
                  type="text"
                  maxLength={30}
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-bold text-zinc-100 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Payout Platform & Handle */}
            <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-2">
              <label className="text-[10px] font-black uppercase text-zinc-300 block">
                Winner Payout Channel (Discord or Telegram)
              </label>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setEditPlatform('discord')}
                  className={`py-1.5 px-3 rounded-lg border flex items-center justify-center gap-1.5 text-xs font-bold ${
                    editPlatform === 'discord'
                      ? 'bg-[#5865F2]/20 border-[#5865F2] text-indigo-300'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-500'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5 text-[#5865F2]" />
                  <span>Discord</span>
                </button>

                <button
                  type="button"
                  onClick={() => setEditPlatform('telegram')}
                  className={`py-1.5 px-3 rounded-lg border flex items-center justify-center gap-1.5 text-xs font-bold ${
                    editPlatform === 'telegram'
                      ? 'bg-[#229ED9]/20 border-[#229ED9] text-sky-300'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-500'
                  }`}
                >
                  <Send className="w-3.5 h-3.5 text-[#229ED9]" />
                  <span>Telegram</span>
                </button>
              </div>

              <input
                type="text"
                value={editHandle}
                onChange={(e) => setEditHandle(e.target.value)}
                placeholder={editPlatform === 'discord' ? 'e.g. username#1234 or @username' : 'e.g. @telegram_handle'}
                className="w-full px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-100 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-zinc-400 block mb-1">
                Gambler Bio / Manifesto
              </label>
              <input
                type="text"
                maxLength={80}
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <label className="text-[10px] font-black uppercase text-zinc-400">
                  Lucky #:
                </label>
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={editLuckyNumber}
                  onChange={(e) => setEditLuckyNumber(parseInt(e.target.value, 10) || 7)}
                  className="w-14 px-2 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-xs font-mono font-bold text-amber-300 text-center"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-zinc-950 text-xs font-black uppercase flex items-center gap-1 shadow-md"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Profile</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VIP Tier Progression Bar */}
        <div className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-2 mb-4">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" />
              <span className="font-black uppercase text-zinc-200">
                VIP Rank: <strong className={currentTierInfo.text}>{currentVIPTier}</strong>
              </span>
            </div>
            {nextTier ? (
              <span className="text-[11px] text-zinc-400 font-mono">
                {stats.totalWagered.toLocaleString()} / {nextTier.minWager.toLocaleString()} Wagered
              </span>
            ) : (
              <span className="text-[11px] text-yellow-300 font-black">MAX VIP RANK REACHED</span>
            )}
          </div>

          <div className="w-full h-2.5 rounded-full bg-zinc-950 border border-zinc-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-purple-500 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono">
            <span>Perk: {currentTierInfo.perk}</span>
            {nextTier && (
              <span>Wager {remainingWager.toLocaleString()} more for {nextTier.tier}</span>
            )}
          </div>
        </div>

        {/* Tournament Rules Reminder */}
        <div className="p-3.5 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 mb-4 text-xs text-zinc-400 space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold text-zinc-200">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>Daily Bankroll Rules</span>
          </div>
          <p className="text-[11px] text-zinc-500 leading-relaxed">
            • 1,000 Starting Chips are refilled automatically at <strong>12:00 AM EST</strong> every night.
            <br />
            • Up to <strong>5 ATM reloads of 100 chips</strong> each day with a 10-minute cooldown.
            <br />
            • No voluntary resets — your skill and daily luck determine your placement on the leaderboard and payout records.
          </p>
        </div>

        {/* Modal Bottom Actions */}
        <div className="pt-3 border-t border-zinc-800 flex items-center justify-end text-xs">
          <button
            onClick={() => {
              sound.playChip();
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-bold text-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
