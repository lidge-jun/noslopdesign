(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fmt = (n) => (n < 0 ? '−' : '') + Math.abs(Math.round(n)).toLocaleString('ko-KR');

  // reveal once
  const targets = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
    targets.forEach((el) => io.observe(el));
    addEventListener('load', () => setTimeout(() => targets.forEach((el) => {
      const r = el.getBoundingClientRect(); if (r.top < innerHeight && r.bottom > 0) el.classList.add('is-in');
    }), 2500));
  } else targets.forEach((el) => el.classList.add('is-in'));

  // zigzag cut on the paper edges
  const zig = (el, tooth = 14, depth = 9) => {
    const w = el.offsetWidth; if (!w) return;
    const n = Math.max(6, Math.round(w / tooth)); const pts = ['0 0', '100% 0'];
    for (let i = n; i >= 0; i--) {
      const x = (i / n * 100).toFixed(3) + '%';
      pts.push(x + ' ' + (i % 2 ? 'calc(100% - ' + depth + 'px)' : '100%'));
    }
    el.style.setProperty('--zig', 'polygon(' + pts.join(',') + ')');
  };
  const papers = document.querySelectorAll('.receipt, .slip');
  const cut = () => papers.forEach((p) => zig(p));
  cut(); addEventListener('resize', cut);

  // fit the receipt inside the fixed half
  const pin = document.querySelector('.pin-field');
  const wrap = document.querySelector('.receipt-wrap');
  const receipt = document.getElementById('receipt');
  const fit = () => {
    if (!pin || !wrap) return;
    const phone = innerWidth <= 960;
    const avail = pin.clientHeight - (phone ? 24 : 72);
    const h = receipt.offsetHeight;
    const s = phone ? Math.min(1, Math.max(0.86, avail / h)) : Math.min(1.12, Math.max(0.6, avail / h));
    wrap.style.setProperty('--fit', s.toFixed(3));
  };
  fit(); addEventListener('resize', fit); document.fonts && document.fonts.ready.then(() => { fit(); cut(); });

  // the fixed receipt follows the reading column
  const captions = { all: '망원동 빵집의 10월 21일', diff: '포스와 12,000원 차이', fee: '수수료 129,360원을 항목별로', deposit: '사흘에 걸쳐 들어올 돈', tax: '10월 누적, 월말 파일로' };
  const cap = document.getElementById('pin-caption');
  const setFocus = (k) => {
    if (receipt.dataset.focus === k) return;
    receipt.dataset.focus = k;
    if (!cap) return;
    cap.style.opacity = 0;
    setTimeout(() => { cap.textContent = captions[k] || captions.all; cap.style.opacity = 1; }, reduce ? 0 : 260);
  };
  if ('IntersectionObserver' in window) {
    const fo = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) setFocus(e.target.dataset.focus);
    }, { rootMargin: '-45% 0px -45% 0px' });
    document.querySelectorAll('.read [data-focus]').forEach((el) => fo.observe(el));
  }

  // page height, read by the screenshot script
  addEventListener('load', () => setTimeout(() => { document.documentElement.dataset.h = document.documentElement.scrollHeight; }, 1500));

  // the live thing: type tonight's numbers
  const rates = { card: 0.01728, cash: 0, baemin: 0.15105, coupang: 0.17, yogiyo: 0.16 };
  const names = { card: '카드', cash: '현금', baemin: '배달의민족', coupang: '쿠팡이츠', yogiyo: '요기요' };
  const keys = [[/배민|배달의\s*민족/, 'baemin'], [/쿠팡/, 'coupang'], [/요기요/, 'yogiyo'], [/포스|pos/i, 'pos'], [/카드|신용/, 'card'], [/현금|캐시/, 'cash']];
  const num = (s) => {
    s = s.replace(/,/g, '');
    let total = 0, found = false;
    const man = s.match(/([\d.]+)\s*만/); if (man) { total += parseFloat(man[1]) * 10000; found = true; s = s.replace(man[0], ' '); }
    const ch = s.match(/([\d.]+)\s*천/); if (ch) { total += parseFloat(ch[1]) * 1000; found = true; s = s.replace(ch[0], ' '); }
    const plain = s.match(/\d+(\.\d+)?/); if (plain) { total += parseFloat(plain[0]); found = true; }
    return found ? total : null;
  };
  const note = document.getElementById('note');
  const out = {
    rows: document.getElementById('c-rows'), total: document.getElementById('c-total'), fee: document.getElementById('c-fee'),
    net: document.getElementById('c-net'), diff: document.getElementById('c-diff'), verdict: document.getElementById('c-verdict'),
  };
  const run = () => {
    const sums = {}; let pos = null, skipped = 0;
    for (const raw of note.value.split('\n')) {
      const line = raw.trim(); if (!line) continue;
      const hit = keys.find(([re]) => re.test(line)); const v = num(line);
      if (!hit || v === null) { skipped++; continue; }
      if (hit[1] === 'pos') pos = (pos || 0) + v; else sums[hit[1]] = (sums[hit[1]] || 0) + v;
    }
    const order = ['card', 'cash', 'baemin', 'coupang', 'yogiyo'].filter((k) => sums[k]);
    const total = order.reduce((a, k) => a + sums[k], 0);
    const fee = order.reduce((a, k) => a + Math.round(sums[k] * rates[k] / 10) * 10, 0);
    out.rows.innerHTML = order.map((k) => {
      const pct = total ? (sums[k] / total * 100).toFixed(1) : 0;
      return '<p class="c-row"><span class="c-name">' + names[k] + '</span><span class="c-bar"><i style="width:' + pct + '%"></i></span><span class="c-val">' + fmt(sums[k]) + '</span></p>';
    }).join('') || '<p class="c-row"><span class="c-name">아직 없음</span><span class="c-bar"><i style="width:0"></i></span><span class="c-val">0</span></p>';
    out.total.textContent = fmt(total);
    out.fee.textContent = fee ? fmt(-fee) : '0';
    out.net.textContent = fmt(total - fee);
    let msg, warn = false;
    if (pos === null) { msg = '포스 합계를 한 줄 적으면 차액까지 맞춰 봅니다.'; out.diff.textContent = '—'; }
    else {
      const d = total - pos; out.diff.textContent = d === 0 ? '0' : fmt(d);
      if (d === 0) msg = '포스 기록과 정확히 맞습니다. 오늘 마감은 끝났습니다.';
      else if (d < 0) { warn = true; msg = '포스 기록보다 ' + fmt(-d) + '원 적습니다. 취소된 카드 승인이나 서랍 속 현금부터 확인해 보세요.'; }
      else { warn = true; msg = '포스 기록보다 ' + fmt(d) + '원 많습니다. 포스에 찍지 않은 주문이 있는지 확인해 보세요.'; }
    }
    if (skipped) msg += ' 알아보지 못한 줄 ' + skipped + '개는 건너뛰었습니다.';
    out.verdict.textContent = msg; out.verdict.classList.toggle('warn', warn);
  };
  if (note) { note.addEventListener('input', run); run(); }

  // slow drift on the photographs
  const drifts = [...document.querySelectorAll('[data-drift]')];
  if (!reduce && drifts.length) {
    let ticking = false;
    const tick = () => {
      ticking = false;
      for (const img of drifts) {
        const r = img.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight) continue;
        const p = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
        img.style.transform = 'translate3d(0,' + (p * -7).toFixed(2) + '%,0) scale(1.04)';
      }
    };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(tick); } }, { passive: true });
    tick();
  }
})();

