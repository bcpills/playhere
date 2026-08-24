import React, { useState, useEffect } from 'react';
import { 
  Info, 
  X, 
  ExternalLink, 
  Sparkles, 
  RotateCcw, 
  ChevronRight, 
  ChevronLeft,
  ShieldCheck,
  Zap,
  Star
} from 'lucide-react';
import { sound } from '../utils/audio';

export interface PretendAdCreative {
  id: string;
  category: string;
  brand: string;
  headline: string;
  description: string;
  ctaText: string;
  url: string;
  icon: string;
  badge: string;
  accentGradient: string;
  accentBorder: string;
  rating?: number;
}

const PRETEND_ADS: PretendAdCreative[] = [
  {
    id: 'ad-1',
    category: 'Gaming Hardware',
    brand: 'Apex Horizon 8K',
    headline: 'Next-Gen 240Hz OLED Gaming Displays',
    description: 'Ultra-low 0.03ms response time with true HDR black levels. Claim $150 off with code CHIPZONE at checkout.',
    ctaText: 'Shop Deals',
    url: 'https://apexhorizon.gg/displays',
    icon: '🖥️',
    badge: 'Official Sponsor',
    accentGradient: 'from-purple-900/40 via-indigo-950/30 to-zinc-950',
    accentBorder: 'border-purple-500/40',
    rating: 4.9,
  },
  {
    id: 'ad-2',
    category: 'Crypto Security',
    brand: 'BitVault Enterprise',
    headline: 'Cold Storage Hardware Wallet for High-Rollers',
    description: 'Military-grade EAL6+ secure element with biometric PIN confirmation. Zero gas on your first 10 multichain swaps.',
    ctaText: 'Get BitVault',
    url: 'https://bitvault.io/security',
    icon: '🔐',
    badge: 'Verified Partner',
    accentGradient: 'from-blue-900/40 via-cyan-950/30 to-zinc-950',
    accentBorder: 'border-cyan-500/40',
    rating: 4.8,
  },
  {
    id: 'ad-3',
    category: 'Luxury Travel',
    brand: 'The Sovereign Macau Suites',
    headline: 'High-Roller Penthouse Villa & VIP Salon',
    description: 'Book 3 nights and receive complimentary helicopter transfer + 24/7 personal butler and $500 gourmet dining credit.',
    ctaText: 'Claim Offer',
    url: 'https://sovereignmacau.com/vip-packages',
    icon: '🏨',
    badge: 'Exclusive Luxury',
    accentGradient: 'from-amber-900/40 via-purple-950/30 to-zinc-950',
    accentBorder: 'border-amber-500/40',
    rating: 5.0,
  },
  {
    id: 'ad-4',
    category: 'Energy & Focus',
    brand: 'NitroSurge Clean Energy',
    headline: 'Zero Sugar Gaming Focus Elixir',
    description: 'Powered by natural green tea theanine & electrolytes. Sustained focus without the dreaded mid-session crash.',
    ctaText: 'Order Sample Box',
    url: 'https://nitrosurge.gg/promo',
    icon: '⚡',
    badge: 'Popular Choice',
    accentGradient: 'from-emerald-900/40 via-teal-950/30 to-zinc-950',
    accentBorder: 'border-emerald-500/40',
    rating: 4.9,
  },
  {
    id: 'ad-5',
    category: 'MMO Strategy',
    brand: 'StarVanguard: Galactic War',
    headline: 'Conquer the Cosmos in Real-Time PvP',
    description: 'Build your star fleet, forge galactic alliances, and conquer star systems. Play free directly in browser now!',
    ctaText: 'Play Free',
    url: 'https://starvanguard.com/play',
    icon: '🚀',
    badge: 'Free-to-Play',
    accentGradient: 'from-purple-900/40 via-fuchsia-950/30 to-zinc-950',
    accentBorder: 'border-purple-500/40',
    rating: 4.7,
  }
];

interface AdBannerProps {
  placement: 'leaderboard-top' | 'game-bottom' | 'lobby-strip' | 'sidebar-box';
  className?: string;
  isAdFree?: boolean;
  onGoAdFree?: () => void;
}

