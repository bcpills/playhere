import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, UserAccount, PlayerProfileData } from '../types';
import { isUserAdmin, getVIPTier, getVIPTierInfo, loadStoredFakePlayers } from '../utils/leaderboard';
import { sound } from '../utils/audio';
import { 
  MessageSquare, 
  Send, 
  X, 
  Sparkles, 
  ShieldCheck, 
  Flame, 
  TrendingUp, 
  ChevronDown, 
  Users,
  Smile,
  Shield,
  Volume2,
  CloudRain,
  Coins,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface CasinoChatProps {
  isOpen: boolean;
  onClose: () => void;
  userAccount: UserAccount;
  balance: number;
  onInspectPlayer: (player: PlayerProfileData) => void;
  externalMessages: ChatMessage[];
  onSendMessage: (msg: ChatMessage) => void;
  onUpdateBalance?: (delta: number) => void;
}

const INITIAL_BOT_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    senderId: 'bot-1',
    username: 'fakeplayer1',
    avatar: '🦈',
    vipTier: 'Gold Regular',
    contactPlatform: 'telegram',
    contactHandle: '@fakeplayer1',
    text: 'Just hit 100x on 21+3 in Blackjack! Heading straight for the tournament leaderboard 🚀',
    timestamp: Date.now() - 1000 * 60 * 12,
    balance: 480,
  },
  {
    id: 'msg-2',
    senderId: 'bot-2',
    username: 'fakeplayer2',
    avatar: '🃏',
    vipTier: 'Silver Grinder',
    contactPlatform: 'discord',
    contactHandle: 'fakeplayer2#8821',
    text: 'Dealer pulled another 5-card 21 on me lmao. Classic ChipZone.',
    timestamp: Date.now() - 1000 * 60 * 9,
    balance: 350,
  },
  {
    id: 'msg-3',
    senderId: 'bot-3',
    username: 'fakeplayer3',
    avatar: '🦁',
    vipTier: 'Gold Regular',
    contactPlatform: 'discord',
    contactHandle: 'fakeplayer3#7777',
    text: 'Anyone picking number 7 on Keno? It hit 4 rounds in a row for me on High Risk 🔥',
    timestamp: Date.now() - 1000 * 60 * 5,
    balance: 410,
  },
  {
    id: 'msg-4',
    senderId: 'sys-1',
    username: 'Casino Pit Boss',
    avatar: '🎰',
    vipTier: 'Sovereign Degenerate',
    text: '⚡ Daily Reminder: Balances reset at 12:00 AM EST! Yesterday\'s #1 winner payout is processing.',
    timestamp: Date.now() - 1000 * 60 * 3,
    type: 'system',
    badge: 'SYSTEM',
    balance: 1000000,
  },
];

const BOT_QUOTES = [
  "Double down on 11 never fails! Well, almost never 😂",
  "Who is holding the #1 tournament rank right now?",
  "Remember: 12 AM EST reset is coming up, push your bets!",
  "Hit an 8-spot Keno multiplier! LFGGGG 🔥",
  "Just used my ATM bailout. God bless 100 chip reloads.",
  "Split Aces into two Blackjacks! What a rush 🃏",
  "Anyone testing the High Risk Keno tables? 10000x jackpot is wild.",
  "Unboxed some crazy items in the Bum Bag crate 🍾",
  "Admin Thomas Joe is in the house! Good luck to all high rollers tonight."
];

