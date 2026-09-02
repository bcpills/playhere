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
  Package,
  Eye
} from 'lucide-react';
import { 
  LootCrate, 
  LootItem, 
  BattleMode, 
  BattleSeat, 
  CrateBattle, 
  UserAccount, 
  CasinoStats,
  CurrencyMode 
} from '../types';
import { 
  LOOT_CRATES, 
  RARITY_CONFIG, 
  pickRandomLootItem, 
  generateReelItems, 
  AI_BATTLE_BOTS, 
  getRandomAIBot, 
  sortCratesByCost,
  formatDropOdds,
  getCrateCost,
  getItemValue
} from '../utils/crates';
import { sound } from '../utils/audio';

interface CrateBattleArenaProps {
  balance: number;
  userAccount: UserAccount;
  onUpdateBalance: (delta: number) => void;
  onUpdateStats: (updater: (prev: CasinoStats) => CasinoStats) => void;
  currencyMode?: CurrencyMode;
  cashBalance?: number;
  onUpdateCashBalance?: (amount: number | ((prev: number) => number)) => void;
  onRecordWager?: (amount: number, isCash: boolean) => void;
  onAddRakeback?: (wager: number, isBlackjack?: boolean, isCash?: boolean) => void;
  onToggleCurrencyMode?: (mode: CurrencyMode) => void;
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
  onUpdateStats,
  currencyMode = 'gc',
  cashBalance = 0,
  onUpdateCashBalance,
  onRecordWager,
  onAddRakeback,
  onToggleCurrencyMode,
}) => {
  const isCash = currencyMode === 'cash';
  const effectiveBalance = isCash ? cashBalance : balance;

  const modifyBalance = (delta: number) => {
    if (isCash && onUpdateCashBalance) {
      onUpdateCashBalance(prev => Number((prev + delta).toFixed(2)));
    } else {
      onUpdateBalance(delta);
    }
  };
  // Current view inside Battles Arena
  const [viewState, setViewState] = useState<'lobby' | 'create' | 'battle'>('lobby');
  
  // Creation state
  const [createMode, setCreateMode] = useState<BattleMode>('1v1');
  const [createPlayerCount, setCreatePlayerCount] = useState<number>(2); // 2, 3, 4
  const [selectedPlaylist, setSelectedPlaylist] = useState<{ crate: LootCrate; count: number }[]>([]);
  
  // Active / Selected Battle
  const [activeBattle, setActiveBattle] = useState<CrateBattle | null>(null);
  
  // Round Execution State
  const [battlePhase, setBattlePhase] = useState<'waiting' | 'spinning' | 'round-summary' | 'completed'>('waiting');
  const [currentRoundIndex, setCurrentRoundIndex] = useState<number>(0);
  const [seatReels, setSeatReels] = useState<Record<number, ActiveReelState>>({});
  const [roundWinningItems, setRoundWinningItems] = useState<Record<number, LootItem>>({});
  const [isReelSpinning, setIsReelSpinning] = useState<boolean>(false);
  const [spinNonce, setSpinNonce] = useState<number>(0);
  
  const tickAudioRef = useRef<number | null>(null);
  const roundAnimTimerRef = useRef<number | null>(null);
  const roundFinishTimerRef = useRef<number | null>(null);
  const nextRoundTimerRef = useRef<number | null>(null);
  const reelContainerRefs = useRef<Record<number, HTMLDivElement | null>>({});

  // User-created and Live Matches in Lobby
  const [availableBattles, setAvailableBattles] = useState<CrateBattle[]>([
    {
      id: 'lobby-live-1v1',
      title: '💎 1v1 High Roller Duel (600c)',
      mode: '1v1',
      maxPlayers: 2,
      crates: [LOOT_CRATES[1], LOOT_CRATES[4], LOOT_CRATES[6]],
      seats: [
        {
          id: 'bot-hr-1',
          name: 'Vegas VIP',
          avatar: '🎰',
          isAI: true,
          isUser: false,
          ready: true,
          currentTotalValue: 0,
          unboxedItems: [],
        },
        {
          id: 'bot-hr-2',
          name: 'Diamond Hands',
          avatar: '💎',
          isAI: true,
          isUser: false,
          ready: true,
          currentTotalValue: 0,
          unboxedItems: [],
        },
      ],
      status: 'in-progress',
      currentRound: 0,
      createdAt: Date.now() - 15000,
      createdBy: 'Vegas VIP',
    },
    {
      id: 'lobby-live-2v2',
      title: '🛡️ 2v2 Neo-Tokyo Squad Clash (800c)',
      mode: '2v2',
      maxPlayers: 4,
      crates: [LOOT_CRATES[2], LOOT_CRATES[3], LOOT_CRATES[5]],
      seats: [
        {
          id: 'bot-cyber-1',
          name: 'Neon Ronin',
          avatar: '⚡',
          isAI: true,
          isUser: false,
          team: 1,
          ready: true,
          currentTotalValue: 0,
          unboxedItems: [],
        },
        {
          id: 'bot-cyber-2',
          name: 'Matrix Ghost',
          avatar: '👾',
          isAI: true,
          isUser: false,
          team: 1,
          ready: true,
          currentTotalValue: 0,
          unboxedItems: [],
        },
        {
          id: 'bot-cyber-3',
          name: 'Viper Strike',
          avatar: '🐍',
          isAI: true,
          isUser: false,
          team: 2,
          ready: true,
          currentTotalValue: 0,
          unboxedItems: [],
        },
        {
          id: 'bot-cyber-4',
          name: 'Shadow Samurai',
          avatar: '🥷',
          isAI: true,
          isUser: false,
          team: 2,
          ready: true,
          currentTotalValue: 0,
          unboxedItems: [],
        },
      ],
      status: 'in-progress',
      currentRound: 0,
      createdAt: Date.now() - 25000,
      createdBy: 'Neon Ronin',
    },
    {
      id: 'lobby-2v2-demo',
      title: '🛡️ 2v2 High Stakes Squad Showdown (450c)',
      mode: '2v2',
      maxPlayers: 4,
      crates: [LOOT_CRATES[1], LOOT_CRATES[2], LOOT_CRATES[4]],
      seats: [
        {
          id: 'bot-alpha-1',
          name: 'Viper Strike',
          avatar: '🐍',
          isAI: true,
          isUser: false,
          team: 1,
          ready: true,
          currentTotalValue: 0,
          unboxedItems: [],
        },
        null,
        {
          id: 'bot-beta-1',
          name: 'Crimson Ghost',
          avatar: '👻',
          isAI: true,
          isUser: false,
          team: 2,
          ready: true,
          currentTotalValue: 0,
          unboxedItems: [],
        },
        {
          id: 'bot-beta-2',
          name: 'Shadow Samurai',
          avatar: '🥷',
          isAI: true,
          isUser: false,
          team: 2,
          ready: true,
          currentTotalValue: 0,
          unboxedItems: [],
        },
      ],
      status: 'waiting',
      currentRound: 0,
      createdAt: Date.now() - 60000,
      createdBy: 'Lobby Matchmaker',
    },
    {
      id: 'lobby-1v1-gems',
      title: '💎 1v1 Mythic Gems Duel (700c)',
      mode: '1v1',
      maxPlayers: 2,
      crates: [LOOT_CRATES[6], LOOT_CRATES[6]],
      seats: [
        {
          id: 'bot-gem-1',
          name: 'Diamond Hands',
          avatar: '💎',
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
      createdBy: 'Diamond Hands',
    },
    {
      id: 'lobby-ffa-4p',
      title: '👑 4-Player Degenerate FFA (300c)',
      mode: 'group-ffa',
      maxPlayers: 4,
      crates: [LOOT_CRATES[0], LOOT_CRATES[1], LOOT_CRATES[3]],
      seats: [
        {
          id: 'bot-ffa-1',
          name: 'Lucky Strike',
          avatar: '🍀',
          isAI: true,
          isUser: false,
          ready: true,
          currentTotalValue: 0,
          unboxedItems: [],
        },
        {
          id: 'bot-ffa-2',
          name: 'Card Sharp',
          avatar: '🃏',
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
      createdAt: Date.now() - 40000,
      createdBy: 'Lucky Strike',
    },
  ]);

  // Auto Start Countdown State
  const [autoStartCountdown, setAutoStartCountdown] = useState<number | null>(null);
  const autoStartTimerRef = useRef<number | null>(null);

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
    const sum = playlist.reduce((s, item) => s + (getCrateCost(item.crate, currencyMode) * item.count), 0);
    return isCash ? Number(sum.toFixed(2)) : sum;
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
    if (effectiveBalance < totalCost) {
      alert(`Insufficient balance! Battle entry requires ${isCash ? `$${totalCost.toFixed(2)}` : `${totalCost.toLocaleString()} chips`}.`);
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
    const costStr = isCash ? `$${totalCost.toFixed(2)}` : `${totalCost.toLocaleString()}c`;
    if (createMode === '1v1') title = `⚔️ 1v1 Duel (${costStr})`;
    else if (createMode === '2v2') title = `🛡️ 2v2 Squad Clash (${costStr})`;
    else if (createMode === 'group-ffa') title = `👑 ${seatsCount}-Player FFA Versus (${costStr})`;
    else title = `🤝 ${seatsCount}-Player Shared Pot Co-op (${costStr})`;

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
    sound.playChip();
  };

  // Join an existing battle from the lobby
  const handleJoinBattle = (battle: CrateBattle, seatIndex: number) => {
    const totalCost = isCash
      ? Number(battle.crates.reduce((sum, c) => sum + getCrateCost(c, currencyMode), 0).toFixed(2))
      : battle.crates.reduce((sum, c) => sum + getCrateCost(c, currencyMode), 0);
    if (effectiveBalance < totalCost) {
      alert(`Insufficient balance! Battle entry requires ${isCash ? `$${totalCost.toFixed(2)}` : `${totalCost.toLocaleString()} chips`}.`);
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
    sound.playChip();
  };

  // Spectate an existing battle without joining a seat
  const handleSpectateBattle = (battle: CrateBattle) => {
    sound.playChip();
    setActiveBattle(battle);
    setViewState('battle');
    if (battle.status === 'in-progress') {
      setBattlePhase('spinning');
      const startRound = battle.currentRound || 0;
      setCurrentRoundIndex(startRound);
      setTimeout(() => {
        executeRound(startRound, battle);
      }, 350);
    } else if (battle.status === 'completed') {
      setBattlePhase('completed');
    } else {
      setBattlePhase('waiting');
      setCurrentRoundIndex(0);
    }
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

  // Remove player/bot from a seat (or substitute with bot if during play)
  const handleRemoveSeat = (seatIndex: number) => {
    if (!activeBattle) return;
    sound.playChip();

    const isRunning = battlePhase === 'spinning' || battlePhase === 'round-summary';
    if (isRunning) {
      // If a player leaves the game during play, keep it going!
      // Substitute with an AI bot so the ongoing match continues smoothly.
      const existingNames = activeBattle.seats.filter(Boolean).map(s => s!.name);
      const bot = getRandomAIBot(existingNames);
      const updatedSeats = [...activeBattle.seats];
      const prevSeat = updatedSeats[seatIndex];
      updatedSeats[seatIndex] = {
        id: `bot-sub-${Date.now()}-${seatIndex}`,
        name: `${bot.name} (Sub)`,
        avatar: bot.avatar,
        isAI: true,
        isUser: false,
        team: prevSeat?.team,
        ready: true,
        currentTotalValue: prevSeat?.currentTotalValue || 0,
        unboxedItems: prevSeat?.unboxedItems || [],
      };

      const updatedBattle = {
        ...activeBattle,
        seats: updatedSeats,
      };
      setActiveBattle(updatedBattle);
      setAvailableBattles(prev => prev.map(b => b.id === updatedBattle.id ? updatedBattle : b));
      return;
    }

    const updatedSeats = [...activeBattle.seats];
    updatedSeats[seatIndex] = null;

    setActiveBattle({
      ...activeBattle,
      seats: updatedSeats,
    });
    setAutoStartCountdown(null);
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

    const isUserParticipating = activeBattle.seats.some(s => s?.isUser);
    const totalCost = isCash
      ? Number(activeBattle.crates.reduce((sum, c) => sum + getCrateCost(c, currencyMode), 0).toFixed(2))
      : activeBattle.crates.reduce((sum, c) => sum + getCrateCost(c, currencyMode), 0);

    // If user is participating in a seat, deduct balance & log stats
    if (isUserParticipating) {
      if (effectiveBalance < totalCost) {
        alert(`Insufficient balance! Battle entry requires ${isCash ? `$${totalCost.toFixed(2)}` : `${totalCost.toLocaleString()} chips`}.`);
        setAutoStartCountdown(null);
        return;
      }
      modifyBalance(-totalCost);
      onRecordWager?.(totalCost, isCash);
      onAddRakeback?.(totalCost, false, isCash);
      onUpdateStats(prev => ({
        ...prev,
        totalWagered: isCash ? prev.totalWagered + (totalCost * 1000) : prev.totalWagered + totalCost,
        cratesOpened: prev.cratesOpened + activeBattle.crates.length,
      }));
    }

    setAutoStartCountdown(null);
    sound.playChip();
    setCurrentRoundIndex(0);
    setBattlePhase('spinning');
    executeRound(0, activeBattle);
  };

  // Auto Start countdown trigger when all seats are full
  useEffect(() => {
    if (activeBattle && battlePhase === 'waiting') {
      const allFilled = activeBattle.seats.length > 0 && activeBattle.seats.every(s => s !== null);
      if (allFilled) {
        if (autoStartCountdown === null) {
          setAutoStartCountdown(3);
        }
      } else {
        if (autoStartCountdown !== null) {
          setAutoStartCountdown(null);
        }
      }
    } else {
      if (autoStartCountdown !== null) {
        setAutoStartCountdown(null);
      }
    }
  }, [activeBattle?.seats, battlePhase]);

  // Tick countdown timer
  useEffect(() => {
    if (autoStartCountdown === null) {
      if (autoStartTimerRef.current) clearTimeout(autoStartTimerRef.current);
      return;
    }

    if (autoStartCountdown > 0) {
      autoStartTimerRef.current = window.setTimeout(() => {
        setAutoStartCountdown(prev => (prev !== null && prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else if (autoStartCountdown === 0) {
      handleStartBattle();
      setAutoStartCountdown(null);
    }

    return () => {
      if (autoStartTimerRef.current) clearTimeout(autoStartTimerRef.current);
    };
  }, [autoStartCountdown]);

  // Execute a single round of crate opening for all seats
  const executeRound = (roundIdx: number, battle: CrateBattle) => {
    const currentCrate = battle.crates[roundIdx];
    if (!currentCrate) return;

    if (tickAudioRef.current) clearTimeout(tickAudioRef.current);
    if (roundAnimTimerRef.current) clearTimeout(roundAnimTimerRef.current);
    if (roundFinishTimerRef.current) clearTimeout(roundFinishTimerRef.current);
    if (nextRoundTimerRef.current) clearTimeout(nextRoundTimerRef.current);

    // Reset spinning state immediately so DOM resets to index 0
    setIsReelSpinning(false);
    setCurrentRoundIndex(roundIdx);
    setSpinNonce(prev => prev + 1);
    setBattlePhase('spinning');

    const WIN_INDEX = 38;
    const TOTAL_ITEMS = 55;
    const ITEM_WIDTH = 100;
    const ITEM_GAP = 8;

    const roundWins: Record<number, LootItem> = {};
    const newReelStates: Record<number, ActiveReelState> = {};

    battle.seats.forEach((seat, seatIdx) => {
      if (!seat) return;
      const winItem = pickRandomLootItem(currentCrate);
      roundWins[seatIdx] = winItem;

      const reelItems = generateReelItems(currentCrate, winItem, TOTAL_ITEMS, WIN_INDEX);
      const randomOffset = (Math.random() - 0.5) * 16;
      
      const containerWidth = reelContainerRefs.current[seatIdx]?.offsetWidth || 300;
      const viewportCenter = containerWidth / 2;
      const itemCenterFromLeft = 8 + WIN_INDEX * (ITEM_WIDTH + ITEM_GAP) + (ITEM_WIDTH / 2);
      const targetTranslateX = -(itemCenterFromLeft - viewportCenter + randomOffset);

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
    const playTicks = () => {
      let tickCount = 0;
      const tickIntervals = [35, 45, 60, 80, 110, 150, 220, 320, 450];
      let intervalIndex = 0;

      const tick = () => {
        sound.playCrateTick(Math.random() * 150);
        tickCount++;
        if (tickCount < 30) {
          if (tickCount % 4 === 0 && intervalIndex < tickIntervals.length - 1) {
            intervalIndex++;
          }
          tickAudioRef.current = window.setTimeout(tick, tickIntervals[intervalIndex]);
        }
      };
      tick();
    };

    // Trigger high-speed deceleration animation on next tick
    roundAnimTimerRef.current = window.setTimeout(() => {
      setIsReelSpinning(true);
      playTicks();
    }, 60);

    // End of spin deceleration (~5.4 seconds)
    roundFinishTimerRef.current = window.setTimeout(() => {
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
        const itemVal = getItemValue(win, currencyMode);
        return {
          ...seat,
          currentTotalValue: isCash ? Number((seat.currentTotalValue + itemVal).toFixed(2)) : (seat.currentTotalValue + itemVal),
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
        nextRoundTimerRef.current = window.setTimeout(() => {
          executeRound(roundIdx + 1, updatedBattle);
        }, 3000);
      } else {
        // Battle Completed! Final resolution
        nextRoundTimerRef.current = window.setTimeout(() => {
          resolveFinalBattle(updatedBattle);
        }, 2200);
      }
    }, 5400);
  };

  // Resolve final battle winners and rewards
  const resolveFinalBattle = (battle: CrateBattle) => {
    setBattlePhase('completed');

    const totalLoot = totalLootPool(battle, isCash);

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
      const validSeatsCount = battle.seats.filter(Boolean).length || 1;
      sharedPotPerPlayer = isCash
        ? Number((totalLoot / validSeatsCount).toFixed(2))
        : Math.round(totalLoot / validSeatsCount);
    }

    const completedBattle: CrateBattle = {
      ...battle,
      status: 'completed',
      winnerSeatIndex: winnerSeatIdx,
      winnerTeam,
      sharedPotPerPlayer,
    };

    setActiveBattle(completedBattle);

    // Check if user won and auto-collect chips immediately
    const userSeatIndex = battle.seats.findIndex(s => s?.isUser);
    const winnings = calculateUserPayout(completedBattle, userSeatIndex, isCash);

    if (winnings > 0) {
      modifyBalance(winnings);
      onUpdateStats(prev => ({
        ...prev,
        totalWon: isCash ? prev.totalWon + (winnings * 1000) : prev.totalWon + winnings,
        biggestWin: isCash ? Math.max(prev.biggestWin, winnings * 1000) : Math.max(prev.biggestWin, winnings),
      }));
      confetti({ particleCount: 150, spread: 100, origin: { y: 0.5 } });
      sound.playProfit();
    } else {
      sound.playWin(false);
    }
  };

  useEffect(() => {
    return () => {
      if (tickAudioRef.current) clearTimeout(tickAudioRef.current);
      if (roundAnimTimerRef.current) clearTimeout(roundAnimTimerRef.current);
      if (roundFinishTimerRef.current) clearTimeout(roundFinishTimerRef.current);
      if (nextRoundTimerRef.current) clearTimeout(nextRoundTimerRef.current);
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
                // If battle is not in progress, safely reset; if it is active, keep it running
                if (battlePhase === 'waiting' || battlePhase === 'completed') {
                  setActiveBattle(null);
                  setBattlePhase('waiting');
                }
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
              <span>User-Created Battles ({availableBattles.length})</span>
            </h3>
            <span className="text-xs text-zinc-500 font-mono">
              Only user-hosted arenas active
            </span>
          </div>

          {availableBattles.length === 0 ? (
            <div className="p-8 sm:p-12 rounded-3xl bg-zinc-950/80 border-2 border-dashed border-zinc-800 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-purple-950/60 border border-purple-500/30 flex items-center justify-center text-3xl mx-auto shadow-lg shadow-purple-500/10">
                ⚔️
              </div>
              <div className="max-w-md mx-auto space-y-1.5">
                <h4 className="text-base font-black uppercase text-zinc-100">
                  No Active User Battles Right Now
                </h4>
                <p className="text-xs text-zinc-400">
                  Create your own custom arena! Configure your crate playlist (ordered least to most expensive), select 1v1, 2v2, or Group mode, and add AI or friends to any seat.
                </p>
              </div>
              <button
                onClick={() => {
                  sound.playChip();
                  setViewState('create');
                }}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-purple-600/30 inline-flex items-center gap-2 transition-all transform hover:scale-105 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 text-yellow-300" />
                <span>Create Battle Arena Now</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableBattles.map((battle) => {
                const totalCost = isCash
                  ? Number(battle.crates.reduce((sum, c) => sum + getCrateCost(c, currencyMode), 0).toFixed(2))
                  : battle.crates.reduce((sum, c) => sum + getCrateCost(c, currencyMode), 0);
                const filledSeatsCount = battle.seats.filter(Boolean).length;
                const canAfford = effectiveBalance >= totalCost;

                return (
                  <div
                    key={battle.id}
                    className="rounded-3xl bg-zinc-950 border-2 border-zinc-800 hover:border-purple-500/60 p-4.5 flex flex-col justify-between transition-all hover:shadow-xl hover:shadow-purple-500/10 group"
                  >
                    <div>
                      {/* Header */}
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-purple-950 text-purple-300 border border-purple-500/40">
                            {battle.mode === '1v1' ? '1v1 Duel' : battle.mode === '2v2' ? '2v2 Squad' : battle.mode === 'group-ffa' ? 'FFA Versus' : 'Shared Pot Co-op'}
                          </span>
                          {battle.status === 'in-progress' && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center gap-1 animate-pulse">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                              LIVE
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-mono font-black text-amber-300">
                          {isCash ? `$${totalCost.toFixed(2)}` : `${totalCost.toLocaleString()}c`} / seat
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
                          {battle.crates.map((crate, cIdx) => {
                            const crateCost = getCrateCost(crate, currencyMode);
                            return (
                              <div
                                key={`${crate.id}-${cIdx}`}
                                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-zinc-950 border border-zinc-800 shrink-0 text-xs"
                                title={`${crate.name} (${isCash ? `$${crateCost.toFixed(2)}` : `${crateCost}c`})`}
                              >
                                <span>{crate.icon}</span>
                                <span className="text-[10px] font-mono text-zinc-300">
                                  {isCash ? `$${crateCost.toFixed(2)}` : `${crateCost}c`}
                                </span>
                              </div>
                            );
                          })}
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

                    <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs gap-2">
                      <span className="text-zinc-500 font-mono">
                        {battle.status === 'in-progress' 
                          ? 'In Progress (Live)'
                          : `${filledSeatsCount}/${battle.maxPlayers} Players Ready`}
                      </span>

                      <div className="flex items-center gap-2">
                        {/* Spectate Button */}
                        {battle.status === 'in-progress' ? (
                          <button
                            type="button"
                            onClick={() => handleSpectateBattle(battle)}
                            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white font-black text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer animate-pulse"
                          >
                            <Eye className="w-3.5 h-3.5 text-yellow-300" />
                            <span>Watch Live</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => handleSpectateBattle(battle)}
                              className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white font-bold text-xs flex items-center gap-1 border border-zinc-700 transition-all cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5 text-indigo-400" />
                              <span>Watch</span>
                            </button>

                            {/* Join / Enter Arena Button */}
                            {filledSeatsCount < battle.maxPlayers ? (
                              <button
                                type="button"
                                disabled={!canAfford}
                                onClick={() => {
                                  const firstEmpty = battle.seats.findIndex(s => s === null);
                                  if (firstEmpty !== -1) {
                                    handleJoinBattle(battle, firstEmpty);
                                  }
                                }}
                                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs flex items-center gap-1 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-md"
                              >
                                <span>Join Match</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleSpectateBattle(battle)}
                                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 transition-all cursor-pointer shadow-md"
                              >
                                <span>Live Arena</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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
                Entry Cost: {isCash ? `$${calculateTotalCost(selectedPlaylist).toFixed(2)}` : `${calculateTotalCost(selectedPlaylist).toLocaleString()} Chips`} / Seat
              </span>
            </div>

            {/* Selected Crate Queue Indicator */}
            <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-between flex-wrap gap-2">
              <div className="flex-1">
                <span className="text-[10px] uppercase font-black text-zinc-400 block mb-1">
                  Active Battle Opening Sequence (Auto-sorted Least → Most Expensive):
                </span>
                {getFlatSortedCrates(selectedPlaylist).length > 0 ? (
                  <div className="flex items-center gap-2 flex-wrap">
                    {getFlatSortedCrates(selectedPlaylist).map((crate, idx) => {
                      const cost = getCrateCost(crate, currencyMode);
                      return (
                        <div
                          key={`seq-${crate.id}-${idx}`}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-zinc-950 border border-purple-500/40 text-xs shadow"
                        >
                          <span className="text-[10px] font-bold text-zinc-500 font-mono">#{idx + 1}</span>
                          <span>{crate.icon}</span>
                          <span className="font-black text-zinc-200">{crate.name}</span>
                          <span className="text-[10px] font-mono text-amber-300 font-bold">
                            {isCash ? `$${cost.toFixed(2)}` : `${cost}c`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-500 italic">
                    No crates selected yet. Click the (+) button on any crate below to build your battle rounds.
                  </p>
                )}
              </div>

              <div className="text-right shrink-0">
                <span className="text-xs text-zinc-400 block">Total Rounds</span>
                <span className="text-base font-black text-purple-300">
                  {getFlatSortedCrates(selectedPlaylist).length} Crates
                </span>
              </div>
            </div>

            {/* All 10+ Crates Selector Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
              {LOOT_CRATES.map((crate) => {
                const inPlaylist = selectedPlaylist.find(p => p.crate.id === crate.id);
                const count = inPlaylist?.count || 0;
                const cost = getCrateCost(crate, currencyMode);

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
                          {isCash ? `$${cost.toFixed(2)}` : `${cost.toLocaleString()}c`}
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
              <span>Create Battle Room ({isCash ? `$${calculateTotalCost(selectedPlaylist).toFixed(2)}` : `${calculateTotalCost(selectedPlaylist).toLocaleString()} Chips`})</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 3: LIVE BATTLE ARENA & SEAT WAITING ROOM                             */}
      {/* ========================================================================= */}
      {viewState === 'battle' && activeBattle && (
        <div className="space-y-4 animate-fade-in">
          {/* Spectator Mode Banner */}
          {activeBattle.seats.every(s => !s?.isUser) && (
            <div className="p-3 rounded-2xl bg-indigo-950/80 border-2 border-indigo-500/50 flex items-center justify-between gap-3 shadow-lg">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-indigo-300">
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-black uppercase text-indigo-200">Spectator Mode</span>
                  <p className="text-[11px] text-indigo-300/80">You are spectating this match live. No chips are wagered from your balance.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  sound.playChip();
                  setViewState('lobby');
                }}
                className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-bold border border-zinc-700 transition-colors cursor-pointer"
              >
                Back to Lobby
              </button>
            </div>
          )}

          {/* Auto Start Countdown Alert Banner */}
          {autoStartCountdown !== null && autoStartCountdown > 0 && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-emerald-500/20 border-2 border-amber-400 shadow-xl flex items-center justify-between gap-3 animate-pulse">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl animate-bounce">⚡</span>
                <div>
                  <div className="text-xs font-black text-amber-300 uppercase tracking-wide">All Seats Filled!</div>
                  <div className="text-xs text-zinc-200">
                    Battle launching automatically in <strong className="text-amber-400 text-sm font-mono">{autoStartCountdown}</strong>s...
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAutoStartCountdown(null)}
                  className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 text-xs font-bold border border-zinc-700 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleStartBattle}
                  className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-300 hover:to-yellow-200 text-zinc-950 text-xs font-black uppercase tracking-wider transition-all shadow-md cursor-pointer transform hover:scale-105"
                >
                  Start Now 🚀
                </button>
              </div>
            </div>
          )}

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
            <div className="flex items-center gap-2 flex-wrap justify-end">
              {battlePhase === 'waiting' && (
                <>
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
                </>
              )}

              {/* Leave / Exit to Lobby during play (game continues in background) */}
              <button
                type="button"
                onClick={() => {
                  sound.playChip();
                  setViewState('lobby');
                }}
                className="px-3.5 py-2 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs font-bold border border-zinc-800 flex items-center gap-1.5 transition-colors cursor-pointer"
                title={battlePhase === 'spinning' || battlePhase === 'round-summary' ? 'Leave match (battle continues playing)' : 'Back to Lobby'}
              >
                <span>{battlePhase === 'waiting' ? '← Exit' : '← Exit to Lobby'}</span>
              </button>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* BATTLE COMPLETED FINAL REWARDS BANNER (PLACED AT TOP)                    */}
          {/* ========================================================================= */}
          {battlePhase === 'completed' && (
            <div className="p-6 sm:p-8 rounded-3xl bg-zinc-950 border-2 border-amber-400 shadow-2xl text-center space-y-5 animate-fade-in relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-amber-500/15 via-purple-500/10 to-transparent pointer-events-none" />

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
                    ? `Total grand loot pot of ${isCash ? `$${totalLootPool(activeBattle, isCash).toFixed(2)}` : `${totalLootPool(activeBattle, isCash).toLocaleString()} chips`} divided evenly among all ${activeBattle.seats.filter(Boolean).length} participants.`
                    : 'The winner takes all unboxed artifacts and chips from all competitors in this arena.'}
                </p>

                {/* Auto Payout Notification Banner */}
                {calculateUserPayout(activeBattle, userSeatIdx, isCash) > 0 ? (
                  <div className="mt-4 p-3.5 rounded-2xl bg-emerald-950/80 border-2 border-emerald-400/80 max-w-md mx-auto flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-950/50">
                    <Coins className="w-5 h-5 text-emerald-400 animate-pulse" />
                    <span className="text-sm font-black text-emerald-300 font-mono">
                      ✓ +{isCash ? `$${calculateUserPayout(activeBattle, userSeatIdx, isCash).toFixed(2)}` : `${calculateUserPayout(activeBattle, userSeatIdx, isCash).toLocaleString()} Chips`} Auto-Collected to Balance!
                    </span>
                  </div>
                ) : (
                  <div className="mt-4 p-3 rounded-2xl bg-zinc-900 border border-zinc-800 max-w-md mx-auto text-xs text-zinc-400">
                    Better luck next match! Try a rematch to claim the pot.
                  </div>
                )}

                {/* Grand Stats Bar */}
                <div className="mt-5 max-w-xl mx-auto p-4 rounded-2xl bg-black/60 border border-amber-500/40 grid grid-cols-2 sm:grid-cols-3 gap-3 text-center">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-zinc-400">Total Pot Value</div>
                    <div className="text-lg sm:text-xl font-black text-amber-300 font-mono">
                      {isCash ? `$${totalLootPool(activeBattle, isCash).toFixed(2)}` : `${totalLootPool(activeBattle, isCash).toLocaleString()}c`}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-zinc-400">Rounds Played</div>
                    <div className="text-lg sm:text-xl font-black text-purple-300">
                      {activeBattle.crates.length} Crates
                    </div>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <div className="text-[10px] uppercase font-bold text-zinc-400">Your Winnings</div>
                    <div className="text-lg sm:text-xl font-black text-emerald-400 font-mono">
                      {isCash ? `$${calculateUserPayout(activeBattle, userSeatIdx, isCash).toFixed(2)}` : `${calculateUserPayout(activeBattle, userSeatIdx, isCash).toLocaleString()}c`}
                    </div>
                  </div>
                </div>

                {/* Action Buttons for User */}
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={() => {
                      sound.playChip();
                      // Rematch with same configuration
                      const initialSeats: (BattleSeat | null)[] = activeBattle.seats.map((s) => {
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
                    }}
                    className="py-3 px-6 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-purple-600/30 cursor-pointer transition-all transform hover:scale-105"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Play Rematch</span>
                  </button>

                  <button
                    onClick={() => {
                      sound.playChip();
                      setViewState('lobby');
                      setActiveBattle(null);
                      setBattlePhase('waiting');
                    }}
                    className="py-3 px-6 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs sm:text-sm font-bold border border-zinc-700 transition-colors cursor-pointer"
                  >
                    Exit to Lobby
                  </button>
                </div>
              </div>
            </div>
          )}

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
                const crateCost = getCrateCost(crate, currencyMode);

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
                    <span className="font-mono text-[10px] text-amber-300 font-bold">
                      {isCash ? `$${crateCost.toFixed(2)}` : `${crateCost}c`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SEATS AND SPINNING REELS ARENA                                            */}
          {/* ========================================================================= */}
          {(() => {
            const team1Total = (activeBattle.seats[0]?.currentTotalValue || 0) + (activeBattle.seats[1]?.currentTotalValue || 0);
            const team2Total = (activeBattle.seats[2]?.currentTotalValue || 0) + (activeBattle.seats[3]?.currentTotalValue || 0);
            const team1Leading = team1Total > team2Total;
            const team2Leading = team2Total > team1Total;
            const teamDiff = Math.abs(team1Total - team2Total);

            const renderSeatCard = (seatIdx: number) => {
              const seat = activeBattle.seats[seatIdx];
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
                    className="p-6 rounded-3xl bg-zinc-950/60 border-2 border-dashed border-zinc-800 hover:border-purple-500/60 flex flex-col items-center justify-center text-center gap-3 min-h-[260px] cursor-pointer group transition-all"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-zinc-900 group-hover:bg-purple-950 flex items-center justify-center text-zinc-500 group-hover:text-purple-300 transition-colors">
                      <UserPlus className="w-6 h-6" />
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
                      className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1 shadow transition-all cursor-pointer"
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
                      : activeBattle.mode === '2v2' && seat.team === 1
                      ? 'bg-zinc-950 border-blue-900/60'
                      : activeBattle.mode === '2v2' && seat.team === 2
                      ? 'bg-zinc-950 border-rose-900/60'
                      : 'bg-zinc-950 border-zinc-800'
                  }`}
                >
                  {/* Seat Header Bar - Compact stacked layout with loot underneath player name */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xl sm:text-2xl p-1 rounded-xl bg-zinc-900 border border-zinc-800 shadow shrink-0">
                        {seat.avatar}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs sm:text-sm font-black text-zinc-100 truncate max-w-[105px] sm:max-w-[150px]">
                            {seat.name}
                          </span>
                          {seat.isUser && (
                            <span className="text-[8px] sm:text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-purple-600 text-white shrink-0">
                              YOU
                            </span>
                          )}
                          {isWinner && (
                            <Crown className="w-3.5 h-3.5 text-yellow-400 fill-current animate-bounce shrink-0" />
                          )}
                        </div>

                        {/* Loot Total Under Name */}
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] sm:text-xs font-black font-mono text-amber-300">
                            Loot: {isCash ? `$${seat.currentTotalValue.toFixed(2)}` : `${seat.currentTotalValue.toLocaleString()}c`}
                          </span>
                          {activeBattle.mode === '2v2' && (
                            <span className={`text-[8px] font-bold uppercase px-1.5 py-0.2 rounded shrink-0 ${
                              seat.team === 1 ? 'bg-blue-950 text-blue-300 border border-blue-500/40' : 'bg-rose-950 text-rose-300 border border-rose-500/40'
                            }`}>
                              T{seat.team}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      {isWinner ? (
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40">
                          Winner
                        </span>
                      ) : battlePhase === 'waiting' ? (
                        <span className="text-[9px] font-mono font-bold text-emerald-400">Ready</span>
                      ) : (
                        <span className="text-[9px] font-mono text-zinc-400">
                          R{currentRoundIndex + 1}/{activeBattle.crates.length}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* ACTIVE SPINNING REEL FOR THIS SEAT (Shortened, Centered, Focused Viewport) */}
                  <div
                    ref={(el) => {
                      reelContainerRefs.current[seatIdx] = el;
                    }}
                    className="my-2 relative w-full h-28 sm:h-30 rounded-2xl bg-zinc-950 border border-zinc-800/90 overflow-hidden shadow-inner flex items-center"
                  >
                    {/* Dark gradient vignettes on both sides to shorten visible range cleanly */}
                    <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-14 bg-gradient-to-r from-zinc-950 via-zinc-950/90 to-transparent z-20 pointer-events-none" />
                    <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-14 bg-gradient-to-l from-zinc-950 via-zinc-950/90 to-transparent z-20 pointer-events-none" />

                    {/* Needle Indicator */}
                    <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-yellow-400 z-30 shadow-[0_0_12px_rgba(234,179,8,1)] pointer-events-none">
                      <ArrowDown className="w-3.5 h-3.5 text-yellow-400 fill-current -top-1 -left-1.5 absolute animate-bounce" />
                    </div>

                    {battlePhase === 'waiting' ? (
                      <div className="w-full flex flex-col items-center justify-center text-center p-2">
                        <span className="text-2xl sm:text-3xl mb-1">{activeBattle.crates[0]?.icon}</span>
                        <span className="text-xs text-zinc-400 font-bold">Waiting for launch...</span>
                        <span className="text-[10px] text-zinc-500">Ready to unbox</span>
                      </div>
                    ) : (
                      <div
                        key={`reel-strip-seat-${seatIdx}-round-${currentRoundIndex}-spin-${spinNonce}`}
                        className="flex items-center gap-2 will-change-transform px-2"
                        style={{
                          transform: isReelSpinning ? `translateX(${reelState?.translateX || 0}px)` : 'translateX(0px)',
                          transition: isReelSpinning ? `transform ${4.9 + seatIdx * 0.07}s cubic-bezier(0.12, 0.98, 0.22, 1)` : 'none',
                        }}
                      >
                        {reelState?.items.map((item, idx) => {
                          const rarity = RARITY_CONFIG[item.rarity];
                          const itemVal = getItemValue(item, currencyMode);
                          return (
                            <div
                              key={`round-${currentRoundIndex}-${item.id}-${idx}`}
                              style={{ width: '100px' }}
                              className={`flex-shrink-0 h-24 sm:h-26 rounded-xl border p-1.5 flex flex-col justify-between items-center text-center bg-gradient-to-b ${rarity.bg} ${rarity.border}`}
                            >
                              <span className={`text-[8px] font-black uppercase ${rarity.text}`}>
                                {rarity.label}
                              </span>
                              <span className="text-xl sm:text-2xl">{item.icon}</span>
                              <div className="w-full">
                                <div className="text-[9px] sm:text-[10px] font-black text-zinc-100 truncate">{item.name}</div>
                                <div className="text-[8px] sm:text-[9px] font-mono text-amber-300 font-bold">
                                  {isCash ? `$${itemVal.toFixed(2)}` : `${itemVal}c`}
                                </div>
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
                          className="text-[10px] text-rose-400 hover:text-rose-300 font-bold cursor-pointer"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-h-12">
                      {seat.unboxedItems.length > 0 ? (
                        seat.unboxedItems.map((item, iIdx) => {
                          const itemVal = getItemValue(item, currencyMode);
                          return (
                            <div
                              key={`won-${item.id}-${iIdx}`}
                              className="px-2 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-[10px] flex items-center gap-1 shrink-0"
                              title={`${item.name} (${isCash ? `$${itemVal.toFixed(2)}` : `${itemVal}c`})`}
                            >
                              <span>{item.icon}</span>
                              <span className="font-mono text-amber-300 font-bold">
                                {isCash ? `$${itemVal.toFixed(2)}` : `${itemVal}c`}
                              </span>
                            </div>
                          );
                        })
                      ) : (
                        <span className="text-[10px] text-zinc-600 italic">No items yet</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            };

            // 2v2 SQUAD LAYOUT: Duel Scoreboard on TOP (above both teams), Team 1 on Top, Team 2 Below
            if (activeBattle.mode === '2v2') {
              return (
                <div className="space-y-4">
                  {/* SQUAD DUEL SCOREBOARD (TOP BAR - ABOVE BOTH TEAMS) */}
                  <div className="p-3 rounded-2xl bg-zinc-950 border-2 border-zinc-800 flex items-center justify-between gap-3 shadow-lg">
                    <div className="text-left flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-400/40 flex items-center justify-center text-blue-300 font-bold text-sm">
                        🛡️
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-black text-blue-400 block">Team 1 (Blue) Total</span>
                        <span className="text-base sm:text-lg font-mono font-black text-blue-300">
                          {isCash ? `$${team1Total.toFixed(2)}` : `${team1Total.toLocaleString()}c`}
                        </span>
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-700 text-xs font-black text-zinc-200 shadow">
                        <Swords className="w-3.5 h-3.5 text-amber-400" />
                        <span>
                          {battlePhase === 'waiting'
                            ? '2v2 SQUAD SHOWDOWN'
                            : team1Total === team2Total
                            ? 'TIED ROUND'
                            : team1Leading
                            ? `TEAM 1 AHEAD (+${isCash ? `$${teamDiff.toFixed(2)}` : `${teamDiff.toLocaleString()}c`})`
                            : `TEAM 2 AHEAD (+${isCash ? `$${teamDiff.toFixed(2)}` : `${teamDiff.toLocaleString()}c`})`}
                        </span>
                      </div>
                    </div>

                    <div className="text-right flex items-center gap-2 flex-row-reverse">
                      <div className="w-8 h-8 rounded-xl bg-rose-600/20 border border-rose-400/40 flex items-center justify-center text-rose-300 font-bold text-sm">
                        ⚔️
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-black text-rose-400 block">Team 2 (Red) Total</span>
                        <span className="text-base sm:text-lg font-mono font-black text-rose-300">
                          {isCash ? `$${team2Total.toFixed(2)}` : `${team2Total.toLocaleString()}c`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* TEAM 1 HEADER & SIDE-BY-SIDE SEATS */}
                  <div className="space-y-2">
                    <div className="p-2.5 px-3 rounded-2xl bg-blue-950/40 border border-blue-500/40 flex items-center justify-between flex-wrap gap-2 shadow">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase text-blue-300">TEAM 1 (BLUE SQUAD)</span>
                        {team1Leading && battlePhase !== 'waiting' && (
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/40 flex items-center gap-1">
                            <Crown className="w-3 h-3 text-yellow-400 fill-current" /> Leading
                          </span>
                        )}
                        <span className="text-[11px] text-zinc-400 hidden sm:inline">
                          ({activeBattle.seats[0]?.name || 'Seat 1'} & {activeBattle.seats[1]?.name || 'Seat 2'})
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-black font-mono text-blue-300">
                          {isCash ? `$${team1Total.toFixed(2)}` : `${team1Total.toLocaleString()} Chips`}
                        </span>
                      </div>
                    </div>

                    {/* Team 1 Side-by-Side Seats */}
                    <div className="grid grid-cols-2 gap-2 sm:gap-4">
                      {renderSeatCard(0)}
                      {renderSeatCard(1)}
                    </div>
                  </div>

                  {/* TEAM 2 HEADER & SIDE-BY-SIDE SEATS */}
                  <div className="space-y-2">
                    <div className="p-2.5 px-3 rounded-2xl bg-rose-950/40 border border-rose-500/40 flex items-center justify-between flex-wrap gap-2 shadow">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase text-rose-300">TEAM 2 (RED SQUAD)</span>
                        {team2Leading && battlePhase !== 'waiting' && (
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-400/40 flex items-center gap-1">
                            <Crown className="w-3 h-3 text-yellow-400 fill-current" /> Leading
                          </span>
                        )}
                        <span className="text-[11px] text-zinc-400 hidden sm:inline">
                          ({activeBattle.seats[2]?.name || 'Seat 3'} & {activeBattle.seats[3]?.name || 'Seat 4'})
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-black font-mono text-rose-300">
                          {isCash ? `$${team2Total.toFixed(2)}` : `${team2Total.toLocaleString()} Chips`}
                        </span>
                      </div>
                    </div>

                    {/* Team 2 Side-by-Side Seats */}
                    <div className="grid grid-cols-2 gap-2 sm:gap-4">
                      {renderSeatCard(2)}
                      {renderSeatCard(3)}
                    </div>
                  </div>
                </div>
              );
            }

            // 1v1 DUEL LAYOUT: Side-by-Side with Live 1v1 Score Bar
            if (activeBattle.mode === '1v1') {
              const p1Total = activeBattle.seats[0]?.currentTotalValue || 0;
              const p2Total = activeBattle.seats[1]?.currentTotalValue || 0;
              const p1Leading = p1Total > p2Total;
              const p2Leading = p2Total > p1Total;
              const pDiff = Math.abs(p1Total - p2Total);

              return (
                <div className="space-y-4">
                  {/* 1v1 Top Score Bar */}
                  <div className="p-3 rounded-2xl bg-zinc-950 border-2 border-zinc-800 flex items-center justify-between gap-3 shadow-lg">
                    <div className="text-left">
                      <span className="text-[10px] uppercase font-black text-purple-400 block">{activeBattle.seats[0]?.name || 'Player 1'}</span>
                      <span className="text-base sm:text-lg font-mono font-black text-amber-300">
                        {isCash ? `$${p1Total.toFixed(2)}` : `${p1Total.toLocaleString()}c`}
                      </span>
                    </div>

                    <div className="text-center">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-700 text-xs font-black text-zinc-200 shadow">
                        <Swords className="w-3.5 h-3.5 text-amber-400" />
                        <span>
                          {battlePhase === 'waiting'
                            ? '1v1 HEAD-TO-HEAD DUEL'
                            : p1Total === p2Total
                            ? 'TIED MATCH'
                            : p1Leading
                            ? `${activeBattle.seats[0]?.name} LEADS (+${isCash ? `$${pDiff.toFixed(2)}` : `${pDiff.toLocaleString()}c`})`
                            : `${activeBattle.seats[1]?.name} LEADS (+${isCash ? `$${pDiff.toFixed(2)}` : `${pDiff.toLocaleString()}c`})`}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] uppercase font-black text-purple-400 block">{activeBattle.seats[1]?.name || 'Player 2'}</span>
                      <span className="text-base sm:text-lg font-mono font-black text-amber-300">
                        {isCash ? `$${p2Total.toFixed(2)}` : `${p2Total.toLocaleString()}c`}
                      </span>
                    </div>
                  </div>

                  {/* 1v1 Side-by-Side Seats Grid */}
                  <div className="grid grid-cols-2 gap-2 sm:gap-4">
                    {renderSeatCard(0)}
                    {renderSeatCard(1)}
                  </div>
                </div>
              );
            }

            // GROUP FFA OR GROUP SPLIT LAYOUT
            return (
              <div className={`grid gap-2 sm:gap-4 ${
                activeBattle.maxPlayers === 2 ? 'grid-cols-2' : 'grid-cols-2 lg:grid-cols-4'
              }`}>
                {activeBattle.seats.map((_, idx) => renderSeatCard(idx))}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};

// Helper calculations for battle payout
function totalLootPool(battle: CrateBattle, isCash = false): number {
  const sum = battle.seats.reduce((s, st) => s + (st?.currentTotalValue || 0), 0);
  return isCash ? Number(sum.toFixed(2)) : sum;
}

function calculateUserPayout(battle: CrateBattle, userIdx: number, isCash = false): number {
  if (userIdx === -1) return 0;
  const userSeat = battle.seats[userIdx];
  if (!userSeat) return 0;

  const total = totalLootPool(battle, isCash);

  if (battle.mode === '1v1' || battle.mode === 'group-ffa') {
    if (battle.winnerSeatIndex === userIdx) {
      return isCash ? Number(total.toFixed(2)) : total;
    }
    return 0;
  } else if (battle.mode === '2v2') {
    if (userSeat.team === battle.winnerTeam) {
      return isCash ? Number((total / 2).toFixed(2)) : Math.round(total / 2);
    }
    return 0;
  } else if (battle.mode === 'group-split') {
    const validSeatsCount = battle.seats.filter(Boolean).length || 1;
    return isCash 
      ? Number((total / validSeatsCount).toFixed(2))
      : (battle.sharedPotPerPlayer || Math.round(total / validSeatsCount));
  }
  return 0;
}
