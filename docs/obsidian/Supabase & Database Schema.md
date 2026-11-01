---
title: Supabase & Database Schema
tags:
  - database
  - supabase
  - postgresql
  - rls
updated: 2026-11-01
---

# 🗄️ Supabase & Database Schema

The persistence layer runs on **Supabase PostgreSQL 15**, utilizing Row Level Security (RLS) to enforce civic integrity and verifiable price logs.

```mermaid
erDiagram
    COMMODITIES ||--o{ PRICE_OBSERVATIONS : "has price logs"
    STORES ||--o{ PRICE_OBSERVATIONS : "observed at"
    PROFILES ||--o{ PRICE_OBSERVATIONS : "submitted by"
    PRICE_OBSERVATIONS ||--o{ VERIFICATION_LOGS : "verified by"
    PROFILES ||--o{ VERIFICATION_LOGS : "signed off by"

    COMMODITIES {
        uuid id PK
        string barcode UK
        string name
        string category
        decimal srp_price
        string unit
        string image_url
    }

    STORES {
        uuid id PK
        string name
        string branch_name
        string store_type
        decimal latitude
        decimal longitude
        string image_url
        boolean is_dti_monitored
    }

    PRICE_OBSERVATIONS {
        uuid id PK
        uuid commodity_id FK
        uuid store_id FK
        uuid contributor_id FK
        decimal observed_price
        date observation_date
        string evidence_photo_url
        string remarks
        string status
        int consensus_count
    }

    VERIFICATION_LOGS {
        uuid id PK
        uuid observation_id FK
        uuid verifier_id FK
        string decision
        string audit_notes
        timestamp verified_at
    }

    PROFILES {
        uuid id PK
        string full_name
        string scout_tier
        decimal trust_score
        boolean philsys_verified
    }
```

---

## 🔒 Security & Verification Policies

- **Public Reads**: Monitored commodity prices and DTI baselines are publicly queryable without authentication.
- **Scout Submissions**: Authenticated scouts can insert price observations into the `pending_verification` state.
- **Quorum Transition**: Observations are only promoted to `approved` and exposed to the public price stream once $\ge 2$ independent verifiers record positive consensus.

---

## 🔗 Related Notes
- Architecture: [[Architecture & Monorepo Structure]]
- Verification Engine: [[DTI SRP & Civic Quorum Protocol]]
- Type Mappings: [[API & Data Contracts]]
