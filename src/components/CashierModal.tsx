import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  UserAccount, 
  DepositTransaction, 
  PayoutRequest, 
  PaymentMethod 
} from '../types';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import { 
  CreditCard, 
  QrCode, 
  Building2, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Coins, 
  DollarSign, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  History, 
  Copy, 
  Check, 
  ShieldCheck, 
  Sparkles, 
  X, 
  Zap, 
  Wallet, 
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Info
} from 'lucide-react';

interface CashierModalProps {
  isOpen: boolean;
  onClose: () => void;
  balance: number;
  onUpdateBalance: (amount: number | ((prev: number) => number)) => void;
  cashBalance?: number;
  onUpdateCashBalance?: (amount: number | ((prev: number) => number)) => void;
  userAccount: UserAccount;
  depositHistory: DepositTransaction[];
  onAddDeposit: (deposit: DepositTransaction) => void;
  payoutRequests: PayoutRequest[];
  onSubmitPayout: (request: PayoutRequest) => void;
}

const DEPOSIT_TIERS = [
  { usd: 10, chips: 1000, bonus: 0, tag: 'Starter' },
  { usd: 25, chips: 2500, bonus: 125, tag: '+5% Bonus' },
  { usd: 50, chips: 5000, bonus: 500, tag: '+10% Bonus' },
  { usd: 100, chips: 10000, bonus: 1500, tag: '+15% Popular' },
  { usd: 250, chips: 25000, bonus: 5000, tag: '+20% High-Roller' },
  { usd: 500, chips: 50000, bonus: 12500, tag: '+25% Whale' },
];

interface CryptoCoin {
  symbol: string;
  name: string;
  network: string;
  prefix: string;
}

const CRYPTO_COINS: CryptoCoin[] = [
  { symbol: 'USDT', name: 'Tether (USDT-TRC20)', network: 'TRON TRC20', prefix: 'TK' },
  { symbol: 'BTC', name: 'Bitcoin (BTC)', network: 'Bitcoin Mainnet', prefix: 'bc1q' },
  { symbol: 'ETH', name: 'Ethereum (ETH)', network: 'Ethereum ERC20', prefix: '0x' },
  { symbol: 'SOL', name: 'Solana (SOL)', network: 'Solana Network', prefix: '7x' },
  { symbol: 'LTC', name: 'Litecoin (LTC)', network: 'Litecoin Mainnet', prefix: 'ltc1q' },
  { symbol: 'DOGE', name: 'Dogecoin (DOGE)', network: 'Dogecoin Network', prefix: 'D' },
];

