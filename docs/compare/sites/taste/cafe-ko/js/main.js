(function () {
  var root = document.documentElement;
  root.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* entrances: each section's parts in turn */
  var groups = document.querySelectorAll('section, .hero-head, .folders, footer');
  groups.forEach(function (g) {
    g.querySelectorAll(':scope .reveal').forEach(function (el, i) { el.style.setProperty('--d', Math.min(i, 8)); });
  });
  var items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('in'); });
  }

  /* is it open right now, in Seoul? */
  var HOURS = { 0: [10, 20], 1: null, 2: [8, 19], 3: [8, 19], 4: [8, 19], 5: [8, 19], 6: [10, 20] };
  var DAY = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
  var WD = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function seoul() {
    var parts = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Seoul', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date());
    var o = {}; parts.forEach(function (p) { o[p.type] = p.value; });
    return { day: WD[o.weekday], min: (+o.hour % 24) * 60 + (+o.minute) };
  }
  function nextOpen(day, afterToday) {
    for (var k = afterToday ? 1 : 0; k < 8; k++) {
      var d = (day + k) % 7;
      if (HOURS[d]) return { k: k, d: d, h: HOURS[d][0] };
    }
  }
  function dur(m) { var h = Math.floor(m / 60), r = m % 60; return (h ? h + '시간 ' : '') + r + '분'; }
  function update() {
    var now = seoul(), h = HOURS[now.day];
    var status, note, big, left;
    if (h && now.min >= h[0] * 60 && now.min < h[1] * 60) {
      var rest = h[1] * 60 - now.min;
      status = '지금 영업 중 · 오늘 ' + h[1] + ':00까지';
      note = '라스트 오더 ' + (h[1] - 1) + ':30. 연무장길 41-1, 성수역 4번 출구에서 걸어서 4분.';
      big = '지금 문을 열었습니다. 서울 시각 ' + pad(Math.floor(now.min / 60)) + ':' + pad(now.min % 60) + '.';
      left = '문 닫기까지 ' + dur(rest) + ' 남았어요.';
    } else {
      var n = (h && now.min < h[0] * 60) ? { k: 0, d: now.day, h: h[0] } : nextOpen(now.day, true);
      var when = n.k === 0 ? '오늘' : (n.k === 1 ? '내일' : DAY[n.d]);
      status = (now.day === 1 ? '월요일은 쉽니다' : (n.k === 0 ? '곧 문을 엽니다' : '오늘 영업은 끝났어요')) + ' · ' + when + ' ' + pad(n.h) + ':00 오픈';
      note = '화–금 08:00–19:00, 토·일 10:00–20:00. 연무장길 41-1, 성수역 4번 출구에서 걸어서 4분.';
      big = '지금은 문을 닫았습니다. 서울 시각 ' + pad(Math.floor(now.min / 60)) + ':' + pad(now.min % 60) + '.';
      left = '다음 영업은 ' + when + ' ' + pad(n.h) + ':00부터예요.';
    }
    var s = document.querySelector('[data-status]'); if (s) s.textContent = status;
    var sn = document.querySelector('[data-status-note]'); if (sn) sn.textContent = note;
    var b = document.querySelector('[data-now]'); if (b) b.textContent = big;
    var l = document.querySelector('[data-left]'); if (l) l.textContent = left;
    document.querySelectorAll('.week tr').forEach(function (tr) {
      var d = +tr.getAttribute('data-day');
      tr.classList.toggle('today', d === now.day);
      tr.classList.toggle('closed', !HOURS[d]);
      var th = tr.querySelector('th');
      th.textContent = DAY[d] + (d === now.day ? ' · 오늘' : '');
    });
  }
  update();
  setInterval(update, 30000);

  /* the neighbourhood frame: one frame, its contents change */
  var frame = document.querySelector('[data-frame]');
  if (frame) {
    var imgs = frame.querySelectorAll('img');
    var btns = document.querySelectorAll('[data-rows] button');
    var cap = document.querySelector('[data-cap]');
    var caps = ['해 질 녘 연무장길 뒤편 주택가 골목', '성수역 출입구, 아침이면 자전거가 먼저 와 있다', '눈 오는 날의 성수동 상점가', '서울숲 입구, 커피가 식기 전에 닿는 거리', '1938년에 그린 나무 구두골. 가게 벽에 걸린 것과 같은 모양이다'];
    var cur = 0, held = false;
    function show(i) {
      cur = (i + imgs.length) % imgs.length;
      imgs.forEach(function (im, k) { im.classList.toggle('on', k === cur); });
      btns.forEach(function (b, k) { b.setAttribute('aria-pressed', k === cur ? 'true' : 'false'); });
      if (cap) cap.textContent = caps[cur];
    }
    btns.forEach(function (b, k) {
      b.addEventListener('mouseenter', function () { held = true; show(k); });
      b.addEventListener('focus', function () { held = true; show(k); });
      b.addEventListener('click', function () { held = true; show(k); });
    });
    var list = document.querySelector('[data-rows]');
    list.addEventListener('mouseleave', function () { held = false; });
    frame.addEventListener('click', function () { held = true; show(cur + 1); });
    if (!reduce) setInterval(function () { if (!held && !document.hidden) show(cur + 1); }, 3000);
  }

  /* the coupon: an e-mail with the visitor's details filled in */
  var form = document.querySelector('[data-coupon]');
  if (form) form.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = form.elements;
    var subject = '단체 예약 문의 · ' + f.date.value + ' · ' + f.count.value + '명';
    var body = '이름: ' + f.name.value + '\n방문 날짜: ' + f.date.value + '\n인원: ' + f.count.value + '\n연락처: ' + f.tel.value + '\n';
    window.location.href = 'mailto:hello@last-seongsu.kr?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  });
})();

