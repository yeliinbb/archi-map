# PRD — Archi Curation

## 0. Document Info
- **Product Name**: Archi Curation
- **Primary Module (MVP)**: Archi Curation · Map
- **Product Type**: Curator-led archival web experience
- **Version**: v0.1 MVP
- **Status**: Draft
- **Last Updated**: 2026-03-11

---

## 1. Product Overview

Archi Curation is a curator-led archival website that organizes architecture, design, furniture, interior shops, and events into a visually engaging digital experience.

The MVP starts with **Archi Curation · Map**, a map-based archive focused on architecture and architects. Over time, it will expand into broader design-related categories such as furniture, interior shops, and architecture/design events.

This is **not** a user-generated platform. The core model is:
- the curator collects and structures the data,
- the site presents it through thoughtful 2D/3D interactions,
- visitors browse, explore, and generate visually interesting outputs from curated selections.

The main value is not account-based productivity, but **curation + visual delight + interaction**.

---

## 2. Product Vision

To build a digital curation space where architecture and design references are not only searchable, but also **felt** through spatial, graphic, and diagrammatic interaction.

Archi Curation should feel like:
- a personal archive,
- a design reference library,
- a map-based exploration tool,
- and a visual playground where selected places can become shareable curated graphics.

---

## 3. Problem Statement

People interested in architecture and design often need to gather information from fragmented sources:
- maps,
- blogs,
- museum or institution websites,
- social media,
- Wikipedia,
- photo archives,
- event pages.

This creates several problems:
1. **Information is scattered** across too many sources.
2. **Spatial understanding is weak** in traditional archive formats.
3. **Visual excitement is low** in plain list-based research tools.
4. **Personal curation output is hard to make** without manual graphic work.
5. **Archiving as a solo curator** becomes messy without a lightweight data workflow.

Archi Curation solves this by combining:
- structured curator-owned data,
- map-based browsing,
- selective 2D/3D visual interaction,
- exportable visual outputs.

---

## 4. Product Goals

### 4.1 Primary Goals
- Build a curator-owned archive that can grow consistently over time.
- Launch a fast MVP centered on architecture map exploration.
- Turn archived data into visually meaningful 2D/3D interactions.
- Let visitors create lightweight outputs such as a personal map composition or curated diagram image.

### 4.2 Secondary Goals
- Create a system that can later expand to shops, furniture, and events.
- Make the archive usable as part of a portfolio ecosystem.
- Establish a reusable content pipeline from spreadsheet to site.

### 4.3 Non-Goals (MVP)
- User-generated submissions
- Community features
- Full account system
- Social feed
- Complex route optimization
- Heavy 3D city simulation

---

## 5. Product Principles

1. **Curator-led, not crowd-led**  
   The archive quality comes from consistent editorial judgment.

2. **Visual experience over utility overload**  
   The site should feel elegant and exploratory, not like a dense database tool.

3. **Simple operating workflow**  
   The curator should be able to archive entries quickly through lightweight tools.

4. **Interaction as delight**  
   Visitors should enjoy map selection, diagram transformation, and image extraction.

5. **Expandable structure**  
   Even if the MVP starts with architecture, the schema should support shops and events later.

---

## 6. Target Audience

### 6.1 Primary Audience
#### A. Architecture & Design Curious Visitors
- Interested in cities, buildings, spaces, design culture
- Enjoy visual and exploratory interfaces
- Want inspiration rather than deep academic research tools

#### B. Design-aware Travelers
- Browse architecture and shops before or during travel
- Want a spatial sense of where interesting places are
- Like saving a visual memory or map-like composition

#### C. Students / Emerging Creatives
- Need references for architecture, interiors, furniture, and exhibitions
- Prefer an aesthetically organized archive over fragmented web search

### 6.2 Secondary Audience
#### D. Recruiters / Portfolio Reviewers
- See the site as proof of product thinking, frontend skill, design sensitivity, and curatorial perspective

---

## 7. Core User Experience

The MVP experience should support this loop:

1. Visitor lands on the site.
2. Browses curated architecture content through map/list/grid views.
3. Selects interesting locations.
4. Switches into a visual mode where selected points become a composed graphic or diagram.
5. Exports the result as an image.
6. Leaves with both information and an emotional impression.

The site should feel like a curated design object, not just an information product.

---

## 8. MVP Scope

### 8.1 In Scope
#### Content Scope
- Buildings
- Architects
- Cities
- Basic shop/event structure prepared for future expansion

#### Experience Scope
- Home page
- Map browsing
- Building list/detail
- Architect list/detail
- City-based filtering
- Tag/category filtering
- Selection of multiple map points
- Diagram/graphic generation from selected points
- Export as image

#### Admin/Operations Scope
- Spreadsheet-based archival workflow
- JSON or DB-based publishing pipeline
- Manual curation only

### 8.2 Out of Scope
- User accounts
- User-created collections stored in cloud
- Comments or reviews
- Social sharing network features
- Public submission moderation system
- Complex AI personalization based on user history

