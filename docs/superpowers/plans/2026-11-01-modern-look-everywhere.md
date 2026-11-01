# Modern look everywhere — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Every screen and dialog of the web UI in the approved "Refined" look: pill buttons, filled fields, switches, pill tabs/choices, dialogs with a left title and ✕, glass-panel cards, the wine-to-indigo page background without the photo, and a compact ride centre panel.

**Architecture:** Kit first — restyle the shared atoms/molecules from theme tokens so most screens change by themselves — then fix each screen's own styled-components and layout. Every task ends with a keyboard pass and a screenshot on the virtual monitor compared with the approved mockups.

**Tech Stack:** web-ui only: React 19, styled-components 6, vitest + @testing-library/react, Storybook.

**Spec:** `web-ui/docs/superpowers/specs/2026-11-01-modern-look-everywhere-design.md` (+ the first spec `2026-11-01-modern-look-design.md`; references in `2026-11-01-modern-look/app/*.png`, `ride-compact.png`, `today/*.png`, live mockups `mockups-app.html`).

## Global Constraints

- Branch `downstream` in web-ui; one topic per commit; never push or rewrite history.
- Follow `web-ui/docs/CODEBASE_GUIDE.md` (layering, barrels, relative imports, smart/view split, base inputs log their own interactions, stories, colocated `*.unit.test.jsx`).
- Tests: `CI=1 npx vitest run --project unit <path>`; full suite (only the known `routeList/page.unit.test.jsx` "Free Ride…" failure allowed); `npm run build` succeeds.
- Colours only from theme tokens (`src/theme.jsx` `newUITheme`, `hudTokens(theme)`); no new literals in components.
- Kit values (verbatim from the spec): pill buttons radius 999px — Primary accent `#e4a13c` fill / text `#1c1203`; Secondary 1.5px outline white 30 %; Text no frame; Danger red outline. Fields: fill white ≈10 %, border 1px white 14 %, radius ≈0.55em, unit/chevron muted. Switch: accent when on, white 20 % track when off. Pills: selected white 14 % fill. Glass panel: fill white ≈6 %, border 1px white 14 %, radius ≈0.9em. Page background: `radial-gradient(120% 90% at 85% -10%, #4a1240 0%, transparent 55%), linear-gradient(160deg, #24081f 0%, #160a3c 100%)`.
- Keep today's fonts, uppercase page titles, green `#8dc100` for OK/success, and the orange controller focus glow (`.controller-focus`) on every focusable control.
- Keep every control, handler, hotkey and logging call; visual changes only unless a task says otherwise.
- Every interactive element stays a real focusable element (`button`, `input`, `[role=switch]`, `[role=tab]`…) so `modules/ControllerNavigation` reaches it.

## Review Focus

1. **Controller/keyboard reachability of new shapes** — switches, pill choices, pill tabs and the dialog ✕ are reachable with arrows and activate with Enter. Pinned in Tasks 3, 4, 5, 6.
2. **Long labels and translations** — pill buttons and chips with long text (e.g. "Start with workout", German labels) wrap or ellipsize instead of overflowing. Pinned in Task 2.
3. **Disabled and error states** — disabled buttons/fields are visibly disabled; a field validation error stays visible on the filled style. Pinned in Tasks 2 and 3.
4. **Small windows (1280×720) and 4:3** — dialogs fit and scroll inside instead of being cut off. Checked in every screenshot step at two sizes.
5. **No leftover photo background** — every page and dialog backdrop uses the new background. Pinned in Task 1 and the final tour.

## App checks (every task)

