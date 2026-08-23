import React, { useState } from 'react';
import { Trophy, Sparkles, Coins, Trash2, Shield, Eye, ArrowUpDown } from 'lucide-react';
import { InventoryItem, ItemRarity } from '../types';
import { RARITY_CONFIG } from '../utils/crates';
import { sound } from '../utils/audio';

interface TrophyVaultProps {
  inventory: InventoryItem[];
  onSellItem: (instanceId: string, value: number) => void;
  onSellAll: () => void;
  onUpdateBalance: (delta: number) => void;
}

export const TrophyVault: React.FC<TrophyVaultProps> = ({
  inventory,
  onSellItem,
  onSellAll,
  onUpdateBalance,
}) => {
  const [filterRarity, setFilterRarity] = useState<ItemRarity | 'all'>('all');
  const [sortBy, setSortBy] = useState<'value' | 'recent'>('value');

  const totalVaultValue = inventory.reduce((sum, i) => sum + i.item.value, 0);

  const filteredItems = inventory
    .filter(i => filterRarity === 'all' || i.item.rarity === filterRarity)
    .sort((a, b) => {
      if (sortBy === 'value') return b.item.value - a.item.value;
      return b.obtainedAt - a.obtainedAt;
    });

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-950/40 via-zinc-950 to-purple-950/40 border border-amber-500/30 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-2xl shadow-inner">
            🏆
          </div>
          <div>
            <h2 className="text-xl font-black uppercase tracking-wider text-amber-300">
              Degenerate Trophy Vault
            </h2>
            <p className="text-xs text-zinc-400">
              Collectibles, rare CS artifacts, and unboxed status trophies.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-[10px] uppercase font-black text-zinc-400">Vault Net Value</div>
            <div className="text-xl font-black text-amber-300 font-mono">
              {totalVaultValue.toLocaleString()} <span className="text-xs font-normal">CHIPS</span>
            </div>
          </div>

          {inventory.length > 0 && (
            <button
              id="sell-all-btn"
              onClick={() => {
                sound.playChip();
                onSellAll();
              }}
              className="px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs uppercase tracking-wider shadow-lg transition-colors flex items-center gap-1.5"
            >
              <Coins className="w-4 h-4" />
              <span>Pawn Everything (+{totalVaultValue.toLocaleString()})</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Sort Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-zinc-950/80 border border-zinc-800">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          <span className="text-[10px] uppercase font-bold text-zinc-500 mr-1">Rarity:</span>
          {(['all', 'common', 'uncommon', 'rare', 'classified', 'covert', 'mythic', 'exotic'] as const).map((r) => (
            <button
              key={r}
              onClick={() => {
                sound.playChip();
                setFilterRarity(r);
              }}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-black uppercase transition-all whitespace-nowrap ${
                filterRarity === r
                  ? 'bg-amber-500 text-zinc-950 shadow-sm'
                  : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-bold text-zinc-500">Sort:</span>
          <button
            onClick={() => setSortBy(prev => prev === 'value' ? 'recent' : 'value')}
            className="flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-xl bg-zinc-900 text-zinc-300 border border-zinc-800 hover:bg-zinc-800"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>{sortBy === 'value' ? 'Highest Value' : 'Most Recent'}</span>
          </button>
        </div>
      </div>

      {/* Inventory Grid */}
      {inventory.length === 0 ? (
        <div className="p-16 text-center rounded-3xl bg-zinc-950/60 border border-zinc-800/80 space-y-3">
          <span className="text-5xl">📦</span>
          <h3 className="text-base font-black text-zinc-300 uppercase">Your Vault is Empty</h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            Head to the Loot Crate Unboxer tab to open random digital crates and store rare items here!
          </p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="p-12 text-center text-xs text-zinc-500">
          No items found matching the selected rarity filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredItems.map((invItem) => {
            const { item, instanceId } = invItem;
            const rarity = RARITY_CONFIG[item.rarity];

            return (
              <div
                key={instanceId}
                className={`flex flex-col justify-between p-4 rounded-3xl border-2 bg-gradient-to-b ${rarity.bg} ${rarity.border} ${rarity.glow} shadow-xl relative group`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-black/40 ${rarity.text}`}>
                      {rarity.label}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      {new Date(invItem.obtainedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="text-5xl text-center my-3 group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>

                  <h3 className="text-sm font-black text-zinc-100 truncate">
                    {item.name}
                  </h3>
                  <p className="text-[11px] text-zinc-300/80 italic mt-1 line-clamp-2">
                    "{item.lore}"
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                  <div className="text-xs font-black text-amber-300 font-mono">
                    +{item.value.toLocaleString()} Chips
                  </div>

                  <button
                    onClick={() => {
                      sound.playChip();
                      onSellItem(instanceId, item.value);
                    }}
                    className="px-2.5 py-1 text-[11px] font-black rounded-lg bg-zinc-900/90 hover:bg-rose-600 text-zinc-300 hover:text-white border border-zinc-700 hover:border-rose-500 transition-colors"
                  >
                    Pawn / Sell
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
