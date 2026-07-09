# PROIMMO-ACADEMY — UI Design Spec

**Purpose:** hand this to Cursor as a follow-up instruction to restyle the existing app. The current UI reads as generic/default-component-library because there is no real token system in place yet — this doc defines one, plus a signature visual element, so every screen looks intentional instead of templated.

**Core idea to design around:** the product's actual differentiator is a *verified, QR-checkable credential* — not a generic LMS dashboard. Every certificate is effectively a digital seal of trust. The visual identity should read like an official certification system (seals, verified marks, structured credentials) rather than a generic admin panel.

---

## 1. Color tokens

Don't use shadcn's default slate/zinc palette. Replace with:


| Token                | Hex       | Use                                                              |
| -------------------- | --------- | ---------------------------------------------------------------- |
| `--color-navy`       | `#14213D` | primary — headers, nav, primary buttons, dark surfaces           |
| `--color-navy-light` | `#233A63` | hover states, secondary surfaces                                 |
| `--color-gold`       | `#C9982E` | accent — certification/seal elements, badges, key CTAs sparingly |
| `--color-gold-light` | `#E4C778` | gradient partner for gold, highlights                            |
| `--color-emerald`    | `#1F7A5C` | success / valid certificate status                               |
| `--color-clay`       | `#B4573F` | warning/revoked status — warm red-clay, not a stock red          |
| `--color-paper`      | `#F7F5F0` | app background — warm off-white, not stark white                 |
| `--color-ink`        | `#1A1D26` | body text                                                        |
| `--color-ink-muted`  | `#5C6270` | secondary/metadata text                                          |


**Gradient use (sparingly — one signature moment, not everywhere):**

- Hero/brand gradient: `linear-gradient(135deg, #14213D 0%, #233A63 60%, #C9982E 140%)` — used once, on the hero section and the certificate/seal component. Not on every card or button.
- Avoid gradient-on-everything — that's the tell of an unstyled AI build overcorrecting. One deliberate gradient surface per page, max.

---

## 2. Typography

Replace default system/Inter-everywhere setup with a deliberate pairing:

- **Display face:** `Fraunces` (serif, variable weight) — used for page titles, course/certification names, the hero headline. Set with slightly negative letter-spacing at large sizes for authority. This gives the "institutional/credential" feel that a generic grotesk sans doesn't.
- **Body face:** `Public Sans` or `Inter` — used for paragraphs, form labels, table content. Clean and legible at small sizes.
- **Data/mono face:** `IBM Plex Mono` — used *only* for certificate codes, verification IDs, and QR reference numbers (e.g. `PRX-8F2A-K91Q`). This makes credential codes feel official/systematic, distinct from regular UI text.

Type scale (rem, 16px base):

- Display XL (hero): 3.5rem / Fraunces / 600
- Display L (page titles): 2.25rem / Fraunces / 600
- Heading (card/section titles): 1.25rem / Fraunces / 600
- Body: 1rem / Public Sans / 400
- Small/meta: 0.875rem / Public Sans / 400, `--color-ink-muted`
- Code (cert IDs): 0.875rem / IBM Plex Mono / 500, letter-spacing 0.02em

---

## 3. Signature element: the Verification Seal

This is the one distinctive, memorable visual element — build it once as a shared component, use it everywhere a certificate appears (dashboard, admin, public verify page, even the course detail page as a preview).

**Concept:** a circular badge (like a wax seal / official stamp) containing:

- A ring border in navy-to-gold gradient
- Center: certification level or a simple monogram mark
- Below/around it: the mono-font unique code
- Status expressed by ring color, not just a text badge: gold ring = valid, muted gray ring = expired, clay-red ring = revoked

This single component should appear on the `/verify/[code]` page as the hero of that page (not just a text confirmation), on the learner's certificate list, and as a small inline badge next to certification names in the admin panel. Reusing it consistently is what makes the identity feel designed rather than assembled from a component library.

---

## 4. Layout & component direction

- **Cards (course/certification catalog):** flat `--color-paper` background, 1px hairline border in a muted navy tint (`#14213D` at 10% opacity), 12px radius — not the default shadcn heavy-shadow card. Image top, Fraunces title, level badge (pill, gold outline not filled), price bottom-right.
- **Buttons:** primary = solid navy background, white text, 8px radius, no default blue. Secondary = navy outline, transparent fill. Reserve gold solid fill for one primary conversion action per page max (e.g. "Enroll now") — not every button, or gold loses its meaning as "credential/achievement" accent.
- **Admin tables:** dense, hairline row dividers, no zebra striping, status as small colored dot + label (green/gold/clay) rather than filled pill badges everywhere.
- **Navigation:** navy background header, gold underline on active nav item (thin 2px, not a full pill highlight) — ties nav back to the seal/gold accent without overusing it.
- **Empty/error states:** written in the product's voice per the copy guidance below — direct, no filler ("No courses match your search yet" not "Oops, nothing here!").

---

## 5. What to explicitly remove from the current build

Tell Cursor to check for and remove these defaults if present, since they're what's causing the "generic Material UI" impression:

- Default shadcn/MUI color variables (blue-600 primaries, gray-100/200 neutral scale) — replace with tokens above.
- Default heavy box-shadows on every card — flatten to hairline borders.
- Rounded-full pill badges used everywhere — reserve full pills for level/status only, use plain text + color dot elsewhere.
- Generic sans (system-ui/Inter) used for headings — headings must use Fraunces.
- Any leftover default favicon/logo placeholder.

---

## 6. Implementation notes for Cursor

- Define all tokens in `globals.css` as CSS variables (`:root { --color-navy: #14213D; ... }`) and reference them in `tailwind.config.ts` under `theme.extend.colors` so `bg-navy`, `text-gold`, etc. are available as utility classes — don't hardcode hex values inline across components.
- Import Fraunces, Public Sans, and IBM Plex Mono via `next/font/google` in the root layout, expose as CSS variables (`--font-display`, `--font-body`, `--font-mono`), and wire into Tailwind's `fontFamily` config.
- Build `<VerificationSeal status="valid" | "revoked" | "expired" code={string} level={string} />` as a single reusable component in `/components/public/verification-seal.tsx` and reuse it in all three places listed in section 3 — do not build separate one-off badge markup per page.
- Apply the hero gradient (section 1) only to: the homepage hero section background, and the seal component's outer ring. Nowhere else.

