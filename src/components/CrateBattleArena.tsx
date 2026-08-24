import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  Swords, 
  Users, 
  UserPlus, 
  Crown, 
  Sparkles, 
  ChevronRight, 
  ArrowRight, 
  RotateCcw, 
  Trophy, 
  Coins, 
  Shield, 
  Check, 
  Plus, 
  Minus, 
  Trash2, 
  Zap, 
  ArrowDown, 
  Play, 
  PlusCircle, 
  RefreshCw,
  HelpCircle,
  TrendingUp,
  Package
} from 'lucide-react';
import { 
  LootCrate, 
  LootItem, 
  BattleMode, 
  BattleSeat, 
  CrateBattle, 
  UserAccount, 
  CasinoStats 
} from '../types';
import { 
  LOOT_CRATES, 
  RARITY_CONFIG, 
  pickRandomLootItem, 
  generateReelItems, 
  AI_BATTLE_BOTS, 
  getRandomAIBot, 
  sortCratesByCost 
} from '../utils/crates';
import { sound } from '../utils/audio';

interface CrateBattleArenaProps {
  balance: number;
  userAccount: UserAccount;
  onUpdateBalance: (delta: number) => void;
  onAddToInventory: (item: LootItem, crateId: string) => void;
  onUpdateStats: (updater: (prev: CasinoStats) => CasinoStats) => void;
}

interface ActiveReelState {
  items: LootItem[];
  winningItem: LootItem | null;
  translateX: number;
  revealed: boolean;
}

