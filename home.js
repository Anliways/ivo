/* =====================================================
 * IVOIncubator 首页逻辑
 * 依赖 data.js(GAMES / GENRES / CAROUSEL / PALETTES / LINKS)
 * ===================================================== */

/* ---------- i18n ---------- */
const HOME_I18N = {
  zh: {
    navDiscover: "发现", navCharts: "榜单", navCommunity: "社群", navAbout: "关于",
    searchPh: "搜索游戏…",
    empty: "没有找到符合条件的游戏,换个筛选试试!",
    browsePlatform: "按平台浏览", browsePrice: "按价格", tagCloud: "标签",
    noticeTitle: "玩家社群",
    noticeText: "联机找队友、独家资源爆料,都在 IVO 玩家群!",
    joinBtn: "一键加群",
    freshTitle: "最新上架",
    communityTitle: "加入 IVOIncubator 玩家社群",
    communityText: "上千玩家在线交流 · 联机开黑 · 第一时间获取新游戏情报",
    communityBtn: "一键加群",
    footAbout: "精品手机游戏之家,曾被多家国际头部游戏媒体报道!我们致力于服务移动游戏玩家群体。",
    footDiscover: "发现游戏", footSupport: "支持合作", footFollow: "关注我们",
    footLive: "游戏实况", footInvest: "参与投资", footRights: "精品手机游戏之家",
    tabHot: "热门游戏", tabNew: "最新上架", tabFree: "免费游戏", tabSoon: "即将推出",
    platAll: "全部平台", platAndroid: "安卓", platIos: "iOS",
    priceAll: "全部价格", priceFree: "免费", pricePaid: "付费",
    priceFreeShort: "免费", priceSoonShort: "敬请期待", carouselCta: "查看详情",
    tabHotSub: "大家都在玩", tabNewSub: "新鲜出炉", tabFreeSub: "白嫖快乐", tabSoonSub: "抢先关注",
    favTitle: "我的收藏", favOnly: "只看收藏", favHint: "点击卡片右上角 ♡ 收藏喜欢的游戏",
    favAdd: "已加入收藏", favRemove: "已取消收藏", backTop: "返回顶部",
    loadMore: "加载更多", pauseAria: "暂停轮播", playAria: "播放轮播",
  },
  en: {
    navDiscover: "Discover", navCharts: "Charts", navCommunity: "Community", navAbout: "About",
    searchPh: "Search games…",
    empty: "No games match your filters. Try something else!",
    browsePlatform: "Browse by platform", browsePrice: "By price", tagCloud: "Tags",
    noticeTitle: "Player Community",
    noticeText: "Find teammates, exclusive news — all in the IVO group!",
    joinBtn: "JOIN GROUP",
    freshTitle: "Fresh Games",
    communityTitle: "Join the IVOIncubator Community",
    communityText: "Thousands of players · Co-op matchmaking · First-hand game news",
    communityBtn: "JOIN GROUP",
    footAbout: "Home of quality mobile games, reported by leading international gaming media. Dedicated to serving mobile gamers.",
    footDiscover: "Discover", footSupport: "Support", footFollow: "Follow Us",
    footLive: "Live Streams", footInvest: "Invest", footRights: "Quality Mobile Games",
    tabHot: "Popular", tabNew: "Fresh", tabFree: "Free", tabSoon: "Coming Soon",
    platAll: "All platforms", platAndroid: "Android", platIos: "iOS",
    priceAll: "Any price", priceFree: "Free", pricePaid: "Paid",
    priceFreeShort: "Free", priceSoonShort: "Coming Soon", carouselCta: "VIEW GAME",
    tabHotSub: "Everyone is playing", tabNewSub: "Just landed", tabFreeSub: "Zero cost", tabSoonSub: "Get notified",
    favTitle: "My Favourites", favOnly: "Favourites only", favHint: "Tap ♡ on a card to save a game",
    favAdd: "Added to favourites", favRemove: "Removed from favourites", backTop: "Back to top",
    loadMore: "Load more", pauseAria: "Pause carousel", playAria: "Play carousel",
  },
};
const TAG_LABEL = {
  survival: { zh: "生存", en: "Survival" }, coop: { zh: "合作", en: "Co-op" },
  zombie: { zh: "僵尸", en: "Zombie" }, action: { zh: "动作", en: "Action" },
  rpg: { zh: "角色扮演", en: "RPG" }, sim: { zh: "模拟", en: "Sim" },
  horror: { zh: "恐怖", en: "Horror" }, casual: { zh: "休闲", en: "Casual" },
  pixel: { zh: "像素", en: "Pixel" },
};

