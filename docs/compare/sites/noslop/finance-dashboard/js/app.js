(function () {
  var F = window.FINANCE;
  var catById = {};
  F.categories.forEach(function (c) { catById[c.id] = c; });
  catById.income = { id: "income", name: "Income", color: "#1d7a46" };
  var acctById = {};
  F.accounts.forEach(function (a) { acctById[a.id] = a; });

  var usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
  var usd0 = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
  var monthName = function (m) { return new Date(2026, m, 1).toLocaleString("en-US", { month: "long" }); };
  var shortDate = function (d) { return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }); };
  var $ = function (id) { return document.getElementById(id); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };

  var state = { month: F.today.getMonth(), cat: "", acct: "", q: "", all: false };
  var RECENT = 12;
  var selectable = [7, 8, 9];

  function inMonth(m) { return F.transactions.filter(function (t) { return t.date.getMonth() === m; }); }
  function spendOf(list) { return list.filter(function (t) { return t.cat !== "income"; }); }
  function sum(list) { return list.reduce(function (s, t) { return s + t.amount; }, 0); }
  var totalBudget = F.categories.reduce(function (s, c) { return s + c.budget; }, 0);

  function renderMonths() {
    $("month-switch").innerHTML = selectable.map(function (m) {
      return '<button type="button" aria-pressed="' + (m === state.month) + '" data-m="' + m + '">' + monthName(m).slice(0, 3) + "</button>";
    }).join("");
  }

  function renderHead() {
    var m = state.month, list = inMonth(m);
    var income = -sum(list.filter(function (t) { return t.cat === "income"; }));
    var spent = sum(spendOf(list));
    var isCurrent = m === F.today.getMonth();
    $("page-title").textContent = monthName(m) + " 2026";
    document.title = "Kestrel: " + monthName(m) + " overview";
    var left = income - spent;
    $("page-sub").innerHTML = (isCurrent ? "Through " + shortDate(F.today) + ". " : "") +
      usd.format(income) + " in, " + usd.format(spent) + " out. " +
      '<span class="' + (left >= 0 ? "pos" : "neg") + '">' + (left >= 0 ? usd.format(left) + " left over" : usd.format(-left) + " overspent") + "</span>";
  }

  function renderSpending() {
    var m = state.month, isCurrent = m === F.today.getMonth();
    var spend = spendOf(inMonth(m));
    var spent = sum(spend);
    var days = new Date(2026, m + 1, 0).getDate();
    var dayNow = isCurrent ? F.today.getDate() : days;

    $("spent-total").textContent = usd.format(spent);
    $("spent-detail").textContent = "spent of " + usd0.format(totalBudget) + " budgeted" + (isCurrent ? ", " + (days - dayNow) + " days left" : "");

    var note = $("pace-note");
    if (isCurrent) {
      var rent = sum(spend.filter(function (t) { return t.cat === "housing"; }));
      var projected = rent + ((spent - rent) / dayNow) * days;
      var diff = projected - totalBudget;
      note.innerHTML = "On pace for <strong class=\"num\">" + usd0.format(projected) + "</strong> by Oct 31, " +
        (diff > 0 ? '<span class="neg">' + usd0.format(diff) + " over budget</span>" : '<span class="pos">' + usd0.format(-diff) + " under budget</span>");
    } else {
      var d2 = spent - totalBudget;
      note.innerHTML = d2 > 0 ? 'Finished <span class="neg">' + usd0.format(d2) + " over budget</span>" : 'Finished <span class="pos">' + usd0.format(-d2) + " under budget</span>";
    }

    renderPace(m, dayNow);

    var byCat = {};
    spend.forEach(function (t) { byCat[t.cat] = (byCat[t.cat] || 0) + t.amount; });
    var rows = F.categories.slice().sort(function (a, b) { return (byCat[b.id] || 0) - (byCat[a.id] || 0); });
    $("cat-list").innerHTML = rows.map(function (c) {
      var v = byCat[c.id] || 0;
      var over = Math.round(v - c.budget);
      var status = over > 0 ? '<span class="neg">' + usd0.format(over) + " over</span>" : over === 0 ? '<span class="muted">On budget</span>' : '<span class="muted">' + usd0.format(-over) + " left</span>";
      // track spans 125% of the category budget, so the budget mark sits at 80%
      var w = Math.min(100, (v / (c.budget * 1.25)) * 100), bw = 80;
      return '<li><button type="button" class="cat" data-cat="' + c.id + '" aria-pressed="' + (state.cat === c.id) + '">' +
        '<span class="cat-name"><i class="sw" style="background:' + c.color + '"></i>' + esc(c.name) + "</span>" +
        '<span class="cat-amt num">' + usd.format(v) + ' <span class="muted">/ ' + usd0.format(c.budget) + "</span></span>" +
        '<span class="cat-status num">' + status + "</span>" +
        '<span class="bar" aria-hidden="true"><span class="fill" style="width:' + w.toFixed(2) + "%;background:" + c.color + '"></span><span class="limit" style="left:' + bw.toFixed(2) + '%"></span></span>' +
        "</button></li>";
    }).join("");
    $("clear-cat").hidden = !state.cat;
  }

  function cumulative(m, upto) {
    var days = new Date(2026, m + 1, 0).getDate();
    var per = new Array(days + 1).fill(0);
    spendOf(inMonth(m)).forEach(function (t) { per[t.date.getDate()] += t.amount; });
    var out = [], run = 0;
    for (var d = 1; d <= Math.min(upto, days); d++) { run += per[d]; out.push([d, run]); }
    return out;
  }

  function renderPace(m, dayNow) {
    var now = cumulative(m, dayNow), prev = cumulative(m - 1, 31);
    $("legend-now").textContent = monthName(m);
    $("legend-prev").textContent = monthName(m - 1);
    var W = Math.max(280, Math.round($("pace-svg").clientWidth || 640)), H = W < 480 ? 150 : 180, pl = 40, pr = 10, pt = 10, pb = 24;
    var maxY = Math.max(totalBudget, prev[prev.length - 1][1], now[now.length - 1][1]) * 1.06;
    var x = function (d) { return pl + ((d - 1) / 30) * (W - pl - pr); };
    var y = function (v) { return pt + (1 - v / maxY) * (H - pt - pb); };
    var path = function (pts) { return pts.map(function (p, i) { return (i ? "L" : "M") + x(p[0]).toFixed(1) + " " + y(p[1]).toFixed(1); }).join(" "); };
    var ticks = [0, 1000, 2000, 3000, 4000].filter(function (v) { return v < maxY; });
    var last = now[now.length - 1];
    var svg = '<svg viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Cumulative spending in ' + monthName(m) + " compared with " + monthName(m - 1) + '">' +
      ticks.map(function (v) { return '<line class="grid-l" x1="' + pl + '" x2="' + (W - pr) + '" y1="' + y(v) + '" y2="' + y(v) + '"/><text class="ax" x="' + (pl - 8) + '" y="' + (y(v) + 4) + '" text-anchor="end">' + (v ? "$" + v / 1000 + "k" : "$0") + "</text>"; }).join("") +
      [1, 8, 15, 22, 29].map(function (d) { return '<text class="ax" x="' + x(d) + '" y="' + (H - 6) + '" text-anchor="middle">' + d + "</text>"; }).join("") +
      '<line class="budget-l" x1="' + pl + '" x2="' + (W - pr) + '" y1="' + y(totalBudget) + '" y2="' + y(totalBudget) + '"/>' +
      '<path class="prev-l" d="' + path(prev) + '"/>' +
      '<path class="now-l" d="' + path(now) + '"/>' +
      '<circle class="now-dot" cx="' + x(last[0]) + '" cy="' + y(last[1]) + '" r="4"/>' +
      "</svg>";
    $("pace-svg").innerHTML = svg;
  }

  function renderAccounts() {
    var net = F.accounts.reduce(function (s, a) { return s + a.balance; }, 0);
    var chg = F.accounts.reduce(function (s, a) { return s + a.change; }, 0);
    $("networth").textContent = usd.format(net);
    $("networth-change").innerHTML = '<span class="' + (chg >= 0 ? "pos" : "neg") + '">' + (chg >= 0 ? "+" : "\u2212") + usd.format(Math.abs(chg)) + "</span> since Oct 1";
    var signed = function (v) { return (v < 0 ? "\u2212" : "") + usd.format(Math.abs(v)); };
    var groups = ["Cash", "Credit", "Investments"];
    $("account-groups").innerHTML = groups.map(function (g) {
      var list = F.accounts.filter(function (a) { return a.group === g; });
      var tot = list.reduce(function (s, a) { return s + a.balance; }, 0);
      return '<div class="acct-group"><h3><span>' + g + '</span><span class="num">' + signed(tot) + "</span></h3><ul>" +
        list.map(function (a) {
          return '<li class="acct"><div><p class="acct-name">' + esc(a.name) + '</p><p class="muted small">' + esc(a.inst) + " ending " + a.last4 + "</p>" +
            (a.note ? '<p class="small due">' + esc(a.note) + "</p>" : "") +
            '</div><p class="num acct-bal' + (a.balance < 0 ? " owed" : "") + '">' + signed(a.balance) + "</p></li>";
        }).join("") + "</ul></div>";
    }).join("");
  }

  function renderFilters() {
    var cs = $("cat-filter");
    cs.innerHTML = '<option value="">All categories</option>' + F.categories.concat([catById.income]).map(function (c) {
      return '<option value="' + c.id + '"' + (state.cat === c.id ? " selected" : "") + ">" + esc(c.name) + "</option>";
    }).join("");
    var as = $("acct-filter");
    as.innerHTML = '<option value="">All accounts</option>' + F.accounts.filter(function (a) { return a.group !== "Investments"; }).map(function (a) {
      return '<option value="' + a.id + '"' + (state.acct === a.id ? " selected" : "") + ">" + esc(a.name) + "</option>";
    }).join("");
  }

  function renderTxns() {
    var q = state.q.trim().toLowerCase();
    var list = inMonth(state.month).filter(function (t) {
      return (!state.cat || t.cat === state.cat) && (!state.acct || t.acct === state.acct) &&
        (!q || (t.merchant + " " + t.note).toLowerCase().indexOf(q) !== -1);
    });
    var all = inMonth(state.month).length;
    var filtered = list.length !== all;
    var shown = filtered || state.all ? list : list.slice(0, RECENT);
    $("txn-count").textContent = filtered ? list.length + " of " + all + " match" : shown.length < all ? "Latest " + shown.length + " of " + all : all + " this month";
    var more = $("show-all");
    more.hidden = filtered || all <= RECENT;
    more.textContent = state.all ? "Show latest " + RECENT : "Show all " + all + " transactions";
    more.setAttribute("aria-expanded", String(state.all));
    $("txn-empty").hidden = list.length > 0;
    document.querySelector(".ledger").hidden = list.length === 0;
    $("txn-body").innerHTML = shown.map(function (t) {
      var c = catById[t.cat], a = acctById[t.acct];
      var income = t.amount < 0;
      return "<tr>" +
        '<td class="d num">' + shortDate(t.date) + "</td>" +
        '<td class="m"><span class="merchant">' + esc(t.merchant) + "</span>" + (t.note ? '<span class="muted small note">' + esc(t.note) + "</span>" : "") + (t.pending ? '<span class="pending">Pending</span>' : "") + "</td>" +
        '<td class="c"><i class="sw" style="background:' + c.color + '"></i>' + esc(c.name) + "</td>" +
        '<td class="a muted">' + esc(a.name) + " " + a.last4 + "</td>" +
        '<td class="r num amt' + (income ? " pos" : "") + '">' + (income ? "+" + usd.format(-t.amount) : usd.format(t.amount)) + "</td>" +
        "</tr>";
    }).join("");
  }

  function renderAll() { renderMonths(); renderHead(); renderSpending(); renderFilters(); renderTxns(); }

  $("month-switch").addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    state.month = Number(b.dataset.m); state.all = false; renderAll();
  });
  $("show-all").addEventListener("click", function () { state.all = !state.all; renderTxns(); });
  $("cat-list").addEventListener("click", function (e) {
    var b = e.target.closest(".cat"); if (!b) return;
    state.cat = state.cat === b.dataset.cat ? "" : b.dataset.cat;
    renderSpending(); renderFilters(); renderTxns();
    var focusBtn = document.querySelector('.cat[data-cat="' + b.dataset.cat + '"]'); if (focusBtn) focusBtn.focus();
  });
  $("clear-cat").addEventListener("click", function () { state.cat = ""; renderSpending(); renderFilters(); renderTxns(); });
  $("cat-filter").addEventListener("change", function (e) { state.cat = e.target.value; renderSpending(); renderTxns(); });
  $("acct-filter").addEventListener("change", function (e) { state.acct = e.target.value; renderTxns(); });
  $("q").addEventListener("input", function (e) { state.q = e.target.value; renderTxns(); });
  $("reset-filters").addEventListener("click", function () {
    state.cat = ""; state.acct = ""; state.q = ""; $("q").value = "";
    renderSpending(); renderFilters(); renderTxns();
  });

  renderAccounts();
  renderAll();
  var lastW = 0, rt;
  window.addEventListener("resize", function () {
    clearTimeout(rt);
    rt = setTimeout(function () {
      var w = $("pace-svg").clientWidth;
      if (Math.abs(w - lastW) > 8) { lastW = w; renderSpending(); }
    }, 120);
  });
})();

