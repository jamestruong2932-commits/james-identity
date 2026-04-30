# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Deployment

This is a static site deployed to Vercel. The output directory is `portal/` (set in `vercel.json`).

- **Preview locally**: Open any `portal/*.html` file directly in a browser — no build step needed.
- **Deploy**: Push to git; Vercel picks up changes automatically from the `portal/` directory.
- **API**: One serverless function at `api/chat.js` — runs on Vercel Functions (Node.js, `maxDuration: 15s`).
- **Environment variable required**: `ANTHROPIC_API_KEY` must be set in Vercel project settings.

## Architecture

### Site structure

Six HTML pages in `portal/`, each self-contained (no shared JS modules, no templating engine):

| File | Purpose |
|---|---|
| `index.html` | Landing page with hero, OS Audit CTA, and scroll animations |
| `diagnostic.html` | Multi-step quiz → archetype detection → embedded chat |
| `insight.html` | Editorial articles (6 foundational + archive section) |
| `about.html` | About / ecosystem overview |
| `qros.html` | Sales page for Quantum Rebirth OS product |
| `academy.html` | Academy / transformation programme page |

### CSS / design system

- `portal/theme.css` — single source of truth for design tokens (CSS variables), resets, typography, navbar, shared components (buttons, cards, sections). Import this on every page.
- Page-specific styles live in `<style>` blocks inside each HTML file.
- Tailwind CSS is loaded via CDN (`cdn.tailwindcss.com`) with a shared config block pasted into every page — colors: `cream / brown-deep / gold-sand / charcoal / warm-stone`; fonts: `serif` (Playfair Display) / `sans` (Inter).
- Design language: "Luxury Zen" — cream background, warm brown headings, gold-sand accents, no borders unless gold-tinted, generous whitespace.

### API — `api/chat.js`

A single Vercel serverless function that powers the diagnostic chat feature:

- Accepts `POST /api/chat` with `{ messages, group (1–5), turnCount }`.
- Selects one of 5 system prompts based on `group` — each maps to an archetype ("Cỗ Máy Không Tắt Được", "Người Mang Bóng Tối", etc.).
- All prompts include a shared 12-turn conversation arc (`ARC` const): turns 1–6 = deep exploration, 7–9 = synthesis, 10–12 = close + CTA.
- Returns `{ reply, showCta: turn >= 10 }`. The frontend shows a CTA button when `showCta` is true.
- Model: `claude-sonnet-4-6`, `max_tokens: 400`.

### Diagnostic quiz flow (`diagnostic.html`)

1. Welcome screen → multi-question quiz → results screen (detects one of 5 archetypes).
2. Results screen opens the chat panel, passing the detected `group` to the API.
3. Chat tracks `turnCount` client-side and sends it with each message.
4. After turn 10, a CTA button appears linking to `qros.html`.

## Content & brand context

The authoritative brand document is `core/identity.md` — read it before writing any copy or UI text. Key points:

- Language: Vietnamese primary (entire site); English used for section labels / product names.
- Voice: Short sentences, no exclamation marks, no "tuyệt vời / phi thường", body-language metaphors for emotions (not abstract concepts), every claim grounded in science or case study.
- Target audience: Vietnamese 22–35, two segments — "Early-Seeker" (first-time self-help) and "Tried-Many-Failed" (cynical repeat buyer).
- Product universe: James Identity system → Quantum Rebirth OS (21-day programme) → Academy.

The `james-2.0/` and `core/` directories hold strategy / copywriting source documents (Vietnamese markdown). They are reference material, not deployed files.

`portal/insight-articles.md` contains the full text of all insight articles used in `insight.html`.

## External libraries (CDN, no local install)

- Tailwind CSS (CDN)
- GSAP 3.12.5 + ScrollTrigger (CDN) — used for scroll animations on index, about, qros, academy
- Lenis 1.1.14 (CDN) — smooth scroll, used on index only
- Google Fonts: Playfair Display, Cormorant Garamond, EB Garamond, Inter, Montserrat
