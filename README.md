# ⚡ Lightning Sentinel

> **AI-powered Lightning Network watchdog** that monitors real-time transactions, detects anomalies, and delivers smart, local-first wallet intelligence — all with privacy at its core.

!

---

## 🏆 What Is Lightning Sentinel?

**Lightning Sentinel** is a privacy-focused, AI-powered dashboard for monitoring the **Bitcoin Lightning Network**. Designed for node operators, researchers, and everyday crypto users, it provides:

✅ Real-time transaction insights  
✅ Local AI risk detection  
✅ Taproot-friendly, self-custodial intelligence  

All powered without sending your data to the cloud.

---

## 🌍 Why This Matters

As Bitcoin adoption grows and self-custody becomes mainstream, **Lightning transactions** must be trusted, monitored, and understood — without relying on third parties. Lightning Sentinel bridges this gap with:

- **Local AI analysis** for full privacy  
- **Live visualizations** to track flow & anomalies  
- **Instant alerts** for suspicious behavior  
- **Zero cloud dependencies** for absolute sovereignty  

---

## 🔥 Features

### 🧠 AI-Powered Risk Analysis (Offline)

- Wallet behavior scoring  
- Anomaly & pattern detection (locally via TensorFlow.js)  
- Human-readable summaries of complex tx patterns  

### ⚡ Real-Time Monitoring

- Lightning node activity visualized live  
- Test payment simulation for demos  
- Transaction tagging + AI-driven feedback  

### 💻 Developer-First Dashboard

- Dark mode UI built for uptime  
- Chart.js-driven dynamic visuals  
- One-click simulation to demo transactions  
- Tooltip-based insights + AI alert banners  

---

## 🛠 Tech Stack

![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TensorFlow](https://img.shields.io/badge/TensorFlow-%23FF6F00.svg?style=for-the-badge&logo=TensorFlow&logoColor=white)
![Bitcoin](https://img.shields.io/badge/Bitcoin-000?style=for-the-badge&logo=bitcoin&logoColor=white)
![Chart.js](https://img.shields.io/badge/chart.js-F5788D.svg?style=for-the-badge&logo=chart.js&logoColor=white)

- ⚛️ Frontend: React + Vite  
- 📊 Visuals: Chart.js  
- 🤖 AI: TensorFlow.js (runs entirely in-browser)  
- ⚡ Lightning Node: LND via WebSocket  
- 🧩 Self-contained: No backend servers needed  

---

## 🏗 Architecture

```mermaid
graph TD
    A[Lightning Network] --> B[Local LND Node]
    B --> C[WebSocket Service]
    C --> D[Transaction Monitor]
    D --> E[AI Risk Engine (TensorFlow.js)]
    E --> F[Dashboard UI (React)]
    E --> G[AI Alert System]
```

---

## 🚀 Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev

# 3. Build for production
npm run build
```

To connect to your own LND node, configure the WebSocket endpoint and authentication details inside `config.js`.

---

## 🔒 Privacy & Security

- No cloud or server dependency  
- AI runs entirely in-browser with TensorFlow.js  
- Zero data sharing or tracking  
- Fully compatible with Taproot & private channels  

---

## 🤝 Built For Hackathons

- Works out-of-the-box on testnet  
- Visual-first: easy to demo in < 30 seconds  
- Extensible for enterprise, researchers, or educational use  
- Deploys instantly on Vercel  

---

## 📜 License

MIT License — use it, fork it, hack it. Build more open financial tools!

---

## 🧠 Authors & Credits

Built with ❤️ at MIT Hackathon 2025 by Nag

