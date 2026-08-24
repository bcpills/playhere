import React, { useState } from 'react';
import { PlayerProfileData, UserAccount } from '../types';
import { isUserAdmin, getVIPTierInfo } from '../utils/leaderboard';
import { sound } from '../utils/audio';
import { 
  X, 
  ShieldCheck, 
  Coins, 
  Trophy, 
  MessageSquare, 
  Send, 
  Copy, 
  Check, 
  RotateCcw, 
  AlertTriangle,
  Award,
  Sparkles,
  Flame,
  UserCheck
} from 'lucide-react';

interface PlayerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: PlayerProfileData | null;
  currentUserAccount: UserAccount;
  onResetBalance: (playerId: string, username: string, resetAmount: number, reason?: string) => void;
}

export const PlayerProfileModal: React.FC<PlayerProfileModalProps> = ({
  isOpen,
  onClose,
  player,
  currentUserAccount,
  onResetBalance,
}) => {
  const [copiedHandle, setCopiedHandle] = useState<boolean>(false);
  const [resetAmount, setResetAmount] = useState<number>(1000);
  const [resetReason, setResetReason] = useState<string>('Administrative bankroll reset');
  const [isConfirmingReset, setIsConfirmingReset] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');

  if (!isOpen || !player) return null;

  const isAdmin = isUserAdmin(currentUserAccount);
  const tierInfo = getVIPTierInfo(player.vipTier);

  const handleCopy = (text: string) => {
    sound.playChip();
    navigator.clipboard.writeText(text);
    setCopiedHandle(true);
    setTimeout(() => setCopiedHandle(false), 2000);
  };

  const handleExecuteReset = () => {
    sound.playWin(false);
    onResetBalance(player.id, player.username, resetAmount, resetReason);
    setSuccessMessage(`Successfully reset ${player.username}'s bankroll to ${resetAmount.toLocaleString()} chips!`);
    setIsConfirmingReset(false);
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-lg rounded-3xl bg-zinc-950 border-2 border-amber-500/50 shadow-2xl p-5 sm:p-6 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
        {/* Top Decorative Glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-zinc-200 flex items-center justify-center transition-colors cursor-pointer z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Player Header Avatar & Identification */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500/30 via-yellow-400/20 to-zinc-900 border-2 border-amber-400/60 flex items-center justify-center text-4xl shadow-xl">
              {player.avatar}
            </div>
            {player.isUser && (
              <span className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-amber-400 text-zinc-950 shadow-md">
                YOU
              </span>
            )}
          </div>

          <div className="text-center sm:text-left space-y-1 flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-lg sm:text-xl font-black uppercase tracking-wider text-zinc-100">
                {player.username}
              </h2>
              <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${tierInfo.badgeBg}`}>
                {player.vipTier}
              </span>
            </div>

            <p className="text-xs text-zinc-400 italic">
              "{player.bio || 'High-stakes grinder aiming for 12:00 AM EST victory.'}"
            </p>

            {/* Payout Handle Info */}
            {player.contactHandle && (
              <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md flex items-center gap-1 ${
                  player.contactPlatform === 'discord'
                    ? 'bg-[#5865F2]/20 text-indigo-300 border border-[#5865F2]/40'
                    : 'bg-[#229ED9]/20 text-sky-300 border border-[#229ED9]/40'
                }`}>
                  {player.contactPlatform === 'discord' ? <MessageSquare className="w-3 h-3" /> : <Send className="w-3 h-3" />}
                  <span>{player.contactPlatform || 'discord'}</span>
                </span>

                <span className="text-xs font-mono font-bold text-zinc-200">
                  {player.contactHandle}
                </span>

                <button
                  onClick={() => handleCopy(player.contactHandle!)}
                  title="Copy Contact Handle"
                  className="p-1 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-700 transition-colors cursor-pointer"
                >
                  {copiedHandle ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Player Stats Bento Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 my-4 text-xs">
          <div className="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800">
            <span className="text-[10px] uppercase font-bold text-zinc-500 block">Current Balance</span>
            <span className="text-base font-black font-mono text-amber-300 flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span>{player.balance.toLocaleString()}</span>
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800">
            <span className="text-[10px] uppercase font-bold text-zinc-500 block">Peak Bankroll</span>
            <span className="text-base font-black font-mono text-emerald-400 flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-emerald-400" />
              <span>{(player.peakBalance || player.balance).toLocaleString()}</span>
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800 col-span-2 sm:col-span-1">
            <span className="text-[10px] uppercase font-bold text-zinc-500 block">Lucky Number</span>
            <span className="text-base font-black font-mono text-purple-300">
              #{player.luckyNumber || 7}
            </span>
          </div>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="p-3 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-xs text-emerald-300 flex items-center gap-2 mb-3 animate-in fade-in">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ADMIN MANAGEMENT ACTION PANEL (ONLY FOR THOMASJOE55@GMAIL.COM)             */}
        {/* ========================================================================= */}
        {isAdmin ? (
          <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-purple-950/40 via-zinc-900 to-zinc-950 border-2 border-purple-500/60 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-purple-500/30 pb-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-black uppercase tracking-wider text-purple-300">
                  Admin Controls (Thomas Joe)
                </span>
              </div>
              <span className="text-[9px] px-2 py-0.5 rounded-full font-mono bg-purple-500/20 text-purple-200 border border-purple-500/40">
                AUTHORIZED
              </span>
            </div>

            <p className="text-xs text-zinc-400">
              As the casino owner, you can manage this player's session and perform an administrative bankroll reset.
            </p>

            {!isConfirmingReset ? (
              <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    sound.playChip();
                    setIsConfirmingReset(true);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-500/60 text-red-200 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-red-400" />
                  <span>Reset {player.username}'s Balance</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2.5 p-3 rounded-xl bg-zinc-950 border border-red-500/40 animate-in fade-in">
                <div className="flex items-center gap-2 text-red-400 text-xs font-bold">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Confirm Balance Reset for {player.username}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                      New Balance (Chips)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={resetAmount}
                      onChange={e => setResetAmount(parseInt(e.target.value, 10) || 0)}
                      className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-sm font-mono text-zinc-100 focus:outline-none focus:border-red-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                      Admin Audit Reason
                    </label>
                    <input
                      type="text"
                      value={resetReason}
                      onChange={e => setResetReason(e.target.value)}
                      placeholder="e.g. Daily reset enforcement"
                      className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-zinc-100 focus:outline-none focus:border-red-400"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleExecuteReset}
                    className="flex-1 py-2 px-3 rounded-lg bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Confirm Reset</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsConfirmingReset(false)}
                    className="py-2 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs uppercase cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : null}

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500">
          <span className="text-[10px]">ChipZone Gambler Registry</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 font-bold text-xs cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
