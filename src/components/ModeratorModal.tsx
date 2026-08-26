import React, { useState } from 'react';
import { 
  DailyWinnerRecord, 
  ContactPlatform, 
  PlayerProfileData, 
  AdminManagedUser, 
  AccountStatus, 
  AccountType,
  ChatMessage 
} from '../types';
import { sound } from '../utils/audio';
import { formatCompactWager } from '../utils/leaderboard';
import { 
  ShieldCheck, 
  X, 
  Copy, 
  Check, 
  MessageSquare, 
  Send, 
  Award, 
  Coins, 
  FileText, 
  ExternalLink,
  Download,
  Search,
  CheckCircle2,
  Clock,
  Edit3,
  Filter,
  User,
  AlertCircle,
  Shield,
  Ban,
  Lock,
  Unlock,
  Crown,
  Users,
  ChevronDown,
  Sparkles,
  ChevronRight
} from 'lucide-react';

interface ModeratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  dailyWinners: DailyWinnerRecord[];
  onUpdateWinner: (winnerId: string, updates: Partial<DailyWinnerRecord>) => void;
  onInspectPlayer?: (player: PlayerProfileData) => void;
  usersList: AdminManagedUser[];
  onUpdateUserStatus: (userId: string, status: AccountStatus) => void;
  onUpdateUserTier: (userId: string, isAdFree: boolean) => void;
  onUpdateUserBalance?: (userId: string, newBalance: number) => void;
  allChatMessages: ChatMessage[];
}

