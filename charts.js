/* =====================================================
 * IVOIncubator 榜单页逻辑
 * 依赖 data.js(GAMES / PALETTES / PALETTE_BY_GAME / LINKS)
 * 四个榜单:热门(非即将推出按热度)/评分/新游/免费,各取前 10
 * ===================================================== */

/* ---------- i18n ---------- */
const CHART_I18N = {
  zh: {
    navDiscover: "发现", navCharts: "榜单", navStats: "统计", navCommunity: "社群", navFavs: "我的收藏",
    chartTitle: "游戏榜单",
    chartSub: "按玩家热度与评分实时排序,点击查看游戏详情",
    tabHot: "热门榜", tabRating: "评分榜", tabFresh: "新游榜", tabFree: "免费榜",
    priceFreeShort: "免费", priceSoonShort: "敬请期待",
    platAndroid: "安卓", platIos: "iOS", backTop: "返回顶部",
    footAbout: "精品手机游戏之家,曾被多家国际头部游戏媒体报道!我们致力于服务移动游戏玩家群体。",
    footSupport: "支持合作", footFollow: "关注我们", footLive: "游戏实况",
    footInvest: "参与投资", footRights: "精品手机游戏之家",
  },
  en: {
    navDiscover: "Discover", navCharts: "Charts", navStats: "Stats", navCommunity: "Community", navFavs: "My Favourites",
    chartTitle: "Game Charts",
    chartSub: "Ranked by player heat and ratings. Tap a row for details",
    tabHot: "Popular", tabRating: "Top Rated", tabFresh: "Fresh", tabFree: "Free",
    priceFreeShort: "Free", priceSoonShort: "Coming Soon",
    platAndroid: "Android", platIos: "iOS", backTop: "Back to top",
    footAbout: "Home of quality mobile games, reported by leading international gaming media. Dedicated to serving mobile gamers.",
    footSupport: "Support", footFollow: "Follow Us", footLive: "Live Streams",
    footInvest: "Invest", footRights: "Quality Mobile Games",
  },
};

let LANG = "zh";
try { LANG = localStorage.getItem("ivo-lang") || "zh"; } catch (_) {}
const t = (k) => CHART_I18N[LANG][k] || k;

const TOP_N = 10;
const TABS = [
  { key: "hot", label: "tabHot" },
  { key: "rating", label: "tabRating" },
  { key: "fresh", label: "tabFresh" },
  { key: "free", label: "tabFree" },
];

/* ---------- 像素 toast(与其他页同款) ---------- */
let toastTimer = null;
function toast(msg) {
  let el = document.querySelector(".toast");
  if (!el) {
    el = document.createElement("div");
    el.className = "toast";
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 1800);
}

/* ---------- 像素封面生成器(与 home.js 同源) ---------- */
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pixelCover(canvas, seed, paletteKey, w = 160, h = 100) {
  const P = PALETTES[paletteKey] || PALETTES.nightGreen;
  const rnd = mulberry32(seed * 7919 + 13);
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext("2d");
  const bands = [Math.floor(h * 0.38), Math.floor(h * 0.34)];
  ctx.fillStyle = P.sky[0]; ctx.fillRect(0, 0, w, bands[0]);
  ctx.fillStyle = P.sky[1]; ctx.fillRect(0, bands[0], w, bands[1]);
  ctx.fillStyle = P.sky[2]; ctx.fillRect(0, bands[0] + bands[1], w, h);
  const dither = (yTop, cBelow) => {
    ctx.fillStyle = cBelow;
    for (let x = 0; x < w; x += 2) ctx.fillRect(x + ((yTop % 4) ? 1 : 0), yTop, 1, 2);
  };
  dither(bands[0] - 2, P.sky[1]);
  dither(bands[0] + bands[1] - 2, P.sky[2]);
  if (P.stars) {
    for (let i = 0; i < w * 0.35; i++) {
      const x = Math.floor(rnd() * w), y = Math.floor(rnd() * bands[0]);
      ctx.fillStyle = rnd() > 0.7 ? P.accent : "rgba(255,255,255,0.85)";
      ctx.fillRect(x, y, 1, 1);
      if (rnd() > 0.92) ctx.fillRect(x, y + 1, 1, 1);
    }
  }
  const mx = Math.floor(w * (0.68 + rnd() * 0.18));
  const my = Math.floor(h * (0.12 + rnd() * 0.12));
  const mr = Math.floor(6 + rnd() * 4);
  ctx.fillStyle = P.moon;
  for (let y = -mr - 2; y <= mr + 2; y++) {
    for (let x = -mr - 2; x <= mr + 2; x++) {
      const d = Math.sqrt(x * x + y * y);
      if (d <= mr) ctx.fillRect(mx + x, my + y, 1, 1);
      else if (d <= mr + 2 && (x + y) % 2 === 0) {
        ctx.fillStyle = "rgba(255,255,255,0.18)";
        ctx.fillRect(mx + x, my + y, 1, 1);
        ctx.fillStyle = P.moon;
      }
    }
  }
  ctx.fillStyle = P.sky[0];
  ctx.beginPath(); ctx.arc(mx - mr * 0.55, my - mr * 0.25, mr * 0.82, 0, 7); ctx.fill();
  const layers = [
    { base: 0.52, amp: 0.16, color: P.hills[0] },
    { base: 0.64, amp: 0.13, color: P.hills[1] },
    { base: 0.78, amp: 0.10, color: P.hills[2] },
  ];
  for (const L of layers) {
    let y = L.base * h;
    for (let x = 0; x < w; x++) {
      if (rnd() > 0.72) y += Math.floor(rnd() * 5) - 2;
      y = Math.min(h, Math.max(L.base * h - L.amp * h, Math.min(L.base * h + L.amp * h * 0.4, y)));
      ctx.fillStyle = L.color;
      ctx.fillRect(x, Math.floor(y), 1, h - Math.floor(y));
    }
  }
  const gy = Math.floor(h * 0.88);
  ctx.fillStyle = P.ground; ctx.fillRect(0, gy, w, h - gy);
  ctx.fillStyle = P.accent;
  for (let i = 0; i < w * 0.08; i++) {
    const x = Math.floor(rnd() * w);
    ctx.fillRect(x, gy + Math.floor(rnd() * 2), 1, 1);
  }
  ctx.fillStyle = P.accent;
  for (let i = 0; i < 4; i++) {
    ctx.globalAlpha = 0.5 + rnd() * 0.5;
    ctx.fillRect(Math.floor(rnd() * w), Math.floor(h * (0.55 + rnd() * 0.3)), 1, 1);
  }
  ctx.globalAlpha = 1;
}

