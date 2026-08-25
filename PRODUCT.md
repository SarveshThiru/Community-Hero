# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Citizens**: residents who spot civic problems (potholes, broken streetlights, garbage, water issues) and want to report them in seconds and track resolution without phone calls or office visits.
- **Authorities**: municipal staff and department officers who triage incoming reports, assign them, update status, and are accountable for resolution times.
- (Roles exist for `citizen`, `authority`, `admin` in code; authority console is a first-class audience.)

## Product Purpose

Community Hero is a civic issue reporting platform: citizens report neighborhood problems with photos + location + AI-assisted categorization; reports flow through verified → assigned → in_progress → resolved; everyone sees progress on a live community map. Success = faster real-world fixes and visible government accountability, not engagement metrics.

## Positioning

Hyperlocal transparency loop: a citizen's photo becomes an accountable, timestamped, publicly visible work item that authorities must move to resolved — with AI classification lowering the effort to report to near zero.

## Operating Context

- Mobile-first usage: citizens photograph issues on phones, often outdoors.
- Deployed as a PWA (manifest.json present); "works offline" is claimed on landing.
- Map-centric workflows (MapLibre + OpenStreetMap/Carto tiles) across map, report, and detail surfaces.
- English UI; India-first default geography (Delhi demo center) but not city-locked.

## Capabilities and Constraints

- Supabase backend (auth, Postgres via views like `issue_with_details`, storage for images).
- Client-side AI image classification (TensorFlow.js / MobileNet) suggests category + severity.
- Issue lifecycle statuses: reported, verified, assigned, in_progress, resolved (+ rejected).
- Severities: low, medium, high, critical. Categories include roads, lighting, garbage, water.
- Voting, comments, follows, notifications exist in data model/UI hooks.
- Analytics surface for authorities (trends, hotspots, department performance).
- Constraint: no API-key map basemaps; free OSM/Carto tiles only (current decision).
- Undecided: launch city/partner municipality; real content vs placeholder stats on marketing claims.

## Brand Commitments

- Name "Community Hero" is binding.
- Visual identity is explicitly replaceable: user approved a full new visual world (2026-08); the incumbent generic blue Tailwind look is anti-reference, keep nothing from it out of obligation.

## Evidence on Hand

- No real testimonials, case studies, or press. Landing-page stats (50K+ issues etc.) are placeholders — must not be presented as fact in redesigns without labeling or removal.
- No logo file assets found (only inline SVG shield marks in code).

## Product Principles

1. **Report in seconds** — every extra tap loses real street-corner reports; speed of reporting is sacred.
2. **Visible accountability** — status, timestamps, and responsible parties are always public and legible.
3. **Trust over hype** — real product for real residents: no fabricated proof, honest empty states.
4. **Map is the product's spine** — spatial context appears wherever it helps comprehension.
5. **Works for everyone** — low-end Android devices, patchy connectivity, outdoor glare, accessibility basics.

## Accessibility & Inclusion

- Outdoor/mobile readability: strong contrast under sunlight conditions is a practical need.
- Civic product: WCAG-minded contrast, keyboard operability, and screen-reader labels expected.
