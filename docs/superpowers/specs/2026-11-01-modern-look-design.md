# Modern look for Incyclist ("Refined" direction) — design

Status: approved by the user · 2026-11-01

Reference images (chosen in five review rounds) are in
[`2026-11-01-modern-look/`](2026-11-01-modern-look/): `ride.png`, `ride-workout.png`,
`workout-page.png`, `routes.png`, `devices.png`, `route-details.png`, and `mockups.html` /
`mockups-workout.html` (the last review sheet; open it in a browser, it renders
offline apart from Google Fonts). The mockups are drawings, not specs: where this document and a
mockup disagree, this document wins.

## Intent

The user wants Incyclist to look modern without losing its identity. Of four directions shown
(frosted glass, flat dark studio, bold race style, refined current), they picked **Refined**: keep
today's look — the wine-to-indigo gradient panels, uppercase page titles, orange buttons, the
blurred scenery background, today's font — and make it consistent and calmer. Most of the effort
goes into the screen people look at most: **the ride screen**, whose numbers were redesigned over
three rounds.

The Routes page already looks the way the user wants ("looks perfect to me"). It is the reference
for what "Refined" means elsewhere.

## Goals

1. A new in-ride HUD (all ride types) as in `ride.png`: zone gauges for power and heart rate,
   the other numbers as large plain values, time and distance as ridden + to go on the left.
2. One set of design tokens in `src/theme.jsx` that the HUD and the restyled screens read, instead
   of literal colours.
3. Consistent base controls: `Button`, the `EditField` family, `Checkbox`, `SingleSelect`,
   `SegmentedControl`, dialogs — same radius, heights, colours, focus style. Today the inputs use
   browser defaults.
4. The Devices (pairing) screen and the Route details dialog restyled as in `devices.png` and
   `route-details.png`.
5. Work lands as small, topic-split commits on `downstream` (web-ui and services) so each can be
   offered upstream on its own.

## Non-goals

- No new layout direction for Routes, Workouts, Activities or Settings pages. They change only
  through the shared tokens and base controls (goal 3).
- No font change. Keep today's font stacks; numbers use tabular figures.
- No user-configurable HUD layout (drag/drop, choosing which numbers show). Show/minimise and the
  existing hotkeys stay as they are.
- No mobile app changes.

## Anti-goals (would make this a failure even if it "works")

- Small secondary text on the ride screen. The user dropped the avg/max lines because they are
  unreadable from the bike; don't bring back small captions under the numbers.
- Losing controller (D-pad) navigation or its focus ring on any restyled screen
  (`modules/ControllerNavigation`, `.controller-focus` in `src/index.css`).
- Business logic in web-ui. Zone computation belongs in `incyclist-services`
  (see web-ui/docs/CODEBASE_GUIDE.md, "The smart/view split").
- Overlays covering each other or the centre of the road view at 16:9 and 16:10 window sizes.

## Decided by the user

**Direction D "Refined".** Accent orange (`#e4a13c`, a slightly brighter take on today's
`#dd9933`); green `#8dc100` stays the success/OK colour. Panels keep the
`rgb(56,1,31) → rgb(26,4,86)` gradient at roughly 0.7–0.85 opacity over the scenery/video.

**Ride HUD — "Gear in the number row" (`ride.png`):**

- **Left panel (top left):** Time and Distance. Each row: icon, elapsed value in full white,
  remaining value right-aligned in a dimmed colour with a leading minus (`−0:35:12`, `−9.9 km`),
  and a thin progress bar in the accent colour underneath. No "ridden"/"to go" captions.
- **Centre panel (top centre):**
  - Top row: two gauges of equal, medium size — **Power** (left) and **Heart rate** (right).
    Style: "needle on zones" — a 240° arc split into coloured zone segments, a white needle at the
    current value, the number large in the middle, the zone name in the zone's colour under the
    number (e.g. "Z3 Tempo", "Z2").
  - Bottom row: **Speed · Slope · Cadence · Gear**, equal columns, icon above a large number with
    its unit. Gear in the accent colour with a strip of marks underneath (one mark per gear, the
    current one highlighted) when the number of gears is known.
- **Labels are icons**, not words (clock, flag, speedometer, bolt, heart, gradient triangle,
  rotation arrow, cog).
