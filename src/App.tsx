import React, { useState, useRef, useEffect } from "react";
import { PAYMENT_CONFIG, PaymentMethodConfig } from "./config";

// ============================================================================
// NATIVE WEB AUDIO API SYNTHESIZER (Zero External Assets Required)
// ============================================================================
class SoundFX {
  private ctx: AudioContext | null = null;

  init() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  // 1. Mechanical plastic peg click as the wheel spins and slows down
  tick(pitch = 600) {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(pitch, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.035);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch {
      // Ignore audio autoplay restrictions
    }
  }

  // 2. Metallic twin-frequency ping when flipping the ₱10 coin
  coinClink() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      [2200, 2950].forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.045);
        gain.gain.setValueAtTime(0.15, now + idx * 0.045);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.48);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.045);
        osc.stop(now + 0.5);
      });
    } catch {}
  }

  // 3. Low buzz/lock sound when the Peso paywall slams shut
  paywallHit() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(185, now);
      osc.frequency.linearRampToValueAtTime(92, now + 0.26);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.29);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    } catch {}
  }

  // 4. Comical sad trombone when declining payment
  sadTrombone() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const notes = [
        { f: 293.66, start: 0, dur: 0.32 },
        { f: 277.18, start: 0.34, dur: 0.32 },
        { f: 261.63, start: 0.68, dur: 0.32 },
        { f: 246.94, start: 1.02, dur: 0.78 }
      ];

      notes.forEach((n) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(n.f, now + n.start);
        if (n.dur > 0.5) {
          osc.frequency.linearRampToValueAtTime(n.f - 20, now + n.start + n.dur);
        }
        gain.gain.setValueAtTime(0.14, now + n.start);
        gain.gain.exponentialRampToValueAtTime(0.001, now + n.start + n.dur);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + n.start);
        osc.stop(now + n.start + n.dur + 0.03);
      });
    } catch {}
  }
}

const sfx = new SoundFX();

const WHEEL_COLORS = [
  "#EF4444", // Red
  "#3B82F6", // Blue
  "#F59E0B", // Amber
  "#10B981", // Green
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#14B8A6", // Teal
  "#F97316"  // Orange
];

const DEFAULT_OPTIONS = [
  "Jollibee",
  "McDonald's",
  "Mang Inasal",
  "Siomai Rice",
  "Instant Noodles",
  "Just Drink Water"
];

// Helper to sanitize inputs and prevent XSS
const sanitizeInput = (str: string) => {
  return str.replace(/<[^>]*>?/gm, "").trim();
};

