---
name: SaanMura Marketplace Civic
colors:
  surface: '#f9f9ff'
  surface-dim: '#cfdaf2'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3ff'
  surface-container: '#e7eeff'
  surface-container-high: '#dee8ff'
  surface-container-highest: '#d8e3fb'
  on-surface: '#111c2d'
  on-surface-variant: '#544437'
  inverse-surface: '#263143'
  inverse-on-surface: '#ecf1ff'
  outline: '#877365'
  outline-variant: '#dac2b1'
  surface-tint: '#8f4e00'
  primary: '#8f4e00'
  on-primary: '#ffffff'
  primary-container: '#ff9f43'
  on-primary-container: '#6d3a00'
  inverse-primary: '#ffb77a'
  secondary: '#006d34'
  on-secondary: '#ffffff'
  secondary-container: '#54fd8f'
  on-secondary-container: '#007237'
  tertiary: '#b52330'
  on-tertiary: '#ffffff'
  tertiary-container: '#ff9a98'
  on-tertiary-container: '#93011c'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdcc2'
  primary-fixed-dim: '#ffb77a'
  on-primary-fixed: '#2e1500'
  on-primary-fixed-variant: '#6d3a00'
  secondary-fixed: '#62ff95'
  secondary-fixed-dim: '#2fe378'
  on-secondary-fixed: '#00210b'
  on-secondary-fixed-variant: '#005226'
  tertiary-fixed: '#ffdad8'
  tertiary-fixed-dim: '#ffb3b0'
  on-tertiary-fixed: '#410007'
  on-tertiary-fixed-variant: '#92001b'
  background: '#f9f9ff'
  on-background: '#111c2d'
  surface-variant: '#d8e3fb'
typography:
  headline-xl:
    fontFamily: Epilogue
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Epilogue
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Epilogue
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.015em
  headline-lg-mobile:
    fontFamily: Epilogue
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Epilogue
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
  headline-sm:
    fontFamily: Epilogue
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  price-display-lg:
    fontFamily: Roboto Flex
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.02em
  price-display-sm:
    fontFamily: Roboto Flex
    fontSize: 18px
    fontWeight: '700'
    lineHeight: 22px
  body-lg:
    fontFamily: Roboto Flex
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Roboto Flex
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Roboto Flex
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-md:
    fontFamily: Roboto Flex
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Roboto Flex
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.04em
  badge-stamp:
    fontFamily: Roboto Flex
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 12px
    letterSpacing: 0.06em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-md: 1.25rem
  gutter-lg: 1.5rem
  margin: 1rem
  margin-md: 1.5rem
  margin-lg: 2.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.25rem
---

## Brand & Style

The design system is crafted to project high civic transparency, everyday utility, and grassroots communal trust for price monitoring across Philippine wet markets (palengke), supermarkets, and retail stores. The visual tone bridges consumer-friendly vibrancy with the objective rigor of an open-data civic dashboard. 

The aesthetic is clean, information-dense, and utilitarian-modern. It avoids heavy, distracting decor in favor of scannable data layouts, immediate visual feedback on price deltas, and authoritative verification indicators. Subtle warm undertones prevent the UI from feeling sterile, grounding the platform in the communal culture of finding the best deals (diskarte) while preserving high accountability.

## Colors

The palette balances warm energetic accents with clear, universally understood indicators of market shifts:

- **Primary (`#FF9F43`)**: An energetic warm orange applied to primary actions, interactive highlights, search filters, and active tab triggers.
- **Secondary / Price Drop (`#00D26A`)**: A vivid, high-contrast emerald green designating price cuts, fair-trade deals, validated lower bounds, and community approvals.
- **Tertiary / Price Increase (`#FF5A5F`)**: An unmistakable crimson tone signaling upward price fluctuations, SRP (Suggested Retail Price) violations, and pending warnings.
- **Neutral Dark Slate (`#1E293B`)**: High-contrast, sharp slate serving as primary text and structural framing in light mode, doubling as the card container fill in dark mode.

### Mode Behavior
- **Light Mode**: Canvases rely on `#FFF7F0` (warm ivory mist) to ease glare, with elevated structural cards sitting on `#FFFFFF`. Primary copy is rendered in `#1E293B` and supporting metadata in `#64748B`.
- **Dark Mode**: Canvases invert to `#0F172A` (deep abyss slate), surface cards shift to `#1E293B`, secondary body text adapts to `#94A3B8`, and primary headings use `#F8FAFC`.

## Typography

Typography pairs **Epilogue** for display hierarchy with **Roboto Flex** for data-dense telemetry, labels, and running copy.