Virtual monitor (user's current setting): `rdctl start --virtual`; `rdctl regions` → move the pointer into the virtual region; `cd desktop && setsid -f sh -c 'npm run dev:local -- --remote-debugging-port=9223 > <log> 2>&1'`. Drive by keyboard via rdctl (click into the window first), read focus with `node e2e/cdp.mjs "$(cat e2e/cands.js)"`, capture with CDP `Page.captureScreenshot` (`e2e/design/tour/snap.sh <name>` writes into `e2e/design/tour/`). Compare with `docs/superpowers/specs/2026-11-01-modern-look/app/*.png`. Close the app and `rdctl stop` right after. Run by the coordinating session after each task's review.

---

### Task 1: Page background and kit tokens

**Files:** Modify `src/theme.jsx` (`newUITheme`: `page.background`, `panel {fill, border, radius}`, `field {fill, border, radius}`, `pill {selected}`, `colors.danger`), `src/components/molecules/MainPage/index.jsx` (drop `ImageBackground`, use `page.background`), `src/pages/loading/loading.jsx`, `src/pages/exit/index.jsx` (same), and the ride pages' backdrop only where the photo shows behind dialogs. Extend `hudTokens(theme)` (or add `kitTokens(theme)` next to it) with the new tokens. Test: `src/theme.unit.test.jsx`, `MainPage` render test.

- [ ] Failing tests: newUI defines the tokens above with the spec values; `MainPage` renders no `ImageBackground` and its root uses the page background token.
- [ ] Implement; run tests → PASS; full suite + build.
- [ ] Commit `style(theme): wine-to-indigo page background and kit tokens`.
- [ ] App check: Routes, Workouts, Activities without the photo.

### Task 2: Buttons

**Files:** `src/components/atoms/Buttons/Button/index.jsx` (+ its stories/tests); check `src/components/molecules/Buttons/*` and other `Button` wrappers for overrides that fight the new shape.

**Interfaces:** keep the existing props (`primary`, `secondary`, `disabled`, `label`, `onClick`, …); add `variant: 'primary'|'secondary'|'text'|'danger'` only if no existing prop maps to it (map existing props first).

- [ ] Failing tests: primary = accent fill + `#1c1203` text + radius 999px; secondary = outline; danger = red outline; disabled has reduced opacity and `aria-disabled`; a long label (`'Start with workout and download'`) doesn't overflow (white-space/ellipsis rule present).
- [ ] Implement; tests → PASS; full suite + build.
- [ ] Commit `style(ui): pill buttons`.
- [ ] App check: route details dialog footer, pause menu buttons.

### Task 3: Fields, dropdowns and switches

**Files:** `src/components/atoms/input/base/EditField.jsx` (EditText/EditNumber/EditPassword), `src/components/atoms/input/SingleSelect/index.jsx`, `src/components/atoms/input/Checkbox/index.jsx` (switch look: `role="switch"`, `aria-checked`, same props/logging).

- [ ] Failing tests: field has the filled style tokens; unit renders muted on the right; validation error text still visible; Checkbox renders `role="switch"` with `aria-checked` toggling on click and on Enter/Space; logging still called once per change.
- [ ] Implement; tests → PASS; full suite + build.
- [ ] Commit `style(ui): filled fields and switches`.
- [ ] App check: User dialog, Settings · Ride, route details options; keyboard: reach and toggle a switch with arrows + Enter.

### Task 4: Pill choices

**Files:** `src/components/atoms/SegmentedControl/*`, `src/components/atoms/Radio/*` (radio groups such as Settings · Ride "View preference"), route-list content filter chips if they are separate (`src/components/modules/Search/Toolbar`).

- [ ] Failing tests: selected option has the pill-selected token and `aria-checked`/`aria-pressed`; options are focusable buttons/radios reachable by keyboard.
- [ ] Implement; tests → PASS; commit `style(ui): pill choices`.
- [ ] App check: Settings · Ride view preference, terrain smoothing in route details, route filters.

### Task 5: Tabs

**Files:** `src/components/molecules/Tabs/{Tabs.jsx,Tab.jsx,index.jsx}`.

- [ ] Failing tests: tabs are `role="tab"` with `aria-selected`; selected tab has the pill style; arrow keys move between tabs (existing behaviour kept).
- [ ] Implement; commit `style(ui): pill tabs`.
- [ ] App check: Settings dialog tabs, pause menu tabs.

### Task 6: Dialog frame

**Files:** `src/components/molecules/Dialog/index.jsx`, `src/components/molecules/dialogs/*` (MessageBox / confirm dialogs, DialogLauncher).

**Interfaces:** title left; a ✕ `button` (`aria-label="Close"`) calling the dialog's existing close/cancel handler (`onClose` ?? `onCancel`), hidden when the dialog has neither; footer right-aligned; a destructive button can be placed left via an existing prop or slot (no new public API unless needed).

- [ ] Failing tests: title rendered left; ✕ present and calls the handler; ✕ absent without a handler; Escape still closes; confirm dialog (MessageBox) has no blue title bar and uses the frame.
- [ ] Implement; commit `style(ui): dialog frame with title left and close button`.
- [ ] App check: Settings, User, route details, delete-ride confirm; keyboard reaches ✕.

### Task 7: Navigation bar

**Files:** `src/components/molecules/NavigationBar/index.jsx` (+ `NavigationBar.unit.test.jsx`, stories).

- [ ] Failing test: rail uses the translucent rail token and rounded corners; selected item keeps the white tile; items stay buttons.
- [ ] Implement; commit `style(ui): navigation rail`.
- [ ] **Checkpoint K (kit):** app tour of all pages + dialogs (24 captures as in `today/`), side by side with `today/*.png` on the design page for the user; list leftovers per screen for Tasks 8–14.

### Task 8: Glass panel + Devices

**Files:** new `src/components/atoms/Panel/{Panel.jsx,index.jsx,Panel.unit.test.jsx}` (glass panel from tokens, optional `focused`); `src/pages/pairing/screen.jsx`, `src/components/modules/PairingInfo/*` (SelectedDevice, SearchingDevice, ConnectionStatus, InterfaceSettings).

- [ ] Failing tests: Panel uses panel tokens; device tile shows capability in accent, device name, value, status dot, switch; interface buttons are small pills (green outline when on).
- [ ] Implement per `app/devices.png`; keep the `data-nav-down` hint from the earlier fix; commit `style(pairing): glass device tiles`.
- [ ] App check vs `app/devices.png`; keyboard: Down from the optional row → OK still.

### Task 9: Routes page and its dialogs

**Files:** `src/pages/routeList/screen.jsx` and its row/tile components (`src/components/modules/Search/*`, `RouteTileSummary`), filters, import dialog, free-ride start dialog (North/South buttons → pill choices).

- [ ] Tests for changed views (rows are Panels; search is a filled field; content filter chips are pills).
- [ ] Implement per `app/routes.png`; commit `style(routes): glass rows, filled search, pill filters`.
- [ ] App check list + tiles + filters + import + free-ride dialog.

### Task 10: Route details dialog

**Files:** `src/components/modules/routeSelection/RouteDetails/{component.jsx,wrapper.jsx}` and tests.

- [ ] Keep every control (spec decision 9 / first spec decision 17); restyle per first spec `route-details.png` with the kit; update `component.unit.test.jsx` only where it pinned old styles.
- [ ] Commit `style(routes): route details in the new look`; app check (video and GPX route).

### Task 11: Workouts page and workout dialog

**Files:** `src/pages/workouts/*` (screen), workout card component(s) under `src/components/modules/workout/*` or `molecules/FolderTile`, the workout details dialog.

- [ ] Cards are Panels with the profile in zone colours, title, duration, FTP and a **Select** primary pill (was "OK"); keep the scheduled section and drag-and-drop import card. Tests for the card view.
- [ ] Commit `style(workouts): glass workout cards`; app check vs `app/workouts.png`.

### Task 12: Activities

**Files:** `src/pages/activities/*`, `src/components/molecules/Activity/*`, activity details dialog/chart components.

- [ ] List rows as Panels; details dialog with the kit; chart lines from tokens (power accent, heart rate soft red), glass frame. Tests for the row view.
- [ ] Commit `style(activities): activities in the new look`; app check list + details.

### Task 13: Settings and User

**Files:** `src/components/modules/Settings/*` (Gear, Ride, Apps, Support, User).

- [ ] Sections with small uppercase muted headers, label/field grid, switches, pill choices (per `app/settings.png`); Apps tab connect buttons as pills. Tests for one section view per tab.
- [ ] Commit `style(settings): settings and user in the new look`; app check all tabs.

### Task 14: Ride — compact centre panel, start overlay, pause menu

**Files:** `src/components/modules/Ride/hud/RideMetricsPanelView.jsx` + `src/pages/ride/atoms/layout.js` (`metrics` region shorter per `ride-compact.png`; layout tests still pass); `src/components/modules/Ride/overlays/StartRide/*`; the pause menu (`src/components/modules/Ride/settings/ActiveRideSettings*` or the component the ride page opens on Escape) — Activity tab shows summary tiles (time, distance, avg power, avg heart rate) and the power trace from services' summary data, `–` when missing; Delete on the left.

- [ ] Also (from the HUD final review): move `RIGHT_COLUMN_WIDTH` / `SHIFTING_REGION` out of `src/pages/ride/atoms/layout.js` into a shared non-page module (e.g. `src/components/modules/Ride/layoutConstants.js`) that `layout.js` and the workout/shifting controls both import — components must not import from `pages/`.
- [ ] Failing tests: compact metrics region height; pause summary renders the four tiles and `–` for missing values; Delete is in the footer's left group.
- [ ] Implement; commits `style(ride): compact centre panel`, `feat(ride): activity summary in the pause menu`, `style(ride): start overlay in the new look`.
- [ ] App check: route ride + pause menu + delete confirm, vs `ride-compact.png` and `app/pause.png`.

### Task 15: Final tour

- [ ] Full suite + build; app tour of every screen (same 24 captures) on the virtual monitor; put old vs new side by side on the design page for the user; list anything not matching the spec.
