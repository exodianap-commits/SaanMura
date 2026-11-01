---
title: DTI SRP & Civic Quorum Protocol
tags:
  - governance
  - civic-tech
  - dti-srp
  - consensus
updated: 2026-11-01
---

# ⚖️ DTI SRP & Civic Quorum Protocol

To protect the platform against false price logging, merchant manipulation, or erroneous OCR data, SaanMura implements the **Dual-Verifier Quorum Consensus Protocol (v2.4)**.

```mermaid
flowchart TD
    SUBMIT["Scout Submits Observed Shelf Price"] --> VALIDATE{"Price within reasonable delta?"}
    
    VALIDATE -- No (Abnormal Spikes) --> FLAGGED["Flagged for Manual Investigation"]
    VALIDATE -- Yes --> PENDING["Awaiting Civic Acceptance Queue"]

    PENDING --> V1["Verifier 1 Sign-Off (Shelf Tag/Receipt OCR Check)"]
    V1 --> CHECK{"Consensus Reached? (Count >= 2)"}
    
    CHECK -- No --> WAIT["Awaiting Second Independent Verifier"]
    WAIT --> V2["Verifier 2 Sign-Off (LGU/Civic Monitor)"]
    V2 --> APPROVE["Promoted to Approved Price Stream"]

    APPROVE --> METRICS["Update Store Lowest Deal & SRP Delta"]
```

---

## 📐 Governance Parameters

| Parameter | Current Value | Purpose |
| :--- | :--- | :--- |
| **Quorum Threshold** | $\ge 2$ signatures | Prevents single-actor bias in crowdsourced data |
| **PhilSys Trust Weight** | 1.5x multiplier | Accords higher weight to verified civic scouts |
| **DTI SRP Baseline** | Official e-Presyo Data | Reference benchmark for calculating overpricing alerts |
| **Outlier Threshold** | $> 35\%$ from SRP | Automatically triggers mandatory photo proof requirement |

---

## 🔗 Related Notes
- Implemented In: [[Web Admin Dashboard]]
- Mobile Contributor Flow: [[Mobile App]]
- Audit Log Storage: [[Supabase & Database Schema]]
- System Core: [[00 - SaanMura Overview & System Map]]
