/* =====================================================
 * IVOIncubator 试玩 Demo 逻辑
 * 依赖 data.js;URL: play.html?id=<gameId>
 * 通用三车道躲避玩法(demo: "dodge"),配色取自该游戏 PALETTE
 * ===================================================== */

/* ---------- i18n ---------- */
const PLAY_I18N = {
  zh: {
    navBack: "返回详情", playDemo: "试玩 Demo",
    scoreLabel: "得分", bestLabel: "最高分",
    startBtn: "开始游戏", retryBtn: "再来一次",
    backBtn: "返回详情页",
    gameOver: "游戏结束", newRecord: "新纪录!",
    hintTouch: "点击左右半屏移动飞船,躲开障碍",
    hintKeys: "← → 或 A/D 移动飞船,躲开障碍",
    paused: "已暂停", resumeBtn: "继续",
  },
  en: {
    navBack: "Back", playDemo: "Play Demo",
    scoreLabel: "Score", bestLabel: "Best",
    startBtn: "Start", retryBtn: "Retry",
    backBtn: "Back to game",
    gameOver: "Game Over", newRecord: "New Record!",
    hintTouch: "Tap left / right half to steer, dodge the blocks",
    hintKeys: "← → or A/D to steer, dodge the blocks",
    paused: "Paused", resumeBtn: "Resume",
  },
};
let LANG = "zh";
try { LANG = localStorage.getItem("ivo-lang") || "zh"; } catch (_) {}
const t = (k) => PLAY_I18N[LANG][k] || k;

/* ---------- 定位游戏(无 demo 字段时回退到第一款可试玩游戏) ---------- */
const DEMOS = GAMES.filter((g) => g.demo === "dodge");
const gid = new URLSearchParams(location.search).get("id");
const game = DEMOS.find((g) => g.id === gid) || DEMOS[0] || GAMES[0];
if (game.id !== gid) {
  try { history.replaceState(null, "", "play.html?id=" + game.id); } catch (_) {}
}
const P = PALETTES[PALETTE_BY_GAME[game.id] || "cyber"];

