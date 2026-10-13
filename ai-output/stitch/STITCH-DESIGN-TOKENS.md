---
name: Academic Review & Evaluation Engine
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#464555'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#777587'
  outline-variant: '#c7c4d8'
  surface-tint: '#4d44e3'
  primary: '#3525cd'
  on-primary: '#ffffff'
  primary-container: '#4f46e5'
  on-primary-container: '#dad7ff'
  inverse-primary: '#c3c0ff'
  secondary: '#545f73'
  on-secondary: '#ffffff'
  secondary-container: '#d5e0f8'
  on-secondary-container: '#586377'
  tertiary: '#005338'
  on-tertiary: '#ffffff'
  tertiary-container: '#006e4c'
  on-tertiary-container: '#7df1bd'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3323cc'
  secondary-fixed: '#d8e3fb'
  secondary-fixed-dim: '#bcc7de'
  on-secondary-fixed: '#111c2d'
  on-secondary-fixed-variant: '#3c475a'
  tertiary-fixed: '#85f8c4'
  tertiary-fixed-dim: '#68dba9'
  on-tertiary-fixed: '#002114'
  on-tertiary-fixed-variant: '#005137'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  headline-xl:
    fontFamily: Newsreader
    fontSize: 36px
    fontWeight: '600'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Newsreader
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Newsreader
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 38px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Newsreader
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Newsreader
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  headline-sm:
    fontFamily: Newsreader
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 17px
    fontWeight: '400'
    lineHeight: 28px
    letterSpacing: -0.01em
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Hanken Grotesk
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
  label-lg:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Hanken Grotesk
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-mobile: 0.75rem
  gutter-tablet: 1.25rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-mobile: 1rem
  margin-tablet: 1.5rem
  margin-desktop: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1.25rem
  space-xl: 2rem
---

## Brand & Style

This design system is engineered for mobile-first academic grading, peer review, and manuscript critique. Built specifically for higher education faculty, principal investigators, and teaching assistants, the interface prioritizes sustained typographic focus, rigorous clarity, and dense document handling within compact touch interfaces.

The aesthetic blends **Modern Editorial Minimalism** with structural, data-dense utility:
- **Atmosphere:** Scholarly, authoritative, frictionless, and orderly. It minimizes cognitive overhead during prolonged grading sessions on mobile and tablet devices.
- **Personality:** Decisive, disciplined, and refined. It avoids decorative clutter in favor of crisp visual hierarchy, rigorous grid alignment, and micro-interactions optimized for rapid evaluation.
- **Visual Stance:** Ultra-refined card structures, crisp micro-borders, generous line spacing for long-form reading, and distinct semantic indicator accents (emerald for mastery/validation, amber for flags/citations) grounded in deep indigo and slate.

## Colors

The palette balances authoritative scholarly tones with precise semantic utility across evaluation contexts.

- **Primary (`#4F46E5`):** Modern Academic Indigo. Used for focal interactive touchpoints, primary rubric submissions, selected grading criteria, and active navigation indicators.
- **Secondary (`#1E293B`):** Deep Slate Ink. Represents primary typographic weight, document headings, rubric containers, and anchor UI structures.
- **Tertiary (`#059669`):** Emerald Mastery. Expresses high scores, passing thresholds, verified AI confidence metrics, and confirmed rubric completion.
- **Warning / Citation Accent (`#D97706`):** Scholarly Amber. Dedicated to flagged citations, incomplete rubrics, grade variance notices, and inline student annotations.
- **Canvas & Surface System:** 
  - Canvas Root: `#F8FAFC` (Slate Tinted White) delivers low-glare reading comfort.
  - Surface Card: `#FFFFFF` provides clean boundary contrast against the slate canvas.
  - Surface Subdued: `#F1F5F9` for rubric cell baselines, inactive tab strips, and inline quote blocks.
  - Border Hairline: `#E2E8F0` defines structural, crisp containment across all cards.

## Typography

The typographical pairing unites academic literary heritage with clinical digital precision:

- **Editorial Headings (`Newsreader`):** Applied to manuscript titles, chapter headings, and key section banners. Newsreader establishes an authoritative academic tone without sacrificing digital legibility on compact displays.
- **Interface & Document Body (`Hanken Grotesk`):** Chosen for all body copy, student submissions, rubric criteria descriptions, labels, and numeric inputs. Its crisp geometry and open apertures guarantee high scanning speed during rapid document evaluation.
- **Hierarchy Rules:**
  - `headline-xl` and `headline-lg` collapse into their `-mobile` equivalents below 640px to eliminate awkward single-word line breaks in manuscript titles.
  - Document reading passages utilize `body-lg` with a loose 28px line-height to promote sustained reading comfort on OLED and LCD handheld displays.
  - `label-sm` is rendered in uppercase with slight letter spacing (`0.04em`) when applied to rubric categories, score bounds, or metadata status chips.

## Layout & Spacing

The layout is built upon a compact 4-column system for mobile viewports, transitioning to an 8-column layout for tablets, and a 12-column layout for horizontal grading workstations.

