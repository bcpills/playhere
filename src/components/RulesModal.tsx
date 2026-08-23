import React, { useState } from 'react';
import { HelpCircle, Sparkles, Shield, Dices, Package } from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'blackjack' | 'keno' | 'unboxer'>('blackjack');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-black uppercase tracking-wider text-zinc-100">
              Casino Rules & Mathematical Odds
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200"
          >
            ✕
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-2 mb-4 border-b border-zinc-800/80 pb-2">
          <button
            onClick={() => setActiveTab('blackjack')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase transition-all ${
              activeTab === 'blackjack'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            🃏 Blackjack & Side Bets
          </button>
          <button
            onClick={() => setActiveTab('keno')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase transition-all ${
              activeTab === 'keno'
                ? 'bg-amber-500 text-zinc-950 shadow-md'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            🎱 40-Ball Keno (~95% RTP)
          </button>
          <button
            onClick={() => setActiveTab('unboxer')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase transition-all ${
              activeTab === 'unboxer'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            📦 Loot Unboxer
          </button>
        </div>

        {/* Tab Content */}
        <div className="space-y-4 text-xs sm:text-sm text-zinc-300 leading-relaxed">
          {activeTab === 'blackjack' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800">
                <h4 className="font-black text-emerald-400 uppercase text-xs mb-1">Standard Table Rules</h4>
                <ul className="list-disc pl-4 space-y-1 text-xs text-zinc-400">
                  <li>6-Deck Shoe shuffled continuously.</li>
                  <li>Dealer must hit Soft 17 and stand on Hard 17+.</li>
                  <li>Natural Blackjack pays <strong>3 to 2</strong>.</li>
                  <li>Double Down available on any first 2 cards.</li>
                  <li>Pair Splitting supported with separate bets.</li>
                  <li>Insurance offered when Dealer shows an Ace (pays 2:1).</li>
                </ul>
              </div>

              <div className="p-3.5 rounded-2xl bg-purple-950/30 border border-purple-500/40">
                <h4 className="font-black text-purple-300 uppercase text-xs mb-1">Side Bet: 21 + 3</h4>
                <p className="text-xs text-zinc-400 mb-2">
                  Combines player's first 2 cards with dealer's upcard to form a 3-card poker hand:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  <div className="bg-zinc-900 p-2 rounded-lg"><span className="text-zinc-400">Flush:</span> <span className="font-bold text-amber-300">5:1</span></div>
                  <div className="bg-zinc-900 p-2 rounded-lg"><span className="text-zinc-400">Straight:</span> <span className="font-bold text-amber-300">10:1</span></div>
                  <div className="bg-zinc-900 p-2 rounded-lg"><span className="text-zinc-400">3 of a Kind:</span> <span className="font-bold text-amber-300">30:1</span></div>
                  <div className="bg-zinc-900 p-2 rounded-lg"><span className="text-zinc-400">Straight Flush:</span> <span className="font-bold text-amber-300">40:1</span></div>
                  <div className="bg-zinc-900 p-2 rounded-lg col-span-2 sm:col-span-1"><span className="text-amber-400 font-bold">Suited Trips:</span> <span className="font-bold text-yellow-300">100:1</span></div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-blue-950/30 border border-blue-500/40">
                <h4 className="font-black text-blue-300 uppercase text-xs mb-1">Side Bet: Perfect Pairs</h4>
                <p className="text-xs text-zinc-400 mb-2">
                  Player's first 2 cards have the same rank:
                </p>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="bg-zinc-900 p-2 rounded-lg"><span className="text-zinc-400">Mixed:</span> <span className="font-bold text-amber-300">6:1</span></div>
                  <div className="bg-zinc-900 p-2 rounded-lg"><span className="text-zinc-400">Colored:</span> <span className="font-bold text-amber-300">12:1</span></div>
                  <div className="bg-zinc-900 p-2 rounded-lg"><span className="text-blue-300 font-bold">Suited:</span> <span className="font-bold text-yellow-300">25:1</span></div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-rose-950/30 border border-rose-500/40">
                <h4 className="font-black text-rose-300 uppercase text-xs mb-1">Side Bet: Lucky Ladies</h4>
                <p className="text-xs text-zinc-400 mb-2">
                  Player's first 2 cards total 20 or are Queens of Hearts:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  <div className="bg-zinc-900 p-2 rounded-lg"><span className="text-zinc-400">Any 20:</span> <span className="font-bold text-amber-300">4:1</span></div>
                  <div className="bg-zinc-900 p-2 rounded-lg"><span className="text-zinc-400">Suited 20:</span> <span className="font-bold text-amber-300">10:1</span></div>
                  <div className="bg-zinc-900 p-2 rounded-lg"><span className="text-zinc-400">Matched 20:</span> <span className="font-bold text-amber-300">25:1</span></div>
                  <div className="bg-zinc-900 p-2 rounded-lg"><span className="text-rose-400">Two Q♥:</span> <span className="font-bold text-amber-300">100:1</span></div>
                  <div className="bg-gradient-to-r from-amber-950 to-rose-950 p-2 rounded-lg col-span-2"><span className="text-yellow-300 font-bold">Two Q♥ + Dealer BJ:</span> <span className="font-bold text-yellow-300">1,000:1</span></div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'keno' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800">
                <h4 className="font-black text-amber-400 uppercase text-xs mb-1">40-Ball Compact Keno & ~95% RTP</h4>
                <p className="text-xs text-zinc-300">
                  Pick between <strong>1 and 10 numbers out of 40</strong>. The hopper draws <strong>10 balls</strong>. Paytables are mathematically calibrated to deliver an expected <strong>~95% Return to Player (RTP)</strong> (house edge ~5%) across all picks:
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/40">
                <h4 className="font-black text-emerald-400 uppercase text-xs">1. Safe Grinder (Low Volatility • ~95% RTP)</h4>
                <p className="text-xs text-zinc-400 mt-0.5">
                  High hit frequency and frequent small consolation multipliers. Ideal for bankroll preservation and steady play.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/40">
                <h4 className="font-black text-amber-300 uppercase text-xs">2. Classic Vegas (Balanced • ~95% RTP)</h4>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Standard casino odds curve with balanced mid-tier payouts and top jackpot multipliers up to 50,000x for 10/10 hits.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-rose-950/30 border border-rose-500/40">
                <h4 className="font-black text-rose-400 uppercase text-xs">3. Bullshit Degen (High Volatility • ~95% RTP)</h4>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Zero consolation for partial hits, but massive jackpot multipliers reaching up to 3,000,000x for legendary runs.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'unboxer' && (
            <div className="space-y-3">
              <p className="text-xs text-zinc-400">
                Spin CS-style horizontal crates for rare digital items and chip windfalls (Crates starting at just 10 Chips):
              </p>

              <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1.5 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-zinc-400" />
                  <strong className="text-zinc-300">Common:</strong> <span>Standard street artifacts</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-500" />
                  <strong className="text-blue-400">Uncommon:</strong> <span>Collectible dice & gear</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-purple-500" />
                  <strong className="text-purple-400">Rare:</strong> <span>High value items</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-pink-500" />
                  <strong className="text-pink-400">Classified:</strong> <span>Premium profit artifacts</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500" />
                  <strong className="text-red-400">Covert:</strong> <span>Massive returns</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-yellow-400 animate-pulse" />
                  <strong className="text-yellow-300">★ Exotic Special ★:</strong> <span>Legendary CS Knives & Golden Bullshit Trophies!</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold"
          >
            Got it, Let's Gamble
          </button>
        </div>
      </div>
    </div>
  );
};