/* =====================================================
 * 榜单
 * ===================================================== */
const $ = (sel) => document.querySelector(sel);
let tab = "hot";

function chartList(key) {
  let list = [...GAMES];
  if (key === "hot") list = list.filter((g) => !g.soon).sort((a, b) => b.hot - a.hot);
  if (key === "rating") list = list.filter((g) => g.rating).sort((a, b) => b.rating - a.rating);
  if (key === "fresh") list = list.filter((g) => g.fresh).sort((a, b) => b.hot - a.hot);
  if (key === "free") list = list.filter((g) => g.free).sort((a, b) => b.hot - a.hot);
  return list.slice(0, TOP_N);
}

function priceInfo(g) {
  if (g.price.type === "free") return { cls: "pill-free", text: t("priceFreeShort") };
  if (g.price.type === "soon") return { cls: "pill-soon", text: t("priceSoonShort") };
  return { cls: "pill-paid", text: "¥" + g.price.amount };
}

function rowHTML(g, i) {
  const info = priceInfo(g);
  const pal = PALETTE_BY_GAME[g.id] || "nightGreen";
  const rankCls = i === 0 ? " rank-1" : i === 1 ? " rank-2" : i === 2 ? " rank-3" : "";
  const plats = g.platforms.includes("android") && g.platforms.includes("ios")
    ? `${t("platAndroid")} / ${t("platIos")}`
    : g.platforms.includes("android") ? t("platAndroid") : t("platIos");
  const rating = g.rating
    ? `<span class="rating">★ <span class="num">${g.rating.toFixed(1)}</span></span>` : "";
  return `
    <a class="chart-row" href="game.html?id=${g.id}">
      <span class="rank${rankCls}" aria-hidden="true">${i + 1}</span>
      <span class="row-cover"><canvas data-seed="${g.hot}" data-pal="${pal}" role="img" aria-label="${g.title[LANG]} ${LANG === "zh" ? "像素封面" : "pixel cover"}"></canvas></span>
      <span class="row-main">
        <span class="row-title">${g.title[LANG]}${g.fresh && !g.soon ? `<span class="pill-new row-new">${LANG === "zh" ? "新" : "NEW"}</span>` : ""}</span>
        <span class="row-tagline">${g.tagline[LANG]}</span>
        <span class="row-meta"><span class="plat">${plats}</span>${rating}</span>
      </span>
      <span class="pill ${info.cls}">${info.text}</span>
    </a>`;
}

function renderTabs() {
  $("#chartTabs").innerHTML = TABS.map((tb) =>
    `<button type="button" role="tab" class="chip ${tab === tb.key ? "active" : ""}" data-tab="${tb.key}" aria-selected="${tab === tb.key}">${t(tb.label)}</button>`).join("");
}

function renderList() {
  const list = chartList(tab);
  $("#chartList").innerHTML = list.map(rowHTML).join("");
  $("#chartList").querySelectorAll("canvas[data-pal]").forEach((c) => {
    pixelCover(c, parseInt(c.dataset.seed, 10) || 1, c.dataset.pal);
  });
}

/* ---------- 静态 i18n ---------- */
function applyStaticI18n() {
  document.documentElement.dataset.lang = LANG;
  document.documentElement.lang = LANG === "zh" ? "zh-CN" : "en";
  document.querySelectorAll("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
    const v = CHART_I18N[LANG][el.dataset.i18nAria];
    if (v) el.setAttribute("aria-label", v);
  });
  document.title = LANG === "zh" ? "游戏榜单 - IVOIncubator" : "Game Charts - IVOIncubator";
}

function renderAll() {
  applyStaticI18n();
  renderTabs();
  renderList();
}

/* =====================================================
 * 事件
 * ===================================================== */
$("#chartTabs").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-tab]");
  if (!btn || btn.dataset.tab === tab) return;
  tab = btn.dataset.tab;
  renderTabs();
  renderList();
});

/* 外链 */
document.querySelectorAll("[data-link]").forEach((a) => { a.href = LINKS[a.dataset.link] || "#"; });

/* 语言切换 */
$("#langBtn").addEventListener("click", () => {
  LANG = LANG === "zh" ? "en" : "zh";
  try { localStorage.setItem("ivo-lang", LANG); } catch (_) {}
  renderAll();
});

/* 返回顶部 */
const backTop = document.getElementById("backTop");
backTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
window.addEventListener("scroll", () => {
  backTop.classList.toggle("show", window.scrollY > 600);
}, { passive: true });

/* 启动 */
renderAll();
