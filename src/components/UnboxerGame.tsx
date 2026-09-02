import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  Sparkles, 
  Eye, 
  Trophy, 
  RefreshCw, 
  ChevronRight, 
  Package, 
  ArrowDown, 
  Check, 
  Coins, 
  Swords, 
  Layers, 
  Zap, 
  Flame, 
  ArrowRight,
  Plus
} from 'lucide-react';
import { LootCrate, LootItem, ItemRarity, InventoryItem, CasinoStats, UserAccount, CurrencyMode } from '../types';
import { LOOT_CRATES, RARITY_CONFIG, pickRandomLootItem, generateReelItems, formatDropOdds, getCrateCost, getItemValue } from '../utils/crates';
import { sound } from '../utils/audio';
import { CrateBattleArena } from './CrateBattleArena';

interface UnboxerGameProps {
  balance: number;
  userAccount: UserAccount;
  onUpdateBalance: (delta: number) => void;
  onUpdateStats: (updater: (prev: CasinoStats) => CasinoStats) => void;
  currencyMode?: CurrencyMode;
  cashBalance?: number;
  onUpdateCashBalance?: (amount: number | ((prev: number) => number)) => void;
  onRecordWager?: (amount: number, isCash: boolean) => void;
  onAddRakeback?: (wager: number, isBlackjack?: boolean, isCash?: boolean) => void;
}

interface MultiReelState {
  crate: LootCrate;
  items: LootItem[];
  winningItem: LootItem;
  translateX: number;
  revealed: boolean;
}

