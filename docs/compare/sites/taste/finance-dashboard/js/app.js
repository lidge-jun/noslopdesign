(() => {
  const { today, categories, accounts, rows, due, totals, netWorth, series } = window.HP;
  const $ = (s) => document.querySelector(s);
  const MINUS = '\u2212';
  const gbp = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const gbp0 = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 });
  const money = (v) => (v < 0 ? MINUS : '') + gbp.format(Math.abs(v));
  const signed = (v) => (v > 0 ? '+' : v < 0 ? MINUS : '') + gbp.format(Math.abs(v));
  // pounds in full, the pence one size down in grey
  const split = (v) => { const s = money(v), i = s.lastIndexOf('.'); return s.slice(0, i) + '<span class="p">' + s.slice(i) + '</span>'; };
  const cat = Object.fromEntries(categories.map((c) => [c.id, c]));
  const acct = Object.fromEntries(accounts.map((a) => [a.id, a]));
  const daysLeft = today.daysInMonth - today.day;
  const when = (d) => (d === today.day ? 'Today' : d === today.day - 1 ? 'Yesterday' : d + ' Oct');
  const initials = (name) => { const w = name.replace(/[^A-Za-z& ]/g, '').split(' ').filter((x) => x && x !== '&'); return (w.length > 1 ? w[0][0] + w[1][0] : w[0].slice(0, 2)).toUpperCase(); };
  const incomeTint = { tint: '#dcfae5', ink: '#04250e' };

  // ---- the finding, under the title ----
  const over = categories.filter((c) => c.left < 0);
  $('#finding').innerHTML = 'Day ' + today.day + ' of ' + today.daysInMonth + '. ' + money(totals.left) + ' of the ' + gbp0.format(totals.planned) + ' plan is left once ' + money(totals.committed) + ' of bills go out'
    + (over.length ? '; <span class="over">' + over.map((c) => c.name.toLowerCase() + ' is ' + money(-c.left) + ' over').join(', ') + '</span>.' : '.');

  // ---- accounts ----
  $('#accounts').innerHTML = [
    '<div class="kpi"><div class="acct-name">Net worth</div><div class="kpi-value lead">' + split(netWorth) + '</div><div class="acct-kind">Across ' + accounts.length + ' accounts</div></div>',
    ...accounts.map((a) => '<div class="kpi"><div class="acct-name"><span class="card-art" style="background:' + a.colour + '"></span>' + a.name + (a.last4 ? ' ··' + a.last4 : '') + '</div>'
      + '<div class="kpi-value">' + split(a.balance) + '</div><div class="acct-kind">' + a.kind + '</div></div>'),
  ].join('');

  // ---- spending by category ----
  $('#cat-meta').textContent = '1–' + today.day + ' Oct · ' + daysLeft + ' days to go';
  $('#plan-summary').innerHTML = '<span class="lead">' + split(totals.left) + '</span><span class="what">left of ' + gbp0.format(totals.planned) + ', after ' + money(totals.spent) + ' spent and ' + money(totals.committed) + ' due</span>';
  $('#plan-key').innerHTML = '<li><span class="sw"></span>Spent</li><li><span class="sw due"></span>Due this month</li><li><span class="sw tick"></span>Even pace for day ' + today.day + '</li>' + (over.length ? '<li><span class="sw over"></span>Over plan</li>' : '');
  const pct = (v, of) => (v / of) * 100 + '%';
  $('#cats').innerHTML = categories.map((c) => {
    const total = Math.max(c.planned, c.spent + c.committed);
    const inPlan = Math.min(c.spent, c.planned);
    const dueW = Math.max(0, Math.min(c.committed, c.planned - inPlan));
    const isOver = c.spent > c.planned;
    const leftTxt = c.left < 0 ? money(-c.left) + ' over' : money(c.left) + ' left' + (c.fixed ? ', fixed costs' : c.spent > c.pace ? ', ahead of pace' : '');
    const label = c.name + ': ' + money(c.spent) + ' of ' + gbp0.format(c.planned) + (c.committed ? ', ' + money(c.committed) + ' due' : '') + ', ' + leftTxt;
    return '<li><button class="cat" type="button" aria-pressed="false" data-cat="' + c.id + '" aria-label="' + label + '. Show its transactions">'
      + '<span class="cat-name"><span class="chip" style="background:' + c.tint + ';color:' + c.ink + '">' + initials(c.name) + '</span>' + c.name + '</span>'
      + '<span class="track" aria-hidden="true">'
      + '<span class="fill" style="width:' + pct(inPlan, total) + '"></span>'
      + (dueW ? '<span class="due" style="left:' + pct(inPlan, total) + ';width:' + pct(dueW, total) + '"></span>' : '')
      + (isOver ? '<span class="ovr" style="left:' + pct(c.planned, total) + ';width:' + pct(c.spent - c.planned, total) + '"></span><span class="end" style="left:' + pct(c.planned, total) + '"></span>' : '')
      + (c.pace != null ? '<span class="tick" style="left:' + pct(c.pace, total) + '"></span>' : '')
      + '</span>'
      + '<span class="cat-fig"><b>' + money(c.spent) + '</b> <span class="of">of ' + gbp0.format(c.planned) + '</span><span class="left' + (c.left < 0 ? ' over' : '') + '">' + leftTxt + '</span></span>'
      + '</button></li>';
  }).join('');

  // ---- recent transactions, filtered by the chosen category ----
  const SHOW = 8;
  const sorted = [...rows].sort((a, b) => b.day - a.day || b.id - a.id);
  $('#tx-all').textContent = 'View all ' + rows.length;
  const txRow = (r) => {
    const c = r.cat === 'income' ? incomeTint : cat[r.cat];
    const a = acct[r.account];
    const catName = r.cat === 'income' ? 'Money in' : c.name;
    return '<li class="row"><span class="avatar" style="background:' + c.tint + ';color:' + c.ink + '" aria-hidden="true">' + initials(r.merchant) + '</span>'
      + '<span class="tx-main"><span class="m">' + r.merchant + '</span><span class="s">' + catName + ' · ' + a.name + '</span></span>'
      + '<span class="tx-amt"><span class="a' + (r.amount > 0 ? ' in' : '') + '">' + (r.amount > 0 ? '+' + gbp.format(r.amount) : gbp.format(-r.amount)) + '</span><span class="d">' + when(r.day) + '</span></span></li>';
  };
  let active = null;
  const renderTx = () => {
    const list = active ? sorted.filter((r) => r.cat === active) : sorted;
    $('#tx').innerHTML = list.length ? list.slice(0, SHOW).map(txRow).join('') : '<li><div class="empty">No ' + cat[active].name.toLowerCase() + ' yet this month.</div></li>';
    const f = $('#tx-filter');
    if (active) {
      const c = cat[active];
      f.hidden = false;
      f.innerHTML = '<span>' + c.name + ': ' + list.length + ' this month, ' + money(c.spent) + '</span><button type="button" id="tx-clear">Show all</button>';
      $('#tx-clear').onclick = () => setActive(null);
    } else f.hidden = true;
    document.querySelectorAll('.cat').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.cat === active)));
  };
  const setActive = (id) => { active = id; renderTx(); };
  $('#cats').addEventListener('click', (e) => { const b = e.target.closest('.cat'); if (b) setActive(active === b.dataset.cat ? null : b.dataset.cat); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && active) setActive(null); });
  renderTx();

  // ---- spending pace: the KPIs are the chart's tabs ----
  const labels = Array.from({ length: today.daysInMonth }, (_, i) => (i + 1) + ' Oct');
  const pad = (arr) => labels.map((_, i) => (i < arr.length ? arr[i] : null));
  const tabs = [
    { id: 'flex', label: 'Day-to-day so far', value: totals.flexSpent, sept: totals.flexSept, plan: totals.flexPlanned,
      note: () => 'Day-to-day leaves out rent and bills. At this rate it ends October at ' + money(series.flex.oct.at(-1)) + ', ' + money(series.flex.oct.at(-1) - totals.flexPlanned) + ' over its ' + gbp0.format(totals.flexPlanned) + ' plan.' },
    { id: 'all', label: 'All spending so far', value: totals.spent, sept: totals.allSept, plan: totals.planned,
      note: () => { const end = series.all.oct.at(-1), d = end - totals.planned; return 'With ' + money(totals.committed) + ' of bills still due, all spending ends October at ' + money(end) + ', ' + money(Math.abs(d)) + (d > 0 ? ' over' : ' under') + ' the ' + gbp0.format(totals.planned) + ' plan.'; } },
  ];
  let tab = 'flex';
  const drawPace = () => {
    const t = tabs.find((x) => x.id === tab);
    $('#pace-tabs').innerHTML = tabs.map((x) => {
      const d = Math.round((x.value - x.sept) * 100) / 100;
      return '<button class="kpi" role="tab" type="button" aria-selected="' + (x.id === tab) + '" data-tab="' + x.id + '"><div class="kpi-label">' + x.label + '</div><div class="kpi-value">' + split(x.value) + '</div>'
        + '<div class="delta"><span class="' + (d > 0 ? 'bad' : d < 0 ? 'good' : '') + '">' + signed(d) + '</span> against 22 Sep</div></button>';
    }).join('');
    const el = $('#pace-chart');
    el.innerHTML = '';
    Charts.line(el, {
      labels,
      series: [
        { name: 'October, then forecast', values: series[tab].oct },
        { name: 'September', values: pad(series[tab].sept), colour: getComputedStyle(document.documentElement).getPropertyValue('--chart-muted').trim() },
      ],
      format: Charts.fmt.money('GBP', 0),
      height: window.matchMedia('(max-width: 640px)').matches ? 190 : window.matchMedia('(max-width: 1180px)').matches ? 240 : 316, today: today.day - 1, todayLabel: 'Today', endLabel: true,
      reference: { value: t.plan, label: 'Plan ' + gbp0.format(t.plan) },
      legend: '#pace-legend',
    });
    $('#pace-note').textContent = t.note();
  };
  $('#pace-tabs').addEventListener('click', (e) => { const b = e.target.closest('[data-tab]'); if (b && b.dataset.tab !== tab) { tab = b.dataset.tab; drawPace(); } });
  drawPace();

  // ---- due before the month ends, and money in ----
  $('#due-total').textContent = money(totals.committed);
  $('#due').innerHTML = due.map((d) => '<li class="row"><span class="due-date"><b>' + d.day + '</b><small>Oct</small></span>'
    + '<span class="tx-main"><span class="m">' + d.merchant + '</span><span class="s">' + d.what + ' · ' + cat[d.cat].name + '</span></span>'
    + '<span class="tx-amt"><span class="a">' + gbp.format(d.amount) + '</span><span class="d">in ' + (d.day - today.day) + ' days</span></span></li>').join('');
  const pot = acct.pot.balance;
  $('#pot').innerHTML = pot >= totals.committed
    ? 'The Bills pot holds <b>' + money(pot) + '</b>, enough for all ' + due.length + '. ' + money(pot - totals.committed) + ' stays in the pot.'
    : 'The Bills pot is <b>' + money(totals.committed - pot) + ' short</b> of what is due.';
  const income = sorted.filter((r) => r.cat === 'income');
  $('#in-total').textContent = '+' + gbp.format(totals.income);
  $('#income').innerHTML = income.map((r) => '<li class="row"><span class="avatar" style="background:' + incomeTint.tint + ';color:' + incomeTint.ink + '" aria-hidden="true">' + initials(r.merchant) + '</span>'
    + '<span class="tx-main"><span class="m">' + r.merchant + '</span><span class="s">' + r.day + ' Oct · ' + acct[r.account].name + '</span></span>'
    + '<span class="tx-amt"><span class="a in">+' + gbp.format(r.amount) + '</span></span></li>').join('');

  // ---- sync ----
  $('#refresh').addEventListener('click', (e) => {
    const b = e.currentTarget; b.classList.add('spin');
    setTimeout(() => { b.classList.remove('spin'); $('#stamp').textContent = 'Synced just now'; }, 650);
  });
})();

