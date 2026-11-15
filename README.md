# SkiNC — North Carolina Snow Dashboard

**North Carolina skiing. Right now.** https://skincnow.com

## What this version contains

- Seven-day **daily snowfall forecasts** and 24h/72h/7d accumulation at five ski resorts plus eight NC peaks/towns.
- Storm-event totals and automatic winter-wonderland treatment when the highest modeled 72-hour snowfall is at least 3" (stronger at 6").
- Actual location map, with modeled snow totals; filter ski mountains and high peaks.
- Individual ski resort pages with day-by-day snow, temperatures, rain, wind, public operating-status reports, links to official reports and road conditions.
- Interactive, **real OpenStreetMap piste geometry** and ski lifts when community map data exists. No invented trail alignments; the old hand-drawn maps were not migrated into this repository.
- Historical snow explorer with **calendar year and Oct–Apr season** monthly/yearly charts, modeled vs observed station data clearly separated.
- NOAA GHCN-Daily measured snowfall at Beech Mountain (USC00310645) and Mount Mitchell (USC00315923), with missing and quality-flagged days excluded; monthly/period totals require complete daily measurements.
- Clear attribution, error states, mobile styling, accessibility and reduced-motion support.

## Deploy to Cloudflare Pages

This is a **static site** with **Cloudflare Pages Functions**; there is **no frontend compilation step**.

1. Connect `Teddyj000/SkiNC`, production branch `main`.
2. Framework preset: **None**. Build command: **leave blank**. Build output directory: **`.` (repository root)**. Root directory: `/`.
3. Make sure Pages Functions are enabled/supported on the Pages project and deployed from `/functions`. These endpoints are necessary for cached weather, history, NOAA observations and trail geometry. If a deploy is a static-only upload, `/api/...` will not work (forecast UI falls back to direct Open-Meteo, historical data does not).
4. Add custom domain `skincnow.com` in Cloudflare Pages only after the deployment preview works.
5. Verify `/`, `/snowfall/`, `/resorts/beech-mountain/`, `/api/forecast`, `/api/observations?station=beech`, `/api/history?place=beech`, `/api/trails?resort=beech`, `/api/resorts`.
6. Avoid publishing a branch with only README and `/snow-dashboard/index.html`: it **is not the full production website**.

**To preview static UI locally:** `python3 -m http.server 8080` and browse http://localhost:8080. Cloudflare Functions require a Pages runtime, e.g. `npx wrangler pages dev .` (Wrangler may need to be installed).

## Endpoints

| Endpoint | Provider | Cache | Meaning |
| --- | --- | --- | --- |
| `/api/forecast` | Open-Meteo Forecast API | 15 minutes shared | Forecast model, not observed snow |
| `/api/history?place=beech` | Open-Meteo Historical Weather API | 12 hours shared | Retrospective model/reanalysis, **not measurements** |
| `/api/observations?station=beech` | NOAA NCEI GHCN-Daily (.dly) | 12 hours shared | Observations at the specific station, **not a ski resort** |
| `/api/resorts` | NCSAA snow-reports page | 15 minutes shared | Freshness-checked operating status when parseable |
| `/api/listings` | SkiSoutheast snow-report page | 30 minutes shared | Unverified third-party season snowfall listing, separately labeled |
| `/api/trails?resort=beech` | OSM Overpass | 24 hours shared | Community-mapped piste and aerialway geometry, not trail status |

**Data-integrity rules**: Never conflate observed station snow, retrospective modeled snowfall, forecast accumulation, resort-reported natural snow or artificial snowmaking. Missing observation days do not count as zero. Reports older than 48h must not be treated as current. On a data-provider failure, show explicit unavailability, not placeholders represented as real numbers.

## Known limitations (visible to users)

- Official *season-to-date resort-reported natural snowfall* is not reliably machine-readable across all resorts. If a SkiSoutheast season listing is retrievable, it is shown as a **third-party aggregator listing**, not a verified resort or NOAA measurement. Otherwise the field says Not verified.
- OpenStreetMap coverage of the resorts is not guaranteed to be complete; use official trail maps to navigate.
- NC mountains have highly variable weather, especially with elevation. Summit-point model estimates are not actual trail observations.
- NOAA station data can have missing/quality-flagged values and its publication may lag.
- No browser access to Cloudflare account is included; a green GitHub commit alone does not prove `skincnow.com` is updated.

## Test

`npm test` (uses Node's built-in test runner; no dependencies).

## Licensing/attribution

Background winter photography by ShantellSmith, licensed **CC BY-SA 4.0**, via Wikimedia Commons. © OpenStreetMap contributors for map geometry/tiles. Forecast attribution to Open-Meteo; station records NOAA/NCEI; official association reports NCSAA. See the `/methodology/` page.
