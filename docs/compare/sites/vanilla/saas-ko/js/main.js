document.documentElement.classList.add('js');

// Sticky nav border
const nav = document.querySelector('.nav');
const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 8);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

// Mobile menu
const toggle = document.querySelector('.nav__toggle');
const mobile = document.querySelector('.nav__mobile');
toggle.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') === 'true';
  toggle.setAttribute('aria-expanded', String(!open));
  toggle.setAttribute('aria-label', open ? '메뉴 열기' : '메뉴 닫기');
  mobile.hidden = open;
});
mobile.addEventListener('click', (e) => {
  if (e.target.closest('a')) { mobile.hidden = true; toggle.setAttribute('aria-expanded', 'false'); }
});

// Reveal on scroll (staggered within each parent)
const reveals = document.querySelectorAll('.reveal');
const groups = new Map();
reveals.forEach((el) => {
  const i = groups.get(el.parentElement) || 0;
  el.style.setProperty('--d', Math.min(i * 0.08, 0.4) + 's');
  groups.set(el.parentElement, i + 1);
});
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
reveals.forEach((el) => io.observe(el));

// Count-up stats
const fmt = (n, dec) => n.toLocaleString('ko-KR', { minimumFractionDigits: dec, maximumFractionDigits: dec });
const countIO = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (!e.isIntersecting) return;
    const el = e.target; countIO.unobserve(el);
    const target = parseFloat(el.dataset.count);
    const dec = (el.dataset.count.split('.')[1] || '').length;
    const suffix = el.dataset.suffix || '';
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const start = performance.now(), dur = 1400;
    const tick = (t) => {
      const p = Math.min((t - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(target * eased, dec) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}, { threshold: 0.5 });
document.querySelectorAll('[data-count]').forEach((el) => countIO.observe(el));

// Pricing toggle
document.querySelectorAll('.toggle button').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.toggle button').forEach((b) => b.classList.toggle('on', b === btn));
    const cycle = btn.dataset.cycle;
    document.querySelectorAll('[data-monthly]').forEach((el) => { el.textContent = el.dataset[cycle]; });
  });
});

// Card spotlight follows cursor
document.querySelectorAll('.card').forEach((card) => {
  card.addEventListener('pointermove', (e) => {
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    card.style.setProperty('--my', (e.clientY - r.top) + 'px');
  });
});

// Typing effect in AI builder prompt
// Draw connector wires between workflow nodes from their real positions
const canvas = document.querySelector('.canvas');
const drawWires = () => {
  const svg = canvas.querySelector('.wires');
  svg.querySelectorAll('path').forEach((p) => p.remove());
  if (getComputedStyle(svg).display === 'none') return;
  const c = canvas.getBoundingClientRect();
  const box = (sel) => {
    const r = canvas.querySelector(sel).getBoundingClientRect();
    return { l: r.left - c.left, r: r.right - c.left, y: r.top - c.top + r.height / 2 };
  };
  const [n1, n2, n3, n4] = ['.n1', '.n2', '.n3', '.n4'].map(box);
  svg.setAttribute('viewBox', '0 0 ' + c.width + ' ' + c.height);
  const curve = (a, ay, b, by) => {
    const mx = (a + b) / 2;
    const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p.setAttribute('d', 'M' + a + ' ' + ay + ' C ' + mx + ' ' + ay + ', ' + mx + ' ' + by + ', ' + b + ' ' + by);
    svg.appendChild(p);
  };
  curve(n1.r, n1.y, n2.l, n2.y);
  curve(n1.r, n1.y, n3.l, n3.y);
  curve(n2.r, n2.y, n4.l, n4.y);
  curve(n3.r, n3.y, n4.l, n4.y);
};
if (canvas) {
  drawWires();
  new ResizeObserver(drawWires).observe(canvas);
  document.fonts && document.fonts.ready.then(drawWires);
}

const typed = document.querySelector('.typed');
if (typed && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const full = typed.dataset.text;
  const typeIO = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return;
    typeIO.disconnect();
    let i = 0; typed.textContent = '';
    const step = () => { typed.textContent = full.slice(0, ++i); if (i < full.length) setTimeout(step, 45); };
    step();
  }, { threshold: 0.6 });
  typeIO.observe(typed);
}

