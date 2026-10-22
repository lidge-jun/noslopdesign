/* Sample household data for the overview. Seeded so totals stay stable between loads. */
(function () {
  var TODAY = new Date(2026, 9, 22);

  var CATEGORIES = [
    { id: "housing", name: "Rent", color: "#5a6a80", budget: 1640 },
    { id: "groceries", name: "Groceries", color: "#2f8a57", budget: 620 },
    { id: "dining", name: "Dining out", color: "#c9692c", budget: 280 },
    { id: "transport", name: "Transport", color: "#2b86a3", budget: 210 },
    { id: "utilities", name: "Bills and utilities", color: "#7b62ad", budget: 235 },
    { id: "shopping", name: "Shopping", color: "#a8862a", budget: 250 },
    { id: "health", name: "Health", color: "#bb4d63", budget: 120 },
    { id: "subscriptions", name: "Subscriptions", color: "#6e7f2c", budget: 64 }
  ];

  var ACCOUNTS = [
    { id: "chk", group: "Cash", name: "Everyday Checking", inst: "Golden 1 Credit Union", last4: "4821", balance: 4218.66, change: 612.08 },
    { id: "sav", group: "Cash", name: "High-yield Savings", inst: "Ally Bank", last4: "7730", balance: 18402.11, change: 451.37 },
    { id: "visa", group: "Credit", name: "Visa Signature", inst: "Chase", last4: "0937", balance: -1286.4, change: -1286.4, note: "Statement due Nov 3, minimum $40" },
    { id: "brk", group: "Investments", name: "Individual Brokerage", inst: "Fidelity", last4: "5512", balance: 31775.02, change: -418.93 },
    { id: "401k", group: "Investments", name: "401(k)", inst: "Vanguard", last4: "2069", balance: 64190.58, change: 1137.6 }
  ];

  var MERCHANTS = {
    groceries: [["Trader Joe's", 28, 74], ["Berkeley Bowl", 19, 63], ["Safeway", 12, 48], ["Costco Wholesale", 96, 188]],
    dining: [["Blue Bottle Coffee", 5.5, 13], ["Zachary's Chicago Pizza", 31, 58], ["Sweetgreen", 13, 19], ["La Note", 38, 71], ["Tacos Sinaloa", 11, 24]],
    transport: [["BART Clipper reload", 20, 40], ["Shell", 41, 62], ["Lyft", 12, 31]],
    shopping: [["Target", 18, 86], ["REI Co-op", 34, 129], ["Amazon", 9, 64], ["Uniqlo", 29, 79]],
    health: [["CVS Pharmacy", 8, 34], ["Equinox Berkeley", 0, 0], ["Dr. Patel, DDS copay", 35, 35]]
  };

  var FIXED = [
    { day: 1, cat: "housing", merchant: "Parkview Apartments", note: "October rent", amount: 1640, acct: "chk" },
    { day: 4, cat: "utilities", merchant: "PG&E", note: "Gas and electric", amount: [71.4, 88.62, 94.15, 103.27], acct: "chk" },
    { day: 9, cat: "utilities", merchant: "Xfinity", note: "Internet", amount: 70, acct: "chk" },
    { day: 12, cat: "utilities", merchant: "Mint Mobile", note: "Phone plan", amount: 30, acct: "visa" },
    { day: 6, cat: "subscriptions", merchant: "Spotify", note: "Duo plan", amount: 16.99, acct: "visa" },
    { day: 14, cat: "subscriptions", merchant: "Netflix", note: "Standard plan", amount: 17.99, acct: "visa" },
    { day: 19, cat: "subscriptions", merchant: "iCloud+", note: "200 GB", amount: 2.99, acct: "visa" },
    { day: 2, cat: "health", merchant: "Equinox Berkeley", note: "Monthly membership", amount: 54, acct: "visa" }
  ];

  var INCOME = [
    { day: 1, merchant: "Sutter Health payroll", note: "Direct deposit", amount: 2956.2 },
    { day: 15, merchant: "Sutter Health payroll", note: "Direct deposit", amount: 2956.2 }
  ];

  // per category: visits per month for each generated month (Jul, Aug, Sep, Oct)
  var VISITS = {
    groceries: [9, 10, 8, 8],
    dining: [9, 12, 8, 11],
    transport: [6, 7, 5, 6],
    shopping: [3, 5, 2, 4],
    health: [1, 0, 1, 1]
  };

  function rng(seed) {
    return function () {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };
  }

  var MONTHS = [6, 7, 8, 9]; // Jul..Oct 2026, zero-based
  var transactions = [];
  var nextId = 1;

  MONTHS.forEach(function (m, mi) {
    var rand = rng(9173 + mi * 7919);
    var daysInMonth = new Date(2026, m + 1, 0).getDate();
    var lastDay = m === TODAY.getMonth() ? TODAY.getDate() : daysInMonth;

    function push(day, cat, merchant, note, amount, acct, pending) {
      if (day > lastDay) return;
      transactions.push({
        id: nextId++, date: new Date(2026, m, day), cat: cat, merchant: merchant,
        note: note || "", amount: Math.round(amount * 100) / 100, acct: acct, pending: !!pending
      });
    }

    FIXED.forEach(function (f) {
      var amt = Array.isArray(f.amount) ? f.amount[mi] : f.amount;
      push(f.day, f.cat, f.merchant, f.note.replace("October", new Date(2026, m, 1).toLocaleString("en-US", { month: "long" })), amt, f.acct);
    });
    INCOME.forEach(function (inc) { push(inc.day, "income", inc.merchant, inc.note, -inc.amount, "chk"); });
    Object.keys(VISITS).forEach(function (cat) {
      var n = VISITS[cat][mi];
      var pool = MERCHANTS[cat].filter(function (x) { return x[2] > 0; });
      for (var i = 0; i < n; i++) {
        var pick = pool[Math.floor(rand() * pool.length)];
        var day = 1 + Math.floor(((i + rand()) / n) * (lastDay === daysInMonth ? daysInMonth : 22));
        var amt = pick[1] + rand() * (pick[2] - pick[1]);
        var acct = cat === "transport" && pick[0].indexOf("BART") === 0 ? "chk" : "visa";
        var pending = m === TODAY.getMonth() && day >= lastDay - 1;
        push(Math.min(day, lastDay), cat, pick[0], "", amt, acct, pending);
      }
    });
  });

  transactions.sort(function (a, b) { return b.date - a.date || b.id - a.id; });

  window.FINANCE = { today: TODAY, categories: CATEGORIES, accounts: ACCOUNTS, transactions: transactions };
})();

