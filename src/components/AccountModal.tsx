import React, { useState } from 'react';
import { UserAccount, CasinoStats, VIPTier, ContactPlatform, InventoryItem } from '../types';
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
  LogOut,
  User,
  Shield,
  RotateCcw,
  Sparkles,
  ExternalLink,
  ChevronRight,
  HelpCircle,
  BarChart2
} from 'lucide-react';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: UserAccount;
  stats: CasinoStats;
  balance: number;
  inventoryCount: number;
  onUpdateAccount: (updater: (prev: UserAccount) => UserAccount) => void;
  onSignOut: () => void;
  onOpenStats: () => void;
  onOpenRules: () => void;
}

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  account,
  stats,
  balance,
  inventoryCount,
  onUpdateAccount,
  onSignOut,
  onOpenStats,
  onOpenRules,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'session'>('profile');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editUsername, setEditUsername] = useState<string>(account.username);
  const [editAvatar, setEditAvatar] = useState<string>(account.avatar);
  const [editTitle, setEditTitle] = useState<string>(account.title);
  const [editBio, setEditBio] = useState<string>(account.bio);
  const [editLuckyNumber, setEditLuckyNumber] = useState<number>(account.luckyNumber);
  const [editPlatform, setEditPlatform] = useState<ContactPlatform>(account.contactPlatform || 'discord');
  const [editHandle, setEditHandle] = useState<string>(account.contactHandle || '');
  const [isLinkingGoogle, setIsLinkingGoogle] = useState<boolean>(false);
  const [confirmSignOut, setConfirmSignOut] = useState<boolean>(false);

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

  const handleExecuteSignOut = () => {
    sound.playChip();
    onClose();
    onSignOut();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-xl bg-zinc-950 border-2 border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-2xl max-h-[94vh] overflow-y-auto relative">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-600 to-yellow-400 p-0.5 shadow-md flex items-center justify-center text-zinc-950 font-black">
              👑
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-zinc-100 flex items-center gap-2">
                <span>Account & Session Center</span>
              </h2>
              <span className="text-[11px] text-zinc-400">
                {account.username} • 12:00 AM EST Tournament Cycle
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playChip();
              onClose();
            }}
            className="p-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-700 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-zinc-900/90 border border-zinc-800 mb-4">
          <button
            onClick={() => {
              sound.playChip();
              setActiveTab('profile');
            }}
            className={`py-1.5 px-3 rounded-xl text-xs font-black uppercase flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'profile'
                ? 'bg-amber-500 text-zinc-950 shadow-md'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Profile</span>
          </button>

          <button
            onClick={() => {
              sound.playChip();
              setActiveTab('security');
            }}
            className={`py-1.5 px-3 rounded-xl text-xs font-black uppercase flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'security'
                ? 'bg-amber-500 text-zinc-950 shadow-md'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Google & VIP</span>
          </button>

          <button
            onClick={() => {
              sound.playChip();
              setActiveTab('session');
            }}
            className={`py-1.5 px-3 rounded-xl text-xs font-black uppercase flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'session'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* TAB 1: PROFILE & PAYOUT INFO */}
        {activeTab === 'profile' && (
          <div className="space-y-4">
            {/* Profile Overview Card */}
            <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 shadow-inner relative overflow-hidden">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                {/* Big Avatar */}
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-600/30 to-yellow-400/20 border-2 border-amber-400/50 flex items-center justify-center text-4xl shadow-xl shrink-0">
                  {account.avatar}
                </div>

                {/* Profile Details */}
                <div className="flex-1 text-center sm:text-left space-y-1">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <h3 className="text-lg font-black text-zinc-100">
                      {account.username}
                    </h3>
                    <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${currentTierInfo.badgeBg}`}>
                      {currentVIPTier}
                    </span>

                    {account.googleLinked && (
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                        <GoogleIcon className="w-2.5 h-2.5" />
                        <span>Google Linked</span>
                      </span>
                    )}
                  </div>

                  {/* Payout Tag */}
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
                      {account.contactHandle || 'Not configured'}
                    </span>
                  </div>

                  <p className="text-xs font-bold text-amber-400 pt-0.5">
                    "{account.title}"
                  </p>

                  <p className="text-xs text-zinc-400 italic max-w-sm">
                    {account.bio}
                  </p>
                </div>

                {/* Edit Button */}
                {!isEditing && (
                  <button
                    onClick={() => {
                      sound.playChip();
                      setIsEditing(true);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Profile</span>
                  </button>
                )}
              </div>

              {/* Quick Quick Balances */}
              <div className="grid grid-cols-3 gap-2 pt-3 mt-3 border-t border-zinc-800/80 text-center text-xs">
                <div className="p-2 rounded-xl bg-zinc-950/60 border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase block">Bankroll</span>
                  <span className="font-mono font-black text-amber-300 text-sm">
                    {balance.toLocaleString()}c
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-zinc-950/60 border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase block">Vault Items</span>
                  <span className="font-mono font-black text-purple-300 text-sm">
                    {inventoryCount} Items
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-zinc-950/60 border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase block">Peak Balance</span>
                  <span className="font-mono font-black text-emerald-400 text-sm">
                    {Math.max(account.peakBalanceAllTime || 0, balance).toLocaleString()}c
                  </span>
                </div>
              </div>
            </div>

            {/* Edit Form */}
            {isEditing && (
              <div className="p-4 rounded-2xl bg-zinc-900 border border-amber-500/40 space-y-3 animate-fade-in">
                <h4 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Update Profile & Payout Handle</span>
                </h4>

                {/* Avatar Grid */}
                <div>
                  <label className="text-[10px] font-black uppercase text-zinc-400 block mb-1.5">
                    Select Avatar Emoji
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

                {/* Nickname & Title */}
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
          </div>
        )}

        {/* TAB 2: GOOGLE ACCOUNT & VIP STATUS */}
        {activeTab === 'security' && (
          <div className="space-y-4">
            {/* Google Identity Card */}
            <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-md shrink-0">
                    <GoogleIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-zinc-100">
                      Google Identity & Quick Sign-In
                    </h3>
                    <p className="text-[11px] text-zinc-400">
                      {account.googleLinked 
                        ? `Linked as ${account.googleEmail}` 
                        : 'Link your Google account for 1-click verification'}
                    </p>
                  </div>
                </div>

                {account.googleLinked ? (
                  <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Verified</span>
                  </span>
                ) : (
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">
                    Not Linked
                  </span>
                )}
              </div>

              {account.googleLinked ? (
                <div className="p-3 rounded-xl bg-zinc-950 border border-emerald-500/30 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-sm font-bold text-emerald-300">
                      {account.googleName ? account.googleName.charAt(0).toUpperCase() : 'G'}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-zinc-100">
                        {account.googleName || account.username}
                      </div>
                      <div className="text-[11px] font-mono text-zinc-400">
                        {account.googleEmail}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleUnlinkGoogle}
                    className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-rose-950/80 hover:text-rose-300 text-zinc-400 border border-zinc-800 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Unlink Google
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={isLinkingGoogle}
                  onClick={handleLinkGoogle}
                  className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-zinc-100 text-zinc-900 font-bold text-xs flex items-center justify-center gap-2.5 shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  <GoogleIcon className="w-4 h-4" />
                  <span>{isLinkingGoogle ? 'Connecting Google Account...' : 'Link Google Account (1-Click)'}</span>
                </button>
              )}
            </div>

            {/* VIP Tier Progression Bar */}
            <div className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span className="font-black uppercase text-zinc-200">
                    VIP Status: <strong className={currentTierInfo.text}>{currentVIPTier}</strong>
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

            {/* Quick Links */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  sound.playChip();
                  onClose();
                  onOpenStats();
                }}
                className="p-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-left flex items-center justify-between gap-2 text-xs text-zinc-300"
              >
                <div className="flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold">Career Dossier</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
              </button>

              <button
                onClick={() => {
                  sound.playChip();
                  onClose();
                  onOpenRules();
                }}
                className="p-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-left flex items-center justify-between gap-2 text-xs text-zinc-300"
              >
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-amber-400" />
                  <span className="font-bold">Tournament Rules</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: SIGN OUT & SESSION CONTROL */}
        {activeTab === 'session' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/40 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
                  <LogOut className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-black uppercase text-rose-300">
                    Sign Out of Current Session
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Signing out disconnects your Gambler ID (<strong>{account.username}</strong>) and prompts the registration/login screen so you can sign in with another Google account or fresh Gambler identity.
                  </p>
                </div>
              </div>

              {!confirmSignOut ? (
                <button
                  type="button"
                  onClick={() => setConfirmSignOut(true)}
                  className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black uppercase tracking-wider shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out of {account.username}</span>
                </button>
              ) : (
                <div className="p-3 rounded-xl bg-zinc-950 border border-rose-500/60 space-y-2 animate-fade-in text-center">
                  <span className="text-xs text-rose-300 font-bold block">
                    Are you sure you want to sign out?
                  </span>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setConfirmSignOut(false)}
                      className="px-4 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleExecuteSignOut}
                      className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black uppercase shadow-md cursor-pointer"
                    >
                      Confirm Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Session Info */}
            <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-400 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-zinc-500 font-mono">Current Identity:</span>
                <strong className="text-zinc-200">{account.username}</strong>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-zinc-500 font-mono">Google Linked:</span>
                <span className={account.googleLinked ? 'text-emerald-400 font-bold' : 'text-zinc-500'}>
                  {account.googleLinked ? account.googleEmail : 'None'}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-zinc-500 font-mono">Payout Destination:</span>
                <span className="text-zinc-200 font-mono">
                  {account.contactPlatform}: {account.contactHandle || 'Not Set'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Modal Bottom Actions */}
        <div className="pt-3 mt-4 border-t border-zinc-800 flex items-center justify-between text-xs">
          <button
            onClick={() => {
              sound.playChip();
              setActiveTab('session');
            }}
            className="text-rose-400 hover:text-rose-300 text-xs font-bold flex items-center gap-1"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>

          <button
            onClick={() => {
              sound.playChip();
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-bold text-xs cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
