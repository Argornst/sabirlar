# Architecture Audit – Phase 04 (Shared UI Finalization)

## Goal
Complete the shared UI coverage pass before the planned CSS extraction. This phase keeps the current modular architecture, avoids a rewrite, and standardizes active presentation surfaces on shared UI primitives.

## Result
Shared UI coverage is now effectively complete for active presentation code.

Verified outcome:
- No raw `button`, `input`, `select`, `textarea`, or `table` usage remains in `src/app` / `src/modules` presentation code.
- Remaining native controls are limited to shared UI internals only.
- A hidden `<input type="hidden">` inside `ProductAutocomplete` remains intentionally as an internal form bridge, not as a presentation primitive.

## What changed

### Shared UI finalized
Added / finalized shared UI surface under `src/shared/components/ui`:
- `Badge.jsx`
- `index.js` barrel exports
- safer `Modal.jsx`
- `Button.jsx` with `forwardRef`
- `IconButton.jsx` with `forwardRef`
- `Table.jsx` with both `TableScroll` and `TableShell`
- `StatusBadge.jsx` now composes `Badge`

### Modal handling
Modal promotion was handled conservatively because shared modal behavior can regress easily.

What was done:
- kept actual modal surfaces on shared `Modal`
- added body/html scroll locking while open
- added focus handoff to the dialog (or provided ref)
- restored focus on close
- kept Escape + backdrop close behavior configurable

What was intentionally not forced into shared `Modal`:
- logistics aggregate issues popover (`aggregate-bar`) stays a module-specific popover surface
- date picker portal/dialog stays inside the shared date picker primitive

This keeps behavior stable while still preserving the shared UI rule for true modal surfaces.

### Build-safety fixes discovered during the sweep
The shared UI normalization exposed a couple of integration issues that were fixed:
- `Button` now forwards refs, which is needed by logistics aggregate-bar trigger handling.
- `Table` now exports `TableScroll` in addition to `TableShell`, matching current module imports.

## Architectural state after this phase
The project is now aligned for the CSS plan:

1. `app/styles/index.css`
   - reset
   - theme tokens
   - html/body
   - scrollbar
   - app shell
   - global typography
   - layout utilities

2. `shared/styles/ui.css`
   - button
   - input
   - select
   - field
   - badge
   - modal
   - icon-button
   - table
   - card

3. module CSS
   - only domain/module-specific surfaces
   - examples: production calendar, dispatch board, production table variants, sales detail panel, logistics planners

## Notes
- CSS was intentionally not reorganized in this phase.
- Shared UI coverage is now in place first, which makes the CSS extraction pass much safer.
- Full build/lint verification could not be completed reliably in this environment, so this phase was validated with structural checks and targeted code inspection.