let LANG = "zh";
try { LANG = localStorage.getItem("ivo-lang") || "zh"; } catch (_) {}
const t = (k) => HOME_I18N[LANG][k] || k;

/* ---------- 筛选状态 ---------- */
const PER_PAGE = 8; /* 每页卡片数,游戏多于 20-30 个时靠它保持流畅 */
const state = { tab: "hot", genre: "all", platform: "all", price: "all", tag: null, search: "", favOnly: false, page: 1 };

/* ---------- 收藏(localStorage 持久化) ---------- */
let FAVS = [];
try { FAVS = JSON.parse(localStorage.getItem("ivo-favs") || "[]"); } catch (_) { FAVS = []; }
function saveFavs() {
  try { localStorage.setItem("ivo-favs", JSON.stringify(FAVS)); } catch (_) {}
}
function toggleFav(id) {
  const i = FAVS.indexOf(id);
  if (i >= 0) { FAVS.splice(i, 1); toast(t("favRemove")); }
  else { FAVS.push(id); toast(t("favAdd")); }
  saveFavs();
  renderGrid(); renderFresh(); renderFavPanel();
}

/* ---------- 像素 toast ---------- */
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
 * 像素封面生成器:星空 + 月亮 + 三层山 + 地面
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
  const dither = (yTop, cAbove, cBelow) => {
    ctx.fillStyle = cBelow;
    for (let x = 0; x < w; x += 2) ctx.fillRect(x + ((yTop % 4) ? 1 : 0), yTop, 1, 2);
  };
  dither(bands[0] - 2, P.sky[0], P.sky[1]);
  dither(bands[0] + bands[1] - 2, P.sky[1], P.sky[2]);

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
const gameById = (id) => GAMES.find((g) => g.id === id);

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
  const fav = FAVS.includes(g.id);
  const rating = g.rating
    ? `<span class="rating">★ <span class="num">${g.rating.toFixed(1)}</span></span>` : "";
  const isNew = g.fresh && !g.soon ? `<span class="pill-new">${LANG === "zh" ? "新游戏" : "NEW"}</span>` : "";
  const demoPill = g.demo ? `<span class="pill pill-demo">${LANG === "zh" ? "可试玩" : "DEMO"}</span>` : "";
  return `
    <a class="game-card" href="game.html?id=${g.id}" data-id="${g.id}">
      <div class="cover"><canvas data-seed="${g.hot}" data-pal="${pal}" role="img" aria-label="${g.title[LANG]} ${LANG === "zh" ? "像素封面" : "pixel cover"}"></canvas><span class="pill ${info.cls}">${info.text}</span>${isNew}${demoPill}<button type="button" class="fav-btn ${fav ? "on" : ""}" data-fav="${g.id}" aria-label="favourite">${fav ? "♥" : "♡"}</button></div>
      <div class="card-body">
        <div class="card-title">${g.title[LANG]}</div>
        <div class="card-tagline">${g.tagline[LANG]}</div>
        <div class="card-meta">${plats}${rating}</div>
      </div>
    </a>`;
}

function paintCovers(root) {
  (root || document).querySelectorAll("canvas[data-pal]").forEach((c) => {
    pixelCover(c, parseInt(c.dataset.seed, 10) || 1, c.dataset.pal);
  });
}

