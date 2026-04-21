# Architecture Audit – Phase 05 / CSS Layering

## Goal
Move the project to the planned CSS layering model without rewriting screens:

1. `src/app/styles/index.css`
   - reset
   - theme tokens
   - html/body/root
   - scrollbar
   - app shell
   - typography and layout utilities
2. `src/shared/styles/ui.css`
   - shared UI primitives and shared surface styles
3. module-local CSS
   - sales, products, reports, dashboard, users, auth, productions, logistics

## What changed
- `src/app/styles/index.css` was reduced to the global app layer.
- Shared UI styles were consolidated under `src/shared/styles/ui.css`.
- New module-local entry CSS files were added:
  - `src/modules/auth/auth.css`
  - `src/modules/dashboard/dashboard.css`
  - `src/modules/products/products.css`
  - `src/modules/reports/reports.css`
  - `src/modules/sales/sales.css`
  - `src/modules/users/users.css`
- Existing module-local CSS stayed in place where it already matched the target model:
  - `src/modules/productions/presentation/productions.css`
  - `src/modules/logistics-packaging-calculator/.../*.css`

## Import wiring
Module CSS files are now imported from their page entries:
- `LoginPage.jsx`
- `DashboardPage.jsx`
- `ProductsPage.jsx`
- `ReportsPage.jsx`
- `SalesPage.jsx`
- `NewSalePage.jsx`
- `UsersPage.jsx`

This keeps the global layer from carrying module-specific selectors.

## Shared UI additions / fixes
The shared UI layer now explicitly contains missing primitive/support styles for:
- `Badge`
- `IconButton`
- `Pressable`
- `Checkbox`
- `Modal`
- `Table`, `TableShell`, `TableScroll`
- `Field` helper/error/control slots
- `PageHeader` content slot
- loading button state

### Modal note
`Modal` CSS was aligned with runtime class names:
- `ui-modal__dialog--sm`
- `ui-modal__dialog--md`
- `ui-modal__dialog--lg`
- `ui-modal__dialog--xl`

This removes the earlier selector mismatch risk.

## Reports additions
`reports.css` also received the missing `status-summary-grid` / `status-summary-card` styling so the report summary surface is no longer dependent on the old global bundle.

## Verification
### Build
`npm run build` passed successfully.

### Known warnings
Build still shows the previously deferred logistics warning family around `:global(...)` selectors in logistics CSS. These were intentionally left untouched because the CSS cleanup plan puts that family at the end.

### Lint
`npm run lint` still reports existing non-CSS issues, mainly in:
- `src/app/layouts/AppShell.jsx`
- logistics packaging module
- productions module
- a small part of reports

These are not introduced by the CSS layering pass; they are pre-existing code-quality issues outside the CSS split.

## Outcome
The project is now structurally aligned with the intended CSS strategy:
- app globals in `app/styles/index.css`
- shared primitives in `shared/styles/ui.css`
- module-specific surfaces in module CSS files

The next step is real usage testing and then a focused correction pass for any visual regressions or missing edge-case selectors.