/* ---------- 静态渲染 ---------- */
function renderStatic() {
  document.documentElement.dataset.lang = LANG;
  document.documentElement.lang = LANG === "zh" ? "zh-CN" : "en";
  document.querySelectorAll("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
  document.title = `${game.title[LANG]} · ${t("playDemo")} - IVOIncubator`;
  document.getElementById("playTitle").textContent = `${game.title[LANG]} · ${t("playDemo")}`;
  document.getElementById("playSub").textContent = game.tagline[LANG];
  document.getElementById("backLink").href = "game.html?id=" + game.id;
  document.getElementById("ovBack").href = "game.html?id=" + game.id;
  document.getElementById("exitLink").href = "game.html?id=" + game.id;
  document.getElementById("playHint").textContent =
    (matchMedia("(pointer: coarse)").matches ? t("hintTouch") : t("hintKeys"));
}
renderStatic();

/* ---------- 画布与状态 ---------- */
const cv = document.getElementById("gameCanvas");
const ctx = cv.getContext("2d");
const W = cv.width, H = cv.height;
const LANES = [40, 120, 200];
const PW = 16, PH = 14, PY = 284;

let mode = "start";           // start | run | over | paused
let lane = 1, laneX = LANES[1];
let obstacles = [];
let stars = Array.from({ length: 26 }, () => ({
  x: Math.floor(Math.random() * W),
  y: Math.floor(Math.random() * H),
}));
let speed = 2, spawnIn = 40, score = 0, newRecord = false, frame = 0, scroll = 0;
const hsKey = "ivo-demo-hs-" + game.id;
let best = 0;
try { best = parseInt(localStorage.getItem(hsKey) || "0", 10) || 0; } catch (_) {}
document.getElementById("bestVal").textContent = best;

/* ---------- 弹层 ---------- */
const overlay = document.getElementById("overlay");
function refreshOverlay() {
  const ovTitle = document.getElementById("ovTitle");
  const ovText = document.getElementById("ovText");
  const ovAction = document.getElementById("ovAction");
  if (mode === "start") {
    ovTitle.textContent = t("playDemo");
    ovText.textContent = matchMedia("(pointer: coarse)").matches ? t("hintTouch") : t("hintKeys");
    ovAction.textContent = t("startBtn");
  } else if (mode === "over") {
    ovTitle.textContent = t("gameOver");
    ovText.textContent = `${t("scoreLabel")} ${score}` + (newRecord ? ` · ${t("newRecord")}` : "");
    ovAction.textContent = t("retryBtn");
  } else if (mode === "paused") {
    ovTitle.textContent = t("paused");
    ovText.textContent = "";
    ovAction.textContent = t("resumeBtn");
  }
  overlay.classList.toggle("show", mode !== "run");
}
function primaryAction() {
  if (mode === "start" || mode === "over") begin();
  else if (mode === "paused") { mode = "run"; refreshOverlay(); }
}
document.getElementById("ovAction").addEventListener("click", primaryAction);

/* ---------- 游戏流程 ---------- */
function begin() {
  lane = 1; laneX = LANES[1];
  obstacles = [];
  speed = 2; spawnIn = 40; score = 0; newRecord = false; frame = 0;
  document.getElementById("scoreVal").textContent = "0";
  mode = "run";
  refreshOverlay();
}

function gameOver() {
  mode = "over";
  if (score > best) {
    best = score; newRecord = true;
    try { localStorage.setItem(hsKey, String(best)); } catch (_) {}
    document.getElementById("bestVal").textContent = best;
  }
  refreshOverlay();
}

/* ---------- 更新 ---------- */
function update(dt) {
  frame++;
  scroll = (scroll + speed * dt) % 12;
  laneX += (LANES[lane] - laneX) * Math.min(1, 0.35 * dt);
  speed = 2 + Math.min(3.2, score * 0.06);
  // 星空视差
  for (const s of stars) {
    s.y += speed * 0.45 * dt;
    if (s.y > H) { s.y = -2; s.x = Math.floor(Math.random() * W); }
  }
  // 生成障碍
  spawnIn -= dt;
  if (spawnIn <= 0) {
    spawnIn = Math.max(20, 42 - score * 0.5);
    let l = Math.floor(Math.random() * 3);
    const last = obstacles.length ? obstacles[obstacles.length - 1].lane : -1;
    if (l === last && Math.random() < 0.6) l = (l + 1 + Math.floor(Math.random() * 2)) % 3;
    obstacles.push({ lane: l, y: -18, w: 58 + Math.floor(Math.random() * 8), h: 14, passed: false });
  }
  // 移动 / 计分 / 碰撞
  const px = laneX - PW / 2 + 2;
  for (const ob of obstacles) {
    ob.y += speed * dt;
    if (!ob.passed && ob.y > PY + PH) {
      ob.passed = true;
      score++;
      document.getElementById("scoreVal").textContent = score;
    }
    const ox = LANES[ob.lane] - ob.w / 2 + 2;
    if (px + PW - 4 > ox && px + 4 < ox + ob.w - 4 &&
        PY + 4 < ob.y + ob.h && PY + PH > ob.y + 4) {
      gameOver();
      return;
    }
  }
  obstacles = obstacles.filter((ob) => ob.y < H + 20);
}

/* ---------- 绘制 ---------- */
function draw() {
  ctx.fillStyle = P.sky[0];
  ctx.fillRect(0, 0, W, H);
  // 星空
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  for (const s of stars) ctx.fillRect(s.x, Math.floor(s.y), 1, 1);
  // 车道虚线(滚动)
  ctx.fillStyle = P.hills[0];
  for (const dx of [80, 160]) {
    for (let y = -12 + scroll; y < H; y += 12) ctx.fillRect(dx, Math.floor(y), 2, 6);
  }
  // 路缘
  ctx.fillStyle = P.hills[1];
  ctx.fillRect(4, 0, 2, H);
  ctx.fillRect(W - 6, 0, 2, H);
  // 障碍
  for (const ob of obstacles) {
    const ox = Math.round(LANES[ob.lane] - ob.w / 2);
    const oy = Math.round(ob.y);
    ctx.fillStyle = P.hills[2];
    ctx.fillRect(ox, oy, ob.w, ob.h);
    ctx.fillStyle = P.moon;
    ctx.fillRect(ox, oy, ob.w, 2);
    ctx.fillStyle = P.accent;
    ctx.fillRect(ox + 2, oy + 2, 3, 3);
    ctx.fillRect(ox + ob.w - 5, oy + 2, 3, 3);
  }
  // 玩家飞船
  const cx = Math.round(laneX);
  const flick = frame % 8 < 4 ? P.accent : P.moon;
  ctx.fillStyle = P.moon;
  ctx.fillRect(cx - 6, PY + 2, 12, 10);
  ctx.fillStyle = P.hills[0];
  ctx.fillRect(cx - 10, PY + 6, 4, 6);
  ctx.fillRect(cx + 6, PY + 6, 4, 6);
  ctx.fillStyle = P.accent;
  ctx.fillRect(cx - 2, PY, 4, 4);
  ctx.fillStyle = flick;
  ctx.fillRect(cx - 2, PY + 12, 4, 4);
}

/* ---------- 主循环(按 60fps 归一化的 dt) ---------- */
let lastTs = 0;
function loop(ts) {
  const dt = Math.min(3, (ts - lastTs) / 16.667 || 1);
  lastTs = ts;
  if (mode === "run") update(dt);
  draw();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

/* ---------- 输入 ---------- */
document.addEventListener("keydown", (e) => {
  if (["ArrowLeft", "ArrowRight", "a", "d", "A", "D", " "].includes(e.key)) e.preventDefault();
  if (mode !== "run") {
    if (e.key === " " || e.key === "Enter") primaryAction();
    return;
  }
  if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") lane = Math.max(0, lane - 1);
  if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") lane = Math.min(2, lane + 1);
});
const stage = document.getElementById("stage");
stage.addEventListener("pointerdown", (e) => {
  e.preventDefault();
  if (mode !== "run") { primaryAction(); return; }
  const r = stage.getBoundingClientRect();
  lane = (e.clientX - r.left) < r.width / 2 ? Math.max(0, lane - 1) : Math.min(2, lane + 1);
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden && mode === "run") { mode = "paused"; refreshOverlay(); }
});

/* ---------- 自适应尺寸 ---------- */
function fitStage() {
  const avail = document.querySelector(".play-page").clientWidth - 10;
  const scale = Math.min(avail / W, window.innerHeight * 0.62 / H, 1.75);
  cv.style.width = Math.floor(W * scale) + "px";
  cv.style.height = Math.floor(H * scale) + "px";
}
fitStage();
addEventListener("resize", fitStage);

/* 启动:全部初始化完成后再渲染弹层(依赖 mode 等状态变量) */
refreshOverlay();

/* ---------- 语言切换 ---------- */
document.getElementById("langBtn").addEventListener("click", () => {
  LANG = LANG === "zh" ? "en" : "zh";
  try { localStorage.setItem("ivo-lang", LANG); } catch (_) {}
  renderStatic();
  refreshOverlay();
});
