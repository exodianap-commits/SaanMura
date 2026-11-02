---
title: SaanMura System Overview & Codebase Map
tags:
  - saanmura
  - moc
  - architecture
  - civic-tech
updated: 2026-11-01
---

# 🛒 SaanMura — Civic Price Transparency & DTI Quorum Network

> **SaanMura** is an open civic-tech platform empowering Filipino consumers and palengke scouts to monitor, report, and verify basic necessity and prime commodity prices against **DTI Suggested Retail Price (SRP)** baselines using crowdsourced observations, receipt OCR, and a multi-verifier quorum consensus protocol.

```mermaid
graph TD
    MOC["🛒 00 - SaanMura System Map"]:::core
    
    ARCH["🏗️ Architecture & Monorepo"]:::arch
    WEB["💻 Web Admin Dashboard"]:::web
    MOB["📱 Mobile App"]:::mob
    DB["🗄️ Supabase & Schema"]:::db
    QUORUM["⚖️ DTI SRP & Civic Quorum"]:::gov
    CHANGES["✨ UX & UI Changelog"]:::log
    ANDROID["🤖 Android & Emulation Guide"]:::android
    API["📦 API & Data Contracts"]:::api
    NATIVE["📸 Camera, GPS & Native Troubleshooting"]:::trouble

    MOC --> ARCH
    MOC --> WEB
    MOC --> MOB
    MOC --> DB
    MOC --> QUORUM
    MOC --> CHANGES
    MOC --> ANDROID
    MOC --> API
    MOC --> NATIVE

    ARCH --> WEB
    ARCH --> MOB
    ARCH --> API
    WEB --> QUORUM
    WEB --> CHANGES
    MOB --> QUORUM
    MOB --> ANDROID
    MOB --> CHANGES
    MOB --> NATIVE
    DB --> QUORUM
    API --> DB
    ANDROID --> NATIVE

    classDef core fill:#ff9f43,stroke:#e67e22,stroke-width:3px,color:#fff;
    classDef arch fill:#2980b9,stroke:#1f618d,stroke-width:2px,color:#fff;
    classDef web fill:#27ae60,stroke:#1e8449,stroke-width:2px,color:#fff;
    classDef mob fill:#8e44ad,stroke:#6c3483,stroke-width:2px,color:#fff;
    classDef db fill:#16a085,stroke:#117864,stroke-width:2px,color:#fff;
    classDef gov fill:#d35400,stroke:#a04000,stroke-width:2px,color:#fff;
    classDef log fill:#f39c12,stroke:#b9770e,stroke-width:2px,color:#fff;
    classDef android fill:#2c3e50,stroke:#1a252f,stroke-width:2px,color:#fff;
    classDef api fill:#7f8c8d,stroke:#515a5a,stroke-width:2px,color:#fff;
    classDef trouble fill:#c0392b,stroke:#962d22,stroke-width:2px,color:#fff;
```

---

## 🗺️ Codebase Map of Content (MOC)

### 1. Core Engineering & Infrastructure
- [[Architecture & Monorepo Structure]] — Monorepo workspace organization, PNPM packages, build pipelines, and dependencies.
- [[API & Data Contracts]] — Shared type definitions (`@saanmura/shared-types`), Zod schemas (`@saanmura/validation`), and domain logic (`@saanmura/domain`).
- [[Supabase & Database Schema]] — PostgreSQL tables, relations, RLS security policies, and edge consensus triggers.

### 2. Client Applications
- [[Web Admin Dashboard]] — React 18, Vite, and Tailwind CSS control center for LGU verifiers, DTI compliance auditors, and retail registry managers.
- [[Mobile App]] — React Native Expo Router application for community Palengke Scouts, real-time barcode scanning, and receipt/shelf tag evidence logging.

### 3. Verification & Governance
- [[DTI SRP & Civic Quorum Protocol]] — Dual-verifier threshold rules ($\ge 2$ independent signatures), PhilSys trust weighting, and variance calculations.

### 4. Implementation Evolution & Operations
- [[UX & UI Changelog]] — Documented log of recent UI polishes: modal scrollbars, store photo upload/capture, category deduplication, and streamlined price logging.
- [[Android Native & Emulation Guide]] — Pixel 7 emulator setup, Android CLI installation, Android Studio Gradle sync, and USB reverse tethering.
- [[Mobile Camera, Geolocation & Native Verification Troubleshooting]] — TextureView compatible mode, SurfaceView hole-punching fix, real-time reverse geocoding pin, GPS geofencing, and fullscreen lightbox modals.

---

## 🏷️ Key System Tags
`#saanmura` `#react-native` `#expo` `#react` `#supabase` `#dti-srp` `#civic-tech` `#obsidian-vault`
