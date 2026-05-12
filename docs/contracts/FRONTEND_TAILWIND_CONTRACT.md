# Frontend Tailwind Contract

## Status

Active from patch 31c-2.

## Purpose

Patch 31c-2 installs Tailwind through the Play CDN only. The purpose is to prepare the frontend for faster product UI iteration in patch 31c-3 without mixing Tailwind setup with page implementation.

## Scope of 31c-2

Allowed changes:

```text
frontend/index.html
docs/contracts/FRONTEND_TAILWIND_CONTRACT.md
docs/CONTRACT_INDEX.md
bootstrap/tests/test_31c_2_tailwind_cdn_only.sh
bootstrap/reports/31c_2_tailwind_cdn_only_report.md
```

Forbidden changes in 31c-2:

```text
frontend/src/app.jsx
frontend/src/app.css
frontend/src/pages/
frontend/public/icon/
backend/
database/
api/
auth/
```

## Tailwind Mode

Tailwind is installed through:

```html
<script src="https://cdn.tailwindcss.com"></script>
```

The configuration must use class-based dark mode:

```js
darkMode: 'class'
```

## Temporary Decision

Tailwind Play CDN is allowed only for Milestone 1 visual prototyping. Before production release, the project must choose one of these paths:

```text
1. migrate Tailwind to Vite/npm
2. remove Tailwind CDN and return to modular CSS
3. keep CDN only in a prototype branch, not production
```

## 31c-3 Direction

Patch 31c-3 may implement the product landing page using Tailwind utilities after this setup is merged and verified.

Expected 31c-3 scope:

```text
frontend/src/app.jsx
frontend/src/pages/LoginPage.jsx
frontend/src/pages/DashboardPage.jsx
frontend/public/icon/
```

## Non-Scope

Tailwind setup must not implement product pages in 31c-2.

## 31c-3 Implementation Rule

Patch 31c-3 may implement the login landing page with Tailwind utilities after Tailwind CDN is available.

Allowed in 31c-3:

```text
frontend/src/app.jsx
frontend/src/app.css
frontend/src/pages/LoginPage.jsx
frontend/public/icon/*.svg
```

Rules:

```text
- app.jsx remains shell/state orchestration.
- LoginPage.jsx owns login page markup and page-local form state.
- Page JSX must not define inline SVG icon components.
- Icons must be referenced from frontend/public/icon.
- app.css remains global reset only.
```
