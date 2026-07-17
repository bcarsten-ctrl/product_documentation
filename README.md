# PeakActivity Catalog Review

A data-driven review console for the **Automated Product Documentation Agent (Spec 1)**
workflow on SteelEngine (prod, Peak Activity Starter workspace).

## What it does
The page reads live workspace data and shows three sections:
1. **Pending products** — every `vendor_intake` row with `status = pending`. Each has a
   **Review** button that runs the workflow for *that specific product*.
2. **Flagged to exceptions** — `catalog_exceptions` rows (products the confidence/claims
   gate rejected), with the reason.
3. **Published catalog** — `catalog_published` rows (approved products), rendered as cards
   with the generated title, description, and bullets.

Clicking **Review** on a product:
- triggers the workflow (async) with `target_sku` = that product's SKU,
- waits for it to pause at the merchandiser gate, then shows the generated draft,
- **Approve & publish** / **Reject** resumes the workflow; the lists refresh automatically.
- If the product fails the gate, it appears under **Flagged** instead of pausing.

## Files
- `index.html` — the single-page app (lists + review modal).
- `api/proxy.js` — serverless proxy; injects the SteelEngine API key server-side and
  forwards query params (needed for the table reads).
- `vercel.json` — rewrite so `/api/proxy/<path>` reaches the proxy.

## Deploy (Vercel)
1. Push to GitHub, import into Vercel (Framework preset **Other**, no build step).
2. Env vars:
   - `STEELENGINE_API_KEY` — a SteelEngine **workspace/personal API key** that can run the
     deployed workflow AND read workspace tables. (The MCP "copilot" key does NOT work.)
   - `STEELENGINE_BASE_URL` — `https://steelengine.com` (optional; default).

## Workflow dependency
This app requires the workflow's `Start` block to accept a `target_sku` input, and
`PickProduct` to honor it (falling back to first-pending when absent). That change is
deployed. Without it, every **Review** button would process the first pending product
regardless of which one you clicked.

## Config (in `index.html`)
- `WF`       = `44da1598-4d4b-482d-97f8-682b96f36493`
- `WS`       = `df24e40c-57f1-456d-9026-b6a3cedc44bd`
- `T_INTAKE` = `tbl_516ec71724dc4709b1a9ba987b268f92` (vendor_intake)
- `T_PUB`    = `tbl_1d47b3b1053a406cb606e2af0d03d9d9` (catalog_published)
- `T_DRAFT`  = `tbl_c5aad6aab5ed436b871c22988bbc7f9f` (catalog_drafts)
- `T_EXC`    = `tbl_f80c040e476c4a0ca73db993401fe64b` (catalog_exceptions)
