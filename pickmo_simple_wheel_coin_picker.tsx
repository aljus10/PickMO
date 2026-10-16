import React, { useState, useRef, useEffect } from "react";

// ============================================================================
// NATIVE WEB AUDIO API SYNTHESIZER (Zero External Assets Required)
// ============================================================================
class SoundFX {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
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
    } catch (e) {
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
    } catch (e) {}
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
    } catch (e) {}
  }

  // 4. 4-note descending "wah-wah-wah-waaaah" when declining the paywall
  sadTrombone() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const notes = [
        { f: 293.66, start: 0, dur: 0.32 },    // D4
        { f: 277.18, start: 0.34, dur: 0.32 }, // C#4
        { f: 261.63, start: 0.68, dur: 0.32 }, // C4
        { f: 246.94, start: 1.02, dur: 0.78 }  // B3 sliding down
      ];

      notes.forEach((n) => {
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
    } catch (e) {}
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

export default function App() {
  // Navigation Mode: "wheel" | "coin"
  const [mode, setMode] = useState("wheel");
  const [muted, setMuted] = useState(false);

  // Mode 1: Wheel Picker State
  const [options, setOptions] = useState(DEFAULT_OPTIONS);
  const [newOption, setNewOption] = useState("");
  const [wheelRotation, setWheelRotation] = useState(0);
  const [pinBounce, setPinBounce] = useState(false);

  // Mode 2: Coin Flipper State
  const [sideA, setSideA] = useState("Study now");
  const [sideB, setSideB] = useState("Go to sleep");
  const [coinSpins, setCoinSpins] = useState(0);

  // Prank Flow State: "idle" | "spinning" | "paywall" | "checkout" | "revealed"
  const [status, setStatus] = useState("idle");
  const [winner, setWinner] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState("single"); // "single" | "monthly"
  const [paymentMethod, setPaymentMethod] = useState("gcash"); // "gcash" | "maya" | "bpi"
  const [checkoutStep, setCheckoutStep] = useState("qr"); // "qr" | "verifying" | "shortchange"
  const [shameBanner, setShameBanner] = useState(false);
  const [refNumber, setRefNumber] = useState("9018 4421 0983");

  const tickTimers = useRef([]);

  const clearTimers = () => {
    tickTimers.current.forEach((t) => clearTimeout(t));
    tickTimers.current = [];
  };

  useEffect(() => {
    return () => clearTimers();
  }, []);

  // --- SPIN WHEEL HANDLER ---
  const handleSpinWheel = () => {
    if (status === "spinning" || options.length < 2) return;
    setShameBanner(false);
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

    // Schedule mechanical plastic peg click sounds slowing down
    clearTimers();
    const totalDuration = 3400; // ms before paywall slams shut at 98%
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

    // Freeze/blur the wheel right as it settles and pop up the Peso Paywall Modal
    const lockTimer = setTimeout(() => {
      if (!muted) sfx.paywallHit();
      setStatus("paywall");
    }, totalDuration);
    tickTimers.current.push(lockTimer);
  };

  // --- FLIP COIN HANDLER ---
  const handleFlipCoin = () => {
    if (status === "spinning") return;
    setShameBanner(false);
    setStatus("spinning");

    if (!muted) sfx.coinClink();

    const isA = Math.random() < 0.5;
    setWinner(isA ? sideA : sideB);
    setCoinSpins((prev) => prev + 1800 + (isA ? 0 : 180));

    clearTimers();
    // Play subtle air flip ticks
    [350, 750, 1200, 1700, 2100].forEach((ms) => {
      const t = setTimeout(() => {
        if (!muted) sfx.tick(720);
      }, ms);
      tickTimers.current.push(t);
    });

    const lockTimer = setTimeout(() => {
      if (!muted) sfx.paywallHit();
      setStatus("paywall");
    }, 2400);
    tickTimers.current.push(lockTimer);
  };

  // --- ADD / REMOVE WHEEL ITEMS ---
  const addOption = (e) => {
    e.preventDefault();
    const trimmed = newOption.trim();
    if (!trimmed || options.length >= 12) return;
    setOptions([...options, trimmed]);
    setNewOption("");
  };

  const removeOption = (index) => {
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

  const handleDeclinePaywall = () => {
    if (!muted) sfx.sadTrombone();
    setStatus("idle");
    setShameBanner(true);
  };

  const openCheckout = (planKey) => {
    setSelectedPlan(planKey);
    setCheckoutStep("qr");
    const randomRef = `${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(
      1000 + Math.random() * 9000
    )} ${Math.floor(1000 + Math.random() * 9000)}`;
    setRefNumber(randomRef);
    setStatus("checkout");
  };

  const handleFakeVerifyPayment = () => {
    setCheckoutStep("verifying");
    const t = setTimeout(() => {
      if (!muted) sfx.paywallHit();
      setCheckoutStep("shortchange");
    }, 1800);
    tickTimers.current.push(t);
  };

  const paymentMethodLabel =
    paymentMethod === "bpi" ? "BDO / BPI" : paymentMethod.toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col">
      {/* 3D Coin Flip Helper Styles */}
      <style>{`
        .coin-container {
          perspective: 900px;
        }
        .coin-body {
          transform-style: preserve-3d;
        }
        .coin-face {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        .coin-face-back {
          transform: rotateX(180deg);
        }
      `}</style>

      {/* ====================================================================
          PLAIN EVERYDAY NAVBAR (Clean Light-Mode Utility Design)
         ==================================================================== */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
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
          TOP YELLOW BANNER WHEN USER DECLINES PAYMENT
         ==================================================================== */}
      {shameBanner && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 text-center text-xs sm:text-sm text-amber-900 flex flex-wrap items-center justify-center gap-3">
          <span>
            <strong>Result discarded:</strong> You refused to pay the{" "}
            <span className="underline font-semibold">₱60.92 Viewing Fee</span>,
            so we locked your result away.
          </span>
          <button
            onClick={() => {
              setShameBanner(false);
              setStatus("revealed");
            }}
            className="text-xs font-bold text-amber-900 bg-amber-200/70 hover:bg-amber-200 px-2.5 py-1 rounded-md underline cursor-pointer shrink-0 transition"
          >
            Fine, let me peek for free
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

                {/* FROSTED GLASS BLUR OVERLAY WHEN LOCKED */}
                {(status === "paywall" || status === "checkout" || shameBanner) && (
                  <div className="absolute inset-0 backdrop-blur-md bg-white/60 rounded-full flex flex-col items-center justify-center p-6 text-center border border-slate-200">
                    <span className="text-2xl mb-1">🔒</span>
                    <p className="font-bold text-slate-900 text-sm">
                      Result Hidden — Pay ₱60.92 to unblur winner
                    </p>
                    <button
                      onClick={() => setStatus("paywall")}
                      className="mt-2.5 px-3 py-1 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold rounded-md shadow-xs cursor-pointer"
                    >
                      Unlock Result (₱60.92)
                    </button>
                  </div>
                )}
              </div>

              {/* REVEALED WINNER CELEBRATION BOX */}
              {status === "revealed" && winner && (
                <div className="mt-5 w-full bg-emerald-50 border border-emerald-200 rounded-lg p-3.5 text-center">
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
                  placeholder="Add an option (e.g. Samgyup)..."
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
                {/* Heads (Side A) Face — Silver Outer Ring + Gold Center */}
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

                {/* Tails (Side B) Face */}
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
              {(status === "paywall" || status === "checkout" || shameBanner) && (
                <div className="absolute -inset-2 backdrop-blur-md bg-white/60 rounded-full border border-slate-200 flex flex-col items-center justify-center text-center p-3">
                  <span className="text-xl">🔒</span>
                  <span className="text-[11px] font-bold text-slate-900 mt-1 leading-tight">
                    Result Hidden — Pay ₱60.92 to unblur winner
                  </span>
                  <button
                    onClick={() => setStatus("paywall")}
                    className="mt-1.5 px-2.5 py-1 bg-[#2563EB] text-white text-[10px] font-semibold rounded cursor-pointer"
                  >
                    Unlock (₱60.92)
                  </button>
                </div>
              )}
            </div>

            {/* Revealed Coin Winner Box */}
            {status === "revealed" && winner && (
              <div className="mt-3 mb-2 w-full bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-center">
                <p className="text-xs text-emerald-700 font-semibold uppercase">
                  The coin landed on:
                </p>
                <p className="text-lg font-extrabold text-emerald-950 mt-0.5">
                  🎉 {winner}
                </p>
              </div>
            )}

            {/* Custom Inputs for Heads & Tails */}
            <div className="w-full grid grid-cols-2 gap-3 mt-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Heads (Side A)
                </label>
                <input
                  type="text"
                  value={sideA}
                  onChange={(e) => setSideA(e.target.value)}
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
                  onChange={(e) => setSideB(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#2563EB]"
                />
              </div>
            </div>

            {/* Quick English Presets */}
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
          </div>
        )}
      </main>

      {/* ====================================================================
          THE PUNCHLINE: PHILIPPINE PESO (₱) PAYWALL MODAL (ENGLISH COPY)
         ==================================================================== */}
      {status === "paywall" && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl my-auto">
            <div className="border-b border-slate-100 pb-4">
              <span className="inline-block bg-amber-100 text-amber-800 text-[11px] font-bold px-2.5 py-0.5 rounded mb-1.5">
                FREE SPIN LIMIT REACHED
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                Unlock Result to View Winner
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Spinning the wheel is 100% free, but seeing where it landed
                requires a one-time viewing pass.
              </p>
            </div>

            {/* ITEMIZED RECEIPT BOX IN PHP (₱) */}
            <div className="my-4 bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2">
              <div className="font-semibold text-slate-700 pb-1.5 border-b border-slate-200 flex justify-between">
                <span>Itemized Receipt Breakdown</span>
                <span>PHP (₱)</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Result Unblur Fee (1x peek)</span>
                <span>₱29.00</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Gravity & Friction Processing Fee</span>
                <span>₱12.00</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>E-Wallet Convenience Fee</span>
                <span>₱15.00</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>12% Value Added Tax (VAT)</span>
                <span>₱4.92</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-sm text-slate-900">
                <span>Total Amount Due</span>
                <span className="text-[#2563EB]">₱60.92</span>
              </div>
            </div>

            {/* 3 SATIRICAL PRICING CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 my-4 text-left">
              {/* Card 1: Free Tier */}
              <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/70 opacity-80 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-700">
                    Free Tier
                  </div>
                  <div className="text-lg font-extrabold text-slate-900 mt-0.5">
                    ₱0
                  </div>
                  <ul className="text-[11px] text-slate-500 mt-2 space-y-1">
                    <li>✓ Unlimited wheel spins</li>
                    <li>✕ Result remains blurred</li>
                    <li>✕ 85% weighted toward worst option</li>
                  </ul>
                </div>
                <button
                  disabled
                  className="mt-3 w-full py-1.5 text-[11px] bg-slate-200 text-slate-500 font-semibold rounded-md cursor-not-allowed"
                >
                  Current Plan
                </button>
              </div>

              {/* Card 2: Single Peek Pass (Highlighted with POPULAR badge) */}
              <div className="border-2 border-[#2563EB] rounded-xl p-3 bg-blue-50/30 relative flex flex-col justify-between">
                <span className="absolute -top-2 right-2 bg-[#2563EB] text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                  POPULAR
                </span>
                <div>
                  <div className="text-xs font-bold text-blue-950">
                    Single Peek Pass
                  </div>
                  <div className="text-lg font-extrabold text-slate-900 mt-0.5">
                    ₱60.92
                    <span className="text-[10px] font-normal text-slate-500">
                      {" "}
                      / spin
                    </span>
                  </div>
                  <ul className="text-[11px] text-slate-600 mt-2 space-y-1">
                    <li>✓ Unblurs current result</li>
                    <li>✓ 12% VAT included</li>
                    <li>✕ No refunds if you hate the outcome</li>
                  </ul>
                </div>
                <button
                  onClick={() => openCheckout("single")}
                  className="mt-3 w-full py-1.5 text-[11px] bg-[#2563EB] hover:bg-blue-700 text-white font-semibold rounded-md cursor-pointer transition"
                >
                  Pay ₱60.92
                </button>
              </div>

              {/* Card 3: VIP Overlord Pro */}
              <div className="border border-slate-200 rounded-xl p-3 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-800">
                    VIP Overlord Pro
                  </div>
                  <div className="text-lg font-extrabold text-slate-900 mt-0.5">
                    ₱499
                    <span className="text-[10px] font-normal text-slate-500">
                      {" "}
                      / month
                    </span>
                  </div>
                  <ul className="text-[11px] text-slate-600 mt-2 space-y-1">
                    <li>✓ Unlimited result viewing</li>
                    <li>✓ Rig the wheel in your favor</li>
                    <li>✓ Priority GCash support</li>
                  </ul>
                </div>
                <button
                  onClick={() => openCheckout("monthly")}
                  className="mt-3 w-full py-1.5 text-[11px] bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-md cursor-pointer transition"
                >
                  Subscribe (₱499)
                </button>
              </div>
            </div>

            {/* SHAME DECLINE LINK AT BOTTOM */}
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
          FAKE LOCAL E-WALLET CHECKOUT MODAL (GCash / Maya / BDO & BPI)
         ==================================================================== */}
      {status === "checkout" && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-sm w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="font-bold text-sm text-slate-900">
                Express E-Wallet Checkout
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
                    ? "bg-[#2563EB] text-white shadow-xs"
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
                  setPaymentMethod("bpi");
                  setCheckoutStep("qr");
                }}
                className={`py-1.5 rounded-md cursor-pointer transition ${
                  paymentMethod === "bpi"
                    ? "bg-red-700 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                BDO / BPI
              </button>
            </div>

            {checkoutStep === "qr" && (
              <div className="text-center">
                <p className="text-xs text-slate-500">Total Amount to Pay</p>
                <p className="text-2xl font-extrabold text-slate-900 my-0.5">
                  {selectedPlan === "single" ? "₱60.92" : "₱499.00"}
                </p>
                <p className="text-[11px] text-slate-400 mb-3">
                  Scan QR Ph using your <strong>{paymentMethodLabel}</strong>{" "}
                  app
                </p>

                {/* QR Ph Code Box */}
                <div className="w-44 h-44 mx-auto bg-white border-2 border-slate-200 rounded-xl p-3 flex flex-col items-center justify-center relative shadow-2xs">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <rect x="5" y="5" width="25" height="25" fill="#0f172a" />
                    <rect x="10" y="10" width="15" height="15" fill="#fff" />
                    <rect x="14" y="14" width="7" height="7" fill="#0f172a" />

                    <rect x="70" y="5" width="25" height="25" fill="#0f172a" />
                    <rect x="75" y="10" width="15" height="15" fill="#fff" />
                    <rect x="79" y="14" width="7" height="7" fill="#0f172a" />

                    <rect x="5" y="70" width="25" height="25" fill="#0f172a" />
                    <rect x="10" y="75" width="15" height="15" fill="#fff" />
                    <rect x="14" y="79" width="7" height="7" fill="#0f172a" />

                    {/* Center QR Ph Badge */}
                    <rect
                      x="38"
                      y="38"
                      width="24"
                      height="24"
                      rx="4"
                      fill="#2563EB"
                    />
                    <text
                      x="50"
                      y="52"
                      fill="#ffffff"
                      fontSize="9"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      QR Ph
                    </text>

                    {/* Data Modules */}
                    <rect x="40" y="10" width="8" height="8" fill="#0f172a" />
                    <rect x="52" y="16" width="8" height="14" fill="#0f172a" />
                    <rect x="12" y="42" width="16" height="8" fill="#0f172a" />
                    <rect x="70" y="42" width="18" height="8" fill="#0f172a" />
                    <rect x="14" y="54" width="10" height="10" fill="#0f172a" />
                    <rect x="42" y="68" width="12" height="22" fill="#0f172a" />
                    <rect x="64" y="68" width="14" height="14" fill="#0f172a" />
                    <rect x="82" y="76" width="10" height="14" fill="#0f172a" />
                  </svg>
                </div>

                <div className="mt-2.5 text-[11px] font-mono text-slate-400">
                  Ref No: {refNumber}
                </div>

                <button
                  onClick={handleFakeVerifyPayment}
                  className="mt-4 w-full py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-xs rounded-lg cursor-pointer transition shadow-xs"
                >
                  I've Paid (Verify Reference No.)
                </button>
              </div>
            )}

            {checkoutStep === "verifying" && (
              <div className="py-10 text-center space-y-3">
                <div className="w-8 h-8 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-semibold text-slate-700">
                  Checking payment with {paymentMethodLabel}...
                </p>
              </div>
            )}

            {checkoutStep === "shortchange" && (
              <div className="py-4 text-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto font-bold text-lg">
                  !
                </div>
                <h4 className="font-bold text-slate-900 text-sm">
                  Payment short by ₱0.25!
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Inflation increased while you were scanning the QR code. Since
                  we feel bad for you, you can view this result for free:
                </p>
                <button
                  onClick={() => setStatus("revealed")}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg cursor-pointer transition shadow-xs"
                >
                  Reveal Result (Free)
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}