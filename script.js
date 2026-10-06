const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const TINTS = ["tint-a", "tint-b", "tint-c", "tint-d"];
const MONTHS = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
const start = new Date(OURS.dating);       // วันที่คบกัน
const talkStart = new Date(OURS.talking); // วันที่เริ่มคุยกัน
const dayMs = 86400000;
const fmtDate = (iso) =>
  new Date(iso + "T00:00:00+07:00").toLocaleDateString("th-TH", { day: "numeric", month: "long", year: "numeric" });
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

/* ---------- names ---------- */
const namesEl = document.getElementById("names");
const amp = document.createElement("span");
amp.className = "amp";
amp.textContent = "&";
namesEl.append(OURS.me, amp, OURS.her);
document.title = "ความทรงจำของ " + OURS.me + " & " + OURS.her;

/* ---------- floating background (depth layers) ---------- */
const sky = document.getElementById("sky");
const floaters = [];
const SYMBOLS = ["💗", "✨", "☁️", "⭐", "🌸", "💕", "🫧", "💖"];
for (let i = 0; i < 16; i++) {
  const depth = 0.08 + Math.random() * 0.42;            // 0.08 = far, 0.5 = near
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
  floaters.push({ el, depth, x: Math.random() * 100, y: Math.random() });
}
let ticking = false;
function layoutFloaters() {
  ticking = false;
  const H = window.innerHeight + 120;
  const W = window.innerWidth;
  const sc = reduce ? 0 : window.scrollY;
  floaters.forEach((f) => {
    const y = ((((f.y * H) - sc * f.depth) % H) + H) % H - 60;
    f.el.style.transform = "translate3d(" + (f.x / 100 * W).toFixed(0) + "px," + y.toFixed(0) + "px,0)";
  });
}
function requestLayout() { if (!ticking) { ticking = true; requestAnimationFrame(layoutFloaters); } }
window.addEventListener("scroll", requestLayout, { passive: true });
window.addEventListener("resize", requestLayout);
layoutFloaters();

/* ---------- heart burst ---------- */
function burst(cx, cy, n) {
  if (reduce) return;
  n = n || 9;
  for (let i = 0; i < n; i++) {
    const s = document.createElement("span");
    s.textContent = pick(["💗", "💕", "✨", "💖", "🌸"]);
    s.style.cssText = "position:fixed;left:" + cx + "px;top:" + cy + "px;font-size:" + (14 + Math.random() * 16) +
      "px;pointer-events:none;z-index:50;will-change:transform,opacity";
    document.body.append(s);
    const a = Math.random() * Math.PI * 2;
    const d = 50 + Math.random() * 80;
    const dx = Math.cos(a) * d, dy = Math.sin(a) * d - 40;
    const anim = s.animate(
      [
        { transform: "translate(-50%,-50%) scale(.4)", opacity: 1 },
        { transform: "translate(calc(-50% + " + dx + "px), calc(-50% + " + dy + "px)) scale(1.15)", opacity: 0 }
      ],
      { duration: 900 + Math.random() * 600, easing: "cubic-bezier(.2,.8,.3,1)" }
    );
    anim.onfinish = () => s.remove();
  }
}
document.getElementById("heart").addEventListener("click", (e) => {
  const r = e.currentTarget.getBoundingClientRect();
  burst(r.left + r.width / 2, r.top + r.height / 2, 14);
});

