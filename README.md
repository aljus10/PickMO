# PickMo

A lightweight, modern web utility for making quick everyday decisions using an interactive customizable wheel and a 3D coin flip simulator.

Built with React, TypeScript, Vite, and Tailwind CSS.

---

## Overview

PickMo provides a minimalist, clean interface designed to solve indecision—whether choosing what to eat, picking tasks, or settling 50/50 dilemmas.

### Highlights

- **Dynamic Decision Wheel**: Smooth SVG-based physics wheel with customizable slices and audio-assisted deceleration.
- **3D Perspective Coin Flipper**: Bi-metallic coin flip simulation utilizing CSS 3D perspective transforms.
- **Audio Synthesizer Engine**: Procedural Web Audio API integration with zero external asset dependencies.
- **Zero Third-Party UI Bloat**: Handcrafted responsive UI optimized for performance and mobile responsiveness.

---

## Getting Started

### Prerequisites

- Node.js (v18.0.0 or higher)
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/aljus10/PickMO.git
cd PickMO

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available locally at `http://localhost:5173`.

### Production Build

```bash
npm run build
```

Compiled static output will be generated in the `dist/` directory.

---

## Tech Stack

- **Frontend**: React 18
- **Language**: TypeScript
- **Bundler**: Vite
- **Styling**: Tailwind CSS
- **Audio**: Web Audio API (Native Oscillator & Gain Nodes)
- **Deployment**: Cloudflare Pages / Static Hosting

---

## License & Usage

© 2026 Al Justin Marollano. All rights reserved.

This repository is maintained for portfolio, personal development, and demonstration purposes. No license is granted for public redistribution, mirroring, commercial reproduction, or unauthorized cloning of the application flow without prior written consent.