- **Epilogue**: Brings a grounded, contemporary geometric character with human warmth to section headlines, platform titles, and merchant banners.
- **Roboto Flex**: Delivers clinical clarity and legibility at micro sizes. All numerals must render with tabular figures (`font-variant-numeric: tabular-nums`) to ensure vertical alignment across data lists and comparison tables.
- **Philippine Peso Sign (₱)**: Always accompanies prices without extra whitespace (e.g., `₱142.50`). Delta comparisons should prefix with `+₱` or `-₱` and match their semantic trend color.

## Layout & Spacing

The layout model emphasizes high information density across a standard 12-column responsive fluid grid on desktop and tablet, converting to a 4-column layout on mobile.

- **Mobile (< 768px)**: 4 columns, `margin: 1rem`, `gutter: 1rem`. Sticky bottom-anchored actions and compact single-column feed streams.
- **Tablet (768px – 1024px)**: 8 columns, `margin-md: 1.5rem`, `gutter-md: 1.25rem`. Two-column product card feeds and modular sidebar filters.
- **Desktop (> 1024px)**: 12 columns, max-width container capped at `1280px`, `margin-lg: 2.5rem`, `gutter-lg: 1.5rem`. Split viewport layout featuring live geographic filtering on the left and comparison density grids on the right.

## Elevation & Depth

To maintain a crisp civic-dashboard utility, the system relies primarily on low-contrast structural outlines combined with very subtle, ambient tinted shadows:

- **Level 0 (Flat Canvas)**: Light mode canvas `#FFF7F0`; Dark mode canvas `#0F172A`.
- **Level 1 (Default Cards & Modules)**: Surfaces use a hairline border (`1px solid rgba(30, 41, 51, 0.08)` in light, `1px solid rgba(255, 255, 255, 0.08)` in dark) coupled with an ultra-soft shadow: `0 1px 3px rgba(30, 41, 51, 0.04), 0 4px 8px rgba(30, 41, 51, 0.02)`.
- **Level 2 (Hover States & Dropdowns)**: Surfaces slightly lift using `0 4px 12px rgba(30, 41, 51, 0.08), 0 1px 3px rgba(30, 41, 51, 0.04)`.
- **Level 3 (Modals & Sticky Barrels)**: Elevated overlays utilize `0 12px 32px rgba(15, 23, 42, 0.16)` with backdrop blur filters (`backdrop-filter: blur(8px)`) for underlying map or item grids.

## Shapes

The design system embraces a **Rounded (Level 2)** shape identity. Standard modules, buttons, and form inputs utilize a consistent base radius of `0.5rem` (8px). Larger cards and dashboard containers use `1rem` (16px), while status chips, search pills, and verification tags utilize fully rounded pill formats to balance data structure with accessible friendliness.

## Components

### Buttons
- **Primary Action**: Solid `#FF9F43` fill with pure white or dark slate text (`#1E293B`) at 600 weight. Subtle active scale feedback (`scale(0.98)`).
- **Secondary / Civic Action**: Transparent background with a `1.5px` border in `#FF9F43` and text color matching the primary accent.
- **Critical / Report**: Soft `#FF5A5F` background at 12% opacity with solid `#FF5A5F` text and border for price-gouging alerts.

### Verification Stamps & Civic Badges
- **DTI / Verified Citizen Stamp**: Uppercase typography (`badge-stamp`), compact vertical padding (`2px 8px`), pill-shaped.
  - *Verified Official*: Background `rgba(0, 210, 106, 0.12)`, text `#00A352`, with a checkmark badge.
  - *Crowd Consensus*: Background `rgba(255, 159, 67, 0.12)`, text `#D97706`.
  - *Disputed / Suspect*: Background `rgba(255, 90, 95, 0.12)`, text `#FF5A5F`.

### Cards & Grid Containers
- **Product Price Card**: Surface white `#FFFFFF` (or `#1E293B` in dark mode). Contains a top metadata ribbon (location/timestamp), primary commodity name, large tabular price display (`price-display-lg`), alongside mini delta pills (`-₱12.00 vs SRP`).
- **Quick Comparison Tables**: Alternate row fills (`#FFFBF7` in light mode) with high vertical data density and right-aligned tabular numerals for immediate side-by-side evaluation.

### Inputs & Search Filters
- **Market Search Bar**: Elevated pill input field with an integrated leading location selector (e.g., "Quezon City • Balintawak Market") and orange focus rings (`0 0 0 3px rgba(259, 159, 67, 0.25)`).
- **Checkboxes & Radios**: 20px rounded squares (checkbox) and circles (radio) with `#FF9F43` checked fill states and clear inner indicators.

### Delta Chips & Trend Indicators
- Pill tags displaying upward or downward price movements using directional glyphs (`▲`, `▼`), explicitly colored with Secondary `#00D26A` (cheaper) or Tertiary `#FF5A5F` (more expensive).