import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  X, 
  Sparkles, 
  CheckCircle2, 
  Lock, 
  Coins, 
  Gift, 
  ChevronRight,
  ShieldCheck,
  Flame
} from 'lucide-react';
import { UserAccount, InventoryItem, LootItem } from '../types';
import { 
  MILESTONE_CRATES, 
  MilestoneCrateDef, 
  isMilestoneUnlocked, 
  isMilestoneClaimed 
} from '../utils/milestones';
import { sound } from '../utils/audio';
import { formatCompactWager } from '../utils/leaderboard';
import { RARITY_CONFIG } from '../utils/crates';

interface MilestoneCratesModalProps {
  isOpen: boolean;
  onClose: () => void;
  userAccount: UserAccount;
  totalWagered: number;
  onClaimMilestone: (milestone: MilestoneCrateDef) => void;
}

export const MilestoneCratesModal: React.FC<MilestoneCratesModalProps> = ({
  isOpen,
  onClose,
  userAccount,
  totalWagered,
  onClaimMilestone,
}) => {
  const [openingMilestone, setOpeningMilestone] = useState<MilestoneCrateDef | null>(null);
  const [unboxedItem, setUnboxedItem] = useState<{ milestone: MilestoneCrateDef; item: LootItem; chips: number } | null>(null);

  if (!isOpen) return null;

  const claimedList = userAccount.claimedMilestoneCrates || [];

  const handleClaim = (milestone: MilestoneCrateDef) => {
    if (!isMilestoneUnlocked(milestone, totalWagered) || isMilestoneClaimed(milestone.id, claimedList)) {
      return;
    }

    setOpeningMilestone(milestone);
    sound.playChip();

    setTimeout(() => {
      sound.playBigWin();
      onClaimMilestone(milestone);
      setUnboxedItem({
        milestone,
        item: milestone.rewardItem,
        chips: milestone.bonusChips,
      });
      setOpeningMilestone(null);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-900/40">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center shadow-lg shadow-yellow-950/40 text-2xl">
              🎁
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  VIP Milestone Crates
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-400/20 text-amber-300 border border-amber-400/40">
                  Leveling Rewards
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Wager chips in the casino to unlock permanent free tier crates with guaranteed chips & rare inventory items!
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Total Wagered Stat Bar */}
        <div className="px-6 py-3 bg-zinc-900/60 border-b border-zinc-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-zinc-500 font-bold uppercase text-[10px]">Your Career Wager:</span>
            <span className="text-sm font-black font-mono text-purple-300 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-purple-400" />
              <span>{formatCompactWager(totalWagered)}</span>
              <span className="text-zinc-500 text-[10px] font-normal">({totalWagered.toLocaleString()}c)</span>
            </span>
          </div>

          <span className="text-[11px] font-mono text-emerald-400">
            {MILESTONE_CRATES.filter(m => isMilestoneUnlocked(m, totalWagered) && !isMilestoneClaimed(m.id, claimedList)).length} Ready to Claim
          </span>
        </div>

        {/* Milestone Crates List */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 max-h-[60vh]">
          {MILESTONE_CRATES.map((crate, idx) => {
            const unlocked = isMilestoneUnlocked(crate, totalWagered);
            const claimed = isMilestoneClaimed(crate.id, claimedList);
            const progress = Math.min(100, Math.floor((totalWagered / crate.minWager) * 100));
            const rarityInfo = RARITY_CONFIG[crate.rewardItem.rarity];

            return (
              <div
                key={crate.id}
                className={`p-4 sm:p-5 rounded-3xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  claimed
                    ? 'bg-zinc-900/30 border-zinc-800/60 opacity-75'
                    : unlocked
                    ? 'bg-gradient-to-r from-amber-950/40 via-zinc-900 to-zinc-950 border-amber-500/50 shadow-xl shadow-amber-950/20'
                    : 'bg-zinc-900/40 border-zinc-800/80'
                }`}
              >
                {/* Left: Crate Info & Reward Preview */}
                <div className="flex items-start sm:items-center gap-4 min-w-0">
                  <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-3xl shrink-0 shadow-inner">
                    {crate.icon}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-sm sm:text-base font-black text-zinc-100">
                        {crate.title}
                      </span>
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                        {crate.levelBadge}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-400 mb-2">
                      {crate.description}
                    </p>

                    {/* Rewards Summary */}
                    <div className="flex items-center gap-2.5 flex-wrap text-xs">
                      <span className="px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-300 font-mono font-black border border-amber-500/30 flex items-center gap-1">
                        <Coins className="w-3.5 h-3.5 text-amber-400" />
                        +{crate.bonusChips.toLocaleString()} Free Chips
                      </span>

                      <span className={`px-2.5 py-1 rounded-xl font-bold flex items-center gap-1.5 border ${rarityInfo.text} ${rarityInfo.border} bg-zinc-950/60`}>
                        <span>{crate.rewardItem.icon}</span>
                        <span className="truncate max-w-[140px] sm:max-w-[200px]">{crate.rewardItem.name}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Progress / Claim Action */}
                <div className="w-full sm:w-auto sm:min-w-[180px] flex flex-col items-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-800/80">
                  {claimed ? (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 text-xs font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Claimed</span>
                    </div>
                  ) : unlocked ? (
                    <button
                      type="button"
                      disabled={openingMilestone !== null}
                      onClick={() => handleClaim(crate)}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-zinc-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-950/50 transition-all cursor-pointer flex items-center justify-center gap-1.5 animate-pulse active:scale-98"
                    >
                      <Gift className="w-4 h-4" />
                      <span>{openingMilestone?.id === crate.id ? 'Unboxing...' : 'Claim & Unbox'}</span>
                    </button>
                  ) : (
                    <div className="w-full text-right space-y-1.5">
                      <div className="flex items-center justify-between sm:justify-end gap-2 text-[10px] text-zinc-500 font-mono">
                        <span className="flex items-center gap-1 text-zinc-400">
                          <Lock className="w-3 h-3" />
                          Locked
                        </span>
                        <span>{progress}% ({formatCompactWager(totalWagered)} / {formatCompactWager(crate.minWager)})</span>
                      </div>
                      <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-amber-400 rounded-full"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-zinc-800/80 bg-zinc-900/40 flex items-center justify-between text-xs text-zinc-500">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Milestone crates are free and can be claimed once per level achievement.</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>

      {/* Unboxed Item Victory Modal */}
      <AnimatePresence>
        {unboxedItem && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="w-full max-w-md p-6 rounded-3xl bg-zinc-950 border-2 border-amber-400/80 shadow-2xl text-center space-y-4"
            >
              <div className="text-4xl animate-bounce">🎉</div>
              <h3 className="text-2xl font-black text-white">
                Milestone Unboxed!
              </h3>
              <p className="text-xs text-zinc-400">
                You successfully unlocked the <span className="text-amber-300 font-bold">{unboxedItem.milestone.title}</span>!
              </p>

              {/* Rewards Box */}
              <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-center gap-2 text-xl font-black font-mono text-amber-300">
                  <Coins className="w-6 h-6 text-amber-400" />
                  <span>+{unboxedItem.chips.toLocaleString()} Free Chips</span>
                </div>

                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center gap-3">
                  <span className="text-3xl">{unboxedItem.item.icon}</span>
                  <div className="text-left">
                    <div className="text-sm font-black text-zinc-100">{unboxedItem.item.name}</div>
                    <span className="text-[10px] font-mono text-amber-300">+{unboxedItem.item.value.toLocaleString()}c Value</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setUnboxedItem(null)}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-zinc-950 font-black text-sm uppercase tracking-wider cursor-pointer shadow-lg shadow-yellow-950/50"
              >
                Collect Rewards & Equip
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