---

## 9. Information Architecture

```text
/
├─ /about
├─ /map
│  ├─ /cities
│  ├─ /cities/[slug]
│  ├─ /buildings
│  ├─ /buildings/[slug]
│  ├─ /architects
│  └─ /architects/[slug]
├─ /shops             (future-ready / preview)
├─ /events            (future-ready / preview)
├─ /diagram           (selection-based visual output)
└─ /archive           (optional editorial landing / future)
```

---

## 10. Feature Requirements

## 10.1 Home
### Purpose
Introduce the brand and immediately communicate the archive’s visual tone.

### Requirements
- A strong hero section with grid-based branding
- Optional lightweight 3D or animated line-based motion
- Entry points to:
  - Map
  - Buildings
  - Architects
  - Featured city / featured curation
- Highlight the curator-led nature of the archive

### Success Criteria
- Users understand within a few seconds that this is a curated architecture/design archive
- The visual identity feels distinct and portfolio-worthy

---

## 10.2 Map Module
### Purpose
Enable visitors to discover places spatially.

### Requirements
- Interactive map view
- Pins for curated entities (MVP: buildings)
- Click pin → preview card / detail entry point
- Support city filtering
- Support tag/style filtering
- Support selecting multiple points

### Nice-to-have
- Clustering for dense areas
- Mini preview panel beside map

### Success Criteria
- Users can quickly identify interesting places in a city
- Multi-selection feels intuitive

---

## 10.3 Buildings Archive
### Purpose
Provide a structured archive of architecture entries.

### Requirements
- List/grid of buildings
- Detail page with:
  - name
  - city
  - country
  - year
  - architect(s)
  - description
  - coordinates
  - source links
  - image credits/license
- Related items section
- Tag-based navigation

### Success Criteria
- Entry pages are informative but visually restrained
- A building page feels like both archive and design reference

---

## 10.4 Architects Archive
### Purpose
Create contextual relationships around buildings.

### Requirements
- Architect list
- Architect detail page with:
  - name
  - nationality
  - birth/death years if available
  - short bio
  - representative works
  - links to related buildings

### Success Criteria
- Users can navigate naturally between people and places

---

## 10.5 Diagram Mode / Visual Output
### Purpose
Turn selected places into a graphic experience.

### Core Idea
When users select multiple locations on the map, the system transforms those points into a stylized diagram or graphic composition.

### Requirements
- Users can select multiple map points
- A “Generate Diagram” action becomes available
- Generated output includes:
  - points / markers
  - connecting paths or lines
  - labels or numbering
  - branded grid or abstracted geographic frame
- Output can be exported as PNG/WebP

### Visual Direction
- More abstract than literal map screenshot
- Grid / line / architecture drawing sensibility
- Feels like a personal curated print, not a utilitarian route map

### Success Criteria
- Output is visually attractive enough to save/share
- Experience creates delight beyond standard map interaction

---

## 10.6 Future Modules (Prepared Now, Not Fully Built Yet)

### Shops
Potential content types:
- furniture stores
- lighting stores
- interior concept shops
- bookstores related to design/architecture

### Events
Potential content types:
- architecture exhibitions
- design fairs
- talks / lectures
- city-specific cultural events

### Requirement for MVP
- Data model should already support these types
- Navigation can show preview/future labels if desired

---

## 11. AI Experience Direction

AI in this product should not feel like a productivity assistant.
It should feel like a **curatorial interpretation layer**.

### Possible Future AI Features
- Recommend related places based on selected points
- Suggest thematic groupings:
  - brutalism route
  - modernism route
  - wood/interior/furniture route
- Generate a short curatorial caption for a selected set
- Propose a visual layout title for exported diagrams

### Principle
AI should enhance the feeling of curated discovery, not dominate the experience.

---

## 12. Data & Content Model

The data model must support both current and future content types.

### 12.1 Core Entity Types
- building
- architect
- shop
- event
- city

### 12.2 Shared Fields
Recommended base fields:
- `id`
- `type`
- `name`
- `slug`
- `city`
- `country_code`
- `lat`
- `lng`
- `tags`
- `categories`
- `summary`
- `source_url`
- `cover_image_url`
- `image_license`
- `image_creator`
- `image_attribution`
- `status`
- `updated_at`

### 12.3 Type-Specific Fields
#### Building
- `year_start`
- `year_end`
- `architects`
- `style`
- `desc_md`

#### Architect
- `birth_year`
- `death_year`
- `nationality`
- `bio_md`
- `related_buildings`

#### Shop
- `address`
- `open_hours`
- `website`
- `phone`
- `shop_category`

#### Event
- `start_date`
- `end_date`
- `venue`
- `organizer`
- `tickets_url`

---

## 13. Content Operations Workflow

## 13.1 Recommended Input Method
For the MVP, the recommended source of truth is a **spreadsheet-based workflow**.

