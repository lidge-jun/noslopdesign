(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* entrances: parts of each section rise in, staggered */
  const groups = new Map();
  document.querySelectorAll('[data-r]').forEach((el) => {
    const host = el.closest('section, .cell, .field') || document.body;
    const n = groups.get(host) || 0;
    groups.set(host, n + 1);
    el.style.setProperty('--d', (n * 80) + 'ms');
  });
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px', threshold: 0.01 });
  document.querySelectorAll('[data-r]').forEach((el) => io.observe(el));
  /* the hero stage opens like a shutter once the page has painted */
  const shutter = document.querySelector('.shutter');
  requestAnimationFrame(() => requestAnimationFrame(() => shutter && shutter.classList.add('is-in')));

  /* ---------- the punch list ---------- */
  const app = document.getElementById('punchlist');
  const list = document.getElementById('rows');
  const punchedN = document.getElementById('punched-n');
  const totalN = document.getElementById('total-n');
  const openN = document.getElementById('open-n');
  const punchedTab = document.getElementById('punched-tab-n');
  const hint = document.getElementById('hint');
  let basePunched = 12, baseTotal = 19, nextId = 232;

  const rows = () => [...list.querySelectorAll('.row:not(.row-new)')];
  const sel = () => list.querySelector('.row.is-sel');
  function select(row) {
    if (!row) return;
    rows().forEach((r) => r.classList.toggle('is-sel', r === row));
  }
  function count() {
    const all = rows();
    const done = all.filter((r) => r.classList.contains('is-done')).length;
    punchedN.textContent = basePunched + done;
    totalN.textContent = baseTotal;
    openN.textContent = all.length - done;
    punchedTab.textContent = basePunched + done;
    if (all.length && done === all.length) hint.textContent = 'List clear. Early handover.';
    else if (done) hint.textContent = (all.length - done) + ' left before Friday';
  }
  function punch(row) {
    if (!row) return;
    row.classList.toggle('is-done');
    const btn = row.querySelector('.punch');
    const id = row.dataset.id;
    btn.setAttribute('aria-label', (row.classList.contains('is-done') ? 'Reopen ' : 'Punch ') + id);
    btn.setAttribute('aria-pressed', row.classList.contains('is-done'));
    count();
  }
  list.addEventListener('click', (e) => {
    const row = e.target.closest('.row');
    if (!row || row.classList.contains('row-new')) return;
    select(row);
    if (e.target.closest('.punch')) punch(row);
  });

  function newIssue() {
    if (list.querySelector('.row-new')) { list.querySelector('.row-new input').focus(); return; }
    const li = document.createElement('li');
    li.className = 'row row-new is-sel';
    li.innerHTML = '<span class="punch" aria-hidden="true"></span><span class="pri pri-2"></span><span class="id">PUN-' + nextId + '</span><span class="t"><input type="text" aria-label="New issue title" placeholder="Issue title, then Enter"></span><span class="tag">new</span><span class="who">ME</span>';
    rows().forEach((r) => r.classList.remove('is-sel'));
    list.prepend(li);
    const input = li.querySelector('input');
    input.focus({ preventScroll: true });
    input.addEventListener('keydown', (e) => {
      e.stopPropagation();
      if (e.key === 'Escape') { li.remove(); select(rows()[0]); }
      if (e.key === 'Enter' && input.value.trim()) {
        const row = document.createElement('li');
        row.className = 'row is-sel';
        row.dataset.id = 'PUN-' + nextId;
        row.innerHTML = '<button class="punch" type="button" aria-label="Punch PUN-' + nextId + '"></button><span class="pri pri-2" title="Medium"></span><span class="id">PUN-' + nextId + '</span><span class="t"></span><span class="tag">new</span><span class="who" title="You">ME</span>';
        row.querySelector('.t').textContent = input.value.trim();
        li.replaceWith(row);
        select(row);
        nextId++; baseTotal++;
        count();
        app.focus({ preventScroll: true });
      }
    });
  }

  app.tabIndex = 0;
  let heroVisible = true;
  new IntersectionObserver(([e]) => { heroVisible = e.isIntersecting; }, { threshold: 0.3 }).observe(app);
  document.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const t = e.target;
    const inApp = app.contains(t);
    const idle = t === document.body || t === document.documentElement;
    if (!(inApp || (idle && heroVisible))) return;
    if (t.matches && t.matches('input, textarea')) return;
    const all = rows();
    const i = all.indexOf(sel());
    const k = e.key.toLowerCase();
    if (k === 'j' || e.key === 'ArrowDown') { select(all[Math.min(all.length - 1, i + 1)]); e.preventDefault(); }
    else if (k === 'k' || e.key === 'ArrowUp') { select(all[Math.max(0, i - 1)]); e.preventDefault(); }
    else if (k === 'x') { punch(sel()); e.preventDefault(); }
    else if (k === 'c') { newIssue(); e.preventDefault(); }
  });

  /* ---------- paste the mess ---------- */
  const input = document.getElementById('paste-input');
  const out = {
    title: document.getElementById('out-title'),
    pri: document.getElementById('out-pri'),
    label: document.getElementById('out-label'),
    who: document.getElementById('out-who'),
    link: document.getElementById('out-link'),
    branch: document.getElementById('out-branch'),
  };
  const PRI = [['Urgent', 4, /\b(urgent|asap|outage|down|500|5xx|on fire|customers? (are )?(emailing|complaining))\b/i], ['High', 3, /\b(soon|blocking|blocker|important|high)\b/i], ['Low', 1, /\b(when you can|someday|nice to have|low|minor|eventually)\b/i]];
  const LABEL = [['bug', /\b(500\w*|error|crash\w*|broken|bug|fail\w*|exception|wrong|doesn.t work)\b/i], ['performance', /\b(slow|latency|timeout|lag)\b/i], ['design', /\b(design|copy|ui|button|layout|colou?r)\b/i], ['feature', /\b(add|support|would be nice|feature|allow)\b/i]];
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function parse(text) {
    const mention = /@([a-z][\w-]*)/i.exec(text);
    const sentry = /sentry\s+([A-Z0-9]+-[A-Z0-9]+)/i.exec(text);
    const gh = /(?:#|pr\s*)(\d{2,6})/i.exec(text);
    let body = text.replace(/@[\w-]+/g, '').replace(/see\s+sentry\s+\S+/i, '').trim();
    let title = body.split(/[.,;!?\n]|\s(?:since|see|because|after)\s/i)[0].trim().replace(/\s+/g, ' ');
    if (title.length > 64) title = title.slice(0, 62).replace(/\s\S*$/, '') + '…';
    title = title ? cap(title) : 'Untitled issue';
    let pri = ['Medium', 2];
    for (const [name, lvl, re] of PRI) if (re.test(text)) { pri = [name, lvl]; break; }
    let label = 'chore';
    for (const [name, re] of LABEL) if (re.test(text)) { label = name; break; }
    const who = mention ? cap(mention[1]) : null;
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').split('-').slice(0, 6).join('-');
    return { title, pri, label, who, link: sentry ? 'Sentry ' + sentry[1].toUpperCase() : gh ? 'GitHub #' + gh[1] : null, branch: (who ? who.toLowerCase() : 'you') + '/pun-231-' + slug };
  }
  function esc(s) { return s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
  let last = '';
  function render() {
    const r = parse(input.value);
    const key = JSON.stringify(r);
    if (key === last) return;
    last = key;
    out.title.textContent = r.title;
    out.pri.innerHTML = '<span class="pri pri-' + r.pri[1] + '"></span>' + r.pri[0];
    out.label.innerHTML = '<span class="tag">' + r.label + '</span>';
    out.who.innerHTML = r.who ? '<span class="who">' + esc(r.who.slice(0, 2).toUpperCase()) + '</span>' + esc(r.who) : '<span class="faint">Unassigned, goes to Triage</span>';
    out.link.innerHTML = r.link ? esc(r.link) : '<span class="faint">None</span>';
    out.branch.textContent = r.branch;
    if (!reduce) { out.title.classList.remove('is-flash'); void out.title.offsetWidth; out.title.classList.add('is-flash'); }
  }
  input.addEventListener('input', render);
  render();

  /* ---------- faq: index with one answer ---------- */
  const qs = [...document.querySelectorAll('#faq-q .q')];
  const answer = document.getElementById('answer');
  const wide = matchMedia('(min-width: 1101px)');
  let current = qs[0], swap;
  function show(q, fromClick) {
    if (q === current && !fromClick) return;
    if (!wide.matches && fromClick && q === current) {
      const open = q.getAttribute('aria-expanded') === 'true';
      q.setAttribute('aria-expanded', String(!open));
      document.getElementById(q.getAttribute('aria-controls')).hidden = open;
      return;
    }
    qs.forEach((x) => {
      const on = x === q;
      x.classList.toggle('is-on', on);
      x.setAttribute('aria-expanded', String(on));
      document.getElementById(x.getAttribute('aria-controls')).hidden = !on;
    });
    current = q;
    const text = document.getElementById(q.getAttribute('aria-controls')).textContent.trim();
    clearTimeout(swap);
    if (reduce) { answer.textContent = text; return; }
    answer.classList.add('is-out');
    swap = setTimeout(() => { answer.textContent = text; answer.classList.remove('is-out'); }, 150);
  }
  qs.forEach((q) => {
    q.addEventListener('click', () => show(q, true));
    q.addEventListener('focus', () => wide.matches && show(q));
    q.addEventListener('mouseenter', () => wide.matches && show(q));
  });

  /* ---------- trial form: opens an email with the address filled in ---------- */
  const form = document.getElementById('signup');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = form.email.value.trim();
    if (!form.email.checkValidity()) { form.email.reportValidity(); return; }
    const subject = encodeURIComponent('Start a 30-day Punchlist trial');
    const body = encodeURIComponent('Please send the sign-in link for a 30-day trial to ' + email + '.\n\nTeam size: \nWhere we track issues today: ');
    location.href = 'mailto:hello@punchlist.app?subject=' + subject + '&body=' + body;
  });

  /* the loop pauses under reduced motion */
  if (reduce) document.querySelectorAll('video').forEach((v) => { v.pause(); v.removeAttribute('autoplay'); });
})();

