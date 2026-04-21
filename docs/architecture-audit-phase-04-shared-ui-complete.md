# Architecture Audit – Phase 04 (Shared UI Coverage Complete)

## Goal
Complete shared UI coverage across active presentation surfaces without a rewrite, and harden shared modal behavior before the CSS extraction pass.

## Status
The active app/module presentation layer now routes interactive UI surfaces through shared primitives.

Verified native element audit outside `src/shared/components/ui`:
- `<button>`: 0
- `<input>`: 0
- `<select>`: 0
- `<textarea>`: 0
- `<table>`: 0

This means buttons, inputs, selects, textareas, and tables in module/app presentation code now flow through shared UI primitives instead of direct native usage.

## Shared UI coverage
Covered active modules:
- `auth`
- `dashboard`
- `products`
- `users`
- `sales`
- `reports`
- `productions`
- `logistics-packaging-calculator`

Shared primitives actively used across modules:
- `Button`
- `Input`
- `Select`
- `Textarea`
- `Field`
- `Badge` / `StatusBadge`
- `IconButton`
- `Checkbox`
- `Table`
- `Card`
- `PageHeader`
- `SectionCard`
- `StatCard`
- `FilterBar`
- `DatePicker`
- `EmptyState`
- `ErrorState`
- `LoadingState`
- `AnimatedPage`

## Modal note
Modal was the risky area. Instead of forcing every custom overlay into shared modal immediately, this phase focused on making the shared modal safer for current and future use.

### Shared modal hardening
Updated `src/shared/components/ui/Modal.jsx` to include:
- body scroll lock with nested modal safety
- focus trap inside the dialog
- focus restore to the previously focused element on close
- safer backdrop close handling using pointer-down + click pairing
- explicit accessibility attributes for label/description wiring

### Intentionally left module-specific
Not every overlay-like surface was force-migrated:
- logistics aggregate popover remains module-specific (`role="dialog"`, but it is a contextual popover rather than a full modal)
- module-specific modal styling remains owned by module/shared print CSS until the CSS phase

This keeps behavior stable while still establishing shared modal as the real base dialog primitive.

## Why this is now a good base for the CSS plan
The project is ready for the CSS layering you described:

1. `app/styles/index.css`
   - reset
   - theme tokens
   - html/body
   - scrollbar
   - app shell
   - global typography
   - layout utilities

2. `shared/styles/ui.css`
   - shared primitive styles only
   - button / input / select / field / badge / modal / icon-button / table / card

3. module CSS
   - only module-specific surfaces
   - examples: production calendar, dispatch board, sales detail panel, report-specific variations, logistics planners

## Result
Shared UI coverage is now effectively complete at the presentation level.

What remains is no longer a component coverage problem; it is primarily a CSS extraction and ownership problem.
