/* =====================================================
 * IVOIncubator 收藏夹页逻辑
 * 依赖 data.js(GAMES / PALETTES / PALETTE_BY_GAME / LINKS)
 * 收藏数据与首页共用 localStorage(ivo-favs)
 * ===================================================== */

/* ---------- i18n ---------- */
const FAV_I18N = {
  zh: {
    navDiscover: "发现", navCharts: "榜单", navCommunity: "社群", navFavs: "我的收藏",
    favTitle: "我的收藏", favHint: "点击卡片右上角 ♥ 取消收藏",
    favEmpty: "还没有收藏任何游戏",
    favEmptyHint: "去首页逛逛,点卡片右上角的 ♡ 把喜欢的游戏收进来!",
    favGo: "去发现游戏", favClear: "清空收藏", favClearConfirm: "确定要清空全部收藏吗?",
    favAdd: "已加入收藏", favRemove: "已取消收藏",
    priceFreeShort: "免费", priceSoonShort: "敬请期待",
    platAndroid: "安卓", platIos: "iOS", backTop: "返回顶部",
    footAbout: "精品手机游戏之家,曾被多家国际头部游戏媒体报道!我们致力于服务移动游戏玩家群体。",
    footSupport: "支持合作", footFollow: "关注我们", footLive: "游戏实况",
    footInvest: "参与投资", footRights: "精品手机游戏之家",
  },
  en: {
    navDiscover: "Discover", navCharts: "Charts", navCommunity: "Community", navFavs: "My Favourites",
    favTitle: "My Favourites", favHint: "Tap ♥ on a card to remove it",
    favEmpty: "No favourites yet",
    favEmptyHint: "Browse the homepage and tap ♡ on a card to save a game!",
    favGo: "Discover games", favClear: "Clear all", favClearConfirm: "Clear all favourites?",
    favAdd: "Added to favourites", favRemove: "Removed from favourites",
    priceFreeShort: "Free", priceSoonShort: "Coming Soon",
    platAndroid: "Android", platIos: "iOS", backTop: "Back to top",
    footAbout: "Home of quality mobile games, reported by leading international gaming media. Dedicated to serving mobile gamers.",
    footSupport: "Support", footFollow: "Follow Us", footLive: "Live Streams",
    footInvest: "Invest", footRights: "Quality Mobile Games",
  },
};

let LANG = "zh";
try { LANG = localStorage.getItem("ivo-lang") || "zh"; } catch (_) {}
const t = (k) => FAV_I18N[LANG][k] || k;

/* ---------- 收藏(localStorage 与首页/详情页共享) ---------- */
let FAVS = [];
try { FAVS = JSON.parse(localStorage.getItem("ivo-favs") || "[]"); } catch (_) { FAVS = []; }
function saveFavs() {
  try { localStorage.setItem("ivo-favs", JSON.stringify(FAVS)); } catch (_) {}
}
function updateBadges() {
  document.querySelectorAll("[data-fav-badge]").forEach((b) => { b.textContent = FAVS.length; });
  $("#favTotal").textContent = "♥ " + FAVS.length;
  $("#clearBtn").hidden = FAVS.length === 0;
}

/* ---------- 像素 toast(与首页同款) ---------- */
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

/* =====================================================
 * 像素封面生成器(与 home.js 同源,保证两页封面一致)
 * ===================================================== */
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pixelCover(canvas, seed, paletteKey, w = 192, h = 128) {
  const P = PALETTES[paletteKey] || PALETTES.nightGreen;
  const rnd = mulberry32(seed * 7919 + 13);
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext("2d");

  // --- 天空:三段色带 + 抖动过渡 ---
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

  // --- 星星 ---
  if (P.stars) {
    for (let i = 0; i < w * 0.35; i++) {
      const x = Math.floor(rnd() * w), y = Math.floor(rnd() * bands[0]);
      ctx.fillStyle = rnd() > 0.7 ? P.accent : "rgba(255,255,255,0.85)";
      ctx.fillRect(x, y, 1, 1);
      if (rnd() > 0.92) ctx.fillRect(x, y + 1, 1, 1); // 少量两像素亮星
    }
  }

  // --- 月亮 ---
  const mx = Math.floor(w * (0.68 + rnd() * 0.18));
  const my = Math.floor(h * (0.12 + rnd() * 0.12));
  const mr = Math.floor(6 + rnd() * 4);
  ctx.fillStyle = P.moon;
  for (let y = -mr - 2; y <= mr + 2; y++) {
    for (let x = -mr - 2; x <= mr + 2; x++) {
      const d = Math.sqrt(x * x + y * y);
      if (d <= mr) ctx.fillRect(mx + x, my + y, 1, 1);
      else if (d <= mr + 2 && (x + y) % 2 === 0) { // 光晕抖动
        ctx.fillStyle = "rgba(255,255,255,0.18)";
        ctx.fillRect(mx + x, my + y, 1, 1);
        ctx.fillStyle = P.moon;
      }
    }
  }
  // 月牙缺口
  ctx.fillStyle = P.sky[0];
  ctx.beginPath(); ctx.arc(mx - mr * 0.55, my - mr * 0.25, mr * 0.82, 0, 7); ctx.fill();

  // --- 三层山 ---
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

  // --- 地面 + 草点 ---
  const gy = Math.floor(h * 0.88);
  ctx.fillStyle = P.ground; ctx.fillRect(0, gy, w, h - gy);
  ctx.fillStyle = P.accent;
  for (let i = 0; i < w * 0.08; i++) {
    const x = Math.floor(rnd() * w);
    ctx.fillRect(x, gy + Math.floor(rnd() * 2), 1, 1);
  }
  // --- 萤火点缀 ---
  ctx.fillStyle = P.accent;
  for (let i = 0; i < 4; i++) {
    ctx.globalAlpha = 0.5 + rnd() * 0.5;
    ctx.fillRect(Math.floor(rnd() * w), Math.floor(h * (0.55 + rnd() * 0.3)), 1, 1);
  }
  ctx.globalAlpha = 1;
}

