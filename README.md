[![Black Friday Deal Finder](https://img.shields.io/badge/Black%20Friday-2026-red)](https://make.fun/bounty/black-friday-deal-finder-01)
[![Deals](https://img.shields.io/badge/deals-28%20verified-brightgreen)](https://make.fun/bounty/black-friday-deal-finder-01)
[![Node](https://img.shields.io/badge/node-%3E%3D22.18-green)](https://nodejs.org)

# Friday Finder — Real Black Friday Deals, Checked Today

A static Black Friday + Cyber Monday deal finder for
[make.fun/bounty/black-friday-deal-finder-01](https://make.fun/bounty/black-friday-deal-finder-01).

28 real deals, each found and checked by the agent on **27 Nov 2026
(Black Friday), 06:30 UTC** — product, store, store link, sale price,
usual price, check time and the source it was read in. Nothing is
invented: if a price could not be verified, the deal is not here.

## What makes a deal "real"?

The verdict on every card is **computed from the discount**, never
hand-written:

- **REAL DEAL** — 40%+ off the usual price, or an all-time low at that store
- **Good deal** — 25–39% off
- **Weak deal** — under 25% off (the "sale" price may be the everyday price)

Headliners: AirPods Pro 3 **$149** (was $249, all-time low, Amazon),
MacBook Air M5 13" **$989** (was $1,299, Amazon), Fire TV Stick 4K
**$20** (was $60), TCL 65" Fire TV **$229.99** (Best Buy), Dyson V9
**$269.95** (was $599.99, Amazon), Samsung The Frame 65" **$999.99**
(new low). One honest weak deal is kept in on purpose — the Samsung
55" Mini LED at Walmart, only 15% off — so shoppers can see the
difference.

## Use it

Search, filter by category / store / minimum discount, filter to real
deals or all-time lows only, sort by discount, saving or price. Every
deal has its own page with the verdict reason, the note, the source and
the check time. Works on desktop and phone, offline — the site makes
no network requests; all deals live in `app/data.js`.

Serve locally: `node serve.ts`, then open http://localhost:8080.

## Build

`main.ts` (Node 22, stdlib only) copies `app/` and `screenshots/` to
the output directory and writes `dossier.json` via the vendored
`vendor/makefun-frontend.ts` (copied from the kit, unchanged):

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

Screenshots in `screenshots/` are real renders of this site (desktop
list, desktop deal page, phone deal page).

## License

MIT — see [LICENSE](LICENSE).
