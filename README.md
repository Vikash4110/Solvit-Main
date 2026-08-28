# Solvit — Modern Tele-Counseling & Mental Wellness Platform

<p align="left">
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node.js-v18%2B-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node.js" /></a>
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-v19-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React" /></a>
  <a href="https://vitejs.dev/"><img src="https://img.shields.io/badge/Vite-v7-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite" /></a>
  <a href="https://www.mongodb.com/"><img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white" alt="MongoDB" /></a>
  <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/TailwindCSS-v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="TailwindCSS" /></a>
  <img src="https://img.shields.io/badge/WebRTC-VideoSDK.live-FF6B6B?style=flat-square" alt="VideoSDK" />
  <img src="https://img.shields.io/badge/License-Proprietary-blue.svg?style=flat-square" alt="License" />
</p>

**Solvit** is an end-to-end tele-mental health platform engineered to bridge the gap between clients seeking mental wellness support and verified professional counselors. Solvit delivers a friction-free healthcare experience featuring real-time practitioner matching, automated recurring schedule management, integrated digital payments, and ultra-low latency, browser-based WebRTC video consultations.

---

## 🌟 Product Ecosystem & Portals

### 🧑‍💼 Client Experience
* **Specialist Discovery:** Search and filter verified mental health professionals by specialization, languages spoken, price range, and real-time slot availability.
* **Instant Booking & Checkout:** Real-time calendar slot reservation with Razorpay payment processing and automatic confirmation emails.
* **Encrypted Video Consultations:** Secure 1-on-1 WebRTC video sessions with in-call chat, noise reduction, and automatic hardware resource cleanup.
* **Client Control Center:** Comprehensive dashboard to view upcoming appointments, session histories, invoices, and file structured support disputes.

### 👩‍⚕️ Counselor Workspace
* **Automated Schedule Management:** Recurring weekly availability rules and smart multi-slot generation to maximize booking efficiency.
* **Session Workflow:** Live appointment tracking, attendance status verification, client session notes, and direct consultation entry.
* **Financial Analytics:** Live revenue dashboards, transparent per-session earnings breakdown, and automated payout processing.
* **Resource Publishing:** Integrated rich-text blog publishing platform to share mental health insights and wellness guides.

### 🛡️ Admin & Platform Governance
* **Practitioner Verification & KYC:** Rigorous review and verification system for professional licenses, qualifications, and government IDs.
* **Dispute Arbitration:** Full lifecycle management for client-counselor booking disputes, session verifications, and automated refund processing.
* **Financial Oversight & Audit Logs:** Platform-wide booking reconciliations, revenue distribution metrics, and detailed audit trails.

---

## 🛠️ Architecture & Technology Stack

```
                                  ┌────────────────────────┐
                                  │      Client / SPA      │
                                  │ (React 19 + Vite 7 UI) │
                                  └───────────┬────────────┘
                                              │ HTTPS / WSS
                                              ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                               Node.js / Express 5 API Layer                            │
│  [Rate Limiting] ──► [Security Headers] ──► [Single-Query Auth] ──► [Controllers]      │
└──────────┬───────────────────────────┬──────────────────────────────────┬──────────────┘
           │                           │                                  │
           ▼                           ▼                                  ▼
┌───────────────────────┐   ┌───────────────────────┐          ┌───────────────────────┐
│     MongoDB Atlas     │   │   Redis & BullMQ      │          │   Third-Party Cloud   │
│  (Indexed B-Trees &   │   │  (Async Jobs, Cron,   │          │  • Razorpay (Billing) │
│   50-Connection Pool) │   │    & Scheduled Tasks) │          │  • VideoSDK (WebRTC)  │
└───────────────────────┘   └───────────────────────┘          │  • Brevo (Email/OTP)  │
                                                               │  • Cloudinary (Media) │
                                                               └───────────────────────┘
```

| Layer | Technologies & Libraries |
|---|---|
| **Frontend Framework** | React 19, React Router v7, Vite 7, TailwindCSS v4 |
| **UI Components & UX** | Radix UI primitives, Framer Motion, Lucide React, Sonner |
| **Backend Engine** | Node.js (v18+), Express 5, Mongoose 8 |
| **Real-time Video / Audio**| VideoSDK.live WebRTC Engine |
| **Database & Caching** | MongoDB Atlas, Redis / Upstash |
| **Async Queues & Workers** | BullMQ & PM2 Cron Workers |
| **Payments & Billing** | Razorpay Payment Gateway & Webhooks |
| **Communication** | Brevo (SendinBlue) Transactional Email & OTP System |
| **Media & Asset CDN** | Cloudinary Cloud Storage |
| **Process Orchestration** | PM2 Multi-Core Cluster Mode (`ecosystem.config.cjs`) |

---

## ⚡ Core Engineering Highlights

