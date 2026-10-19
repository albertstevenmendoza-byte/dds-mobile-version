# Mobile optimization — what changed

Drop these files into the repo root (same folder as `novus-styles.css`). Desktop (>1024px, mouse) renders as before.

## New files
- `novus-mobile.css` — one shared mobile/touch layer, loaded after `novus-styles.css`.
- `novus-mobile.js` — builds the bottom tab bar from each page's existing `.cmd-nav`, tracks the real viewport height, hides the tab bar when the keyboard opens, closes the ··· menu on outside tap, locks page scroll behind overlays.

## Edited files (8 pages)
Every page (weekly-staff-meeting and the other-plant picker were dropped per your note): viewport meta gets `viewport-fit=cover` (safe areas / notch); `novus-mobile.css` + `novus-mobile.js` added (kpi-boards is standalone and carries its own mobile block inline).

| Page | Mobile behaviour |
|---|---|
| index (login) | Page scrolls, 48px inputs, compact brand header |
| hub | Full-width cards, tighter header, 44px controls |
| dds-dashboard | 12-col grid → single column, highlights 2-up, Production panel un-fixed from 500px blocks, status-bar metrics kept, drag-reorder only on long-press |
| dds-announcements | Single-column cards, admin toolbar always visible on touch, gallery as bottom sheet |
| play-call | Sticky add-field, 28px check buttons with enlarged hit area |
| needs-action | Table → card list (added `data-label`s in the row template) |
| weekly-kpis | Wrapper sized to dynamic viewport |
| kpi-boards | Controls reflow, popovers/dialogs → bottom sheets, tile tools no longer cover titles, 44px targets |

## Shared behaviours (≤1024px)
Bottom tab bar (Hub / News / Dashboard / KPIs / Play Call) replaces the previously hidden top nav · ··· menu becomes a bottom sheet · full-screen overlays use dynamic viewport height + safe-area padding · 16px inputs (no iOS zoom) · 44px tap targets · hover-only controls revealed on touch.

## Known limits
- KPI Boards tile drag-reorder / drag-from-library is mouse-only HTML5 DnD; on touch use the ⋮ menus.
- Tested in headless Chromium at 390×844, 820×1180 and 844×390 with mocked data — please sanity-check on a real iPhone/Android.
- `index.html` loads `novus-interactions.js` twice (pre-existing); harmless but worth removing.

## Rebased on your 10/19 upload
Applied on top of the newer repo (near-miss-by-department table + Startup Actions). Mobile handling for both: the near-miss table fits the Safety panel at phone width; the Startup Actions popover (tap a STARTUP pill) becomes a bottom sheet with 44px controls. Only `dds-dashboard.html` differed upstream; the rest were identical, so nothing was overwritten.
