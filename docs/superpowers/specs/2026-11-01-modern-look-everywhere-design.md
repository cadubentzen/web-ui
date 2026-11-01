# Modern look everywhere — design addendum

Status: approved by the user in design rounds 6–7 · 2026-11-01
Builds on: [2026-11-01-modern-look-design.md](2026-11-01-modern-look-design.md) (direction "Refined",
ride HUD — implemented). This addendum replaces that document's non-goal "no new layout for
Routes, Workouts, Activities or Settings; they change only through tokens/base controls": after
seeing the ride HUD in the app the user found the rest "still looks a lot like the old version"
and asked for **every screen and dialog** to get the new look.

References in [`2026-11-01-modern-look/`](2026-11-01-modern-look/):
- `app/routes.png`, `app/devices.png`, `app/workouts.png`, `app/settings.png`, `app/pause.png` — the
  approved look (round 7); `mockups-app.html` renders them live.
- `ride-compact.png` — the approved compact ride centre panel (round 6 "Short stack").
- `today/*.png` — every screen and dialog as it looked before this work (24 captures).

## Decided by the user

**Kit (round 6), used by every screen:**

| Element | Choice |
|---|---|
| Buttons | **Pill** (radius 999px). Primary = accent fill, Secondary = outlined (1.5px, white 30 %), Text = no frame, Danger = red outline. |
| Text/number fields, dropdowns | **Filled box**: translucent white fill (≈10 %), 1px border white 14 %, radius ≈0.55em; unit/chevron muted on the right. |
| On/off settings | **Switches** (accent when on), replacing checkboxes. |
| Tabs, single choices (e.g. view preference, route type filter) | **Pills**: selected = white 14 % fill. |
| Dialog frame | **Title left + round close (✕) button**; footer buttons right-aligned; destructive action set apart on the left. |
| Navigation bar | **White tile** for the selected item (as today), on a translucent rail. |
| Cards and tiles | **Glass panel**: white ≈6 % fill, 1px white 14 % border, radius ≈0.9em. |

**Page background (round 7): wine to indigo, no photo.**
`radial-gradient(120% 90% at 85% -10%, #4a1240 0%, transparent 55%), linear-gradient(160deg, #24081f 0%, #160a3c 100%)`.
The blurred scenery photo is removed from every page. Ride screens keep the video/map behind the HUD.

**Ride centre panel (round 6): "Short stack".** Same arrangement as now (two gauges, number row under
them) but smaller gauges and tight spacing, so there is no empty band (`ride-compact.png`).

**Screens as in round 7** (approved "looks great"): Routes (filled search, pill chips for content type,
glass rows), Devices (glass tiles, switches, small interface pills, pill OK), Workouts (glass cards with
the workout profile in zone colours and a Select button), Settings (left title + ✕, pill tabs, pill
choices, filled fields, switches), pause menu (summary tiles: time, distance, avg power, avg heart rate,
plus the power trace — instead of today's empty activity tab; Delete on the left).

Unchanged from the first design: accent `#e4a13c`, green `#8dc100` for OK/success, today's fonts,
uppercase page titles, controller focus ring (orange glow) on every focusable element.

## Decided by Claude (check these)

1. **Scope — every screen and dialog in `today/`:** Devices (+ interface settings dialog, device
   selection), Routes (list, tiles, filters, import dialog, free-ride start dialog, route details),
   Workouts (page, workout details dialog), Activities (list, activity details dialog), Settings (Gear,
   Ride, Apps, Support), User, the ride start overlay, the pause menu and every confirm dialog
   (e.g. delete ride). Screens not captured (exit page, loading page, summary after Save) follow the kit.
2. **Order: kit first, screens second.** Restyle the shared atoms/molecules (`Button`, the `EditField`
   family, `SingleSelect`, `Checkbox` → switch look, `SegmentedControl`/radio groups → pills, `Tabs`,
   `Dialog`, `NavigationBar`, `MainPage` background, a `Panel` atom for glass cards) so most screens
   change by themselves; then fix each screen's own styled-components and layout.
3. **Tokens:** extend `newUITheme` (and the `hudTokens` helper from the HUD work) with page background,
   panel, field, pill and danger tokens; no new literal colours in components.
4. **Close button (✕)** in dialogs calls the dialog's existing cancel/close handler and is a real,
   focusable button (controller navigation); Escape keeps working.
5. **Checkbox → switch** is visual only: same component API, same logging, same `checked` semantics.
6. **Pause menu summary** uses data services already provides for the activity summary
   (`getActivitySummaryDisplayProperties` / activity stats); if a value is missing it shows `–`. The
   existing Gear/Ride tabs stay.
7. **Activity details chart** keeps its data; restyle axes/lines with tokens (power in accent, heart rate
   in a soft red), glass frame.
8. **Workout cards** keep today's information (title, duration, FTP) and actions; "OK" becomes "Select".
9. **Route details** keeps every control (decision 17 of the first design).
10. **Same verification as the HUD work**: per-screen keyboard pass + screenshot on the **virtual
    monitor**, compared with `app/*.png`; no controller passes (user's choice).

## Non-goals

- No new features beyond the pause-menu summary content.
- No change to navigation structure, page order or wording (except "OK" → "Select" on workout cards and
  the dialog ✕).
- No mobile app changes.

## Anti-goals

- Losing keyboard/controller reachability of any control (switches, pill choices and ✕ must be focusable).
- Literal colours scattered in components again (use tokens).
- Any screen left with the blurred photo or browser-default inputs.
