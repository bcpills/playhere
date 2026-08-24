import React, { useState } from 'react';
import { 
  Crown, 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  X, 
  Check, 
  CreditCard, 
  Coins, 
  Star,
  CheckCircle2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/audio';
import { UserAccount } from '../types';

interface PayForAdFreeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userAccount: UserAccount;
  onUpgradeToAdFree: () => void;
}

export const PayForAdFreeModal: React.FC<PayForAdFreeModalProps> = ({
  isOpen,
  onClose,
  userAccount,
  onUpgradeToAdFree,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<'lifetime' | 'vip_pass'>('lifetime');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const isAlreadyAdFree = userAccount.isAdFree;

  const handlePurchase = () => {
    setIsProcessing(true);
    sound.playChip();

    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      sound.playWin(true);
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      onUpgradeToAdFree();

      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1800);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-zinc-950 border-2 border-purple-500/60 rounded-3xl p-5 sm:p-7 shadow-2xl shadow-purple-950/40 relative overflow-hidden text-center">
        {/* Glow background accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={() => {
            sound.playChip();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-700 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Icon */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 via-amber-500 to-yellow-400 p-0.5 shadow-xl shadow-purple-500/30 flex items-center justify-center mx-auto mb-3">
          <div className="w-full h-full bg-[#0d091a] rounded-[14px] flex items-center justify-center text-3xl">
            👑
          </div>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-xs font-black uppercase tracking-widest text-purple-400">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>ChipZone VIP Pass</span>
        </div>

        <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wide text-zinc-100 mt-1">
          {isAlreadyAdFree ? 'You are an Ad-Free VIP Member' : 'Upgrade to Ad-Free Lounge'}
        </h2>

        <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto">
          {isAlreadyAdFree 
            ? 'Your account is permanently upgraded. You enjoy 100% uninterrupted casino play & instant ATM reloads.'
            : 'Remove all banner ads permanently, unlock instant ATM bailouts without watching video ads, and get VIP flair.'}
        </p>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 my-5 text-left">
          <div className="p-3 rounded-2xl bg-purple-950/30 border border-purple-500/30 flex items-start gap-2.5">
            <div className="p-2 rounded-xl bg-purple-900/50 text-purple-300 shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-black text-zinc-200">No Ads Anywhere</div>
              <div className="text-[11px] text-zinc-400">Zero banner ads across lobby, Blackjack, and Keno tables.</div>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-amber-950/30 border border-amber-500/30 flex items-start gap-2.5">
            <div className="p-2 rounded-xl bg-amber-900/50 text-amber-300 shrink-0">
              <Coins className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-black text-zinc-200">Instant ATM Bailouts</div>
              <div className="text-[11px] text-zinc-400">Skip the video ad requirement for 100 chip emergency reloads.</div>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 flex items-start gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-900/50 text-indigo-300 shrink-0">
              <Crown className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-black text-zinc-200">VIP Ad-Free Badge</div>
              <div className="text-[11px] text-zinc-400">Exclusive gold/purple crown badge in global chat & leaderboards.</div>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex items-start gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-900/50 text-emerald-300 shrink-0">
              <Star className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-black text-zinc-200">+500 Bonus Chips</div>
              <div className="text-[11px] text-zinc-400">Instant one-time welcome bonus deposited directly to balance.</div>
            </div>
          </div>
        </div>

        {/* Pricing Selection */}
        {!isAlreadyAdFree && (
          <div className="p-4 rounded-2xl bg-zinc-900/80 border-2 border-purple-500/60 mb-5 text-left flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full border-2 border-purple-400 bg-purple-500 flex items-center justify-center text-zinc-950">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <div>
                <div className="text-sm font-black text-zinc-100 flex items-center gap-2">
                  <span>Lifetime VIP Ad-Free Pass</span>
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase font-black">
                    Best Value
                  </span>
                </div>
                <div className="text-xs text-zinc-400">One-time payment • Lifetime access on all devices</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-black text-amber-300 font-mono">$4.99</div>
              <div className="text-[10px] text-zinc-500 line-through">$9.99</div>
            </div>
          </div>
        )}

        {/* Action Button */}
        {isAlreadyAdFree ? (
          <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 font-bold text-sm flex items-center justify-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>Ad-Free VIP Status Active</span>
          </div>
        ) : (
          <button
            onClick={handlePurchase}
            disabled={isProcessing || isSuccess}
            className="w-full py-3.5 px-4 rounded-2xl font-black text-sm uppercase tracking-wider bg-gradient-to-r from-purple-600 via-indigo-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-white shadow-xl shadow-purple-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-102 active:scale-98 disabled:opacity-50"
          >
            {isSuccess ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                <span>✓ Upgraded! Welcome to VIP Lounge</span>
              </>
            ) : isProcessing ? (
              <>
                <Sparkles className="w-5 h-5 text-amber-300 animate-spin" />
                <span>Activating VIP Pass...</span>
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4" />
                <span>Pay $4.99 & Remove All Ads</span>
              </>
            )}
          </button>
        )}

        <div className="mt-3 text-[10px] text-zinc-500 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
          <span>Instant Activation • Secure High-Roller Sandbox Checkouts</span>
        </div>
      </div>
    </div>
  );
};
