(() => {
  const doc = document.documentElement;
  doc.classList.add("js");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Top bar edge appears once content scrolls under it
  const bar = document.querySelector(".topbar");
  const onScroll = () => bar.classList.toggle("is-scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // Ledger filters
  const rows = [...document.querySelectorAll(".rows tbody tr")];
  const filters = [...document.querySelectorAll(".filter")];
  filters.forEach((btn) => {
    btn.addEventListener("click", () => {
      const f = btn.dataset.filter;
      filters.forEach((b) => {
        const on = b === btn;
        b.classList.toggle("is-on", on);
        b.setAttribute("aria-pressed", String(on));
      });
      rows.forEach((r) => { r.hidden = f !== "all" && r.dataset.kind !== f; });
    });
  });

  // Signature motion: each row resolves from "대조 중" to its result
  if (!reduce) {
    const statuses = rows.map((r) => r.querySelector(".status"));
    const saved = statuses.map((s) => ({ html: s.innerHTML, cls: s.className }));
    statuses.forEach((s) => { s.className = "status is-checking"; s.textContent = "대조 중"; });
    statuses.forEach((s, i) => {
      setTimeout(() => { s.className = saved[i].cls; s.innerHTML = saved[i].html; }, 500 + i * 260);
    });
  }

  // Supporting motion: sections rise in once
  const reveals = document.querySelectorAll(".reveal");
  if (reduce || !("IntersectionObserver" in window)) {
    reveals.forEach((el) => el.classList.add("is-in"));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -10% 0px" });
    // Only content that starts below the first screen fades in; nothing above the fold is ever hidden
    reveals.forEach((el) => {
      if (el.getBoundingClientRect().top > window.innerHeight) { el.classList.add("is-below"); io.observe(el); }
    });
  }

  // Step rule fills with scroll progress through the section
  const steps = document.querySelector(".steps");
  if (steps && !reduce) {
    const update = () => {
      const r = steps.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.35)));
      steps.style.setProperty("--progress", p.toFixed(3));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
  }

  // Sign-up form: inline validation and result
  const form = document.querySelector(".signup");
  const input = form.querySelector("input");
  const msg = form.querySelector(".signup__msg");
  const setMsg = (text, kind) => { msg.textContent = text; msg.className = "signup__msg" + (kind ? " is-" + kind : ""); };
  input.addEventListener("input", () => {
    if (input.getAttribute("aria-invalid") === "true" && input.validity.valid) {
      input.removeAttribute("aria-invalid");
      setMsg("", "");
    }
  });
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const v = input.value.trim();
    if (!v) {
      input.setAttribute("aria-invalid", "true");
      setMsg("메일 주소를 입력해주세요.", "error");
      input.focus();
      return;
    }
    if (!input.validity.valid) {
      input.setAttribute("aria-invalid", "true");
      setMsg("메일 주소 형식을 확인해주세요. 예: name@company.co.kr", "error");
      input.focus();
      return;
    }
    input.removeAttribute("aria-invalid");
    setMsg(v + "로 시작 링크를 보냈어요. 메일이 안 보이면 스팸함도 확인해주세요.", "ok");
    form.reset();
  });
})();