/* ---- 轮播 ---- */
let carIndex = 0, carTimer = null;
function renderCarousel() {
  const slides = CAROUSEL.map((id, i) => {
    const g = gameById(id);
    const tags = g.tags.slice(0, 3).map((k) => `<span class="tagmini">#${(TAG_LABEL[k] || {})[LANG] || k}</span>`).join("");
    const bg = g.banner
      ? `<img class="slide-bg" src="${g.banner}" alt="${g.title[LANG]} ${LANG === "zh" ? "游戏横幅" : "banner"}" ${i === 0 ? "" : 'loading="lazy"'}>`
      : `<canvas class="slide-bg" data-seed="${g.hot}" data-pal="${PALETTE_BY_GAME[g.id] || "nightGreen"}" data-banner="1" role="img" aria-label="${g.title[LANG]} ${LANG === "zh" ? "像素横幅" : "pixel banner"}"></canvas>`;
    return `
      <div class="slide ${i === carIndex ? "active" : ""}" data-i="${i}">
        ${bg}<div class="slide-shade"></div>
        <div class="slide-info">
          <div class="slide-tags">${tags}</div>
          <h2>${g.title[LANG]}</h2>
          <p>${g.tagline[LANG]}</p>
          <a class="btn btn-blue" href="game.html?id=${g.id}">${t("carouselCta")}</a>
        </div>
      </div>`;
  }).join("");
  $("#slides").innerHTML = slides;
  $("#carDots").innerHTML = CAROUSEL.map((_, i) =>
    `<button type="button" data-i="${i}" class="${i === carIndex ? "active" : ""}" aria-label="slide ${i + 1}"></button>`).join("");
  paintCovers($("#slides"));
}

/* 轮播:暂停/播放(reduced-motion 用户默认暂停) */
let carPaused = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const carPauseBtn = document.getElementById("carPause");
function refreshPauseBtn() {
  carPauseBtn.textContent = carPaused ? "▶" : "⏸";
  carPauseBtn.setAttribute("aria-label", carPaused ? t("playAria") : t("pauseAria"));
}
carPauseBtn.addEventListener("click", () => {
  carPaused = !carPaused;
  refreshPauseBtn();
  if (carPaused) clearInterval(carTimer); else restartCarTimer();
});

function goCarousel(i) {
  carIndex = (i + CAROUSEL.length) % CAROUSEL.length;
  document.querySelectorAll("#slides .slide").forEach((s) =>
    s.classList.toggle("active", +s.dataset.i === carIndex));
  document.querySelectorAll("#carDots button").forEach((b) =>
    b.classList.toggle("active", +b.dataset.i === carIndex));
  if (!carPaused) restartCarTimer();
}
function restartCarTimer() {
  clearInterval(carTimer);
  if (carPaused) return;
  carTimer = setInterval(() => { if (!document.hidden) goCarousel(carIndex + 1); }, 6000);
}

/* ---- 分类 chips ---- */
function renderGenres() {
  $("#genreRow").innerHTML = GENRES.map((g) =>
    `<button type="button" class="chip ${state.genre === g.key ? "active" : ""}" data-genre="${g.key}">${g[LANG]}</button>`).join("");
}

/* ---- 标签页 ---- */
function renderTabs() {
  const tabs = [["hot", "tabHot"], ["new", "tabNew"], ["free", "tabFree"], ["soon", "tabSoon"]];
  $("#tabBar").innerHTML = tabs.map(([k, label]) =>
    `<button type="button" role="tab" class="${state.tab === k ? "active" : ""}" data-tab="${k}">${t(label)}</button>`).join("");
}

