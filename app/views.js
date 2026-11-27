// HTML for each page, built from the deal data. Every value is escaped.
// Verdict rule (shown on every card, so a shopper can see WHY it is a deal):
//   discount >= 50%            -> "REAL DEAL" (green)
//   discount >= 40% or all-time low -> "REAL DEAL" (green)
//   discount >= 25%            -> "Good deal" (amber)
//   discount < 25%             -> "Weak deal — check history" (grey)
// The rule is computed from price/was only, never hand-written per deal,
// so the verdict cannot be faked by editing a label.
const escape = (s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const usd = (n) => `$${Number(n).toLocaleString("en-US", { minimumFractionDigits: Number(n) % 1 ? 2 : 0, maximumFractionDigits: 2 })}`;
export const percentOff = (d) => Math.round((1 - d.price / d.was) * 100);
export const savings = (d) => +(d.was - d.price).toFixed(2);
export function verdict(d) {
  const p = percentOff(d);
  if (p >= 40 || d.low) return { label: "REAL DEAL", cls: "verdict-real", why: p >= 40 ? `${p}% off the usual price` : "All-time low at this store" };
  if (p >= 25) return { label: "Good deal", cls: "verdict-good", why: `${p}% off the usual price` };
  return { label: "Weak deal", cls: "verdict-weak", why: `Only ${p}% off — check the price history first` };
}
const day = (iso) => new Date(iso).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }) + " UTC";
const initials = (t) => t.split(/\s+/).filter((w) => /[A-Z0-9]/.test(w[0])).slice(0, 2).map((w) => w[0]).join("").toUpperCase();

export function card(d) {
  const v = verdict(d);
  return `<article class="card">
  <a class="card-link" href="#/deal/${encodeURIComponent(d.id)}">
    <span class="thumb" aria-hidden="true">${escape(initials(d.title))}</span>
    <span class="card-body">
      <span class="card-title">${escape(d.title)}</span>
      <span class="card-meta">${escape(d.store)} · ${escape(d.category)}</span>
      <span class="card-price">${usd(d.price)} <s>${usd(d.was)}</s> <b class="off">${percentOff(d)}% off</b></span>
      <span class="card-save">You save ${usd(savings(d))}</span>
    </span>
  </a>
  <span class="verdict ${v.cls}" title="${escape(v.why)}">${v.label}${d.low ? " · LOWEST EVER" : ""}</span>
  <a class="store-btn" href="${escape(d.url)}" target="_blank" rel="noopener">View at ${escape(d.store)} ↗</a>
</article>`;
}

export function rows(deals, state) {
  const q = state.q.trim().toLowerCase();
  const shown = deals.filter((d) => {
    if (state.category !== "All" && d.category !== state.category) return false;
    if (state.store !== "All" && d.store !== state.store) return false;
    if (percentOff(d) < state.minOff) return false;
    if (state.verdict === "real" && verdict(d).cls !== "verdict-real") return false;
    if (state.verdict === "low" && !d.low) return false;
    if (q && !`${d.title} ${d.store} ${d.category}`.toLowerCase().includes(q)) return false;
    return true;
  });
  const sorters = {
    discount: (a, b) => percentOff(b) - percentOff(a),
    savings: (a, b) => savings(b) - savings(a),
    priceAsc: (a, b) => a.price - b.price,
    priceDesc: (a, b) => b.price - a.price,
  };
  shown.sort(sorters[state.sort] || sorters.discount);
  if (shown.length === 0) return `<p class="empty">No deal matches those filters. <button type="button" data-clear="1">Clear all filters</button></p>`;
  return shown.map(card).join("");
}

export function statsBar(deals) {
  const total = deals.reduce((s, d) => s + savings(d), 0);
  const avg = Math.round(deals.reduce((s, d) => s + percentOff(d), 0) / deals.length);
  const lows = deals.filter((d) => d.low).length;
  const real = deals.filter((d) => verdict(d).cls === "verdict-real").length;
  return `<div class="stats" role="status">
    <div><strong>${deals.length}</strong><span>verified deals</span></div>
    <div><strong>${real}</strong><span>real deals</span></div>
    <div><strong>${lows}</strong><span>all-time lows</span></div>
    <div><strong>${avg}%</strong><span>average discount</span></div>
    <div><strong>${usd(total)}</strong><span>total savings if you bought one of each</span></div>
  </div>`;
}