export const UnboxerGame: React.FC<UnboxerGameProps> = ({
  balance,
  userAccount,
  onUpdateBalance,
  onUpdateStats,
  currencyMode = 'gc',
  cashBalance = 0,
  onUpdateCashBalance,
  onRecordWager,
  onAddRakeback,
}) => {
  const isCash = currencyMode === 'cash';
  const effectiveBalance = isCash ? cashBalance : balance;

  // Navigation: Solo Unbox vs Crate Battles Arena
  const [activeTab, setActiveTab] = useState<'solo' | 'battles'>('solo');

  // Solo Unboxer State
  const [selectedCrate, setSelectedCrate] = useState<LootCrate>(LOOT_CRATES[1]); // Default Street Hustler
  const [multiCount, setMultiCount] = useState<number>(1); // 1, 2, 3, 4, 5, 10
  const [isOpening, setIsOpening] = useState<boolean>(false);
  
  // Single reel state
  const [singleReelItems, setSingleReelItems] = useState<LootItem[]>([]);
  const [revealedItem, setRevealedItem] = useState<LootItem | null>(null);
  
  // Multi reel state
  const [multiReels, setMultiReels] = useState<MultiReelState[]>([]);
  const [multiRevealedItems, setMultiRevealedItems] = useState<LootItem[] | null>(null);
  
  const [inspectingCrate, setInspectingCrate] = useState<LootCrate | null>(null);

  const singleReelRef = useRef<HTMLDivElement>(null);
  const audioTickTimerRef = useRef<number | null>(null);

  const WIN_INDEX = 42;
  const ITEM_WIDTH = 150;
  const ITEM_GAP = 10;

  const currentCrateCost = getCrateCost(selectedCrate, currencyMode);

  const modifyBalance = (delta: number) => {
    if (isCash && onUpdateCashBalance) {
      onUpdateCashBalance(prev => Number((prev + delta).toFixed(2)));
    } else {
      onUpdateBalance(delta);
    }
  };

  // Solo Single or Multi Open sequence
  const handleOpenSoloCrates = (count = multiCount) => {
    const costPerCrate = getCrateCost(selectedCrate, currencyMode);
    const totalCost = isCash ? Number((costPerCrate * count).toFixed(2)) : (costPerCrate * count);
    if (effectiveBalance < totalCost || isOpening) return;

    // Deduct total cost
    modifyBalance(-totalCost);
    onRecordWager?.(totalCost, isCash);
    if (onAddRakeback) {
      onAddRakeback(totalCost, false, isCash);
    }

    onUpdateStats(prev => ({
      ...prev,
      totalWagered: isCash ? prev.totalWagered + (totalCost * 1000) : prev.totalWagered + totalCost,
      cratesOpened: prev.cratesOpened + count,
    }));

    setIsOpening(true);
    setRevealedItem(null);
    setMultiRevealedItems(null);
    sound.playChip();

    // 1. SINGLE CRATE UNBOXING
    if (count === 1) {
      const winItem = pickRandomLootItem(selectedCrate);
      const items = generateReelItems(selectedCrate, winItem, 55, WIN_INDEX);
      setSingleReelItems(items);

      if (singleReelRef.current) {
        singleReelRef.current.style.transition = 'none';
        singleReelRef.current.style.transform = 'translateX(0px)';
      }

      const randomOffset = (Math.random() - 0.5) * 50;
      const targetTranslateX = -(WIN_INDEX * (ITEM_WIDTH + ITEM_GAP) - (singleReelRef.current?.parentElement?.clientWidth || 600) / 2 + ITEM_WIDTH / 2 + randomOffset);

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

      setTimeout(() => {
        if (singleReelRef.current) {
          singleReelRef.current.style.transition = 'transform 6.2s cubic-bezier(0.12, 0.98, 0.22, 1)';
          singleReelRef.current.style.transform = `translateX(${targetTranslateX}px)`;
          playTicks();
        }
      }, 50);

      setTimeout(() => {
        setIsOpening(false);
        setRevealedItem(winItem);

        const val = getItemValue(winItem, currencyMode);
        // Auto credit winnings directly to balance
        modifyBalance(val);

        const isProfit = val > costPerCrate;
        if (winItem.rarity === 'covert' || winItem.rarity === 'mythic' || winItem.rarity === 'exotic') {
          confetti({ particleCount: 120, spread: 90, origin: { y: 0.5 } });
          sound.playLootRare();
        } else if (isProfit) {
          sound.playProfit();
        } else {
          sound.playWin(false);
        }

        onUpdateStats(prev => ({
          ...prev,
          totalWon: isCash ? prev.totalWon + (val * 1000) : prev.totalWon + val,
          biggestWin: isCash ? Math.max(prev.biggestWin, val * 1000) : Math.max(prev.biggestWin, val),
          biggestMultiplier: Math.max(prev.biggestMultiplier, Math.round(val / costPerCrate)),
        }));
      }, 6400);

    } else {
      // 2. MULTI-CRATE SIMULTANEOUS UNBOXING (2x, 3x, 4x, 5x, 10x)
      const generatedReels: MultiReelState[] = [];
      const wonItems: LootItem[] = [];

      for (let i = 0; i < count; i++) {
        const winItem = pickRandomLootItem(selectedCrate);
        wonItems.push(winItem);
        const reelItems = generateReelItems(selectedCrate, winItem, 50, WIN_INDEX);
        const randomOffset = (Math.random() - 0.5) * 40;
        const targetTranslateX = -(WIN_INDEX * (120 + 8) - 180 + 120 / 2 + randomOffset);

        generatedReels.push({
          crate: selectedCrate,
          items: reelItems,
          winningItem: winItem,
          translateX: targetTranslateX,
          revealed: false,
        });
      }

      setMultiReels(generatedReels);

      // Sound ticks for multi-opening
      let tickCount = 0;
      const tickIntervals = [35, 45, 60, 80, 110, 160, 240, 360, 500];
      let intervalIndex = 0;

      const playTicks = () => {
        sound.playCrateTick(Math.random() * 250);
        tickCount++;
        if (tickCount < 35) {
          if (tickCount % 4 === 0 && intervalIndex < tickIntervals.length - 1) {
            intervalIndex++;
          }
          audioTickTimerRef.current = window.setTimeout(playTicks, tickIntervals[intervalIndex]);
        }
      };
      playTicks();

      setTimeout(() => {
        setIsOpening(false);
        setMultiRevealedItems(wonItems);

        const totalWonVal = isCash 
          ? Number(wonItems.reduce((s, item) => s + getItemValue(item, currencyMode), 0).toFixed(2))
          : wonItems.reduce((s, item) => s + getItemValue(item, currencyMode), 0);

        // Auto credit winnings directly to balance
        modifyBalance(totalWonVal);

        const hasRare = wonItems.some(i => i.rarity === 'covert' || i.rarity === 'mythic' || i.rarity === 'exotic');

        if (hasRare) {
          confetti({ particleCount: 140, spread: 100, origin: { y: 0.5 } });
          sound.playLootRare();
        } else if (totalWonVal > totalCost) {
          sound.playProfit();
        } else {
          sound.playWin(false);
        }

        const maxItemVal = Math.max(...wonItems.map(i => getItemValue(i, currencyMode)));
        onUpdateStats(prev => ({
          ...prev,
          totalWon: isCash ? prev.totalWon + (totalWonVal * 1000) : prev.totalWon + totalWonVal,
          biggestWin: isCash ? Math.max(prev.biggestWin, maxItemVal * 1000) : Math.max(prev.biggestWin, maxItemVal),
          biggestMultiplier: Math.max(prev.biggestMultiplier, Math.round(totalWonVal / totalCost)),
        }));
      }, 5600);
    }
  };

  useEffect(() => {
    return () => {
      if (audioTickTimerRef.current) clearTimeout(audioTickTimerRef.current);
    };
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* ========================================================================= */}
      {/* MODE TABS SWITCHER (Solo Unboxer vs Crate Battles Arena)                 */}
      {/* ========================================================================= */}
      <div className="flex items-center justify-between p-1.5 rounded-2xl bg-zinc-950 border-2 border-zinc-800 shadow-xl">
        <button
          id="solo-unboxer-tab-btn"
          onClick={() => {
            if (isOpening) return;
            sound.playChip();
            setActiveTab('solo');
          }}
          className={`flex-1 py-3 px-4 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'solo'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Solo Crate Unboxer (Multi-Open 1x–10x)</span>
        </button>

        <button
          id="crate-battles-tab-btn"
          onClick={() => {
            if (isOpening) return;
            sound.playChip();
            setActiveTab('battles');
          }}
          className={`flex-1 py-3 px-4 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'battles'
              ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-zinc-950 font-black shadow-lg shadow-amber-500/30'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <Swords className="w-4 h-4" />
          <span>⚔️ Crate Battles Arena (1v1 • 2v2 • Group Pots)</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* VIEW: CRATE BATTLES ARENA                                                 */}
      {/* ========================================================================= */}
      {activeTab === 'battles' ? (
        <CrateBattleArena
          balance={balance}
          userAccount={userAccount}
          onUpdateBalance={onUpdateBalance}
          onUpdateStats={onUpdateStats}
          currencyMode={currencyMode}
          cashBalance={cashBalance}
          onUpdateCashBalance={onUpdateCashBalance}
          onRecordWager={onRecordWager}
          onAddRakeback={onAddRakeback}
        />
      ) : (
        <div className="space-y-6">
          {/* Crate Tier Grid (10 Total Crate Tiers) */}
          <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-purple-400" />
                <h2 className="text-sm font-black uppercase tracking-wider text-zinc-100">
                  Select Loot Crate Tier ({LOOT_CRATES.length} Available Tiers)
                </h2>
              </div>
              <span className="text-xs text-zinc-400 font-medium">
                Higher tiers feature rare CS blades, gold bullions & celestial artifacts
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3">
              {LOOT_CRATES.map((crate) => {
                const isSelected = selectedCrate.id === crate.id;
                const cost = getCrateCost(crate, currencyMode);
                const canAfford = effectiveBalance >= cost * multiCount;

                return (
                  <div
                    key={crate.id}
                    id={`crate-card-${crate.id}`}
                    onClick={() => {
                      if (isOpening) return;
                      sound.playChip();
                      setSelectedCrate(crate);
                    }}
                    className={`group relative flex flex-col justify-between p-3 rounded-2xl border-2 transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-zinc-900 border-amber-400 ring-1 ring-amber-400/50 shadow-xl shadow-purple-900/30'
                        : 'bg-zinc-950/80 border-zinc-800 hover:border-zinc-700 opacity-85 hover:opacity-100'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-2xl sm:text-3xl">{crate.icon}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
                          {isCash ? `$${cost.toFixed(2)}` : `${cost.toLocaleString()} GC`}
                        </span>
                      </div>

                      <h3 className="text-xs sm:text-sm font-black text-zinc-100 group-hover:text-amber-300 transition-colors line-clamp-1">
                        {crate.name}
                      </h3>
                      <p className="text-[10px] sm:text-[11px] text-zinc-400 mt-0.5 leading-tight line-clamp-2">
                        {crate.tagline}
                      </p>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-zinc-800 flex items-center justify-between text-[10px] sm:text-[11px]">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setInspectingCrate(crate);
                        }}
                        className="flex items-center gap-1 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Pool ({crate.items.length})</span>
                      </button>
                      <span className="text-purple-400 font-bold flex items-center">
                        {isSelected ? 'Active' : 'Select'} <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* HORIZONTAL REEL SPINNER STAGE                                             */}
          {/* ========================================================================= */}
          <div className="relative rounded-3xl bg-zinc-950 border-2 border-zinc-800 p-4 sm:p-6 shadow-2xl overflow-hidden">
            {/* Ambient background glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-950/20 via-zinc-950 to-purple-950/20 pointer-events-none" />

            {/* SINGLE REEL MODE (When Multi Count = 1) */}
            {multiCount === 1 ? (
              <div className="relative w-full overflow-hidden py-4">
                {/* Needle / Center Marker */}
                <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-1 bg-gradient-to-b from-yellow-400 via-amber-500 to-yellow-400 z-30 shadow-[0_0_15px_rgba(234,179,8,1)] pointer-events-none">
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2">
                    <ArrowDown className="w-6 h-6 text-yellow-400 fill-current animate-bounce drop-shadow" />
                  </div>
                </div>

                <div
                  ref={singleReelRef}
                  className="flex items-center gap-2.5 will-change-transform"
                  style={{ width: 'max-content' }}
                >
                  {singleReelItems.length > 0 ? (
                    singleReelItems.map((item, idx) => {
                      const rarity = RARITY_CONFIG[item.rarity];
                      const val = getItemValue(item, currencyMode);
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
                              {isCash ? `$${val.toFixed(2)}` : `${val.toLocaleString()} GC`}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    // Idle state preview
                    Array.from({ length: 15 }).map((_, idx) => {
                      const item = selectedCrate.items[idx % selectedCrate.items.length];
                      const rarity = RARITY_CONFIG[item.rarity];
                      const val = getItemValue(item, currencyMode);
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
                            <div className="text-[10px] font-mono text-zinc-400">{isCash ? `$${val.toFixed(2)}` : `${val.toLocaleString()} GC`}</div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            ) : (
              /* MULTI-REEL SIMULTANEOUS SPINNER GRID (When Multi Count > 1) */
              <div className="space-y-3 py-2">
                <div className="text-center mb-2">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                    ⚡ {multiCount}× SIMULTANEOUS CRATE UNBOXING
                  </span>
                </div>

                <div className={`grid gap-3 ${
                  multiCount <= 2 ? 'grid-cols-1 md:grid-cols-2' : 
                  multiCount <= 4 ? 'grid-cols-1 sm:grid-cols-2' : 
                  'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                }`}>
                  {Array.from({ length: multiCount }).map((_, rIdx) => {
                    const reel = multiReels[rIdx];
                    return (
                      <div
                        key={`multi-strip-${rIdx}`}
                        className="relative h-28 rounded-2xl bg-zinc-950 border border-zinc-800 overflow-hidden flex items-center shadow-inner"
                      >
                        {/* Needle */}
                        <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-yellow-400 z-30 shadow-[0_0_10px_rgba(234,179,8,1)] pointer-events-none">
                          <ArrowDown className="w-3 h-3 text-yellow-400 fill-current -top-1 -left-1 absolute" />
                        </div>

                        {reel ? (
                          <div
                            className="flex items-center gap-2 will-change-transform px-3"
                            style={{
                              transform: isOpening ? `translateX(${reel.translateX}px)` : 'translateX(0px)',
                              transition: isOpening ? `transform ${5.0 + rIdx * 0.1}s cubic-bezier(0.12, 0.98, 0.22, 1)` : 'none',
                            }}
                          >
                            {reel.items.map((item, iIdx) => {
                              const rarity = RARITY_CONFIG[item.rarity];
                              const val = getItemValue(item, currencyMode);
                              return (
                                <div
                                  key={`item-${rIdx}-${iIdx}`}
                                  style={{ width: '120px' }}
                                  className={`flex-shrink-0 h-24 rounded-xl border p-1.5 flex flex-col justify-between items-center text-center bg-gradient-to-b ${rarity.bg} ${rarity.border}`}
                                >
                                  <span className={`text-[8px] font-black uppercase ${rarity.text}`}>
                                    {rarity.label}
                                  </span>
                                  <span className="text-2xl">{item.icon}</span>
                                  <div className="w-full truncate text-[9px] font-bold text-zinc-200">
                                    {item.name}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="w-full flex items-center justify-center gap-2 text-zinc-500 text-xs">
                            <span>{selectedCrate.icon}</span>
                            <span>Crate #{rIdx + 1} Ready ({isCash ? `$${currentCrateCost.toFixed(2)}` : `${currentCrateCost.toLocaleString()} GC`})</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* UNBOX MULTIPLIER & LAUNCH CONTROLS */}
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-zinc-800/80 pt-4 relative z-20">
              {/* Multiplier Count Selector */}
              <div className="flex items-center gap-1.5 bg-zinc-900 p-1 rounded-2xl border border-zinc-800">
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 px-2">
                  Count:
                </span>
                {[1, 2, 3, 4, 5, 10].map((num) => (
                  <button
                    key={num}
                    type="button"
                    disabled={isOpening}
                    onClick={() => {
                      sound.playChip();
                      setMultiCount(num);
                    }}
                    className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer ${
                      multiCount === num
                        ? 'bg-amber-400 text-zinc-950 shadow-md'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                    }`}
                  >
                    {num}×
                  </button>
                ))}
              </div>

              {/* Action Button */}
              <button
                id="unbox-launch-btn"
                disabled={isOpening || effectiveBalance < currentCrateCost * multiCount}
                onClick={() => handleOpenSoloCrates(multiCount)}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-500 hover:to-pink-500 text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-purple-600/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all transform hover:scale-105 flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-5 h-5 text-yellow-300" />
                <span>
                  UNBOX {multiCount}× ({isCash ? `$${(currentCrateCost * multiCount).toFixed(2)}` : `${(currentCrateCost * multiCount).toLocaleString()} GC`})
                </span>
              </button>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SINGLE WON ITEM REVEAL MODAL                                              */}
          {/* ========================================================================= */}
          {revealedItem && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
              <div className="w-full max-w-lg bg-zinc-950 border-2 border-amber-400 rounded-3xl p-6 sm:p-8 shadow-2xl text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-amber-500/10 via-purple-500/10 to-transparent pointer-events-none" />

                <span className="text-xs uppercase tracking-widest font-black text-amber-400">
                  UNBOXED ARTIFACT REVEALED
                </span>

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
                      <div className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold">Resale Value</div>
                      <div className="text-lg font-black text-amber-300 font-mono">
                        +{isCash ? `$${getItemValue(revealedItem, currencyMode).toFixed(2)}` : `${getItemValue(revealedItem, currencyMode).toLocaleString()} GC`}
                      </div>
                    </div>
                    <div className="border-l border-zinc-800 pl-4">
                      <div className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold">Multiplier</div>
                      <div className="text-lg font-black text-emerald-400 font-mono">
                        {(getItemValue(revealedItem, currencyMode) / currentCrateCost).toFixed(1)}x
                      </div>
                    </div>
                  </div>
                </div>

                {/* Auto Payout Notification */}
                <div className="mt-4 p-3 rounded-2xl bg-emerald-950/80 border border-emerald-400/70 flex items-center justify-center gap-2 shadow-lg">
                  <Coins className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span className="text-xs font-black text-emerald-300 font-mono">
                    ✓ +{isCash ? `$${getItemValue(revealedItem, currencyMode).toFixed(2)}` : `${getItemValue(revealedItem, currencyMode).toLocaleString()} GC`} Added Directly to Balance!
                  </span>
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={() => {
                      setRevealedItem(null);
                      handleOpenSoloCrates(1);
                    }}
                    className="flex-1 py-3 px-4 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 text-zinc-950 shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer transform hover:scale-105"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Open Again ({isCash ? `$${currentCrateCost.toFixed(2)}` : `${currentCrateCost.toLocaleString()} GC`})</span>
                  </button>

                  <button
                    onClick={() => setRevealedItem(null)}
                    className="py-3 px-5 rounded-2xl font-bold text-xs sm:text-sm bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 transition-colors cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* MULTI-UNBOX WON ITEMS REVEAL MODAL                                        */}
          {/* ========================================================================= */}
          {multiRevealedItems && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
              <div className="w-full max-w-3xl bg-zinc-950 border-2 border-amber-400 rounded-3xl p-6 sm:p-8 shadow-2xl text-center relative overflow-hidden max-h-[90vh] overflow-y-auto">
                <div className="absolute inset-0 bg-gradient-to-b from-amber-500/10 via-purple-500/10 to-transparent pointer-events-none" />

                <span className="text-xs uppercase tracking-widest font-black text-amber-400">
                  {multiRevealedItems.length}× BATCH UNBOX REVEALED
                </span>

                {/* Batch Stats Summary */}
                <div className="mt-4 p-4 rounded-2xl bg-zinc-900 border border-zinc-800 grid grid-cols-3 gap-3 text-center">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-zinc-400">Total Spent</div>
                    <div className="text-sm sm:text-base font-black text-zinc-300 font-mono">
                      {isCash ? `$${(currentCrateCost * multiRevealedItems.length).toFixed(2)}` : `${(currentCrateCost * multiRevealedItems.length).toLocaleString()} GC`}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-zinc-400">Total Loot Worth</div>
                    <div className="text-sm sm:text-base font-black text-amber-300 font-mono">
                      +{isCash ? `$${multiRevealedItems.reduce((s, i) => s + getItemValue(i, currencyMode), 0).toFixed(2)}` : `${multiRevealedItems.reduce((s, i) => s + getItemValue(i, currencyMode), 0).toLocaleString()} GC`}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-zinc-400">Return Multiplier</div>
                    <div className="text-sm sm:text-base font-black text-emerald-400 font-mono">
                      {(multiRevealedItems.reduce((s, i) => s + getItemValue(i, currencyMode), 0) / (currentCrateCost * multiRevealedItems.length)).toFixed(2)}x
                    </div>
                  </div>
                </div>

                {/* Auto Payout Notification */}
                <div className="mt-4 p-3 rounded-2xl bg-emerald-950/80 border border-emerald-400/70 flex items-center justify-center gap-2 shadow-lg">
                  <Coins className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span className="text-xs font-black text-emerald-300 font-mono">
                    ✓ +{isCash ? `$${multiRevealedItems.reduce((s, i) => s + getItemValue(i, currencyMode), 0).toFixed(2)}` : `${multiRevealedItems.reduce((s, i) => s + getItemValue(i, currencyMode), 0).toLocaleString()} GC`} Total Auto-Collected to Balance!
                  </span>
                </div>

                {/* Items Grid */}
                <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {multiRevealedItems.map((item, idx) => {
                    const rarity = RARITY_CONFIG[item.rarity];
                    const val = getItemValue(item, currencyMode);
                    return (
                      <div
                        key={`batch-won-${item.id}-${idx}`}
                        className={`p-3 rounded-2xl border-2 bg-gradient-to-b ${rarity.bg} ${rarity.border} flex flex-col justify-between items-center text-center shadow-lg`}
                      >
                        <span className={`text-[8px] font-black uppercase ${rarity.text}`}>
                          {rarity.label}
                        </span>
                        <span className="text-3xl my-1.5">{item.icon}</span>
                        <div className="w-full">
                          <div className="text-xs font-black text-zinc-100 truncate">{item.name}</div>
                          <div className="text-[11px] font-mono font-bold text-amber-300">{isCash ? `$${val.toFixed(2)}` : `${val.toLocaleString()} GC`}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={() => {
                      const count = multiRevealedItems.length;
                      setMultiRevealedItems(null);
                      handleOpenSoloCrates(count);
                    }}
                    className="flex-1 py-3.5 px-5 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 text-zinc-950 shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer transform hover:scale-105"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Open Again ({isCash ? `$${(currentCrateCost * multiRevealedItems.length).toFixed(2)}` : `${(currentCrateCost * multiRevealedItems.length).toLocaleString()} GC`})</span>
                  </button>

                  <button
                    onClick={() => setMultiRevealedItems(null)}
                    className="py-3.5 px-6 rounded-2xl font-bold text-xs sm:text-sm bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 transition-colors cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* CRATE POOL INSPECTION MODAL                                               */}
          {/* ========================================================================= */}
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
                        Cost: {isCash ? `$${getCrateCost(inspectingCrate, currencyMode).toFixed(2)}` : `${getCrateCost(inspectingCrate, currencyMode).toLocaleString()} GC`}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setInspectingCrate(null)}
                    className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-2.5">
                  {inspectingCrate.items.map((item) => {
                    const rarity = RARITY_CONFIG[item.rarity];
                    const val = getItemValue(item, currencyMode);
                    const totalWeight = inspectingCrate.items.reduce((s, i) => s + i.dropWeight, 0);
                    return (
                      <div
                        key={`pool-${inspectingCrate.id}-${item.id}`}
                        className={`p-3 rounded-2xl border bg-gradient-to-r ${rarity.bg} ${rarity.border} flex items-center justify-between gap-3 shadow`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-3xl shrink-0">{item.icon}</span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-black text-zinc-100">{item.name}</span>
                              <span className={`text-[9px] font-black uppercase px-2 py-0.2 rounded-full ${rarity.text} bg-black/40 border border-current/30`}>
                                {rarity.label}
                              </span>
                            </div>
                            <p className="text-xs text-zinc-400 italic line-clamp-1">{item.description}</p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="text-sm font-black text-amber-300 font-mono">
                            {isCash ? `$${val.toFixed(2)}` : `${val.toLocaleString()} GC`}
                          </div>
                          <div className="text-[10px] text-zinc-400 font-bold">
                            Drop: {formatDropOdds(item.dropWeight, totalWeight)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