/* ---- 侧栏筛选 ---- */
function renderSidebar() {
  $("#platFilter").innerHTML = [
    ["all", "platAll"], ["android", "platAndroid"], ["ios", "platIos"],
  ].map(([k, l]) =>
    `<button type="button" class="chip ${state.platform === k ? "active" : ""}" data-plat="${k}">${t(l)}</button>`).join("");
  $("#priceFilter").innerHTML = [
    ["all", "priceAll"], ["free", "priceFree"], ["paid", "pricePaid"],
  ].map(([k, l]) =>
    `<button type="button" class="chip ${state.price === k ? "active" : ""}" data-price="${k}">${t(l)}</button>`).join("");
  const tagKeys = [...new Set(GAMES.flatMap((g) => g.tags))];
  $("#tagCloud").innerHTML = tagKeys.map((k) =>
    `<button type="button" class="chip ${state.tag === k ? "active" : ""}" data-tag="${k}">${(TAG_LABEL[k] || {})[LANG] || k}</button>`).join("");
}

/* ---- 游戏网格 ---- */
function filteredGames() {
  let list = [...GAMES];
  if (state.tab === "hot") list = list.filter((g) => !g.soon).sort((a, b) => b.hot - a.hot);
  if (state.tab === "new") list = list.filter((g) => g.fresh);
  if (state.tab === "free") list = list.filter((g) => g.free);
  if (state.tab === "soon") list = list.filter((g) => g.soon);
  if (state.favOnly) list = list.filter((g) => FAVS.includes(g.id));
  if (state.genre !== "all") list = list.filter((g) => g.genre === state.genre || g.tags.includes(state.genre));
  if (state.platform !== "all") list = list.filter((g) => g.platforms.includes(state.platform));
  if (state.price !== "all") list = list.filter((g) => g.price.type === state.price);
  if (state.tag) list = list.filter((g) => g.tags.includes(state.tag));
  if (state.search) {
    const q = state.search.toLowerCase();
    list = list.filter((g) => {
      // 标题/简介之外,标签与类型的中英文名也参与匹配(如搜"像素"或"rogue")
      const hay = [
        g.title.zh, g.title.en, g.tagline.zh, g.tagline.en,
        ...g.tags.map((k) => (TAG_LABEL[k] || {}).zh || ""),
        ...g.tags.map((k) => (TAG_LABEL[k] || {}).en || ""),
        g.genre,
      ].join(" ").toLowerCase();
      return hay.includes(q);
    });
  }
  return list;
}

function renderGrid() {
  const list = filteredGames();
  const shown = list.slice(0, state.page * PER_PAGE);
  $("#gameGrid").innerHTML = shown.map(cardHTML).join("");
  $("#emptyTip").hidden = list.length > 0;
  const btn = $("#loadMore");
  btn.hidden = shown.length >= list.length;
  btn.textContent = `${t("loadMore")} (${list.length - shown.length})`;
  paintCovers($("#gameGrid"));
}

/* ---- 最新上架行 ---- */
function renderFresh() {
  const list = GAMES.filter((g) => g.fresh);
  $("#freshRow").innerHTML = list.map(cardHTML).join("");
  paintCovers($("#freshRow"));
}

/* ---- 侧栏收藏面板 ---- */
function renderFavPanel() {
  $("#favCount").textContent = "♥ " + FAVS.length;
  // 同步顶栏收藏角标
  document.querySelectorAll("[data-fav-badge]").forEach((b) => { b.textContent = FAVS.length; });
  $("#favOnlyBtn").classList.toggle("active", state.favOnly);
}

/* ---- 静态 i18n ---- */
function applyStaticI18n() {
  document.documentElement.dataset.lang = LANG;
  document.documentElement.lang = LANG === "zh" ? "zh-CN" : "en";
  document.querySelectorAll("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll("[data-i18n-attr]").forEach((el) => {
    const v = HOME_I18N[LANG][el.dataset.i18nAttr];
    if (v) el.placeholder = v;
  });
  document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
    const v = HOME_I18N[LANG][el.dataset.i18nAria];
    if (v) el.setAttribute("aria-label", v);
  });
  document.title = LANG === "zh" ? "IVOIncubator - 精品手机游戏之家" : "IVOIncubator - Quality Mobile Games";
}

