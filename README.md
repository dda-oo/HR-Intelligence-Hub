# HR-Intelligence-Hub

Open-source, single-page HR Intelligence Hub dashboard for global labor signals. Built as
a showcase portfolio for RadarRoster to demonstrate live data integration,
actionable HR insights, and B2B-ready analytics.

**Author:** Daryoosh Dehestani (GitHub: `dda-oo`)  
**Business:** RadarRoster — https://radarroster.com

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://dda-oo.github.io/HR-Intelligence-Hub/)
[![License](https://img.shields.io/badge/license-CC%20BY%204.0-blue)](LICENSE)

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

## Live Demo

https://dda-oo.github.io/HR-Intelligence-Hub/

## Open Source Spotlight

This project is open source and maintained on GitHub. If you want to improve
the signals, add new metrics, or share enhancements, you are invited to
contribute and help enrich the dashboard:

- GitHub repository: https://github.com/dda-oo/HR-Intelligence-Hub
- Contribution guide: `CONTRIBUTING.md`

## Privacy, Analytics & Consent

This dashboard uses privacy-friendly consent gating for analytics. Analytics
tools only load after a visitor opts in. For EU/EEA
visitors, consent is required before tracking is enabled. Visitors can manage
or withdraw consent via the "Manage privacy" link in the footer.

Reference policy (RadarRoster privacy statement):
[RadarRoster privacy policy](https://radarroster.com/pages/datenschutz.html)

## Policies & Statements

- Privacy notice: `PRIVACY.md`
- Accessibility: `ACCESSIBILITY.md`
- GDPR summary: `GDPR.md`

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

## Responsible AI & Ethics

This project uses public, aggregated data only. It avoids personal or sensitive
information and is designed for decision support, not automated decision-making.

## Data Freshness

| Source | Update cadence | Notes |
| --- | --- | --- |
| World Bank | Annual | Unemployment, inflation, GDP |
| GDELT | Near real-time | News volume signals |
| Rest Countries | Ad hoc | Country metadata |

## Use Cases

- Public sector negotiation readiness and strike prevention
- Enterprise labor risk monitoring and wage planning
- Executive dashboards for cross‑functional operational decisions

## Attribution

If you use this project publicly, please credit both:

- Daryoosh Dehestani (`dda-oo`)
- RadarRoster (https://radarroster.com)

Suggested credit line:

> “Based on the HR Intelligence Hub by Daryoosh Dehestani (dda-oo) and RadarRoster.”

## License

This project is licensed under **CC BY 4.0**. See `LICENSE` and `NOTICE.md`.

## Contributing

PRs are welcome. If you extend the dashboard, please keep the attribution and
add your changes clearly in the README or release notes.

## Roadmap Ideas

- Add country vs world comparison chips for each KPI
- Add regional filters (EU, DACH, LATAM, APAC)
- Add data freshness badges per source
- Add email briefing export (mailto)