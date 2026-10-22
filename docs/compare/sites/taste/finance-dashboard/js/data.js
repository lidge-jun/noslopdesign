// Halfpenny sample data for Priya Shah, October 2026. Every total on screen is computed from these rows.
// Sample content: replace with real account data before launch.
window.HP = (() => {
  const today = { day: 22, month: 'October', year: 2026, daysInMonth: 31 };

  // pale tint + dark ink of the same hue, per category (identity, not data)
  const categories = [
    { id: 'bills',     name: 'Rent & bills',     planned: 1440, fixed: true, tint: '#e6ecf5', ink: '#24364f' },
    { id: 'grocery',   name: 'Groceries',        planned: 320, tint: '#e3f3e6', ink: '#1d4a2a' },
    { id: 'eating',    name: 'Eating out',       planned: 160, tint: '#fde9dc', ink: '#7a3412' },
    { id: 'transport', name: 'Transport',        planned: 140, tint: '#dcf1ff', ink: '#0a3a80' },
    { id: 'shopping',  name: 'Shopping',         planned: 180, tint: '#f6e8f0', ink: '#6b2148' },
    { id: 'subs',      name: 'Subscriptions',    planned: 48,  tint: '#ece9f8', ink: '#3b3170' },
    { id: 'health',    name: 'Health & fitness', planned: 60,  tint: '#dff3f1', ink: '#134c47' },
    { id: 'gifts',     name: 'Gifts',            planned: 80,  tint: '#fbf0d4', ink: '#5e4306' },
  ];

  const accounts = [
    { id: 'current', name: 'Everyday', kind: 'Current account', last4: '4417', balance: 2184.56, colour: '#1d5fd6' },
    { id: 'pot', name: 'Bills pot', kind: 'Set aside for bills', balance: 140.00, colour: '#24364f' },
    { id: 'saver', name: 'Rainy day', kind: 'Easy access, 3.90% AER', balance: 8420.13, colour: '#2f7a45' },
    { id: 'isa', name: 'Stocks ISA', kind: 'Invested', balance: 14962.40, colour: '#9a6a0a' },
    { id: 'card', name: 'Credit card', kind: 'Statement due 9 Nov', last4: '0932', balance: -412.37, colour: '#1b1d1f' },
  ];

  // [day, merchant, category or 'income', amount (negative = money out), account]
  const rows = [
    [1, 'Holloway & Finch salary', 'income', 3180.42, 'current'],
    [1, 'Calloway Lettings rent', 'bills', -1150.00, 'current'],
    [1, 'Hackney council tax', 'bills', -128.00, 'current'],
    [2, 'Tesco', 'grocery', -42.18, 'card'],
    [2, 'Pret A Manger', 'eating', -6.45, 'card'],
    [3, 'Dishoom', 'eating', -48.60, 'card'],
    [3, 'Netflix', 'subs', -10.99, 'card'],
    [4, 'Lidl', 'grocery', -23.65, 'current'],
    [5, 'Thames Water', 'bills', -38.40, 'current'],
    [6, 'TfL', 'transport', -27.60, 'current'],
    [7, "Sainsbury's", 'grocery', -61.30, 'card'],
    [8, 'Hyperoptic broadband', 'bills', -30.00, 'current'],
    [8, 'Better Leisure swim', 'health', -6.20, 'current'],
    [9, 'Franco Manca', 'eating', -22.50, 'card'],
    [9, 'iCloud+', 'subs', -2.99, 'card'],
    [10, 'Lidl', 'grocery', -18.92, 'current'],
    [11, 'Uniqlo', 'shopping', -39.90, 'card'],
    [12, 'Pret A Manger', 'eating', -5.95, 'card'],
    [12, 'Etsy', 'gifts', -28.50, 'card'],
    [13, 'Tesco', 'grocery', -47.05, 'card'],
    [13, 'TfL', 'transport', -27.60, 'current'],
    [14, 'Waterstones', 'shopping', -14.99, 'card'],
    [14, 'Vinted sale', 'income', 18.00, 'current'],
    [15, 'Co-op', 'grocery', -9.40, 'current'],
    [15, 'The Guardian', 'subs', -12.00, 'card'],
    [16, 'Honest Burgers', 'eating', -31.20, 'card'],
    [17, "Sainsbury's", 'grocery', -55.12, 'card'],
    [17, 'Holland & Barrett', 'health', -11.40, 'card'],
    [18, 'Bao Borough', 'eating', -38.75, 'card'],
    [18, 'Uber', 'transport', -14.80, 'card'],
    [19, 'Lidl', 'grocery', -21.38, 'current'],
    [19, 'Boots', 'shopping', -12.45, 'card'],
    [20, 'TfL', 'transport', -27.60, 'current'],
    [20, 'Pret A Manger', 'eating', -6.45, 'card'],
    [21, 'Padella', 'eating', -36.10, 'card'],
    [21, 'Co-op', 'grocery', -6.85, 'current'],
    [22, 'Pret A Manger', 'eating', -5.95, 'card'],
  ].map(([day, merchant, cat, amount, account], i) => ({ id: i, day, merchant, cat, amount, account }));

  // bills still to leave this month: committed against their category, paid from the Bills pot
  const due = [
    { day: 26, merchant: 'Giffgaff', what: 'Phone plan', cat: 'bills', amount: 18.00 },
    { day: 27, merchant: 'Spotify', what: 'Premium', cat: 'subs', amount: 11.99 },
    { day: 28, merchant: 'Octopus Energy', what: 'Gas and electricity', cat: 'bills', amount: 72.00 },
    { day: 30, merchant: 'PureGym', what: 'Membership', cat: 'health', amount: 34.00 },
  ];

  // September spending by day (all categories), for the pace comparison
  const septDaily = [1278.00, 18.40, 54.10, 12.80, 47.20, 27.60, 9.95, 66.30, 30.00, 21.75,
    14.20, 58.90, 27.60, 6.45, 39.80, 44.15, 12.99, 61.70, 8.30, 27.60,
    52.40, 19.85, 33.10, 72.00, 11.99, 18.00, 41.60, 27.60, 34.00, 22.45];
  const septFixed = { 1: 1278.00, 9: 30.00, 24: 72.00, 26: 18.00 }; // the Rent & bills share of those days

  // ---- derived, never typed ----
  const p = (v) => Math.round(v * 100);
  const sum = (a) => a.reduce((s, v) => s + p(v), 0) / 100;
  for (const c of categories) {
    c.spent = sum(rows.filter((r) => r.cat === c.id).map((r) => -r.amount));
    c.committed = sum(due.filter((d) => d.cat === c.id).map((d) => d.amount));
    c.left = (p(c.planned) - p(c.spent) - p(c.committed)) / 100;
    c.pace = c.fixed ? null : Math.round((c.planned * today.day / today.daysInMonth) * 100) / 100;
  }
  const totals = {
    planned: sum(categories.map((c) => c.planned)),
    spent: sum(categories.map((c) => c.spent)),
    committed: sum(due.map((d) => d.amount)),
    income: sum(rows.filter((r) => r.cat === 'income').map((r) => r.amount)),
  };
  totals.left = (p(totals.planned) - p(totals.spent) - p(totals.committed)) / 100;
  const netWorth = sum(accounts.map((a) => a.balance));

  const cumulative = (daily) => { let s = 0; return daily.map((v) => (s += p(v)) / 100); };
  const octDaily = (keep) => Array.from({ length: today.day }, (_, i) => sum(rows.filter((r) => r.day === i + 1 && keep(r)).map((r) => Math.abs(r.amount))));
  const octAll = octDaily((r) => r.cat !== 'income');
  const octFlex = octDaily((r) => r.cat !== 'income' && r.cat !== 'bills');
  const octIncome = octDaily((r) => r.cat === 'income');
  const septFlex = septDaily.map((v, i) => (p(v) - p(septFixed[i + 1] || 0)) / 100);

  // forecast to the 31st: the day-to-day run rate so far, plus each bill on its due day
  const rate = sum(octFlex) / today.day;
  const forecast = (base, keepBill) => {
    const out = cumulative(base);
    for (let d = today.day + 1; d <= today.daysInMonth; d++) {
      const bills = sum(due.filter((x) => x.day === d && keepBill(x)).map((x) => x.amount));
      out.push(Math.round((out.at(-1) + rate + bills) * 100) / 100);
    }
    return out;
  };
  const series = {
    flex: { oct: forecast(octFlex, (x) => x.cat !== 'bills'), sept: cumulative(septFlex) },
    all: { oct: forecast(octAll, () => true), sept: cumulative(septDaily) },
  };
  const at = (arr) => arr[today.day - 1];
  totals.flexSpent = at(series.flex.oct);
  totals.flexSept = at(series.flex.sept);
  totals.allSept = at(series.all.sept);
  totals.flexForecast = series.flex.oct.at(-1);
  totals.flexPlanned = sum(categories.filter((c) => !c.fixed).map((c) => c.planned));

  console.assert(Math.abs(totals.spent - at(series.all.oct)) < 0.005, 'category spend equals the daily total');
  console.assert(Math.abs(sum(categories.map((c) => c.left)) - totals.left) < 0.005, 'category left sums to total left');
  console.assert(Math.abs(totals.flexSpent - sum(categories.filter((c) => !c.fixed).map((c) => c.spent))) < 0.005, 'day-to-day equals the flexible categories');
  console.assert(Math.abs(sum(octIncome) - totals.income) < 0.005, 'income by day equals income total');
  console.assert(accounts.find((a) => a.id === 'pot').balance >= totals.committed, 'the bills pot covers what is due');

  return { today, categories, accounts, rows, due, totals, netWorth, series, sum };
})();

