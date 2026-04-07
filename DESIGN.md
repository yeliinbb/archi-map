# DESIGN.md — Archi Curation

> A design specification for AI agents and human contributors.
> Read this file before generating or modifying any UI in this project.

---

## 1. Visual Theme & Atmosphere

- **Mood**: Archival, curatorial, restrained — like a well-organized architectural exhibition catalog.
- **Density**: Low-to-medium. Content breathes with generous whitespace (`py-24` between sections).
- **Philosophy**: _"Architecture as Typography."_ The 40px grid overlay references architectural drafting paper. Monospace typography treats every letterform as a structural element. 1px border grids evoke technical drawings. No decorative elements — every pixel serves information.
- **Key Aesthetic Cues**: Grid overlay background, monospace everywhere, uppercase wide-tracked labels, achromatic palette, intentionally flat (no shadows).

---

## 2. Color Palette & Roles

The palette is **entirely achromatic by design**. The project's identity comes from typography and structure, not color.

### Light Mode

| Token                    | Value               | Role                                    |
| ------------------------ | ------------------- | --------------------------------------- |
| `background`             | `oklch(1 0 0)`      | Pure white page surface                 |
| `foreground`             | `oklch(0.145 0 0)`  | Near-black primary text                 |
| `muted-foreground`       | `oklch(0.556 0 0)`  | Mid-grey secondary text (descriptions)  |
| `muted-foreground/60`    | —                   | Light grey tertiary labels (field names) |
| `border`                 | `oklch(0.922 0 0)`  | Subtle grey for grid lines and borders  |
| `accent`                 | `oklch(0.97 0 0)`   | Near-white hover background for cards   |
| `foreground/20`          | —                   | Divider line color                      |
| `destructive`            | `oklch(0.577 0.245 27.325)` | Red — the only chromatic color in UI |

### Dark Mode

All colors invert luminance. Notable: `border` and `input` use alpha transparency (`oklch(1 0 0 / 10%)`) for subtle dark-mode borders.

### Rules

- **Never** introduce a brand accent or decorative color.
- Chart colors (`chart-1` through `chart-5`) exist for data visualization only — do not use them in general UI.
- Use `text-muted-foreground` for secondary text, `text-muted-foreground/60` for tertiary labels.

---

## 3. Typography Rules

**Primary font**: Geist Mono (`font-mono`) — used for ALL UI text.
**Fallback font**: Geist Sans (`font-sans`) — inherited for Korean text rendering only.

### Type Scale

| Role            | Classes                                              | Usage                              |
| --------------- | ---------------------------------------------------- | ---------------------------------- |
| Hero Title      | `font-mono text-4xl sm:text-5xl md:text-6xl font-light tracking-tight` | Home page "Archi Curation"        |
| Page Title      | `font-mono text-3xl font-light tracking-tight`       | All page h1s                       |
| Section Label   | `font-mono text-xs tracking-label uppercase text-muted-foreground` | "Archive", "Map", "About"         |
| Sub-section     | `font-mono text-xs tracking-sublabel uppercase text-muted-foreground` | "Buildings in Archive"            |
| Field Label     | `font-mono text-micro tracking-wider uppercase text-muted-foreground/60` | "Architect", "City", "Address"   |
| Card Title      | `font-mono text-base tracking-wide`                  | Building/architect names in lists  |
| Body Text       | `font-mono text-sm leading-relaxed text-muted-foreground` | Descriptions, bios               |
| Micro Text      | `font-mono text-micro text-muted-foreground`         | Years, counts, metadata            |
| Nav Links       | `font-mono text-xs tracking-wider`                   | Desktop header navigation          |

### Custom Tokens

| Token               | Value     | Tailwind Class      | Replaces          |
| -------------------- | --------- | -------------------- | ----------------- |
| `--text-micro`       | `10px`    | `text-micro`         | `text-[10px]`     |
| `--tracking-label`   | `0.3em`   | `tracking-label`     | `tracking-[0.3em]` |
| `--tracking-sublabel`| `0.2em`   | `tracking-sublabel`  | `tracking-[0.2em]` |

---

## 4. Component Stylings

### Page Divider (`<Divider />`)

A horizontal rule that separates page headers from content.

| Variant   | Classes                       | Usage                     |
| --------- | ----------------------------- | ------------------------- |
| `default` | `h-px w-16 bg-foreground/20`  | All list & detail pages   |
| `lg`      | `h-px w-24 bg-foreground/20`  | Home hero section only    |

Spacing: `mb-12` after list page headers, `mb-8` after detail page headers.

### Grid Card Cell

The primary list-page pattern. Creates a precise 1px grid line effect.

```
Container: grid gap-px border border-border [responsive-cols]
Cell:      border border-border bg-background p-6 transition-colors hover:bg-accent
```

Responsive columns:
- Buildings, Cities: `sm:grid-cols-2`
- Architects: `sm:grid-cols-2 lg:grid-cols-3`
- Home entry points: `sm:grid-cols-2 lg:grid-cols-4`

### Back Link

```
mb-8 inline-block font-mono text-xs text-muted-foreground transition-colors hover:text-foreground
```

Text pattern: `← Category` (e.g., `← Buildings`, `← Architects`).

### Tag Badge (`<TagBadge />`)

Project-specific Badge wrapper with consistent overrides:
- Base: `<Badge>` from shadcn with `variant="secondary"` or `variant="outline"`
- Applied overrides: `font-mono text-micro font-normal`

### Detail Sidebar Info

