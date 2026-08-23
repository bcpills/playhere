import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Eye, Trophy, RefreshCw, ChevronRight, Package, ArrowDown, Check, Coins } from 'lucide-react';
import { LootCrate, LootItem, ItemRarity, InventoryItem, CasinoStats } from '../types';
import { LOOT_CRATES, RARITY_CONFIG, pickRandomLootItem, generateReelItems } from '../utils/crates';
import { sound } from '../utils/audio';

interface UnboxerGameProps {
  balance: number;
  onUpdateBalance: (delta: number) => void;
  onAddToInventory: (item: LootItem, crateId: string) => void;
  onUpdateStats: (updater: (prev: CasinoStats) => CasinoStats) => void;
}

export const UnboxerGame: React.FC<UnboxerGameProps> = ({
  balance,
  onUpdateBalance,
  onAddToInventory,
  onUpdateStats,
}) => {
  const [selectedCrate, setSelectedCrate] = useState<LootCrate>(LOOT_CRATES[1]); // Default Neon Hustler
  const [isOpening, setIsOpening] = useState<boolean>(false);
  const [reelItems, setReelItems] = useState<LootItem[]>([]);
  const [winningItem, setWinningItem] = useState<LootItem | null>(null);
  const [revealedItem, setRevealedItem] = useState<LootItem | null>(null);
  const [inspectingCrate, setInspectingCrate] = useState<LootCrate | null>(null);
  const [claimedStatus, setClaimedStatus] = useState<'cashed' | 'vaulted' | null>(null);

  const reelContainerRef = useRef<HTMLDivElement>(null);
  const audioTickTimerRef = useRef<number | null>(null);

  const WIN_INDEX = 45; // Fixed target index on the 60-item strip
  const ITEM_WIDTH = 160; // Width of each item card in px
  const ITEM_GAP = 12; // Gap between cards

  // Start unbox sequence
  const handleOpenCrate = (multiplier = 1) => {
    const totalCost = selectedCrate.cost * multiplier;
    if (balance < totalCost || isOpening) return;

    // Deduct cost
    onUpdateBalance(-totalCost);
    onUpdateStats(prev => ({
      ...prev,
      totalWagered: prev.totalWagered + totalCost,
      cratesOpened: prev.cratesOpened + 1,
    }));

    setIsOpening(true);
    setRevealedItem(null);
    setClaimedStatus(null);
    sound.playChip();

    // Determine winning item
    const winItem = pickRandomLootItem(selectedCrate);
    setWinningItem(winItem);

    // Build 60 items array with winning item at WIN_INDEX
    const items = generateReelItems(selectedCrate, winItem, 60, WIN_INDEX);
    setReelItems(items);

    // Reset reel position
    if (reelContainerRef.current) {
      reelContainerRef.current.style.transition = 'none';
      reelContainerRef.current.style.transform = 'translateX(0px)';
    }

    // Small random offset inside the winning card (-40px to +40px)
    const randomOffset = (Math.random() - 0.5) * 60;
    const targetTranslateX = -(WIN_INDEX * (ITEM_WIDTH + ITEM_GAP) - (reelContainerRef.current?.parentElement?.clientWidth || 600) / 2 + ITEM_WIDTH / 2 + randomOffset);

    // Sound ticking effect during deceleration
    let tickCount = 0;
    const tickIntervals = [30, 40, 50, 60, 80, 100, 140, 200, 280, 400, 600];
    let intervalIndex = 0;

    const playTicks = () => {
      sound.playCrateTick(Math.random() * 200);
      tickCount++;
      if (tickCount < 40) {
        if (tickCount % 4 === 0 && intervalIndex < tickIntervals.length - 1) {
          intervalIndex++;
        }
        audioTickTimerRef.current = window.setTimeout(playTicks, tickIntervals[intervalIndex]);
      }
    };

    // Trigger spinning animation after DOM layout
    setTimeout(() => {
      if (reelContainerRef.current) {
        reelContainerRef.current.style.transition = 'transform 6.5s cubic-bezier(0.12, 0.98, 0.22, 1)';
        reelContainerRef.current.style.transform = `translateX(${targetTranslateX}px)`;
        playTicks();
      }
    }, 50);

    // Reveal item when spin ends
    setTimeout(() => {
      setIsOpening(false);
      setRevealedItem(winItem);

      if (winItem.rarity === 'covert' || winItem.rarity === 'mythic' || winItem.rarity === 'exotic') {
        confetti({ particleCount: 120, spread: 90, origin: { y: 0.5 } });
        sound.playLootRare();
      } else {
        sound.playWin(winItem.value > selectedCrate.cost);
      }

      onUpdateStats(prev => ({
        ...prev,
        totalWon: prev.totalWon + winItem.value,
        biggestWin: Math.max(prev.biggestWin, winItem.value),
        biggestMultiplier: Math.max(prev.biggestMultiplier, Math.round(winItem.value / selectedCrate.cost)),
      }));
    }, 6700);
  };

  const handleCashOut = () => {
    if (!revealedItem || claimedStatus) return;
    sound.playChip();
    onUpdateBalance(revealedItem.value);
    setClaimedStatus('cashed');
  };

  const handleKeepItem = () => {
    if (!revealedItem || claimedStatus) return;
    sound.playChip();
    onAddToInventory(revealedItem, selectedCrate.id);
    setClaimedStatus('vaulted');
  };

  useEffect(() => {
    return () => {
      if (audioTickTimerRef.current) clearTimeout(audioTickTimerRef.current);
    };
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Crate Selection Carousel / Tabs */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-purple-400" />
            <h2 className="text-sm font-black uppercase tracking-wider text-zinc-100">
              Select Loot Crate Tier
            </h2>
          </div>
          <span className="text-xs text-zinc-400 font-medium">
            Higher tiers feature rare CS skins, gold bars & jackpot multipliers
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {LOOT_CRATES.map((crate) => {
            const isSelected = selectedCrate.id === crate.id;
            const canAfford = balance >= crate.cost;

            return (
              <div
                key={crate.id}
                id={`crate-card-${crate.id}`}
                onClick={() => {
                  if (isOpening) return;
                  sound.playChip();
                  setSelectedCrate(crate);
                }}
                className={`group relative flex flex-col justify-between p-4 rounded-3xl border-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-zinc-900 border-amber-400 ring-2 ring-amber-400/40 shadow-2xl shadow-purple-900/30 scale-102'
                    : 'bg-zinc-950/80 border-zinc-800 hover:border-zinc-700 opacity-80 hover:opacity-100'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-3xl">{crate.icon}</span>
                    <span className="px-2.5 py-1 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      {crate.cost.toLocaleString()} CHIPS
                    </span>
                  </div>

                  <h3 className="text-base font-black text-zinc-100 group-hover:text-amber-300 transition-colors">
                    {crate.name}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed line-clamp-2">
                    {crate.tagline}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between text-xs">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setInspectingCrate(crate);
                    }}
                    className="flex items-center gap-1 text-zinc-400 hover:text-zinc-200 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Pool ({crate.items.length})</span>
                  </button>
                  <span className="text-purple-400 font-bold flex items-center gap-0.5">
                    Select <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CS:GO STYLE HORIZONTAL ROLLING REEL CONTAINER */}
      <div className="relative rounded-3xl bg-zinc-950 border-2 border-zinc-800 p-4 sm:p-6 shadow-2xl overflow-hidden">
        {/* Needle / Center Marker */}
        <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-1 bg-gradient-to-b from-yellow-400 via-amber-500 to-yellow-400 z-30 shadow-[0_0_15px_rgba(234,179,8,1)] pointer-events-none">
          <div className="absolute -top-1 left-1/2 -translate-x-1/2">
            <ArrowDown className="w-6 h-6 text-yellow-400 fill-current animate-bounce drop-shadow" />
          </div>
        </div>

        {/* Ambient background glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-950/20 via-zinc-950 to-purple-950/20 pointer-events-none" />

        {/* Horizontal reel mask */}
        <div className="relative w-full overflow-hidden py-4">
          <div
            ref={reelContainerRef}
            className="flex items-center gap-3 will-change-transform"
            style={{ width: 'max-content' }}
          >
            {reelItems.length > 0 ? (
              reelItems.map((item, idx) => {
                const rarity = RARITY_CONFIG[item.rarity];
                return (
                  <div
                    key={`${item.id}-${idx}`}
                    style={{ width: `${ITEM_WIDTH}px` }}
                    className={`flex-shrink-0 h-44 rounded-2xl border-2 p-3 flex flex-col justify-between items-center text-center bg-gradient-to-b ${rarity.bg} ${rarity.border} ${rarity.glow} shadow-lg select-none`}
                  >
                    <span className={`text-[10px] font-black uppercase tracking-wider ${rarity.text}`}>
                      {rarity.label}
                    </span>

                    <span className="text-4xl my-1 transform group-hover:scale-110 transition-transform">
                      {item.icon}
                    </span>

                    <div className="w-full">
                      <div className="text-xs font-black text-zinc-100 truncate">
                        {item.name}
                      </div>
                      <div className="text-[11px] font-mono font-bold text-amber-300">
                        {item.value.toLocaleString()} Chips
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              // Idle state items preview from selected crate
              Array.from({ length: 15 }).map((_, idx) => {
                const item = selectedCrate.items[idx % selectedCrate.items.length];
                const rarity = RARITY_CONFIG[item.rarity];
                return (
                  <div
                    key={idx}
                    style={{ width: `${ITEM_WIDTH}px` }}
                    className={`flex-shrink-0 h-44 rounded-2xl border p-3 flex flex-col justify-between items-center text-center bg-gradient-to-b ${rarity.bg} border-zinc-800 opacity-60`}
                  >
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${rarity.text}`}>
                      {rarity.label}
                    </span>
                    <span className="text-3xl my-1">{item.icon}</span>
                    <div className="w-full">
                      <div className="text-xs font-bold text-zinc-300 truncate">{item.name}</div>
                      <div className="text-[10px] font-mono text-zinc-400">{item.value} Chips</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Unbox Launch Controls */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 relative z-20">
          <button
            id="unbox-1x-btn"
            disabled={isOpening || balance < selectedCrate.cost}
            onClick={() => handleOpenCrate(1)}
            className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-500 hover:to-pink-500 text-white font-black text-base uppercase tracking-wider shadow-xl shadow-purple-600/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all transform hover:scale-105 flex items-center gap-2"
          >
            <Sparkles className="w-5 h-5 text-yellow-300 animate-spin" />
            <span>UNBOX 1× ({selectedCrate.cost.toLocaleString()} CHIPS)</span>
          </button>
        </div>
      </div>

      {/* WON ITEM REVEAL MODAL */}
      {revealedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg bg-zinc-950 border-2 border-amber-400 rounded-3xl p-6 sm:p-8 shadow-2xl text-center relative overflow-hidden">
            {/* Background sparkle glow */}
            <div className="absolute inset-0 bg-gradient-to-b from-amber-500/10 via-purple-500/10 to-transparent pointer-events-none" />

            <span className="text-xs uppercase tracking-widest font-black text-amber-400">
              UNBOXED ARTIFACT REVEALED
            </span>

            {/* Big item card */}
            <div className={`mt-4 p-6 rounded-3xl border-2 bg-gradient-to-b ${RARITY_CONFIG[revealedItem.rarity].bg} ${RARITY_CONFIG[revealedItem.rarity].border} shadow-2xl flex flex-col items-center justify-center`}>
              <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${RARITY_CONFIG[revealedItem.rarity].text} bg-black/40 border border-current/30`}>
                {RARITY_CONFIG[revealedItem.rarity].label}
              </span>

              <span className="text-7xl my-4 animate-bounce drop-shadow-2xl">
                {revealedItem.icon}
              </span>

              <h3 className="text-xl sm:text-2xl font-black text-zinc-100">
                {revealedItem.name}
              </h3>

              <p className="text-xs text-zinc-300 italic mt-1 max-w-xs">
                "{revealedItem.description}"
              </p>

              <div className="mt-4 p-3 rounded-2xl bg-black/50 border border-amber-500/40 w-full flex items-center justify-around">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold">Resale Cash Value</div>
                  <div className="text-lg font-black text-amber-300 font-mono">
                    +{revealedItem.value.toLocaleString()} Chips
                  </div>
                </div>
                <div className="border-l border-zinc-800 pl-4">
                  <div className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold">Multiplier</div>
                  <div className="text-lg font-black text-emerald-400 font-mono">
                    {(revealedItem.value / selectedCrate.cost).toFixed(1)}x
                  </div>
                </div>
              </div>
            </div>

            {/* Action buttons: Cash out or Keep */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                id="unbox-cashout-btn"
                disabled={claimedStatus !== null}
                onClick={handleCashOut}
                className={`flex-1 py-3 px-4 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all ${
                  claimedStatus === 'cashed'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-zinc-950'
                }`}
              >
                <Coins className="w-4 h-4" />
                <span>
                  {claimedStatus === 'cashed' ? '✓ Chips Added!' : `Cash Out (+${revealedItem.value.toLocaleString()} Chips)`}
                </span>
              </button>

              <button
                id="unbox-vault-btn"
                disabled={claimedStatus !== null}
                onClick={handleKeepItem}
                className={`flex-1 py-3 px-4 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all ${
                  claimedStatus === 'vaulted'
                    ? 'bg-purple-600 text-white'
                    : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700'
                }`}
              >
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>
                  {claimedStatus === 'vaulted' ? '✓ In Trophy Vault!' : 'Keep in Trophy Vault'}
                </span>
              </button>
            </div>

            <button
              onClick={() => {
                if (!claimedStatus) {
                  // Default cashout if closed without action
                  handleCashOut();
                }
                setRevealedItem(null);
              }}
              className="mt-4 text-xs font-bold text-zinc-400 hover:text-zinc-200 underline"
            >
              Done / Open Another Crate
            </button>
          </div>
        </div>
      )}

      {/* CRATE POOL INSPECTION MODAL */}
      {inspectingCrate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{inspectingCrate.icon}</span>
                <div>
                  <h3 className="text-base font-black text-zinc-100 uppercase">
                    {inspectingCrate.name} Prize Pool
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Cost: {inspectingCrate.cost.toLocaleString()} Chips
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectingCrate(null)}
                className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5">
              {inspectingCrate.items.map((item) => {
                const rarity = RARITY_CONFIG[item.rarity];
                const totalWeight = inspectingCrate.items.reduce((s, i) => s + i.dropWeight, 0);
                const dropOdds = ((item.dropWeight / totalWeight) * 100).toFixed(1);

                return (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between p-3 rounded-2xl border bg-gradient-to-r ${rarity.bg} ${rarity.border}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{item.icon}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-zinc-100">{item.name}</span>
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${rarity.text} bg-black/40`}>
                            {rarity.label}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 italic">{item.description}</p>
                      </div>
                    </div>

                    <div className="text-right flex flex-col items-end">
                      <span className="text-xs font-mono font-black text-amber-300">
                        {item.value.toLocaleString()} Chips
                      </span>
                      <span className="text-[10px] font-bold text-zinc-400">
                        {dropOdds}% Drop Rate
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setInspectingCrate(null)}
                className="px-5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
