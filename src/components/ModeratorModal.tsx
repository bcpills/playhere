import React, { useState, useEffect } from 'react';
import { 
  AdminManagedUser, 
  UserAccount, 
  DailyWinnerRecord, 
  AccountStatus, 
  AccountType,
  UserRole,
  PayoutRequest,
  BalanceAdjustmentLog,
  DepositTransaction
} from '../types';
import { 
  getAdminUserDirectory, 
  updateUserInAdminDirectory, 
  saveAdminUserDirectory 
} from '../utils/adminUsers';
import { isUserAdmin, isUserModerator, getVIPTier, getVIPTierInfo, formatCompactWager } from '../utils/leaderboard';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import { 
  ShieldCheck, 
  X, 
  Search, 
  UserCheck, 
  Ban, 
  Coins, 
  Trophy, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  UserX, 
  RotateCcw, 
  DollarSign, 
  Save, 
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  FileText,
  Lock,
  Eye,
  CreditCard,
  Building2,
  QrCode,
  Shield,
  Activity,
  Plus,
  Minus
} from 'lucide-react';

interface ModeratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount;
  currentBalance: number;
  totalWagered: number;
  dailyWinners: DailyWinnerRecord[];
  onUpdateDailyWinnerStatus: (winnerId: string, status: 'Pending' | 'Paid' | 'Processing', note?: string) => void;
  onAdminAdjustBalance: (userId: string, username: string, deltaAmount: number, reason: string) => void;
  payoutRequests: PayoutRequest[];
  onUpdatePayoutRequest: (requestId: string, status: 'Pending' | 'Processing' | 'Paid' | 'Rejected', adminNote?: string) => void;
  balanceAdjustments: BalanceAdjustmentLog[];
  depositHistory: DepositTransaction[];
  onUpdateUserAccount?: (updater: (prev: UserAccount) => UserAccount) => void;
}

type ModTab = 'payouts' | 'balances' | 'users' | 'ledger';

