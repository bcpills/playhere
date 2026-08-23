import React, { useState } from 'react';
import { UserAccount, CasinoStats, VIPTier } from '../types';
import { 
  AVATAR_OPTIONS, 
  getVIPTier, 
  getVIPTierInfo, 
  VIP_TIER_THRESHOLDS, 
  calculateDailyBonus 
} from '../utils/leaderboard';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import { 
  User, 
  Award, 
  Sparkles, 
  Flame, 
  Gift, 
  Clock, 
  Check, 
  Edit3, 
  Save, 
  RotateCcw, 
  ShieldCheck,
  TrendingUp,
  Coins
} from 'lucide-react';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: UserAccount;
  stats: CasinoStats;
  balance: number;
  onUpdateAccount: (updater: (prev: UserAccount) => UserAccount) => void;
  onClaimDailyBonus: (amount: number) => void;
  onResetBankroll: () => void;
}

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  account,
  stats,
  balance,
  onUpdateAccount,
  onClaimDailyBonus,
  onResetBankroll,
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editUsername, setEditUsername] = useState<string>(account.username);
  const [editAvatar, setEditAvatar] = useState<string>(account.avatar);
  const [editTitle, setEditTitle] = useState<string>(account.title);
  const [editBio, setEditBio] = useState<string>(account.bio);
  const [editLuckyNumber, setEditLuckyNumber] = useState<number>(account.luckyNumber);

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

  // Daily Claim Logic (24 hr cooldown)
  const ONE_DAY_MS = 86400000;
  const now = Date.now();
  const timeSinceLastClaim = now - (account.lastDailyClaim || 0);
  const canClaimDaily = timeSinceLastClaim >= ONE_DAY_MS;
  const msUntilNextClaim = Math.max(0, ONE_DAY_MS - timeSinceLastClaim);
  const hoursUntilClaim = Math.floor(msUntilNextClaim / (1000 * 60 * 60));
  const minutesUntilClaim = Math.floor((msUntilNextClaim % (1000 * 60 * 60)) / (1000 * 60));

  const bonusCalc = calculateDailyBonus(account, stats);

  const handleSaveProfile = () => {
    sound.playChip();
    onUpdateAccount(prev => ({
      ...prev,
      username: editUsername.trim() || 'Anonymous Degen',
      avatar: editAvatar,
      title: editTitle.trim() || 'Lounge Regular',
      bio: editBio.trim() || 'Just a humble gambler.',
      luckyNumber: editLuckyNumber,
    }));
    setIsEditing(false);
  };

  const handleClaimBonusClick = () => {
    if (!canClaimDaily) return;
    sound.playProfit();
    confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
    onClaimDailyBonus(bonusCalc.amount);
    onUpdateAccount(prev => ({
      ...prev,
      lastDailyClaim: Date.now(),
      dailyStreak: prev.dailyStreak + 1,
    }));
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
                VIP Gambler Account
              </h2>
              <span className="text-[11px] text-zinc-400">
                ID: {account.id} • Member for {Math.max(1, Math.round((Date.now() - account.createdAt) / 86400000))} Days
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
              </div>

              <p className="text-xs font-bold text-amber-400">
                "{account.title}"
              </p>

              <p className="text-xs text-zinc-400 italic max-w-sm">
                {account.bio}
              </p>

              <div className="flex items-center justify-center sm:justify-start gap-3 pt-2 text-[11px] text-zinc-400">
                <span className="flex items-center gap-1 font-mono">
                  <Flame className="w-3.5 h-3.5 text-orange-400" />
                  <strong>{account.dailyStreak} Day Streak</strong>
                </span>
                <span>•</span>
                <span className="font-mono">
                  Lucky #: <strong className="text-amber-300">{account.luckyNumber}</strong>
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

        {/* Edit Profile Form (Conditional) */}
        {isEditing && (
          <div className="p-4 rounded-2xl bg-zinc-900 border border-amber-500/40 space-y-3 mb-4 animate-fade-in">
            <h4 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Edit3 className="w-3.5 h-3.5" />
              <span>Customize Profile Dossier</span>
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

            {/* Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="text-[10px] font-black uppercase text-zinc-400 block mb-1">
                  Gambler Handle
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

            <div>
              <label className="text-[10px] font-black uppercase text-zinc-400 block mb-1">
                Gambling Manifesto / Bio
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
                  Lucky Number (1-99):
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

        {/* Daily Bonus Reward Section */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-zinc-900 to-zinc-950 border border-purple-500/30 mb-4 shadow-lg">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-purple-600/30 border border-purple-500/50 flex items-center justify-center text-2xl shadow-inner shrink-0">
                🎁
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-black uppercase text-zinc-100">
                    Daily Degenerate Reward
                  </h4>
                  <span className="text-[10px] px-2 py-0.2 rounded-full bg-purple-950 text-purple-300 border border-purple-500/40 font-mono font-bold">
                    +{bonusCalc.amount} CHIPS
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Includes +{bonusCalc.tierBonus} VIP perk & +{bonusCalc.streakBonus} streak bonus
                </p>
              </div>
            </div>

            <button
              disabled={!canClaimDaily}
              onClick={handleClaimBonusClick}
              className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg transition-all ${
                canClaimDaily
                  ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-zinc-950 animate-bounce hover:brightness-110 shadow-amber-500/20 cursor-pointer'
                  : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
              }`}
            >
              {canClaimDaily ? (
                <>
                  <Gift className="w-4 h-4 text-zinc-950" />
                  <span>Claim +{bonusCalc.amount} Chips</span>
                </>
              ) : (
                <>
                  <Clock className="w-3.5 h-3.5" />
                  <span>Next in {hoursUntilClaim}h {minutesUntilClaim}m</span>
                </>
              )}
            </button>
          </div>
        </div>

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

        {/* VIP Tier Benefits Overview */}
        <div className="space-y-1.5 mb-4">
          <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block px-1">
            VIP Tier Benefits & Ranks
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
            {VIP_TIER_THRESHOLDS.map((tier) => {
              const isCurrent = tier.tier === currentVIPTier;
              return (
                <div
                  key={tier.tier}
                  className={`p-2 rounded-xl border flex items-center justify-between ${
                    isCurrent
                      ? 'bg-amber-500/10 border-amber-500/50 shadow-sm'
                      : 'bg-zinc-900/40 border-zinc-800/80 opacity-70'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] font-black uppercase px-2 py-0.2 rounded-md ${tier.badgeBg}`}>
                      {tier.tier}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400">
                    {tier.minWager === 0 ? 'Default' : `${tier.minWager.toLocaleString()}+ Wager`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="pt-3 border-t border-zinc-800 flex items-center justify-between text-xs">
          <button
            onClick={() => {
              if (window.confirm('Reset bankroll back to 1,000 chips?')) {
                onResetBankroll(1000);
                onClose();
              }
            }}
            className="flex items-center gap-1 text-zinc-500 hover:text-rose-400 transition-colors text-[11px]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Bankroll (1,000 Chips)</span>
          </button>

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
