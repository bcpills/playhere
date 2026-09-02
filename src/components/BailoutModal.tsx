import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldAlert, 
  Coins, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Lock, 
  Play, 
  Sparkles, 
  Crown, 
  Volume2, 
  VolumeX, 
  ExternalLink,
  ShieldCheck,
  Flame,
  DollarSign,
  Gift,
  Zap,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/audio';
import { UserAccount } from '../types';
import { getTimeUntilEstMidnight } from '../utils/estTime';

interface BailoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClaimBailout: (amount: number) => void;
  currentBalance: number;
  atmHistory: number[];
  isAdFree?: boolean;
  userAccount?: UserAccount;
  onClaimRakeback?: (mode?: 'gc' | 'cash') => void;
  onClaimDailyDollar?: () => void;
  canClaimDailyDollar?: boolean;
  onOpenPayForAdFree?: () => void;
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

const SPONSOR_ADS = [
  {
    brand: 'Apex Horizon 8K OLED Displays',
    headline: '0.03ms Ultra-Low Latency Esports Monitors',
    sub: 'Get $150 off next-gen 240Hz HDR panels with code CHIPZONE',
    icon: '🖥️',
    color: 'from-purple-900 via-indigo-950 to-zinc-950',
    border: 'border-purple-500/50',
    tag: 'Official Gaming Sponsor',
  },
  {
    brand: 'BitVault Enterprise Security',
    headline: 'EAL6+ Cold Storage for High-Rollers',
    sub: 'Zero gas fees on your first 10 multi-chain wallet transfers',
    icon: '🔐',
    color: 'from-blue-900 via-cyan-950 to-zinc-950',
    border: 'border-cyan-500/50',
    tag: 'Verified Partner',
  },
  {
    brand: 'The Sovereign Macau Suites',
    headline: 'Exclusive High-Roller Penthouse Villa Package',
    sub: 'Complimentary helicopter transfer & $500 gourmet dining credit',
    icon: '🏨',
    color: 'from-amber-900 via-purple-950 to-zinc-950',
    border: 'border-amber-500/50',
    tag: 'VIP Luxury Travel',
  },
];

