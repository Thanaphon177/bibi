(function () {
  /* =====================================================
     ตั้งค่าคลังวิดีโอ (แก้ได้ตามต้องการ)
     ===================================================== */
  const VIDEOS = {
    folder: "videos/",         // โฟลเดอร์ที่ใส่วิดีโอ
    from: 1,                   // เริ่มที่เลข
    to: Infinity,              // ถึงเลข (Infinity = ไม่จำกัด ไล่ไปเรื่อยๆ จนเลขขาดช่วง)
    pad: 3,                    // เติมศูนย์ข้างหน้า: 3 = 001, 002, ... 099, 100, 101 ... 1000
    ext: ["mp4", "webm", "mov", "m4v", "MP4", "MOV", "WEBM"],   // นามสกุลที่ลองหา
    stopAfterMisses: 15,       // เลขหายติดกันเกินกี่คลิป ให้หยุดหา (ตัวที่ทำให้ไม่ไล่หาไปไม่รู้จบ)
    probeTimeout: 8000         // รอไฟล์แต่ละอันสูงสุดกี่มิลลิวินาที
  };

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const fmtDur = (s) => {
    if (!isFinite(s) || s <= 0) return "";
    const m = Math.floor(s / 60), r = Math.round(s % 60);
    return m + ":" + String(r === 60 ? 59 : r).padStart(2, "0");
  };

  if (typeof OURS !== "undefined") {
    document.getElementById("who").textContent = "คลังวิดีโอของ " + OURS.me + " & " + OURS.her;
  }

  /* ---------- ฉากหลังลอยๆ ---------- */
  const sky = document.getElementById("sky");
  const floaters = [];
  const SYMBOLS = ["💗", "✨", "☁️", "⭐", "🌸", "💕", "🫧", "💖"];
  for (let i = 0; i < 14; i++) {
    const depth = 0.08 + Math.random() * 0.42;
    const el = document.createElement("div");
    el.className = "float";
    const inner = document.createElement("span");
    inner.textContent = pick(SYMBOLS);
    inner.style.fontSize = Math.round(14 + depth * 56) + "px";
    inner.style.opacity = (0.35 + depth * 1.1).toFixed(2);
    inner.style.filter = "blur(" + Math.max(0, (0.3 - depth) * 7).toFixed(1) + "px)";
    inner.style.animationDuration = (5 + Math.random() * 5).toFixed(1) + "s";
    inner.style.animationDelay = (-Math.random() * 6).toFixed(1) + "s";
    el.append(inner);
    sky.append(el);
    floaters.push({ el: el, depth: depth, x: Math.random() * 100, y: Math.random() });
  }
  let ticking = false;
  function layout() {
    ticking = false;
    const H = window.innerHeight + 120, W = window.innerWidth;
    const sc = reduce ? 0 : window.scrollY;
    floaters.forEach((f) => {
      const y = ((((f.y * H) - sc * f.depth) % H) + H) % H - 60;
      f.el.style.transform = "translate3d(" + (f.x / 100 * W).toFixed(0) + "px," + y.toFixed(0) + "px,0)";
    });
  }
  function requestLayout() { if (!ticking) { ticking = true; requestAnimationFrame(layout); } }
  window.addEventListener("scroll", requestLayout, { passive: true });
  window.addEventListener("resize", requestLayout);
  layout();

  /* ---------- หัวใจพุ่ง ---------- */
  function burst(cx, cy, n) {
    if (reduce) return;
    for (let i = 0; i < (n || 8); i++) {
      const s = document.createElement("span");
      s.textContent = pick(["💗", "💕", "✨", "💖", "🌸"]);
      s.style.cssText = "position:fixed;left:" + cx + "px;top:" + cy + "px;font-size:" + (14 + Math.random() * 16) +
        "px;pointer-events:none;z-index:2000;will-change:transform,opacity";
      document.body.append(s);
      const a = Math.random() * Math.PI * 2, d = 50 + Math.random() * 80;
      const dx = Math.cos(a) * d, dy = Math.sin(a) * d - 40;
      s.animate(
        [
          { transform: "translate(-50%,-50%) scale(.4)", opacity: 1 },
          { transform: "translate(calc(-50% + " + dx + "px), calc(-50% + " + dy + "px)) scale(1.15)", opacity: 0 }
        ],
        { duration: 900 + Math.random() * 600, easing: "cubic-bezier(.2,.8,.3,1)" }
      ).onfinish = () => s.remove();
    }
  }

  /* ---------- ตัวเล่นวิดีโอเต็มจอ ---------- */
  const items = [];   // { src, w, h, dur }
  const dlg = document.getElementById("viewer");
  const vVid = document.getElementById("vVid");
  const vCount = document.getElementById("vCount");
  const vNav = document.getElementById("vNav");
  let cur = 0;

  function show(i) {
    cur = (i + items.length) % items.length;
    vVid.src = items[cur].src;
    const p = vVid.play();
    if (p && p.catch) p.catch(() => {});
    vCount.textContent = (cur + 1) + " / " + items.length;
    vNav.hidden = items.length < 2;
  }
  function openAt(i) {
    show(i);
    if (!dlg.open) dlg.showModal();
    document.body.style.overflow = "hidden";
  }
  dlg.addEventListener("close", () => {
    vVid.pause();
    vVid.removeAttribute("src");
    vVid.load();
    document.body.style.overflow = "";
  });
  document.getElementById("vClose").addEventListener("click", () => dlg.close());
  document.getElementById("vPrev").addEventListener("click", () => show(cur - 1));
  document.getElementById("vNext").addEventListener("click", () => show(cur + 1));
  document.getElementById("vWrap").addEventListener("click", (e) => { if (e.target.id === "vWrap") dlg.close(); });
  dlg.addEventListener("keydown", (e) => {
    if (e.target && e.target.tagName === "VIDEO") return;   /* ให้ลูกศรใช้กรอวิดีโอได้ */
    if (e.key === "ArrowLeft") show(cur - 1);
    if (e.key === "ArrowRight") show(cur + 1);
  });
  let sx = null;
  dlg.addEventListener("touchstart", (e) => {
    sx = e.target.closest && e.target.closest("video") ? null : e.touches[0].clientX;
  }, { passive: true });
  dlg.addEventListener("touchend", (e) => {
    if (sx === null) return;
    const dx = e.changedTouches[0].clientX - sx;
    sx = null;
    if (Math.abs(dx) > 60) show(cur + (dx < 0 ? 1 : -1));
  }, { passive: true });

  /* ---------- บอร์ดวิดีโอ ---------- */
  const board = document.getElementById("board");
  const countEl = document.getElementById("count");
  const ROT = [-2.2, 1.6, -1, 2, -1.6, 1.1, -2.6, 1.8];
  const DECO = ["🎬", "💗", "✨", "🌸", "⭐"];

  let io = null;
  if ("IntersectionObserver" in window) {
    io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -4% 0px" });
  }

  function addCard(item) {
    const i = items.length;
    items.push(item);

    const slot = document.createElement("div");
    slot.className = "slot";
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "shot";
    btn.style.setProperty("--rz", ROT[i % ROT.length] + "deg");
    btn.setAttribute("aria-label", "เล่นวิดีโอที่ " + (i + 1));

    const wrap = document.createElement("span");
    wrap.className = "vwrap";
    const vid = document.createElement("video");
    vid.src = item.src + "#t=0.1";
    vid.preload = "metadata";
    vid.muted = true;
    vid.playsInline = true;
    vid.tabIndex = -1;
    vid.width = item.w;
    vid.height = item.h;
    const play = document.createElement("span");
    play.className = "play";
    play.setAttribute("aria-hidden", "true");
    play.textContent = "▶";
    wrap.append(vid, play);
    const d = fmtDur(item.dur);
    if (d) {
      const dur = document.createElement("span");
      dur.className = "dur";
      dur.textContent = d;
      wrap.append(dur);
    }
    btn.append(wrap);

    if (i % 2 === 0) {
      const deco = document.createElement("span");
      deco.className = "deco";
      deco.setAttribute("aria-hidden", "true");
      deco.textContent = DECO[(i / 2) % DECO.length | 0];
      btn.append(deco);
    }

    btn.addEventListener("click", (e) => {
      const r = btn.getBoundingClientRect();
      burst(e.clientX || r.left + r.width / 2, e.clientY || r.top + r.height / 2, 7);
      openAt(i);
    });
    btn.addEventListener("pointermove", (e) => {
      if (e.pointerType !== "mouse" || reduce) return;
      const r = btn.getBoundingClientRect();
      btn.style.setProperty("--ry", (((e.clientX - r.left) / r.width - 0.5) * 10).toFixed(2) + "deg");
      btn.style.setProperty("--rx", ((0.5 - (e.clientY - r.top) / r.height) * 8).toFixed(2) + "deg");
    });
    btn.addEventListener("pointerleave", () => {
      btn.style.setProperty("--ry", "0deg");
      btn.style.setProperty("--rx", "0deg");
    });

    slot.append(btn);
    board.append(slot);
    if (io) io.observe(slot); else slot.classList.add("in");
    countEl.textContent = items.length + " คลิปที่เก็บไว้ด้วยกัน 🎬";
  }

  /* ---------- ไล่หาวิดีโอ 01 → 200 ---------- */
  function tryLoad(src) {
    return new Promise((resolve) => {
      const v = document.createElement("video");
      v.preload = "metadata";
      v.muted = true;
      v.playsInline = true;
      let done = false;
      const finish = (ok) => {
        if (done) return;
        done = true;
        clearTimeout(timer);
        const r = ok ? { src: src, w: v.videoWidth || 16, h: v.videoHeight || 9, dur: v.duration } : null;
        v.removeAttribute("src");
        v.load();
        resolve(r);
      };
      const timer = setTimeout(() => finish(false), VIDEOS.probeTimeout);
      v.addEventListener("loadedmetadata", () => finish(true));
      v.addEventListener("error", () => finish(false));
      v.src = src;
    });
  }

  async function probe(n) {
    const name = VIDEOS.folder + String(n).padStart(VIDEOS.pad, "0");
    for (const ext of VIDEOS.ext) {
      const r = await tryLoad(name + "." + ext);
      if (r) return r;
    }
    return null;
  }

  async function scan() {
    countEl.textContent = "กำลังหาวิดีโอ… 🎬";
    const BATCH = 6;
    let misses = 0;
    for (let n = VIDEOS.from; n <= VIDEOS.to; n += BATCH) {
      const nums = [];
      for (let k = n; k < n + BATCH && k <= VIDEOS.to; k++) nums.push(k);
      const results = await Promise.all(nums.map(probe));
      for (const r of results) {
        if (r) { addCard(r); misses = 0; } else { misses++; }
      }
      if (misses >= VIDEOS.stopAfterMisses) break;
    }
    if (items.length === 0) {
      document.getElementById("empty").hidden = false;
      countEl.hidden = true;
    }
  }
  scan();
})();
