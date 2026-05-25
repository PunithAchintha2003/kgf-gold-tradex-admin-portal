# KGF Gold TradeX — Admin Portal

Web administration console for **KGF Gold TradeX**: manage users, merchants, spot trades, withdrawals, and merchant operations from a single dashboard.

**Live app:** [https://kgf-gold-tradex-admin-portal.vercel.app/](https://kgf-gold-tradex-admin-portal.vercel.app/)

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7.1-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![MUI](https://img.shields.io/badge/MUI-7.3-007FFF?logo=mui&logoColor=white)](https://mui.com/)
[![License](https://img.shields.io/badge/License-Private-red)](LICENSE)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)
- [Project Structure](#project-structure)
- [Routes & Roles](#routes--roles)
- [API & Development Proxy](#api--development-proxy)
- [Deployment](#deployment)
- [CI/CD](#cicd)
- [License](#license)

---

## Overview

The admin portal serves two audiences:

| Role | Purpose |
|------|---------|
| **Super Admin** | Platform oversight — users, merchants, transactions, withdrawals, backups, and income metrics |
| **Merchant** | Day-to-day operations — products, orders, auctions, and support chat |

Authentication is role-based. Routes and navigation adapt to `SUPER_ADMIN` vs `MERCHANT` after login.

---

## Features

### Super Admin

| Area | Capabilities |
|------|----------------|
| **Authentication** | Email/password login with optional OTP verification step; forgot-password flow; session and role guards |
| **Dashboard** | User, merchant, login, transaction, and withdrawal stats; spot-trade income summary (LKR); platform backup download |
| **User management** | Searchable user directory; create, edit, and manage accounts |
| **Merchants** | Merchant onboarding and account management |
| **Transactions** | Tabbed **wallet transactions** and **spot trades**; search; mark-as-seen; **CSV export** |
| **Withdrawals** | Review and process withdrawal requests |
| **Notifications** | Real-time alerts via Socket.IO; withdrawal pending count on nav badge; notification bell with read/unread state |
| **Profile & settings** | Account details; change email/password; light/dark theme; admin **data backup** controls |

### Merchant Portal

| Area | Capabilities |
|------|----------------|
| **Dashboard** | Business metrics and overview |
| **Products** | Product catalog and categories |
| **Orders** | Order management and fulfillment |
| **Auctions** | Browse auctions and dedicated auction management |
| **Support chat** | Live merchant chat sidebar (Socket.IO) |
| **Profile & settings** | Same account and security flows as admin, scoped to merchant portal |

### Experience

- Glassmorphism UI (MUI + custom glass components)
- Light / dark theme with persisted preference
- Responsive layout — collapsible sidebar, mobile drawer
- Toast feedback ([Sonner](https://sonner.emilkowal.ski/))
- Consistent API error messaging across pages

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| UI | React 18, Material UI 7, Emotion |
| Language | TypeScript 5.8 |
| Build | Vite 7 |
| Routing | React Router 7 |
| HTTP | Axios |
| Real-time | Socket.IO client |
| Notifications | Sonner + custom notification context |
| Linting | ESLint 9 (flat config), TypeScript ESLint |

---

## Prerequisites

- **Node.js** 20.x or later
- **npm** 10+ (bundled with Node.js)
- Running **KGF Gold TradeX API** (default dev target: `http://localhost:5001`)

For the live deployment, the API URL is configured in Vercel project environment variables (`VITE_API_URL`).

---

## Getting Started

### 1. Clone and install

```bash
git clone <repository-url>
cd kgf-gold-tradex-admin-portal
npm install
```

### 2. Environment (optional for local dev)

Create `.env` in the project root:

```env
VITE_API_URL=http://localhost:5001/api/v1
```

If omitted, the dev server proxies `/api` to the backend (see [API & Development Proxy](#api--development-proxy)).

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:4001](http://localhost:4001).

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_URL` | No (dev) / Yes (prod) | Dev proxy → `localhost:5001` | REST API base URL including `/api/v1` |

Example:

```env
VITE_API_URL=http://localhost:5001/api/v1
```

> Do not commit `.env` files. Set production values in the Vercel project dashboard.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Vite dev server on port **4001** |
| `npm run build` | Type-check + production build → `dist/` |
| `npm run preview` | Preview production build locally |
| `npm run lint` | ESLint |
| `npm run type-check` | `tsc --noEmit` |

---

## Project Structure

```
kgf-gold-tradex-admin-portal/
├── public/                      # Static assets
├── src/
│   ├── components/              # Layout, glass UI, auth, chat, notifications, admin backup
│   ├── contexts/                # Theme, toast, notifications, merchant chat
│   ├── hooks/                   # Backup-related hooks
│   ├── pages/                   # Admin + merchant route pages
│   ├── services/                # API clients (auth, admin, merchant, spot trade, auction, chat, socket)
│   ├── theme/                   # MUI theme, glassmorphism, animations
│   ├── types/                   # Shared types (e.g. notifications)
│   ├── utils/                   # CSV export, API errors, formatting
│   ├── App.tsx                  # Routes and role guards
│   └── main.tsx                 # Providers and entry
├── .github/workflows/           # CI and Vercel deploy
├── vercel.json                  # SPA rewrites
├── vite.config.ts
└── package.json
```

---

## Routes & Roles

### Super Admin (`SUPER_ADMIN`)

| Path | Page |
|------|------|
| `/login` | Login (with OTP step when required) |
| `/forgot-password` | Password recovery |
| `/dashboard` | Dashboard |
| `/users` | User management |
| `/merchants` | Merchant management |
| `/transactions` | Wallet + spot trade transactions |
| `/withdrawals` | Withdrawals |
| `/profile` | Profile |
| `/settings` | Settings & backup |

### Merchant (`MERCHANT`)

| Path | Page |
|------|------|
| `/login` | Login |
| `/forgot-password` | Password recovery |
| `/merchant` | Dashboard |
| `/merchant/products` | Products |
| `/merchant/orders` | Orders |
| `/merchant/auctions` | Auctions |
| `/merchant/auctions/management` | Auction management |
| `/merchant/profile` | Profile |
| `/merchant/settings` | Settings |

Unauthenticated users are redirected to `/login`. `/` redirects to the role-appropriate home.

---

## API & Development Proxy

During development, Vite proxies API requests:

```ts
// vite.config.ts
proxy: {
  '/api': {
    target: 'http://localhost:5001',
    changeOrigin: true,
  },
},
```

Start the API on port **5001**, or set `VITE_API_URL` for a direct backend URL.

---

## Deployment

Production is hosted on **Vercel**:

- **URL:** [https://kgf-gold-tradex-admin-portal.vercel.app/](https://kgf-gold-tradex-admin-portal.vercel.app/)
- **SPA routing:** `vercel.json` rewrites all paths to `index.html`
- **Build:** `npm run build` (TypeScript check + Vite)
- **Env:** Set `VITE_API_URL` to your production API (e.g. `https://api.example.com/api/v1`)

### Manual build

```bash
npm run build
npm run preview   # optional local preview of dist/
```

Serve `dist/` with SPA fallback to `index.html` on any static host.

Pushes to `main` trigger automated Vercel deploys via GitHub Actions (see [CI/CD](#cicd)).

---

## CI/CD

| Workflow | Trigger | Actions |
|----------|---------|---------|
| **CI** (`.github/workflows/ci.yml`) | Push/PR to `main` | `npm ci`, lint, type-check |
| **Deploy to Vercel** (`.github/workflows/deploy-vercel.yml`) | Push/PR to `main` | Vercel pull, build, deploy (production on `main`) |

Required GitHub secrets for deploy: `VERCEL_TOKEN`, `VERCEL_USER_ID`, `VERCEL_PROJECT_ID`.

---

## License

This project is **private** and proprietary. Unauthorized copying, distribution, or use is prohibited.

---

<p align="center">
  <strong>KGF Gold TradeX</strong> — Admin Portal
</p>
