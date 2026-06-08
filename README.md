# AI Store Auditor — Demo

Standalone Vite + React + TS + Tailwind project. 60s pitch flow for an AI CRO agent that audits a Shopify store.

## Quick start (dev mode)

```bash
npm install
npm run dev
```

Open the printed `http://localhost:5173` URL.

## Preview production build

`dist/` is pre-built and included.

```bash
# Option 1: vite preview (requires npm install)
npm install
npm run preview

# Option 2: any static server
cd dist
python3 -m http.server 8000
# or: npx serve
```

Open `http://localhost:8000`.

## Rebuild

```bash
npm run build
```

Output goes to `dist/`. Base path is set to `./` so the bundle works from any subdirectory.

## Flow (60s total)

| T (s) | Screen | Action |
|-------|--------|--------|
| 0 | Landing | Click "Run audit" |
| 3 | Analysis | 4 agents reveal findings in parallel for ~14s |
| 18 | Report | Dashboard + 5 dimension bars + 3 prioritized issues |
| 25 | Fix #1 (ad-page mismatch) | Approve or reject |
| 35 | Fix #2 (trust signals) | Approve or reject |
| 45 | Fix #3 (catalog rebalance) | Approve or reject |
| 55 | Summary | Aggregate lift (excludes rejected) |

## Demo control

- **Reset**: button in bottom-right (and on summary screen) restarts from landing
- **Auto-advance**: not implemented; pitch presenter controls pacing by clicking
- **Order**: issues are ordered by predicted impact (ad-page first, then trust, then catalog) — most visceral "wow" up front

## Customization points

- `src/App.tsx` top section: `store`, `agents`, `issues` — change vertical / data / fix examples
- Colors in `tailwind.config.js`: `paper`, `ink`, `amber`, `coral`, `forest`
- Fonts in `styles.css` `@import` URL

## Pitch script anchors

When demoing live, narrate over these moments:
1. **Agent grid reveal**: "Four specialist agents — same way a CRO agency would split the work."
2. **Dimension bars filling**: "Each dimension scored against vertical benchmark — furniture has different anxiety map than skincare."
3. **Ad-page mismatch fix**: "This is the message-match problem — single biggest leak on paid traffic."
4. **Impact summary**: "Estimated $340k annual lift, on current traffic, without spending another dollar on acquisition."
