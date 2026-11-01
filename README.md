# SaanMura (PriceWatch PH) — Civic Price-Monitoring Ecosystem

SaanMura is a high-transparency, civic-led, two-application price monitoring ecosystem engineered for the Philippine retail and wet market landscape under the mandate of **Republic Act No. 7581 (The Price Act)**.

The ecosystem connects grassroots community price scouts, accredited wet market (*palengke*) verifiers, and Department of Trade and Industry (DTI) price monitoring administrators to a unified **Supabase PostgreSQL** backend.

---

## 1. Ecosystem Applications

### Application A: SaanMura Mobile (`apps/mobile`)
A native mobile application built for **Community Price Scouts & Contributors**:
- **Framework**: React Native 0.76, Expo SDK 52, TypeScript, Expo Router v4
- **Hardware Integrations**: Camera for barcode (EAN-13, UPC-A) & QR scanning, Image Picker for receipt audits, Location for store geofencing
- **Navigation (5 Tabs)**:
  1. **Home**: Civic product catalog, NCR city filter, instant barcode scan banner, horizontal category chips, and live community price stream.
  2. **Search**: Search by brand, barcode, SKU, category, and sort by lowest price.
  3. **Scan**: Central prominent action with viewfinder HUD, laser beam target, debounced anti-duplicate detection, instant product match cards, and "Product Not Found -> Register" workflow.
  4. **Activity / Contributions**: Tabs for *Pending*, *Approved*, *Rejected*, and *Needs Clarification* with resubmission support and verifier feedback.
  5. **Profile**: PhilSys ID accreditation status, Tier progression (Tier-1 Scout -> Tier-2 Palengke Verifier -> Tier-3 DTI Inspector Delegate), 98.4% Trust Rating, and XP leaderboard.
- **Modals**:
  - `product/[id]`: Multi-store price comparison (sorted lowest to highest), store distance, stale price warning, interactive price history trend chart (7D, 30D, 3M, 1Y), DTI Suggested Retail Price (SRP) benchmark, and contributor attribution badge.
  - `submit-price`: Price observation modal calculating difference (-₱6.00) and percentage (-7.06%) vs previous verified price, receipt evidence attachment, and remarks.
  - `register-product`: New commodity proposal with prepopulated scanned barcode.
  - `suggest-store`: Store location proposal with GPS coordinates assistance.

### Application B: SaanMura Web (`apps/web`)
A responsive administration control center built for **Verifiers and DTI Administrators**:
- **Framework**: React 18, TypeScript, Vite, Tailwind CSS, Lucide icons
- **Data & Visualizations**: TanStack Table, Recharts (price volatility trends), Leaflet & OpenStreetMap (interactive store map)
- **Navigation & Modules**:
  - **Verification Queue**: Multi-tab consensus verification for Prices, Products, and Stores with *Approve*, *Reject* (mandatory reason required), and *Request Clarification* actions. **Enforces anti-self-approval protocol**.
  - **Catalog & Discovery**: High-density table of all verified commodities, category filters, lowest verified price, and DTI SRP comparison badges.
  - **Administrator Control Center**: Telemetry metrics, 30-day commodity price volatility area chart, consensus quorum status (96.2%), and live price stream.
  - **Store Registry & Geolocation**: Split-screen view with store directory on the left and Leaflet OpenStreetMap pins on the right.
  - **Civic Contributor Management**: User table displaying PhilSys status, trust score, XP points, and actions to assign/revoke verifier roles.
  - **DTI SRP Reference**: Official bulletin schedule comparing mandated SRPs against prevailing retail prices.
  - **Supabase & RLS Monitor / Audit Logs**: Security audit trail and database connection health.
  - **Admin Login Portal**: Professional portal with dual tabs (*Agency Email* vs *PhilSys Admin ID*), password visibility toggle, and SSO triggers.

---

## 2. Monorepo Architecture

```
SaanMura/
├── apps/
│   ├── mobile/                    # React Native Expo Contributor Application
│   │   ├── app/                   # Expo Router File-based Navigation
│   │   └── src/                   # Services, API client, themes
│   └── web/                       # React + Vite Web Administration Dashboard
│       └── src/                   # Views, components, Leaflet map, charts
├── packages/
│   ├── shared-types/              # Normalized DB types, enums, interfaces
│   ├── validation/                # Zod schemas (Registration, Submission, Decision)
│   └── domain/                    # Pure domain logic (Price deltas, SRP status, formatPeso)
├── supabase/
│   ├── migrations/                # Normalized PostgreSQL tables, RLS, RPC functions
│   └── seed.sql                   # Realistic Philippine commodities & stores
├── tests/
│   ├── domain.test.ts             # Unit tests for price delta and SRP status
│   ├── validation.test.ts         # Unit tests for Zod validation schemas
│   └── load-test.js               # Concurrency benchmark for 100, 500, 1000 VUs
├── docs/
│   ├── android-build.md           # Android APK and Google Play bundle instructions
│   ├── web-deployment.md          # Web dashboard cloud deployment instructions
│   └── database-backup-and-recovery.md
├── package.json                   # Root monorepo workspace configuration
├── pnpm-workspace.yaml
└── tsconfig.base.json
```

---

## 3. Quick Start & Execution

### Install Monorepo Dependencies
```bash
pnpm install
```

### Build Shared Packages
```bash
pnpm build:packages
```

### Run Web Administration Dashboard
```bash
pnpm dev:web
# Launches on http://localhost:5173
```

### Run Mobile Application
```bash
pnpm dev:mobile
# Launches Expo Dev Server (Press 'w' for web, 'a' for Android emulator, or scan QR with Expo Go on Android/iOS)
```

### Run Automated Unit Tests
```bash
pnpm dlx tsx tests/domain.test.ts
pnpm dlx tsx tests/validation.test.ts
```

### Run Concurrency & High-Load Benchmark (100, 500, 1000 VUs)
```bash
node tests/load-test.js
```

---

## 4. Default Demo Accounts

Both applications are configured with credentials for instant role-based testing:

| Role | Name | Email | Password | Allowed Apps |
| :--- | :--- | :--- | :--- | :--- |
| **Administrator** | Dir. Ramon Valenzuela | `admin@saanmura.gov.ph` | `AdminPass123!` | Web Dashboard |
| **Verifier** | Maria Santos | `verifier@saanmura.gov.ph` | `VerifierPass123!` | Web Dashboard |
| **Contributor** | Rafael Santos / Juan Dela Cruz | `scout@saanmura.ph` | `ScoutPass123!` | Mobile App |

> [!NOTE]
> Attempting to log into the Web Administration Dashboard with a Contributor account immediately triggers an access-denied security rejection, preserving administrative boundaries.

---

## 5. Security & Civic Accountability

1. **Anti-Self-Approval**: Contributors are strictly prevented from approving their own price observations or product registrations. Both PostgreSQL RPC functions and the Web UI enforce this rule.
2. **Mandatory Rejection Reasons**: Rejections require verifier justification, which is recorded in the immutable audit log and notified to the scout.
3. **Immutable History**: Historical price observations are append-only; existing prices are never overwritten.
4. **Row Level Security (RLS)**: Client access is locked down at the database layer with granular RLS policies.
