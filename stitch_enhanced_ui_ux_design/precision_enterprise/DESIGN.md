---
name: Precision Enterprise
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#3d4a3d'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#6d7b6c'
  outline-variant: '#bccbb9'
  surface-tint: '#006e2f'
  primary: '#006e2f'
  on-primary: '#ffffff'
  primary-container: '#22c55e'
  on-primary-container: '#004b1e'
  inverse-primary: '#4ae176'
  secondary: '#505f76'
  on-secondary: '#ffffff'
  secondary-container: '#d0e1fb'
  on-secondary-container: '#54647a'
  tertiary: '#5c5f61'
  on-tertiary: '#ffffff'
  tertiary-container: '#a9acae'
  on-tertiary-container: '#3d4042'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#6bff8f'
  primary-fixed-dim: '#4ae176'
  on-primary-fixed: '#002109'
  on-primary-fixed-variant: '#005321'
  secondary-fixed: '#d3e4fe'
  secondary-fixed-dim: '#b7c8e1'
  on-secondary-fixed: '#0b1c30'
  on-secondary-fixed-variant: '#38485d'
  tertiary-fixed: '#e0e3e5'
  tertiary-fixed-dim: '#c4c7c9'
  on-tertiary-fixed: '#191c1e'
  on-tertiary-fixed-variant: '#444749'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  title-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  code:
    fontFamily: Geist
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  container-max: 1440px
  gutter: 24px
  margin-desktop: 40px
  margin-mobile: 16px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style

This design system is engineered for high-stakes B2B SaaS and fintech environments where clarity, speed, and precision are paramount. The aesthetic is ultra-modern, leaning into a **refined minimalism** mixed with **subtle glassmorphism**. The goal is to evoke a sense of "technical luxury"—software that feels both powerful and effortless to navigate.

The design narrative focuses on a "high-end dashboard" feel, drawing inspiration from industry leaders like Stripe and Linear. It utilizes expansive white space (or deep slate in dark mode), sharp contrast for data points, and sophisticated layering to manage complex information hierarchies without overwhelming the user.

## Colors

The palette is anchored by a vibrant **Success Green (#22C55E)**, used sparingly for primary actions, status indicators, and brand accents. This provides a professional yet energetic "go" signal across the interface.

- **Primary:** #22C55E (Actionable items, focus states).
- **Surface (Light):** White (#FFFFFF) for cards, with background washes of Slate-50 (#F8FAFC).
- **Surface (Dark):** Deep Slate (#0F172A) for backgrounds, with elevated surfaces in #1E293B.
- **Stroke/Border:** Low-contrast greys (#E2E8F0 for light, #334155 for dark) to define structure without visual noise.
- **Glass Effects:** Use 60-80% opacity on surface colors with a 12px-20px backdrop blur for headers and floating navigation panels.

## Typography

The system utilizes **Inter** for its systematic, utilitarian, and highly readable qualities. It provides a "fintech" feel that balances accessibility with a corporate edge. For technical data or monospaced labels, **Geist** is introduced to provide a developer-friendly, precise counterpoint.

- **Headlines:** Use tight letter-spacing and semi-bold weights to create a strong visual anchor.
- **Body:** Standardized at 14px for data-heavy views and 16px for prose-heavy documentation.
- **Labels:** Uppercase Geist labels are used for small metadata, table headers, and section categorizations to distinguish them from interactive text.

## Layout & Spacing

This design system employs a **12-column fluid grid** with generous internal spacing to prevent data-fatigue. Layouts should prioritize vertical rhythm using a 4px baseline grid.

- **Navigation:** A persistent left-hand sidebar or a floating top-dock with glassmorphism. Inspired by Stripe, the sidebar should use `stack-sm` for nav items.
- **Margins:** Large 40px outer margins on desktop create a "letterboxed" feel that centers the user's focus.
- **Responsibility:** On tablet, margins reduce to 24px and columns collapse to 8. On mobile, a single-column view with 16px margins is standard. 
- **Data Densities:** Provide two density modes: "Comfortable" (standard spacing) and "Compact" (halved padding for data tables).

## Elevation & Depth

Depth is communicated through **ambient shadows** and **tonal layering**. Unlike traditional skeuomorphism, elevation here is used to separate global navigation from the workspace.

- **Level 0 (Background):** The base canvas.
- **Level 1 (Cards/Sidebar):** Slightly elevated using a subtle 1px border (#E2E8F0) and a soft, diffused shadow (0 4px 6px -1px rgb(0 0 0 / 0.1)).
- **Level 2 (Modals/Popovers):** Higher elevation with a larger blur (0 20px 25px -5px rgb(0 0 0 / 0.1)) and a backdrop blur effect (blur-xl) to pull the user's attention.
- **Interaction:** Hover states on interactive cards should transition from Level 1 to a slightly deeper shadow and a primary-color stroke.

## Shapes

The design system uses a **Rounded (0.5rem / 8px - 16px)** shape language. This balances the professional "square" nature of enterprise software with the approachability of modern SaaS.

- **Standard Elements:** 8px (Buttons, Input fields).
- **Containers/Cards:** 12px to 16px (The primary "Rounded-LG" and "Rounded-XL" tokens).
- **Search Bars/Tags:** Pill-shaped (Full radius) for distinct visual separation from functional buttons.

## Components

### Buttons
- **Primary:** Solid #22C55E with white text. 8px border radius. Subtle inner-glow on top edge for a tactile feel.
- **Secondary:** Ghost style with a light grey border. On hover, background shifts to a very pale primary tint.

### Navigation (The "Stripe" Sidebar)
- Use a semi-transparent background with `backdrop-filter: blur(20px)`.
- Active states are indicated by a subtle primary-colored vertical pill on the left and a slight background tint.

### Cards
- White (light mode) or #1E293B (dark mode). 
- Borders are 1px solid. Ensure cards have a `rounded-lg` (12px) or `rounded-xl` (16px) corner.

### Form Inputs
- Neutral grey borders that turn Primary Green on focus.
- Accompanying labels use `label-caps` typography style for a technical, organized look.

### Chips & Badges
- Used for status (e.g., "Paid", "Pending"). 
- Small, uppercase text with high-contrast background tints. "Success" badges use the primary color at 10% opacity with solid primary text.

### Data Tables
- No vertical borders. Horizontal separators only.
- Header row uses the `label-caps` typography. 
- Row hover states use a subtle #F8FAFC background shift.