- **No avg/max values.** The second row that today alternates avg/max every 3 s is not shown.
- **Top right:** no numbers. The riders-nearby list stays there.
- **Bottom:** map bottom-left, elevation profile strip across the rest of the bottom. The
  separate gear box from early mockups is gone.

**Workouts — workout panel in the top right (`ride-workout.png`, `workout-page.png`):**

- The workout gets its own panel in the **top-right** corner, stacked: step name and time left in
  the step (with progress bar), the workout profile with the current position, the power and
  cadence targets, and the −/+ intensity buttons with the current percentage.
- The centre panel keeps the **medium** gauges during workouts; all panels stay in the top band,
  so the road below stays clear.
- On a route/video ride with a workout, upcoming elevation and the riders list move down the
  right column, under the workout panel.
- On the route-less workout page the top band is left panel · centre panel · workout panel, and
  the big workout graph fills the space below the top band.

**Routes page:** keep as is.

## Decided by Claude (check these)

1. **Zones come from services.** Extend `ActivityDashboardItem` (`services/src/activities/ride/types.ts`)
   with an optional `zone` for Power and Heartrate: current zone index, zone name, the zone
   boundaries in display units and the gauge range, so web-ui only draws. Reuse the Coggan 7-zone
   scale and `WORKOUT_ZONE_COLORS` from `services/src/workouts/base/graph/series.ts` (export
   `getZone` there instead of the web-ui duplicates). Power range 0–160 % FTP. FTP source: the
   activity's `user.ftp`; during a workout, the workout's live FTP.
