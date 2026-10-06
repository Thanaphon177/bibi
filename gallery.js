(function () {
  /* =====================================================
     ตั้งค่าอัลบั้ม (แก้ได้ตามต้องการ)
     ===================================================== */
  const ALBUM = {
    folder: "album/",          // โฟลเดอร์ที่ใส่รูป
    from: 1,                   // เริ่มที่เลข
    to: Infinity,              // ถึงเลข (Infinity = ไม่จำกัด ไล่ไปเรื่อยๆ จนเลขขาดช่วง)
    pad: 2,                    // เติมศูนย์ข้างหน้า: 2 = 01, 02, ... 99, 100, 101 ... (เลข 3 หลักขึ้นไปใช้ตามปกติ)
    ext: ["jpg", "jpeg", "png", "webp", "JPG", "JPEG", "PNG"],   // นามสกุลที่ลองหา
    stopAfterMisses: 15        // ถ้าเลขหายไปติดกันเกินกี่รูป ให้หยุดหา (ตัวที่ทำให้ไม่ไล่หาไปไม่รู้จบ)
  };

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  /* ---------- ชื่อ ---------- */
  if (typeof OURS !== "undefined") {
    document.getElementById("who").textContent = "อัลบั้มของ " + OURS.me + " & " + OURS.her;
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

  /* ---------- ตัวดูรูปเต็มจอ ---------- */
  const items = [];   // { src, w, h }
  const dlg = document.getElementById("viewer");
  const vImg = document.getElementById("vImg");
  const vCount = document.getElementById("vCount");
  const vNav = document.getElementById("vNav");
  let cur = 0;

  function show(i) {
    cur = (i + items.length) % items.length;
    vImg.src = items[cur].src;
    vImg.alt = "รูปที่ " + (cur + 1);
    vCount.textContent = (cur + 1) + " / " + items.length;
    [cur + 1, cur - 1].forEach((j) => { new Image().src = items[(j + items.length) % items.length].src; });
    vNav.hidden = items.length < 2;
  }
  function openAt(i) {
    show(i);
    if (!dlg.open) dlg.showModal();
    document.body.style.overflow = "hidden";
  }
  dlg.addEventListener("close", () => { document.body.style.overflow = ""; });
  document.getElementById("vClose").addEventListener("click", () => dlg.close());
  document.getElementById("vPrev").addEventListener("click", () => show(cur - 1));
  document.getElementById("vNext").addEventListener("click", () => show(cur + 1));
  document.getElementById("vWrap").addEventListener("click", (e) => { if (e.target.id === "vWrap") dlg.close(); });
  dlg.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") show(cur - 1);
    if (e.key === "ArrowRight") show(cur + 1);
  });
  let sx = null;
  dlg.addEventListener("touchstart", (e) => { sx = e.touches[0].clientX; }, { passive: true });
  dlg.addEventListener("touchend", (e) => {
    if (sx === null) return;
    const dx = e.changedTouches[0].clientX - sx;
    sx = null;
    if (Math.abs(dx) > 50) show(cur + (dx < 0 ? 1 : -1));
  }, { passive: true });

  /* ---------- บอร์ดรูป ---------- */
  const board = document.getElementById("board");
  const countEl = document.getElementById("count");
  const ROT = [-2.2, 1.6, -1, 2, -1.6, 1.1, -2.6, 1.8];
  const DECO = ["💗", "✨", "🌸", "⭐", "💕"];

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
    btn.setAttribute("aria-label", "เปิดรูปที่ " + (i + 1));

    const img = document.createElement("img");
    img.src = item.src;
    img.alt = "รูปที่ " + (i + 1);
    img.width = item.w;
    img.height = item.h;
    img.decoding = "async";
    btn.append(img);

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
    countEl.textContent = items.length + " รูปที่เก็บไว้ด้วยกัน 📸";
  }

  /* ---------- ไล่หารูป 01 → 200 ---------- */
  function probe(n) {
    const name = ALBUM.folder + String(n).padStart(ALBUM.pad, "0");
    return new Promise((resolve) => {
      let k = 0;
      (function next() {
        if (k >= ALBUM.ext.length) return resolve(null);
        const src = name + "." + ALBUM.ext[k++];
        const im = new Image();
        im.onload = () => resolve({ src: src, w: im.naturalWidth, h: im.naturalHeight });
        im.onerror = next;
        im.src = src;
      })();
    });
  }

  async function scan() {
    countEl.textContent = "กำลังหารูป… 📸";
    const BATCH = 8;
    let misses = 0;
    for (let n = ALBUM.from; n <= ALBUM.to; n += BATCH) {
      const nums = [];
      for (let k = n; k < n + BATCH && k <= ALBUM.to; k++) nums.push(k);
      const results = await Promise.all(nums.map(probe));
      for (const r of results) {
        if (r) { addCard(r); misses = 0; } else { misses++; }
      }
      if (misses >= ALBUM.stopAfterMisses) break;
    }
    if (items.length === 0) {
      document.getElementById("empty").hidden = false;
      countEl.hidden = true;
    }
  }
  scan();
})();
