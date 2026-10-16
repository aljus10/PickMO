# 🎯 PickMo — Simple Wheel & Coin Picker

A modern decision-making web application featuring a customizable wheel picker, a 3D Philippine ₱10 coin flipper, native Web Audio sound synthesizer, and a satirical Philippine Peso / Crypto paywall flow with real QR code verification (GCash, Maya, and USDT Ethereum).

---

## ✨ Features & Game Flow

1. **🎁 1x Free Peek**: The user's very first spin or coin flip is 100% free! It smoothly reveals the winner, establishing trust.
2. **🔒 Hard Paywall on 2nd Spin+**: On the second spin and beyond, the paywall slams shut at 98% deceleration. The winner is blurred and strictly locked behind the **₱60.00** Viewing Pass (or **1.05 USDT**). No bypasses or free peeks.
3. **💳 Real Payment Gateways Supported**:
   - **GCash**: Real cropped InstaPay QR code with copyable account details.
   - **Maya**: Real cropped QR code with username `@aljus10`.
   - **USDT (Crypto)**: Ethereum network (ERC-20) wallet address `0xd8c8e26e0c230611d5ed8ac51e868f1d7cda769d` with 1-click address copy.
4. **✅ Payment & Reference Verification**:
   - Users enter their Reference Number or Transaction Hash (TxHash).
   - Validates input format, simulates gateway clearing, issues a verifiable digital receipt, and unblurs the winner!
   - Purchasing the **VIP Overlord Pro (₱499)** permanently unlocks all future spins with a VIP badge.
5. **🛡️ Built-in Security**:
   - **DOM Sanitization**: Result winner string is withheld from the DOM while locked to prevent DevTools inspect peeking.
   - **Input Sanitization**: Wheel options and reference fields are sanitized against XSS.
   - **Cloudflare Security Headers**: Pre-configured `_headers` with strict `Content-Security-Policy`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, and `Strict-Transport-Security`.

---

## 🚀 Local Development

```bash
# 1. Install dependencies
npm install

# 2. Start local dev server
npm run dev

# 3. Build for production
npm run build
```

---

## ☁️ How to Deploy to Cloudflare Pages (Custom Domain)

To have your own clean website domain (e.g. `pickmo.com` or `pickmo.yourdomain.com` with **no** `.vercel.app` or other branding):

### Step 1: Push your code to GitHub
If you haven't pushed yet:
```bash
git add .
git commit -m "Update: 1x free peek, real QR codes, and Cloudflare config"
git push -u origin main
```

### Step 2: Connect to Cloudflare Pages
1. Log in to your [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. In the left navigation, click **Compute (Workers & Pages)** > **Pages** > **Connect to Git**.
3. Select your **GitHub** account and choose your `PickMO` repository.
4. Set up the build settings:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/`
5. Click **Save and Deploy**. Cloudflare will build and deploy your site in ~30 seconds!

### Step 3: Add Your Custom Domain (Remove Any Platform Subdomains)
1. Once deployed, open your project in the Cloudflare Pages dashboard.
2. Click the **Custom domains** tab.
3. Click **Set up a custom domain**.
4. Enter your domain (e.g., `pickmo.com` or `app.yourdomain.com`).
5. Cloudflare automatically sets up DNS routing and provisions an SSL/TLS certificate. Your website will now be live on your custom domain with zero third-party branding.

---

## ⚙️ Configuration

All payment methods, pricing, and QR codes are managed in [`src/config.ts`](./src/config.ts):
- Single Peek Pass: `₱60.00` / `1.05 USDT`
- VIP Overlord Pro: `₱499.00` / `9.00 USDT`
- QR code images: stored in `/public/qr-gcash.png`, `/public/qr-maya.png`, and `/public/qr-usdt.png`.