### Preferred Setup
- Google Sheets as main archival database
- Optional Google Form for quick mobile entry
- Separate tabs for:
  - Curated
  - Cities
  - Architects
  - Images

### Why
- low friction
- easy manual editing
- mobile-friendly
- good enough for solo curation
- easy to transform into JSON or database rows

## 13.2 Publishing Workflow
1. Curator enters or edits data in spreadsheet
2. Rows marked as `published` become eligible for site output
3. Script converts spreadsheet/CSV into structured JSON
4. Site consumes JSON directly or syncs it into Supabase

## 13.3 Validation Needs
- slug uniqueness
- coordinate validity
- license whitelist
- required field checks
- tag normalization

---

## 14. Image & Copyright Requirements

This is critical because architecture/design archives depend heavily on visuals.

### 14.1 Allowed Priority Sources
Prioritize:
- Public Domain
- CC0
- CC BY
- CC BY-SA

### 14.2 Minimum Metadata Required for Any Image
- source URL
- creator name
- license type
- attribution text

### 14.3 UI Requirement
Every visible image must have:
- clear source traceability
- license/credit display on detail page
- optional compact credit on cards or modal

### 14.4 Operating Rule
If an image license is unclear, the item must remain in `draft` and not be published.

---

## 15. Technical Requirements

## 15.1 Frontend
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui

## 15.2 Visual/Interactive Layer
- MapLibre GL or equivalent map stack
- Three.js / React Three Fiber for lightweight visual scenes
- Canvas or WebGL-based export flow for diagram image generation

## 15.3 Data Layer
### MVP Option A
- Google Sheets / CSV → JSON
- Static JSON served by Next.js

### MVP Option B
- Google Sheets / CSV → Supabase
- Site reads through API or direct fetch

### Recommended Starting Point
Option A for speed, then Option B when scale or filtering complexity increases.

## 15.4 Hosting
- Vercel for frontend
- Supabase optional for storage/database
- Future AWS migration possible after content scale grows

---

## 16. Experience & Interaction Principles

The product should not feel like a generic SaaS dashboard.

### Desired Feeling
- graphic
- calm
- architectural
- exploratory
- slightly playful
- collectible

### Interaction Tone
- smooth transitions
- restrained motion
- tactile selection
- elegant export moments

### Design Language
- grid overlays
- thin lines
- monochrome base + restrained accent color
- architectural diagram sensibility

---

## 17. Success Metrics

Because this is a curator-led experience site, success should not be measured like a typical productivity SaaS.

### MVP Metrics
- average detail views per session
- map interaction rate
- multi-point selection rate
- diagram generation rate
- export rate
- average session duration
- percentage of visitors reaching 2+ pages

### Qualitative Metrics
- does the site feel memorable?
- does it strengthen portfolio perception?
- does it create a sense of discovery?
- do exported visuals look worth saving?

---

## 18. Risks

### 18.1 Content Operations Risk
Manual curation may become slow if the structure is too complex.

**Mitigation**: keep spreadsheet input minimal and standardized.

### 18.2 Copyright Risk
Image usage can create legal/ethical issues if source tracking is weak.

**Mitigation**: only publish entries with complete image metadata.

### 18.3 Performance Risk
Map + 3D + export interactions can become heavy.

**Mitigation**: keep MVP visuals lightweight, abstract, and selective.

### 18.4 Scope Risk
Too many categories too early can dilute the launch.

**Mitigation**: launch with architecture map first, but structure for future expansion.

---

## 19. MVP Roadmap

## Phase 1 — Foundation
- define brand direction for Archi Curation
- finalize spreadsheet schema
- define publishing pipeline
- collect first seed dataset

## Phase 2 — Core Archive
- build home
- build map experience
- build buildings list/detail
- build architects list/detail
- connect published data to frontend

## Phase 3 — Visual Interaction
- implement multi-point selection
- implement diagram mode
- implement export flow
- refine visual output presets

## Phase 4 — Polish
- improve transitions and visual quality
- optimize performance
- ensure license/credit rendering is complete
- connect case study framing for portfolio

## Phase 5 — Expansion
- add shops preview
- add events preview
- explore AI-assisted curation features

---

## 20. Open Questions

- What should be the first 3 seed cities?
- How abstract should the exported diagram look?
- Should exported visuals include labels by default or optional toggle?
- Should shops/events appear in MVP navigation or remain hidden until content volume is enough?
- When should the data pipeline move from JSON to database?

---

## 21. Final Product Summary

Archi Curation is a curator-owned archival web project that begins with architecture map exploration and grows into a wider design curation ecosystem.

Its differentiator is not just information organization, but the combination of:
- editorial perspective,
- map-based discovery,
- architecture-inspired visual language,
- and diagrammatic interaction that transforms selection into a memorable graphic experience.

In the MVP, success means building a strong foundation where:
- the curator can archive content easily,
- visitors can explore intuitively,
- and the site already feels like a distinctive design object.
