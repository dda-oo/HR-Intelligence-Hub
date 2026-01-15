# HR-Intelligence-Hub

Single-page HR Pulse dashboard for global labor signals. Built as a
showcase portfolio for RadarRoster to demonstrate live data integration,
actionable HR insights, and B2B-ready analytics.

## What’s Included

- Global unemployment trend (World Bank)
- Labor unrest monitor (GDELT news volume)
- Collective bargaining pulse (GDELT negotiation mentions)
- Inflation pressure (CPI YoY)
- Negotiation risk score, wage pressure, labor slack, economic momentum
- Trend delta chips, KPI sparklines, risk radar, risk distribution
- Executive summary + KPI cards on one page

## Quick Start

Open `index.html` in your browser. No build step required.

## Optional Configuration

Update `config.js` to set:

- `corsProxy`: Add a CORS proxy URL if browser fetches are blocked.
- `gdelt`: Adjust keywords, language, or country filters.
- `negotiations`: Keyword list for collective bargaining mentions.
- Negotiation intelligence cards use macro indicators (World Bank).
- `refreshIntervalMinutes`: Auto refresh interval (minutes).
- `defaultCountryCode`: Default country (ISO2) or `WLD`.

## Notes

If a live data source is unavailable, the dashboard falls back to sample data to
keep the UI functional for demos.