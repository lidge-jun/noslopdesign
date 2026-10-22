// Mobile nav
const toggle = document.getElementById('navToggle');
const links = document.getElementById('navLinks');
toggle.addEventListener('click', () => {
  const open = links.classList.toggle('open');
  toggle.setAttribute('aria-expanded', String(open));
});
links.addEventListener('click', e => {
  if (e.target.tagName === 'A') { links.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); }
});

// Command palette demo
const commands = [
  { group: 'Actions', icon: '+', label: 'Create new issue', keys: ['C'], done: 'Created PLT-421 in Cycle 24' },
  { group: 'Actions', icon: '@', label: 'Assign to me', keys: ['A'], done: 'Assigned PLT-412 to you' },
  { group: 'Actions', icon: '!', label: 'Set priority: Urgent', keys: ['P'], done: 'PLT-412 marked Urgent' },
  { group: 'Actions', icon: '↻', label: 'Move to next cycle', keys: ['⇧', 'C'], done: 'Moved PLT-412 to Cycle 25' },
  { group: 'Navigate', icon: '◎', label: 'Go to inbox', keys: ['G', 'I'], done: 'Opened Inbox (3 new)' },
  { group: 'Navigate', icon: '▦', label: 'Go to roadmap', keys: ['G', 'R'], done: 'Opened Roadmap' },
  { group: 'Issues', icon: '#', label: 'PLT-412 Webhook retries drop events', keys: [], done: 'Opened PLT-412' },
  { group: 'Issues', icon: '#', label: 'PLT-398 Move session store to Redis', keys: [], done: 'Opened PLT-398' },
];
const input = document.getElementById('paletteInput');
const list = document.getElementById('paletteList');
const toast = document.getElementById('paletteToast');
let filtered = commands, sel = 0;

function render() {
  const q = input.value.trim().toLowerCase();
  filtered = commands.filter(c => c.label.toLowerCase().includes(q));
  sel = Math.min(sel, Math.max(filtered.length - 1, 0));
  list.replaceChildren();
  if (!filtered.length) {
    const li = document.createElement('li');
    li.className = 'empty';
    li.textContent = 'No matches. Press Enter to create “' + input.value + '”.';
    list.appendChild(li);
    return;
  }
  let lastGroup = '';
  filtered.forEach((c, i) => {
    if (c.group !== lastGroup) {
      const g = document.createElement('li'); g.className = 'grp'; g.textContent = c.group; g.setAttribute('role', 'presentation');
      list.appendChild(g); lastGroup = c.group;
    }
    const li = document.createElement('li');
    li.setAttribute('role', 'option');
    li.setAttribute('aria-selected', String(i === sel));
    if (i === sel) li.className = 'sel';
    li.innerHTML = '<span class="pi">' + c.icon + '</span><span></span><span class="k">' + c.keys.map(k => '<kbd>' + k + '</kbd>').join('') + '</span>';
    li.children[1].textContent = c.label;
    li.addEventListener('mouseenter', () => { sel = i; highlight(); });
    li.addEventListener('click', () => { sel = i; run(); });
    list.appendChild(li);
  });
}
function highlight() {
  list.querySelectorAll('[role=option]').forEach((li, i) => {
    li.classList.toggle('sel', i === sel);
    li.setAttribute('aria-selected', String(i === sel));
  });
}
function run() {
  if (!filtered.length) { toast.textContent = input.value ? '✓ Created issue “' + input.value + '”' : ''; return; }
  toast.textContent = '✓ ' + filtered[sel].done;
}

input.addEventListener('input', () => { sel = 0; render(); });
input.addEventListener('keydown', e => {
  const n = Math.max(filtered.length, 1);
  if (e.key === 'ArrowDown') { e.preventDefault(); sel = (sel + 1) % n; highlight(); }
  else if (e.key === 'ArrowUp') { e.preventDefault(); sel = (sel - 1 + n) % n; highlight(); }
  else if (e.key === 'Enter') { e.preventDefault(); run(); }
  else if (e.key === 'Escape') { input.value = ''; sel = 0; toast.textContent = ''; render(); input.blur(); }
});
document.addEventListener('keydown', e => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    document.getElementById('keyboard').scrollIntoView({ behavior: 'smooth', block: 'center' });
    input.focus({ preventScroll: true });
  }
});
toast.textContent = 'Tip: press ⌘K or Ctrl+K anywhere on this page.';
render();

// Pricing toggle
document.querySelectorAll('.bill').forEach(btn => {
  btn.addEventListener('click', () => {
    const period = btn.dataset.period;
    document.querySelectorAll('.bill').forEach(b => {
      const on = b === btn; b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on));
    });
    document.querySelectorAll('.price b[data-monthly]').forEach(el => { el.textContent = el.dataset[period]; });
  });
});

// Signup (static demo, nothing is sent)
document.getElementById('signup').addEventListener('submit', e => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  document.getElementById('signupMsg').textContent = 'Thanks! We sent a sign-in link to ' + email + '.';
});
