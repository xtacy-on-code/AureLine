# AureLine — Sketchbook

AureLine highlights PDFs. The interface looks like a study sketchbook: graph
paper, ink drawn by hand, pastel highlighters, and the occasional comic panel,
speech bubble or sound effect. It should feel friendly and a little playful,
never messy: the wobble is in the lines, not in the layout.

## Principles

1. **The marker is the brand.** Yellow, blue and green highlighter strokes mean
   definition / key concept / important point. Don't use them for anything else.
   Pink is the one extra accent, for bursts and badges.
2. **Ink outlines, hand-drawn.** Objects that sit on the page (sheets, panels,
   buttons, inputs) get a 2.5px ink outline drawn with a slight SVG wobble and a
   hard offset shadow, like a comic panel. Dividers inside them stay thin and
   straight so dense content still reads cleanly.
3. **Comic on the outside, a tool on the inside.** The landing page tells its
   story in panels with captions, bubbles and sound effects. The app (library,
   upload, viewer) keeps the outlines and type but drops the bubbles and SFX.

## Colour

Tokens live in `src/index.css` (`@theme`). Light only — it's paper.

| Token | Hex | Use |
|---|---|---|
| `paper` | `#FDFCF7` | Page background (with a 22px graph grid) |
| `paper-raised` | `#FFFFFF` | Panels, sheets, inputs |
| `paper-sunken` | `#F3F1EA` | Wells, hovered rows, skeletons |
| `grid` | `#E8ECF5` | Graph-paper lines |
| `rule` | `#E3E1D8` | Thin straight dividers inside panels |
| `rule-strong` | `#C9CBD2` | Dashed drop zone, disabled outlines |
| `ink` | `#22252B` | Text, outlines, shadows, primary buttons |
| `ink-soft` | `#50545C` | Secondary text |
| `ink-faint` | `#6B6F78` | Captions, labels (AA on white) |
| `danger` | `#C2334D` | Errors, delete |
| `pop` | `#FF8FAB` | Bursts, badges, the one extra accent |

### Markers

| Token | Hex | Meaning |
|---|---|---|
| `mark-yellow` | `#FFE066` | Definition |
| `mark-blue` | `#A5D8FF` | Key concept |
| `mark-green` | `#B2F2BB` | Important point |

Text on a marker is always `ink`.

## Type

| Role | Face | Notes |
|---|---|---|
| Display | Bricolage Grotesque (800) | Headlines, wordmark, panel titles. `tracking-[-0.04em]`, tight leading. |
| UI / body | Figtree | Everything else. Body 16px, small 14px. Numbers `tabular-nums`. |
| Hand | Gaegu (700) | Captions, bubbles, sound effects, labels and small notes. Never for body copy or anything over two lines. |

Dates are `DD MMM YYYY` (`28 Oct 2026`).

## Shape and depth

- `sketch` utility: outline + wobble on a `::before` layer (so text inside is
  never distorted), irregular radius `--radius-sketch`, and
  `--shadow-sketch` (`4px 5px 0 ink`). Smaller controls use `--shadow-sketch-sm`.
- Thin straight 1px `rule` lines for lists and tables inside a panel.
- Section rhythm on the landing page: 96–140px. App: 24–40px.

## Motion

Emil Kowalski's rules (see frontend-craft).

- Ease: `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)`;
  `--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1)`;
  `--ease-pop: cubic-bezier(0.34, 1.56, 0.64, 1)` for sound effects and bursts only.
- Buttons press *into* their shadow: `translate(2px, 2px)` and a smaller
  shadow, 120ms. No scale.
- Marker sweep: highlight reveals left to right, 500–900ms. Used for headlines,
  demos and jumping to a highlight.
- SFX pop in with `--ease-pop`, once, never on a loop.
- Scroll story and fanning pages run off IntersectionObserver, no scroll
  listeners. Everything renders in its finished state under
  `prefers-reduced-motion`.
- AI waits over 2s use a Thinking Orb.

## Components

- **Button** — `primary` ink fill with paper text; `secondary` white with ink
  outline; both carry the small hard shadow. `ghost` is text only.
- **Field** — label above, 2px ink outline, 16px text, yellow focus glow,
  error below in `danger`.
- **Marker** — highlighter stroke behind inline text; `animate` sweeps it in.
- **Panel** (`sketch`) — white, wobbly ink outline, hard shadow.
- **Bubble / Caption / Burst / SFX** — landing page only.