export const BailoutModal: React.FC<BailoutModalProps> = ({
  isOpen,
  onClose,
  onClaimBailout,
  currentBalance,
  atmHistory,
  isAdFree = false,
  userAccount,
  onClaimRakeback,
  onClaimDailyDollar,
  canClaimDailyDollar = true,
  onOpenPayForAdFree,
}) => {
  const [activeTab, setActiveTab] = useState<'rewards' | 'bailout'>('rewards');
  const [claimed, setClaimed] = useState<boolean>(false);
  const [dailyDollarClaimed, setDailyDollarClaimed] = useState<boolean>(false);
  const [rakebackClaimed, setRakebackClaimed] = useState<boolean>(false);
  const [activeRoast] = useState<string>(() => SHAME_ROASTS[Math.floor(Math.random() * SHAME_ROASTS.length)]);
  const [now, setNow] = useState<number>(Date.now());
  const [countdown, setCountdown] = useState<string>('');
  
  // Video Ad Watching State
  const [isWatchingAd, setIsWatchingAd] = useState<boolean>(false);
  const [adSecondsRemaining, setAdSecondsRemaining] = useState<number>(5);
  const [adCompleted, setAdCompleted] = useState<boolean>(false);
  const [activeSponsorIndex, setActiveSponsorIndex] = useState<number>(0);

  // Live timer tick for cooldown & midnight countdown
  useEffect(() => {
    if (!isOpen) return;
    const update = () => {
      setNow(Date.now());
      const { formatted } = getTimeUntilEstMidnight();
      setCountdown(formatted);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  // Video Ad Countdown Timer
  useEffect(() => {
    if (!isWatchingAd) return;
    if (adSecondsRemaining <= 0) {
      setAdCompleted(true);
      setIsWatchingAd(false);
      
      // Grant reward
      sound.playWin(true);
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
      onClaimBailout(ATM_CONSTANTS.AMOUNT);
      setClaimed(true);

      setTimeout(() => {
        setClaimed(false);
        setAdCompleted(false);
        onClose();
      }, 1500);
      return;
    }

    const timer = setTimeout(() => {
      setAdSecondsRemaining(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isWatchingAd, adSecondsRemaining, onClaimBailout, onClose]);

  if (!isOpen) return null;

  const bailoutAmount = ATM_CONSTANTS.AMOUNT;
  const unclaimedRakeback = userAccount?.unclaimedRakeback || 0;
  const unclaimedCashRakeback = userAccount?.unclaimedCashRakeback || 0;
  const totalRakebackClaimed = userAccount?.totalRakebackClaimed || 0;
  const totalCashRakebackClaimed = userAccount?.totalCashRakebackClaimed || 0;

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

  const canClaimBailoutNow = !claimed && !isDailyLimitReached && !isOnCooldown;

  const handleInitiateBailoutClaim = () => {
    if (!canClaimBailoutNow) return;

    if (isAdFree) {
      sound.playWin(true);
      confetti({ particleCount: 70, spread: 50, origin: { y: 0.6 } });
      onClaimBailout(bailoutAmount);
      setClaimed(true);
      setTimeout(() => {
        setClaimed(false);
        onClose();
      }, 1200);
    } else {
      sound.playChip();
      setActiveSponsorIndex(Math.floor(Math.random() * SPONSOR_ADS.length));
      setAdSecondsRemaining(5);
      setAdCompleted(false);
      setIsWatchingAd(true);
    }
  };

  const handleClaimDailyDollarAction = () => {
    if (!canClaimDailyDollar || dailyDollarClaimed || !onClaimDailyDollar) return;
    try {
      sound.playWin(true);
      try {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.5 } });
      } catch {
        // Safe fallback if confetti canvas fails
      }
      setDailyDollarClaimed(true);
      onClaimDailyDollar();
      setTimeout(() => {
        setDailyDollarClaimed(false);
      }, 2000);
    } catch (err) {
      console.error('Error claiming daily dollar:', err);
    }
  };

  const [cashRakebackClaimed, setCashRakebackClaimed] = useState<boolean>(false);

  const handleClaimRakebackAction = (mode: 'gc' | 'cash' = 'gc') => {
    if (!onClaimRakeback) return;
    try {
      if (mode === 'cash') {
        if (unclaimedCashRakeback <= 0 || cashRakebackClaimed) return;
        sound.playProfit();
        try {
          confetti({ particleCount: 70, spread: 50, origin: { y: 0.6 } });
        } catch {}
        setCashRakebackClaimed(true);
        onClaimRakeback('cash');
        setTimeout(() => {
          setCashRakebackClaimed(false);
        }, 2000);
      } else {
        if (unclaimedRakeback <= 0 || rakebackClaimed) return;
        sound.playProfit();
        try {
          confetti({ particleCount: 70, spread: 50, origin: { y: 0.6 } });
        } catch {}
        setRakebackClaimed(true);
        onClaimRakeback('gc');
        setTimeout(() => {
          setRakebackClaimed(false);
        }, 2000);
      }
    } catch (err) {
      console.error('Error claiming rakeback:', err);
    }
  };

  const sponsor = SPONSOR_ADS[activeSponsorIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-zinc-950 border-2 border-purple-500/50 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* SCREEN 1: VIDEO AD WATCHING SCREEN */}
        {isWatchingAd ? (
          <div className="space-y-4 py-2 animate-in fade-in text-center">
            {/* Header with progress */}
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] font-black uppercase">
                Sponsored Video Ad
              </span>
              <div className="flex items-center gap-1.5 font-mono text-amber-400 font-bold">
                <Clock className="w-3.5 h-3.5" />
                <span>Reward in {adSecondsRemaining}s</span>
              </div>
            </div>

            {/* Ad Progress Bar */}
            <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-amber-400 transition-all duration-1000 ease-linear rounded-full"
                style={{ width: `${((5 - adSecondsRemaining) / 5) * 100}%` }}
              />
            </div>

            {/* Video Creative Box */}
            <div className={`p-5 rounded-2xl bg-gradient-to-b ${sponsor.color} border ${sponsor.border} text-left shadow-xl relative overflow-hidden`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-300">
                  {sponsor.tag}
                </span>
                <span className="text-[10px] text-zinc-400 font-mono">Google AdSense Partner</span>
              </div>

              <div className="flex items-center gap-3.5 mb-3">
                <div className="w-12 h-12 rounded-xl bg-zinc-950/80 border border-zinc-700 flex items-center justify-center text-2xl shadow-inner shrink-0">
                  {sponsor.icon}
                </div>
                <div>
                  <h4 className="text-sm font-black text-white">{sponsor.brand}</h4>
                  <p className="text-xs font-bold text-amber-300">{sponsor.headline}</p>
                </div>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed mb-3">
                {sponsor.sub}
              </p>

              <div className="flex items-center justify-between text-[11px] pt-2 border-t border-zinc-800/80 text-zinc-400">
                <span>Watching ad to unlock <strong>+100 Free Chips</strong></span>
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
              </div>
            </div>

            {/* Skip Ad via VIP option */}
            {onOpenPayForAdFree && (
              <button
                type="button"
                onClick={() => {
                  sound.playChip();
                  setIsWatchingAd(false);
                  onOpenPayForAdFree();
                }}
                className="w-full py-2 px-3 rounded-xl bg-purple-950/40 hover:bg-purple-900/50 border border-purple-500/40 text-purple-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span>Hate ads? Upgrade to Ad-Free VIP ($4.99)</span>
              </button>
            )}
          </div>
        ) : (
          /* SCREEN 2: ATM VAULT & DAILY REWARDS SCREEN */
          <div className="space-y-4 flex flex-col overflow-y-auto pr-1">
            
            {/* Header with Close */}
            <div className="flex items-center justify-between border-b border-purple-900/40 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-amber-500 flex items-center justify-center text-xl shadow-md shadow-purple-500/20">
                  🏧
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black uppercase text-zinc-100 flex items-center gap-2">
                    <span>ATM Rewards & Stimulus Vault</span>
                  </h3>
                  <span className="text-[11px] text-zinc-400 block">
                    Daily Dollar Reload, Rakeback Vault, and Emergency Stimulus
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 text-xs cursor-pointer"
              >
                Close
              </button>
            </div>

            {/* Navigation Tabs (Rewards vs ATM Bailout) */}
            <div className="flex items-center p-1 bg-zinc-900/90 rounded-2xl border border-zinc-800">
              <button
                type="button"
                onClick={() => {
                  sound.playChip();
                  setActiveTab('rewards');
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'rewards'
                    ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Gift className="w-3.5 h-3.5" />
                <span>Daily Dollar & Vault</span>
                {unclaimedRakeback > 0 && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  sound.playChip();
                  setActiveTab('bailout');
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'bailout'
                    ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Emergency ATM</span>
              </button>
            </div>

            {/* TAB 1: DAILY DOLLAR & RAKEBACK VAULT */}
            {activeTab === 'rewards' && (
              <div className="space-y-3.5 pt-1">
                
                {/* SECTION 1: DAILY DOLLAR + 100K COINS RELOAD */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-zinc-900 to-amber-950/40 border-2 border-emerald-500/50 shadow-lg relative overflow-hidden">
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 flex items-center justify-center font-black text-xl">
                        💵
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 block">
                          Midnight EST Reload
                        </span>
                        <h4 className="text-sm sm:text-base font-black text-white">
                          Daily Dollar + 100,000 Coins
                        </h4>
                      </div>
                    </div>

                    <div className="flex flex-col items-end">
                      <span className="text-[9px] uppercase font-bold text-zinc-400 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5 text-amber-400" />
                        <span>12 AM EST Reset</span>
                      </span>
                      <span className="text-xs font-mono font-bold text-amber-400">
                        {canClaimDailyDollar ? 'Available Now' : countdown || 'Active'}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-300 mb-3 leading-relaxed">
                    Claim <strong>$1.00 USD Real Cash</strong> + <strong className="text-amber-300">100,000 Gold Coins</strong> every single day at Midnight EST. No deposit required!
                  </p>

                  <button
                    id="claim-daily-dollar-btn"
                    type="button"
                    disabled={!canClaimDailyDollar || dailyDollarClaimed}
                    onClick={handleClaimDailyDollarAction}
                    className={`w-full py-3 rounded-xl font-black text-xs uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      canClaimDailyDollar && !dailyDollarClaimed
                        ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:from-emerald-400 hover:to-teal-300 text-zinc-950 shadow-emerald-500/30 active:scale-98'
                        : 'bg-zinc-900 border border-zinc-800 text-zinc-500 cursor-not-allowed'
                    }`}
                  >
                    {dailyDollarClaimed ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>✓ Claimed ($1.00 + 100k GC Added!)</span>
                      </>
                    ) : canClaimDailyDollar ? (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Claim Daily Dollar ($1.00 + 100,000 GC)</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-4 h-4" />
                        <span>Claimed Today (Next in {countdown})</span>
                      </>
                    )}
                  </button>
                </div>

                {/* SECTION 2: INSTANT RAKEBACK VAULT */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-950/40 via-zinc-900 to-indigo-950/40 border-2 border-purple-500/50 shadow-lg relative overflow-hidden">
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/50 text-purple-300 flex items-center justify-center font-black text-xl">
                        💎
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-purple-400 block">
                          Instant VIP Cashback
                        </span>
                        <h4 className="text-sm sm:text-base font-black text-white">
                          Rakeback Rewards Vault
                        </h4>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[9px] uppercase font-bold text-zinc-400 block">Rate</span>
                      <span className="text-xs font-mono font-bold text-purple-300">10% Slots/Games • 2% BJ</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 my-2.5">
                    {/* Real Cash Rakeback Tile */}
                    <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-emerald-500/40 flex flex-col justify-between">
                      <div>
                        <span className="text-[9px] uppercase font-black text-emerald-400 block">Real Cash Vault</span>
                        <span className="text-base font-black font-mono text-emerald-300">
                          ${unclaimedCashRakeback.toFixed(2)} <span className="text-xs text-emerald-500 font-normal">USD</span>
                        </span>
                        <span className="text-[9px] text-zinc-500 block font-mono">
                          Claimed: ${totalCashRakebackClaimed.toFixed(2)}
                        </span>
                      </div>

                      <button
                        type="button"
                        disabled={unclaimedCashRakeback <= 0 || cashRakebackClaimed}
                        onClick={() => handleClaimRakebackAction('cash')}
                        className={`mt-2 w-full py-1.5 rounded-lg font-black text-[10px] uppercase tracking-wider shadow transition-all flex items-center justify-center gap-1 cursor-pointer ${
                          unclaimedCashRakeback > 0 && !cashRakebackClaimed
                            ? 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-emerald-500/30 active:scale-95'
                            : 'bg-zinc-900 border border-zinc-800 text-zinc-500 cursor-not-allowed'
                        }`}
                      >
                        {cashRakebackClaimed ? '✓ Claimed' : 'Claim Cash'}
                      </button>
                    </div>

                    {/* Gold Coins Rakeback Tile */}
                    <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-amber-500/40 flex flex-col justify-between">
                      <div>
                        <span className="text-[9px] uppercase font-black text-amber-400 block">GC Vault</span>
                        <span className="text-base font-black font-mono text-amber-300">
                          {unclaimedRakeback.toLocaleString()} <span className="text-xs text-amber-500 font-normal">GC</span>
                        </span>
                        <span className="text-[9px] text-zinc-500 block font-mono">
                          Claimed: {totalRakebackClaimed.toLocaleString()}
                        </span>
                      </div>

                      <button
                        type="button"
                        disabled={unclaimedRakeback <= 0 || rakebackClaimed}
                        onClick={() => handleClaimRakebackAction('gc')}
                        className={`mt-2 w-full py-1.5 rounded-lg font-black text-[10px] uppercase tracking-wider shadow transition-all flex items-center justify-center gap-1 cursor-pointer ${
                          unclaimedRakeback > 0 && !rakebackClaimed
                            ? 'bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-amber-500/30 active:scale-95'
                            : 'bg-zinc-900 border border-zinc-800 text-zinc-500 cursor-not-allowed'
                        }`}
                      >
                        {rakebackClaimed ? '✓ Claimed' : 'Claim GC'}
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 2: EMERGENCY ATM BAILOUT */}
            {activeTab === 'bailout' && (
              <div className="space-y-3 pt-1 text-center">
                <div className="w-14 h-14 rounded-2xl bg-red-950 border-2 border-red-500/60 flex items-center justify-center mx-auto text-2xl shadow-lg shadow-red-900/40">
                  💸
                </div>

                <div className="flex items-center justify-center gap-1.5 text-xs font-black uppercase tracking-widest text-red-400">
                  <ShieldAlert className="w-4 h-4" />
                  <span>The ATM of Shame</span>
                </div>

                <div className="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-xs text-zinc-300 italic">
                  "{activeRoast}"
                </div>

                {/* Grant Pill */}
                <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-950/60 to-red-950/60 border border-amber-500/40">
                  <div className="text-[10px] uppercase font-bold text-zinc-400">Emergency Stimulus Grant</div>
                  <div className="text-2xl font-black text-amber-300 font-mono">
                    +{bailoutAmount.toLocaleString()} CHIPS
                  </div>
                  {isAdFree ? (
                    <div className="text-[11px] text-purple-300 font-bold mt-1 flex items-center justify-center gap-1">
                      <Crown className="w-3 h-3 text-amber-400" />
                      <span>VIP Perk: Instant Claim (No Video Ad)</span>
                    </div>
                  ) : (
                    <div className="text-[11px] text-zinc-400 mt-1 flex items-center justify-center gap-1">
                      <Play className="w-3 h-3 text-amber-400" />
                      <span>Requires watching a quick 5-second sponsor ad</span>
                    </div>
                  )}
                </div>

                {/* Limits & Rules Dashboard */}
                <div className="grid grid-cols-2 gap-2 text-left">
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
                  <div className="p-2.5 rounded-xl bg-red-950/60 border border-red-500/40 text-xs text-red-300 flex items-center gap-2 text-left">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                    <span>Daily ATM limit of 5 pulls reached. Come back tomorrow!</span>
                  </div>
                )}

                {!isDailyLimitReached && isOnCooldown && (
                  <div className="p-2.5 rounded-xl bg-amber-950/50 border border-amber-500/40 text-xs text-amber-300 flex items-center gap-2 text-left">
                    <Clock className="w-4 h-4 shrink-0 text-amber-400 animate-pulse" />
                    <span>ATM cooling down. Next pull unlocked in <strong>{formattedCooldown}</strong>.</span>
                  </div>
                )}

                <button
                  id="claim-bailout-btn"
                  disabled={!canClaimBailoutNow}
                  onClick={handleInitiateBailoutClaim}
                  className={`w-full py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider shadow-xl transition-all transform flex items-center justify-center gap-2 cursor-pointer ${
                    canClaimBailoutNow
                      ? 'bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white shadow-red-600/30 hover:scale-101'
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
                  ) : isAdFree ? (
                    <>
                      <Coins className="w-4 h-4" />
                      <span>Claim Emergency {bailoutAmount} Chips (VIP)</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 text-amber-300 fill-amber-300" />
                      <span>Watch Ad for {bailoutAmount} Free Chips</span>
                    </>
                  )}
                </button>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
};
