(function () {
  "use strict";

  // ---- Sample data (October 2026) ----
  const accounts = [
    { group: "Cash", name: "Everyday Checking", inst: "Harbor Credit Union", mask: "4821", balance: 6482.17, color: "#1f6b4f", abbr: "HC" },
    { group: "Cash", name: "High-Yield Savings", inst: "Northpoint Bank", mask: "0937", balance: 18250.00, color: "#2f8f8a", abbr: "NB", note: "4.10% APY" },
    { group: "Credit", name: "Rewards Visa", inst: "Northpoint Bank", mask: "7713", balance: -1384.62, limit: 8000, color: "#c07a2c", abbr: "NB" },
    { group: "Investments", name: "Brokerage", inst: "Fairway Invest", mask: "2290", balance: 42917.55, color: "#4b5fa8", abbr: "FI", note: "+2.4% this month" },
    { group: "Investments", name: "Roth IRA", inst: "Fairway Invest", mask: "5512", balance: 31604.08, color: "#6c5aa8", abbr: "FI", note: "+1.9% this month" },
    { group: "Loans", name: "Auto Loan", inst: "Harbor Credit Union", mask: "3307", balance: -9215.40, color: "#8a8f8b", abbr: "HC", note: "Next payment Nov 5" }
  ];

  const categories = [
    { name: "Housing", spent: 1850.00, budget: 1850, color: "#1f6b4f" },
    { name: "Groceries", spent: 512.38, budget: 600, color: "#4c9a6f" },
    { name: "Dining out", spent: 318.90, budget: 250, color: "#d08a3a" },
    { name: "Transportation", spent: 236.15, budget: 300, color: "#4b6fa8" },
    { name: "Utilities", spent: 184.72, budget: 220, color: "#2f8f8a" },
    { name: "Shopping", spent: 167.44, budget: 200, color: "#a8607f" },
    { name: "Entertainment", spent: 72.97, budget: 120, color: "#8a76c4" }
  ];

  const trend = [
    { m: "May", v: 3610 }, { m: "Jun", v: 3925 }, { m: "Jul", v: 4188 },
    { m: "Aug", v: 3742 }, { m: "Sep", v: 3486 }, { m: "Oct", v: 3342.56, current: true }
  ];

  const tx = [
    { d: "Oct 22", who: "Green Basket Market", cat: "Groceries", acct: "Rewards Visa ·7713", amt: -64.18, pending: true },
    { d: "Oct 21", who: "Metro Transit", cat: "Transportation", acct: "Everyday Checking ·4821", amt: -2.75 },
    { d: "Oct 21", who: "Luna Noodle Bar", cat: "Dining out", acct: "Rewards Visa ·7713", amt: -38.40 },
    { d: "Oct 20", who: "City Power & Light", cat: "Utilities", acct: "Everyday Checking ·4821", amt: -96.31 },
    { d: "Oct 19", who: "Bookhouse Co-op", cat: "Shopping", acct: "Rewards Visa ·7713", amt: -27.99 },
    { d: "Oct 18", who: "Transfer to Savings", cat: "Transfer", acct: "Everyday Checking ·4821", amt: -500.00 },
    { d: "Oct 17", who: "Shell Station", cat: "Transportation", acct: "Rewards Visa ·7713", amt: -48.62 },
    { d: "Oct 15", who: "Paycheck — Lindqvist Design", cat: "Income", acct: "Everyday Checking ·4821", amt: 3240.00 },
    { d: "Oct 14", who: "Streamly", cat: "Entertainment", acct: "Rewards Visa ·7713", amt: -15.99 },
    { d: "Oct 13", who: "Green Basket Market", cat: "Groceries", acct: "Rewards Visa ·7713", amt: -112.47 },
    { d: "Oct 12", who: "Corner Café", cat: "Dining out", acct: "Rewards Visa ·7713", amt: -9.25 },
    { d: "Oct 10", who: "Fairway Invest dividend", cat: "Income", acct: "Brokerage ·2290", amt: 86.12 }
  ];

  const extraColors = { Transfer: "#9aa19c", Income: "#1f7a4f" };

  // ---- Helpers ----
  const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
  const usd0 = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const $ = (id) => document.getElementById(id);
  const catColor = (name) => (categories.find((c) => c.name === name) || {}).color || extraColors[name] || "#9aa19c";
  const initials = (s) => s.replace(/[^A-Za-z ]/g, "").split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();

  // ---- Summary ----
  const assets = accounts.filter((a) => a.balance > 0).reduce((s, a) => s + a.balance, 0);
  const debts = accounts.filter((a) => a.balance < 0).reduce((s, a) => s + a.balance, 0);
  const netWorth = assets + debts;
  const spent = categories.reduce((s, c) => s + c.spent, 0);
  const budget = categories.reduce((s, c) => s + c.budget, 0);
  const income = tx.filter((t) => t.amt > 0).reduce((s, t) => s + t.amt, 0) + 3240; // two paychecks this month
  const saveRate = Math.round(((income - spent) / income) * 100);

  const stats = [
    { label: "Net worth", value: usd0.format(netWorth), delta: '<b class="up">+' + usd0.format(1912) + "</b> since last month" },
    { label: "Spent in October", value: usd0.format(spent), delta: usd0.format(budget - spent) + " left of " + usd0.format(budget) + " budget" },
    { label: "Income in October", value: usd0.format(income), delta: "2 paychecks, 1 dividend" },
    { label: "Savings rate", value: saveRate + "<small>%</small>", delta: '<b class="up">+4 pts</b> vs. 6‑month average' }
  ];
  $("stats").innerHTML = stats.map((s) =>
    '<div class="stat"><p class="stat__label">' + s.label + '</p><div class="stat__value">' + s.value +
    '</div><p class="stat__delta">' + s.delta + "</p></div>").join("");

  // ---- Accounts ----
  $("accounts-count").textContent = accounts.length + " linked";
  let lastGroup = null;
  $("accounts-list").innerHTML = accounts.map((a) => {
    let head = "";
    if (a.group !== lastGroup) {
      const total = accounts.filter((x) => x.group === a.group).reduce((s, x) => s + x.balance, 0);
      head = '<li class="acct-group">' + a.group + " · " + usd0.format(total) + "</li>";
      lastGroup = a.group;
    }
    let extra = a.note ? "<small>" + esc(a.note) + "</small>" : "";
    if (a.limit) {
      const pct = Math.round((-a.balance / a.limit) * 100);
      extra = "<small>" + pct + "% of " + usd0.format(a.limit) + ' limit</small><div class="util"><span style="width:' + pct + '%"></span></div>';
    }
    return head + '<li class="acct"><span class="acct__icon" style="background:' + a.color + '">' + a.abbr +
      '</span><div class="acct__main"><div class="acct__name">' + esc(a.name) + '</div><div class="acct__meta">' +
      esc(a.inst) + " ·" + a.mask + '</div></div><div class="acct__bal' + (a.balance < 0 ? " neg" : "") + '">' +
      usd.format(a.balance) + extra + "</div></li>";
  }).join("");

  // ---- Donut ----
  const r = 42, C = 2 * Math.PI * r, gap = 1.2;
  let offset = 0;
  const arcs = categories.map((c) => {
    const len = (c.spent / spent) * C;
    const seg = '<circle cx="50" cy="50" r="' + r + '" fill="none" stroke="' + c.color + '" stroke-width="12" stroke-dasharray="' +
      Math.max(len - gap, 0.1) + " " + (C - Math.max(len - gap, 0.1)) + '" stroke-dashoffset="' + -offset + '"><title>' +
      esc(c.name) + ": " + usd.format(c.spent) + "</title></circle>";
    offset += len;
    return seg;
  }).join("");
  $("donut").innerHTML = '<svg viewBox="0 0 100 100" role="img" aria-label="Spending split by category">' + arcs +
    '</svg><figcaption class="donut__center"><strong>' + usd0.format(spent) + "</strong><span>of " + usd0.format(budget) + " budget</span></figcaption>";

  // ---- Category list ----
  $("cats").innerHTML = categories.map((c) => {
    const pct = Math.min(100, (c.spent / c.budget) * 100);
    const over = c.spent > c.budget;
    const right = over ? usd0.format(c.spent - c.budget) + " over" : usd0.format(c.budget - c.spent) + " left";
    return '<li class="cat' + (over ? " cat--over" : "") + '"><div class="cat__top"><span class="cat__dot" style="background:' + c.color +
      '"></span><span class="cat__name">' + esc(c.name) + '</span><span class="cat__amt">' + usd0.format(c.spent) +
      '</span><span class="cat__budget">' + right + '</span></div><div class="bar" role="progressbar" aria-label="' + esc(c.name) +
      ' budget used" aria-valuenow="' + Math.round((c.spent / c.budget) * 100) + '" aria-valuemin="0" aria-valuemax="100"><span style="width:' +
      pct + "%;background:" + (over ? "var(--neg)" : c.color) + '"></span></div></li>';
  }).join("");

  // ---- Trend ----
  const max = Math.max.apply(null, trend.map((t) => t.v));
  $("trend").innerHTML = trend.map((t) =>
    '<div class="trend__col' + (t.current ? " trend__col--current" : "") + '"><span class="trend__val">' +
    "$" + (t.v / 1000).toFixed(1) + 'k</span><div class="trend__bar" style="height:' + Math.round((t.v / max) * 80) +
    'px"></div><span class="trend__label">' + t.m + "</span></div>").join("");

  // ---- Transactions ----
  $("tx-body").innerHTML = tx.map((t) => {
    const color = catColor(t.cat);
    return '<div class="tx__row" role="row"><span class="tx__date" role="cell">' + t.d +
      '</span><span class="tx__desc" role="cell"><span class="tx__logo">' + initials(t.who) + '</span><span class="tx__merchant">' +
      esc(t.who) + "</span>" + (t.pending ? '<span class="tx__pending">Pending</span>' : "") +
      '</span><span role="cell"><span class="tag"><i style="background:' + color + '"></i>' + esc(t.cat) +
      '</span></span><span class="tx__acct" role="cell">' + esc(t.acct) + '</span><span class="num amount' + (t.amt > 0 ? " in" : "") +
      '" role="cell">' + (t.amt > 0 ? "+" : "") + usd.format(t.amt) + '</span><span class="tx__mobile-meta">' + t.d + " · " + esc(t.cat) +
      " · " + esc(t.acct.split(" ·")[0]) + "</span></div>";
  }).join("");

  document.documentElement.dataset.ready = String(document.documentElement.scrollHeight);
})();

