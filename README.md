# AgriTech — AI-Powered Smart Agricultural Trading and Farmer Support Platform

A full-stack, responsive agricultural technology platform connecting farmers, buyers, and platform administrators through real-time AI guidance, transparent APMC trading, empirical yield & price predictions, multilingual communication, and cloud persistence.

---

## 🌟 Key Architecture & Highlights

### 1. Three Distinct Role-Based Portals
- **Farmer Portal:**
  - **Dashboard:** Active plots, cultivated area, upcoming harvests, confirmed revenue, weather advisories, and interactive Recharts visualizations (Yield by Crop, Input Cost distribution).
  - **Crop Manager (Full CRUD):** Add, edit, filter, search, and delete crop records with soil, irrigation, and harvest milestones.
  - **Yield & Profit Predictor:** Calibrated multi-factor agronomic regression calculating yield per acre, total production, P10–P90 uncertainty intervals, and primary agronomic drivers.
  - **Produce Marketplace Listings (CRUD):** Direct produce listings with quality grades (A+, A, B+), units (Quintals, Kg, Crates), and fulfillment options.
  - **Order Processing:** Lifecycle state transitions (`requested` ➔ `accepted` ➔ `preparing` ➔ `ready_for_dispatch` ➔ `in_transit`).
  - **Expenses & Break-even Tracker:** Categorized inputs (Seeds, Fertilizer, Labor, Machinery) and break-even selling price calculations.
  - **Agri Calendar:** Tailored schedule for fertigation, bio-pesticide spraying, and harvesting.

- **Buyer Marketplace:**
  - **Discovery:** Multi-criteria filtering by crop, quality grade (A+, A, B+), and state/district.
  - **Direct Procurement:** Place purchase orders with custom quantities, delivery options (Refrigerated van, farm pickup, mandi delivery), and special packaging notes.
  - **Order Tracking:** Real-time state machine tracking from request to confirmed escrow, dispatch, and final delivery acknowledgement or dispute arbitration.
  - **Mandi vs Direct Price Intelligence:** Real-time comparison between APMC spot modal prices and farmer asking prices.

- **Admin Directorate & Governance:**
  - **Overview Metrics:** Platform volume, active listings, order statuses, and integration health.
  - **User Governance:** Review registrations, inspect 7/12 land records/trader licenses, verify accounts, and update RBAC roles.
  - **Listing Moderation:** Suspend or remove fraudulent/prohibited produce listings.
  - **Trade Arbitration:** Oversee transactions, resolve disputed orders.
  - **AI & System Monitoring:** Telemetry for Gemini 2.5 Flash, Open-Meteo Weather API, and Firestore security rules.
  - **Immutable Audit Trail:** Append-only log tracking actor, action, target, and timestamp.

---

### 2. AI & Prediction Engine
- **Conversational Advisor & Voice Assistant:**
  - Powered by **Gemini 2.5 Flash** (`@google/genai`) for real-time agronomic Q&A, pest/disease identification, and market intelligence.
  - **Multimodal Vision:** Upload leaf/crop photos for instant symptom diagnosis and KVK-certified IPM recommendations.
  - **Voice Assistant:** Web Speech API recognition and text-to-speech audio readout in 8 Indian languages (English, Kannada, Hindi, Tamil, Telugu, Malayalam, Marathi, Bengali).
  - **Local Agronomic Fallback:** Rule-based expert agricultural engine ensures continuous operation even when offline or before API credentials are configured.
- **Empirical Prediction Models:**
  - **Yield Regression:** Combines crop benchmarks, soil multipliers (Alluvial, Loamy, Black, etc.), irrigation efficiencies (Drip +25% vs Rainfed -28%), and season suitability (Kharif, Rabi, Zaid).
  - **Uncertainty Calibration:** Outputs calibrated confidence scores and P10–P90 range bounds.

---

### 3. Real-Time Data Integrations
- **Open-Meteo Global Meteorology:** Live temperature, apparent temperature, relative humidity, precipitation, wind speed, 5-day forecast, and automated agricultural hazard alerts (frost, heatwave, waterlogging).
- **APMC Mandi Price Intelligence:** Current modal, min, max prices, arrivals in quintals, daily percentage changes, and Agmarknet reference timestamps across major Indian mandis (Lasalgaon, Kolar, Khanna, Guntur, Azadpur, Rajkot, Indore, Burdwan).

---

### 4. Cloud Database & Security Rules
- **Firestore Security Rules (`firestore.rules`):**
  - Strict Role-Based Access Control (RBAC) ensuring farmers can only modify their own crops and listings, buyers can only view and update their authorized orders, and admins have mediated governance permissions.
- **Cloud Storage Rules (`storage.rules`):**
  - Ownership validation, file size limits (<5MB for images), and MIME type checks for crop photos, listing galleries, and reports.
- **Hybrid Local Storage Engine:**
  - If live Firebase credentials are not yet configured in `.env`, the platform operates in local reactive storage mode with zero setup blockers, full persistence across browser reloads, and instant seed data.

---

## 🛠️ Local Development & Testing

### Installation & Run
```bash
# 1. Install dependencies
npm install

# 2. Run unit tests (Node 22 native test runner)
node --test src/utils/agronomics.test.ts

# 3. Start development server (Express backend + Vite frontend on port 3000)
npm run dev
```

### Environment Variables (`.env`)
```bash
# Gemini AI API Key (Injected automatically in AI Studio)
GEMINI_API_KEY="your-gemini-api-key"

# Optional: Production Firebase Configuration
VITE_FIREBASE_API_KEY=""
VITE_FIREBASE_AUTH_DOMAIN=""
VITE_FIREBASE_PROJECT_ID=""
VITE_FIREBASE_STORAGE_BUCKET=""
VITE_FIREBASE_MESSAGING_SENDER_ID=""
VITE_FIREBASE_APP_ID=""
```

### Deploying to Production
```bash
# Build frontend bundle
npm run build

# Start production server
npm start
```