* **High-Throughput Concurrency:** Tuned MongoDB connection pooling (`maxPoolSize: 50`) and role-embedded JWTs reduce database authentication lookups by 50%.
* **Smart Tab Visibility Management:** Foreground-only polling architecture (`useSmartRefresh`) halts background network requests on inactive browser tabs, eliminating idle database drain.
* **Optimized Bundle Delivery:** Dynamic route-level code splitting and manual vendor chunking drop the initial entry JavaScript to **187 kB (45 kB Brotli)** with automated `.br` and `.gz` static pre-compression.
* **Hardware Lifecycle Safety:** Deterministic WebRTC track termination ensures camera and microphone hardware sensors are immediately freed upon session exit.
* **Multi-Core Scaling:** Zero-downtime PM2 cluster mode automatically leverages all available CPU cores for concurrent request handling.

---

## 📁 Repository Structure

```
Solvit-Main/
├── client/                     # Frontend Single Page Application
│   ├── src/
│   │   ├── components/         # Reusable UI components (Client, Counselor, Admin)
│   │   ├── config/             # API routing configuration & constants
│   │   ├── contexts/           # Authentication context providers
│   │   ├── hooks/              # Custom hooks (useSmartRefresh, useMediaStream, etc.)
│   │   ├── lib/                # Shared Axios HTTP client & interceptors
│   │   ├── pages/              # Lazy-loaded route views
│   │   └── videoCall/          # VideoSDK WebRTC consultation interface
│   ├── vite.config.js          # Build optimization, vendor chunking & compression
│   └── package.json
│
├── server/                     # Backend API & Worker Service
│   ├── config/                 # Cloudinary, Brevo, Redis, and logger configs
│   ├── controllers/            # REST API route handlers
│   ├── database/               # Database connection pool setup
│   ├── middlewares/            # Single-query auth, rate limiting, and security
│   ├── models/                 # Mongoose schemas with compound indexes
│   ├── routes/                 # Express API endpoint declarations
│   ├── cron/                   # Scheduled payout, reminder, and slot jobs
│   ├── ecosystem.config.cjs    # Production multi-core PM2 cluster configuration
│   ├── server.js               # Application entry point
│   └── package.json
│
└── README.md                   # Project Documentation
```

---

## 🚀 Getting Started

### Prerequisites
* **Node.js** `v18.0.0` or higher
* **npm** `v9.0.0` or higher
* **MongoDB** (Local instance or MongoDB Atlas URI)
* **Redis** (Local instance or Upstash Redis URI)

---

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-org/solvit-main.git
   cd solvit-main
   ```

2. **Install Server Dependencies:**
   ```bash
   cd server
   npm install
   ```

3. **Install Client Dependencies:**
   ```bash
   cd ../client
   npm install
   ```

---

### Environment Setup

#### Backend Configuration (`server/.env`)
Create a `.env` file in the `server/` directory:

```env
# Server
PORT=8000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
CORS_ORIGIN1=http://localhost:5173

# Database
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/solvit_db

# Security & Authentication
ACCESS_TOKEN_SECRET=your_jwt_access_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_jwt_refresh_secret

# VideoSDK Live
VIDEOSDK_API_KEY=your_videosdk_key
VIDEOSDK_SECRET_KEY=your_videosdk_secret
VIDEOSDK_API_ENDPOINT=https://api.videosdk.live/v2

# Razorpay Payments
RAZORPAY_API_KEY=your_razorpay_key_id
RAZORPAY_API_SECRET=your_razorpay_secret
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret

# Brevo (SendinBlue) Email
BREVO_API_KEY=your_brevo_api_key
BREVO_SENDER_EMAIL=system@solvitcounselling.com
BREVO_SENDER_NAME=Solvit Counseling
OTP_EXPIRY_MINUTES=10

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret

# Redis / BullMQ
UPSTASH_REDIS_REST_URL=your_redis_host
UPSTASH_REDIS_PORT=6379
UPSTASH_REDIS_REST_TOKEN=your_redis_token
QUEUE_CONCURRENCY=1
```

#### Frontend Configuration (`client/.env`)
Create a `.env` file in the `client/` directory:

```env
VITE_API_URL=http://localhost:8000/api/v1
```

---

### Running Locally

```bash
# 1. Start the backend development server (Port 8000)
cd server
npm run dev

# 2. Start the frontend development server (Port 5173)
cd client
npm run dev
```

---

### Production Deployment

```bash
# 1. Build and compress frontend static assets
cd client
npm run build

# 2. Launch backend across all CPU cores with PM2 Cluster Mode
cd ../server
npm run pm2:start
```

---

## 🔒 Security & Privacy Practices

* **Role-Based Access Control:** Strict JWT claim separation ensuring clients, counselors, and administrators only access authorized resources.
* **Encrypted Media:** Peer-to-peer WebRTC video and audio channels are end-to-end encrypted following DTLS-SRTP standards.
* **DDoS & Brute-Force Protection:** Tiered IP rate limiters on authentication, OTP generation, and general API endpoints.
* **Production Hygiene:** Automatic stripping of `console.log` statements and debugging symbols to prevent sensitive metadata leakage.

---

## 📄 License

Copyright © 2026 Solvit Counseling. All rights reserved.  
This project and its associated source code are proprietary and confidential. Unauthorized copying, distribution, or reproduction via any medium is strictly prohibited.