export const ModeratorModal: React.FC<ModeratorModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  currentBalance,
  totalWagered,
  dailyWinners,
  onUpdateDailyWinnerStatus,
  onAdminAdjustBalance,
  payoutRequests,
  onUpdatePayoutRequest,
  balanceAdjustments,
  depositHistory,
  onUpdateUserAccount,
}) => {
  const [activeTab, setActiveTab] = useState<ModTab>('payouts');
  const [userList, setUserList] = useState<AdminManagedUser[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<AdminManagedUser | null>(null);

  // Balance Adjustment Form State
  const [adjustmentType, setAdjustmentType] = useState<'add' | 'deduct' | 'set'>('add');
  const [adjustAmount, setAdjustAmount] = useState<number>(5000);
  const [adjustReason, setAdjustReason] = useState<string>('Promotional Deposit Bonus');
  const [adjustSuccessMsg, setAdjustSuccessMsg] = useState<string | null>(null);

  // Payout Approval Note
  const [rejectionNote, setRejectionNote] = useState<string>('');
  const [rejectingReqId, setRejectingReqId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const users = getAdminUserDirectory(currentUser, currentBalance, totalWagered);
      setUserList(users);
      if (!selectedUser && users.length > 0) {
        setSelectedUser(users[0]);
      }
    }
  }, [isOpen, currentUser, currentBalance, totalWagered]);

  if (!isOpen) return null;

  const isAdmin = isUserAdmin(currentUser);
  const isMod = isUserModerator(currentUser);

  const filteredUsers = userList.filter(u => 
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Handle Balance Adjustment
  const handleExecuteBalanceAdjustment = () => {
    if (!selectedUser) return;
    if (adjustAmount <= 0) {
      alert('Please enter a valid chip amount.');
      return;
    }

    sound.playWin();
    confetti({ particleCount: 50, spread: 45, origin: { y: 0.6 } });

    let delta = adjustAmount;
    if (adjustmentType === 'deduct') {
      delta = -adjustAmount;
    } else if (adjustmentType === 'set') {
      delta = adjustAmount - selectedUser.balance;
    }

    onAdminAdjustBalance(selectedUser.id, selectedUser.username, delta, adjustReason);

    // Update local list
    const updatedUsers = updateUserInAdminDirectory(selectedUser.id, {
      balance: Math.max(0, selectedUser.balance + delta),
    });
    setUserList(updatedUsers);
    
    const refreshed = updatedUsers.find(u => u.id === selectedUser.id);
    if (refreshed) setSelectedUser(refreshed);

    setAdjustSuccessMsg(`Successfully updated ${selectedUser.username}'s balance (${delta >= 0 ? '+' : ''}${delta.toLocaleString()} chips)!`);
    setTimeout(() => setAdjustSuccessMsg(null), 4000);
  };

  // Handle Payout Status Update
  const handleApprovePayout = (req: PayoutRequest) => {
    sound.playProfit();
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    const txHash = '0x' + Array.from({length: 32}, () => Math.floor(Math.random()*16).toString(16)).join('');
    onUpdatePayoutRequest(req.id, 'Paid', `Approved by Admin ${currentUser.username || 'Thomas J'}. Wire Reference: ${txHash.slice(0, 16)}`);
  };

  const handleMarkProcessing = (req: PayoutRequest) => {
    sound.playChip();
    onUpdatePayoutRequest(req.id, 'Processing', `In queue with banking partner. Reviewed by ${currentUser.username || 'Mod'}.`);
  };

  const handleRejectPayout = (reqId: string) => {
    sound.playLose();
    const reason = rejectionNote.trim() || 'Account verification required. Chips refunded to bankroll.';
    onUpdatePayoutRequest(reqId, 'Rejected', reason);
    setRejectingReqId(null);
    setRejectionNote('');
  };

  // Handle Role / Status Changes
  const handleUpdateUserStatus = (userId: string, newStatus: AccountStatus) => {
    sound.playChip();
    const updated = updateUserInAdminDirectory(userId, { accountStatus: newStatus });
    setUserList(updated);
    if (selectedUser?.id === userId) {
      setSelectedUser(prev => prev ? { ...prev, accountStatus: newStatus } : null);
    }
  };

  const handleUpdateUserRole = (userId: string, newRole: UserRole) => {
    sound.playChip();
    const updated = updateUserInAdminDirectory(userId, { userRole: newRole });
    setUserList(updated);
    if (selectedUser?.id === userId) {
      setSelectedUser(prev => prev ? { ...prev, userRole: newRole } : null);
    }
    if (userId === currentUser.id && onUpdateUserAccount) {
      onUpdateUserAccount(prev => ({ ...prev, userRole: newRole }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-5xl max-h-[94vh] rounded-3xl bg-zinc-950 border-2 border-amber-500/60 shadow-2xl flex flex-col relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Bar Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800/80 bg-zinc-900/90 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 border border-amber-300/60 flex items-center justify-center text-zinc-950 shadow-lg shadow-amber-500/30 font-black">
              <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-zinc-100">
                  Admin & Moderator Command Center
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {currentUser.userRole?.toUpperCase() || 'ADMIN'} ACCESS
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Real-money payout authorizations, instant player balance adjustments, and financial ledgers.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-zinc-200 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigators */}
        <div className="flex items-center px-4 sm:px-6 pt-3 pb-2 bg-zinc-950 border-b border-zinc-800 gap-2 shrink-0 overflow-x-auto">
          <button
            onClick={() => {
              sound.playChip();
              setActiveTab('payouts');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'payouts'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-zinc-950 font-black shadow-lg shadow-amber-500/20'
                : 'bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Payout Approvals ({payoutRequests.filter(r => r.status === 'Pending' || r.status === 'Processing').length} Pending)</span>
          </button>

          <button
            onClick={() => {
              sound.playChip();
              setActiveTab('balances');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'balances'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-zinc-950 font-black shadow-lg shadow-emerald-500/20'
                : 'bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
            }`}
          >
            <Coins className="w-4 h-4" />
            <span>Balance Adjuster & Mod Tools</span>
          </button>

          <button
            onClick={() => {
              sound.playChip();
              setActiveTab('users');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'users'
                ? 'bg-sky-500 text-zinc-950 font-black shadow-lg shadow-sky-500/20'
                : 'bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>User Accounts Directory ({userList.length})</span>
          </button>

          <button
            onClick={() => {
              sound.playChip();
              setActiveTab('ledger');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'ledger'
                ? 'bg-purple-600 text-white font-black shadow-lg shadow-purple-600/30'
                : 'bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Financial Audit Ledger</span>
          </button>
        </div>

        {/* TAB 1: PAYOUT APPROVALS */}
        {activeTab === 'payouts' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-white">
                  Real Money Cashout Requests & Approvals
                </h3>
                <p className="text-xs text-zinc-400">
                  Review withdrawal requests from players. Approve and execute payouts or reject and auto-refund chips.
                </p>
              </div>

              <span className="text-xs font-mono font-bold text-amber-400 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30">
                Rate: $1.00 USD = 100 Chips
              </span>
            </div>

            {payoutRequests.length === 0 ? (
              <div className="p-8 rounded-3xl bg-zinc-900/40 border border-zinc-800 text-center space-y-2">
                <DollarSign className="w-10 h-10 text-zinc-600 mx-auto" />
                <span className="text-xs text-zinc-400 block font-bold">No real-money payout requests in queue.</span>
                <span className="text-[11px] text-zinc-600 block">Players can request cashouts via the Real Money Cashier modal.</span>
              </div>
            ) : (
              <div className="space-y-3">
                {payoutRequests.map(req => (
                  <div
                    key={req.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      req.status === 'Pending'
                        ? 'bg-gradient-to-r from-amber-950/30 via-zinc-900 to-zinc-900 border-amber-500/60 shadow-lg'
                        : req.status === 'Processing'
                        ? 'bg-zinc-900/90 border-blue-500/50'
                        : req.status === 'Paid'
                        ? 'bg-zinc-900/60 border-emerald-500/40 opacity-80'
                        : 'bg-zinc-900/60 border-rose-500/40 opacity-70'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xl shrink-0">
                          {req.avatar || '👑'}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-white">{req.username}</span>
                            <span className="text-base font-black font-mono text-emerald-400">
                              ${req.usdAmount}.00 USD
                            </span>
                            <span className="text-xs font-mono text-zinc-400">
                              ({req.chipsAmount.toLocaleString()} chips)
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase font-mono ${
                              req.status === 'Paid'
                                ? 'bg-emerald-500 text-zinc-950'
                                : req.status === 'Processing'
                                ? 'bg-blue-500 text-white'
                                : req.status === 'Rejected'
                                ? 'bg-rose-500 text-white'
                                : 'bg-amber-500 text-zinc-950'
                            }`}>
                              {req.status}
                            </span>
                          </div>

                          <div className="text-xs text-zinc-300 mt-1 flex items-center gap-2">
                            <span className="uppercase font-bold text-amber-400 text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30">
                              {req.method}
                            </span>
                            <span className="font-mono text-zinc-300">{req.destination}</span>
                          </div>

                          {req.adminNote && (
                            <div className="text-[11px] text-zinc-400 mt-1 italic">
                              Note: {req.adminNote}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Controls for Admin/Mod */}
                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-800">
                        {req.status !== 'Paid' && req.status !== 'Rejected' && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleApprovePayout(req)}
                              className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 transition-all cursor-pointer flex items-center gap-1.5 active:scale-98"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Approve & Pay</span>
                            </button>

                            {req.status === 'Pending' && (
                              <button
                                type="button"
                                onClick={() => handleMarkProcessing(req)}
                                className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1"
                              >
                                <Clock className="w-3.5 h-3.5" />
                                <span>Processing</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => setRejectingReqId(req.id)}
                              className="px-3 py-2 rounded-xl bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-700/60 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1"
                            >
                              <Ban className="w-3.5 h-3.5" />
                              <span>Reject & Refund</span>
                            </button>
                          </>
                        )}

                        {req.status === 'Paid' && (
                          <div className="text-right text-[10px] font-mono text-emerald-400 font-bold">
                            ✓ Paid Out & Confirmed
                          </div>
                        )}
                        {req.status === 'Rejected' && (
                          <div className="text-right text-[10px] font-mono text-rose-400 font-bold">
                            ✕ Rejected & Refunded
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Rejection Note input drawer */}
                    {rejectingReqId === req.id && (
                      <div className="mt-3 p-3 rounded-xl bg-zinc-950 border border-rose-500/50 space-y-2 animate-in fade-in">
                        <label className="text-[10px] uppercase font-bold text-rose-300 block">
                          Reason for Rejection (Chips will be immediately returned to {req.username}'s bankroll):
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={rejectionNote}
                            onChange={e => setRejectionNote(e.target.value)}
                            placeholder="e.g. Account verification required / Incorrect account number"
                            className="flex-1 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-white focus:outline-none focus:border-rose-500"
                          />
                          <button
                            type="button"
                            onClick={() => handleRejectPayout(req.id)}
                            className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-black text-xs uppercase tracking-wider cursor-pointer"
                          >
                            Confirm Reject
                          </button>
                          <button
                            type="button"
                            onClick={() => setRejectingReqId(null)}
                            className="px-2 py-1.5 rounded-lg bg-zinc-800 text-zinc-400 text-xs cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Daily Tournament Winners Section */}
            <div className="pt-4 border-t border-zinc-800">
              <h4 className="text-xs font-black uppercase text-amber-300 mb-2">
                Daily Tournament Payout Records ({dailyWinners.length})
              </h4>
              <div className="space-y-2">
                {dailyWinners.map(win => (
                  <div
                    key={win.id}
                    className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span>{win.avatar}</span>
                      <span className="font-bold text-white">{win.username}</span>
                      <span className="text-amber-300 font-mono font-bold">({win.formattedScore})</span>
                      <span className="text-[10px] text-zinc-500">{win.formattedDate}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] px-2 py-0.5 rounded font-black uppercase ${
                        win.payoutStatus === 'Paid'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}>
                        {win.payoutStatus}
                      </span>
                      {win.payoutStatus !== 'Paid' && (
                        <button
                          type="button"
                          onClick={() => {
                            sound.playProfit();
                            onUpdateDailyWinnerStatus(win.id, 'Paid', 'Manual admin approval');
                          }}
                          className="px-2 py-1 rounded-lg bg-emerald-500 text-zinc-950 font-black text-[10px] uppercase cursor-pointer"
                        >
                          Mark Paid
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: BALANCE ADJUSTER & MOD TOOLS */}
        {activeTab === 'balances' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            
            {adjustSuccessMsg && (
              <div className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 text-xs font-bold flex items-center gap-2.5 animate-in fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>{adjustSuccessMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Left Column: Select Player */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase text-zinc-300 block">
                  1. Select Player to Manage
                </label>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search player username..."
                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1.5 max-h-[360px] overflow-y-auto pr-1">
                  {filteredUsers.map(user => {
                    const isSelected = selectedUser?.id === user.id;
                    return (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => {
                          sound.playChip();
                          setSelectedUser(user);
                        }}
                        className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500/20 border-amber-500 text-white font-bold ring-1 ring-amber-500/30'
                            : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">{user.avatar}</span>
                          <div>
                            <span className="text-xs block leading-tight">{user.username}</span>
                            <span className="text-[10px] text-zinc-500 font-mono block">
                              {user.vipTier} • {user.userRole || 'player'}
                            </span>
                          </div>
                        </div>

                        <div className="text-right font-mono text-xs">
                          <span className="text-amber-300 font-bold">{user.balance.toLocaleString()}c</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right 2 Columns: Player Profile & Balance Adjustment Controls */}
              {selectedUser ? (
                <div className="md:col-span-2 space-y-4">
                  
                  {/* Selected Player Card */}
                  <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-zinc-800 border border-amber-400/40 flex items-center justify-center text-3xl">
                        {selectedUser.avatar}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-black text-white">{selectedUser.username}</h3>
                          {selectedUser.isCurrentUser && (
                            <span className="px-1.5 py-0.2 rounded text-[8px] font-black uppercase bg-amber-500 text-zinc-950">
                              YOU
                            </span>
                          )}
                          <span className="px-2 py-0.2 rounded-full text-[9px] font-black uppercase bg-zinc-800 text-zinc-300 border border-zinc-700">
                            {selectedUser.userRole || 'player'}
                          </span>
                        </div>

                        <div className="text-xs text-zinc-400 mt-0.5">
                          VIP Tier: <strong className="text-amber-300">{selectedUser.vipTier}</strong> • Total Wagered: <span className="font-mono">{formatCompactWager(selectedUser.totalWagered)}c</span>
                        </div>

                        <div className="text-xs text-zinc-400 mt-0.5 font-mono">
                          Current Bankroll: <strong className="text-emerald-400 text-sm">{selectedUser.balance.toLocaleString()} Chips</strong> (${(Math.floor(selectedUser.balance / 100)).toLocaleString()}.00 USD)
                        </div>
                      </div>
                    </div>

                    {/* Fast Role / Status Toggle */}
                    <div className="flex flex-col gap-1.5 w-full sm:w-auto">
                      <div className="flex items-center gap-1">
                        {(['player', 'moderator', 'admin'] as UserRole[]).map(role => (
                          <button
                            key={role}
                            type="button"
                            onClick={() => handleUpdateUserRole(selectedUser.id, role)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition-all cursor-pointer ${
                              (selectedUser.userRole || 'player') === role
                                ? 'bg-amber-500 text-zinc-950 font-black'
                                : 'bg-zinc-800 text-zinc-400 hover:text-white'
                            }`}
                          >
                            {role}
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center gap-1">
                        {(['active', 'banned'] as AccountStatus[]).map(status => (
                          <button
                            key={status}
                            type="button"
                            onClick={() => handleUpdateUserStatus(selectedUser.id, status)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition-all cursor-pointer ${
                              selectedUser.accountStatus === status
                                ? status === 'banned' ? 'bg-rose-600 text-white font-black' : 'bg-emerald-600 text-white font-black'
                                : 'bg-zinc-800 text-zinc-400 hover:text-white'
                            }`}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Balance Adjustment Action Box */}
                  <div className="p-4 rounded-2xl bg-zinc-900/90 border border-amber-500/40 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                        <Coins className="w-4 h-4" />
                        <span>Execute Balance Modification</span>
                      </h4>

                      {/* Operation Selector */}
                      <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
                        <button
                          type="button"
                          onClick={() => setAdjustmentType('add')}
                          className={`px-3 py-1 rounded-lg text-xs font-black uppercase flex items-center gap-1 transition-all cursor-pointer ${
                            adjustmentType === 'add'
                              ? 'bg-emerald-500 text-zinc-950'
                              : 'text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add (+)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setAdjustmentType('deduct')}
                          className={`px-3 py-1 rounded-lg text-xs font-black uppercase flex items-center gap-1 transition-all cursor-pointer ${
                            adjustmentType === 'deduct'
                              ? 'bg-rose-500 text-white'
                              : 'text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          <Minus className="w-3.5 h-3.5" />
                          <span>Deduct (-)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setAdjustmentType('set')}
                          className={`px-3 py-1 rounded-lg text-xs font-black uppercase flex items-center gap-1 transition-all cursor-pointer ${
                            adjustmentType === 'set'
                              ? 'bg-amber-500 text-zinc-950'
                              : 'text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>Set Exact</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">
                          Chip Amount
                        </label>
                        <input
                          type="number"
                          min={1}
                          step={1000}
                          value={adjustAmount}
                          onChange={e => setAdjustAmount(Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-white font-mono font-black text-sm focus:outline-none focus:border-amber-500"
                        />
                        <div className="flex items-center gap-1 mt-1.5">
                          {[1000, 5000, 25000, 100000].map(amt => (
                            <button
                              key={amt}
                              type="button"
                              onClick={() => setAdjustAmount(amt)}
                              className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-amber-300 text-[10px] font-mono font-bold cursor-pointer"
                            >
                              +{formatCompactWager(amt)}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">
                          Audit Log Reason
                        </label>
                        <select
                          value={adjustReason}
                          onChange={e => setAdjustReason(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-white text-xs focus:outline-none focus:border-amber-500"
                        >
                          <option value="Promotional Deposit Bonus">Promotional Deposit Bonus</option>
                          <option value="VIP Cashout Compensation">VIP Cashout Compensation</option>
                          <option value="Manual Balance Correction">Manual Balance Correction</option>
                          <option value="Tournament Prize Credited">Tournament Prize Credited</option>
                          <option value="Administrative Bankroll Reset">Administrative Bankroll Reset</option>
                          <option value="Security Reversal">Security Reversal</option>
                        </select>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-zinc-800 flex items-center justify-between">
                      <span className="text-xs text-zinc-400 font-mono">
                        New Balance will be:{' '}
                        <strong className="text-white text-sm">
                          {(
                            adjustmentType === 'add'
                              ? selectedUser.balance + adjustAmount
                              : adjustmentType === 'deduct'
                              ? Math.max(0, selectedUser.balance - adjustAmount)
                              : adjustAmount
                          ).toLocaleString()} Chips
                        </strong>
                      </span>

                      <button
                        type="button"
                        onClick={handleExecuteBalanceAdjustment}
                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-zinc-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all cursor-pointer active:scale-98 flex items-center gap-1.5"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Apply Balance Modification</span>
                      </button>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="md:col-span-2 p-8 rounded-2xl bg-zinc-900/40 border border-zinc-800 text-center text-zinc-500 text-xs">
                  Select a player from the directory to adjust balance or manage credentials.
                </div>
              )}

            </div>

          </div>
        )}

        {/* TAB 3: USER ACCOUNTS DIRECTORY */}
        {activeTab === 'users' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black uppercase tracking-wider text-white">
                Player Directory & VIP Standings ({userList.length})
              </h3>
              <span className="text-xs text-zinc-500 font-mono">Real-time local state store</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {userList.map(u => (
                <div
                  key={u.id}
                  className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{u.avatar}</span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black text-white">{u.username}</span>
                          {u.isCurrentUser && (
                            <span className="px-1.5 py-0.2 rounded text-[8px] font-black uppercase bg-amber-500 text-zinc-950">
                              YOU
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-zinc-500 block font-mono">
                          {u.email || 'No email linked'}
                        </span>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase font-mono ${
                      u.accountStatus === 'banned'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    }`}>
                      {u.accountStatus}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-zinc-800/80 grid grid-cols-2 gap-1 text-[10px] font-mono text-zinc-400">
                    <div>
                      <span>Role: </span>
                      <strong className="text-amber-300 uppercase">{u.userRole || 'player'}</strong>
                    </div>
                    <div>
                      <span>VIP: </span>
                      <strong className="text-zinc-200">{u.vipTier}</strong>
                    </div>
                    <div>
                      <span>Balance: </span>
                      <strong className="text-emerald-400">{u.balance.toLocaleString()}c</strong>
                    </div>
                    <div>
                      <span>Wagered: </span>
                      <strong className="text-zinc-300">{formatCompactWager(u.totalWagered)}c</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: FINANCIAL AUDIT LEDGER */}
        {activeTab === 'ledger' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-white mb-1">
                Financial Audit & Balance Adjustment Log
              </h3>
              <p className="text-xs text-zinc-400">
                Transparent administrative record of all balance modifications, real money deposits, and payout disbursements.
              </p>
            </div>

            {balanceAdjustments.length === 0 ? (
              <div className="p-8 rounded-2xl bg-zinc-900/40 border border-zinc-800 text-center text-xs text-zinc-500">
                No balance adjustments recorded in this session yet.
              </div>
            ) : (
              <div className="space-y-2">
                {balanceAdjustments.map(log => (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold font-mono ${
                        log.amountChanged >= 0
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      }`}>
                        {log.amountChanged >= 0 ? '+' : '-'}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{log.username}</span>
                          <span className={`font-mono font-black ${
                            log.amountChanged >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}>
                            {log.amountChanged >= 0 ? '+' : ''}{log.amountChanged.toLocaleString()} Chips
                          </span>
                          <span className="text-[10px] text-zinc-500 font-mono">
                            ({log.previousBalance.toLocaleString()}c → {log.newBalance.toLocaleString()}c)
                          </span>
                        </div>

                        <div className="text-[11px] text-zinc-400 mt-0.5">
                          Reason: <strong className="text-zinc-200">{log.reason}</strong> • By: <span className="text-amber-300">{log.adjustedBy}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right text-[10px] font-mono text-zinc-500">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
