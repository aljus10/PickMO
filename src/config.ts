// ============================================================================
// PICKMO PAYMENT & SECURITY CONFIGURATION
// ============================================================================

export interface PaymentMethodConfig {
  id: "gcash" | "maya" | "usdt";
  name: string;
  tagline: string;
  badge: string;
  color: string;
  bgColor: string;
  textColor: string;
  accountName: string;
  accountNumber: string;
  qrImage: string;
  instructions: string;
  network?: string;
  inputPlaceholder: string;
  inputLabel: string;
}

export const PAYMENT_CONFIG = {
  // Fixed Pricing
  singlePricePhp: 60,
  singlePriceDisplay: "₱60.00",
  singlePriceUsdt: "1.05 USDT",

  monthlyPricePhp: 499,
  monthlyPriceDisplay: "₱499.00",
  monthlyPriceUsdt: "9.00 USDT",

  // Payment Methods
  methods: {
    gcash: {
      id: "gcash",
      name: "GCash",
      tagline: "Instant via GCash / InstaPay QR",
      badge: "Fastest",
      color: "#007DFE",
      bgColor: "bg-blue-600",
      textColor: "text-blue-600",
      accountName: "A* JU***N M.",
      accountNumber: "0997 957 ••••",
      qrImage: "./qr-gcash.png",
      instructions: "Scan the QR using your GCash app or upload screenshot to GCash QR reader.",
      inputLabel: "GCash Reference Number",
      inputPlaceholder: "e.g. 9018 4421 0983"
    },
    maya: {
      id: "maya",
      name: "Maya",
      tagline: "Pay via Maya / InstaPay QR",
      badge: "No Fee",
      color: "#00D632",
      bgColor: "bg-emerald-600",
      textColor: "text-emerald-600",
      accountName: "AL JUSTIN MAROLLANO",
      accountNumber: "@aljus10 (+63 *** *** 9593)",
      qrImage: "./qr-maya.png",
      instructions: "Scan with your Maya app or send to username @aljus10.",
      inputLabel: "Maya Reference / Transaction ID",
      inputPlaceholder: "e.g. MAYA-98124501"
    },
    usdt: {
      id: "usdt",
      name: "USDT (Crypto)",
      tagline: "Pay with USDT on Ethereum Network",
      badge: "ERC-20",
      color: "#26A17B",
      bgColor: "bg-teal-700",
      textColor: "text-teal-700",
      accountName: "USDT (Ethereum)",
      accountNumber: "0xd8c8e26e0c230611d5ed8ac51e868f1d7cda769d",
      qrImage: "./qr-usdt.png",
      network: "Ethereum (ERC-20)",
      instructions: "⚠️ Only send USDT on Ethereum network (ERC-20). Do NOT send via BSC/Tron.",
      inputLabel: "Transaction Hash (TxHash)",
      inputPlaceholder: "0x..."
    }
  } as Record<"gcash" | "maya" | "usdt", PaymentMethodConfig>,

  // Receipt Breakdown for ₱60 flat fee
  receiptItems: [
    { label: "Result Unblur Fee (1x Peek)", amount: "₱35.00" },
    { label: "Gravity & Friction Processing Fee", amount: "₱10.00" },
    { label: "E-Wallet / Blockchain Gateway Fee", amount: "₱10.00" },
    { label: "12% Value Added Tax (VAT)", amount: "₱5.00" }
  ]
};
