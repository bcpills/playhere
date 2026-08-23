import React, { useState } from 'react';
import { DailyWinnerRecord, ContactPlatform, PlayerProfileData } from '../types';
import { sound } from '../utils/audio';
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
  AlertCircle
} from 'lucide-react';

interface ModeratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  dailyWinners: DailyWinnerRecord[];
  onUpdateWinner: (winnerId: string, updates: Partial<DailyWinnerRecord>) => void;
  onInspectPlayer?: (player: PlayerProfileData) => void;
}

export const ModeratorModal: React.FC<ModeratorModalProps> = ({
  isOpen,
  onClose,
  dailyWinners,
  onUpdateWinner,
  onInspectPlayer,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<'pending' | 'paid' | 'all'>('pending');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState<string>('');

  if (!isOpen) return null;

  const handleCopyHandle = (winner: DailyWinnerRecord) => {
    sound.playChip();
    navigator.clipboard.writeText(winner.contactHandle);
    setCopiedId(winner.id);
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
    link.setAttribute('download', `casino_pending_payouts_log_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const pendingWinners = dailyWinners.filter(w => w.payoutStatus === 'Pending');
  const paidWinners = dailyWinners.filter(w => w.payoutStatus === 'Paid');

  const filteredWinners = dailyWinners.filter(w => {
    const matchesSearch = 
      w.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.contactHandle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.dateEst.includes(searchQuery);

    if (!matchesSearch) return false;
    if (filterStatus === 'pending') return w.payoutStatus === 'Pending';
    if (filterStatus === 'paid') return w.payoutStatus === 'Paid';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-4xl max-h-[92vh] rounded-3xl bg-zinc-950 border-2 border-purple-500/60 shadow-2xl flex flex-col relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800/80 bg-zinc-900/70 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-950 border border-purple-500/50 flex items-center justify-center text-purple-400 shadow-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-zinc-100">
                  Pending Payouts & Winner Registry
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-black uppercase bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  ADMIN ONLY
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Thomas Joe Administrator Portal: review unpaid daily winners and confirm manual prize distributions.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-zinc-400" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-zinc-200 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stats & Filter Bar */}
        <div className="p-3 sm:p-4 bg-zinc-900/40 border-b border-zinc-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <button
              onClick={() => {
                sound.playChip();
                setFilterStatus('pending');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase flex items-center gap-1.5 transition-all cursor-pointer ${
                filterStatus === 'pending'
                  ? 'bg-amber-500 text-zinc-950 shadow-md font-black'
                  : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Unpaid ({pendingWinners.length})</span>
            </button>

            <button
              onClick={() => {
                sound.playChip();
                setFilterStatus('paid');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase flex items-center gap-1.5 transition-all cursor-pointer ${
                filterStatus === 'paid'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Paid ({paidWinners.length})</span>
            </button>

            <button
              onClick={() => {
                sound.playChip();
                setFilterStatus('all');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase flex items-center gap-1.5 transition-all cursor-pointer ${
                filterStatus === 'all'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
              }`}
            >
              <span>All ({dailyWinners.length})</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search winners or handles..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-purple-400"
            />
          </div>
        </div>

        {/* Winners List / Table */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredWinners.length === 0 ? (
            <div className="text-center py-16 space-y-2">
              <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-sm font-bold text-zinc-300">
                {filterStatus === 'pending' ? 'No Unpaid Payouts Pending!' : 'No records found.'}
              </h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                {filterStatus === 'pending'
                  ? 'All crowned tournament champions have been verified and marked as paid.'
                  : 'Try adjusting your search filter above.'}
              </p>
            </div>
          ) : (
            filteredWinners.map((winner) => (
              <div
                key={winner.id}
                className={`p-4 rounded-2xl border transition-all ${
                  winner.payoutStatus === 'Pending'
                    ? 'bg-amber-950/20 border-amber-500/50 shadow-lg'
                    : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                  {/* Winner Profile & Date */}
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        if (onInspectPlayer) {
                          sound.playChip();
                          onInspectPlayer({
                            id: winner.id,
                            username: winner.username,
                            avatar: winner.avatar,
                            vipTier: winner.vipTier,
                            contactPlatform: winner.contactPlatform,
                            contactHandle: winner.contactHandle,
                            balance: winner.winningChips,
                          });
                        }
                      }}
                      title="Inspect Player Profile & Reset Balance"
                      className="text-3xl shrink-0 hover:scale-110 transition-transform cursor-pointer"
                    >
                      {winner.avatar}
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (onInspectPlayer) {
                              sound.playChip();
                              onInspectPlayer({
                                id: winner.id,
                                username: winner.username,
                                avatar: winner.avatar,
                                vipTier: winner.vipTier,
                                contactPlatform: winner.contactPlatform,
                                contactHandle: winner.contactHandle,
                                balance: winner.winningChips,
                              });
                            }
                          }}
                          className="text-sm font-black text-zinc-100 hover:text-amber-400 transition-colors text-left cursor-pointer"
                        >
                          {winner.username}
                        </button>

                        <span className="text-[10px] px-2 py-0.2 rounded-full font-bold uppercase bg-zinc-800 text-zinc-300">
                          {winner.dateEst}
                        </span>
                        <span className="text-[10px] text-amber-400 font-bold">
                          {winner.vipTier}
                        </span>
                      </div>

                      {/* Contact Info (Discord / Telegram) */}
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md flex items-center gap-1 ${
                          winner.contactPlatform === 'discord'
                            ? 'bg-[#5865F2]/20 text-indigo-300 border border-[#5865F2]/40'
                            : 'bg-[#229ED9]/20 text-sky-300 border border-[#229ED9]/40'
                        }`}>
                          {winner.contactPlatform === 'discord' ? <MessageSquare className="w-3 h-3" /> : <Send className="w-3 h-3" />}
                          <span>{winner.contactPlatform}</span>
                        </span>

                        <span className="text-xs font-mono font-bold text-zinc-200">
                          {winner.contactHandle}
                        </span>

                        <button
                          onClick={() => handleCopyHandle(winner)}
                          title="Copy Contact Handle"
                          className="p-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                        >
                          {copiedId === winner.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Winning Score & Payout Status Buttons */}
                  <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                    <div className="text-left md:text-right">
                      <span className="text-[10px] uppercase font-bold text-zinc-500 block">Winning Height</span>
                      <span className="text-base font-black font-mono text-amber-300">
                        {winner.formattedScore}
                      </span>
                    </div>

                    {/* Status Action: Mark as Paid / Pending */}
                    <button
                      onClick={() => {
                        sound.playProfit();
                        const isNowPaid = winner.payoutStatus !== 'Paid';
                        onUpdateWinner(winner.id, { 
                          payoutStatus: isNowPaid ? 'Paid' : 'Pending',
                          paidAt: isNowPaid ? Date.now() : undefined,
                          payoutNote: isNowPaid 
                            ? (winner.payoutNote || 'Marked as paid by Admin Thomas Joe') 
                            : winner.payoutNote
                        });
                      }}
                      className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-1.5 shadow-md cursor-pointer ${
                        winner.payoutStatus === 'Paid'
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                          : 'bg-amber-500 hover:bg-yellow-400 text-zinc-950'
                      }`}
                    >
                      {winner.payoutStatus === 'Paid' ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-white" />
                          <span>Marked Paid</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-4 h-4 text-zinc-950" />
                          <span>Mark as Paid</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Payout Note Field */}
                <div className="mt-3 pt-2.5 border-t border-zinc-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                  {editingId === winner.id ? (
                    <div className="w-full flex items-center gap-2">
                      <input
                        type="text"
                        value={noteText}
                        onChange={e => setNoteText(e.target.value)}
                        placeholder="Add payout reference note / tx hash..."
                        className="flex-1 px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-700 text-xs text-zinc-200 focus:outline-none focus:border-purple-400"
                      />
                      <button
                        onClick={() => handleSaveNote(winner.id)}
                        className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs cursor-pointer"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-2.5 py-1.5 rounded-lg bg-zinc-800 text-zinc-400 text-xs cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="text-zinc-400 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                        <span>
                          {winner.payoutNote ? (
                            <span className="text-zinc-300 font-mono text-[11px]">{winner.payoutNote}</span>
                          ) : (
                            <span className="text-zinc-600 italic">No transaction note added yet</span>
                          )}
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          setEditingId(winner.id);
                          setNoteText(winner.payoutNote || '');
                        }}
                        className="text-[11px] font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>{winner.payoutNote ? 'Edit Note' : 'Add Tx Note'}</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:px-4 bg-zinc-900/60 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400 shrink-0">
          <span className="text-[11px]">
            Unpaid Winners: <strong className="text-amber-400 font-mono">{pendingWinners.length}</strong> | Paid: <strong className="text-emerald-400 font-mono">{paidWinners.length}</strong>
          </span>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition-colors cursor-pointer"
          >
            Close Portal
          </button>
        </div>
      </div>
    </div>
  );
};