export const CrateBattleArena: React.FC<CrateBattleArenaProps> = ({
  balance,
  userAccount,
  onUpdateBalance,
  onAddToInventory,
  onUpdateStats,
}) => {
  // Current view inside Battles Arena
  const [viewState, setViewState] = useState<'lobby' | 'create' | 'battle'>('lobby');
  
  // Creation state
  const [createMode, setCreateMode] = useState<BattleMode>('1v1');
  const [createPlayerCount, setCreatePlayerCount] = useState<number>(2); // 2, 3, 4
  const [selectedPlaylist, setSelectedPlaylist] = useState<{ crate: LootCrate; count: number }[]>([
    { crate: LOOT_CRATES[0], count: 1 }, // Bum Bag
    { crate: LOOT_CRATES[1], count: 1 }, // Street Hustler
  ]);
  
  // Active / Selected Battle
  const [activeBattle, setActiveBattle] = useState<CrateBattle | null>(null);
  
  // Round Execution State
  const [battlePhase, setBattlePhase] = useState<'waiting' | 'spinning' | 'round-summary' | 'completed'>('waiting');
  const [currentRoundIndex, setCurrentRoundIndex] = useState<number>(0);
  const [seatReels, setSeatReels] = useState<Record<number, ActiveReelState>>({});
  const [roundWinningItems, setRoundWinningItems] = useState<Record<number, LootItem>>({});
  const [claimedStatus, setClaimedStatus] = useState<'cashed' | 'vaulted' | null>(null);
  
  const tickAudioRef = useRef<number | null>(null);

  // Premade / Seeded Battles in Lobby
  const [availableBattles, setAvailableBattles] = useState<CrateBattle[]>([
    {
      id: 'battle-pre-1',
      title: '⚡ Fast 1v1 Street Hustler Duel',
      mode: '1v1',
      maxPlayers: 2,
      crates: [LOOT_CRATES[0], LOOT_CRATES[1]], // 10c, 50c
      seats: [
        {
          id: 'bot-1',
          name: 'DegenDan',
          avatar: '🎩',
          isAI: true,
          isUser: false,
          ready: true,
          currentTotalValue: 0,
          unboxedItems: [],
        },
        null,
      ],
      status: 'waiting',
      currentRound: 0,
      createdAt: Date.now() - 30000,
      createdBy: 'DegenDan',
    },
    {
      id: 'battle-pre-2',
      title: '💎 2v2 High-Roller Team Showdown',
      mode: '2v2',
      maxPlayers: 4,
      crates: [LOOT_CRATES[1], LOOT_CRATES[2], LOOT_CRATES[3]], // 50c, 100c, 200c
      seats: [
        {
          id: 'bot-2',
          name: 'WhaleVince',
          avatar: '🐋',
          isAI: true,
          isUser: false,
          team: 1,
          ready: true,
          currentTotalValue: 0,
          unboxedItems: [],
        },
        null,
        {
          id: 'bot-3',
          name: 'CryptoKing',
          avatar: '👑',
          isAI: true,
          isUser: false,
          team: 2,
          ready: true,
          currentTotalValue: 0,
          unboxedItems: [],
        },
        null,
      ],
      status: 'waiting',
      currentRound: 0,
      createdAt: Date.now() - 60000,
      createdBy: 'WhaleVince',
    },
    {
      id: 'battle-pre-3',
      title: '🤝 4-Player Shared Pot Co-op Lounge',
      mode: 'group-split',
      maxPlayers: 4,
      crates: [LOOT_CRATES[0], LOOT_CRATES[1], LOOT_CRATES[2]],
      seats: [
        {
          id: 'bot-4',
          name: 'LuckyLucy',
          avatar: '🍀',
          isAI: true,
          isUser: false,
          ready: true,
          currentTotalValue: 0,
          unboxedItems: [],
        },
        {
          id: 'bot-5',
          name: 'VegasVic',
          avatar: '🎲',
          isAI: true,
          isUser: false,
          ready: true,
          currentTotalValue: 0,
          unboxedItems: [],
        },
        null,
        null,
      ],
      status: 'waiting',
      currentRound: 0,
      createdAt: Date.now() - 90000,
      createdBy: 'LuckyLucy',
    },
  ]);

  // Expand playlist into flat array of crates sorted by cost ascending
  const getFlatSortedCrates = (playlist: { crate: LootCrate; count: number }[]): LootCrate[] => {
    const flat: LootCrate[] = [];
    playlist.forEach(item => {
      for (let i = 0; i < item.count; i++) {
        flat.push(item.crate);
      }
    });
    return sortCratesByCost(flat);
  };

  // Calculate total entry cost per player
  const calculateTotalCost = (playlist: { crate: LootCrate; count: number }[]): number => {
    return playlist.reduce((sum, item) => sum + (item.crate.cost * item.count), 0);
  };

  // Add/remove crates in playlist creator
  const handleModifyPlaylistItem = (crate: LootCrate, delta: number) => {
    sound.playChip();
    setSelectedPlaylist(prev => {
      const existing = prev.find(p => p.crate.id === crate.id);
      if (!existing && delta > 0) {
        return [...prev, { crate, count: delta }];
      }
      if (existing) {
        const nextCount = existing.count + delta;
        if (nextCount <= 0) {
          return prev.filter(p => p.crate.id !== crate.id);
        }
        return prev.map(p => p.crate.id === crate.id ? { ...p, count: nextCount } : p);
      }
      return prev;
    });
  };

  // Create Battle Action
  const handleCreateBattle = () => {
    const sortedCrates = getFlatSortedCrates(selectedPlaylist);
    if (sortedCrates.length === 0) return;

    const totalCost = calculateTotalCost(selectedPlaylist);
    if (balance < totalCost) {
      alert(`Insufficient balance! Battle entry requires ${totalCost.toLocaleString()} chips.`);
      return;
    }

    const seatsCount = createMode === '1v1' ? 2 : createMode === '2v2' ? 4 : createPlayerCount;
    const initialSeats: (BattleSeat | null)[] = Array(seatsCount).fill(null);

    // Host user takes Seat 0
    initialSeats[0] = {
      id: userAccount.id || 'user-me',
      name: userAccount.username || 'You (Host)',
      avatar: userAccount.avatar || '👤',
      isAI: false,
      isUser: true,
      team: createMode === '2v2' ? 1 : undefined,
      ready: true,
      currentTotalValue: 0,
      unboxedItems: [],
    };

    let title = '';
    if (createMode === '1v1') title = `⚔️ 1v1 Duel (${totalCost.toLocaleString()}c)`;
    else if (createMode === '2v2') title = `🛡️ 2v2 Squad Clash (${totalCost.toLocaleString()}c)`;
    else if (createMode === 'group-ffa') title = `👑 ${seatsCount}-Player FFA Versus (${totalCost.toLocaleString()}c)`;
    else title = `🤝 ${seatsCount}-Player Shared Pot Co-op (${totalCost.toLocaleString()}c)`;

    const newBattle: CrateBattle = {
      id: `battle-${Date.now()}`,
      title,
      mode: createMode,
      maxPlayers: seatsCount,
      crates: sortedCrates,
      seats: initialSeats,
      status: 'waiting',
      currentRound: 0,
      createdAt: Date.now(),
      createdBy: userAccount.username || 'Host',
    };

    setAvailableBattles(prev => [newBattle, ...prev]);
    setActiveBattle(newBattle);
    setViewState('battle');
    setBattlePhase('waiting');
    setCurrentRoundIndex(0);
    setClaimedStatus(null);
    sound.playChip();
  };

  // Join an existing battle from the lobby
  const handleJoinBattle = (battle: CrateBattle, seatIndex: number) => {
    const totalCost = battle.crates.reduce((sum, c) => sum + c.cost, 0);
    if (balance < totalCost) {
      alert(`Insufficient balance! Battle entry requires ${totalCost.toLocaleString()} chips.`);
      return;
    }

    const updatedSeats = [...battle.seats];
    updatedSeats[seatIndex] = {
      id: userAccount.id || 'user-me',
      name: userAccount.username || 'You',
      avatar: userAccount.avatar || '👤',
      isAI: false,
      isUser: true,
      team: battle.mode === '2v2' ? (seatIndex < 2 ? 1 : 2) : undefined,
      ready: true,
      currentTotalValue: 0,
      unboxedItems: [],
    };

    const updatedBattle = { ...battle, seats: updatedSeats };
    setActiveBattle(updatedBattle);
    setViewState('battle');
    setBattlePhase('waiting');
    setCurrentRoundIndex(0);
    setClaimedStatus(null);
    sound.playChip();
  };

  // Add AI bot to a specific seat
  const handleAddAIBot = (seatIndex: number) => {
    if (!activeBattle) return;
    sound.playChip();

    const existingNames = activeBattle.seats.filter(Boolean).map(s => s!.name);
    const bot = getRandomAIBot(existingNames);

    const updatedSeats = [...activeBattle.seats];
    updatedSeats[seatIndex] = {
      id: `bot-${Date.now()}-${seatIndex}`,
      name: bot.name,
      avatar: bot.avatar,
      isAI: true,
      isUser: false,
      team: activeBattle.mode === '2v2' ? (seatIndex < 2 ? 1 : 2) : undefined,
      ready: true,
      currentTotalValue: 0,
      unboxedItems: [],
    };

    setActiveBattle({
      ...activeBattle,
      seats: updatedSeats,
    });
  };

  // Remove player/bot from a seat
  const handleRemoveSeat = (seatIndex: number) => {
    if (!activeBattle) return;
    sound.playChip();

    const updatedSeats = [...activeBattle.seats];
    updatedSeats[seatIndex] = null;

    setActiveBattle({
      ...activeBattle,
      seats: updatedSeats,
    });
  };

  // Fill all remaining empty seats with AI bots
  const handleFillAllWithAI = () => {
    if (!activeBattle) return;
    sound.playChip();

    const updatedSeats = [...activeBattle.seats];
    const existingNames = updatedSeats.filter(Boolean).map(s => s!.name);

    for (let i = 0; i < updatedSeats.length; i++) {
      if (!updatedSeats[i]) {
        const bot = getRandomAIBot(existingNames);
        existingNames.push(bot.name);
        updatedSeats[i] = {
          id: `bot-${Date.now()}-${i}`,
          name: bot.name,
          avatar: bot.avatar,
          isAI: true,
          isUser: false,
          team: activeBattle.mode === '2v2' ? (i < 2 ? 1 : 2) : undefined,
          ready: true,
          currentTotalValue: 0,
          unboxedItems: [],
        };
      }
    }

    setActiveBattle({
      ...activeBattle,
      seats: updatedSeats,
    });
  };

  // START BATTLE EXECUTION
  const handleStartBattle = () => {
    if (!activeBattle) return;

    // Verify all seats are filled
    const allFilled = activeBattle.seats.every(s => s !== null);
    if (!allFilled) {
      alert('Please fill all seats before starting the battle!');
      return;
    }

    const totalCost = activeBattle.crates.reduce((sum, c) => sum + c.cost, 0);

    // Deduct user balance
    onUpdateBalance(-totalCost);
    onUpdateStats(prev => ({
      ...prev,
      totalWagered: prev.totalWagered + totalCost,
      cratesOpened: prev.cratesOpened + activeBattle.crates.length,
    }));

    sound.playChip();
    setCurrentRoundIndex(0);
    setBattlePhase('spinning');
    executeRound(0, activeBattle);
  };

  // Execute a single round of crate opening for all seats
  const executeRound = (roundIdx: number, battle: CrateBattle) => {
    const currentCrate = battle.crates[roundIdx];
    if (!currentCrate) return;

    setBattlePhase('spinning');

    const WIN_INDEX = 40;
    const ITEM_WIDTH = 130;
    const ITEM_GAP = 8;

    const roundWins: Record<number, LootItem> = {};
    const newReelStates: Record<number, ActiveReelState> = {};

    battle.seats.forEach((seat, seatIdx) => {
      if (!seat) return;
      const winItem = pickRandomLootItem(currentCrate);
      roundWins[seatIdx] = winItem;

      const reelItems = generateReelItems(currentCrate, winItem, 55, WIN_INDEX);
      const randomOffset = (Math.random() - 0.5) * 40;
      const targetTranslateX = -(WIN_INDEX * (ITEM_WIDTH + ITEM_GAP) - 240 + ITEM_WIDTH / 2 + randomOffset);

      newReelStates[seatIdx] = {
        items: reelItems,
        winningItem: winItem,
        translateX: targetTranslateX,
        revealed: false,
      };
    });

    setRoundWinningItems(roundWins);
    setSeatReels(newReelStates);

    // Play ticking sound effect
    let tickCount = 0;
    const tickIntervals = [40, 50, 60, 80, 110, 150, 220, 320, 450];
    let intervalIndex = 0;

    const playTicks = () => {
      sound.playCrateTick(Math.random() * 150);
      tickCount++;
      if (tickCount < 30) {
        if (tickCount % 4 === 0 && intervalIndex < tickIntervals.length - 1) {
          intervalIndex++;
        }
        tickAudioRef.current = window.setTimeout(playTicks, tickIntervals[intervalIndex]);
      }
    };
    playTicks();

    // End of spin deceleration (~5.5 seconds)
    setTimeout(() => {
      // Mark all reels as revealed
      setSeatReels(prev => {
        const updated: Record<number, ActiveReelState> = {};
        Object.keys(prev).forEach(k => {
          const idx = Number(k);
          updated[idx] = { ...prev[idx], revealed: true };
        });
        return updated;
      });

      // Update seats total value & unboxed items
      const updatedSeats = battle.seats.map((seat, seatIdx) => {
        if (!seat) return null;
        const win = roundWins[seatIdx];
        return {
          ...seat,
          currentTotalValue: seat.currentTotalValue + win.value,
          unboxedItems: [...seat.unboxedItems, win],
        };
      });

      const updatedBattle = { ...battle, seats: updatedSeats };
      setActiveBattle(updatedBattle);

      // Check if any rare item landed this round
      const anyRare = Object.values(roundWins).some(
        item => item.rarity === 'covert' || item.rarity === 'mythic' || item.rarity === 'exotic'
      );
      if (anyRare) {
        sound.playLootRare();
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      } else {
        sound.playWin(false);
      }

      setBattlePhase('round-summary');

      // If more rounds remaining, automatically trigger next round after pause
      if (roundIdx + 1 < battle.crates.length) {
        setTimeout(() => {
          setCurrentRoundIndex(roundIdx + 1);
          executeRound(roundIdx + 1, updatedBattle);
        }, 3200);
      } else {
        // Battle Completed! Final resolution
        setTimeout(() => {
          resolveFinalBattle(updatedBattle);
        }, 2200);
      }
    }, 5500);
  };

  // Resolve final battle winners and rewards
  const resolveFinalBattle = (battle: CrateBattle) => {
    setBattlePhase('completed');

    const totalLootPool = battle.seats.reduce(
      (sum, s) => sum + (s?.currentTotalValue || 0), 
      0
    );

    let winnerSeatIdx = 0;
    let winnerTeam: 1 | 2 = 1;
    let sharedPotPerPlayer = 0;

    if (battle.mode === '1v1' || battle.mode === 'group-ffa') {
      // Highest individual score wins entire pot
      let highestVal = -1;
      battle.seats.forEach((seat, idx) => {
        if (seat && seat.currentTotalValue > highestVal) {
          highestVal = seat.currentTotalValue;
          winnerSeatIdx = idx;
        }
      });
    } else if (battle.mode === '2v2') {
      // Team 1 (Seats 0 & 1) vs Team 2 (Seats 2 & 3)
      const team1Val = (battle.seats[0]?.currentTotalValue || 0) + (battle.seats[1]?.currentTotalValue || 0);
      const team2Val = (battle.seats[2]?.currentTotalValue || 0) + (battle.seats[3]?.currentTotalValue || 0);
      winnerTeam = team1Val >= team2Val ? 1 : 2;
    } else if (battle.mode === 'group-split') {
      // Shared Pot is evenly divided among active seats
      const validSeatsCount = battle.seats.filter(Boolean).length;
      sharedPotPerPlayer = Math.round(totalLootPool / (validSeatsCount || 1));
    }

    const completedBattle: CrateBattle = {
      ...battle,
      status: 'completed',
      winnerSeatIndex: winnerSeatIdx,
      winnerTeam,
      sharedPotPerPlayer,
    };

    setActiveBattle(completedBattle);

    // Check if user won
    const userSeatIndex = battle.seats.findIndex(s => s?.isUser);
    const userWon = 
      (battle.mode === '1v1' || battle.mode === 'group-ffa') ? winnerSeatIdx === userSeatIndex :
      (battle.mode === '2v2') ? (battle.seats[userSeatIndex]?.team === winnerTeam) :
      true; // Shared Pot means user participates in split!

    if (userWon) {
      confetti({ particleCount: 150, spread: 100, origin: { y: 0.5 } });
      sound.playProfit();
    } else {
      sound.playWin(false);
    }
  };

  // Cash out won battle loot
  const handleCashOutBattleWinnings = () => {
    if (!activeBattle || claimedStatus) return;
    sound.playChip();

    const userSeatIndex = activeBattle.seats.findIndex(s => s?.isUser);
    if (userSeatIndex === -1) return;

    let winnings = 0;
    if (activeBattle.mode === '1v1' || activeBattle.mode === 'group-ffa') {
      if (activeBattle.winnerSeatIndex === userSeatIndex) {
        // Winner takes all items from everyone!
        winnings = activeBattle.seats.reduce((sum, s) => sum + (s?.currentTotalValue || 0), 0);
      } else {
        winnings = 0; // Lost versus battle
      }
    } else if (activeBattle.mode === '2v2') {
      const userTeam = activeBattle.seats[userSeatIndex]?.team;
      if (userTeam === activeBattle.winnerTeam) {
        // Winning team splits total battle loot pot 50/50
        const totalPot = activeBattle.seats.reduce((sum, s) => sum + (s?.currentTotalValue || 0), 0);
        winnings = Math.round(totalPot / 2);
      } else {
        winnings = 0;
      }
    } else if (activeBattle.mode === 'group-split') {
      // Split pot
      winnings = activeBattle.sharedPotPerPlayer || 0;
    }

    if (winnings > 0) {
      onUpdateBalance(winnings);
      onUpdateStats(prev => ({
        ...prev,
        totalWon: prev.totalWon + winnings,
        biggestWin: Math.max(prev.biggestWin, winnings),
      }));
    }

    setClaimedStatus('cashed');
  };

  // Send won battle items to trophy vault
  const handleVaultBattleWinnings = () => {
    if (!activeBattle || claimedStatus) return;
    sound.playChip();

    const userSeatIndex = activeBattle.seats.findIndex(s => s?.isUser);
    if (userSeatIndex === -1) return;

    let allWonItems: LootItem[] = [];

    if (activeBattle.mode === '1v1' || activeBattle.mode === 'group-ffa') {
      if (activeBattle.winnerSeatIndex === userSeatIndex) {
        // Takes all items unboxed in the match
        activeBattle.seats.forEach(s => {
          if (s) allWonItems.push(...s.unboxedItems);
        });
      }
    } else if (activeBattle.mode === '2v2') {
      const userTeam = activeBattle.seats[userSeatIndex]?.team;
      if (userTeam === activeBattle.winnerTeam) {
        // Takes items unboxed by user's team
        activeBattle.seats.forEach(s => {
          if (s && s.team === userTeam) allWonItems.push(...s.unboxedItems);
        });
      }
    } else if (activeBattle.mode === 'group-split') {
      // Takes items unboxed by user themselves
      const userSeat = activeBattle.seats[userSeatIndex];
      if (userSeat) allWonItems = [...userSeat.unboxedItems];
    }

    allWonItems.forEach(item => {
      onAddToInventory(item, activeBattle.crates[0]?.id || 'battle-item');
    });

    setClaimedStatus('vaulted');
  };

  useEffect(() => {
    return () => {
      if (tickAudioRef.current) clearTimeout(tickAudioRef.current);
    };
  }, []);

  // Total battle value calculation
  const totalBattleLoot = activeBattle?.seats.reduce((sum, s) => sum + (s?.currentTotalValue || 0), 0) || 0;
  const userSeatIdx = activeBattle?.seats.findIndex(s => s?.isUser) ?? -1;
  const userSeat = userSeatIdx !== -1 && activeBattle ? activeBattle.seats[userSeatIdx] : null;

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* TOP ARENA HEADER & NAVIGATION BAR                                         */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-3xl bg-zinc-950/80 border-2 border-purple-500/40 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-purple-500/30">
            <Swords className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black uppercase text-zinc-100">
                Loot Crate Battles Arena
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                1v1 • 2v2 • Group Pots
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Unbox a sequence of crates from least to most expensive. Winner takes all or split the shared pot!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {viewState !== 'lobby' && (
            <button
              onClick={() => {
                sound.playChip();
                setViewState('lobby');
                setActiveBattle(null);
                setBattlePhase('waiting');
              }}
              className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-bold border border-zinc-700 transition-colors"
            >
              ← Battle Lobby
            </button>
          )}

          {viewState === 'lobby' && (
            <button
              onClick={() => {
                sound.playChip();
                setViewState('create');
              }}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-purple-600/30 flex items-center gap-1.5 transition-all transform hover:scale-105"
            >
              <PlusCircle className="w-4 h-4 text-yellow-300" />
              <span>Create Custom Battle</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: ACTIVE BATTLES LOBBY                                              */}
      {/* ========================================================================= */}
      {viewState === 'lobby' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-zinc-300 flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-400" />
              <span>Joinable Open Battles ({availableBattles.length})</span>
            </h3>
            <span className="text-xs text-zinc-500 font-mono">
              Click any open seat to join instantly
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableBattles.map((battle) => {
              const totalCost = battle.crates.reduce((sum, c) => sum + c.cost, 0);
              const filledSeatsCount = battle.seats.filter(Boolean).length;
              const canAfford = balance >= totalCost;

              return (
                <div
                  key={battle.id}
                  className="rounded-3xl bg-zinc-950 border-2 border-zinc-800 hover:border-purple-500/60 p-4.5 flex flex-col justify-between transition-all hover:shadow-xl hover:shadow-purple-500/10 group"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-purple-950 text-purple-300 border border-purple-500/40">
                        {battle.mode === '1v1' ? '1v1 Duel' : battle.mode === '2v2' ? '2v2 Squad' : battle.mode === 'group-ffa' ? 'FFA Versus' : 'Shared Pot Co-op'}
                      </span>
                      <span className="text-xs font-mono font-black text-amber-300">
                        {totalCost.toLocaleString()}c / seat
                      </span>
                    </div>

                    <h4 className="text-sm font-black text-zinc-100 group-hover:text-amber-300 transition-colors line-clamp-1">
                      {battle.title}
                    </h4>

                    {/* Crates sequence preview */}
                    <div className="mt-3 p-2.5 rounded-2xl bg-zinc-900/90 border border-zinc-800">
                      <div className="text-[10px] uppercase font-bold text-zinc-400 mb-1.5 flex items-center justify-between">
                        <span>{battle.crates.length} Crates (Least to Most Cost)</span>
                        <span className="text-purple-400">Sequence →</span>
                      </div>
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                        {battle.crates.map((crate, cIdx) => (
                          <div
                            key={`${crate.id}-${cIdx}`}
                            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-zinc-950 border border-zinc-800 shrink-0 text-xs"
                            title={`${crate.name} (${crate.cost}c)`}
                          >
                            <span>{crate.icon}</span>
                            <span className="text-[10px] font-mono text-zinc-300">{crate.cost}c</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Seats preview */}
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {battle.seats.map((seat, sIdx) => {
                        if (seat) {
                          return (
                            <div
                              key={`seat-${sIdx}`}
                              className="p-2 rounded-xl bg-zinc-900 border border-emerald-500/40 flex items-center gap-2 text-xs"
                            >
                              <span className="text-base">{seat.avatar}</span>
                              <div className="truncate">
                                <div className="font-bold text-zinc-200 truncate">{seat.name}</div>
                                <div className="text-[9px] text-emerald-400 font-mono">Ready</div>
                              </div>
                            </div>
                          );
                        }

                        return (
                          <button
                            key={`seat-${sIdx}`}
                            disabled={!canAfford}
                            onClick={() => handleJoinBattle(battle, sIdx)}
                            className="p-2 rounded-xl bg-zinc-900/60 hover:bg-purple-950/60 border border-dashed border-zinc-700 hover:border-purple-400 flex items-center justify-center gap-1.5 text-xs text-zinc-400 hover:text-purple-300 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <UserPlus className="w-3.5 h-3.5" />
                            <span className="font-bold">Join Seat {sIdx + 1}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                    <span className="text-zinc-500 font-mono">
                      {filledSeatsCount}/{battle.maxPlayers} Players Ready
                    </span>

                    <button
                      onClick={() => {
                        const firstEmpty = battle.seats.findIndex(s => s === null);
                        if (firstEmpty !== -1) {
                          handleJoinBattle(battle, firstEmpty);
                        } else {
                          setActiveBattle(battle);
                          setViewState('battle');
                        }
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1 transition-all"
                    >
                      <span>Enter Arena</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: CREATE CUSTOM BATTLE ARENA                                        */}
      {/* ========================================================================= */}
      {viewState === 'create' && (
        <div className="p-6 rounded-3xl bg-zinc-950 border-2 border-purple-500/40 space-y-6 shadow-2xl">
          <div className="border-b border-zinc-800 pb-4">
            <h3 className="text-base sm:text-lg font-black uppercase text-zinc-100 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              <span>Configure Custom Crate Battle</span>
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              Select battle game mode, choose any assortment of crates (auto-ordered least to most expensive), and launch seats.
            </p>
          </div>

          {/* STEP 1: Select Game Mode */}
          <div className="space-y-2.5">
            <label className="text-xs font-black uppercase tracking-wider text-zinc-300">
              1. Choose Battle Mode
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                {
                  id: '1v1' as BattleMode,
                  title: '1v1 Duel',
                  desc: '2 Players • Winner Takes All loot from both unboxings.',
                  icon: '⚔️',
                  badge: 'Versus',
                },
                {
                  id: '2v2' as BattleMode,
                  title: '2v2 Team Clash',
                  desc: '4 Players (2 teams) • Team with highest total takes all loot!',
                  icon: '🛡️',
                  badge: 'Team Battle',
                },
                {
                  id: 'group-ffa' as BattleMode,
                  title: 'Group FFA (2-4p)',
                  desc: 'Free-for-all • Highest total unbox value takes all items/chips.',
                  icon: '👑',
                  badge: 'Winner Takes All',
                },
                {
                  id: 'group-split' as BattleMode,
                  title: 'Group Co-op Pot',
                  desc: '2-4 Players • All unboxed items pooled & split equally!',
                  icon: '🤝',
                  badge: 'Shared Pot',
                },
              ].map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => {
                    sound.playChip();
                    setCreateMode(mode.id);
                  }}
                  className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                    createMode === mode.id
                      ? 'bg-purple-950/60 border-purple-400 ring-2 ring-purple-400/30'
                      : 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-700 opacity-75 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{mode.icon}</span>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-black/40 text-purple-300 border border-purple-500/30">
                      {mode.badge}
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-zinc-100">{mode.title}</h4>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{mode.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* STEP 2: Player Count for Group Modes */}
          {(createMode === 'group-ffa' || createMode === 'group-split') && (
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-zinc-300">
                2. Total Player Seats
              </label>
              <div className="flex gap-3">
                {[2, 3, 4].map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => {
                      sound.playChip();
                      setCreatePlayerCount(count);
                    }}
                    className={`px-5 py-2.5 rounded-xl border-2 font-bold text-xs transition-all cursor-pointer ${
                      createPlayerCount === count
                        ? 'bg-purple-600 text-white border-purple-400'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                    }`}
                  >
                    {count} Players
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Crates Variety Playlist Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-wider text-zinc-300">
                {createMode === '1v1' || createMode === '2v2' ? '2.' : '3.'} Select Crate Assortment (10 Tiers Available)
              </label>
              <span className="text-xs text-amber-300 font-mono font-bold">
                Entry Cost: {calculateTotalCost(selectedPlaylist).toLocaleString()} Chips / Seat
              </span>
            </div>

            {/* Selected Crate Queue Indicator */}
            <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-between flex-wrap gap-2">
              <div>
                <span className="text-[10px] uppercase font-black text-zinc-400 block mb-1">
                  Active Battle Opening Sequence (Auto-sorted Least → Most Expensive):
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  {getFlatSortedCrates(selectedPlaylist).map((crate, idx) => (
                    <div
                      key={`seq-${crate.id}-${idx}`}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-zinc-950 border border-purple-500/40 text-xs shadow"
                    >
                      <span className="text-[10px] font-bold text-zinc-500 font-mono">#{idx + 1}</span>
                      <span>{crate.icon}</span>
                      <span className="font-black text-zinc-200">{crate.name}</span>
                      <span className="text-[10px] font-mono text-amber-300 font-bold">{crate.cost}c</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs text-zinc-400 block">Total Rounds</span>
                <span className="text-base font-black text-purple-300">
                  {getFlatSortedCrates(selectedPlaylist).length} Crates
                </span>
              </div>
            </div>

            {/* All 10 Crates Selector Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {LOOT_CRATES.map((crate) => {
                const inPlaylist = selectedPlaylist.find(p => p.crate.id === crate.id);
                const count = inPlaylist?.count || 0;

                return (
                  <div
                    key={crate.id}
                    className={`p-3 rounded-2xl border-2 flex flex-col justify-between transition-all ${
                      count > 0
                        ? 'bg-zinc-900 border-amber-400 shadow-md shadow-amber-500/10'
                        : 'bg-zinc-950/80 border-zinc-800'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-2xl">{crate.icon}</span>
                        <span className="text-[10px] font-mono font-black text-amber-300">
                          {crate.cost.toLocaleString()}c
                        </span>
                      </div>
                      <h5 className="text-xs font-black text-zinc-200 line-clamp-1">{crate.name}</h5>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-1 pt-2 border-t border-zinc-800/80">
                      <button
                        type="button"
                        disabled={count <= 0}
                        onClick={() => handleModifyPlaylistItem(crate, -1)}
                        className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center font-bold disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>

                      <span className="text-xs font-black font-mono text-zinc-100">
                        {count}×
                      </span>

                      <button
                        type="button"
                        onClick={() => handleModifyPlaylistItem(crate, 1)}
                        className="w-7 h-7 rounded-lg bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center font-bold cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Launch Buttons */}
          <div className="pt-4 border-t border-zinc-800 flex items-center justify-end gap-3">
            <button
              onClick={() => setViewState('lobby')}
              className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-bold"
            >
              Cancel
            </button>

            <button
              onClick={handleCreateBattle}
              disabled={getFlatSortedCrates(selectedPlaylist).length === 0}
              className="px-7 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-purple-600 to-pink-600 hover:from-amber-400 hover:to-pink-500 text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-xl shadow-purple-600/30 flex items-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all transform hover:scale-105"
            >
              <Zap className="w-4 h-4 text-yellow-300" />
              <span>Create Battle Room ({calculateTotalCost(selectedPlaylist).toLocaleString()} Chips)</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 3: LIVE BATTLE ARENA & SEAT WAITING ROOM                             */}
      {/* ========================================================================= */}
      {viewState === 'battle' && activeBattle && (
        <div className="space-y-6 animate-fade-in">
          {/* Battle Status & Controls Top Bar */}
          <div className="p-4 rounded-3xl bg-zinc-950 border-2 border-zinc-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-900/60 border border-purple-500/40 flex items-center justify-center text-purple-300 font-black text-lg">
                {activeBattle.mode === '1v1' ? '⚔️' : activeBattle.mode === '2v2' ? '🛡️' : activeBattle.mode === 'group-ffa' ? '👑' : '🤝'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-black uppercase text-zinc-100">
                    {activeBattle.title}
                  </h3>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/40">
                    {battlePhase === 'waiting' ? 'Waiting for Players' : battlePhase === 'completed' ? 'Battle Completed' : `Round ${currentRoundIndex + 1} / ${activeBattle.crates.length}`}
                  </span>
                </div>
                <p className="text-xs text-zinc-400">
                  {activeBattle.crates.length} Crates in Sequence • {activeBattle.crates.reduce((s, c) => s + c.cost, 0).toLocaleString()}c Entry
                </p>
              </div>
            </div>

            {/* Top Battle Actions */}
            {battlePhase === 'waiting' && (
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleFillAllWithAI}
                  className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-bold border border-zinc-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Users className="w-3.5 h-3.5 text-purple-400" />
                  <span>🤖 Fill Seats with AI</span>
                </button>

                <button
                  type="button"
                  onClick={handleStartBattle}
                  disabled={!activeBattle.seats.every(Boolean)}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all transform hover:scale-105"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>START BATTLE NOW</span>
                </button>
              </div>
            )}
          </div>

          {/* CRATE SEQUENCE BAR */}
          <div className="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between overflow-x-auto gap-2">
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
                Opening Playlist (Least → Most Expensive):
              </span>
            </div>
            <div className="flex items-center gap-2">
              {activeBattle.crates.map((crate, idx) => {
                const isCurrent = idx === currentRoundIndex && battlePhase !== 'waiting';
                const isPast = idx < currentRoundIndex;

                return (
                  <div
                    key={`crate-pill-${idx}`}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-xl border text-xs shrink-0 transition-all ${
                      isCurrent
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300 ring-2 ring-amber-400/40 scale-105 shadow-lg shadow-amber-500/20'
                        : isPast
                        ? 'bg-zinc-950/60 border-zinc-800 text-zinc-500'
                        : 'bg-zinc-950 border-zinc-700 text-zinc-300'
                    }`}
                  >
                    <span className="text-[10px] font-mono font-bold">R{idx + 1}</span>
                    <span>{crate.icon}</span>
                    <span className="font-bold truncate max-w-[120px]">{crate.name}</span>
                    <span className="font-mono text-[10px] text-amber-300 font-bold">{crate.cost}c</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SEATS AND SPINNING REELS ARENA                                            */}
          {/* ========================================================================= */}
          <div className={`grid gap-4 ${
            activeBattle.maxPlayers === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
          }`}>
            {activeBattle.seats.map((seat, seatIdx) => {
              const reelState = seatReels[seatIdx];
              const isWinner = activeBattle.status === 'completed' && (
                (activeBattle.mode === '1v1' || activeBattle.mode === 'group-ffa') ? activeBattle.winnerSeatIndex === seatIdx :
                (activeBattle.mode === '2v2') ? (seat?.team === activeBattle.winnerTeam) :
                true
              );

              // Empty Seat Card
              if (!seat) {
                return (
                  <div
                    key={`empty-seat-${seatIdx}`}
                    onClick={() => handleAddAIBot(seatIdx)}
                    className="p-6 rounded-3xl bg-zinc-950/60 border-2 border-dashed border-zinc-800 hover:border-purple-500/60 flex flex-col items-center justify-center text-center gap-3 min-h-[280px] cursor-pointer group transition-all"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-zinc-900 group-hover:bg-purple-950 flex items-center justify-center text-zinc-500 group-hover:text-purple-300 transition-colors">
                      <UserPlus className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-zinc-300 group-hover:text-purple-300">
                        Seat {seatIdx + 1} Open
                      </h4>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        Click to slot an AI competitor
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddAIBot(seatIdx);
                      }}
                      className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1 shadow transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add AI Bot</span>
                    </button>
                  </div>
                );
              }

              // Occupied Seat Card & Live Reel Container
              return (
                <div
                  key={`occupied-seat-${seatIdx}`}
                  className={`relative overflow-hidden rounded-3xl border-2 p-4 flex flex-col justify-between transition-all ${
                    isWinner
                      ? 'bg-gradient-to-b from-amber-950/40 via-zinc-900 to-zinc-950 border-amber-400 shadow-2xl shadow-amber-500/20 ring-2 ring-amber-400/50'
                      : seat.isUser
                      ? 'bg-zinc-950 border-purple-500/60 shadow-xl'
                      : 'bg-zinc-950 border-zinc-800'
                  }`}
                >
                  {/* Seat Header Bar */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl p-1 rounded-xl bg-zinc-900 border border-zinc-800 shadow">
                        {seat.avatar}
                      </span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-black text-zinc-100">
                            {seat.name}
                          </span>
                          {seat.isUser && (
                            <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-purple-600 text-white">
                              YOU
                            </span>
                          )}
                          {isWinner && (
                            <Crown className="w-4 h-4 text-yellow-400 fill-current animate-bounce" />
                          )}
                        </div>
                        {activeBattle.mode === '2v2' && (
                          <span className={`text-[10px] font-black uppercase px-2 py-0.2 rounded ${
                            seat.team === 1 ? 'bg-blue-950 text-blue-300 border border-blue-500/40' : 'bg-rose-950 text-rose-300 border border-rose-500/40'
                          }`}>
                            Team {seat.team}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-zinc-400 block">Loot Total</span>
                      <span className="text-sm font-black font-mono text-amber-300">
                        {seat.currentTotalValue.toLocaleString()}c
                      </span>
                    </div>
                  </div>

                  {/* ACTIVE SPINNING REEL FOR THIS SEAT */}
                  <div className="my-2 relative w-full h-36 rounded-2xl bg-zinc-950 border border-zinc-800 overflow-hidden shadow-inner flex items-center">
                    {/* Needle Indicator */}
                    <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-yellow-400 z-30 shadow-[0_0_10px_rgba(234,179,8,1)] pointer-events-none">
                      <ArrowDown className="w-3.5 h-3.5 text-yellow-400 fill-current -top-1 -left-1.5 absolute animate-bounce" />
                    </div>

                    {battlePhase === 'waiting' ? (
                      <div className="w-full flex flex-col items-center justify-center text-center p-3">
                        <span className="text-3xl mb-1">{activeBattle.crates[0]?.icon}</span>
                        <span className="text-xs text-zinc-400 font-bold">Waiting for launch...</span>
                        <span className="text-[10px] text-zinc-500">Ready to unbox</span>
                      </div>
                    ) : (
                      <div
                        className="flex items-center gap-2 will-change-transform px-4"
                        style={{
                          transform: `translateX(${reelState?.translateX || 0}px)`,
                          transition: battlePhase === 'spinning' ? 'transform 5.2s cubic-bezier(0.12, 0.98, 0.22, 1)' : 'none',
                        }}
                      >
                        {reelState?.items.map((item, idx) => {
                          const rarity = RARITY_CONFIG[item.rarity];
                          return (
                            <div
                              key={`${item.id}-${idx}`}
                              style={{ width: '130px' }}
                              className={`flex-shrink-0 h-30 rounded-xl border p-2 flex flex-col justify-between items-center text-center bg-gradient-to-b ${rarity.bg} ${rarity.border}`}
                            >
                              <span className={`text-[8px] font-black uppercase ${rarity.text}`}>
                                {rarity.label}
                              </span>
                              <span className="text-2xl">{item.icon}</span>
                              <div className="w-full">
                                <div className="text-[10px] font-black text-zinc-100 truncate">{item.name}</div>
                                <div className="text-[9px] font-mono text-amber-300 font-bold">{item.value}c</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Seat Bottom Items Drops List */}
                  <div className="mt-2 pt-2 border-t border-zinc-800/80">
                    <div className="text-[10px] font-bold text-zinc-400 mb-1 flex items-center justify-between">
                      <span>Unboxed Items ({seat.unboxedItems.length})</span>
                      {seat.isAI && battlePhase === 'waiting' && (
                        <button
                          type="button"
                          onClick={() => handleRemoveSeat(seatIdx)}
                          className="text-[10px] text-rose-400 hover:text-rose-300 font-bold"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-h-12">
                      {seat.unboxedItems.length > 0 ? (
                        seat.unboxedItems.map((item, iIdx) => (
                          <div
                            key={`won-${item.id}-${iIdx}`}
                            className="px-2 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-[10px] flex items-center gap-1 shrink-0"
                            title={`${item.name} (${item.value}c)`}
                          >
                            <span>{item.icon}</span>
                            <span className="font-mono text-amber-300 font-bold">{item.value}c</span>
                          </div>
                        ))
                      ) : (
                        <span className="text-[10px] text-zinc-600 italic">No items yet</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ========================================================================= */}
          {/* BATTLE COMPLETED FINAL REWARDS MODAL / BANNER                             */}
          {/* ========================================================================= */}
          {battlePhase === 'completed' && (
            <div className="p-6 sm:p-8 rounded-3xl bg-zinc-950 border-2 border-amber-400 shadow-2xl text-center space-y-5 animate-fade-in relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-amber-500/10 via-purple-500/10 to-transparent pointer-events-none" />

              <div className="relative z-10">
                <span className="text-xs font-black uppercase tracking-widest text-amber-400">
                  CRATE BATTLE ARENA RESOLUTION
                </span>

                {/* Victory Title */}
                <h2 className="text-2xl sm:text-3xl font-black uppercase text-zinc-100 mt-2 flex items-center justify-center gap-2">
                  <Crown className="w-8 h-8 text-yellow-400 fill-current animate-bounce" />
                  <span>
                    {activeBattle.mode === '1v1' || activeBattle.mode === 'group-ffa' ? (
                      `${activeBattle.seats[activeBattle.winnerSeatIndex || 0]?.name} WINS THE ENTIRE POT!`
                    ) : activeBattle.mode === '2v2' ? (
                      `TEAM ${activeBattle.winnerTeam} WINS THE SQUAD DUEL!`
                    ) : (
                      'SHARED CO-OP POT SPLIT EQUALLY!'
                    )}
                  </span>
                </h2>

                <p className="text-xs sm:text-sm text-zinc-300 mt-1 max-w-lg mx-auto">
                  {activeBattle.mode === 'group-split'
                    ? `Total grand loot pot of ${totalBattleLoot.toLocaleString()} chips divided evenly among all ${activeBattle.seats.filter(Boolean).length} participants.`
                    : 'The winner takes all unboxed artifacts and chips from all competitors in this arena.'}
                </p>

                {/* Grand Stats Bar */}
                <div className="mt-6 max-w-xl mx-auto p-4 rounded-2xl bg-black/60 border border-amber-500/40 grid grid-cols-2 sm:grid-cols-3 gap-3 text-center">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-zinc-400">Total Pot Value</div>
                    <div className="text-lg sm:text-xl font-black text-amber-300 font-mono">
                      {totalLootPool(activeBattle).toLocaleString()}c
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-zinc-400">Rounds Played</div>
                    <div className="text-lg sm:text-xl font-black text-purple-300">
                      {activeBattle.crates.length} Crates
                    </div>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <div className="text-[10px] uppercase font-bold text-zinc-400">Your Share</div>
                    <div className="text-lg sm:text-xl font-black text-emerald-400 font-mono">
                      {calculateUserPayout(activeBattle, userSeatIdx).toLocaleString()}c
                    </div>
                  </div>
                </div>

                {/* Action Buttons for User */}
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <button
                    disabled={claimedStatus !== null || calculateUserPayout(activeBattle, userSeatIdx) <= 0}
                    onClick={handleCashOutBattleWinnings}
                    className={`py-3 px-6 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all ${
                      claimedStatus === 'cashed'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 text-zinc-950 cursor-pointer'
                    }`}
                  >
                    <Coins className="w-4 h-4" />
                    <span>
                      {claimedStatus === 'cashed' ? '✓ Chips Added!' : `Claim Cash (+${calculateUserPayout(activeBattle, userSeatIdx).toLocaleString()} Chips)`}
                    </span>
                  </button>

                  <button
                    disabled={claimedStatus !== null || calculateUserPayout(activeBattle, userSeatIdx) <= 0}
                    onClick={handleVaultBattleWinnings}
                    className={`py-3 px-6 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all ${
                      claimedStatus === 'vaulted'
                        ? 'bg-purple-600 text-white'
                        : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700 cursor-pointer'
                    }`}
                  >
                    <Trophy className="w-4 h-4 text-amber-400" />
                    <span>
                      {claimedStatus === 'vaulted' ? '✓ Items Vaulted!' : 'Send Items to Trophy Vault'}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      sound.playChip();
                      // Rematch with same configuration
                      const initialSeats: (BattleSeat | null)[] = activeBattle.seats.map((s, idx) => {
                        if (!s) return null;
                        return {
                          ...s,
                          currentTotalValue: 0,
                          unboxedItems: [],
                        };
                      });
                      setActiveBattle({
                        ...activeBattle,
                        seats: initialSeats,
                        status: 'waiting',
                        currentRound: 0,
                      });
                      setBattlePhase('waiting');
                      setCurrentRoundIndex(0);
                      setClaimedStatus(null);
                    }}
                    className="py-3 px-5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs sm:text-sm font-bold border border-zinc-700 flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4 text-purple-400" />
                    <span>Rematch</span>
                  </button>

                  <button
                    onClick={() => {
                      sound.playChip();
                      setViewState('lobby');
                      setActiveBattle(null);
                      setBattlePhase('waiting');
                    }}
                    className="py-3 px-5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs sm:text-sm font-bold border border-zinc-800"
                  >
                    Exit to Lobby
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Helper calculations for battle payout
function totalLootPool(battle: CrateBattle): number {
  return battle.seats.reduce((sum, s) => sum + (s?.currentTotalValue || 0), 0);
}

function calculateUserPayout(battle: CrateBattle, userIdx: number): number {
  if (userIdx === -1) return 0;
  const userSeat = battle.seats[userIdx];
  if (!userSeat) return 0;

  if (battle.mode === '1v1' || battle.mode === 'group-ffa') {
    if (battle.winnerSeatIndex === userIdx) {
      return totalLootPool(battle);
    }
    return 0;
  } else if (battle.mode === '2v2') {
    if (userSeat.team === battle.winnerTeam) {
      return Math.round(totalLootPool(battle) / 2);
    }
    return 0;
  } else if (battle.mode === 'group-split') {
    return battle.sharedPotPerPlayer || Math.round(totalLootPool(battle) / battle.seats.filter(Boolean).length);
  }
  return 0;
}
