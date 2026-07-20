# PeakActivity Catalog Review

A data-driven review console for the two-workflow product documentation pipeline on
SteelEngine (prod, Peak Activity Starter workspace).

## Architecture (two workflows + this front-end)
- **Catalog Doc Generator** (`e814b0bc-10a3-4eff-9ac2-18d710a2b1a2`) — generates catalog
  copy for a product and writes a draft to `catalog_drafts` (`status = pending_review`,
  with a `draft_id`), or routes it to `catalog_exceptions` if it fails the confidence/claims
  gate. Marks the `vendor_intake` row `processed`. Accepts optional `target_sku` (on-demand
  single product); with no input it processes the first pending product.
- **Catalog Review Action** (`96948586-e360-4f81-b5d8-f0b4733934a6`) — instant, no AI.
  Given `{draft_id, decision, edited_title?, notes?}`: approve → write `catalog_published`,
  mark draft `approved`; reject → write `catalog_exceptions`, mark draft `rejected`.

## The front-end
Four live sections (read directly from the tables via the proxy):
1. **Awaiting review** — `catalog_drafts` (`pending_review`). Each shows the generated draft
   with **Approve** / **Reject** (+ optional edited title / notes) → calls the Review Action
   → **instant**, then the lists refresh.
2. **Awaiting generation** — `vendor_intake` (`pending`). Each has **Generate now** → calls
   the Generator with that `target_sku` (~1 min).
3. **Flagged to exceptions** — `catalog_exceptions`.
4. **Published catalog** — `catalog_published`.

## Files
- `index.html` — the console. `api/proxy.js` — key-injecting proxy. `vercel.json` — rewrite.

## Deploy (Vercel)
Env vars: `STEELENGINE_API_KEY` (workspace/personal key — runs the workflows AND reads
tables; the MCP copilot key does NOT work), `STEELENGINE_BASE_URL` = `https://steelengine.com`.

## Nightly batch (not yet automated)
The Generator supports batch (first-pending) and on-demand (`target_sku`). A nightly
"generate all pending at ~3 AM" run still needs to be wired — either an in-workflow loop in
the Generator, or a small scheduled orchestrator workflow that calls the Generator per
pending SKU. On-demand generation ("Generate now") works today.