export const CasinoChat: React.FC<CasinoChatProps> = ({
  isOpen,
  onClose,
  userAccount,
  balance,
  onInspectPlayer,
  externalMessages,
  onSendMessage,
  onUpdateBalance,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_BOT_MESSAGES);
  const [inputText, setInputText] = useState<string>('');
  const [isRainModalOpen, setIsRainModalOpen] = useState<boolean>(false);
  const [rainAmountInput, setRainAmountInput] = useState<string>('100');
  const [rainRecipientsInput, setRainRecipientsInput] = useState<string>('2');
  const [rainError, setRainError] = useState<string>('');
  const [rainSuccessToast, setRainSuccessToast] = useState<string>('');
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const isAdmin = isUserAdmin(userAccount);

  // Sync external messages (e.g. system announcements / balance resets)
  useEffect(() => {
    if (externalMessages.length > 0) {
      setMessages(prev => {
        const existingIds = new Set(prev.map(m => m.id));
        const newOnes = externalMessages.filter(m => !existingIds.has(m.id));
        return [...prev, ...newOnes];
      });
    }
  }, [externalMessages]);

  // Periodic fake player banter and occasional rain
  useEffect(() => {
    const interval = setInterval(() => {
      const stored = loadStoredFakePlayers();
      const randomPlayer = stored[Math.floor(Math.random() * stored.length)] || {
        id: 'fakeplayer1',
        username: 'fakeplayer1',
        avatar: '🦈',
        vipTier: 'Gold Regular' as const,
        contactPlatform: 'telegram' as const,
        contactHandle: '@fakeplayer1',
        balance: 450,
      };
      const randomQuote = BOT_QUOTES[Math.floor(Math.random() * BOT_QUOTES.length)];

      const newBotMessage: ChatMessage = {
        id: 'bot-msg-' + Date.now(),
        senderId: randomPlayer.id || 'bot-' + randomPlayer.username,
        username: randomPlayer.username,
        avatar: randomPlayer.avatar,
        vipTier: randomPlayer.vipTier,
        contactPlatform: randomPlayer.contactPlatform,
        contactHandle: randomPlayer.contactHandle,
        text: randomQuote,
        timestamp: Date.now(),
        balance: randomPlayer.balance,
      };

      setMessages(prev => [...prev.slice(-35), newBotMessage]);
    }, 28000);

    return () => clearInterval(interval);
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    if (isOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const isMod = userAccount?.accountStatus === 'moderator';

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    sound.playChip();
    const userTier = getVIPTier(userAccount.peakBalanceAllTime || 1000);

    const newMsg: ChatMessage = {
      id: 'user-msg-' + Date.now(),
      senderId: userAccount.id || 'user-me',
      username: userAccount.username || 'Gambler',
      avatar: userAccount.avatar || '👑',
      vipTier: userTier,
      contactPlatform: userAccount.contactPlatform,
      contactHandle: userAccount.contactHandle,
      text: inputText.trim(),
      timestamp: Date.now(),
      balance,
      isUser: true,
      isAdmin,
      isModerator: isMod,
      badge: isMod ? 'MODERATOR' : isAdmin ? 'ADMIN' : undefined,
    };

    setMessages(prev => [...prev, newMsg]);
    onSendMessage(newMsg);
    setInputText('');
  };

  const handlePlayerClick = (msg: ChatMessage) => {
    sound.playChip();
    onInspectPlayer({
      id: msg.senderId,
      username: msg.username,
      avatar: msg.avatar,
      vipTier: msg.vipTier,
      contactPlatform: msg.contactPlatform,
      contactHandle: msg.contactHandle,
      balance: msg.balance || 1000,
      totalWagered: msg.totalWagered,
      isUser: msg.isUser,
      isAdmin: msg.isAdmin,
    });
  };

  const handleExecuteRain = (e: React.FormEvent) => {
    e.preventDefault();
    setRainError('');

    const totalCoins = parseInt(rainAmountInput, 10);
    const numPlayers = parseInt(rainRecipientsInput, 10);

    if (isNaN(totalCoins) || totalCoins <= 0) {
      setRainError('Please enter a valid amount of coins to rain.');
      return;
    }

    if (isNaN(numPlayers) || numPlayers <= 0) {
      setRainError('Please enter a valid number of players (at least 1).');
      return;
    }

    if (totalCoins > balance) {
      setRainError(`Insufficient balance! You have 🪙${balance.toLocaleString()} chips.`);
      return;
    }

    if (numPlayers > totalCoins) {
      setRainError(`Cannot split 🪙${totalCoins} between ${numPlayers} players (minimum 1 coin each).`);
      return;
    }

    const perPlayer = Math.floor(totalCoins / numPlayers);

    // Deduct coins from user balance
    if (onUpdateBalance) {
      onUpdateBalance(-totalCoins);
    }

    sound.playProfit();

    // Pick lucky recipients from fake players
    const fakePlayers = loadStoredFakePlayers();
    const potentialRecipients = [...fakePlayers.map(p => p.username)];
    
    // Shuffle potential recipients
    const shuffled = [...potentialRecipients].sort(() => 0.5 - Math.random());
    const recipients = shuffled.slice(0, Math.min(numPlayers, shuffled.length));

    const userTier = getVIPTier(userAccount.peakBalanceAllTime || 1000);
    const rainMsg: ChatMessage = {
      id: 'rain-msg-' + Date.now(),
      senderId: userAccount.id || 'user-me',
      username: userAccount.username || 'Gambler',
      avatar: userAccount.avatar || '👑',
      vipTier: userTier,
      type: 'rain',
      badge: 'RAIN',
      rainAmount: totalCoins,
      rainRecipients: numPlayers,
      text: `🌧️ MAKE IT RAIN! Rained 🪙${totalCoins.toLocaleString()} chips split between ${numPlayers} lucky players (🪙${perPlayer.toLocaleString()} each)! 🍀 Winners: ${recipients.join(', ') || 'Community'}`,
      timestamp: Date.now(),
      balance: balance - totalCoins,
      isUser: true,
      isAdmin,
    };

    setMessages(prev => [...prev, rainMsg]);
    onSendMessage(rainMsg);
    setIsRainModalOpen(false);
    setRainSuccessToast(`Rained 🪙${totalCoins.toLocaleString()} across ${numPlayers} players!`);
    setTimeout(() => setRainSuccessToast(''), 4000);
  };

  if (!isOpen) return null;

  const parsedRainCoins = parseInt(rainAmountInput, 10) || 0;
  const parsedRainPlayers = parseInt(rainRecipientsInput, 10) || 1;
  const calculatedPerPlayer = parsedRainPlayers > 0 ? Math.floor(parsedRainCoins / parsedRainPlayers) : 0;

  return (
    <div className="fixed bottom-0 right-0 z-50 w-full sm:w-[440px] h-[540px] sm:h-[600px] max-h-[85vh] sm:mr-4 sm:mb-4 bg-zinc-950/95 backdrop-blur-xl border-t sm:border border-amber-500/40 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
      {/* Chat Header */}
      <div className="p-3.5 sm:p-4 bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-950 border-b border-zinc-800 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-md">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-zinc-100 flex items-center gap-1.5">
                <span>Casino Lounge Chat</span>
              </h3>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-[10px] text-zinc-400">
              Click any player to inspect dossier & stats.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Make it Rain Button Header Trigger */}
          <button
            onClick={() => {
              sound.playChip();
              setIsRainModalOpen(prev => !prev);
            }}
            title="Make It Rain Chips"
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-[11px] uppercase tracking-wider shadow-md transition-all cursor-pointer"
          >
            <CloudRain className="w-3.5 h-3.5" />
            <span>Rain</span>
          </button>

          {isAdmin && (
            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
              {isMod ? 'MODERATOR' : 'ADMIN'}
            </span>
          )}
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 flex items-center justify-center transition-colors cursor-pointer border border-zinc-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Success Toast */}
      {rainSuccessToast && (
        <div className="bg-emerald-500/20 border-b border-emerald-500/40 px-3 py-1.5 flex items-center gap-2 text-emerald-300 text-xs font-bold animate-in fade-in shrink-0">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{rainSuccessToast}</span>
        </div>
      )}

      {/* MAKE IT RAIN POPOVER / FORM */}
      {isRainModalOpen && (
        <div className="bg-gradient-to-b from-blue-950/80 via-zinc-950 to-zinc-900 border-b border-cyan-500/40 p-3.5 space-y-3 shrink-0 shadow-2xl animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CloudRain className="w-4 h-4 text-cyan-400 animate-bounce" />
              <h4 className="text-xs font-black uppercase tracking-wider text-cyan-300">
                Make It Rain (Split Coins)
              </h4>
            </div>
            <span className="text-[10px] font-mono text-zinc-400">
              Available: <strong className="text-amber-300">🪙{balance.toLocaleString()}</strong>
            </span>
          </div>

          <form onSubmit={handleExecuteRain} className="space-y-2.5">
            <div className="grid grid-cols-2 gap-2">
              {/* Coin Amount Input */}
              <div>
                <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">
                  Total Coins (X)
                </label>
                <input
                  type="number"
                  min="1"
                  max={balance}
                  value={rainAmountInput}
                  onChange={e => setRainAmountInput(e.target.value)}
                  placeholder="Coins"
                  className="w-full px-2.5 py-1.5 rounded-xl bg-zinc-950 border border-zinc-700 text-xs font-mono font-bold text-amber-300 focus:outline-none focus:border-cyan-400"
                />
                <div className="flex gap-1 mt-1">
                  {[50, 100, 250, 500].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setRainAmountInput(String(val))}
                      className="flex-1 py-0.5 bg-zinc-900 hover:bg-zinc-800 text-[9px] font-mono text-zinc-400 rounded border border-zinc-800 cursor-pointer"
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>

              {/* Player Count Input */}
              <div>
                <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">
                  Split Between (X Players)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={rainRecipientsInput}
                  onChange={e => setRainRecipientsInput(e.target.value)}
                  placeholder="Players"
                  className="w-full px-2.5 py-1.5 rounded-xl bg-zinc-950 border border-zinc-700 text-xs font-mono font-bold text-zinc-100 focus:outline-none focus:border-cyan-400"
                />
                <div className="flex gap-1 mt-1">
                  {[1, 2, 3, 5].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setRainRecipientsInput(String(val))}
                      className="flex-1 py-0.5 bg-zinc-900 hover:bg-zinc-800 text-[9px] font-mono text-zinc-400 rounded border border-zinc-800 cursor-pointer"
                    >
                      {val}p
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Calculated summary */}
            <div className="p-2 rounded-xl bg-cyan-950/40 border border-cyan-500/20 flex items-center justify-between text-xs">
              <span className="text-[11px] text-cyan-200">
                Each player receives:
              </span>
              <span className="font-mono font-black text-cyan-300">
                🪙 {calculatedPerPlayer.toLocaleString()} chips
              </span>
            </div>

            {rainError && (
              <div className="text-[10px] text-red-400 flex items-center gap-1 font-bold">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{rainError}</span>
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                disabled={balance < parsedRainCoins || parsedRainCoins <= 0}
                className="flex-1 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-black uppercase tracking-wider shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-1.5"
              >
                <CloudRain className="w-3.5 h-3.5" />
                <span>Make It Rain 🪙{parsedRainCoins.toLocaleString()}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsRainModalOpen(false)}
                className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 text-xs font-bold border border-zinc-800 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 font-sans text-xs">
        {messages.map((msg) => {
          const tierInfo = getVIPTierInfo(msg.vipTier);
          const isSystem = msg.type === 'system' || msg.type === 'mod_action';
          const isRain = msg.type === 'rain';

          if (isSystem) {
            return (
              <div
                key={msg.id}
                className="p-2.5 rounded-2xl bg-amber-950/30 border border-amber-500/30 text-amber-200 text-[11px] flex items-start gap-2 shadow-inner"
              >
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <div className="font-black uppercase tracking-wide text-[10px] text-amber-300">
                    {msg.username}
                  </div>
                  <div>{msg.text}</div>
                </div>
              </div>
            );
          }

          if (isRain) {
            return (
              <div
                key={msg.id}
                className="p-3 rounded-2xl bg-gradient-to-r from-cyan-950/80 via-blue-950/60 to-zinc-950 border-2 border-cyan-500/60 text-cyan-200 shadow-xl relative overflow-hidden"
              >
                <div className="flex items-center justify-between gap-1.5 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xl">🌧️</span>
                    <span className="font-black text-xs text-cyan-300 uppercase tracking-wide">
                      {msg.username}
                    </span>
                    <span className="text-[9px] font-black uppercase px-2 py-0.2 rounded-full bg-cyan-500 text-zinc-950 shadow-sm">
                      MAKE IT RAIN
                    </span>
                  </div>

                  <span className="text-[9px] font-mono text-zinc-500">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="pl-6 text-zinc-200 text-xs leading-relaxed">
                  {msg.text}
                </div>

                {msg.rainAmount && (
                  <div className="mt-2 pl-6 flex items-center gap-2 text-[10px]">
                    <span className="px-2 py-0.5 rounded-md bg-cyan-950 border border-cyan-500/30 font-mono font-bold text-cyan-300">
                      🪙 {msg.rainAmount.toLocaleString()} Total Chips
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-blue-950 border border-blue-500/30 font-mono font-bold text-blue-300">
                      👥 {msg.rainRecipients} Players
                    </span>
                  </div>
                )}
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              className={`p-2.5 rounded-2xl transition-all ${
                msg.isUser
                  ? 'bg-zinc-900/90 border border-amber-500/30'
                  : 'bg-zinc-900/40 border border-zinc-800/80 hover:border-zinc-700'
              }`}
            >
              {/* Message Header (Clickable Player Info) */}
              <div className="flex items-center justify-between gap-1.5 mb-1.5">
                <button
                  type="button"
                  onClick={() => handlePlayerClick(msg)}
                  className="flex items-center gap-1.5 text-left group cursor-pointer"
                  title="Click to view player profile"
                >
                  <span className="text-base group-hover:scale-110 transition-transform">
                    {msg.avatar}
                  </span>
                  <span className="font-black text-xs text-zinc-200 group-hover:text-amber-400 transition-colors">
                    {msg.username}
                  </span>

                  {msg.isModerator || msg.badge === 'MODERATOR' ? (
                    <span className="text-[8px] font-black uppercase px-1.5 py-0.2 rounded bg-indigo-600 text-white flex items-center gap-0.5 shadow-sm">
                      <ShieldCheck className="w-2.5 h-2.5" />
                      <span>MOD</span>
                    </span>
                  ) : msg.isAdmin ? (
                    <span className="text-[8px] font-black uppercase px-1.5 py-0.2 rounded bg-purple-600 text-white flex items-center gap-0.5 shadow-sm">
                      <ShieldCheck className="w-2.5 h-2.5" />
                      <span>ADMIN</span>
                    </span>
                  ) : (
                    <span className={`text-[8px] font-bold uppercase px-1.5 py-0.2 rounded-full border ${tierInfo.badgeBg}`}>
                      {msg.vipTier}
                    </span>
                  )}
                </button>

                <span className="text-[9px] font-mono text-zinc-500">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {/* Message Content */}
              <p className="text-zinc-300 text-xs pl-6 leading-relaxed break-words">
                {msg.text}
              </p>
            </div>
          );
        })}
        <div ref={chatBottomRef} />
      </div>

      {/* Message Input Footer */}
      <form onSubmit={handleSend} className="p-3 bg-zinc-900/90 border-t border-zinc-800 flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={() => {
            sound.playChip();
            setIsRainModalOpen(prev => !prev);
          }}
          title="Make It Rain Chips"
          className="p-2 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/40 transition-colors cursor-pointer shrink-0 shadow-sm"
        >
          <CloudRain className="w-4 h-4" />
        </button>

        <input
          type="text"
          maxLength={140}
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          placeholder={`Chat as ${userAccount.username || 'Gambler'}...`}
          className="flex-1 px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-amber-400"
        />

        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 text-zinc-950 font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0 shadow-md"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