export const AdBanner: React.FC<AdBannerProps> = ({ 
  placement, 
  className = '',
  isAdFree = false,
  onGoAdFree
}) => {
  const [adIndex, setAdIndex] = useState<number>(() => {
    if (placement === 'leaderboard-top') return 0;
    if (placement === 'game-bottom') return 1;
    if (placement === 'lobby-strip') return 2;
    return 3;
  });
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [showAdChoicesInfo, setShowAdChoicesInfo] = useState<boolean>(false);

  // If user paid for Ad-Free VIP, skip rendering standard ads
  if (isAdFree) {
    if (placement === 'lobby-strip') {
      return (
        <div className={`w-full p-3 rounded-2xl bg-gradient-to-r from-purple-950/40 via-amber-950/20 to-zinc-950 border border-purple-500/30 flex items-center justify-between gap-3 text-xs ${className}`}>
          <div className="flex items-center gap-2 text-zinc-300">
            <span className="text-lg">👑</span>
            <span>
              <strong className="text-amber-300">VIP Ad-Free Lounge Active</strong> • Banner ads suppressed for your account.
            </span>
          </div>
          <div className="text-[10px] font-black uppercase px-2.5 py-1 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/40 font-mono">
            AD-FREE VIP
          </div>
        </div>
      );
    }
    return null;
  }

  // Auto-rotate sample creative every 20 seconds
  useEffect(() => {
    if (isDismissed) return;
    const interval = setInterval(() => {
      setAdIndex((prev) => (prev + 1) % PRETEND_ADS.length);
    }, 22000);
    return () => clearInterval(interval);
  }, [isDismissed]);

  const currentAd = PRETEND_ADS[adIndex];

  const handleNextAd = (e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playChip();
    setAdIndex((prev) => (prev + 1) % PRETEND_ADS.length);
  };

  const handlePrevAd = (e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playChip();
    setAdIndex((prev) => (prev - 1 + PRETEND_ADS.length) % PRETEND_ADS.length);
  };

  const handleCloseAd = (e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playChip();
    setIsDismissed(true);
  };

  const handleUndoDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playChip();
    setIsDismissed(false);
  };

  // If dismissed, show authentic Google AdSense closed state
  if (isDismissed) {
    return (
      <div className={`w-full p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-xs flex flex-wrap items-center justify-between gap-2 animate-in fade-in ${className}`}>
        <div className="flex items-center gap-2 text-zinc-400">
          <ShieldCheck className="w-4 h-4 text-purple-400" />
          <span className="text-[11px]">
            <strong>Ad closed by Google</strong> • We'll try not to show that ad again.
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleUndoDismiss}
            className="text-[11px] font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Undo</span>
          </button>
          <span className="text-[10px] text-zinc-500 font-mono">
            Google AdSense (Pretend Preview)
          </span>
        </div>
      </div>
    );
  }

  // 1. LEADERBOARD TOP BANNER (Responsive 728x90 / Multi-Screen Unit)
  if (placement === 'leaderboard-top') {
    return (
      <div className={`relative w-full rounded-2xl overflow-hidden bg-gradient-to-r ${currentAd.accentGradient} border ${currentAd.accentBorder} p-3 sm:p-4 shadow-xl transition-all duration-300 ${className}`}>
        {/* Google AdSense Header Strip */}
        <div className="flex items-center justify-between text-[10px] text-zinc-400 mb-2">
          <div className="flex items-center gap-1.5 font-medium">
            <span className="px-1.5 py-0.2 rounded bg-purple-950/80 border border-purple-500/30 text-purple-300 font-black text-[9px] uppercase tracking-wider">
              Ad
            </span>
            <span className="text-zinc-400 font-mono text-[10px] hidden sm:inline">
              Google AdSense Preview • {currentAd.category}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Carousel navigation to test different mock ads */}
            <div className="flex items-center gap-1 mr-1 bg-zinc-950/60 rounded-lg px-1.5 py-0.5 border border-zinc-800">
              <button
                onClick={handlePrevAd}
                title="Preview previous pretend ad"
                className="hover:text-white p-0.5"
              >
                <ChevronLeft className="w-3 h-3" />
              </button>
              <span className="text-[9px] font-mono text-zinc-400">
                {adIndex + 1}/{PRETEND_ADS.length}
              </span>
              <button
                onClick={handleNextAd}
                title="Preview next pretend ad"
                className="hover:text-white p-0.5"
              >
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {/* Google AdChoices trigger */}
            <div className="relative flex items-center gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAdChoicesInfo(!showAdChoicesInfo);
                }}
                title="AdChoices Info"
                className="p-1 rounded hover:bg-zinc-800/80 text-zinc-400 hover:text-zinc-200"
              >
                <Info className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleCloseAd}
                title="Close Ad"
                className="p-1 rounded hover:bg-zinc-800/80 text-zinc-400 hover:text-zinc-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Ad Body Content */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-left w-full sm:w-auto">
            <div className="w-12 h-12 rounded-2xl bg-zinc-950/90 border border-zinc-800 flex items-center justify-center text-2xl shadow-inner shrink-0">
              {currentAd.icon}
            </div>

            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-xs sm:text-sm font-black text-zinc-100 truncate">
                  {currentAd.brand}
                </h4>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-zinc-800/90 text-amber-400 shrink-0">
                  {currentAd.badge}
                </span>
                {currentAd.rating && (
                  <span className="hidden md:flex items-center gap-0.5 text-[10px] text-yellow-400 font-bold">
                    <Star className="w-2.5 h-2.5 fill-yellow-400" />
                    <span>{currentAd.rating}</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-300 font-medium line-clamp-1">
                {currentAd.headline}
              </p>
              <p className="text-[11px] text-zinc-400 line-clamp-1 hidden md:block">
                {currentAd.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
            <span className="text-[10px] text-zinc-500 font-mono hidden lg:inline truncate max-w-[140px]">
              {currentAd.url.replace('https://', '')}
            </span>
            <button
              onClick={() => {
                sound.playChip();
                window.open(currentAd.url, '_blank');
              }}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>{currentAd.ctaText}</span>
              <ExternalLink className="w-3 h-3 text-purple-200" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. GAME BOTTOM BANNER (Anchor Strip under Blackjack/Keno/Crates)
  if (placement === 'game-bottom') {
    return (
      <div className={`w-full rounded-2xl bg-gradient-to-r ${currentAd.accentGradient} border ${currentAd.accentBorder} p-2.5 sm:p-3 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs ${className}`}>
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <div className="w-8 h-8 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-lg shrink-0">
            {currentAd.icon}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="px-1 py-0.2 rounded bg-purple-950 border border-purple-500/40 text-purple-300 font-black text-[8px] uppercase">
                Ad
              </span>
              <strong className="text-zinc-200 font-bold text-xs truncate">
                {currentAd.brand}
              </strong>
              <span className="text-zinc-500 text-[10px] hidden md:inline">
                • {currentAd.headline}
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 truncate hidden sm:block">
              {currentAd.description}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto shrink-0">
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevAd}
              className="p-1 rounded bg-zinc-950/70 hover:bg-zinc-900 text-zinc-400 hover:text-white"
            >
              <ChevronLeft className="w-3 h-3" />
            </button>
            <button
              onClick={handleNextAd}
              className="p-1 rounded bg-zinc-950/70 hover:bg-zinc-900 text-zinc-400 hover:text-white"
            >
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <button
            onClick={() => {
              sound.playChip();
              window.open(currentAd.url, '_blank');
            }}
            className="px-3 py-1.5 rounded-xl bg-purple-950 hover:bg-purple-900 text-purple-200 border border-purple-500/50 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
          >
            <span>{currentAd.ctaText}</span>
            <ExternalLink className="w-3 h-3" />
          </button>

          <button
            onClick={handleCloseAd}
            className="p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300"
            title="Dismiss Ad"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  }

  // 3. LOBBY STRIP / IN-FEED DISPLAY AD (Lobby Hub)
  return (
    <div className={`w-full p-4 rounded-3xl bg-gradient-to-r ${currentAd.accentGradient} border ${currentAd.accentBorder} shadow-2xl relative overflow-hidden ${className}`}>
      {/* Google AdSense Watermark */}
      <div className="flex items-center justify-between text-[10px] text-zinc-400 mb-2">
        <div className="flex items-center gap-2">
          <span className="px-1.5 py-0.5 rounded bg-purple-950 border border-purple-500/40 text-purple-300 font-black text-[9px] uppercase tracking-wider">
            Sponsored Ad
          </span>
          <span className="text-[10px] font-mono text-zinc-400">
            Google AdSense Simulated Unit
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-0.5 bg-zinc-950/80 rounded-md px-1.5 py-0.5 border border-zinc-800">
            <button
              onClick={handlePrevAd}
              title="Previous Ad"
              className="text-zinc-400 hover:text-white p-0.5"
            >
              <ChevronLeft className="w-3 h-3" />
            </button>
            <span className="text-[9px] font-mono text-zinc-400">
              {adIndex + 1}/{PRETEND_ADS.length}
            </span>
            <button
              onClick={handleNextAd}
              title="Next Ad"
              className="text-zinc-400 hover:text-white p-0.5"
            >
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <button
            onClick={handleCloseAd}
            className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200"
            title="Close Preview Ad"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5 w-full md:w-auto">
          <div className="w-14 h-14 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-3xl shadow-inner shrink-0">
            {currentAd.icon}
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-sm sm:text-base font-black text-zinc-100">
                {currentAd.brand}
              </h4>
              <span className="text-[9px] font-black uppercase px-2 py-0.2 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
                {currentAd.badge}
              </span>
              {currentAd.rating && (
                <div className="flex items-center gap-0.5 text-[10px] text-yellow-400 font-bold">
                  <Star className="w-3 h-3 fill-yellow-400" />
                  <span>{currentAd.rating}</span>
                </div>
              )}
            </div>
            <p className="text-xs sm:text-sm font-bold text-purple-300">
              {currentAd.headline}
            </p>
            <p className="text-xs text-zinc-400 max-w-xl">
              {currentAd.description}
            </p>
          </div>
        </div>

        <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-2 shrink-0">
          <span className="text-[10px] text-zinc-500 font-mono">
            {currentAd.url.replace('https://', '')}
          </span>
          <button
            onClick={() => {
              sound.playChip();
              window.open(currentAd.url, '_blank');
            }}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>{currentAd.ctaText}</span>
            <ExternalLink className="w-3.5 h-3.5 text-purple-200" />
          </button>
        </div>
      </div>
    </div>
  );
};
