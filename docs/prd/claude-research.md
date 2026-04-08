# Research Findings — Archi Curation

## Part 1: Codebase Analysis

### 1. Project Structure

```
archi-map/
├── src/
│   ├── app/[locale]/           # i18n route segment (en, ko)
│   │   ├── page.tsx            # Home — hero + 4 entry cards
│   │   ├── about/page.tsx
│   │   ├── map/
│   │   │   ├── page.tsx        # MapLibre GL interactive map
│   │   │   ├── buildings/      # list + [slug] detail
│   │   │   ├── architects/     # list + [slug] detail
│   │   │   └── cities/         # list + [slug] detail
│   │   └── diagram/page.tsx    # D3 force-directed graph
│   ├── components/
│   │   ├── features/
│   │   │   ├── map/            # map-view, building-marker, popup, legend, sidebar
│   │   │   ├── diagram/        # network-diagram, layout-controls, export-button
│   │   │   ├── buildings/
│   │   │   └── selection/      # selection-bar, toggle-button
│   │   ├── layouts/            # site-header, site-footer, locale-switcher
│   │   ├── shared/             # motion-wrapper, page-transition
│   │   └── ui/                 # button, badge, card, dialog, sheet, divider, tag-badge
│   ├── lib/
│   │   ├── data/               # buildings.json, architects.json, cities.json, data.ts
│   │   ├── stores/             # selection-store.ts (Zustand)
│   │   ├── diagram/            # transform.ts (D3 graph transformation)
│   │   ├── architect-colors.ts
│   │   ├── utils.ts            # cn()
│   │   └── constants/motion.ts
│   ├── types/                  # entities.ts, common.ts
│   ├── i18n/                   # routing, request, navigation
│   └── middleware.ts
├── messages/                   # en.json, ko.json
├── docs/prd/                   # PRD files
├── public/images/              # buildings/, architects/, cities/
└── DESIGN.md                   # 200-line design specification
```

### 2. Current Implementation Status

| Route | Status | Notes |
|-------|--------|-------|
| `/` (Home) | ✅ | Hero + 4 entry point cards |
| `/map` | ✅ | MapLibre GL, markers, popups, selection sidebar |
| `/map/buildings` | ✅ | Grid/list view, filtering, selection toggles |
| `/map/buildings/[slug]` | ✅ | Detail page with map iframe, tags, related |
| `/map/architects` | ✅ | Grid view with bio, work count |
| `/map/architects/[slug]` | ✅ | Detail page (code exists) |
| `/map/cities` | ✅ | Grid view with country, coordinates |
| `/map/cities/[slug]` | ✅ | Detail page (code exists) |
| `/diagram` | ✅ | D3 force/timeline/geography layouts + PNG export |
| `/about` | ✅ | Mission statement, Le Corbusier quote |
| `/shops` | ❌ | Data model only, no UI |
| `/events` | ❌ | Data model only, no UI |

### 3. Data Layer

**Entities** (all defined in `src/types/entities.ts`):
- **Building** — id, slug, name, nameKo, architectId, cityId, year, description, address, location, images, tags, status, typology, website
- **Architect** — id, slug, name, nameKo, nationality, birthYear, deathYear, bio, portrait, tags, status, notableWorks
- **City** — id, slug, name, nameKo, country, description, location, images, tags, status
- **Shop** — (model ready, no data/UI)
- **Event** — (model ready, no data/UI)

**Sample Data**: ~4 buildings, 4 architects, 2-3 cities (very small seed dataset)

**Query Functions** (`data.ts`): getBuildings, getBuildingBySlug, getBuildingsByCity, getBuildingsByArchitect, getRelatedBuildings (scored), getBuildingsByTag, getAllTags, getArchitects/Cities with slug/id lookups

### 4. State Management

**Zustand Store** (`selection-store.ts`):
- `selectedBuildingIds: string[]` (max 10)
- Actions: add, remove, toggle, clear, isSelected
- Used by map sidebar, building list, detail pages
- No persistence to localStorage

### 5. Map Implementation

- **MapLibre GL 5.22.0 + react-map-gl 8.1.0**
- Tile: OpenFreeMap Liberty style
- Initial viewport: lon 10, lat 30, zoom 2
- Features: colored markers, flyTo on click, popup cards, architect legend, selection sidebar
- **Missing**: clustering, city/tag filtering UI, map bounds constraint

### 6. Diagram/Visualization

- **D3.js 7.9.0** force-directed graph
- 3 node types: buildings (circles), architects (rounded rects), cities (triangles)
- 3 layout modes: Force, Timeline (year axis), Geography (lat/lng)
- Grid background (40px pattern), zoom/pan, drag, hover tooltips
- **Export**: html-to-image → PNG (pixelRatio: 2, white bg)

### 7. Design System (from DESIGN.md)

- **Achromatic** palette — OKLCh, no brand color
- **Monospace everywhere** — Geist Mono (Geist Sans fallback for Korean)
- **Flat** — no shadows on content, structure via borders
- **40px grid overlay** globally (pointer-events: none)
- **Restrained** — max 2 font weights (light + 400)
- Custom tokens: --background, --foreground, --muted-foreground, --border, --accent, --destructive

### 8. i18n

- **next-intl 4.9.0** with EN/KO locales
- Full translation files in `messages/`
- ICU pluralization syntax
- Locale-aware routing: `/{locale}/path`

### 9. Gaps vs PRD