/* ---- 全量渲染 ---- */
function renderAll() {
  applyStaticI18n();
  renderCarousel();
  renderGenres();
  renderTabs();
  renderSidebar();
  renderFavPanel();
  renderGrid();
  renderFresh();
}

/* =====================================================
 * 事件
 * ===================================================== */
document.addEventListener("click", (e) => {
  /* 收藏按钮:阻止卡片链接跳转 */
  const fav = e.target.closest("[data-fav]");
  if (fav) {
    e.preventDefault();
    e.stopPropagation();
    toggleFav(fav.dataset.fav);
    return;
  }
  const el = e.target.closest("[data-genre],[data-tab],[data-plat],[data-price],[data-tag],[data-nav-tab]");
  if (!el) return;
  state.page = 1;
  if (el.dataset.genre) { state.genre = el.dataset.genre; renderGenres(); renderGrid(); }
  if (el.dataset.tab) { state.tab = el.dataset.tab; renderTabs(); renderGrid(); }
  if (el.dataset.plat) { state.platform = el.dataset.plat; renderSidebar(); renderGrid(); }
  if (el.dataset.price) { state.price = el.dataset.price; renderSidebar(); renderGrid(); }
  if (el.dataset.tag) { state.tag = state.tag === el.dataset.tag ? null : el.dataset.tag; renderSidebar(); renderGrid(); }
  if (el.dataset.navTab) { state.tab = el.dataset.navTab; renderTabs(); renderGrid(); }
});

/* 加载更多 */
$("#loadMore").addEventListener("click", () => {
  state.page += 1;
  renderGrid();
});

/* 只看收藏 */
$("#favOnlyBtn").addEventListener("click", () => {
  state.favOnly = !state.favOnly;
  if (state.favOnly && FAVS.length === 0) {
    toast(t("favHint"));
    state.favOnly = false;
    return;
  }
  state.page = 1;
  renderFavPanel();
  renderGrid();
  document.getElementById("grid-top").scrollIntoView({ behavior: "smooth" });
});

$("#carPrev").addEventListener("click", () => goCarousel(carIndex - 1));
$("#carNext").addEventListener("click", () => goCarousel(carIndex + 1));
$("#carDots").addEventListener("click", (e) => {
  const b = e.target.closest("button[data-i]");
  if (b) goCarousel(+b.dataset.i);
});

const searchInput = $("#searchInput");
let searchTimer = null;
searchInput.addEventListener("input", () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    state.search = searchInput.value.trim();
    state.page = 1;
    renderGrid();
  }, 200);
});
searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    state.search = searchInput.value.trim();
    state.page = 1;
    renderGrid();
    document.getElementById("grid-top").scrollIntoView({ behavior: "smooth" });
  }
});
$("#searchGo").addEventListener("click", () => {
  state.search = searchInput.value.trim();
  state.page = 1;
  renderGrid();
});

/* 外链 */
document.querySelectorAll("[data-link]").forEach((a) => { a.href = LINKS[a.dataset.link] || "#"; });

/* 语言切换 */
$("#langBtn").addEventListener("click", () => {
  LANG = LANG === "zh" ? "en" : "zh";
  try { localStorage.setItem("ivo-lang", LANG); } catch (_) {}
  renderAll();
});

/* 轮播触摸滑动(移动端) */
let touchX = null;
document.getElementById("carousel").addEventListener("touchstart", (e) => {
  touchX = e.touches[0].clientX;
}, { passive: true });
document.getElementById("carousel").addEventListener("touchend", (e) => {
  if (touchX === null) return;
  const dx = e.changedTouches[0].clientX - touchX;
  if (Math.abs(dx) > 40) goCarousel(carIndex + (dx < 0 ? 1 : -1));
  touchX = null;
}, { passive: true });

/* 返回顶部 */
const backTop = document.getElementById("backTop");
backTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
window.addEventListener("scroll", () => {
  backTop.classList.toggle("show", window.scrollY > 600);
}, { passive: true });

/* 启动 */
renderAll();
refreshPauseBtn();
restartCarTimer();
