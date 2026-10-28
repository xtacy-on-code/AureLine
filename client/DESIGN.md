# AureLine — Ink & Paper

AureLine highlights PDFs. The interface should feel like a good desk: warm paper,
black ink, and three highlighter pens. Everything else stays quiet so the marks
are the loudest thing on screen.

## Principles

1. **The marker is the brand.** Highlighter strokes are the one decorative
   element. They mean something (definition / concept / important point), so
   never use the three marker colours for anything else.
2. **Paper, not glass.** Flat warm surfaces, 1px rules, tinted soft shadows only
   where something sits above the page. No blur panels, no glows, no gradients.
3. **Editorial on the outside, a tool on the inside.** The landing page and auth
   screens use the serif display face; the working app (library, upload, viewer)
   is sans-only and denser.

## Colour

All colours are tokens in `src/index.css` (`@theme`). Light theme only — the
product is literally paper.

| Token | Hex | Use |
|---|---|---|
| `paper` | `#F4EFE4` | Page background |
| `paper-raised` | `#FBF8F1` | Sheets, panels, inputs |
| `paper-sunken` | `#EBE4D5` | Wells, hovered rows, skeletons |
| `rule` | `#DCD3C1` | 1px dividers and borders |
| `rule-strong` | `#C4B9A3` | Input borders, dashed drop zone |
| `ink` | `#1D1B17` | Primary text, primary buttons |
| `ink-soft` | `#4F4A41` | Secondary text |
| `ink-faint` | `#857D70` | Tertiary text, captions (AA on paper at 14px+) |
| `danger` | `#A63D2A` | Errors, destructive actions |

### Markers (semantic — the only accents)

| Token | Hex | Meaning |
|---|---|---|
| `mark-yellow` | `#F5DC4E` | Definition |
| `mark-blue` | `#9CC6EE` | Key concept |
| `mark-green` | `#A3DE95` | Important point |

Markers are drawn as backgrounds behind ink text with `mix-blend-mode: multiply`
so they read like real highlighter on paper. Text on a marker is always `ink`.

## Type

| Role | Face | Notes |
|---|---|---|
| Display | Instrument Serif (400 / italic) | Landing + auth headlines only. `tracking-tight`, `leading-[0.95]`. |
| UI / body | Geist Variable | Everything else. Body 16px, small 14px, captions 13px. |
| Numbers / labels | Geist Mono Variable | Counts, dates, page numbers, step numbers. `tabular-nums`. |

Dates are `DD MMM YYYY` (`28 Oct 2026`).

## Space, shape, depth

- 4px base grid. Section rhythm on the landing page: 96–160px. App: 24–40px.
- Radii: controls `10px`, sheets/panels `16px`, pills `999px`.
- Shadow (only for things above the page): `--shadow-sheet`
  (`0 1px 0 #1d1b170a, 0 18px 40px -22px #3c2d1440`).
- Fixed paper grain overlay at 5% opacity, `pointer-events: none`, never on a
  scrolling element.

## Motion

Follows Emil Kowalski's rules (see frontend-craft).

- Ease: `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)` for enters,
  `--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1)` for on-screen moves.
- UI transitions ≤ 250ms; only `transform`, `opacity`, `clip-path`.
- Buttons press to `scale(0.97)`.
- **Marker sweep**: a highlight reveals left→right with `clip-path: inset()`
  over 600–900ms. Used on landing headlines, the hero demo and when jumping
  to a highlight in the viewer. Nowhere else.
- Lists stagger 40ms per item, max 8 items.
- Hover effects only under `(hover: hover) and (pointer: fine)`.
- `prefers-reduced-motion`: markers appear fully drawn, no movement, opacity
  fades only.
- AI waits over 2s use a Thinking Orb (`searching` while reading the PDF).

## Components

- **Button** — `primary` ink fill / paper text; `secondary` paper-raised with
  rule border; `ghost` text only. Height 44px (40px compact in app bars).
- **Field** — label above, 16px input text (no iOS zoom), error below in
  `danger`.
- **Marker** — inline span that paints a marker behind text; `animate` sweeps it.
- **Sheet** — `paper-raised`, rule border, `--shadow-sheet`, 16px radius.
- **Type chip** — small marker swatch + label + mono count; filters highlights.
