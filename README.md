# 🏆 KGF Gold TradeX — Admin Portal

> Web-based administration console for **KGF Gold TradeX** — manage users, merchants, transactions, withdrawals, and merchant operations from a single dashboard.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7.1-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![MUI](https://img.shields.io/badge/MUI-7.3-007FFF?logo=mui&logoColor=white)](https://mui.com/)
[![React Router](https://img.shields.io/badge/React_Router-7.9-CA4245?logo=reactrouter&logoColor=white)](https://reactrouter.com/)
[![Axios](https://img.shields.io/badge/Axios-1.7-5A29E4?logo=axios&logoColor=white)](https://axios-http.com/)
[![ESLint](https://img.shields.io/badge/ESLint-9-4B32C3?logo=eslint&logoColor=white)](https://eslint.org/)
[![License](https://img.shields.io/badge/License-Private-red)](LICENSE)

---

## 📋 Table of Contents

- [✨ Features](#features)
- [🛠 Tech Stack](#tech-stack)
- [📦 Prerequisites](#prerequisites)
- [🚀 Quick Start](#quick-start)
- [⚙️ Environment Variables](#environment-variables)
- [📜 Available Scripts](#available-scripts)
- [📁 Project Structure](#project-structure)
- [🗺 Routes & Roles](#routes-and-roles)
- [🔌 API Proxy](#api-proxy)
- [🏗 Production Build](#production-build)
- [🔐 Development Credentials](#development-credentials)
- [📄 License](#license)

---

<a id="features"></a>

## ✨ Features

### 👑 Super Admin

| Feature | Description |
| -------- | ----------- |
| 🔐 **Authentication** | Secure login with role-based route guards (`SUPER_ADMIN`) |
| 📊 **Dashboard** | System overview and key statistics |
| 👥 **User management** | View, create, edit, and delete platform users |
| 🏪 **Merchants** | Manage merchant accounts and onboarding |
| 💳 **Transactions** | Monitor and review platform transactions |
| 💰 **Withdrawals** | Process and track withdrawal requests |

### 🏪 Merchant Portal

| Feature | Description |
| -------- | ----------- |
| 📈 **Merchant dashboard** | Business metrics at a glance |
| 📦 **Products** | Manage product catalog and categories |
| 🚚 **Orders** | Order management and fulfillment |

### 🎨 Experience

- 🌓 Light / dark theme toggle with glassmorphism UI components
- 📱 Fully responsive layout (desktop & mobile)
- 🔔 Toast notifications for user feedback
- ⚡ Fast dev experience powered by Vite HMR

---

<a id="tech-stack"></a>

## 🛠 Tech Stack

| Layer | Technology |
| ----- | ---------- |
| **UI** | [React](https://react.dev/) 18 + [Material UI](https://mui.com/) 7 |
| **Language** | [TypeScript](https://www.typescriptlang.org/) 5.8 |
| **Build** | [Vite](https://vitejs.dev/) 7 |
| **Routing** | [React Router](https://reactrouter.com/) 7 |
| **HTTP** | [Axios](https://axios-http.com/) |
| **Styling** | MUI + Emotion, custom glassmorphism theme |
| **Linting** | ESLint 9 + TypeScript ESLint |

---

<a id="prerequisites"></a>

## 📦 Prerequisites

- **Node.js** `20.x` or later ([download](https://nodejs.org/))
- **npm** `10+` (ships with Node.js)
- Running **KGF Gold TradeX API** backend (default: `http://localhost:5001`)

---

<a id="quick-start"></a>

## 🚀 Quick Start

### 1️⃣ Clone & install

```bash
git clone <repository-url>
cd kgf-gold-tradex-admin-portal
npm install
```

### 2️⃣ Configure environment (optional)

Create a `.env` file in the project root:

```env
VITE_API_URL=http://localhost:5001/api/v1
```

> If omitted, the app uses the Vite dev proxy (see [API Proxy](#api-proxy)).

### 3️⃣ Start development server

```bash
npm run dev
```

Open **[http://localhost:4001](http://localhost:4001)** in your browser.

---

<a id="environment-variables"></a>

## ⚙️ Environment Variables

| Variable | Required | Default | Description |
| -------- | -------- | ------- | ----------- |
| `VITE_API_URL` | No | *(via proxy in dev)* | Base URL for the REST API (`/api/v1`) |

Example `.env`:

```env
VITE_API_URL=http://localhost:5001/api/v1
```

---

<a id="available-scripts"></a>

## 📜 Available Scripts

| Command | Description |
| ------- | ----------- |
| `npm run dev` | Start Vite dev server on port **4001** |
| `npm run build` | Type-check + production build → `dist/` |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint across the project |
| `npm run type-check` | Run TypeScript compiler without emitting |

---

<a id="project-structure"></a>

## 📁 Project Structure

```
kgf-gold-tradex-admin-portal/
├── public/                 # Static assets
├── src/
│   ├── components/         # Shared UI (Layout, dialogs, Glass components)
│   ├── contexts/           # Theme & toast providers
│   ├── pages/              # Route-level pages (admin + merchant)
│   ├── services/           # API clients (auth, admin, merchant, spot trade)
│   ├── theme/              # MUI theme, glassmorphism, animations
│   ├── constants/          # App constants (e.g. product categories)
│   ├── App.tsx             # Routes & role-based guards
│   └── main.tsx            # App entry point
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

<a id="routes-and-roles"></a>

## 🗺 Routes & Roles

### Super Admin (`SUPER_ADMIN`)

| Path | Page |
| ---- | ---- |
| `/login` | Login |
| `/dashboard` | Dashboard |
| `/users` | User management |
| `/merchants` | Merchant management |
| `/transactions` | Transactions |
| `/withdrawals` | Withdrawals |

### Merchant (`MERCHANT`)

| Path | Page |
| ---- | ---- |
| `/login` | Login |
| `/merchant` | Merchant dashboard |
| `/merchant/products` | Products |
| `/merchant/orders` | Order management |

Unauthenticated users are redirected to `/login`. Role-based home redirects run from `/`.

---

<a id="api-proxy"></a>

## 🔌 API Proxy

During development, Vite proxies `/api` requests to the backend:

```ts
// vite.config.ts
proxy: {
  '/api': {
    target: 'http://localhost:5001',
    changeOrigin: true,
  },
},
```

Ensure the API server is running on port **5001** when using the proxy, or set `VITE_API_URL` for a direct API URL.

---

<a id="production-build"></a>

## 🏗 Production Build

```bash
npm run build
```

Output is written to the **`dist/`** directory. Serve with any static host (Nginx, S3, CDN, etc.).

```bash
npm run preview   # optional: preview the production build locally
```

Configure your host to fallback to `index.html` for client-side routing (SPA).

---

<a id="development-credentials"></a>

## 🔐 Development Credentials

> ⚠️ **For local development only.** Do not use default credentials in production. Rotate secrets before any deployment.

| Role | Email | Password |
| ---- | ----- | -------- |
| Super Admin | `admin@gmail.com` | `1234admin@` |

---

<a id="license"></a>

## 📄 License

This project is **private** and proprietary. Unauthorized copying, distribution, or use is prohibited.

---

<p align="center">
  Built with ❤️ for <strong>KGF Gold TradeX</strong>
</p>