**Missing Map Features:**
- City/Tag filtering UI on map
- Clustering for dense areas
- Mini preview list panel

**Missing Modules:**
- Shops UI (data model ready)
- Events UI (data model ready)
- Archive landing page

**Data:**
- Very small seed dataset (~4 buildings)
- No spreadsheet → JSON pipeline implemented
- No image sourcing/ingestion workflow

**Other:**
- Layout state not persisted (diagram mode resets)
- No node images in diagram
- No AI features (future scope)

---

## Part 2: Web Research

### Topic 1: MapLibre GL Interaction Patterns (2025-2026)

#### Clustering
- Use **symbol layers** instead of DOM-based markers for 100+ points
- Enable `cluster: true` on GeoJSON source with `clusterRadius: 50`
- Set `clusterMaxZoom` for maximum clustering zoom level
- Reduce GeoJSON coordinate precision to ~6 decimals
- For 50,000+ points, consider vector tiling (Martin)

#### Multi-Point Selection
- Use `setFilter()` to show subsets based on user selections
- Implement box selection with `boxZoomEnd` callback (Shift-drag)
- Store selected feature IDs and update layer styling

#### Tag-Based Filtering
- MapLibre supports filtering by array properties natively
- For tags as JSON arrays: use built-in expressions for exact matches
- For prefix/substring: store as CSV strings + `["index-of"]` expressions

#### Preview Cards & Panels
- Popup API with `.setPopup()` method for click-to-reveal
- Use `queryRenderedFeatures()` for cluster click handling
- Recommended: 70-75% map width + 25-30% side panel

#### Performance
- 100-1,000 markers: efficient with clustering
- 50,000+: vector tiling essential
- Use `maxZoom: 12` for point sources, disable overlap detection

### Topic 2: Canvas/SVG Image Export

#### Library Comparison
| Library | Downloads | Best For |
|---------|-----------|----------|
| html2canvas | 2.6M+/week | Basic screenshots, broad community |
| html-to-image | 1.6M+/month | Modern TS, complex DOM (current choice ✅) |
| d3-svg-to-png | Niche | D3-specific SVG → PNG/WebP |

#### High-Resolution Export
- scale: 1 = 96 DPI (screen only)
- **scale: 2 = 192 DPI** (standard print, recommended default ✅)
- scale: 3 = 288 DPI (high-quality print)
- scale: 4 = 384 DPI (large-format, 10MB+ files)

#### Custom Fonts in Exports
- Convert fonts to base64 @font-face declarations
- Use Font Loading API for reliable loading
- Alternative: convert text to SVG paths for guaranteed rendering

#### Best Practices
- Add `crossorigin="anonymous"` to images for CORS
- Pre-load images before capture
- Use whole pixel values to prevent anti-aliasing overhead
- Isolate export target elements (don't capture entire page)

### Topic 3: Spreadsheet → JSON Pipeline

#### Recommended Approach for Archi Curation

**CSV Export via GitHub Actions** (best fit for curated content):
1. Google Sheets as main archive DB (tabs: Curated, Cities, Architects, Images)
2. GitHub Action (`gsheets-to-csv`) exports on schedule
3. Node.js script validates + generates slugs + converts to JSON
4. Committed to repo → deployed via CI/CD

**Advantages**: version control, offline works, no runtime API dependencies

#### API Services (alternatives)
- **Sheety**: Google Sheets → REST JSON API
- **SheetDB**: Google Sheets as database with familiar UI
- **sheet2api**: Direct JSON API endpoints

#### Validation Requirements
- Slug uniqueness check
- Coordinate validation (lat/lng bounds)
- License allowlist verification
- Required field presence
- Tag standardization

#### When to Migrate to Supabase
**Stay with JSON if**: 1-5 curators, infrequent updates, <5,000 items, version control desired
**Migrate when**: real-time collaboration needed, user submissions, >10,000 items, complex queries

### Topic 4: Architecture Visualization Web References

#### Design References
- **Divisare** — "Monumental atlas of contemporary architecture", image-led curation, sparse text
- **Herzog & de Meuron portfolio** — Spacious, quiet, uncompromising simplicity, curated selection
- **Carmody Groarke** — Linear editorial layout, research-driven body of work

#### Map-Based Architecture UX (mapuipatterns.com)
- Clustering + Flare clusters to reduce visual overwhelm
- Attribute + spatial filters for narrowing datasets
- Layer lists with toggle controls
- Heat maps + choropleth for distribution
- Legend + data dimming for non-relevant items
- Timeline slider for temporal navigation

#### Design Language Recommendations
- **Grid**: 12-column standard, subtle overlay echoing architectural drafting
- **Lines**: Thin, architectural — divide sections for clear composition
- **Color**: Monotone base + single strategic accent color
- **Typography**: Monospace or well-chosen serif, generous spacing
- **Whitespace**: Projects breathe — generous padding between sections
- **Motion**: Smooth transitions creating sophistication, never flashy

---

## Key Recommendations Summary

1. **Map**: Migrate from DOM markers to symbol layers + clustering for scale; add city/tag filter UI
2. **Export**: Current html-to-image choice is solid; add scale options (1x/2x/3x) for user control
3. **Pipeline**: Implement CSV export via GitHub Actions from Google Sheets with validation script
4. **Design**: Current achromatic grid-based system is already aligned with best architecture web practices
5. **Data**: Priority — expand seed dataset to 15-20 buildings before next features