2. **Heart-rate zones need a max HR that doesn't exist yet** — answered below ("Answered by the user" 1).
3. **Missing sensor:** the gauge stays, with no needle and `–` as the value. A plain number shows
   `–`. Items are not hidden (matches today's behaviour).
4. **Row content per ride type:** Slope is absent in free ride and route-less workouts (services
   already omit it); Gear is absent when there is no `gearStr` (no virtual shifting). The number
   row shows whatever items remain, in equal columns. Speed shows pace for rowing/running, as today.
5. **Reality factor:** when ≠ 100 %, show it as a small accent badge next to the slope value
   (today it is the `info` text).
6. **Sensor health (`dataState` amber/red):** tint the value's icon amber/red instead of today's
   LED dot.
7. **Workout rides:** the workout panel (user's choice above) replaces today's workout strip
   (`modules/workout/dashboard`) and absorbs the workout controls (`modules/workout/control`). The
   power gauge marks the current target range as a white bracket on the arc. The workout page's main
   view (the big workout graph) keeps its content and is restyled and moved to start below the top
   band.
8. **Shifting buttons** (`modules/shifting/control`, −5/−1/+1/+5) move to just below the centre
   panel. (Services already hide them during workouts.)
9. **Upcoming elevation** (`overlays/UpcomingElevation`) stays top right, above the riders list.
   The "6.2 % in 300 m" chip shown in the mockups is **not** part of this work.
10. **Previous-rides list** stacks below the nearby-riders list in the right column instead of
    jumping to the left (the left panel now owns the top left). `preferences.rideListDeltaX` keeps
    working.
11. **Side views (Street View)** keep their left/right slots, between the top band and the bottom
    band.
12. **Positions:** the ride pages hard-code vw/vh positions per page today
    (`pages/ride/*/…Page.jsx`). Put the new layout's regions (left panel, centre panel, right
    column, bottom band) in one shared place so the four ride pages don't drift apart. Keep vw/vh
    units (TV heritage, see CODEBASE_GUIDE "Styling").
13. **Fix on the way** (separate commits): the theme is read at module load in some components
    (e.g. `Ride/lists/NearbyRiders/component.jsx:8`) and gets the default theme instead of
    `newUI`; `WorkoutRideGraph.jsx` calls `getZone` with one argument so live workout bars are
    white; the avg speed label is `'max'` for rowing/running (`services/src/activities/ride/service.ts:567`).
    These are found bugs, each its own commit.
14. **Devices screen (`devices.png`):** tiles become dark gradient panels (not solid orange), small
    uppercase capability label, device name, large live value, status line with a coloured dot
    and the existing switch. "TO RIDE" / "OPTIONAL" group labels stay on the left. The interface
    buttons (ANT+/BLE/Serial/TCP) become small outlined pills. OK button in accent.
15. **Route details dialog (`route-details.png`):** title, flag/country/type line, map and video
    side by side, a facts row (distance, elevation, format, start), options (reality factor,
    terrain smoothing as the existing segmented control), buttons: Start (accent, primary), Start
    with workout, Download, and Cancel at the far right as a text button.
16. **Tokens:** extend `newUITheme` with accent, panel gradient, hairline, muted text, radius
    (≈0.5 vw for controls, ≈0.9 vw for panels/dialogs), zone colours, and focus ring. The
    controller focus ring stays orange-glow as today.

17. **Route details keeps every existing control**, restyled — segment selector, the stop/compare
    checkboxes, route type, smoothed elevation, convert/download progress, retry and video-directory
    rows, the elevation-only layout for routes without GPS, the elevation strip under the video
    still. **"Start at" stays an editable number** (the only way controller users can set it); the
    mockup's read-only "Start at" fact is wrong.
18. **Gear marks:** show the strip only when the number of gears is known. Expose the gear count
    from `devices` (`modes/antble-smarttrainer.ts` `gearRatios`) through the cycling mode to
    services, in its own small commits in the `devices` and `services` repos. In other modes Gear
    shows its text value as today (`+2`, `3 ↑`) without a strip.
19. **Right column order:** workout panel (when a workout runs), upcoming elevation, riders
    nearby, previous rides. **When the side columns are crowded**, shrink in this order: cap the riders list (≈6 rows) and
    previous-rides list (≈4 rows), then shorten the Street View slots, then shrink the map
    (to ≈16 vw × 22 vh). Upcoming elevation keeps its size.
20. **Heart-rate zones** (once a max HR exists): 5 zones as % of max HR — <60, 60–70, 70–80,
    80–90, ≥90 — named Z1…Z5; gauge range 50–100 % of max HR.

## Constraints

- Follow web-ui/docs/CODEBASE_GUIDE.md: atoms/molecules/modules, smart/view split with
  `<Name>`/`<Name>View` for new components, styled-components, relative imports, base inputs log
  their own interactions, Storybook stories for new views, colocated `*.unit.test.jsx`.
- Services: business logic and tests (`npm test` / `npx jest <file>`) for the zone data.
- The ride HUD updates every 500 ms; render it efficiently (the dashboard already uses `Dynamic`
  for high-frequency updates).
- Web-ui tests: `CI=1 npx vitest run --project unit`. `routeList/page.unit.test.jsx` "Free Ride…"
  fails on upstream main already.
- Verify in the real app: `cd desktop && npm run dev:local` (see workspace CLAUDE.md), ideally a
  route ride, a video ride, a free ride and a workout ride.

## Answered by the user after review

1. **Max heart rate:** add a "Max heart rate" field to User settings (services user settings +
   `modules/Settings/User`). Until it is set, the HR gauge shows a neutral grey arc with the needle
   and no zone colours or zone name. Zone model: decision 20.
2. **Upcoming-gradient chip** ("↗ 6.2 % in 300 m", seen in the mockups): **not part of this work**;
   keep the upcoming-elevation graph (decision 9). Possible follow-up.
3. **Workouts:** first answered "compact gauges with the strip below the centre panel"; after
   seeing it mocked, the user chose instead the **workout panel in the top right** with medium
   gauges (see "Decided by the user" → Workouts, and decision 7).
4. **Rollout:** the new ride screen **replaces** today's dashboard for everyone; no setting, no
   feature toggle. The old `RideDashboard`/`PanelItem` and per-page positions can go once unused.

## Left to the builder

- Icon set (inline SVG atoms in `atoms/Icons` or `@primer/octicons-react`, already a dependency).
- Exact gauge geometry (SVG), font sizes and spacing, as long as numbers stay large and there is
  no small secondary text.
- How the shared ride layout is expressed (a layout component, a constants module, …).
- Order of work, commit boundaries, and test strategy within the constraints above.
- Whether the dashboard's `RideDashboard`/`PanelItem` are rewritten or replaced by new components.