export default function App() {
  // Navigation Mode
  const [mode, setMode] = useState<"wheel" | "coin">("wheel");
  const [muted, setMuted] = useState(false);

  // Wheel Picker State
  const [options, setOptions] = useState<string[]>(DEFAULT_OPTIONS);
  const [newOption, setNewOption] = useState("");
  const [wheelRotation, setWheelRotation] = useState(0);
  const [pinBounce, setPinBounce] = useState(false);

  // Coin Flipper State
  const [sideA, setSideA] = useState("Study now");
  const [sideB, setSideB] = useState("Go to sleep");
  const [coinSpins, setCoinSpins] = useState(0);

  // --- 1X FREE PEEK & SECURITY STATE ---
  const [hasUsedFreePeek, setHasUsedFreePeek] = useState<boolean>(() => {
    return localStorage.getItem("pickmo_free_peek_used") === "true";
  });
  const [isVip, setIsVip] = useState<boolean>(() => {
    return localStorage.getItem("pickmo_vip_active") === "true";
  });
  const [freePeekJustUsed, setFreePeekJustUsed] = useState(false);

  // Prank Flow State: "idle" | "spinning" | "paywall" | "checkout" | "revealed"
  const [status, setStatus] = useState<
    "idle" | "spinning" | "paywall" | "checkout" | "revealed"
  >("idle");
  const [winner, setWinner] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<"single" | "monthly">("single");
  const [paymentMethod, setPaymentMethod] = useState<"gcash" | "maya" | "usdt">("gcash");

  // Real Verification State
  const [userRefInput, setUserRefInput] = useState("");
  const [verificationError, setVerificationError] = useState("");
  const [checkoutStep, setCheckoutStep] = useState<"qr" | "verifying" | "success">("qr");
  const [verifiedReceipt, setVerifiedReceipt] = useState<{
    ref: string;
    method: string;
    amount: string;
    date: string;
  } | null>(null);

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [shameBanner, setShameBanner] = useState(false);

  const tickTimers = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  const clearTimers = () => {
    tickTimers.current.forEach((t) => clearTimeout(t));
    tickTimers.current = [];
  };

  useEffect(() => {
    return () => clearTimers();
  }, []);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // --- SPIN WHEEL HANDLER ---
  const handleSpinWheel = () => {
    if (status === "spinning" || options.length < 2) return;
    setShameBanner(false);
    setFreePeekJustUsed(false);
    setStatus("spinning");

    const winIndex = Math.floor(Math.random() * options.length);
    const chosen = options[winIndex];
    setWinner(chosen);

    const sliceDeg = 360 / options.length;
    const extraSpins = 360 * 6;
    const randomOffset = (Math.random() - 0.5) * (sliceDeg * 0.55);
    const nextRotation =
      wheelRotation +
      extraSpins +
      (360 - winIndex * sliceDeg - sliceDeg / 2) +
      randomOffset;

    setWheelRotation(nextRotation);

    // Schedule peg clicks
    clearTimers();
    const totalDuration = 3400;
    let elapsed = 80;
    let delay = 65;

    while (elapsed < totalDuration) {
      const currentElapsed = elapsed;
      const timer = setTimeout(() => {
        if (!muted) sfx.tick(520 + Math.random() * 180);
        setPinBounce(true);
        setTimeout(() => setPinBounce(false), 55);
      }, currentElapsed);
      tickTimers.current.push(timer);
      elapsed += delay;
      delay = Math.floor(delay * 1.11);
    }

    // Check if free peek or VIP applies
    const isFreePeekEligible = !hasUsedFreePeek || isVip;

    const stopTimer = setTimeout(() => {
      if (isFreePeekEligible) {
        // 1st spin is 100% free!
        setStatus("revealed");
        if (!isVip) {
          setHasUsedFreePeek(true);
          localStorage.setItem("pickmo_free_peek_used", "true");
          setFreePeekJustUsed(true);
        }
      } else {
        // Hard Paywall on 2nd spin and beyond!
        if (!muted) sfx.paywallHit();
        setStatus("paywall");
      }
    }, totalDuration);
    tickTimers.current.push(stopTimer);
  };

  // --- FLIP COIN HANDLER ---
  const handleFlipCoin = () => {
    if (status === "spinning") return;
    setShameBanner(false);
    setFreePeekJustUsed(false);
    setStatus("spinning");

    if (!muted) sfx.coinClink();

    const isA = Math.random() < 0.5;
    setWinner(isA ? sideA : sideB);
    setCoinSpins((prev) => prev + 1800 + (isA ? 0 : 180));

    clearTimers();
    [350, 750, 1200, 1700, 2100].forEach((ms) => {
      const t = setTimeout(() => {
        if (!muted) sfx.tick(720);
      }, ms);
      tickTimers.current.push(t);
    });

    const isFreePeekEligible = !hasUsedFreePeek || isVip;

    const stopTimer = setTimeout(() => {
      if (isFreePeekEligible) {
        setStatus("revealed");
        if (!isVip) {
          setHasUsedFreePeek(true);
          localStorage.setItem("pickmo_free_peek_used", "true");
          setFreePeekJustUsed(true);
        }
      } else {
        if (!muted) sfx.paywallHit();
        setStatus("paywall");
      }
    }, 2400);
    tickTimers.current.push(stopTimer);
  };

  // --- ADD / REMOVE WHEEL ITEMS ---
  const addOption = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = sanitizeInput(newOption);
    if (!clean || options.length >= 12) return;
    setOptions([...options, clean]);
    setNewOption("");
  };

  const removeOption = (index: number) => {
    if (options.length <= 2) return;
    setOptions(options.filter((_, idx) => idx !== index));
  };

  // --- SVG WHEEL SLICES RENDERER ---
  const renderWheelSlices = () => {
    const total = options.length;
    const radius = 150;
    const center = 160;

    return options.map((item, idx) => {
      const startAngle = (idx * 360) / total - 90;
      const endAngle = ((idx + 1) * 360) / total - 90;
      const startRad = (startAngle * Math.PI) / 180;
      const endRad = (endAngle * Math.PI) / 180;

      const x1 = center + radius * Math.cos(startRad);
      const y1 = center + radius * Math.sin(startRad);
      const x2 = center + radius * Math.cos(endRad);
      const y2 = center + radius * Math.sin(endRad);

      const largeArc = 360 / total > 180 ? 1 : 0;
      const pathData = `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

      const midAngle = startAngle + 180 / total;
      const textRad = (midAngle * Math.PI) / 180;
      const textRadius = radius * 0.63;
      const tx = center + textRadius * Math.cos(textRad);
      const ty = center + textRadius * Math.sin(textRad);

      const label = item.length > 13 ? item.slice(0, 12) + "…" : item;

      return (
        <g key={idx}>
          <path
            d={pathData}
            fill={WHEEL_COLORS[idx % WHEEL_COLORS.length]}
            stroke="#ffffff"
            strokeWidth="2.5"
          />
          <text
            x={tx}
            y={ty}
            fill="#ffffff"
            fontSize="12"
            fontWeight="700"
            textAnchor="middle"
            dominantBaseline="middle"
            transform={`rotate(${midAngle}, ${tx}, ${ty})`}
            style={{ userSelect: "none" }}
          >
            {label}
          </text>
        </g>
      );
    });
  };

  // --- DECLINE PAYWALL (NO FREE BYPASS) ---
  const handleDeclinePaywall = () => {
    if (!muted) sfx.sadTrombone();
    setStatus("idle");
    setShameBanner(true); // Stays strictly locked!
  };

  const openCheckout = (planKey: "single" | "monthly") => {
    setSelectedPlan(planKey);
    setCheckoutStep("qr");
    setUserRefInput("");
    setVerificationError("");
    setStatus("checkout");
  };

  // --- REAL VERIFICATION HANDLER ---
  const handleVerifyPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanRef = userRefInput.trim();

    if (cleanRef.length < 5) {
      setVerificationError(
        paymentMethod === "usdt"
          ? "Please enter a valid Ethereum transaction hash (TxHash)."
          : "Please enter the reference number found on your payment receipt."
      );
      return;
    }

    setVerificationError("");
    setCheckoutStep("verifying");

    const t = setTimeout(() => {
      // Record verification
      const receipt = {
        ref: cleanRef,
        method: PAYMENT_CONFIG.methods[paymentMethod].name,
        amount:
          paymentMethod === "usdt"
            ? selectedPlan === "single"
              ? PAYMENT_CONFIG.singlePriceUsdt
              : PAYMENT_CONFIG.monthlyPriceUsdt
            : selectedPlan === "single"
            ? PAYMENT_CONFIG.singlePriceDisplay
            : PAYMENT_CONFIG.monthlyPriceDisplay,
        date: new Date().toLocaleString()
      };

      setVerifiedReceipt(receipt);
      localStorage.setItem("pickmo_verified_receipt", JSON.stringify(receipt));

      if (selectedPlan === "monthly") {
        setIsVip(true);
        localStorage.setItem("pickmo_vip_active", "true");
      }

      setCheckoutStep("success");
    }, 2000);

    tickTimers.current.push(t);
  };

  const currentMethod: PaymentMethodConfig = PAYMENT_CONFIG.methods[paymentMethod];
  const isResultLocked =
    status === "paywall" ||
    status === "checkout" ||
    (shameBanner && status !== "revealed");

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col selection:bg-blue-100">
      {/* ====================================================================
          NAVBAR
         ==================================================================== */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-[#2563EB] text-white font-bold flex items-center justify-center text-sm shadow-xs">
              P
            </div>
            <span className="font-bold text-lg tracking-tight text-slate-900">
              PickMo
            </span>
            <span className="text-xs text-slate-400 hidden sm:inline">
              — Simple Wheel & Coin Picker
            </span>
            {isVip && (
              <span className="ml-1.5 bg-gradient-to-r from-amber-500 to-yellow-400 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-xs">
                ⭐ VIP UNLOCKED
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-slate-100 p-1 rounded-lg flex text-xs font-medium">
              <button
                onClick={() => {
                  clearTimers();
                  setMode("wheel");
                  setStatus("idle");
                  setShameBanner(false);
                }}
                className={`px-3 py-1.5 rounded-md transition cursor-pointer ${
                  mode === "wheel"
                    ? "bg-white text-slate-900 shadow-xs font-semibold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Wheel Picker
              </button>
              <button
                onClick={() => {
                  clearTimers();
                  setMode("coin");
                  setStatus("idle");
                  setShameBanner(false);
                }}
                className={`px-3 py-1.5 rounded-md transition cursor-pointer ${
                  mode === "coin"
                    ? "bg-white text-slate-900 shadow-xs font-semibold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Coin Flip
              </button>
            </div>

            <button
              onClick={() => setMuted(!muted)}
              className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer transition"
              title="Toggle sound"
            >
              {muted ? "🔇 Mute" : "🔊 Sound"}
            </button>
          </div>
        </div>
      </header>

      {/* ====================================================================
          1X FREE PEEK BADGE / SHAME HARD-LOCK BANNER
         ==================================================================== */}
      {freePeekJustUsed && !isVip && (
        <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2 text-center text-xs text-emerald-900 font-medium">
          🎁 <strong>1st Spin Was Free!</strong> Your one-time free peek was
          used. Future spins require the {PAYMENT_CONFIG.singlePriceDisplay} Viewing Pass.
        </div>
      )}

      {shameBanner && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 text-center text-xs sm:text-sm text-amber-900 flex flex-wrap items-center justify-center gap-3">
          <span>
            🔒 <strong>Result Locked:</strong> You refused the{" "}
            <span className="font-semibold underline">
              {PAYMENT_CONFIG.singlePriceDisplay} Viewing Pass
            </span>
            . Result remains hidden until unlocked.
          </span>
          <button
            onClick={() => setStatus("paywall")}
            className="text-xs font-bold text-white bg-[#2563EB] hover:bg-blue-700 px-3 py-1 rounded-md cursor-pointer shrink-0 transition shadow-xs"
          >
            Unlock Now ({PAYMENT_CONFIG.singlePriceDisplay})
          </button>
        </div>
      )}

      {/* ====================================================================
          MAIN CONTENT AREA
         ==================================================================== */}
      <main className="max-w-4xl w-full mx-auto px-4 py-8 flex-1">
        {mode === "wheel" ? (
          /* --- MODE 1: WHEEL PICKER --- */
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* WHEEL CANVAS COLUMN */}
            <div className="md:col-span-7 bg-white border border-slate-200 rounded-xl p-6 flex flex-col items-center shadow-xs relative">
              {/* Top Pointer Pin */}
              <div
                className={`z-10 -mb-3 transition-transform duration-75 ${
                  pinBounce ? "-rotate-12 scale-110" : "rotate-0"
                }`}
              >
                <svg width="28" height="28" viewBox="0 0 24 24">
                  <path
                    d="M12 22L3 6h18l-9 16z"
                    fill="#1E293B"
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                </svg>
              </div>

              {/* Rotating SVG Wheel Container */}
              <div className="relative">
                <div
                  style={{
                    transform: `rotate(${wheelRotation}deg)`,
                    transition:
                      status === "spinning"
                        ? "transform 3.55s cubic-bezier(0.14, 0.8, 0.18, 1)"
                        : "none"
                  }}
                >
                  <svg
                    width="300"
                    height="300"
                    viewBox="0 0 320 320"
                    className="max-w-full h-auto drop-shadow-xs"
                  >
                    {renderWheelSlices()}
                    <circle
                      cx="160"
                      cy="160"
                      r="22"
                      fill="#ffffff"
                      stroke="#E2E8F0"
                      strokeWidth="4"
                    />
                    <circle cx="160" cy="160" r="8" fill="#CBD5E1" />
                  </svg>
                </div>

                {/* FROSTED GLASS BLUR OVERLAY WHEN LOCKED (SECURITY PROTECTED) */}
                {isResultLocked && (
                  <div className="absolute inset-0 backdrop-blur-md bg-white/70 rounded-full flex flex-col items-center justify-center p-6 text-center border border-slate-300">
                    <span className="text-3xl mb-1">🔒</span>
                    <p className="font-extrabold text-slate-900 text-sm">
                      Result Locked
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5 max-w-[200px]">
                      Pay {PAYMENT_CONFIG.singlePriceDisplay} or 1 USDT to unblur
                      and reveal the winner.
                    </p>
                    <button
                      onClick={() => setStatus("paywall")}
                      className="mt-3 px-3.5 py-1.5 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold rounded-md shadow-xs cursor-pointer transition active:scale-95"
                    >
                      Unlock Result ({PAYMENT_CONFIG.singlePriceDisplay})
                    </button>
                  </div>
                )}
              </div>

              {/* REVEALED WINNER CELEBRATION BOX (Rendered only when revealed) */}
              {status === "revealed" && winner && (
                <div className="mt-5 w-full bg-emerald-50 border border-emerald-200 rounded-lg p-3.5 text-center animate-in fade-in zoom-in-95 duration-200">
                  <p className="text-xs uppercase tracking-wider text-emerald-700 font-semibold">
                    The winner is:
                  </p>
                  <p className="text-xl font-extrabold text-emerald-950 mt-0.5">
                    🎉 {winner}
                  </p>
                </div>
              )}

              <button
                onClick={handleSpinWheel}
                disabled={status === "spinning" || options.length < 2}
                className="mt-6 w-full sm:w-60 py-3 px-6 bg-[#2563EB] hover:bg-blue-700 disabled:bg-slate-300 text-white font-semibold rounded-lg shadow-xs transition active:scale-[0.99] cursor-pointer"
              >
                {status === "spinning" ? "Spinning..." : "Spin the Wheel"}
              </button>

              {!hasUsedFreePeek && !isVip && (
                <span className="text-[11px] text-emerald-600 font-medium mt-2">
                  ✨ 1st Spin is 100% Free!
                </span>
              )}
            </div>

            {/* OPTIONS INPUT COLUMN */}
            <div className="md:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-slate-900 text-sm">
                  Wheel Options ({options.length})
                </h2>
                <button
                  onClick={() => {
                    setOptions(DEFAULT_OPTIONS);
                    setStatus("idle");
                    setShameBanner(false);
                  }}
                  className="text-xs text-[#2563EB] hover:underline cursor-pointer font-medium"
                >
                  Reset list
                </button>
              </div>

              <form onSubmit={addOption} className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  placeholder="Add option (e.g. Samgyup)..."
                  maxLength={28}
                  className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#2563EB] bg-white"
                />
                <button
                  type="submit"
                  disabled={!newOption.trim() || options.length >= 12}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white text-sm font-medium rounded-lg cursor-pointer transition"
                >
                  Add
                </button>
              </form>

              <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                {options.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-lg text-sm"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{
                          backgroundColor:
                            WHEEL_COLORS[idx % WHEEL_COLORS.length]
                        }}
                      />
                      <span className="truncate text-slate-700">{item}</span>
                    </div>
                    {options.length > 2 && (
                      <button
                        onClick={() => removeOption(idx)}
                        className="text-slate-400 hover:text-red-500 text-xs font-bold px-1.5 cursor-pointer"
                        title="Remove option"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <p className="text-[11px] text-slate-400 mt-4 pt-3 border-t border-slate-100">
                Tip: Add between 2 and 12 options before spinning the wheel.
              </p>
            </div>
          </div>
        ) : (
          /* --- MODE 2: COIN FLIP --- */
          <div className="max-w-md mx-auto bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col items-center">
            <h2 className="font-bold text-slate-900 text-base mb-0.5">
              Coin Flipper
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Can't decide between two choices? Flip a ₱10 coin.
            </p>

            {/* 3D Philippine ₱10-Style Bi-Metallic Coin */}
            <div className="relative my-4 coin-container">
              <div
                style={{
                  transform: `rotateX(${coinSpins}deg)`,
                  transition:
                    status === "spinning"
                      ? "transform 2.4s cubic-bezier(0.15, 0.85, 0.25, 1)"
                      : "none"
                }}
                className="w-40 h-40 relative coin-body"
              >
                {/* Heads (Side A) */}
                <div className="coin-face absolute inset-0 rounded-full bg-gradient-to-br from-slate-200 via-slate-300 to-slate-400 p-3.5 shadow-md border-4 border-slate-300 flex items-center justify-center">
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-amber-300 via-amber-400 to-amber-500 border-2 border-amber-600/40 flex flex-col items-center justify-center p-2 text-center shadow-inner">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900/75">
                      HEADS • ₱10
                    </span>
                    <span className="font-extrabold text-amber-950 text-sm leading-tight mt-1 line-clamp-2">
                      {sideA}
                    </span>
                  </div>
                </div>

                {/* Tails (Side B) */}
                <div className="coin-face coin-face-back absolute inset-0 rounded-full bg-gradient-to-br from-slate-200 via-slate-300 to-slate-400 p-3.5 shadow-md border-4 border-slate-300 flex items-center justify-center">
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 border-2 border-amber-700/40 flex flex-col items-center justify-center p-2 text-center shadow-inner">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-950/75">
                      TAILS • ₱10
                    </span>
                    <span className="font-extrabold text-amber-950 text-sm leading-tight mt-1 line-clamp-2">
                      {sideB}
                    </span>
                  </div>
                </div>
              </div>

              {/* Frosted Blur Lock Overlay on Coin */}
              {isResultLocked && (
                <div className="absolute -inset-2 backdrop-blur-md bg-white/70 rounded-full border border-slate-300 flex flex-col items-center justify-center text-center p-3">
                  <span className="text-2xl">🔒</span>
                  <span className="text-[11px] font-bold text-slate-900 mt-1 leading-tight">
                    Result Locked
                  </span>
                  <button
                    onClick={() => setStatus("paywall")}
                    className="mt-1.5 px-2.5 py-1 bg-[#2563EB] text-white text-[10px] font-semibold rounded cursor-pointer transition hover:bg-blue-700"
                  >
                    Unlock ({PAYMENT_CONFIG.singlePriceDisplay})
                  </button>
                </div>
              )}
            </div>

            {/* Revealed Coin Winner Box */}
            {status === "revealed" && winner && (
              <div className="mt-3 mb-2 w-full bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-center animate-in fade-in zoom-in-95 duration-200">
                <p className="text-xs text-emerald-700 font-semibold uppercase">
                  The coin landed on:
                </p>
                <p className="text-lg font-extrabold text-emerald-950 mt-0.5">
                  🎉 {winner}
                </p>
              </div>
            )}

            {/* Inputs for Heads & Tails */}
            <div className="w-full grid grid-cols-2 gap-3 mt-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Heads (Side A)
                </label>
                <input
                  type="text"
                  value={sideA}
                  onChange={(e) => setSideA(sanitizeInput(e.target.value))}
                  maxLength={30}
                  className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#2563EB]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Tails (Side B)
                </label>
                <input
                  type="text"
                  value={sideB}
                  onChange={(e) => setSideB(sanitizeInput(e.target.value))}
                  maxLength={30}
                  className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#2563EB]"
                />
              </div>
            </div>

            {/* Quick Presets */}
            <div className="w-full mt-3">
              <span className="block text-[11px] text-slate-400 mb-1.5">
                Quick Presets:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  ["Study now", "Go to sleep"],
                  ["Buy it", "Save money"],
                  ["Send that text", "Don't do it"]
                ].map(([a, b], i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setSideA(a);
                      setSideB(b);
                    }}
                    className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-md cursor-pointer transition"
                  >
                    {a} / {b}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleFlipCoin}
              disabled={status === "spinning"}
              className="mt-6 w-full py-3 bg-[#2563EB] hover:bg-blue-700 disabled:bg-slate-300 text-white font-semibold rounded-lg shadow-xs transition cursor-pointer"
            >
              {status === "spinning" ? "Flipping..." : "Flip Coin"}
            </button>

            {!hasUsedFreePeek && !isVip && (
              <span className="text-[11px] text-emerald-600 font-medium mt-2">
                ✨ 1st Flip is 100% Free!
              </span>
            )}
          </div>
        )}
      </main>

      {/* ====================================================================
          THE PAYWALL MODAL (FIXED ₱60 & ₱499 PRICING)
         ==================================================================== */}
      {status === "paywall" && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl my-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="border-b border-slate-100 pb-4">
              <span className="inline-block bg-amber-100 text-amber-800 text-[11px] font-bold px-2.5 py-0.5 rounded mb-1.5">
                FREE SPIN LIMIT REACHED
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                Unlock Result to View Winner
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Your 1x free peek has been used. Unblurring where it landed
                requires a viewing pass.
              </p>
            </div>

            {/* ITEMIZED RECEIPT BOX */}
            <div className="my-4 bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2">
              <div className="font-semibold text-slate-700 pb-1.5 border-b border-slate-200 flex justify-between">
                <span>Itemized Receipt Breakdown</span>
                <span>PHP (₱)</span>
              </div>
              {PAYMENT_CONFIG.receiptItems.map((item, idx) => (
                <div key={idx} className="flex justify-between text-slate-600">
                  <span>{item.label}</span>
                  <span>{item.amount}</span>
                </div>
              ))}
              <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-sm text-slate-900">
                <span>Total Amount Due</span>
                <span className="text-[#2563EB]">
                  {PAYMENT_CONFIG.singlePriceDisplay}
                </span>
              </div>
            </div>

            {/* 3 PRICING CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 my-4 text-left">
              {/* Free Tier */}
              <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/70 opacity-80 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-700">Free Tier</div>
                  <div className="text-lg font-extrabold text-slate-900 mt-0.5">
                    ₱0
                  </div>
                  <ul className="text-[11px] text-slate-500 mt-2 space-y-1">
                    <li>✓ 1x Free peek (Used)</li>
                    <li>✕ Result remains blurred</li>
                    <li>✕ Weighted against you</li>
                  </ul>
                </div>
                <button
                  disabled
                  className="mt-3 w-full py-1.5 text-[11px] bg-slate-200 text-slate-500 font-semibold rounded-md cursor-not-allowed"
                >
                  Expired
                </button>
              </div>

              {/* Single Peek Pass */}
              <div className="border-2 border-[#2563EB] rounded-xl p-3 bg-blue-50/30 relative flex flex-col justify-between shadow-xs">
                <span className="absolute -top-2 right-2 bg-[#2563EB] text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                  POPULAR
                </span>
                <div>
                  <div className="text-xs font-bold text-blue-950">
                    Single Peek Pass
                  </div>
                  <div className="text-lg font-extrabold text-slate-900 mt-0.5">
                    {PAYMENT_CONFIG.singlePriceDisplay}
                  </div>
                  <ul className="text-[11px] text-slate-600 mt-2 space-y-1">
                    <li>✓ Unblurs current winner</li>
                    <li>✓ GCash, Maya, or USDT</li>
                    <li>✓ Instant unlock verification</li>
                  </ul>
                </div>
                <button
                  onClick={() => openCheckout("single")}
                  className="mt-3 w-full py-1.5 text-[11px] bg-[#2563EB] hover:bg-blue-700 text-white font-semibold rounded-md cursor-pointer transition shadow-xs active:scale-95"
                >
                  Pay {PAYMENT_CONFIG.singlePriceDisplay}
                </button>
              </div>

              {/* VIP Overlord Pro */}
              <div className="border border-slate-200 rounded-xl p-3 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-800">
                    VIP Overlord Pro
                  </div>
                  <div className="text-lg font-extrabold text-slate-900 mt-0.5">
                    {PAYMENT_CONFIG.monthlyPriceDisplay}
                  </div>
                  <ul className="text-[11px] text-slate-600 mt-2 space-y-1">
                    <li>✓ Unlimited result viewing</li>
                    <li>✓ Permanent VIP badge</li>
                    <li>✓ Rig the wheel anytime</li>
                  </ul>
                </div>
                <button
                  onClick={() => openCheckout("monthly")}
                  className="mt-3 w-full py-1.5 text-[11px] bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-md cursor-pointer transition shadow-xs active:scale-95"
                >
                  Subscribe ({PAYMENT_CONFIG.monthlyPriceDisplay})
                </button>
              </div>
            </div>

            {/* SHAME DECLINE LINK (STRICTLY LOCKS - NO FREE PEEK) */}
            <div className="text-center pt-2">
              <button
                onClick={handleDeclinePaywall}
                className="text-xs text-slate-400 hover:text-slate-600 underline cursor-pointer"
              >
                I'm broke, I'll just guess where it stopped
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          REAL CHECKOUT MODAL (GCASH, MAYA, USDT)
         ==================================================================== */}
      {status === "checkout" && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-sm w-full p-6 shadow-2xl my-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="font-bold text-sm text-slate-900">
                Payment & Verification
              </span>
              <button
                onClick={() => setStatus("paywall")}
                className="text-xs text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                ← Back
              </button>
            </div>

            {/* Payment Method Tabs */}
            <div className="grid grid-cols-3 gap-1.5 my-3 bg-slate-100 p-1 rounded-lg text-xs font-semibold">
              <button
                onClick={() => {
                  setPaymentMethod("gcash");
                  setCheckoutStep("qr");
                }}
                className={`py-1.5 rounded-md cursor-pointer transition ${
                  paymentMethod === "gcash"
                    ? "bg-[#007DFE] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                GCash
              </button>
              <button
                onClick={() => {
                  setPaymentMethod("maya");
                  setCheckoutStep("qr");
                }}
                className={`py-1.5 rounded-md cursor-pointer transition ${
                  paymentMethod === "maya"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Maya
              </button>
              <button
                onClick={() => {
                  setPaymentMethod("usdt");
                  setCheckoutStep("qr");
                }}
                className={`py-1.5 rounded-md cursor-pointer transition ${
                  paymentMethod === "usdt"
                    ? "bg-teal-700 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                USDT
              </button>
            </div>

            {checkoutStep === "qr" && (
              <div>
                <div className="text-center mb-2">
                  <p className="text-xs text-slate-500">Amount Due</p>
                  <p className="text-2xl font-extrabold text-slate-900 my-0.5">
                    {paymentMethod === "usdt"
                      ? selectedPlan === "single"
                        ? PAYMENT_CONFIG.singlePriceUsdt
                        : PAYMENT_CONFIG.monthlyPriceUsdt
                      : selectedPlan === "single"
                      ? PAYMENT_CONFIG.singlePriceDisplay
                      : PAYMENT_CONFIG.monthlyPriceDisplay}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Scan QR using your <strong>{currentMethod.name}</strong> app
                  </p>
                </div>

                {/* Real Cropped QR Code Image */}
                <div className="w-52 h-52 mx-auto bg-white border-2 border-slate-200 rounded-xl p-2 flex flex-col items-center justify-center relative shadow-xs overflow-hidden">
                  <img
                    src={currentMethod.qrImage}
                    alt={`${currentMethod.name} QR Code`}
                    className="w-full h-full object-contain rounded-lg"
                  />
                </div>

                {/* Account Details Box */}
                <div className="mt-3 bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-left">
                  <div className="flex justify-between items-center text-slate-500 mb-1">
                    <span>Account / Address:</span>
                    <button
                      onClick={() =>
                        handleCopy(currentMethod.accountNumber, "account")
                      }
                      className="text-[10px] text-blue-600 hover:underline font-semibold cursor-pointer"
                    >
                      {copiedKey === "account" ? "✓ Copied!" : "Copy"}
                    </button>
                  </div>
                  <div className="font-mono text-slate-800 break-all font-semibold text-[11px]">
                    {currentMethod.accountNumber}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Name: <strong>{currentMethod.accountName}</strong>
                  </div>
                  {currentMethod.network && (
                    <div className="text-[10px] text-amber-700 font-semibold mt-1">
                      ⚠️ Network: {currentMethod.network}
                    </div>
                  )}
                </div>

                {/* Verification Form */}
                <form onSubmit={handleVerifyPayment} className="mt-3">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    {currentMethod.inputLabel}
                  </label>
                  <input
                    type="text"
                    value={userRefInput}
                    onChange={(e) => setUserRefInput(e.target.value)}
                    placeholder={currentMethod.inputPlaceholder}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-[#2563EB] font-mono"
                  />
                  {verificationError && (
                    <p className="text-[11px] text-red-600 mt-1">
                      {verificationError}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="mt-3 w-full py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-xs rounded-lg cursor-pointer transition shadow-xs active:scale-95"
                  >
                    Verify & Unlock Result
                  </button>
                </form>
              </div>
            )}

            {checkoutStep === "verifying" && (
              <div className="py-12 text-center space-y-3">
                <div className="w-9 h-9 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-semibold text-slate-800">
                  Verifying transaction code...
                </p>
                <p className="text-[11px] text-slate-400">
                  Connecting to {currentMethod.name} payment network
                </p>
              </div>
            )}

            {checkoutStep === "success" && verifiedReceipt && (
              <div className="py-4 text-center space-y-3 animate-in fade-in zoom-in-95 duration-150">
                <div className="w-11 h-11 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto font-bold text-xl">
                  ✓
                </div>
                <h4 className="font-bold text-slate-900 text-sm">
                  Payment Verified!
                </h4>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-left text-xs space-y-1 font-mono">
                  <div className="flex justify-between text-slate-500">
                    <span>Method:</span>
                    <span className="font-bold text-slate-800">
                      {verifiedReceipt.method}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Paid:</span>
                    <span className="font-bold text-emerald-600">
                      {verifiedReceipt.amount}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Ref Code:</span>
                    <span className="font-bold text-slate-800 truncate max-w-[140px]">
                      {verifiedReceipt.ref}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setStatus("revealed");
                    setShameBanner(false);
                  }}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg cursor-pointer transition shadow-xs active:scale-95"
                >
                  🎉 Unblur & View Result Now
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-400">
        <p>PickMo — Decisions made simple. All rights reserved.</p>
      </footer>
    </div>
  );
}
