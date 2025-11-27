## Tech stack

This project is a modern Next.js + TypeScript frontend. The doc below explains the main choices, how they are wired, and quick commands for local development.

### Core

- Framework: Next.js — server and client rendering, routing, and optimizations.
- UI: React (used via Next.js App Router).
- Language: TypeScript for type safety and DX.

### Packages and tools (found in `package.json`)

- next — application framework and routing.
- react, react-dom — UI library and DOM renderer.
- typescript, @types/* — static typing and type definitions.
- tailwindcss, @tailwindcss/postcss — utility-first CSS framework and PostCSS plugin (configured via `postcss.config.mjs`).
- eslint, eslint-config-next — linting and Next.js ESLint config.

### Styling

- Tailwind CSS (v4) is included. Styles live in `app/globals.css` and are applied app-wide. Use utility classes for rapid UI construction; add component-level CSS modules or styled components if needed.

### Project structure (high level)

- `app/` — Next.js App Router: layout and pages. `app/page.tsx` is the home page.
- `app/_components/` — shared UI components.
- `app/_lib/` — small libraries, helpers, and data fetching utils.
- `public/` — static assets (images, icons).

### Development

- Start dev server: `npm run dev` (Next.js dev server with fast refresh).
- Build: `npm run build` (production build).
- Start production server: `npm run start` (run after building).
- Lint: `npm run lint`.

### Testing and CI

This repository does not include a test framework by default. Recommended additions:

- Jest + React Testing Library for component/unit tests.
- Playwright or Cypress for E2E tests.
- Add a GitHub Actions workflow to run lint, build, and tests on push.

Current setup:

- `npm test` – runs Jest + React Testing Library (see `tests/` for examples such as `Carousel`, `ProductCard`, and `CartContext`).

### Deployment

- Vercel is recommended (native Next.js support). Other options: Netlify, Render, or any Node host.

### Rationale & notes

- Next.js + TypeScript gives a solid balance of DX and production performance.
- Tailwind keeps CSS low-footprint and fast to iterate on.
- ESLint with `eslint-config-next` ensures Next.js best practices.

### Small checklist for contributors

1. Install dependencies: `npm install`.
2. Run dev server: `npm run dev`.
3. Add a component under `app/_components` and styles to `app/globals.css` or Tailwind.

If you'd like, I can also add a minimal GitHub Actions workflow, a basic test setup, or a short contributing guide. Tell me which and I'll add it.