/* =====================================================
 * 渲染
 * ===================================================== */
const $ = (sel) => document.querySelector(sel);

function priceInfo(g) {
  if (g.price.type === "free") return { cls: "pill-free", text: t("priceFreeShort") };
  if (g.price.type === "soon") return { cls: "pill-soon", text: t("priceSoonShort") };
  return { cls: "pill-paid", text: "¥" + g.price.amount };
}

function cardHTML(g) {
  const info = priceInfo(g);
  const pal = PALETTE_BY_GAME[g.id] || "nightGreen";
  const plats = g.platforms.includes("android") && g.platforms.includes("ios")
    ? `<span class="plat">${t("platAndroid")}</span><span class="plat">${t("platIos")}</span>`
    : `<span class="plat">${g.platforms.includes("android") ? t("platAndroid") : t("platIos")}</span>`;
  const rating = g.rating
    ? `<span class="rating">★ <span class="num">${g.rating.toFixed(1)}</span></span>` : "";
  const isNew = g.fresh && !g.soon ? `<span class="pill-new">${LANG === "zh" ? "新游戏" : "NEW"}</span>` : "";
  return `
    <a class="game-card" href="game.html?id=${g.id}" data-id="${g.id}">
      <div class="cover"><canvas data-seed="${g.hot}" data-pal="${pal}" role="img" aria-label="${g.title[LANG]} ${LANG === "zh" ? "像素封面" : "pixel cover"}"></canvas><span class="pill ${info.cls}">${info.text}</span>${isNew}<button type="button" class="fav-btn on" data-fav="${g.id}" aria-label="favourite">♥</button></div>
      <div class="card-body">
        <div class="card-title">${g.title[LANG]}</div>
        <div class="card-tagline">${g.tagline[LANG]}</div>
        <div class="card-meta">${plats}${rating}</div>
      </div>
    </a>`;
}

function render() {
  const list = GAMES.filter((g) => FAVS.includes(g.id));
  $("#favGrid").innerHTML = list.map(cardHTML).join("");
  $("#favGrid").querySelectorAll("canvas[data-pal]").forEach((c) => {
    pixelCover(c, parseInt(c.dataset.seed, 10) || 1, c.dataset.pal);
  });
  $("#favsEmpty").hidden = list.length > 0;
  updateBadges();
}

/* ---------- 静态 i18n ---------- */
function applyStaticI18n() {
  document.documentElement.dataset.lang = LANG;
  document.documentElement.lang = LANG === "zh" ? "zh-CN" : "en";
  document.querySelectorAll("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
    const v = FAV_I18N[LANG][el.dataset.i18nAria];
    if (v) el.setAttribute("aria-label", v);
  });
  document.title = LANG === "zh" ? "我的收藏 - IVOIncubator" : "My Favourites - IVOIncubator";
}

/* =====================================================
 * 事件
 * ===================================================== */
document.addEventListener("click", (e) => {
  /* 取消收藏:阻止卡片链接跳转 */
  const fav = e.target.closest("[data-fav]");
  if (fav) {
    e.preventDefault();
    e.stopPropagation();
    const i = FAVS.indexOf(fav.dataset.fav);
    if (i >= 0) {
      FAVS.splice(i, 1);
      saveFavs();
      toast(t("favRemove"));
      render();
    }
    return;
  }
});

/* 清空收藏 */
$("#clearBtn").addEventListener("click", () => {
  if (FAVS.length === 0) return;
  if (!confirm(t("favClearConfirm"))) return;
  FAVS = [];
  saveFavs();
  render();
  toast(t("favRemove"));
});

/* 外链 */
document.querySelectorAll("[data-link]").forEach((a) => { a.href = LINKS[a.dataset.link] || "#"; });

/* 语言切换 */
$("#langBtn").addEventListener("click", () => {
  LANG = LANG === "zh" ? "en" : "zh";
  try { localStorage.setItem("ivo-lang", LANG); } catch (_) {}
  applyStaticI18n();
  render();
});

/* 返回顶部 */
const backTop = document.getElementById("backTop");
backTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
window.addEventListener("scroll", () => {
  backTop.classList.toggle("show", window.scrollY > 600);
}, { passive: true });

/* 启动 */
applyStaticI18n();
render();
