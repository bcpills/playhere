import React, { useState } from 'react';
import { 
  Crown, 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  X, 
  Check, 
  CreditCard, 
  Coins, 
  Star,
  CheckCircle2,
  Lock,
  ArrowRight,
  Shield,
  Smartphone,
  CheckCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/audio';
import { UserAccount } from '../types';

interface PayForAdFreeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userAccount?: UserAccount;
  isCurrentlyAdFree?: boolean;
  onUpgrade?: () => void;
  onUpgradeToAdFree?: () => void;
  onDowngrade?: () => void;
}

export const PayForAdFreeModal: React.FC<PayForAdFreeModalProps> = ({
  isOpen,
  onClose,
  userAccount,
  isCurrentlyAdFree,
  onUpgrade,
  onUpgradeToAdFree,
  onDowngrade,
}) => {
  // Checkout flow state: 'overview' | 'checkout' | 'processing' | 'success'
  const [checkoutStep, setCheckoutStep] = useState<'overview' | 'checkout' | 'processing' | 'success'>('overview');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'apple_pay' | 'google_pay' | 'crypto'>('card');
  const [cardNumber, setCardNumber] = useState<string>('•••• •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState<string>('12/28');
  const [cardCvc, setCardCvc] = useState<string>('888');
  const [cardName, setCardName] = useState<string>(userAccount?.googleName || userAccount?.username || 'Thomas J');
  const [couponCode, setCouponCode] = useState<string>('');
  const [couponApplied, setCouponApplied] = useState<boolean>(false);

  // Sync cardName if userAccount updates
  React.useEffect(() => {
    if (userAccount) {
      setCardName(userAccount.googleName || userAccount.username || 'Thomas J');
    }
  }, [userAccount]);

  if (!isOpen) return null;

  const isAlreadyAdFree = isCurrentlyAdFree ?? userAccount?.isAdFree ?? false;

  const handleApplyCoupon = () => {
    if (couponCode.trim().toUpperCase() === 'VIP' || couponCode.trim().toUpperCase() === 'CHIPZONE') {
      sound.playWin(false);
      setCouponApplied(true);
    } else {
      sound.playLoss();
    }
  };

  const handleStartCheckout = () => {
    sound.playChip();
    setCheckoutStep('checkout');
  };

  const handleSimulatedPayment = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playChip();
    setCheckoutStep('processing');

    setTimeout(() => {
      setCheckoutStep('success');
      sound.playWin(true);
      confetti({ particleCount: 150, spread: 90, origin: { y: 0.55 } });
      if (onUpgradeToAdFree) {
        onUpgradeToAdFree();
      }
      if (onUpgrade) {
        onUpgrade();
      }

      setTimeout(() => {
        setCheckoutStep('overview');
        onClose();
      }, 2500);
    }, 1500);
  };

  const handleModalClose = () => {
    sound.playChip();
    setCheckoutStep('overview');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-zinc-950 border-2 border-purple-500/60 rounded-3xl p-5 sm:p-7 shadow-2xl shadow-purple-950/40 relative overflow-hidden text-center max-h-[95vh] overflow-y-auto">
        {/* Glow background accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={handleModalClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-700 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Icon */}
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-purple-600 via-amber-500 to-yellow-400 p-0.5 shadow-xl shadow-purple-500/30 flex items-center justify-center mx-auto mb-2.5">
          <div className="w-full h-full bg-[#0d091a] rounded-[14px] flex items-center justify-center text-3xl">
            👑
          </div>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-xs font-black uppercase tracking-widest text-purple-400">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>ChipZone VIP Pass • Ad-Free Portal</span>
        </div>

        {/* STEP 1: OVERVIEW SCREEN */}
        {checkoutStep === 'overview' && (
          <div className="animate-fade-in">
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wide text-zinc-100 mt-1">
              {isAlreadyAdFree ? 'Ad-Free VIP Status Active' : 'Upgrade to Ad-Free Lounge'}
            </h2>

            <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto">
              {isAlreadyAdFree 
                ? 'Your account is permanently upgraded. You enjoy 100% ad-free gameplay, instant ATM reloads, and gold VIP status.'
                : 'Permanently remove banner ads, skip video ads for instant 100 chip ATM bailouts, and receive +500 bonus chips.'}
            </p>

            {/* Benefits Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 my-4 text-left">
              <div className="p-3 rounded-2xl bg-purple-950/30 border border-purple-500/30 flex items-start gap-2.5">
                <div className="p-2 rounded-xl bg-purple-900/50 text-purple-300 shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-black text-zinc-200">Zero Banner Ads</div>
                  <div className="text-[11px] text-zinc-400">No ads in Lobby, Blackjack tables, or Keno boards.</div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-amber-950/30 border border-amber-500/30 flex items-start gap-2.5">
                <div className="p-2 rounded-xl bg-amber-900/50 text-amber-300 shrink-0">
                  <Coins className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-black text-zinc-200">Instant ATM Bailouts</div>
                  <div className="text-[11px] text-zinc-400">Skip the 5s simulated ad requirement for free chips.</div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 flex items-start gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-900/50 text-indigo-300 shrink-0">
                  <Crown className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-black text-zinc-200">VIP Gold Crown Badge</div>
                  <div className="text-[11px] text-zinc-400">Crown prestige flair in chat and leaderboards.</div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex items-start gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-900/50 text-emerald-300 shrink-0">
                  <Star className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-black text-zinc-200">+500 Bonus Chips</div>
                  <div className="text-[11px] text-zinc-400">Instant chip grant deposited straight into bankroll.</div>
                </div>
              </div>
            </div>

            {/* Pricing Card */}
            {!isAlreadyAdFree ? (
              <div className="p-4 rounded-2xl bg-zinc-900/80 border-2 border-purple-500/60 mb-4 text-left flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full border-2 border-purple-400 bg-purple-500 flex items-center justify-center text-zinc-950">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <div>
                    <div className="text-sm font-black text-zinc-100 flex items-center gap-2">
                      <span>Lifetime VIP Ad-Free Pass</span>
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase font-black">
                        Lifetime
                      </span>
                    </div>
                    <div className="text-xs text-zinc-400">One-time pass • Instant activation • No recurring fees</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black text-amber-300 font-mono">$4.99</div>
                  <div className="text-[10px] text-zinc-500 line-through">$9.99</div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 font-bold text-sm flex items-center justify-center gap-2 mb-4">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>You currently own the Lifetime VIP Ad-Free Pass</span>
              </div>
            )}

            {/* Action CTA */}
            {!isAlreadyAdFree ? (
              <button
                onClick={handleStartCheckout}
                className="w-full py-3.5 px-4 rounded-2xl font-black text-sm uppercase tracking-wider bg-gradient-to-r from-purple-600 via-indigo-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-white shadow-xl shadow-purple-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-102 active:scale-98"
              >
                <CreditCard className="w-4 h-4" />
                <span>Proceed to Checkout ($4.99)</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            ) : (
              <button
                onClick={handleModalClose}
                className="w-full py-3 px-4 rounded-2xl font-black text-xs uppercase tracking-wider bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 transition-colors cursor-pointer"
              >
                Done
              </button>
            )}
          </div>
        )}

        {/* STEP 2: CHECKOUT / PLACEHOLDER PAYMENT PAGE */}
        {checkoutStep === 'checkout' && (
          <form onSubmit={handleSimulatedPayment} className="animate-fade-in text-left space-y-4 pt-1">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <div>
                <h3 className="text-base font-black uppercase text-zinc-100 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-400" />
                  <span>Secure VIP Checkout</span>
                </h3>
                <span className="text-[11px] text-zinc-400 font-mono">
                  Sandbox Demo Payment Gateway
                </span>
              </div>
              <div className="text-right">
                <div className="text-sm font-black text-amber-300 font-mono">
                  {couponApplied ? '$2.49 USD' : '$4.99 USD'}
                </div>
                {couponApplied && (
                  <span className="text-[9px] text-emerald-400 font-bold uppercase">50% VIP Promo Applied</span>
                )}
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="text-[10px] font-black uppercase text-zinc-400 block mb-1.5">
                Select Payment Method
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                    paymentMethod === 'card'
                      ? 'bg-purple-950/80 border-purple-500 text-purple-200 shadow-md'
                      : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span className="text-[10px] font-bold">Credit Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('apple_pay')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                    paymentMethod === 'apple_pay'
                      ? 'bg-purple-950/80 border-purple-500 text-purple-200 shadow-md'
                      : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  <span className="text-[10px] font-bold">Google / Apple Pay</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('crypto')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                    paymentMethod === 'crypto'
                      ? 'bg-purple-950/80 border-purple-500 text-purple-200 shadow-md'
                      : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <Coins className="w-4 h-4" />
                  <span className="text-[10px] font-bold">Crypto Pay</span>
                </button>
              </div>
            </div>

            {/* Payment Fields */}
            <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-3">
              <div>
                <label className="text-[10px] font-black uppercase text-zinc-400 block mb-1">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  required
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-bold text-zinc-100 focus:outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-zinc-400 block mb-1">
                  Card Number (Pre-filled Sandbox Test)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-100 focus:outline-none focus:border-purple-400"
                  />
                  <span className="absolute right-3 top-2 text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-500/30">
                    TEST OK
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[10px] font-black uppercase text-zinc-400 block mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    required
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-100 focus:outline-none focus:border-purple-400"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-zinc-400 block mb-1">
                    CVC / CVV
                  </label>
                  <input
                    type="text"
                    required
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-100 focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>
            </div>

            {/* Promo Code Input */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Promo code (e.g. VIP)"
                className="flex-1 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 uppercase font-mono focus:outline-none focus:border-purple-400"
              />
              <button
                type="button"
                onClick={handleApplyCoupon}
                className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition-colors cursor-pointer"
              >
                Apply
              </button>
            </div>

            {/* Back & Submit Actions */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCheckoutStep('overview')}
                className="px-4 py-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs font-bold transition-colors cursor-pointer"
              >
                Back
              </button>

              <button
                type="submit"
                className="flex-1 py-3.5 px-4 rounded-2xl font-black text-sm uppercase tracking-wider bg-gradient-to-r from-emerald-600 via-teal-600 to-amber-500 hover:from-emerald-500 hover:to-amber-400 text-white shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-102 active:scale-98"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Complete Purchase ({couponApplied ? '$2.49' : '$4.99'})</span>
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: PROCESSING SCREEN */}
        {checkoutStep === 'processing' && (
          <div className="py-10 space-y-4 animate-fade-in">
            <div className="w-16 h-16 rounded-full border-4 border-purple-500/30 border-t-purple-400 animate-spin mx-auto" />
            <div className="space-y-1">
              <h3 className="text-base font-black uppercase text-zinc-100">
                Authorizing High-Roller VIP Order...
              </h3>
              <p className="text-xs text-zinc-400 font-mono">
                Connecting to payment network • Granting lifetime ad-free & +500 chips
              </p>
            </div>
          </div>
        )}

        {/* STEP 4: SUCCESS SCREEN */}
        {checkoutStep === 'success' && (
          <div className="py-8 space-y-4 animate-fade-in text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-300 flex items-center justify-center text-3xl mx-auto shadow-xl shadow-emerald-500/20 animate-bounce">
              ✓
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-black uppercase text-emerald-300">
                Payment Successful!
              </h3>
              <p className="text-xs text-zinc-300">
                Welcome to the ChipZone Ad-Free VIP Lounge! All ads have been permanently removed and 500 bonus chips have been deposited.
              </p>
            </div>
          </div>
        )}

        {/* Footer Security Notice */}
        <div className="mt-4 pt-3 border-t border-zinc-900 text-[10px] text-zinc-500 flex items-center justify-center gap-1.5">
          <Shield className="w-3 h-3 text-emerald-400" />
          <span>256-Bit SSL Encryption • Instant VIP Entitlement Activation</span>
        </div>
      </div>
    </div>
  );
};
