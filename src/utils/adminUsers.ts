import { AdminManagedUser, UserAccount, ChatMessage, FakePlayer, AccountStatus, AccountType } from '../types';
import { loadStoredFakePlayers, getVIPTier } from './leaderboard';

const ADMIN_USER_DIRECTORY_KEY = 'chipzone_admin_user_directory';

export const INITIAL_MOCK_USERS: AdminManagedUser[] = [
  {
    id: 'usr-admin-thomas',
    username: 'Thomas J',
    avatar: '👑',
    email: 'thomasjoe55@gmail.com',
    contactPlatform: 'discord',
    contactHandle: 'ThomasJ#1337',
    vipTier: 'Sovereign Degenerate',
    balance: 50000,
    peakBalance: 125000,
    totalWagered: 2500000,
    accountStatus: 'active',
    accountType: 'paid',
    isAdFree: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 30,
    lastActive: 'Just now',
    isCurrentUser: true,
  },
  {
    id: 'fakeplayer1',
    username: 'fakeplayer1',
    avatar: '🎲',
    contactPlatform: 'discord',
    contactHandle: 'fakeplayer1#0001',
    vipTier: 'Bronze Degen',
    balance: 320,
    peakBalance: 420,
    totalWagered: 650,
    accountStatus: 'active',
    accountType: 'free',
    isAdFree: false,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5,
    lastActive: '5 mins ago',
  },
  {
    id: 'fakeplayer2',
    username: 'fakeplayer2',
    avatar: '🦈',
    contactPlatform: 'telegram',
    contactHandle: '@fakeplayer2',
    vipTier: 'Bronze Degen',
    balance: 450,
    peakBalance: 490,
    totalWagered: 890,
    accountStatus: 'active',
    accountType: 'free',
    isAdFree: false,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 4,
    lastActive: '12 mins ago',
  },
  {
    id: 'fakeplayer3',
    username: 'fakeplayer3',
    avatar: '🎰',
    contactPlatform: 'discord',
    contactHandle: 'fakeplayer3#0003',
    vipTier: 'Bronze Degen',
    balance: 180,
    peakBalance: 350,
    totalWagered: 380,
    accountStatus: 'active',
    accountType: 'free',
    isAdFree: false,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
    lastActive: '25 mins ago',
  },
  {
    id: 'usr-banned-bot99',
    username: 'AutoSpamBot99',
    avatar: '💩',
    email: 'spammer99@junkmail.com',
    contactPlatform: 'telegram',
    contactHandle: '@spambot99',
    vipTier: 'Bronze Degen',
    balance: 0,
    peakBalance: 100,
    totalWagered: 50,
    accountStatus: 'banned',
    accountType: 'free',
    isAdFree: false,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 10,
    lastActive: '3 days ago (BANNED)',
  },
  {
    id: 'usr-closed-inactive',
    username: 'OldSchoolPlayer',
    avatar: '🎩',
    email: 'oldschool@archive.org',
    contactPlatform: 'discord',
    contactHandle: 'OldSchool#9901',
    vipTier: 'Gold Regular',
    balance: 0,
    peakBalance: 8200,
    totalWagered: 14000,
    accountStatus: 'closed',
    accountType: 'paid',
    isAdFree: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 45,
    lastActive: 'Closed by Request',
  },
];

export const INITIAL_ADMIN_USERS = INITIAL_MOCK_USERS;

export function getAdminUserDirectory(
  currentUser: UserAccount,
  currentBalance: number,
  totalWagered: number,
  peakBalance: number,
  existingList?: AdminManagedUser[],
  chatMessages: ChatMessage[] = []
): AdminManagedUser[] {
  let stored: AdminManagedUser[] = existingList && existingList.length > 0 ? [...existingList] : [];
  
  if (stored.length === 0) {
    try {
      const raw = localStorage.getItem(ADMIN_USER_DIRECTORY_KEY);
      if (raw) {
        stored = JSON.parse(raw);
      }
    } catch (e) {
      console.error('Error loading admin user directory:', e);
    }
  }

  if (!stored || stored.length === 0) {
    stored = [...INITIAL_MOCK_USERS];
  }

  // Sync current user into directory
  const currentUserId = currentUser.id || 'usr-current';
  const currentUserIndex = stored.findIndex(u => u.id === currentUserId || u.isCurrentUser);

  const syncedCurrentUser: AdminManagedUser = {
    id: currentUserId,
    username: currentUser.username || 'Current Player',
    avatar: currentUser.avatar || '👑',
    email: currentUser.email || currentUser.googleEmail || (currentUser.username ? `${currentUser.username.toLowerCase().replace(/\s+/g, '')}@chipzone.com` : 'player@chipzone.com'),
    contactPlatform: currentUser.contactPlatform || 'discord',
    contactHandle: currentUser.contactHandle || 'Player#0001',
    vipTier: getVIPTier(totalWagered),
    balance: currentBalance,
    peakBalance: Math.max(currentUser.peakBalanceAllTime || 0, peakBalance, currentBalance),
    totalWagered: totalWagered || 0,
    accountStatus: currentUser.accountStatus || 'active',
    accountType: currentUser.isAdFree ? 'paid' : (currentUser.accountType || 'free'),
    isAdFree: !!currentUser.isAdFree,
    createdAt: currentUser.createdAt || Date.now(),
    lastActive: 'Active Now',
    isCurrentUser: true,
  };

  if (currentUserIndex >= 0) {
    stored[currentUserIndex] = { ...stored[currentUserIndex], ...syncedCurrentUser };
  } else {
    stored.unshift(syncedCurrentUser);
  }

  // Sync fake player balances
  const fakePlayers = loadStoredFakePlayers();
  fakePlayers.forEach(fp => {
    const idx = stored.findIndex(u => u.id === fp.id);
    if (idx >= 0) {
      stored[idx].balance = fp.balance;
      stored[idx].contactHandle = fp.contactHandle;
      stored[idx].contactPlatform = fp.contactPlatform;
    }
  });

  // Calculate chat counts
  stored.forEach(u => {
    const userMsgCount = chatMessages.filter(
      m => m.senderId === u.id || m.username.toLowerCase() === u.username.toLowerCase()
    ).length;
    u.chatCount = userMsgCount;
  });

  return stored;
}

export function updateUserInAdminDirectory(
  currentList: AdminManagedUser[],
  userId: string,
  updates: Partial<AdminManagedUser>
): AdminManagedUser[] {
  const updated = currentList.map(user => {
    if (user.id === userId) {
      return { ...user, ...updates };
    }
    return user;
  });

  saveAdminUserDirectory(updated);
  return updated;
}

export function saveAdminUserDirectory(users: AdminManagedUser[]): void {
  try {
    localStorage.setItem(ADMIN_USER_DIRECTORY_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Error saving admin user directory:', e);
  }
}
