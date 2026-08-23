import React from 'react';
import { Sparkles, ExternalLink } from 'lucide-react';

interface AdBannerProps {
  placement: 'leaderboard-top' | 'game-bottom' | 'lobby-strip';
  className?: string;
}

export const AdBanner: React.FC<AdBannerProps> = ({ placement, className = '' }) => {
  if (placement === 'leaderboard-top') {
    return (
      <div className={`w-full p-3 rounded-2xl bg-zinc-950/80 border border-dashed border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left ${className}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-amber-400 font-black text-xs shrink-0">
            AD
          </div>
          <div>
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <span className="text-xs font-black text-zinc-300 uppercase tracking-wide">
                High-Roller VIP Lounge Sponsor
              </span>
              <span className="text-[9px] px-1.5 py-0.2 rounded font-bold uppercase bg-zinc-800 text-zinc-500">
                Sponsor Space
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Advertise your Web3 community, Discord server, or project to active high-rollers.
            </p>
          </div>
        </div>

        <button
          onClick={() => window.open('mailto:sponsor@bullshitcasino.io?subject=Casino%20Sponsorship%20Inquiry', '_blank')}
          className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0"
        >
          <span>Inquire Ad Space</span>
          <ExternalLink className="w-3 h-3 text-zinc-400" />
        </button>
      </div>
    );
  }

  if (placement === 'game-bottom') {
    return (
      <div className={`w-full py-2.5 px-4 rounded-2xl bg-zinc-950/60 border border-zinc-900 flex items-center justify-between gap-2 text-xs ${className}`}>
        <div className="flex items-center gap-2 text-zinc-500 text-[11px]">
          <span className="px-1.5 py-0.2 rounded text-[8px] font-black uppercase bg-zinc-900 border border-zinc-800 text-zinc-500">
            SPONSOR
          </span>
          <span>Official Tournament Partner: The Bullshit Lounge • Provably Fair Gameplay</span>
        </div>
        <span className="text-[10px] text-zinc-600 font-mono hidden sm:inline">
          AD-ZONE-728
        </span>
      </div>
    );
  }

  return (
    <div className={`w-full p-3 rounded-2xl bg-gradient-to-r from-zinc-900/60 via-zinc-950 to-zinc-900/60 border border-zinc-800/80 flex items-center justify-between text-xs ${className}`}>
      <div className="flex items-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        <span className="text-zinc-400 text-xs">
          Want your banner featured in front of daily casino players?
        </span>
      </div>
      <span className="text-[10px] text-amber-400 font-bold uppercase cursor-pointer hover:underline">
        Sponsor Spot Available
      </span>
    </div>
  );
};
