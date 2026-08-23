import React, { useState, useEffect } from 'react';
import { ShieldAlert, Coins, Clock, AlertTriangle, CheckCircle2, Lock } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/audio';

interface BailoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClaimBailout: (amount: number) => void;
  currentBalance: number;
  atmHistory: number[];
}

const SHAME_ROASTS = [
  "We saw that double down on a hard 16. Don't worry, the casino janitor won't judge.",
  "Your wallet looks emptier than a Tuesday afternoon in Reno.",
  "Did the dealer pull another 21 out of nowhere? Here's your emergency stimulus from the house.",
  "The ATM of Shame never rejects a degenerate with a dream.",
  "Financial advisors hate this one weird trick: Free casino bailout button.",
  "Take this 100-chip stimulus package and march right back to the felt.",
];

export const ATM_CONSTANTS = {
  AMOUNT: 100,
  COOLDOWN_MS: 10 * 60 * 1000, // 10 minutes
  DAILY_LIMIT: 5,
  ONE_DAY_MS: 24 * 60 * 60 * 1000, // 24 hours
};

export const BailoutModal: React.FC<BailoutModalProps> = ({
  isOpen,
  onClose,
  onClaimBailout,
  currentBalance,
  atmHistory,
}) => {
  const [claimed, setClaimed] = useState<boolean>(false);
  const [activeRoast] = useState<string>(() => SHAME_ROASTS[Math.floor(Math.random() * SHAME_ROASTS.length)]);
  const [now, setNow] = useState<number>(Date.now());

  // Live timer tick for cooldown
  useEffect(() => {
    if (!isOpen) return;
    setNow(Date.now());
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const bailoutAmount = ATM_CONSTANTS.AMOUNT;

  // Calculate daily pulls (within last 24h)
  const pullsInLast24h = atmHistory.filter(ts => now - ts < ATM_CONSTANTS.ONE_DAY_MS);
  const pullsUsed = pullsInLast24h.length;
  const pullsRemaining = Math.max(0, ATM_CONSTANTS.DAILY_LIMIT - pullsUsed);
  const isDailyLimitReached = pullsUsed >= ATM_CONSTANTS.DAILY_LIMIT;

  // Calculate cooldown
  const latestPull = atmHistory.length > 0 ? Math.max(...atmHistory) : 0;
  const timeSinceLatest = now - latestPull;
  const isOnCooldown = latestPull > 0 && timeSinceLatest < ATM_CONSTANTS.COOLDOWN_MS;
  const cooldownRemainingSeconds = isOnCooldown 
    ? Math.ceil((ATM_CONSTANTS.COOLDOWN_MS - timeSinceLatest) / 1000) 
    : 0;

  const cooldownMinutes = Math.floor(cooldownRemainingSeconds / 60);
  const cooldownSecs = cooldownRemainingSeconds % 60;
  const formattedCooldown = `${cooldownMinutes.toString().padStart(2, '0')}:${cooldownSecs.toString().padStart(2, '0')}`;

  const canClaim = !claimed && !isDailyLimitReached && !isOnCooldown;

  const handleClaim = () => {
    if (!canClaim) return;
    sound.playWin(true);
    confetti({ particleCount: 60, spread: 50, origin: { y: 0.6 } });
    onClaimBailout(bailoutAmount);
    setClaimed(true);
    setTimeout(() => {
      setClaimed(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-zinc-950 border-2 border-red-500 rounded-3xl p-6 sm:p-8 shadow-2xl text-center relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute inset-0 bg-gradient-to-b from-red-600/10 via-transparent to-transparent pointer-events-none" />

        <div className="w-16 h-16 rounded-2xl bg-red-950 border-2 border-red-500/60 flex items-center justify-center mx-auto mb-3 text-3xl shadow-lg shadow-red-900/40">
          💸
        </div>

        <div className="flex items-center justify-center gap-1.5 text-xs font-black uppercase tracking-widest text-red-400">
          <ShieldAlert className="w-4 h-4" />
          <span>The ATM of Shame</span>
        </div>

        <h3 className="text-xl sm:text-2xl font-black text-zinc-100 mt-1">
          Emergency Casino Bailout
        </h3>

        <div className="my-3 p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-xs text-zinc-300 italic">
          "{activeRoast}"
        </div>

        {/* Grant Pill */}
        <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-950/60 to-red-950/60 border border-amber-500/40 my-3">
          <div className="text-[10px] uppercase font-bold text-zinc-400">Stimulus Grant</div>
          <div className="text-2xl font-black text-amber-300 font-mono">
            +{bailoutAmount.toLocaleString()} CHIPS
          </div>
        </div>

        {/* Limits & Rules Dashboard */}
        <div className="grid grid-cols-2 gap-2 my-3 text-left">
          {/* Daily Pulls Counter */}
          <div className="p-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-zinc-400">Daily Pulls</span>
              <span className={`text-[10px] font-black uppercase px-1.5 py-0.2 rounded-md ${
                isDailyLimitReached ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
              }`}>
                {pullsUsed} / {ATM_CONSTANTS.DAILY_LIMIT}
              </span>
            </div>
            <div className="flex gap-1 mt-2">
              {Array.from({ length: ATM_CONSTANTS.DAILY_LIMIT }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full ${
                    i < pullsUsed ? 'bg-red-500' : 'bg-zinc-800'
                  }`}
                />
              ))}
            </div>
            <span className="text-[10px] text-zinc-400 mt-1.5 font-medium">
              {isDailyLimitReached ? 'Max 5 reached for today' : `${pullsRemaining} pull${pullsRemaining === 1 ? '' : 's'} remaining`}
            </span>
          </div>

          {/* Cooldown Status */}
          <div className="p-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-zinc-400">Cooldown</span>
              <Clock className="w-3.5 h-3.5 text-zinc-400" />
            </div>
            <div className="mt-1">
              {isOnCooldown ? (
                <div className="text-sm font-black font-mono text-amber-400">
                  ⏳ {formattedCooldown}
                </div>
              ) : (
                <div className="text-sm font-black text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Ready</span>
                </div>
              )}
            </div>
            <span className="text-[10px] text-zinc-500 mt-1 font-medium">
              10-min cooldown
            </span>
          </div>
        </div>

        {/* Error / Status Notices */}
        {isDailyLimitReached && (
          <div className="p-2.5 rounded-xl bg-red-950/60 border border-red-500/40 text-xs text-red-300 flex items-center gap-2 mb-3 text-left">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
            <span>Daily ATM limit of 5 pulls reached. Come back tomorrow!</span>
          </div>
        )}

        {!isDailyLimitReached && isOnCooldown && (
          <div className="p-2.5 rounded-xl bg-amber-950/50 border border-amber-500/40 text-xs text-amber-300 flex items-center gap-2 mb-3 text-left">
            <Clock className="w-4 h-4 shrink-0 text-amber-400 animate-pulse" />
            <span>ATM cooling down. Next pull unlocked in <strong>{formattedCooldown}</strong>.</span>
          </div>
        )}

        <div className="flex flex-col gap-2 mt-4">
          <button
            id="claim-bailout-btn"
            disabled={!canClaim}
            onClick={handleClaim}
            className={`w-full py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider shadow-xl transition-all transform flex items-center justify-center gap-2 ${
              canClaim
                ? 'bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white shadow-red-600/30 hover:scale-102 cursor-pointer'
                : 'bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed'
            }`}
          >
            {claimed ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>✓ 100 Chips Deposited!</span>
              </>
            ) : isDailyLimitReached ? (
              <>
                <Lock className="w-4 h-4" />
                <span>Daily Limit Reached (5/5)</span>
              </>
            ) : isOnCooldown ? (
              <>
                <Clock className="w-4 h-4" />
                <span>Cooldown Active ({formattedCooldown})</span>
              </>
            ) : (
              <>
                <Coins className="w-4 h-4" />
                <span>Claim Emergency {bailoutAmount} Chips</span>
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="text-xs text-zinc-500 hover:text-zinc-300 py-1"
          >
            Close ATM
          </button>
        </div>
      </div>
    </div>
  );
};

