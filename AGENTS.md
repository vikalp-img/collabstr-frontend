# AGENTS.md

Guidance for AI coding agents working in this repository.

## Project Overview

- App: Next.js frontend (`app` router)
- Package manager: npm (`package-lock.json` is present)
- Main entry page: `src/app/page.js`

## Setup and Commands

- Install dependencies: `npm install`
- Run dev server: `npm run dev`
- Run lint checks: `npm run lint`
- Build for production: `npm run build`
- Start production server: `npm run start`

## Tech Stack

- Next.js 16
- React 19
- ESLint 9 with `eslint-config-next`
- Tailwind CSS 4
- Formik + Yup for forms/validation

## Code Style and Conventions

- Prefer small, focused changes that match existing patterns.
- Reuse existing components/utilities before creating new abstractions.
- Keep UI code readable; avoid over-engineering for simple views.
- Follow existing naming conventions and file organization in `src/`.
- Do not add dependencies unless required for the task.

## Quality Bar

- Run `npm run lint` after meaningful code changes.
- Avoid introducing TypeScript-only patterns in `.js` files.
- Keep imports clean and remove unused code.
- Preserve current behavior unless the task explicitly asks for changes.

## Agent Workflow

- Read related files before editing.
- Explain assumptions when requirements are ambiguous.
- If a task is risky or broad, propose a short plan first.
- For multi-file edits, keep changes logically grouped and easy to review.

## Git and Safety Rules

- Never commit build artifacts or temporary files (for example `.next/`).
- Do not modify secrets, environment credentials, or deployment config unless explicitly requested.
- Do not perform destructive git operations (`reset --hard`, force-push) unless explicitly requested.

## When Unsure

- Ask concise clarifying questions instead of guessing.
- Prefer the simplest solution that satisfies the requirement.
