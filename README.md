# PeakActivity Catalog Review

A lightweight review front-end for the **Automated Product Documentation Agent (Spec 1)**
workflow on SteelEngine (prod, Peak Activity Starter workspace).

## What it does
1. **Review next product** triggers the workflow (async) via a serverless proxy.
2. The workflow picks the next pending vendor product, extracts attributes, generates
   catalog copy, and runs the confidence/claims gate.
3. If it passes, the workflow pauses and this app shows the **draft** (title, description,
   bullets, category, confidence, any missing fields) with **Approve** / **Reject**.
4. The decision is POSTed to the workflow's resume endpoint → the app shows the outcome
   (published / needs-revision / flagged-to-exceptions).

## Files
- `index.html` — the review UI (single page).
- `api/proxy.js` — serverless proxy; injects the SteelEngine API key server-side.
- `vercel.json` — rewrite so `/api/proxy/<path>` reaches the proxy.

## Deploy (Vercel)
1. Push this repo to GitHub.
2. Import the repo into Vercel (Framework preset: **Other**; no build step needed).
3. Add environment variables in the Vercel project:
   - `STEELENGINE_API_KEY` — a SteelEngine **workspace/personal API key** for the
     Peak Activity Starter workspace. It must be able to (a) run the deployed workflow
     and (b) read workspace tables. **The MCP "copilot" key does NOT work for this.**
   - `STEELENGINE_BASE_URL` — `https://steelengine.com` (optional; this is the default).
4. Deploy. Open the site and click **Review next product**.

## Config (in `index.html`)
- `WF_ID`  = `44da1598-4d4b-482d-97f8-682b96f36493`
- `WS`     = `df24e40c-57f1-456d-9026-b6a3cedc44bd`
- `DRAFTS` = `tbl_c5aad6aab5ed436b871c22988bbc7f9f` (catalog_drafts)
- `EXC`    = `tbl_f80c040e476c4a0ca73db993401fe64b` (catalog_exceptions)

## Notes / to verify on first deploy
- The trigger path uses `/api/workflows/<id>/execute` + async job polling + resume
  (the pattern proven on the mattress demo). If prod uses `/run` instead, adjust the
  paths in `index.html` (`processNext`, `poll`).
- The draft is read from `catalog_drafts` (newest `pending_review` row). This is a
  single-reviewer-at-a-time heuristic; fine for the demo.
