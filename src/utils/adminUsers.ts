import { AdminManagedUser, UserAccount, ChatMessage, FakePlayer, AccountStatus, AccountType } from '../types';
import { loadStoredFakePlayers, getVIPTier } from './leaderboard';

const ADMIN_USER_DIRECTORY_KEY = 'chipzone_admin_user_directory';

export const INITIAL_MOCK_USERS: AdminManagedUser[] = [
  {
    id: 'usr-admin-thomas',
    username: 'Thomas J',
    avatar: '👑',
    email: 'thomasjoe55@gmail.com',
    vipTier: 'Sovereign Degenerate',
    balance: 50000,
    peakBalance: 125000,
    totalWagered: 2500000,
    accountStatus: 'active',
    accountType: 'paid',
    userRole: 'admin',
    isAdFree: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 30,
    lastActive: 'Just now',
    isCurrentUser: true,
  },
  {
    id: 'usr-mod-sam',
    username: 'Sam_TheMod',
    avatar: '🛡️',
    email: 'sam.moderator@chipzone.com',
    vipTier: 'Diamond High-Roller',
    balance: 15000,
    peakBalance: 32000,
    totalWagered: 185000,
    accountStatus: 'moderator',
    accountType: 'paid',
    userRole: 'moderator',
    isAdFree: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 18,
    lastActive: '2 mins ago',
  },
  {
    id: 'fakeplayer1',
    username: 'fakeplayer1',
    avatar: '🎲',
    vipTier: 'Bronze Degen',
    balance: 320,
    peakBalance: 420,
    totalWagered: 650,
    accountStatus: 'active',
    accountType: 'free',
    userRole: 'player',
    isAdFree: false,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5,
    lastActive: '5 mins ago',
  },
  {
    id: 'fakeplayer2',
    username: 'fakeplayer2',
    avatar: '🦈',
    vipTier: 'Bronze Degen',
    balance: 450,
    peakBalance: 490,
    totalWagered: 890,
    accountStatus: 'active',
    accountType: 'free',
    userRole: 'player',
    isAdFree: false,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 4,
    lastActive: '12 mins ago',
  },
  {
    id: 'fakeplayer3',
    username: 'fakeplayer3',
    avatar: '🎰',
    vipTier: 'Bronze Degen',
    balance: 180,
    peakBalance: 350,
    totalWagered: 380,
    accountStatus: 'active',
    accountType: 'free',
    userRole: 'player',
    isAdFree: false,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
    lastActive: '25 mins ago',
  },
  {
    id: 'usr-banned-bot99',
    username: 'AutoSpamBot99',
    avatar: '💩',
    email: 'spammer99@junkmail.com',
    vipTier: 'Bronze Degen',
    balance: 0,
    peakBalance: 100,
    totalWagered: 50,
    accountStatus: 'banned',
    accountType: 'free',
    userRole: 'player',
    isAdFree: false,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
    lastActive: '3 days ago',
  },
];

export function getAdminUserDirectory(currentUser?: UserAccount | null, currentBalance: number = 1000000, totalWagered: number = 0): AdminManagedUser[] {
  let stored: AdminManagedUser[] = [];
  try {
    const raw = localStorage.getItem(ADMIN_USER_DIRECTORY_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        stored = parsed.filter((u): u is AdminManagedUser => !!u && typeof u === 'object' && !!u.id);
      }
    }
  } catch (e) {
    console.error('Failed to parse admin users directory:', e);
  }

  if (!stored || stored.length === 0) {
    stored = [...INITIAL_MOCK_USERS];
  }

  // Update current user entry
  const safeCurrentBalance = typeof currentBalance === 'number' && !isNaN(currentBalance) ? currentBalance : 1000000;
  const safeTotalWagered = typeof totalWagered === 'number' && !isNaN(totalWagered) ? totalWagered : 0;
  const userTier = getVIPTier(safeTotalWagered);
  const currentUserId = currentUser?.id || 'usr-admin-thomas';
  const currentUserIndex = stored.findIndex(u => u && (u.isCurrentUser || u.id === currentUserId));
  
  const currentUserEntry: AdminManagedUser = {
    id: currentUserId,
    username: currentUser?.username || 'Thomas J',
    avatar: currentUser?.avatar || '👑',
    email: currentUser?.email || currentUser?.googleEmail || 'thomasjoe55@gmail.com',
    vipTier: userTier,
    balance: safeCurrentBalance,
    peakBalance: Math.max(currentUser?.peakBalanceAllTime || 0, safeCurrentBalance),
    totalWagered: safeTotalWagered,
    accountStatus: currentUser?.accountStatus || 'active',
    accountType: currentUser?.accountType || (currentUser?.isAdFree ? 'paid' : 'free'),
    userRole: currentUser?.userRole || 'admin',
    isAdFree: !!currentUser?.isAdFree,
    createdAt: currentUser?.createdAt || Date.now(),
    lastActive: 'Active now',
    isCurrentUser: true,
  };

  if (currentUserIndex >= 0) {
    stored[currentUserIndex] = { ...stored[currentUserIndex], ...currentUserEntry };
  } else {
    stored.unshift(currentUserEntry);
  }

  // Sync fake players
  try {
    const fakePlayers = loadStoredFakePlayers();
    if (Array.isArray(fakePlayers)) {
      fakePlayers.forEach(fp => {
        if (!fp || !fp.id) return;
        const idx = stored.findIndex(u => u && u.id === fp.id);
        if (idx >= 0 && stored[idx]) {
          stored[idx] = {
            ...stored[idx],
            username: fp.username || stored[idx].username || 'Player',
            avatar: fp.avatar || stored[idx].avatar || '🎲',
            balance: typeof fp.balance === 'number' ? fp.balance : (stored[idx].balance || 0),
            vipTier: fp.vipTier || stored[idx].vipTier || 'Bronze Degen',
          };
        }
      });
    }
  } catch (err) {
    console.error('Error syncing fake players in admin directory:', err);
  }

  return stored.map(u => ({
    ...u,
    username: u.username || 'Gambler',
    avatar: u.avatar || '🎲',
    balance: typeof u.balance === 'number' && !isNaN(u.balance) ? u.balance : 0,
    totalWagered: typeof u.totalWagered === 'number' && !isNaN(u.totalWagered) ? u.totalWagered : 0,
    vipTier: u.vipTier || 'Bronze Degen',
    accountStatus: u.accountStatus || 'active',
    accountType: u.accountType || 'free',
  }));
}

export function saveAdminUserDirectory(users: AdminManagedUser[]): void {
  try {
    if (Array.isArray(users)) {
      localStorage.setItem(ADMIN_USER_DIRECTORY_KEY, JSON.stringify(users));
    }
  } catch (e) {
    console.error('Failed to save admin user directory:', e);
  }
}

export function updateUserInAdminDirectory(userId: string, updates: Partial<AdminManagedUser>): AdminManagedUser[] {
  try {
    const raw = localStorage.getItem(ADMIN_USER_DIRECTORY_KEY);
    let users: AdminManagedUser[] = [];
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        users = parsed;
      }
    }
    if (users.length === 0) {
      users = [...INITIAL_MOCK_USERS];
    }
    
    users = users.map(u => {
      if (u && u.id === userId) {
        return { ...u, ...updates };
      }
      return u;
    });

    saveAdminUserDirectory(users);
    return users;
  } catch (e) {
    console.error('Error updating user in admin directory:', e);
    return INITIAL_MOCK_USERS;
  }
}