/* ---------- timeline ---------- */
const list = document.getElementById("timeline");
MEMORIES.forEach((m, i) => {
  const li = document.createElement("li");
  const art = document.createElement("article");
  art.className = "memory";

  const mDate = new Date(m.date + "T00:00:00+07:00");
  const sticker = document.createElement("div");
  sticker.className = "sticker";
  sticker.setAttribute("aria-hidden", "true");
  if (mDate < start) {
    /* ก่อนวันคบกัน = ช่วงคุยกัน */
    sticker.classList.add("pre");
    const em = document.createElement("b");
    em.textContent = "💬";
    sticker.append(em);
  } else {
    const dayNo = Math.floor((mDate - start) / dayMs) + 1;
    const sm = document.createElement("small");
    sm.textContent = "วันที่";
    const sb = document.createElement("b");
    sb.textContent = dayNo;
    sticker.append(sm, sb);
  }

  const btn = document.createElement("button");
  btn.className = "memory-btn";
  btn.type = "button";
  btn.setAttribute("aria-expanded", "false");
  btn.setAttribute("aria-controls", "story-" + i);

  const photo = document.createElement("span");
  photo.className = "photo " + TINTS[i % TINTS.length];
  if (m.photo) {
    photo.classList.add("has-img");
    const img = document.createElement("img");
    img.src = m.photo;
    img.alt = m.title;
    photo.append(img);
  } else {
    const emo = document.createElement("span");
    emo.className = "emo";
    emo.textContent = m.emoji || "💕";
    photo.append(emo);
  }

  const cap = document.createElement("span");
  cap.className = "cap";
  const d = document.createElement("span");
  d.className = "date";
  d.textContent = fmtDate(m.date);
  const t = document.createElement("span");
  t.className = "title";
  t.textContent = m.title;
  const chev = document.createElement("span");
  chev.className = "chev";
  chev.setAttribute("aria-hidden", "true");
  cap.append(d, t, chev);
  btn.append(photo, cap);

  const story = document.createElement("div");
  story.className = "story";
  story.id = "story-" + i;
  const inner = document.createElement("div");
  const p = document.createElement("p");
  p.textContent = m.story;
  inner.append(p);
  story.append(inner);

  btn.addEventListener("click", () => {
    const open = art.classList.toggle("open");
    btn.setAttribute("aria-expanded", String(open));
    if (open) {
      const r = btn.getBoundingClientRect();
      burst(r.left + r.width / 2, r.top + r.height / 3, 8);
    }
  });

  /* mouse-only 3D tilt */
  art.addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse" || reduce) return;
    const r = art.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    art.style.setProperty("--ry", (px * 9).toFixed(2) + "deg");
    art.style.setProperty("--rx", (-py * 7).toFixed(2) + "deg");
  });
  art.addEventListener("pointerleave", () => {
    art.style.setProperty("--ry", "0deg");
    art.style.setProperty("--rx", "0deg");
  });

  art.append(sticker, btn, story);
  li.append(art);
  list.append(li);
});

/* entrance: cards settle in as they scroll into view */
const items = list.querySelectorAll("li");
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
  items.forEach((li) => io.observe(li));
} else {
  items.forEach((li) => li.classList.add("in"));
}

/* ---------- letter ---------- */
const letter = document.getElementById("letter");
const letterBtn = document.getElementById("letterBtn");
const letterText = document.getElementById("letterText");
OURS.letter.forEach((line) => {
  const p = document.createElement("p");
  p.textContent = line;
  letterText.append(p);
});
document.getElementById("sign").textContent = OURS.sign;
letterBtn.addEventListener("click", () => {
  const open = letter.classList.toggle("open");
  letterBtn.setAttribute("aria-expanded", String(open));
  if (open) {
    const r = letterBtn.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top, 12);
    setTimeout(() => letterBtn.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" }), 60);
  }
});

/* ---------- live counter + monthly anniversary ---------- */
const daysEl = document.getElementById("days");
const hhEl = document.getElementById("hh");
const mmEl = document.getElementById("mm");
const ssEl = document.getElementById("ss");
const annivEl = document.getElementById("anniv");
const talkEl = document.getElementById("talk");
const two = (n) => String(n).padStart(2, "0");

function nextMonthly(now) {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let n = 1, dt;
  do {
    dt = new Date(start.getFullYear(), start.getMonth() + n, start.getDate());
    if (dt >= today) break;
    n++;
  } while (n < 2000);
  return { n, left: Math.round((dt - today) / dayMs) };
}
function label(n) {
  return n % 12 === 0 ? (n / 12) + " ปี" : n + " เดือน";
}

function tick() {
  const now = new Date();
  const s = Math.max(0, Math.floor((now - start) / 1000));
  daysEl.textContent = Math.floor(s / 86400).toLocaleString("th-TH");
  hhEl.textContent = two(Math.floor((s % 86400) / 3600));
  mmEl.textContent = two(Math.floor((s % 3600) / 60));
  ssEl.textContent = two(s % 60);
  const a = nextMonthly(now);
  annivEl.textContent = a.left === 0
    ? "วันนี้ครบ " + label(a.n) + " ของเราแล้ว 🎉"
    : "อีก " + a.left + " วันจะครบ " + label(a.n) + " ของเรา 🎀";
  const talkDays = Math.max(0, Math.floor((now - talkStart) / dayMs));
  talkEl.textContent = "เริ่มคุยกันตั้งแต่ " +
    talkStart.toLocaleDateString("th-TH", { day: "numeric", month: "long", year: "numeric" }) +
    " (" + talkDays + " วันแล้ว)";
}
tick();
setInterval(tick, 1000);