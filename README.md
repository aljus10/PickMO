# 🎯 PickMo — Simple Wheel & Coin Picker

A clean, responsive decision-making web app featuring a customizable wheel picker, a 3D Philippine ₱10 coin flipper, native Web Audio sound synthesizer, and a hilarious Philippine Peso (₱) satirical paywall prank flow.

![PickMo Preview](https://raw.githubusercontent.com/placeholder/preview.png) *(Add your own screenshot once deployed)*

---

## ✨ Features

- 🎡 **Customizable Wheel Picker**: Add and remove up to 12 choices with distinct colors, smooth deceleration physics, and needle pin animations.
- 🪙 **3D Coin Flipper**: Realistic bi-metallic ₱10 coin flipping with 3D CSS perspective transforms and customizable Heads/Tails presets.
- 🔊 **Native Web Audio Synthesizer**: Zero external audio files required! Synthesizes mechanical clicks, metallic coin clinks, paywall buzzes, and comical sad trombone sounds on the fly.
- 💸 **The Punchline (Satirical Paywall)**: Slams shut right before revealing the result with an itemized VAT breakdown and fake GCash/Maya/BDO QR Ph checkout screen.
- ⚡ **Built with Vite & React**: Blazing fast load times, minimal bundle size, and full TypeScript type safety.
- 🎨 **Tailwind CSS**: Clean, modern UI styled to look like an authentic lightweight utility tool.

---

## 🚀 Quick Start (Local Development)

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- npm (comes with Node.js)

### Installation

1. **Clone or navigate to the project directory**:
   ```bash
   cd PickMO
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. Open your browser and visit: `http://localhost:5173`

---

## 🛠️ Build for Production

To create an optimized production build:

```bash
npm run build
```

This compiles your application into the `dist/` directory, ready to be hosted on any static hosting provider. You can preview the production build locally with:

```bash
npm run preview
```

---

## 📤 How to Push to GitHub

Follow these steps to push PickMo to your GitHub account:

### 1. Initialize Git

```bash
git init
git add .
git commit -m "Initial commit: PickMo web app"
```

### 2. Create a New Repository on GitHub

1. Go to [GitHub: New Repository](https://github.com/new).
2. Enter a repository name (for example, `PickMO` or `pickmo`).
3. Leave it Public (or Private).
4. **Do not** initialize with a README, `.gitignore`, or license (we already created them for you).
5. Click **Create repository**.

### 3. Link and Push

Copy the commands shown on GitHub or run:

```bash
git branch -M main
git remote add origin https://github.com/<YOUR-USERNAME>/<YOUR-REPO-NAME>.git
git push -u origin main
```

*(Replace `<YOUR-USERNAME>` and `<YOUR-REPO-NAME>` with your actual GitHub username and repository name).*

---

## 🌐 Deploying to the Web

### Option A: GitHub Pages (Automatic via GitHub Actions)

This repository already includes a pre-configured GitHub Actions workflow (`.github/workflows/deploy.yml`).

1. Push your code to GitHub following the steps above.
2. In your GitHub repository, go to **Settings** > **Pages**.
3. Under **Build and deployment** > **Source**, select **GitHub Actions**.
4. That's it! Every time you push to the `main` branch, GitHub will automatically build and deploy the website to `https://<YOUR-USERNAME>.github.io/<YOUR-REPO-NAME>/`.

### Option B: Vercel (1-Click Deployment)

1. Sign in to [Vercel](https://vercel.com).
2. Click **Add New Project** and import your `PickMO` repository.
3. Keep default settings (Framework preset: `Vite`).
4. Click **Deploy**.

### Option C: Netlify

1. Sign in to [Netlify](https://netlify.com).
2. Drag and drop the `dist/` folder, or connect your GitHub repository with build command `npm run build` and publish directory `dist`.

---

## 📂 Project Structure

```text
PickMO/
├── .github/
│   └── workflows/
│       └── deploy.yml          # Automated GitHub Pages CI/CD
├── public/
│   └── favicon.svg             # Branded SVG favicon
├── src/
│   ├── App.tsx                 # Main PickMo application component
│   ├── index.css               # Tailwind directives & 3D coin animations
│   └── main.tsx                # React application entry point
├── index.html                  # HTML entry point with meta tags
├── package.json                # Project dependencies and scripts
├── postcss.config.js           # PostCSS configuration
├── tailwind.config.js          # Tailwind CSS styling configuration
├── tsconfig.json               # TypeScript compiler configuration
├── vite.config.ts              # Vite bundler configuration
└── README.md                   # Project documentation
```

---

## 📄 License

MIT License — Feel free to use and modify for your own pranks, decisions, or projects!
