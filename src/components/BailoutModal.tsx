import React, { useState } from 'react';
import { ShieldAlert, Sparkles, Coins } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/audio';

interface BailoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClaimBailout: (amount: number) => void;
  currentBalance: number;
}

const SHAME_ROASTS = [
  "We saw that double down on a hard 16. Don't worry, the casino janitor won't judge.",
  "Your wallet looks emptier than a Tuesday afternoon in Reno.",
  "Did the dealer pull another 21 out of nowhere? Here's your emergency stimulus from the house.",
  "The ATM of Shame never rejects a degenerate with a dream.",
  "Financial advisors hate this one weird trick: Free casino bailout button.",
  "Take this 500-chip stimulus package and march right back to the felt.",
];

export const BailoutModal: React.FC<BailoutModalProps> = ({
  isOpen,
  onClose,
  onClaimBailout,
  currentBalance,
}) => {
  const [claimed, setClaimed] = useState<boolean>(false);
  const [activeRoast] = useState<string>(() => SHAME_ROASTS[Math.floor(Math.random() * SHAME_ROASTS.length)]);

  if (!isOpen) return null;

  const bailoutAmount = 500;

  const handleClaim = () => {
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

        <div className="w-16 h-16 rounded-2xl bg-red-950 border-2 border-red-500/60 flex items-center justify-center mx-auto mb-4 text-3xl shadow-lg shadow-red-900/40">
          💸
        </div>

        <div className="flex items-center justify-center gap-1.5 text-xs font-black uppercase tracking-widest text-red-400">
          <ShieldAlert className="w-4 h-4" />
          <span>The ATM of Shame</span>
        </div>

        <h3 className="text-xl sm:text-2xl font-black text-zinc-100 mt-1">
          Emergency Casino Bailout
        </h3>

        <div className="my-4 p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-xs sm:text-sm text-zinc-300 italic">
          "{activeRoast}"
        </div>

        <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-950/60 to-red-950/60 border border-amber-500/40 my-4">
          <div className="text-[10px] uppercase font-bold text-zinc-400">Stimulus Grant</div>
          <div className="text-2xl font-black text-amber-300 font-mono">
            +{bailoutAmount.toLocaleString()} CHIPS
          </div>
        </div>

        <div className="flex flex-col gap-2 mt-6">
          <button
            id="claim-bailout-btn"
            disabled={claimed}
            onClick={handleClaim}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-red-600/30 transition-all transform hover:scale-102 flex items-center justify-center gap-2"
          >
            <Coins className="w-4 h-4" />
            <span>{claimed ? '✓ Chips Deposited!' : `Claim Emergency ${bailoutAmount.toLocaleString()} Chips`}</span>
          </button>

          <button
            onClick={onClose}
            className="text-xs text-zinc-500 hover:text-zinc-300 py-1"
          >
            I still have pride (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