- **Touch & Reach Philosophy:** Priority interactive elements (score inputs, rubric steppers, quick-tag commentary chips) sit strictly within the lower 60% of the mobile viewport. Manuscript context occupies the upper scrollable region.
- **Rhythm & Grid:** Built using a foundational 4px increment scale:
  - `space-xs` (4px): Micro gaps between status badges and inline scores.
  - `space-sm` (8px): Spacing inside compact lists, chip groups, and toolbar icons.
  - `space-md` (12px): Standard internal padding for list items, input fields, and compact table cells.
  - `space-lg` (20px): Card padding and vertical spacing between distinct rubric criteria.
  - `space-xl` (32px): Structural spacing between document sections and evaluation stages.
- **Mobile Touch Targets:** All interactive touch surfaces strictly enforce a minimum tap clearance of 48×48px, even when visually stylized as compact 32px or 36px elements, by applying invisible touch padding bounds.

## Elevation & Depth

This design system avoids heavy shadows, skewing instead toward clinical clarity via **Low-Contrast Outlines** paired with subtle, purposeful **Tonal Stacking**.

- **Level 0 (Base Canvas):** `#F8FAFC`. Houses the ambient workspace and non-interactive document viewports.
- **Level 1 (Structural Cards & Sections):** `#FFFFFF` with a crisp 1px solid border (`#E2E8F0`). Flat surface without shadow to maintain visual discipline across dense layouts.
- **Level 2 (Interactive Modules & Pinned Footers):** `#FFFFFF` anchored with a subtle, non-diffused 1px border (`#CBD5E1`) and a soft downward ambient drop: `0px 4px 12px -2px rgba(30, 41, 59, 0.05)`. Used for bottom grading drawers, floating score sheets, and sticky action toolbars.
- **Level 3 (Modal Dialogs & Fast Action Menus):** High-clarity popovers utilize `0px 12px 32px -4px rgba(30, 41, 59, 0.12)` alongside an opaque `#1E293B` scrim at 35% opacity to retain underlying document context.

## Shapes

The interface balances crisp geometric precision with soft, approachable interaction points:

- **Base Radius (`0.5rem` / 8px):** Standard across inputs, primary cards, rubric item cells, dropdown sheets, and standard buttons. It prevents harsh industrial corners while preserving a professional, structured form factor.
- **Nested Inner Geometry (`0.25rem` / 4px):** Sub-elements within cards—such as criteria pills, tag badges, and inline numeric steppers—use reduced radii to maintain concentric geometric balance with parent containers.
- **Pill Exception (`9999px`):** Reserved exclusively for semantic chips, status counters, and score badge indicators to instantly differentiate static analytical indicators from square interactive actions.

## Components

### Buttons
- **Primary Action (e.g., "Submit Grade", "Publish Feedback"):** Solid `#4F46E5` background, white label (`label-lg`), 8px border radius, minimum height of 48px. State transitions maintain sharp visual integrity (hover/active: `#4338CA`).
- **Secondary / Utility (e.g., "Flag for Moderator", "Previous Paper"):** Background `#FFFFFF`, 1px border `#E2E8F0`, text `#1E293B`. Active state changes background to `#F1F5F9`.
- **Destructive Action:** Ghost styling with `#DC2626` text, transitioning to `#FEF2F2` background upon active tap.

### Chips & Semantic Tags
- **Rubric Criteria / Filter Chips:** Compact 32px height with rounded-full geometry. Inactive state: `#F1F5F9` background, `#64748B` text. Active state: `#EEF2FF` background, `#4F46E5` text, 1px border `#C7D2FE`.
- **Status Indicators:**
  - *High Score / AI Verified:* `#ECFDF5` background, `#059669` text, 1px `#A7F3D0` border.
  - *Citation Warning / Review Needed:* `#FFFBEB` background, `#D97706` text, 1px `#FDE68A` border.

### Cards
- **Submission & Paper Review Cards:** Pristine `#FFFFFF` surface, 1px `#E2E8F0` border, 8px corner radius. Padding is uniformly fixed at `space-lg` (20px). Internal dividing rules use `#F1F5F9` lines to separate student identities, timestamps, and rubric summaries.

### Input Fields & Steppers
- **Score & Annotation Inputs:** Height 48px, background `#FFFFFF`, 1px `#CBD5E1` border. Focus ring applies a crisp, non-blurred 1px outer ring in `#4F46E5`. Placeholder text in `#94A3B8`.
- **Rapid Numeric Grade Stepper:** Segmented pill button container (`#F1F5F9`) with 48px tap areas for quick integer adjustments without requiring the native mobile keyboard to open.

### Lists & Rubric Rows
- **Grading Matrix Row:** Alternating subtle hover states (`#F8FAFC`). Each criterion displays a title in `label-lg`, benchmark description in `body-sm`, and an aligned single-tap score selector on the trailing edge.

### Specialized Academic Mobile Components
- **Sticky Grading Bar:** Docked at the bottom of the viewport with a height of 64px, safe-area inset compliant. Displays real-time score summation on the left and a full-width "Next Submission" action on the right.
- **Inline Annotation Drawer:** Half-sheet modal with quick-canned academic feedback chips ("Lacks Empirical Support", "Improper APA Citation", "Exemplary Argumentation") allowing instant grading without typing.