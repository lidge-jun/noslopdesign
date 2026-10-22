(function () {
  document.documentElement.classList.add('js');

  // 요일별 영업시간 (0 = 일요일). null은 휴무.
  var schedule = {
    0: [10, 21], 1: null, 2: [8, 20], 3: [8, 20], 4: [8, 20], 5: [8, 20], 6: [10, 21]
  };
  var dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  function pad(n) { return (n < 10 ? '0' : '') + n; }

  function seoulNow() {
    var parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Seoul', weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23'
    }).formatToParts(new Date());
    function get(t) { var p = parts.find(function (x) { return x.type === t; }); return p ? p.value : ''; }
    var wd = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'));
    return { day: wd, minutes: parseInt(get('hour'), 10) * 60 + parseInt(get('minute'), 10) };
  }

  function nextOpening(day) {
    for (var i = 1; i <= 7; i++) {
      var d = (day + i) % 7;
      if (schedule[d]) return { label: i === 1 ? '내일' : dayNames[d] + '요일', hour: schedule[d][0] };
    }
    return null;
  }

  function render() {
    var now = seoulNow();
    if (now.day < 0) return;

    document.querySelectorAll('.week tr.today').forEach(function (r) { r.classList.remove('today'); });
    var row = document.querySelector('.week tr[data-day="' + now.day + '"]');
    if (row) row.classList.add('today');

    var el = document.getElementById('status');
    var text = el && el.querySelector('.status-text');
    if (!text) return;

    var today = schedule[now.day];
    var state, msg;
    if (today && now.minutes >= today[0] * 60 && now.minutes < today[1] * 60) {
      var left = today[1] * 60 - now.minutes;
      state = left <= 60 ? 'soon' : 'open';
      msg = (state === 'soon' ? '곧 마감 · ' : '지금 영업 중 · ') + '오늘 ' + pad(today[1]) + ':00까지';
    } else if (today && now.minutes < today[0] * 60) {
      state = 'closed';
      msg = '오늘 ' + pad(today[0]) + ':00에 문을 엽니다';
    } else {
      var next = nextOpening(now.day);
      state = 'closed';
      msg = (today ? '오늘 영업은 끝났습니다' : '오늘은 정기 휴무입니다') +
        (next ? ' · ' + next.label + ' ' + pad(next.hour) + ':00에 열어요' : '');
    }
    el.setAttribute('data-state', state);
    text.textContent = msg;
  }

  render();
  setInterval(render, 60 * 1000);

  // 섹션이 화면에 들어올 때 한 번만 부드럽게 드러냄
  var targets = document.querySelectorAll('.section-head, .menu-grid, .week, .loc-grid');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    targets.forEach(function (t) { t.classList.add('reveal'); io.observe(t); });
  }
})();