function generateRandomAddress(coin: CryptoCoin): string {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let addr = coin.prefix;
  const targetLen = coin.symbol === 'ETH' ? 42 : coin.symbol === 'BTC' ? 38 : coin.symbol === 'USDT' ? 34 : 44;
  for (let i = addr.length; i < targetLen; i++) {
    addr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return addr;
}

export const CashierModal: React.FC<CashierModalProps> = ({
  isOpen,
  onClose,
  balance,
  onUpdateBalance,
  cashBalance = 5.00,
  onUpdateCashBalance,
  userAccount,
  depositHistory,
  onAddDeposit,
  payoutRequests,
  onSubmitPayout,
}) => {
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw' | 'history'>('deposit');
  
  // Deposit state
  const [selectedDepositTier, setSelectedDepositTier] = useState<number>(50);
  const [customUsdAmount, setCustomUsdAmount] = useState<string>('');
  const [depositMethod, setDepositMethod] = useState<PaymentMethod>('crypto');
  const [cardNumber, setCardNumber] = useState<string>('4532 •••• •••• 8821');
  const [cardExpiry, setCardExpiry] = useState<string>('08/29');
  const [cardCvc, setCardCvc] = useState<string>('742');
  const [cardName, setCardName] = useState<string>(userAccount.username || 'Thomas J');
  
  // Crypto state with dynamic random address generation
  const [selectedCryptoCoin, setSelectedCryptoCoin] = useState<CryptoCoin>(CRYPTO_COINS[0]);
  const [cryptoDepositAddresses, setCryptoDepositAddresses] = useState<{ [symbol: string]: string }>({});
  const [copiedCryptoAddress, setCopiedCryptoAddress] = useState<boolean>(false);
  const [isSimulatingTransfer, setIsSimulatingTransfer] = useState<boolean>(false);
  const [blockchainConfirmStep, setBlockchainConfirmStep] = useState<number>(0);
  const [blockchainTxHash, setBlockchainTxHash] = useState<string>('');

  const [isProcessingDeposit, setIsProcessingDeposit] = useState<boolean>(false);
  const [depositSuccessMsg, setDepositSuccessMsg] = useState<string | null>(null);

  // Withdrawal / Payout state
  const [withdrawChips, setWithdrawChips] = useState<number>(5000);
  const [withdrawMethod, setWithdrawMethod] = useState<'bank_wire' | 'crypto' | 'paypal' | 'cashapp'>('crypto');
  const [bankName, setBankName] = useState<string>('Chase Bank N.A.');
  const [routingNumber, setRoutingNumber] = useState<string>('021000021');
  const [accountNumber, setAccountNumber] = useState<string>('9821447019');
  const [accountHolder, setAccountHolder] = useState<string>(userAccount.username || 'Thomas J');
  const [cryptoPayoutCoin, setCryptoPayoutCoin] = useState<string>('USDT');
  const [cryptoPayoutAddress, setCryptoPayoutAddress] = useState<string>('');
  const [tagOrEmail, setTagOrEmail] = useState<string>(userAccount.email || 'thomasjoe55@gmail.com');
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const [withdrawSuccessMsg, setWithdrawSuccessMsg] = useState<string | null>(null);

  // Generate initial addresses
  useEffect(() => {
    const initial: { [symbol: string]: string } = {};
    CRYPTO_COINS.forEach(c => {
      initial[c.symbol] = generateRandomAddress(c);
    });
    setCryptoDepositAddresses(initial);
  }, []);

  if (!isOpen) return null;

  const currentAddress = cryptoDepositAddresses[selectedCryptoCoin.symbol] || generateRandomAddress(selectedCryptoCoin);

  const handleRegenerateAddress = () => {
    sound.playChip();
    const newAddr = generateRandomAddress(selectedCryptoCoin);
    setCryptoDepositAddresses(prev => ({
      ...prev,
      [selectedCryptoCoin.symbol]: newAddr,
    }));
  };

  // Deposit calculation
  const isCustom = selectedDepositTier === 0;
  const customUsd = Math.max(5, parseInt(customUsdAmount || '0', 10));
  const activeUsd = isCustom ? customUsd : selectedDepositTier;
  const tierObj = DEPOSIT_TIERS.find(t => t.usd === activeUsd);
  
  // Extra 15% Crypto Bonus if using Crypto
  const baseBonus = tierObj ? tierObj.bonus : Math.floor(activeUsd * 10);
  const cryptoBonus = depositMethod === 'crypto' ? Math.floor(activeUsd * 25) : 0; // +25 bonus chips for crypto
  const totalBonusChips = baseBonus + cryptoBonus;
  const totalChipsToCredit = (activeUsd * 100) + totalBonusChips;

  // Withdrawal calculation ($1 = 100 chips)
  const withdrawUsdValue = Math.floor(withdrawChips / 100);

  const handleCopyCrypto = () => {
    sound.playChip();
    navigator.clipboard.writeText(currentAddress);
    setCopiedCryptoAddress(true);
    setTimeout(() => setCopiedCryptoAddress(false), 2000);
  };

  // Simulate Crypto Transfer & Blockchain Confirmation Flow
  const handleSimulateCryptoTransfer = () => {
    if (isSimulatingTransfer) return;
    setIsSimulatingTransfer(true);
    setBlockchainConfirmStep(1); // 1: Broadcast to mempool
    sound.playChip();

    const txHash = '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    setBlockchainTxHash(txHash);

    // Step 2: Mining block (1/3 confirmations)
    setTimeout(() => {
      setBlockchainConfirmStep(2);
      sound.playChip();
    }, 1200);

    // Step 3: Transaction confirmed (3/3 confirmations) & credit funds
    setTimeout(() => {
      setBlockchainConfirmStep(3);
      sound.playBigWin();
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.5 } });

      const txRef = 'DEP-CRYPTO-' + Math.random().toString(36).substring(2, 8).toUpperCase();
      
      const newTx: DepositTransaction = {
        id: txRef,
        userId: userAccount.id,
        username: userAccount.username || 'Gambler',
        usdAmount: activeUsd,
        chipsCredited: totalChipsToCredit,
        method: 'crypto',
        timestamp: Date.now(),
        status: 'Completed',
        transactionRef: txRef,
        methodDetails: `${selectedCryptoCoin.symbol} (${selectedCryptoCoin.network}) - Tx: ${txHash.slice(0, 10)}...`,
      };

      onAddDeposit(newTx);
      onUpdateBalance(prev => prev + totalChipsToCredit);
      if (onUpdateCashBalance) {
        onUpdateCashBalance(prev => Number((prev + activeUsd).toFixed(2)));
      }

      setDepositSuccessMsg(`Crypto Deposit Verified on Blockchain! Received +${totalChipsToCredit.toLocaleString()} Chips ($${activeUsd}.00 USD) + ${cryptoBonus} Crypto Bonus Chips!`);

      setTimeout(() => {
        setIsSimulatingTransfer(false);
        setBlockchainConfirmStep(0);
      }, 2500);

    }, 2500);
  };

  const handleExecuteStandardDeposit = () => {
    if (isProcessingDeposit) return;
    if (activeUsd < 5) {
      alert('Minimum deposit is $5.00 USD');
      return;
    }

    setIsProcessingDeposit(true);
    sound.playChip();

    setTimeout(() => {
      setIsProcessingDeposit(false);
      sound.playBigWin();
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });

      const txRef = 'DEP-' + Math.random().toString(36).substring(2, 9).toUpperCase();
      
      const newTx: DepositTransaction = {
        id: txRef,
        userId: userAccount.id,
        username: userAccount.username || 'Gambler',
        usdAmount: activeUsd,
        chipsCredited: totalChipsToCredit,
        method: depositMethod,
        timestamp: Date.now(),
        status: 'Completed',
        transactionRef: txRef,
        methodDetails: depositMethod === 'card' 
          ? `Card ending in ${cardNumber.slice(-4)}`
          : depositMethod.toUpperCase(),
      };

      onAddDeposit(newTx);
      onUpdateBalance(prev => prev + totalChipsToCredit);
      if (onUpdateCashBalance) {
        onUpdateCashBalance(prev => Number((prev + activeUsd).toFixed(2)));
      }
      setDepositSuccessMsg(`Payment Approved! Added +${totalChipsToCredit.toLocaleString()} Chips ($${activeUsd}.00 USD) to your bankroll.`);
      
      setTimeout(() => {
        setDepositSuccessMsg(null);
      }, 5000);
    }, 1200);
  };

  const handleExecuteWithdrawal = () => {
    setWithdrawError(null);
    setWithdrawSuccessMsg(null);

    if (withdrawChips < 1000) {
      setWithdrawError('Minimum withdrawal is 1,000 chips ($10.00 USD).');
      sound.playLose();
      return;
    }

    if (withdrawChips > balance) {
      setWithdrawError('Insufficient chip bankroll for this cashout amount.');
      sound.playLose();
      return;
    }

    if (withdrawMethod === 'crypto' && !cryptoPayoutAddress.trim()) {
      setWithdrawError('Please enter your recipient crypto wallet address.');
      sound.playLose();
      return;
    }

    if (withdrawMethod === 'bank_wire' && (!accountNumber.trim() || !routingNumber.trim())) {
      setWithdrawError('Please enter your complete bank account and routing numbers.');
      sound.playLose();
      return;
    }

    if ((withdrawMethod === 'paypal' || withdrawMethod === 'cashapp') && !tagOrEmail.trim()) {
      setWithdrawError('Please enter your PayPal email or CashApp $cashtag.');
      sound.playLose();
      return;
    }

    sound.playWin();

    // Deduct chips from bankroll
    onUpdateBalance(prev => prev - withdrawChips);

    const txId = 'PAY-' + Math.random().toString(36).substring(2, 9).toUpperCase();
    const destinationSummary = withdrawMethod === 'bank_wire'
      ? `${bankName} (Acct: ...${accountNumber.slice(-4)})`
      : withdrawMethod === 'crypto'
      ? `${cryptoPayoutCoin}: ${cryptoPayoutAddress.slice(0, 8)}...${cryptoPayoutAddress.slice(-6)}`
      : tagOrEmail;

    const request: PayoutRequest = {
      id: txId,
      userId: userAccount.id,
      username: userAccount.username || 'Gambler',
      avatar: userAccount.avatar || '👑',
      chipsAmount: withdrawChips,
      usdAmount: withdrawUsdValue,
      method: withdrawMethod,
      destination: destinationSummary,
      destinationDetails: {
        accountHolder,
        bankName,
        routingNumber,
        cryptoNetwork: cryptoPayoutCoin,
        walletAddress: cryptoPayoutAddress,
        tagOrEmail,
      },
      requestedAt: Date.now(),
      status: 'Pending',
      transactionRef: txId,
    };

    onSubmitPayout(request);
    setWithdrawSuccessMsg(`Payout Request submitted for $${withdrawUsdValue}.00 USD (${withdrawChips.toLocaleString()} chips). Administrators & moderators will review and approve your payout!`);
    
    // Clear form inputs
    setCryptoPayoutAddress('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-4xl max-h-[94vh] rounded-3xl bg-zinc-950 border-2 border-amber-500/60 shadow-2xl flex flex-col relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800/80 bg-zinc-900/90 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 border border-amber-300/60 flex items-center justify-center text-zinc-950 shadow-lg shadow-amber-500/30">
              <DollarSign className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-zinc-100">
                  Real Money Cashier & Banking
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
                  $1.00 USD = 100 CHIPS
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Instant encrypted real-money deposits, crypto deposit simulation with bonus chips, and real cashouts.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Bankroll Badge */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-right">
              <Coins className="w-4 h-4 text-amber-400" />
              <div>
                <span className="text-[9px] uppercase font-bold text-zinc-500 block leading-none">Available Balance</span>
                <span className="text-xs font-mono font-black text-amber-300">
                  {(isNaN(balance) ? 1000000 : balance).toLocaleString()} GC (${cashBalance.toFixed(2)} USD)
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-zinc-200 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigators */}
        <div className="flex items-center justify-between px-4 sm:px-6 pt-3 pb-2 bg-zinc-950 border-b border-zinc-800 gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sound.playChip();
                setActiveTab('deposit');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'deposit'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-zinc-950 font-black shadow-lg shadow-emerald-500/20'
                  : 'bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
              }`}
            >
              <ArrowDownToLine className="w-4 h-4" />
              <span>Deposit (Crypto & Cards)</span>
            </button>

            <button
              onClick={() => {
                sound.playChip();
                setActiveTab('withdraw');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'withdraw'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-zinc-950 font-black shadow-lg shadow-amber-500/20'
                  : 'bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
              }`}
            >
              <ArrowUpFromLine className="w-4 h-4" />
              <span>Withdraw (Cash Out)</span>
            </button>

            <button
              onClick={() => {
                sound.playChip();
                setActiveTab('history');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-purple-600 text-white font-black shadow-lg shadow-purple-600/30'
                  : 'bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Banking History</span>
            </button>
          </div>
        </div>

        {/* TAB 1: DEPOSIT / ADD FUNDS */}
        {activeTab === 'deposit' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            
            {depositSuccessMsg && (
              <div className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 text-xs font-bold flex items-center gap-2.5 animate-in fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>{depositSuccessMsg}</span>
              </div>
            )}

            {/* Step 1: Select Package */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase text-zinc-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>1. Select Deposit Tier</span>
                </label>
                <span className="text-[10px] text-zinc-400">All tiers include instant bonus chips</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {DEPOSIT_TIERS.map((tier) => {
                  const isSelected = selectedDepositTier === tier.usd;
                  return (
                    <button
                      key={tier.usd}
                      type="button"
                      onClick={() => {
                        sound.playChip();
                        setSelectedDepositTier(tier.usd);
                      }}
                      className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden cursor-pointer ${
                        isSelected
                          ? 'bg-gradient-to-b from-emerald-950/80 to-zinc-900 border-emerald-400 ring-2 ring-emerald-400/40 shadow-lg'
                          : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <span className="text-[9px] font-black uppercase text-amber-300 block mb-0.5">{tier.tag}</span>
                      <div className="text-base sm:text-lg font-black text-white">${tier.usd}.00</div>
                      <div className="text-xs font-mono font-bold text-emerald-400">+{tier.chips.toLocaleString()}c</div>
                      {tier.bonus > 0 && (
                        <div className="text-[9px] font-mono text-amber-400 font-semibold">+{tier.bonus} bonus</div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Choose Payment Gateway */}
            <div className="pt-2">
              <label className="text-xs font-bold uppercase text-zinc-300 block mb-2">
                2. Choose Payment Gateway
              </label>

              <div className="grid grid-cols-3 gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => {
                    sound.playChip();
                    setDepositMethod('crypto');
                  }}
                  className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                    depositMethod === 'crypto'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-black'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  <span>Instant Crypto (+Bonus)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sound.playChip();
                    setDepositMethod('card');
                  }}
                  className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                    depositMethod === 'card'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-black'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Credit / Debit Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sound.playChip();
                    setDepositMethod('paypal');
                  }}
                  className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                    depositMethod === 'paypal'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-black'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Wallet className="w-4 h-4" />
                  <span>PayPal / Apple Pay</span>
                </button>
              </div>

              {/* CRYPTO FORM WITH DYNAMIC ADDRESS & SIMULATE CONFIRMATION */}
              {depositMethod === 'crypto' && (
                <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/90 border border-purple-900/50 space-y-3.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="text-[11px] font-bold uppercase text-zinc-400">
                      Select Deposit Coin
                    </label>
                    <div className="flex flex-wrap items-center gap-1">
                      {CRYPTO_COINS.map(coin => (
                        <button
                          key={coin.symbol}
                          type="button"
                          onClick={() => {
                            sound.playChip();
                            setSelectedCryptoCoin(coin);
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono transition-all cursor-pointer ${
                            selectedCryptoCoin.symbol === coin.symbol
                              ? 'bg-amber-500 text-zinc-950 font-black shadow-md shadow-amber-500/20'
                              : 'bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-700'
                          }`}
                        >
                          {coin.symbol}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* QR & Generated Address Display */}
                  <div className="flex flex-col sm:flex-row items-center gap-4 p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800">
                    <div className="w-24 h-24 bg-white p-2 rounded-2xl flex flex-col items-center justify-center shrink-0 shadow-inner">
                      <div className="w-full h-full border-2 border-black grid grid-cols-4 gap-0.5 p-1 bg-white">
                        <div className="bg-black col-span-2 row-span-2" />
                        <div className="bg-black" />
                        <div className="bg-black" />
                        <div className="bg-black" />
                        <div className="bg-black col-span-2 row-span-2" />
                      </div>
                    </div>

                    <div className="flex-1 overflow-hidden space-y-1.5 text-center sm:text-left">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-zinc-400 block">
                          {selectedCryptoCoin.name} Generated Deposit Address
                        </span>
                        <button
                          type="button"
                          onClick={handleRegenerateAddress}
                          className="flex items-center gap-1 text-[10px] text-amber-400 hover:text-amber-300 font-bold transition-colors cursor-pointer"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Generate New</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-emerald-300 font-bold break-all bg-zinc-900 p-2 rounded-xl border border-zinc-800 flex-1">
                          {currentAddress}
                        </span>
                        <button
                          type="button"
                          onClick={handleCopyCrypto}
                          className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-bold border border-zinc-700 flex items-center gap-1.5 shrink-0 cursor-pointer shadow-md"
                        >
                          {copiedCryptoAddress ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedCryptoAddress ? 'Copied' : 'Copy Address'}</span>
                        </button>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-1">
                        <span>Network: <strong className="text-white">{selectedCryptoCoin.network}</strong></span>
                        <span className="text-amber-300 font-bold">+25% Crypto Deposit Bonus Active</span>
                      </div>
                    </div>
                  </div>

                  {/* Blockchain Transfer Simulation Card */}
                  <div className="p-3 rounded-2xl bg-purple-950/40 border border-purple-500/40 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-purple-300 flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-amber-400" />
                        Simulate Blockchain Deposit Confirmation
                      </span>
                      <span className="text-[10px] text-zinc-400 font-mono">1-Click Live Test</span>
                    </div>

                    {isSimulatingTransfer ? (
                      <div className="p-3 rounded-xl bg-zinc-950 border border-purple-500/50 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-amber-300 font-bold">
                            {blockchainConfirmStep === 1 && '📡 Broadcasting to mempool (0/3 confirmations)...'}
                            {blockchainConfirmStep === 2 && '⛏️ Block mined! Validating on-chain (1/3 confirmations)...'}
                            {blockchainConfirmStep === 3 && '✓ Transaction Confirmed on Blockchain!'}
                          </span>
                          <span className="font-mono text-[10px] text-zinc-400">
                            TxID: {blockchainTxHash.slice(0, 10)}...
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-purple-500 via-amber-400 to-emerald-400 transition-all duration-700 rounded-full"
                            style={{ width: `${(blockchainConfirmStep / 3) * 100}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSimulateCryptoTransfer}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 via-amber-500 to-emerald-500 hover:from-purple-500 hover:to-emerald-400 text-zinc-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-purple-950/50 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                      >
                        <Zap className="w-4 h-4 fill-current" />
                        <span>Simulate Transfer & Confirm Deposit (+{totalChipsToCredit.toLocaleString()} Chips)</span>
                      </button>
                    )}
                  </div>

                </div>
              )}

              {/* CARD FORM */}
              {depositMethod === 'card' && (
                <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase text-zinc-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      256-Bit SSL Encrypted Card Gateway
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Card Number</label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={e => setCardNumber(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                        placeholder="•••• •••• •••• ••••"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Cardholder Name</label>
                      <input
                        type="text"
                        value={cardName}
                        onChange={e => setCardName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                        placeholder="Full Legal Name"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Expires</label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={e => setCardExpiry(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                          placeholder="MM/YY"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">CVC / CVV</label>
                        <input
                          type="text"
                          value={cardCvc}
                          onChange={e => setCardCvc(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                          placeholder="CVC"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* PAYPAL / WALLET FORM */}
              {depositMethod === 'paypal' && (
                <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-center space-y-2">
                  <span className="text-xs font-bold text-zinc-300 block">
                    1-Click Fast Digital Wallet Checkout
                  </span>
                  <p className="text-[11px] text-zinc-400 max-w-md mx-auto">
                    Complete your payment via PayPal, Apple Pay, Google Pay, or CashApp. Immediate chip crediting upon authorization.
                  </p>
                </div>
              )}
            </div>

            {/* Deposit Summary & Action for Card/PayPal */}
            {depositMethod !== 'crypto' && (
              <div className="pt-2 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-zinc-400 block">Total Chips to Receive:</span>
                  <span className="text-xl font-black font-mono text-emerald-400 flex items-center gap-1.5">
                    <Coins className="w-5 h-5 text-amber-400" />
                    <span>+{totalChipsToCredit.toLocaleString()} CHIPS</span>
                    <span className="text-xs text-zinc-400 font-normal">(${activeUsd}.00 USD)</span>
                  </span>
                </div>

                <button
                  type="button"
                  disabled={isProcessingDeposit}
                  onClick={handleExecuteStandardDeposit}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 text-zinc-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-xl shadow-emerald-500/20 transition-all cursor-pointer active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isProcessingDeposit ? 'Processing Payment...' : `Authorize & Add Funds ($${activeUsd}.00)`}</span>
                </button>
              </div>
            )}

          </div>
        )}

        {/* TAB 2: WITHDRAW / CASHOUT */}
        {activeTab === 'withdraw' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            
            {withdrawSuccessMsg && (
              <div className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 text-xs font-bold flex items-center gap-2.5 animate-in fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>{withdrawSuccessMsg}</span>
              </div>
            )}

            {withdrawError && (
              <div className="p-3 rounded-2xl bg-rose-950/80 border border-rose-500/60 text-rose-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{withdrawError}</span>
              </div>
            )}

            {/* Chips Amount Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase text-zinc-300 flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5 text-amber-400" />
                  <span>Chips to Cash Out</span>
                </label>
                <span className="text-[11px] font-mono text-emerald-400 font-bold">
                  = ${withdrawUsdValue}.00 USD Real Money
                </span>
              </div>

              <div className="relative">
                <input
                  type="number"
                  min={1000}
                  max={balance}
                  step={500}
                  value={withdrawChips}
                  onChange={e => setWithdrawChips(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-4 py-3 rounded-2xl bg-zinc-900 border border-zinc-700 text-white font-mono font-black text-base focus:outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={() => setWithdrawChips(balance)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-300 text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Max All
                </button>
              </div>

              <div className="flex items-center justify-between text-[10px] text-zinc-400 mt-1">
                <span>Minimum: 1,000 Chips ($10.00 USD)</span>
                <span>Available: {balance.toLocaleString()} Chips</span>
              </div>
            </div>

            {/* Payout Method Selection */}
            <div className="pt-2">
              <label className="text-xs font-bold uppercase text-zinc-300 block mb-2">
                Payout Destination Method
              </label>

              <div className="grid grid-cols-3 gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => {
                    sound.playChip();
                    setWithdrawMethod('crypto');
                  }}
                  className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                    withdrawMethod === 'crypto'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-black'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  <span>Crypto Wallet</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sound.playChip();
                    setWithdrawMethod('bank_wire');
                  }}
                  className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                    withdrawMethod === 'bank_wire'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-black'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>Direct Bank Wire / ACH</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sound.playChip();
                    setWithdrawMethod('paypal');
                  }}
                  className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                    withdrawMethod === 'paypal'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-black'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Wallet className="w-4 h-4" />
                  <span>PayPal / CashApp</span>
                </button>
              </div>

              {/* CRYPTO PAYOUT FORM */}
              {withdrawMethod === 'crypto' && (
                <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-3">
                  <span className="text-[11px] font-bold uppercase text-zinc-400 block">
                    Instant Crypto Payout Details
                  </span>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Coin Network</label>
                    <select
                      value={cryptoPayoutCoin}
                      onChange={e => setCryptoPayoutCoin(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-white text-xs focus:outline-none focus:border-amber-500"
                    >
                      <option value="USDT">USDT (Tether TRC20)</option>
                      <option value="BTC">Bitcoin (BTC)</option>
                      <option value="ETH">Ethereum (ERC20)</option>
                      <option value="SOL">Solana (SOL)</option>
                      <option value="LTC">Litecoin (LTC)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Your Receiving Wallet Address</label>
                    <input
                      type="text"
                      value={cryptoPayoutAddress}
                      onChange={e => setCryptoPayoutAddress(e.target.value)}
                      placeholder="e.g. TK8vR4mQW8oJ7kL2pNm5XqY9aZv3uW1e..."
                      className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              )}

              {/* BANK WIRE FORM */}
              {withdrawMethod === 'bank_wire' && (
                <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-3">
                  <span className="text-[11px] font-bold uppercase text-zinc-400 block">
                    US & Global Bank Wire Transfer
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Bank Name</label>
                      <input
                        type="text"
                        value={bankName}
                        onChange={e => setBankName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-white text-xs focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Account Holder</label>
                      <input
                        type="text"
                        value={accountHolder}
                        onChange={e => setAccountHolder(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-white text-xs focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Routing Number</label>
                      <input
                        type="text"
                        value={routingNumber}
                        onChange={e => setRoutingNumber(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Account Number</label>
                      <input
                        type="text"
                        value={accountNumber}
                        onChange={e => setAccountNumber(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* PAYPAL / CASHAPP FORM */}
              {withdrawMethod === 'paypal' && (
                <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-3">
                  <span className="text-[11px] font-bold uppercase text-zinc-400 block">
                    PayPal or CashApp Payout
                  </span>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">PayPal Email or CashApp $Cashtag</label>
                    <input
                      type="text"
                      value={tagOrEmail}
                      onChange={e => setTagOrEmail(e.target.value)}
                      placeholder="e.g. user@gmail.com or $cashtag"
                      className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-white text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Payout Action */}
            <div className="pt-2 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-zinc-400 block">Total Payout Amount:</span>
                <span className="text-xl font-black font-mono text-amber-300">
                  ${withdrawUsdValue}.00 USD ({withdrawChips.toLocaleString()} chips)
                </span>
              </div>

              <button
                type="button"
                onClick={handleExecuteWithdrawal}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-zinc-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-xl shadow-amber-500/20 transition-all cursor-pointer active:scale-98"
              >
                Submit Payout Request (${withdrawUsdValue}.00)
              </button>
            </div>

          </div>
        )}

        {/* TAB 3: BANKING HISTORY */}
        {activeTab === 'history' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            <div>
              <h3 className="text-xs font-bold uppercase text-zinc-300 mb-2">
                Recent Deposits & Incoming Funds
              </h3>

              {depositHistory.length === 0 ? (
                <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-center text-xs text-zinc-500">
                  No deposits yet. Make a deposit via crypto or card to receive chips and bonuses!
                </div>
              ) : (
                <div className="space-y-2">
                  {depositHistory.map(tx => (
                    <div key={tx.id} className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold">
                          ↓
                        </div>
                        <div>
                          <div className="font-bold text-white">${tx.usdAmount}.00 USD (+{tx.chipsCredited.toLocaleString()}c)</div>
                          <span className="text-[10px] text-zinc-400 block font-mono">{tx.methodDetails || tx.method.toUpperCase()}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          {tx.status}
                        </span>
                        <span className="text-[10px] text-zinc-500 block font-mono mt-0.5">
                          {new Date(tx.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase text-zinc-300 mb-2">
                Payout & Cashout Requests
              </h3>

              {payoutRequests.length === 0 ? (
                <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-center text-xs text-zinc-500">
                  No payout requests recorded. Cash out your chips at any time for real cash!
                </div>
              ) : (
                <div className="space-y-2">
                  {payoutRequests.map(req => (
                    <div key={req.id} className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold">
                          ↑
                        </div>
                        <div>
                          <div className="font-bold text-white">${req.usdAmount}.00 USD ({req.chipsAmount.toLocaleString()}c)</div>
                          <span className="text-[10px] text-zinc-400 block font-mono">{req.destination}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                          req.status === 'Approved' || req.status === 'Paid'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : req.status === 'Rejected'
                            ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        }`}>
                          {req.status}
                        </span>
                        <span className="text-[10px] text-zinc-500 block font-mono mt-0.5">
                          {new Date(req.requestedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
