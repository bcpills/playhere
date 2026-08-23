import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, UserAccount, PlayerProfileData } from '../types';
import { isUserAdmin, getVIPTier, getVIPTierInfo } from '../utils/leaderboard';
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
  Volume2
} from 'lucide-react';

interface CasinoChatProps {
  isOpen: boolean;
  onClose: () => void;
  userAccount: UserAccount;
  balance: number;
  onInspectPlayer: (player: PlayerProfileData) => void;
  externalMessages: ChatMessage[];
  onSendMessage: (msg: ChatMessage) => void;
}

const INITIAL_BOT_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    senderId: 'bot-1',
    username: 'Vegas_Viper',
    avatar: '🦈',
    vipTier: 'Whale of the Lounge',
    contactPlatform: 'telegram',
    contactHandle: '@vegasviper_vip',
    text: 'Just hit 100x on 21+3 in Blackjack! Heading straight for the #1 tournament spot tonight 🚀',
    timestamp: Date.now() - 1000 * 60 * 12,
    balance: 14200,
  },
  {
    id: 'msg-2',
    senderId: 'bot-2',
    username: 'CardCounter_Dan',
    avatar: '🃏',
    vipTier: 'Platinum Shark',
    contactPlatform: 'discord',
    contactHandle: 'CardCounter#8821',
    text: 'Dealer pulled another 5-card 21 on me lmao. Classic FreebiesOnly.',
    timestamp: Date.now() - 1000 * 60 * 9,
    balance: 9850,
  },
  {
    id: 'msg-3',
    senderId: 'bot-4',
    username: 'LuckyLucy77',
    avatar: '🦁',
    vipTier: 'Gold Regular',
    contactPlatform: 'discord',
    contactHandle: 'LuckyLucy#7777',
    text: 'Anyone picking number 7 on Keno? It hit 4 rounds in a row for me on High Risk 🔥',
    timestamp: Date.now() - 1000 * 60 * 5,
    balance: 4500,
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
  {
    id: 'msg-5',
    senderId: 'bot-3',
    username: 'CryptoWhale_420',
    avatar: '🚀',
    vipTier: 'Diamond High-Roller',
    contactPlatform: 'telegram',
    contactHandle: '@cryptowhale420',
    text: 'Unboxed a Diamond Rolex in the Sovereign Vault crate! Ez +50,000 chips value 💎',
    timestamp: Date.now() - 1000 * 60 * 1,
    balance: 7600,
  },
];

const BOT_QUOTES = [
  "Double down on 11 never fails! Well, almost never 😂",
  "Who is holding the #1 tournament rank right now?",
  "Remember: 12 AM EST reset is coming up, push your bets!",
  "Hit an 8-spot Keno multiplier! LFGGGG 🔥",
  "Just used my 3rd ATM bailout of the day. God bless 100 chip reloads.",
  "Split Aces into two Blackjacks! What a rush 🃏",
  "Anyone testing the High Risk Keno tables? 10000x jackpot is wild.",
  "Sovereign crate jackpot hit incoming... I can feel it 🍾",
  "Admin Thomas Joe is in the house! Good luck to all high rollers tonight."
];

const BOT_SENDERS = [
  { username: 'Vegas_Viper', avatar: '🦈', vipTier: 'Whale of the Lounge' as const, contactPlatform: 'telegram' as const, contactHandle: '@vegasviper_vip', balance: 14500 },
  { username: 'CardCounter_Dan', avatar: '🃏', vipTier: 'Platinum Shark' as const, contactPlatform: 'discord' as const, contactHandle: 'CardCounter#8821', balance: 9400 },
  { username: 'LuckyLucy77', avatar: '🦁', vipTier: 'Gold Regular' as const, contactPlatform: 'discord' as const, contactHandle: 'LuckyLucy#7777', balance: 5200 },
  { username: 'CryptoWhale_420', avatar: '🚀', vipTier: 'Diamond High-Roller' as const, contactPlatform: 'telegram' as const, contactHandle: '@cryptowhale420', balance: 8100 },
  { username: 'MonteCarloMax', avatar: '🎩', vipTier: 'Platinum Shark' as const, contactPlatform: 'telegram' as const, contactHandle: '@montecarlo_max', balance: 3400 },
  { username: 'Degen_Ape_007', avatar: '🦍', vipTier: 'Diamond High-Roller' as const, contactPlatform: 'discord' as const, contactHandle: 'Ape007#0007', balance: 2800 },
];

export const CasinoChat: React.FC<CasinoChatProps> = ({
  isOpen,
  onClose,
  userAccount,
  balance,
  onInspectPlayer,
  externalMessages,
  onSendMessage,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_BOT_MESSAGES);
  const [inputText, setInputText] = useState<string>('');
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

  // Periodic bot banter to make the casino atmosphere live
  useEffect(() => {
    const interval = setInterval(() => {
      const randomBot = BOT_SENDERS[Math.floor(Math.random() * BOT_SENDERS.length)];
      const randomQuote = BOT_QUOTES[Math.floor(Math.random() * BOT_QUOTES.length)];

      const newBotMessage: ChatMessage = {
        id: 'bot-msg-' + Date.now(),
        senderId: 'bot-' + randomBot.username,
        username: randomBot.username,
        avatar: randomBot.avatar,
        vipTier: randomBot.vipTier,
        contactPlatform: randomBot.contactPlatform,
        contactHandle: randomBot.contactHandle,
        text: randomQuote,
        timestamp: Date.now(),
        balance: randomBot.balance + Math.floor(Math.random() * 500 - 250),
      };

      setMessages(prev => [...prev.slice(-30), newBotMessage]);
    }, 28000);

    return () => clearInterval(interval);
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    if (isOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

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
      isUser: msg.isUser,
      isAdmin: msg.isAdmin,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-0 right-0 z-50 w-full sm:w-[420px] h-[520px] sm:h-[580px] max-h-[85vh] sm:mr-4 sm:mb-4 bg-zinc-950/95 backdrop-blur-xl border-t sm:border border-amber-500/40 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
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
              Click any player to inspect profile & stats.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {isAdmin && (
            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
              ADMIN
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

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 font-sans text-xs">
        {messages.map((msg) => {
          const tierInfo = getVIPTierInfo(msg.vipTier);
          const isSystem = msg.type === 'system' || msg.type === 'mod_action';

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

                  {msg.isAdmin ? (
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
