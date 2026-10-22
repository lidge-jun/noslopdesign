(() => {
  'use strict';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Status and priority glyphs */
  const STATUS = {
    backlog: { label: 'Backlog', svg: '<circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" stroke-width="1.75" stroke-dasharray="2.2 2.2"/>' },
    todo: { label: 'Todo', svg: '<circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" stroke-width="1.75"/>' },
    progress: { label: 'In progress', svg: '<circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" stroke-width="1.75"/><path d="M8 4.5a3.5 3.5 0 0 1 0 7z" fill="currentColor"/>' },
    done: { label: 'Done', svg: '<circle cx="8" cy="8" r="7" fill="currentColor"/><path d="M5 8.2l2 2 4-4.2" fill="none" stroke="#fff" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>' }
  };
  const STATUS_ORDER = ['backlog', 'todo', 'progress', 'done'];
  const GROUP_ORDER = ['progress', 'todo', 'backlog', 'done'];
  const PRIORITY = {
    none: { label: 'No priority', svg: '<path d="M3 8h2M7 8h2M11 8h2" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/>' },
    low: { label: 'Low', svg: bars(1) },
    medium: { label: 'Medium', svg: bars(2) },
    high: { label: 'High', svg: bars(3) },
    urgent: { label: 'Urgent', svg: '<rect x="2" y="2" width="12" height="12" rx="3" fill="currentColor"/><path d="M8 4.8v4" stroke="#fff" stroke-width="1.75" stroke-linecap="round"/><circle cx="8" cy="11.2" r="1" fill="#fff"/>' }
  };
  const PRIORITY_ORDER = ['none', 'low', 'medium', 'high', 'urgent'];
  function bars(n) {
    return [0, 1, 2].map((i) => '<rect x="' + (2.5 + i * 4) + '" y="' + (10 - i * 3) + '" width="2.6" height="' + (4 + i * 3) + '" rx="0.8" fill="currentColor" opacity="' + (i < n ? 1 : 0.25) + '"/>').join('');
  }
  const icon = (inner) => '<svg viewBox="0 0 16 16" aria-hidden="true">' + inner + '</svg>';

  const PEOPLE = {
    MK: { name: 'Mirela Kovač', color: '#2f5d62' },
    TR: { name: 'Tomás Reyes', color: '#7a4a24' },
    PN: { name: 'Priya Nair', color: '#3b4a78' },
    JW: { name: 'Jonah Weiss', color: '#6b3a4a' },
    YOU: { name: 'You', color: '#15171c' }
  };

  let issues = [
    { id: 'CRN-214', title: 'Webhook retries double-charge when Stripe times out', status: 'progress', priority: 'urgent', label: 'Bug', who: 'MK' },
    { id: 'CRN-209', title: 'Move nightly cron jobs off the old worker box', status: 'progress', priority: 'medium', label: 'Infra', who: 'TR' },
    { id: 'CRN-211', title: 'Signup form strips the + from email addresses', status: 'todo', priority: 'high', label: 'Bug', who: 'PN' },
    { id: 'CRN-207', title: 'Flaky test: invoices_export_spec times out on CI', status: 'todo', priority: 'high', label: 'CI', who: 'JW' },
    { id: 'CRN-212', title: 'Add request IDs to API error responses', status: 'todo', priority: 'low', label: 'API', who: 'TR' },
    { id: 'CRN-203', title: 'Billing table fails contrast in dark mode', status: 'backlog', priority: 'low', label: 'UI', who: 'PN' },
    { id: 'CRN-190', title: 'Remove the legacy /v1/reports endpoint', status: 'backlog', priority: 'none', label: 'API', who: 'MK' },
    { id: 'CRN-198', title: 'Upgrade staging to Postgres 16', status: 'done', priority: 'medium', label: 'Infra', who: 'TR' },
    { id: 'CRN-196', title: 'Rate limit password reset emails per account', status: 'done', priority: 'high', label: 'Security', who: 'JW' }
  ];
  let nextNumber = 215;
  let selected = 'CRN-214';
  let filter = 'all';
  let justAdded = null;

  const demo = document.querySelector('[data-demo]');
  if (demo) initDemo();

  function initDemo() {
    const list = demo.querySelector('[data-list]');
    const live = demo.querySelector('[data-live]');
    const progress = demo.querySelector('[data-cycle-progress]');
    const form = demo.querySelector('[data-create]');
    const input = form.querySelector('input');
    const error = demo.querySelector('[data-create-error]');
    const tabs = Array.from(demo.querySelectorAll('[data-filter]'));

    function visible() {
      if (filter === 'active') return issues.filter((i) => i.status === 'todo' || i.status === 'progress');
      if (filter === 'backlog') return issues.filter((i) => i.status === 'backlog');
      return issues;
    }

    function render() {
      const shown = visible();
      if (!shown.some((i) => i.id === selected) && shown.length) selected = shown[0].id;
      let out = '';
      if (!shown.length) {
        out = filter === 'backlog'
          ? '<p class="app__empty"><strong>The backlog is empty.</strong>Press S on an issue to send it back here, or add one with New issue.</p>'
          : '<p class="app__empty"><strong>Nothing active right now.</strong>Pull an issue from the backlog into the cycle to get started.</p>';
      }
      GROUP_ORDER.forEach((st) => {
        const rows = shown.filter((i) => i.status === st);
        if (!rows.length) return;
        out += '<div class="group" role="group" aria-label="' + STATUS[st].label + '">';
        out += '<p class="group__head"><span class="st-' + st + '" style="display:inline-grid;width:14px;height:14px">' + icon(STATUS[st].svg) + '</span>' + STATUS[st].label + '<span class="count">' + rows.length + '</span></p>';
        rows.forEach((i) => {
          const p = PEOPLE[i.who];
          out += '<div class="row' + (i.id === selected ? ' is-selected' : '') + (i.status === 'done' ? ' is-done' : '') + (i.id === justAdded ? ' is-new' : '') + '" data-id="' + i.id + '"' + (i.id === selected ? ' aria-current="true"' : '') + '>' +
            '<button type="button" class="icon-btn pr-' + i.priority + '" data-act="priority" aria-label="' + i.id + ' priority: ' + PRIORITY[i.priority].label + '. Change priority">' + icon(PRIORITY[i.priority].svg) + '</button>' +
            '<span class="row__id">' + i.id + '</span>' +
            '<button type="button" class="icon-btn st-' + i.status + '" data-act="status" aria-label="' + i.id + ' status: ' + STATUS[i.status].label + '. Change status">' + icon(STATUS[i.status].svg) + '</button>' +
            '<span class="row__title">' + escapeHtml(i.title) + '</span>' +
            '<span class="row__label">' + i.label + '</span>' +
            '<span class="avatar" style="background:' + p.color + '" title="' + p.name + '" aria-label="Assigned to ' + p.name + '">' + (i.who === 'YOU' ? 'Me' : i.who) + '</span>' +
            '</div>';
        });
        out += '</div>';
      });
      list.innerHTML = out;
      const closed = issues.filter((i) => i.status === 'done').length;
      progress.textContent = closed + ' of ' + issues.length + ' closed';
      justAdded = null;
    }

    function find(id) { return issues.find((i) => i.id === id); }
    function announce(msg) { live.textContent = msg; }

    function cycleStatus(id) {
      const i = find(id); if (!i) return;
      i.status = STATUS_ORDER[(STATUS_ORDER.indexOf(i.status) + 1) % STATUS_ORDER.length];
      selected = id; render();
      announce(id + ' moved to ' + STATUS[i.status].label);
    }
    function cyclePriority(id) {
      const i = find(id); if (!i) return;
      i.priority = PRIORITY_ORDER[(PRIORITY_ORDER.indexOf(i.priority) + 1) % PRIORITY_ORDER.length];
      selected = id; render();
      announce(id + ' priority set to ' + PRIORITY[i.priority].label);
    }
    function move(delta) {
      const ids = Array.from(list.querySelectorAll('.row')).map((r) => r.dataset.id);
      if (!ids.length) return;
      const at = Math.max(0, ids.indexOf(selected));
      selected = ids[Math.min(ids.length - 1, Math.max(0, at + delta))];
      render();
      const row = list.querySelector('.is-selected');
      if (row) announce(selected + ', ' + find(selected).title);
    }
    function openCreate() {
      form.hidden = false; error.hidden = true; input.removeAttribute('aria-invalid');
      input.value = ''; input.focus();
    }
    function closeCreate() { form.hidden = true; demo.focus({ preventScroll: true }); }

    list.addEventListener('click', (e) => {
      const row = e.target.closest('.row'); if (!row) return;
      const act = e.target.closest('[data-act]');
      if (act && act.dataset.act === 'status') return cycleStatus(row.dataset.id);
      if (act && act.dataset.act === 'priority') return cyclePriority(row.dataset.id);
      selected = row.dataset.id; render();
    });

    demo.addEventListener('keydown', (e) => {
      if (e.target === input) {
        if (e.key === 'Escape') { e.preventDefault(); closeCreate(); }
        else if (e.key === 'Enter') { e.preventDefault(); form.requestSubmit(); }
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const k = e.key.toLowerCase();
      if (k === 'j' || e.key === 'ArrowDown') { e.preventDefault(); move(1); }
      else if (k === 'k' || e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
      else if (k === 's') { e.preventDefault(); cycleStatus(selected); }
      else if (k === 'p') { e.preventDefault(); cyclePriority(selected); }
      else if (k === 'c') { e.preventDefault(); openCreate(); }
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = input.value.trim();
      if (!title) { error.hidden = false; input.setAttribute('aria-invalid', 'true'); input.focus(); return; }
      const id = 'CRN-' + nextNumber++;
      issues.unshift({ id, title, status: 'todo', priority: 'none', label: 'Triage', who: 'YOU' });
      selected = id; justAdded = id;
      if (filter === 'backlog') setFilter('all');
      form.hidden = true; render(); demo.focus({ preventScroll: true });
      announce(id + ' created in Todo');
    });
    demo.querySelector('[data-new]').addEventListener('click', openCreate);

    function setFilter(f) {
      filter = f;
      tabs.forEach((t) => t.setAttribute('aria-selected', String(t.dataset.filter === f)));
      render();
    }
    tabs.forEach((t) => t.addEventListener('click', () => setFilter(t.dataset.filter)));

    render();
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  /* Scroll moments: week rows reveal, burndown draws, commit closes CRN-214 */
  const gitBox = document.querySelector('[data-git]');
  const gitIcon = document.querySelector('[data-git-icon]');
  const gitState = document.querySelector('[data-git-state]');
  const gitEvent = document.querySelector('[data-git-event]');
  function setGit(done) {
    if (!gitIcon) return;
    const st = done ? 'done' : 'progress';
    gitIcon.className = 'status-icon st-' + st;
    gitIcon.innerHTML = icon(STATUS[st].svg);
    gitState.textContent = STATUS[st].label;
    gitState.classList.toggle('is-done', done);
    gitEvent.classList.toggle('is-pending', !done);
  }

  if (reduceMotion || !('IntersectionObserver' in window)) {
    setGit(true);
  } else {
    setGit(false);
    document.querySelectorAll('.chart__actual').forEach((p) => {
      p.style.setProperty('--len', String(Math.ceil(p.getTotalLength())));
      p.classList.add('is-drawable');
    });
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        if (en.target === gitBox) setTimeout(() => setGit(true), 900);
        else en.target.classList.add('is-in');
        io.unobserve(en.target);
      });
    }, { threshold: 0.35 });
    document.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el));
    if (gitBox) io.observe(gitBox);
  }

  /* Nav: border once scrolled, CTA appears after the hero CTA leaves view */
  const nav = document.querySelector('.nav');
  const navCta = document.querySelector('[data-nav-cta]');
  const heroCta = document.querySelector('.hero__actions .btn');
  if (nav) {
    const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  }
  if (navCta && heroCta && 'IntersectionObserver' in window) {
    navCta.classList.add('is-hidden'); navCta.setAttribute('tabindex', '-1');
    new IntersectionObserver(([en]) => {
      navCta.classList.toggle('is-hidden', en.isIntersecting);
      if (en.isIntersecting) navCta.setAttribute('tabindex', '-1'); else navCta.removeAttribute('tabindex');
    }).observe(heroCta);
  }

  /* Signup */
  const signup = document.querySelector('[data-signup]');
  if (signup) {
    const email = signup.querySelector('input');
    const msg = signup.querySelector('[data-signup-msg]');
    signup.addEventListener('submit', (e) => {
      e.preventDefault();
      const v = email.value.trim();
      msg.classList.remove('is-error', 'is-ok');
      if (!v) return fail('Enter your work email to create a workspace.');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return fail('That address looks incomplete. Check for a typo after the @.');
      email.removeAttribute('aria-invalid');
      msg.classList.add('is-ok');
      msg.textContent = 'Check ' + v + ' for a sign-in link. It expires in 30 minutes.';
    });
    function fail(text) { email.setAttribute('aria-invalid', 'true'); msg.classList.add('is-error'); msg.textContent = text; email.focus(); }
  }
})();
