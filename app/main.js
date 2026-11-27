// Deal Finder: hash routes #/ (list + live filters) and #/deal/<id> (one deal).
// All state lives in the URL hash + the form; no network, no storage.
// window.__shotReady is false while a page renders and true once on screen.
import { deals, CHECKED_AT } from "./data.js";
import { deal, list, missing, rows } from "./views.js";

const app = document.getElementById("app");
const categories = [...new Set(deals.map((d) => d.category))].sort();
const stores = [...new Set(deals.map((d) => d.store))].sort();
const state = { q: "", category: "All", store: "All", minOff: 0, sort: "discount", verdict: "all" };

function updateCount() {
  const n = app.querySelectorAll(".card").length;
  const el = document.getElementById("count");
  if (el) el.textContent = n === 1 ? "1 deal matches." : `${n} deals match. Prices checked ${new Date(CHECKED_AT).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" })} UTC.`;
}

function rerenderRows() {
  const box = document.getElementById("deals");
  if (!box) return;
  box.innerHTML = rows(deals, state);
  updateCount();
}

function bindList() {
  const q = document.getElementById("q");
  const store = document.getElementById("store");
  const minoff = document.getElementById("minoff");
  const sort = document.getElementById("sort");
  const realonly = document.getElementById("realonly");
  const lowonly = document.getElementById("lowonly");
  if (q) q.addEventListener("input", () => { state.q = q.value; rerenderRows(); });
  if (store) store.addEventListener("change", () => { state.store = store.value; rerenderRows(); });
  if (minoff) minoff.addEventListener("change", () => { state.minOff = Number(minoff.value); rerenderRows(); });
  if (sort) sort.addEventListener("change", () => { state.sort = sort.value; rerenderRows(); });
  if (realonly) realonly.addEventListener("change", () => { state.verdict = realonly.checked ? "real" : "all"; if (lowonly) lowonly.checked = false; rerenderRows(); });
  if (lowonly) lowonly.addEventListener("change", () => { state.verdict = lowonly.checked ? "low" : "all"; if (realonly) realonly.checked = false; rerenderRows(); });
  app.querySelectorAll("[data-cat]").forEach((b) => b.addEventListener("click", () => {
    state.category = b.dataset.cat;
    app.querySelectorAll("[data-cat]").forEach((x) => x.classList.toggle("on", x === b));
    rerenderRows();
  }));
  app.querySelectorAll("[data-clear]").forEach((b) => b.addEventListener("click", () => render()));
  updateCount();
}

function render() {
  window.__shotReady = false;
  const match = location.hash.match(/^#\/deal\/([^/?]+)/);
  if (match) {
    const found = deals.find((d) => d.id === decodeURIComponent(match[1]));
    document.title = `${found ? found.title : "Not found"} | Friday Finder`;
    app.innerHTML = found ? deal(found, deals) : missing();
  } else {
    document.title = "Friday Finder — Real Black Friday Deals, Checked Today";
    app.innerHTML = list(deals, state, categories, stores);
    bindList();
  }
  window.scrollTo(0, 0);
  window.__shotReady = true;
}

window.addEventListener("hashchange", render);
render();
