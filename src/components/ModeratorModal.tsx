import React, { useState } from 'react';
import { DailyWinnerRecord, ContactPlatform } from '../types';
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
  Edit3
} from 'lucide-react';

interface ModeratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  dailyWinners: DailyWinnerRecord[];
  onUpdateWinner: (winnerId: string, updates: Partial<DailyWinnerRecord>) => void;
}

export const ModeratorModal: React.FC<ModeratorModalProps> = ({
  isOpen,
  onClose,
  dailyWinners,
  onUpdateWinner,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
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
    link.setAttribute('download', `casino_winners_payout_log_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredWinners = dailyWinners.filter(w => 
    w.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.contactHandle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.dateEst.includes(searchQuery)
  );

  const pendingCount = dailyWinners.filter(w => w.payoutStatus === 'Pending').length;
  const paidCount = dailyWinners.filter(w => w.payoutStatus === 'Paid').length;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-4xl max-h-[92vh] rounded-3xl bg-zinc-950 border-2 border-purple-500/50 shadow-2xl flex flex-col relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800/80 bg-zinc-900/60 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-950 border border-purple-500/50 flex items-center justify-center text-purple-400 shadow-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-zinc-100">
                  Owner & Moderator Payout Log
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-black uppercase bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  ADMIN PORTAL
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Daily 12:00 AM EST crowned tournament champions & manual contact registry.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-zinc-400" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-zinc-200 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Stats Summary */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 p-4 bg-zinc-900/30 border-b border-zinc-800/80 text-xs">
          <div className="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800">
            <span className="text-[10px] uppercase font-bold text-zinc-500 block">Total Crowned Winners</span>
            <span className="text-lg font-black font-mono text-zinc-100">{dailyWinners.length}</span>
          </div>

          <div className="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800">
            <span className="text-[10px] uppercase font-bold text-zinc-500 block">Pending Payouts</span>
            <span className="text-lg font-black font-mono text-amber-400">{pendingCount}</span>
          </div>

          <div className="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800">
            <span className="text-[10px] uppercase font-bold text-zinc-500 block">Completed Payouts</span>
            <span className="text-lg font-black font-mono text-emerald-400">{paidCount}</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-3 sm:px-4 bg-zinc-950 border-b border-zinc-800/80 flex items-center gap-2">
          <Search className="w-4 h-4 text-zinc-500 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by winner username, Discord/Telegram handle, or date..."
            className="w-full bg-transparent text-xs sm:text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none"
          />
        </div>

        {/* Winners List / Table */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredWinners.length === 0 ? (
            <div className="text-center py-12 text-zinc-500 text-xs">
              No crowned winners found matching your query.
            </div>
          ) : (
            filteredWinners.map((winner) => (
              <div
                key={winner.id}
                className={`p-4 rounded-2xl border transition-all ${
                  winner.payoutStatus === 'Pending'
                    ? 'bg-amber-950/20 border-amber-500/40 shadow-md'
                    : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                  {/* Winner Profile & Date */}
                  <div className="flex items-center gap-3">
                    <span className="text-3xl shrink-0">{winner.avatar}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-zinc-100">
                          {winner.username}
                        </span>
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
                          className="p-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors"
                        >
                          {copiedId === winner.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Winning Score & Payout Status Buttons */}
                  <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                    <div className="text-left md:text-right">
                      <span className="text-[10px] uppercase font-bold text-zinc-500 block">Winning Score</span>
                      <span className="text-base font-black font-mono text-amber-300">
                        {winner.formattedScore}
                      </span>
                    </div>

                    {/* Status Dropdown / Action */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onUpdateWinner(winner.id, { 
                          payoutStatus: winner.payoutStatus === 'Paid' ? 'Pending' : 'Paid',
                          paidAt: winner.payoutStatus === 'Paid' ? undefined : Date.now()
                        })}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-1.5 ${
                          winner.payoutStatus === 'Paid'
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                            : 'bg-amber-600 hover:bg-amber-500 text-white shadow-md'
                        }`}
                      >
                        {winner.payoutStatus === 'Paid' ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Paid</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3.5 h-3.5" />
                            <span>Pending Payout</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => {
                          setEditingId(winner.id);
                          setNoteText(winner.payoutNote || '');
                        }}
                        title="Add/Edit Payout Note"
                        className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Notes Display / Edit */}
                {editingId === winner.id ? (
                  <div className="mt-3 pt-3 border-t border-zinc-800 flex items-center gap-2">
                    <input
                      type="text"
                      value={noteText}
                      onChange={e => setNoteText(e.target.value)}
                      placeholder="e.g. Transferred $50 USDT to wallet. Tx: #123456"
                      className="flex-1 px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-700 text-xs text-zinc-200 focus:outline-none focus:border-purple-400"
                    />
                    <button
                      onClick={() => handleSaveNote(winner.id)}
                      className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold"
                    >
                      Save Note
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-2 py-1.5 rounded-xl bg-zinc-800 text-zinc-400 text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                ) : winner.payoutNote ? (
                  <div className="mt-2.5 pt-2 border-t border-zinc-800/80 text-xs text-zinc-400 flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span className="italic">"{winner.payoutNote}"</span>
                  </div>
                ) : null}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-zinc-800/80 bg-zinc-900/60 flex items-center justify-between text-xs text-zinc-400">
          <span className="text-[11px]">
            Casino moderators manually reach out to daily winners via Discord or Telegram to process grand prizes.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition-colors"
          >
            Close Portal
          </button>
        </div>
      </div>
    </div>
  );
};