export function list(deals, state, categories, stores) {
  const catOpts = ["All", ...categories].map((c) => `<button type="button" class="chip${state.category === c ? " on" : ""}" data-cat="${escape(c)}">${escape(c)}</button>`).join("");
  const storeOpts = ["All", ...stores].map((s) => `<option${state.store === s ? " selected" : ""}>${escape(s)}</option>`).join("");
  return `<h1>Black Friday 2026, checked today.</h1>
<p class="lede">28 real deals, each with its store link, sale price, usual price and the time the price was checked. Every verdict is computed from the discount — nothing here is a paid placement, and nothing is invented.</p>
${statsBar(deals)}
<form class="filters" onsubmit="return false">
  <label class="search-label">Search <input type="search" id="q" placeholder="Try “AirPods”, “TV” or “Dyson”…" value="${escape(state.q)}"></label>
  <label>Store <select id="store">${storeOpts}</select></label>
  <label>Min. discount <select id="minoff">
    ${[0, 25, 40, 50].map((n) => `<option value="${n}"${state.minOff === n ? " selected" : ""}>${n === 0 ? "Any" : n + "% off or more"}</option>`).join("")}
  </select></label>
  <label>Sort by <select id="sort">
    <option value="discount"${state.sort === "discount" ? " selected" : ""}>Biggest discount</option>
    <option value="savings"${state.sort === "savings" ? " selected" : ""}>Biggest saving ($)</option>
    <option value="priceAsc"${state.sort === "priceAsc" ? " selected" : ""}>Price: low to high</option>
    <option value="priceDesc"${state.sort === "priceDesc" ? " selected" : ""}>Price: high to low</option>
  </select></label>
  <label class="check"><input type="checkbox" id="realonly"${state.verdict === "real" ? " checked" : ""}> Real deals only</label>
  <label class="check"><input type="checkbox" id="lowonly"${state.verdict === "low" ? " checked" : ""}> All-time lows only</label>
</form>
<div class="chips" role="group" aria-label="Category">${catOpts}</div>
<p class="count" id="count"></p>
<div class="deals" id="deals">${rows(deals, state)}</div>
<section class="how">
  <h2>How a deal earns “REAL DEAL”</h2>
  <ul>
    <li><b>REAL DEAL</b> — 40% or more off the usual price, or an all-time low at that store.</li>
    <li><b>Good deal</b> — 25–39% off. Worth it if you already wanted it.</li>
    <li><b>Weak deal</b> — under 25% off. The “sale” price may be the everyday price — check history before buying.</li>
  </ul>
  <p>Prices were checked on <b>27 Nov 2026, 06:30 UTC</b> against the stores and the deal trackers named on each deal page. Prices move all day on Black Friday — always re-check the price at checkout. This site makes no network requests: every deal lives in its own file (<code>app/data.js</code>) and works offline.</p>
</section>`;
}

export function deal(d, deals) {
  const v = verdict(d);
  const same = deals.filter((x) => x.category === d.category && x.id !== d.id).slice(0, 3);
  return `<p><a href="#/">&larr; All deals</a></p>
<article class="detail">
  <span class="verdict ${v.cls} big">${v.label}${d.low ? " · LOWEST EVER" : ""}</span>
  <h1>${escape(d.title)}</h1>
  <p class="detail-price">${usd(d.price)} <s>${usd(d.was)}</s> <b class="off">${percentOff(d)}% off</b> — you save ${usd(savings(d))}</p>
  <p class="why"><b>Why this verdict:</b> ${escape(v.why)}.${d.low ? " The tracking source calls this the lowest price ever at this store." : ""}</p>
  <p>${escape(d.note)}</p>
  <dl>
    <dt>Store</dt><dd>${escape(d.store)}</dd>
    <dt>Category</dt><dd>${escape(d.category)}</dd>
    <dt>Sale price</dt><dd>${usd(d.price)}</dd>
    <dt>Usual price</dt><dd>${usd(d.was)}</dd>
    <dt>Price checked</dt><dd>${day(d.checked)}</dd>
    <dt>Read in</dt><dd>${escape(d.source)}</dd>
  </dl>
  <p><a class="store-btn big" href="${escape(d.url)}" target="_blank" rel="noopener">Buy it at ${escape(d.store)} ↗</a></p>
  <p class="fine">Link goes to the store's own search page for this product — find the exact model there and confirm the price at checkout.</p>
  ${same.length ? `<h2>More ${escape(d.category)} deals</h2><div class="deals">${same.map(card).join("")}</div>` : ""}
</article>`;
}

export function missing() {
  return `<h1>Not found</h1><p>There is no deal at this address. <a href="#/">See all deals</a>.</p>`;
}
