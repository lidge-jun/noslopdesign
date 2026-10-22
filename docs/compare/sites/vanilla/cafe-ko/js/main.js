(function () {
  document.documentElement.classList.add("js");

  // Mobile navigation
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  toggle.addEventListener("click", function () {
    var open = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!open));
    nav.classList.toggle("open", !open);
  });
  nav.addEventListener("click", function (e) {
    if (e.target.tagName === "A") {
      toggle.setAttribute("aria-expanded", "false");
      nav.classList.remove("open");
    }
  });

  // Menu tabs: on small screens one category shows at a time; wider screens show all three.
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.menu-tabs [role="tab"]'));
  var mobile = window.matchMedia("(max-width: 640px)");
  function selectTab(tab) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute("aria-controls")).hidden = mobile.matches && !on;
    });
  }
  tabs.forEach(function (tab, i) {
    tab.addEventListener("click", function () { selectTab(tab); });
    tab.addEventListener("keydown", function (e) {
      var d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (!d) return;
      var next = tabs[(i + d + tabs.length) % tabs.length];
      selectTab(next);
      next.focus();
    });
  });
  function syncTabs() {
    selectTab(tabs.filter(function (t) { return t.getAttribute("aria-selected") === "true"; })[0] || tabs[0]);
  }
  if (mobile.addEventListener) mobile.addEventListener("change", syncTabs);
  else mobile.addListener(syncTabs);
  syncTabs();

  // Opening hours in Korea time. [open, close] in minutes from midnight; null = closed.
  var HOURS = {
    0: [600, 1140], 1: null, 2: [480, 1200], 3: [480, 1200],
    4: [480, 1200], 5: [480, 1260], 6: [600, 1260]
  };
  var DAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"];
  function fmt(m) {
    return String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0");
  }
  function seoulNow() {
    var parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Seoul", weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23"
    }).formatToParts(new Date());
    var get = function (type) { return parts.filter(function (p) { return p.type === type; })[0].value; };
    var day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
    return { day: day, minutes: Number(get("hour")) * 60 + Number(get("minute")) };
  }
  function nextOpening(day, minutes) {
    for (var i = 0; i < 8; i++) {
      var d = (day + i) % 7;
      var h = HOURS[d];
      if (h && (i > 0 || minutes < h[0])) {
        var when = i === 0 ? "오늘" : i === 1 ? "내일" : DAY_NAMES[d] + "요일";
        return when + " " + fmt(h[0]);
      }
    }
    return "";
  }
  function updateStatus() {
    var now = seoulNow();
    var h = HOURS[now.day];
    var el = document.querySelector("[data-open-status]");
    var label = el.querySelector(".status-text");
    var open = !!h && now.minutes >= h[0] && now.minutes < h[1];
    el.classList.toggle("is-open", open);
    el.classList.toggle("is-closed", !open);
    if (open) {
      label.textContent = "지금 영업 중 · " + fmt(h[1]) + "에 닫아요" +
        (now.minutes >= h[1] - 30 ? " (마지막 주문 마감)" : "");
    } else {
      label.textContent = "지금은 문을 닫았어요 · " + nextOpening(now.day, now.minutes) + "에 열어요";
    }
    document.querySelectorAll(".hours-table tr").forEach(function (row) {
      row.classList.toggle("is-today", Number(row.dataset.days) === now.day);
    });
  }
  updateStatus();
  setInterval(updateStatus, 60 * 1000);

  // Copy address
  var toast = document.querySelector(".toast");
  var toastTimer;
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove("show"); }, 1800);
  }
  document.querySelectorAll("[data-copy]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var value = btn.getAttribute("data-copy");
      if (navigator.clipboard) {
        navigator.clipboard.writeText(value).then(
          function () { showToast("주소를 복사했어요"); },
          function () { showToast(value); }
        );
      } else {
        showToast(value);
      }
    });
  });
})();