```
border-l border-border pl-4
```

Contains field-label + value pairs stacked with `space-y-3`.

### Arrow Indicator

The universal "navigate" indicator: `→` character.
```
text-muted-foreground transition-colors group-hover:text-foreground
```

---

## 5. Layout Principles

### Containers

| Type   | Classes                  | Pages                         |
| ------ | ------------------------ | ----------------------------- |
| Wide   | `mx-auto max-w-6xl px-6` | Home, list pages, map, diagram |
| Narrow | `mx-auto max-w-2xl px-6` | Detail pages, about           |

### Vertical Rhythm

- Major sections: `py-24`
- Between header and content: `mb-12` (list pages), `mb-8` (detail pages)
- Between content blocks: `mb-8`

### Grid System

- Card grids: `grid gap-px border border-border` — the `gap-px` + double-border creates precise 1px lines
- Inline grids: `space-y-px border border-border` — for detail-page building lists

### Architectural Grid Overlay

A 40px grid pattern covers the entire viewport at `z-0` with `pointer-events-none`. Defined in `globals.css` as `.grid-overlay`. Applied in `layout.tsx` as a fixed full-screen layer. This is always present — do not remove or conditionally render it.

---

## 6. Depth & Elevation

**Intentionally flat.** No box shadows anywhere in page content.

| Surface         | Elevation | Notes                                      |
| --------------- | --------- | ------------------------------------------ |
| Page content    | None      | Flat — structure comes from borders         |
| Cards           | None      | Use 1px border, not shadow                  |
| Hover states    | None      | `bg-accent` color shift only                |
| Dialog/Sheet    | Shadow    | Only elevated surfaces (inherited from shadcn) |
| Dialog overlay  | Blur      | `bg-black/10 backdrop-blur-xs`             |

**Philosophy**: The grid overlay and border lines create visual depth through structure, not shadow.

---

## 7. Do's and Don'ts

### Do

- Use `font-mono` for all UI text — it is the primary brand voice
- Use 1px borders (`border border-border`) for structural divisions
- Keep hover states minimal (`hover:bg-accent` color shift only)
- Use uppercase + wide tracking for labels and navigation
- Use the `→` character as the universal navigate indicator
- Keep the achromatic palette — all greys, no accent color
- Use `transition-colors` for all interactive state changes
- Use square corners for grid card cells
- Always have the grid overlay present behind content

### Don't

- Add box shadows to cards or content surfaces
- Use color for decoration or emphasis (except `destructive` red)
- Use sans-serif (`font-sans`) for any UI text — sans is only for Korean text fallback
- Add rounded corners to grid card cells (only shadcn primitives like Dialog use rounded corners)
- Use icon-based navigation — the project uses text arrows and text-only links
- Add animation beyond `transition-colors` and existing dialog enter/exit transitions
- Use more than 2 font weights on a single page (`font-light` for titles, default `400` for everything else)

---

## 8. Responsive Behavior

### Breakpoints

Standard Tailwind: `sm: 640px`, `md: 768px`, `lg: 1024px`.

### Navigation

- Desktop (`md+`): Horizontal text links in header
- Mobile (`< md`): Sheet-based hamburger menu from right side

### Grid Columns

| Breakpoint | Home     | Buildings | Architects | Cities   |
| ---------- | -------- | --------- | ---------- | -------- |
| Base       | 1 col    | 1 col     | 1 col      | 1 col    |
| `sm`       | 2 cols   | 2 cols    | 2 cols     | 2 cols   |
| `lg`       | 4 cols   | 2 cols    | 3 cols     | 2 cols   |

### Touch Targets

- Desktop nav links: `px-3 py-1.5`
- Mobile nav links: `px-3 py-2` (larger vertical target)

### Logo

- `sm+`: Full "Archi Curation" text + AC box
- `< sm`: AC box only (text hidden with `hidden sm:inline-block`)

---

## 9. Agent Prompt Guide

When generating new pages or components for this project, follow these rules:

### New List Page

```
1. Section label:  <p class="section-label">CATEGORY</p>
2. Page title:     <h1 class="page-title">Title</h1>
3. Entry count:    <p class="font-mono text-sm text-muted-foreground">N entries</p>
4. Divider:        <Divider /> with mb-12
5. Grid:           grid gap-px border border-border [responsive-cols]
6. Each cell:      Link with grid-card-cell classes
7. Cell footer:    metadata + → arrow
```

### New Detail Page

```
1. Back link:      ← Category
2. Metadata:       font-mono text-xs text-muted-foreground
3. Title:          page-title classes + optional Korean name
4. Divider:        <Divider /> with mb-8
5. Content:        font-mono text-sm leading-relaxed text-muted-foreground
6. Sidebar info:   border-l border-border pl-4 with field labels
7. Tags:           <TagBadge> components in flex-wrap gap-2
```

### Color Reference

```
Primary text:     text-foreground
Secondary text:   text-muted-foreground
Tertiary labels:  text-muted-foreground/60
Borders:          border-border
Dividers:         bg-foreground/20
Hover bg:         hover:bg-accent
```

### Key Reminders

- Always use `font-mono`. Never use `font-sans` for UI text.
- Detail pages use `max-w-2xl`. List pages use `max-w-6xl`.
- No shadows. No accent colors. No rounded corners on grid cells.
- Use `text-micro` (not `text-[10px]`) for micro text.
- Use `tracking-label` (not `tracking-[0.3em]`) for section labels.
- The grid overlay is global — do not add it to individual pages.
