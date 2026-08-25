---
name: Community Hero
description: Civic issue reporting with a trustworthy, color-rich Civic Signal design system
colors:
  primary: "#2563eb"
  primary-dark: "#1d4ed8"
  primary-wash: "#eff6ff"
  ground: "#ffffff"
  canvas: "#f9fafb"
  ink: "#111827"
  ink-60: "#6b7280"
  line: "#e5e7eb"
  status-reported: "#dbeafe"
  status-verified: "#cffafe"
  status-assigned: "#f3e8ff"
  status-progress: "#fef3c7"
  status-resolved: "#dcfce7"
  severity-critical: "#ef4444"
  severity-high: "#f97316"
  severity-medium: "#f59e0b"
  severity-low: "#22c55e"
typography:
  display:
    fontFamily: "'JetBrains Mono', ui-monospace, monospace"
    fontSize: "clamp(3rem, 8vw, 6rem)"
    fontWeight: 700
    lineHeight: 0.95
    letterSpacing: "-0.02em"
  title:
    fontFamily: "'JetBrains Mono', ui-monospace, monospace"
    fontSize: "1.875rem"
    fontWeight: 700
  body:
    fontFamily: "'JetBrains Mono', ui-monospace, monospace"
    fontSize: "0.875rem"
    lineHeight: 1.6
  numeral:
    fontFamily: "'JetBrains Mono', ui-monospace, monospace"
    fontSize: "3rem"
    fontWeight: 700
    fontFeature: "'zero' 1, 'tnum' 1, 'ss01' 1"
  label:
    fontFamily: "'JetBrains Mono', ui-monospace, monospace"
    fontSize: "0.6875rem"
    fontWeight: 600
    letterSpacing: "0.1em"
    textTransform: "uppercase"
rounded:
  sm: "6px"
  md: "8px"
  lg: "12px"
  xl: "16px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "48px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.lg}"
    padding: "16px 32px"
  button-primary-hover:
    backgroundColor: "{colors.primary-dark}"
  button-outline:
    backgroundColor: "#ffffff"
    textColor: "{colors.ink-60}"
    rounded: "{rounded.lg}"
  card:
    backgroundColor: "{colors.ground}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xl}"
  badge-default:
    backgroundColor: "{colors.primary-wash}"
    textColor: "{colors.primary-dark}"
    rounded: "{rounded.full}"
---

# Community Hero — DESIGN.md

## Overview

**Civic Signal**: a trustworthy, color-rich civic product. Blue-600 leads every action and focus state; semantic status colors (blue → cyan → purple → amber → green) make the issue lifecycle scannable at a glance; severity runs green → amber → orange → red. JetBrains Mono everywhere keeps the data-instrument personality — precision type, designed color.

## Colors

- **Primary blue `#2563eb`**: buttons, links, focus rings, selection, active tabs, map default pins. Hover darkens to `#1d4ed8`.
- **Status ramp** (soft wash + colored text + border): reported=blue, verified=cyan, assigned=purple, in-progress=amber, resolved=green, rejected=grey.
- **Severity ramp**: low=green, medium=amber, high=orange, critical=red (semibold + soft red frame).
- Neutrals are Tailwind gray; canvas `#f9fafb`, cards white. Never introduce new hues outside this system.

## Typography

- JetBrains Mono everywhere via `--font-jetbrains-mono`; tabular numerals on (`"tnum" 1`).
- Ramp: display (≤6rem/700) → title (1.875rem/700) → body (0.875rem) → label (`.label-caps` 11px caps +0.1em) → monumental numerals (3rem+) for counters.

## Layout

- `container mx-auto px-4`; sections separated by `border-gray-200` rules or 24–48px gaps; more space above headings than below.
- Stat grids: `gap-4` cards (or `gap-px` ruled grids on dark); mobile-first with `min-w-0` + `truncate` in equal columns.

## Elevation & Depth

- Three soft shadows: `.elevation-1/2/3` (gray-900 at 6–8% alpha, offset + blur). Cards default `shadow-sm`; hover lifts to `elevation-2`. No zero-offset halos.

## Shapes

- Radii: inputs/buttons 8–12px, cards 16px, badges/pills full. Borders 1px `gray-200`; hatch utilities (blue-tinted) mark intermediate states.

## Components

- **Button**: primary blue w/ shadow, outline white w/ border, ghost, destructive red. Hover = darker + lift; focus = blue ring + offset.
- **Badge**: rounded-full, wash + colored text + border per status/severity (variants `default/hatch/dense/dashed/inverted/solid/critical` map to the ramps above).
- **Card**: white, 1px gray-200, rounded-xl, shadow-sm; header row with bottom rule and caps title.
- **Map pins**: severity-colored fill, white stroke, soft drop-shadow; white center dot.
- **Charts**: series differentiate by hue within the semantic palette; gridlines gray-200.
- **Motion**: counters flicker-invert when live data lands; entrance animations 200ms ease-out; everything halts under `prefers-reduced-motion`.

## Do's and Don'ts

- **Do** use the status/severity ramps consistently — color is the fastest read.
- **Do** keep mono type + tabular numerals for all data.
- **Don't** use black-and-white austerity devices (ink-alpha greys, forced radius-0) — the system evolved past them.
- **Don't** fabricate numbers: counters read live data or render an em-dash with an honesty note.
- **Don't** use emoji as icons — category codes and lucide icons only.