export const ModeratorModal: React.FC<ModeratorModalProps> = ({
  isOpen,
  onClose,
  dailyWinners,
  onUpdateWinner,
  onInspectPlayer,
  usersList,
  onUpdateUserStatus,
  onUpdateUserTier,
  onUpdateUserBalance,
  allChatMessages,
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'payouts'>('users');
  
  // Payouts state
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [payoutSearchQuery, setPayoutSearchQuery] = useState<string>('');
  const [filterPayoutStatus, setFilterPayoutStatus] = useState<'pending' | 'paid' | 'all'>('pending');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState<string>('');

  // Users & Moderation state
  const [userSearchQuery, setUserSearchQuery] = useState<string>('');
  const [filterUserStatus, setFilterUserStatus] = useState<'all' | 'active' | 'moderator' | 'banned' | 'closed'>('all');
  const [filterUserTier, setFilterUserTier] = useState<'all' | 'paid' | 'free'>('all');
  const [selectedUserForChat, setSelectedUserForChat] = useState<AdminManagedUser | null>(null);
  const [editingBalanceUserId, setEditingBalanceUserId] = useState<string | null>(null);
  const [tempBalanceInput, setTempBalanceInput] = useState<string>('');

  if (!isOpen) return null;

  const handleCopyHandle = (handle: string, id: string) => {
    sound.playChip();
    navigator.clipboard.writeText(handle);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveNote = (winnerId: string) => {
    sound.playChip();
    onUpdateWinner(winnerId, { payoutNote: noteText });
    setEditingId(null);
    setNoteText('');
  };

  const handleExportCSV = () => {
    sound.playChip();
    const headers = ['Date (EST)', 'Username', 'Platform', 'Contact Handle', 'Winning Chips', 'Payout Status', 'Payout Note'];
    const rows = dailyWinners.map(w => [
      w.dateEst,
      `"${w.username}"`,
      w.contactPlatform.toUpperCase(),
      `"${w.contactHandle}"`,
      w.winningChips,
      w.payoutStatus,
      `"${w.payoutNote || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `chipzone_payouts_log_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered Winners
  const filteredWinners = dailyWinners.filter(w => {
    const matchesSearch = 
      w.username.toLowerCase().includes(payoutSearchQuery.toLowerCase()) ||
      w.contactHandle.toLowerCase().includes(payoutSearchQuery.toLowerCase()) ||
      w.dateEst.includes(payoutSearchQuery);

    if (!matchesSearch) return false;
    if (filterPayoutStatus === 'pending') return w.payoutStatus === 'Pending';
    if (filterPayoutStatus === 'paid') return w.payoutStatus === 'Paid';
    return true;
  });

  // Filtered Users
  const filteredUsers = usersList.filter(u => {
    const q = userSearchQuery.toLowerCase().trim();
    const matchesSearch = 
      !q ||
      u.username.toLowerCase().includes(q) ||
      u.id.toLowerCase().includes(q) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      u.contactHandle.toLowerCase().includes(q);

    if (!matchesSearch) return false;
    if (filterUserStatus !== 'all' && u.accountStatus !== filterUserStatus) return false;
    if (filterUserTier === 'paid' && !u.isAdFree) return false;
    if (filterUserTier === 'free' && u.isAdFree) return false;
    return true;
  });

  // User Chat Logs
  const getUserChatMessages = (user: AdminManagedUser) => {
    return allChatMessages.filter(
      m => m.senderId === user.id || m.username.toLowerCase() === user.username.toLowerCase()
    );
  };

  const handleSaveBalance = (userId: string) => {
    const parsed = parseInt(tempBalanceInput.replace(/,/g, ''), 10);
    if (!isNaN(parsed) && parsed >= 0 && onUpdateUserBalance) {
      sound.playChip();
      onUpdateUserBalance(userId, parsed);
    }
    setEditingBalanceUserId(null);
    setTempBalanceInput('');
  };

  const pendingCount = dailyWinners.filter(w => w.payoutStatus === 'Pending').length;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-5xl max-h-[94vh] rounded-3xl bg-zinc-950 border-2 border-purple-500/60 shadow-2xl flex flex-col relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800/80 bg-zinc-900/80 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-700 to-indigo-600 border border-purple-400/50 flex items-center justify-center text-white shadow-lg shadow-purple-900/40">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-zinc-100">
                  Admin & Moderator Portal
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-black uppercase bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  ADMIN & MOD ACCESS
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Manage accounts, grant moderator roles, search player chat logs, toggle paid vs free, adjust balances, and distribute tournament prizes.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-zinc-200 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center justify-between px-4 sm:px-6 pt-3 pb-2 bg-zinc-950 border-b border-zinc-800 gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sound.playChip();
                setActiveTab('users');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'users'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                  : 'bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>User Search & Moderation</span>
              <span className="px-1.5 py-0.2 rounded-md bg-black/40 text-[10px] font-mono">
                {usersList.length}
              </span>
            </button>

            <button
              onClick={() => {
                sound.playChip();
                setActiveTab('payouts');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'payouts'
                  ? 'bg-amber-500 text-zinc-950 shadow-lg shadow-amber-500/30 font-black'
                  : 'bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Pending Payouts</span>
              {pendingCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-md bg-red-500 text-white text-[10px] font-black animate-pulse">
                  {pendingCount}
                </span>
              )}
            </button>
          </div>

          {activeTab === 'payouts' && (
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-zinc-400" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
          )}
        </div>

        {/* TAB 1: USER SEARCH, STATUS, PAID VS FREE, & CHAT LOGS */}
        {activeTab === 'users' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {/* Search & Filter Bar */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search any user by username, email, ID, or handle..."
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-zinc-200 text-xs placeholder:text-zinc-500 focus:outline-none focus:border-purple-500"
                />
                {userSearchQuery && (
                  <button
                    onClick={() => setUserSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Status Filters */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs">
                  <span className="text-[10px] text-zinc-500 font-bold px-1.5 uppercase">Status:</span>
                  {(['all', 'active', 'moderator', 'banned', 'closed'] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        sound.playChip();
                        setFilterUserStatus(status);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold capitalize transition-all cursor-pointer ${
                        filterUserStatus === status
                          ? status === 'active'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : status === 'moderator'
                            ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                            : status === 'banned'
                            ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                            : status === 'closed'
                            ? 'bg-zinc-700 text-zinc-200'
                            : 'bg-purple-600 text-white'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {status === 'moderator' ? '🛡️ Moderator' : status}
                    </button>
                  ))}
                </div>

                {/* Tier Filters */}
                <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs">
                  <span className="text-[10px] text-zinc-500 font-bold px-1.5 uppercase">Tier:</span>
                  {(['all', 'paid', 'free'] as const).map((tier) => (
                    <button
                      key={tier}
                      onClick={() => {
                        sound.playChip();
                        setFilterUserTier(tier);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold capitalize transition-all cursor-pointer ${
                        filterUserTier === tier
                          ? tier === 'paid'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-black'
                            : 'bg-purple-600 text-white'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {tier === 'paid' ? '👑 Paid VIP' : tier === 'free' ? 'Free Tier' : 'All'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Users List */}
            {filteredUsers.length === 0 ? (
              <div className="py-12 text-center rounded-2xl bg-zinc-900/40 border border-zinc-800/60">
                <User className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                <p className="text-sm font-bold text-zinc-400">No users match your search criteria.</p>
                <button
                  onClick={() => {
                    setUserSearchQuery('');
                    setFilterUserStatus('all');
                    setFilterUserTier('all');
                  }}
                  className="mt-2 text-xs text-purple-400 hover:underline cursor-pointer"
                >
                  Reset all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {filteredUsers.map((user) => {
                  const userMessages = getUserChatMessages(user);
                  const isChatDrawerOpen = selectedUserForChat?.id === user.id;

                  return (
                    <div
                      key={user.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        user.accountStatus === 'banned'
                          ? 'bg-red-950/20 border-red-500/40'
                          : user.accountStatus === 'closed'
                          ? 'bg-zinc-900/40 border-zinc-800 opacity-75'
                          : user.isAdFree
                          ? 'bg-purple-950/20 border-purple-500/40'
                          : 'bg-zinc-900/70 border-zinc-800'
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                        {/* User Identity & Info */}
                        <div className="flex items-start sm:items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-zinc-950 border border-zinc-700 flex items-center justify-center text-2xl shadow-inner shrink-0 relative">
                            {user.avatar}
                            {user.isAdFree && (
                              <span className="absolute -top-1.5 -right-1.5 text-xs">👑</span>
                            )}
                          </div>

                          <div className="space-y-0.5">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-sm sm:text-base font-black text-zinc-100">
                                {user.username}
                              </h3>
                              
                              {/* Account Status Badge */}
                              <span className={`text-[10px] font-black uppercase px-2 py-0.2 rounded-md ${
                                user.accountStatus === 'active'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                  : user.accountStatus === 'moderator'
                                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center gap-1'
                                  : user.accountStatus === 'banned'
                                  ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                                  : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                              }`}>
                                {user.accountStatus === 'moderator' ? '🛡️ MODERATOR' : user.accountStatus}
                              </span>

                              {/* Paid vs Free Tier Badge */}
                              <span className={`text-[10px] font-black uppercase px-2 py-0.2 rounded-md ${
                                user.isAdFree
                                  ? 'bg-gradient-to-r from-purple-900/60 to-amber-950/60 text-amber-300 border border-amber-500/40'
                                  : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                              }`}>
                                {user.isAdFree ? '👑 Paid VIP (Ad-Free)' : 'Free Tier'}
                              </span>

                              {user.isCurrentUser && (
                                <span className="text-[10px] font-bold text-sky-400 bg-sky-950/60 border border-sky-500/30 px-1.5 py-0.2 rounded">
                                  You
                                </span>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-400">
                              <span className="font-mono text-zinc-500 text-[11px]">ID: {user.id}</span>
                              {user.email && (
                                <span className="text-zinc-300">{user.email}</span>
                              )}
                              <span className="flex items-center gap-1 text-zinc-300">
                                {user.contactPlatform === 'discord' ? '🎮' : '✈️'} {user.contactHandle}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Balance, Peak & Quick Stats */}
                        <div className="flex flex-wrap items-center gap-3 text-xs w-full lg:w-auto justify-between lg:justify-end">
                          <div className="p-2 rounded-xl bg-zinc-950/80 border border-zinc-800 text-left min-w-[110px]">
                            <div className="text-[10px] text-zinc-500 font-bold uppercase">Balance</div>
                            {editingBalanceUserId === user.id ? (
                              <div className="flex items-center gap-1 mt-0.5">
                                <input
                                  type="number"
                                  value={tempBalanceInput}
                                  onChange={(e) => setTempBalanceInput(e.target.value)}
                                  className="w-20 px-1.5 py-0.5 rounded bg-zinc-900 border border-amber-500 text-amber-300 font-mono text-xs font-bold"
                                  autoFocus
                                />
                                <button
                                  onClick={() => handleSaveBalance(user.id)}
                                  className="px-1.5 py-0.5 rounded bg-amber-500 text-zinc-950 text-[10px] font-black"
                                >
                                  ✓
                                </button>
                              </div>
                            ) : (
                              <div 
                                onClick={() => {
                                  setEditingBalanceUserId(user.id);
                                  setTempBalanceInput(user.balance.toString());
                                }}
                                className="font-mono font-black text-amber-300 text-sm cursor-pointer hover:underline"
                                title="Click to adjust balance as admin"
                              >
                                {user.balance.toLocaleString()} <span className="text-[9px] text-zinc-500 font-sans">CHIPS</span>
                              </div>
                            )}
                          </div>

                          <div 
                            className="p-2 rounded-xl bg-zinc-950/80 border border-zinc-800 text-left min-w-[90px] group cursor-help"
                            title={`${user.totalWagered.toLocaleString()} chips total lifetime wagered`}
                          >
                            <div className="text-[10px] text-zinc-500 font-bold uppercase">Wagered</div>
                            <div className="font-mono font-bold text-purple-300 text-xs">
                              {formatCompactWager(user.totalWagered)}
                            </div>
                          </div>

                          <div className="p-2 rounded-xl bg-zinc-950/80 border border-zinc-800 text-left min-w-[90px]">
                            <div className="text-[10px] text-zinc-500 font-bold uppercase">Peak Chips</div>
                            <div className="font-mono font-bold text-zinc-300 text-xs">
                              {user.peakBalance.toLocaleString()}
                            </div>
                          </div>

                          {/* Quick Actions Buttons */}
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {/* Toggle Status (Active / Banned / Closed) */}
                            <div className="relative group">
                              <select
                                value={user.accountStatus}
                                onChange={(e) => {
                                  sound.playChip();
                                  onUpdateUserStatus(user.id, e.target.value as AccountStatus);
                                }}
                                className="px-2.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-bold text-zinc-200 focus:outline-none cursor-pointer"
                              >
                                <option value="active">Active</option>
                                <option value="moderator">🛡️ Moderator</option>
                                <option value="banned">Banned</option>
                                <option value="closed">Closed</option>
                              </select>
                            </div>

                            {/* Toggle Paid VIP vs Free */}
                            <button
                              onClick={() => {
                                sound.playChip();
                                onUpdateUserTier(user.id, !user.isAdFree);
                              }}
                              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 border transition-all cursor-pointer ${
                                user.isAdFree
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                                  : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-zinc-200'
                              }`}
                              title="Toggle Paid Ad-Free status"
                            >
                              <Crown className="w-3.5 h-3.5 text-amber-400" />
                              <span>{user.isAdFree ? 'Paid VIP' : 'Set Paid'}</span>
                            </button>

                            {/* View Chat Logs Toggle */}
                            <button
                              onClick={() => {
                                sound.playChip();
                                setSelectedUserForChat(isChatDrawerOpen ? null : user);
                              }}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                                isChatDrawerOpen
                                  ? 'bg-purple-600 text-white border-purple-400 shadow-md'
                                  : 'bg-zinc-900 hover:bg-zinc-800 text-purple-300 border-purple-500/30 hover:border-purple-400'
                              }`}
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>Chat Logs</span>
                              <span className="px-1.5 py-0.2 rounded-md bg-purple-950 text-purple-200 text-[10px] font-mono">
                                {userMessages.length}
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Expandable Chat Logs Drawer for User */}
                      {isChatDrawerOpen && (
                        <div className="mt-3 pt-3 border-t border-zinc-800/80 animate-in fade-in slide-in-from-top-1">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2 text-xs font-bold text-purple-300">
                              <MessageSquare className="w-4 h-4 text-purple-400" />
                              <span>Chat History for @{user.username} ({userMessages.length} messages found)</span>
                            </div>
                            <span className="text-[10px] text-zinc-500 font-mono">Real-Time Moderation View</span>
                          </div>

                          {userMessages.length === 0 ? (
                            <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800 text-xs text-zinc-500 text-center italic">
                              No chat messages recorded for this user yet.
                            </div>
                          ) : (
                            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                              {userMessages.map((msg) => (
                                <div
                                  key={msg.id}
                                  className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 flex items-start justify-between gap-3 text-xs"
                                >
                                  <div className="space-y-0.5">
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-zinc-200">{msg.username}</span>
                                      <span className="text-[10px] text-zinc-500 font-mono">
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                      </span>
                                      {msg.type && msg.type !== 'chat' && (
                                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-500/30 uppercase font-bold">
                                          {msg.type}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-zinc-300">{msg.text}</p>
                                  </div>

                                  <span className="text-[10px] text-zinc-500 font-mono shrink-0">
                                    ID: {msg.id}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: TOURNAMENT WINNER PAYOUTS REGISTRY */}
        {activeTab === 'payouts' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800">
              <div className="relative flex-1 w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search winners by username, handle, or date..."
                  value={payoutSearchQuery}
                  onChange={(e) => setPayoutSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-zinc-950 border border-zinc-700 text-zinc-200 text-xs placeholder:text-zinc-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs w-full sm:w-auto justify-center">
                <button
                  onClick={() => {
                    sound.playChip();
                    setFilterPayoutStatus('pending');
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    filterPayoutStatus === 'pending'
                      ? 'bg-amber-500 text-zinc-950 font-black shadow-md'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Pending ({dailyWinners.filter(w => w.payoutStatus === 'Pending').length})
                </button>
                <button
                  onClick={() => {
                    sound.playChip();
                    setFilterPayoutStatus('paid');
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    filterPayoutStatus === 'paid'
                      ? 'bg-emerald-600 text-white font-black shadow-md'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Paid Archive
                </button>
                <button
                  onClick={() => {
                    sound.playChip();
                    setFilterPayoutStatus('all');
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    filterPayoutStatus === 'all'
                      ? 'bg-purple-600 text-white font-black shadow-md'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  All ({dailyWinners.length})
                </button>
              </div>
            </div>

            {/* Winners Records */}
            {filteredWinners.length === 0 ? (
              <div className="py-12 text-center rounded-2xl bg-zinc-900/40 border border-zinc-800/60">
                <Award className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                <p className="text-sm font-bold text-zinc-400">No payout records found for this filter.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredWinners.map((winner) => (
                  <div
                    key={winner.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      winner.payoutStatus === 'Pending'
                        ? 'bg-amber-950/15 border-amber-500/40 shadow-lg shadow-amber-950/20'
                        : 'bg-zinc-900/60 border-zinc-800/80'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-zinc-950 border border-zinc-700 flex items-center justify-center text-xl shadow-inner shrink-0">
                          {winner.avatar}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-zinc-100 text-sm">{winner.username}</span>
                            <span className={`text-[10px] px-2 py-0.2 rounded-full font-black uppercase ${
                              winner.payoutStatus === 'Pending'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            }`}>
                              {winner.payoutStatus}
                            </span>
                          </div>
                          <div className="text-xs text-zinc-400 flex items-center gap-2 mt-0.5">
                            <span>{winner.formattedDate}</span>
                            <span>•</span>
                            <span className="font-mono text-amber-300 font-bold">{winner.formattedScore}</span>
                          </div>
                        </div>
                      </div>

                      {/* Contact Handle Copy & Status Change */}
                      <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                        <button
                          onClick={() => handleCopyHandle(winner.contactHandle, winner.id)}
                          className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          {copiedId === winner.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-zinc-400" />
                              <span>{winner.contactPlatform === 'discord' ? 'Discord' : 'Telegram'}: {winner.contactHandle}</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => {
                            sound.playChip();
                            const newStatus = winner.payoutStatus === 'Pending' ? 'Paid' : 'Pending';
                            onUpdateWinner(winner.id, { 
                              payoutStatus: newStatus,
                              paidAt: newStatus === 'Paid' ? Date.now() : undefined 
                            });
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                            winner.payoutStatus === 'Pending'
                              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                              : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400'
                          }`}
                        >
                          {winner.payoutStatus === 'Pending' ? 'Mark Paid' : 'Revert to Pending'}
                        </button>
                      </div>
                    </div>

                    {/* Note editor */}
                    <div className="mt-3 pt-2.5 border-t border-zinc-800/60 text-xs flex items-center justify-between gap-2">
                      {editingId === winner.id ? (
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="text"
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            placeholder="Add payout transaction note or ticket link..."
                            className="flex-1 px-3 py-1 rounded-xl bg-zinc-950 border border-purple-500 text-zinc-200 text-xs focus:outline-none"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveNote(winner.id)}
                            className="px-3 py-1 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-2 py-1 rounded-xl bg-zinc-800 text-zinc-400 text-xs"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between w-full text-zinc-400">
                          <span className="italic">
                            {winner.payoutNote ? `Note: "${winner.payoutNote}"` : 'No payout note added.'}
                          </span>
                          <button
                            onClick={() => {
                              sound.playChip();
                              setEditingId(winner.id);
                              setNoteText(winner.payoutNote || '');
                            }}
                            className="text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Edit Note</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
