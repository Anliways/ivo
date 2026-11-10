/* =====================================================
 * IVOIncubator 游戏详情页逻辑
 * 依赖 data.js;URL: game.html?id=<gameId>
 * ===================================================== */

const LINKS_GAME = {
  discord: "https://discord.gg/your-invite-code",
  live: "https://live.bilibili.com/",
  youtube: "https://www.youtube.com/@ivoIncubator",
  bilibili: "https://space.bilibili.com/",
};

/* ---------- i18n ---------- */
const GAME_I18N = {
  zh: {
    navBack: "返回首页", navCharts: "榜单", navCommunity: "社群",
    gameLabel: "游戏名称：", platformLabel: "平台：",
    joinBtn: "一键加群", liveBtn: "跳转实况",
    moreGames: "← 浏览更多游戏",
    relTitle: "更多同类游戏",
    favBtn: "收藏", favDone: "已收藏",
    shareBtn: "分享", shareOk: "链接已复制",
    favAdd: "已加入收藏", favRemove: "已取消收藏",
    priceFreeShort: "免费", priceSoonShort: "敬请期待",
    notifyTitle: "上线通知我", notifyPh: "输入你的邮箱", notifyBtn: "通知我",
    notifyDone: "已登记!游戏上线时我们会第一时间通知你。",
    footAbout: "精品手机游戏之家,曾被多家国际头部游戏媒体报道!我们致力于服务移动游戏玩家群体。",
    footSupport: "支持合作", footFollow: "关注我们",
    footLive: "游戏实况", footInvest: "参与投资", footRights: "精品手机游戏之家",
    platAll: "安卓 / iOS", platAndroid: "安卓", platIos: "iOS",
  },
  en: {
    navBack: "Home", navCharts: "Charts", navCommunity: "Community",
    gameLabel: "Game: ", platformLabel: "Platform: ",
    joinBtn: "JOIN GROUP", liveBtn: "WATCH LIVE",
    moreGames: "← Browse more games",
    relTitle: "More like this",
    favBtn: "Favourite", favDone: "Favourited",
    shareBtn: "Share", shareOk: "Link copied",
    favAdd: "Added to favourites", favRemove: "Removed from favourites",
    priceFreeShort: "Free", priceSoonShort: "Coming Soon",
    notifyTitle: "Notify me at launch", notifyPh: "Enter your email", notifyBtn: "Notify me",
    notifyDone: "You're on the list! We'll email you at launch.",
    footAbout: "Home of quality mobile games, reported by leading international gaming media. Dedicated to serving mobile gamers.",
    footSupport: "Support", footFollow: "Follow Us",
    footLive: "Live Streams", footInvest: "Invest", footRights: "Quality Mobile Games",
    platAll: "Android / iOS", platAndroid: "Android", platIos: "iOS",
  },
};
let LANG = "zh";
try { LANG = localStorage.getItem("ivo-lang") || "zh"; } catch (_) {}
const t = (k) => GAME_I18N[LANG][k] || k;

/* ---------- 收藏(localStorage,与首页共用) ---------- */
let FAVS = [];
try { FAVS = JSON.parse(localStorage.getItem("ivo-favs") || "[]"); } catch (_) { FAVS = []; }
function saveFavs() {
  try { localStorage.setItem("ivo-favs", JSON.stringify(FAVS)); } catch (_) {}
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

/* ---------- 各游戏特性标签 / 描述 ---------- */
const FEATURES_COMMON = [
  { cls: "tag-cert", zh: "官方认证", en: "Verified" },
  { cls: "tag-cn", zh: "简中社区", en: "CN Community" },
  { cls: "tag-fan", zh: "玩家社群", en: "Fan Community" },
  { cls: "tag-ghost", zh: "完善汉化", en: "Localized" },
];
const FEATURES_SURVIVAL = [
  { cls: "tag-source", zh: "信源首爆", en: "First Reveal" },
  ...FEATURES_COMMON.slice(0, 3),
  { cls: "tag-ghost", zh: "完善汉化", en: "Localized" },
  { cls: "tag-ghost", zh: "参与投资", en: "Invest" },
];

const DETAILS = {
  "survival-hope": {
    features: FEATURES_SURVIVAL,
    paragraphs: {
      zh: [
        "手机上有“僵毁”类型游戏吗？",
        "有的，兄弟，IVOIncubator 网站发现了它！",
        "作为资深游戏玩家，我们体验了它，非常好！",
        "如果你想要了解更多？",
        "欢迎在 youtube 和 bilibili 订阅我们！",
      ],
      en: [
        "Is there a “Zomboid”-like game on mobile?",
        "Yes, bro — IVOIncubator found it!",
        "As veteran gamers, we tried it. It's great!",
        "Want to know more?",
        "Subscribe to us on YouTube and Bilibili!",
      ],
    },
  },
};

/* 其他游戏的通用文案 */
function genericDetail(g) {
  const soon = g.price.type === "soon";
  return {
    features: FEATURES_COMMON,
    paragraphs: soon
      ? {
          zh: [g.tagline.zh, "IVOIncubator 精选手机游戏，即将推出！", "加入玩家社群，第一时间获取上线动态！"],
          en: [g.tagline.en, "Curated by IVOIncubator. Coming soon!", "Join our community to get notified at launch!"],
        }
      : {
          zh: [g.tagline.zh, "IVOIncubator 精选手机游戏，资深玩家实测体验！", "支持安卓和 iOS，点击加群和玩家一起交流！"],
          en: [g.tagline.en, "Curated by IVOIncubator, tested by veteran gamers!", "Available on Android & iOS. Join the community!"],
        },
  };
}

/* ---------- 定位游戏 ---------- */
const params = new URLSearchParams(location.search);
const gid = params.get("id") || "survival-hope";
const game = GAMES.find((g) => g.id === gid) || GAMES[0];
const detail = DETAILS[game.id] || genericDetail(game);

/* ---------- 像素画生成(与首页同款) ---------- */
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function pixelCover(canvas, seed, paletteKey, w = 320, h = 120) {
  const P = PALETTES[paletteKey] || PALETTES.nightGreen;
  const rnd = mulberry32(seed * 7919 + 13);
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext("2d");
  const bands = [Math.floor(h * 0.38), Math.floor(h * 0.34)];
  ctx.fillStyle = P.sky[0]; ctx.fillRect(0, 0, w, bands[0]);
  ctx.fillStyle = P.sky[1]; ctx.fillRect(0, bands[0], w, bands[1]);
  ctx.fillStyle = P.sky[2]; ctx.fillRect(0, bands[0] + bands[1], w, h);
  ctx.fillStyle = P.sky[1];
  for (let x = 0; x < w; x += 2) ctx.fillRect(x + ((bands[0] % 4) ? 1 : 0), bands[0] - 2, 1, 2);
  ctx.fillStyle = P.sky[2];
  for (let x = 0; x < w; x += 2) ctx.fillRect(x + ((bands[0] % 4) ? 0 : 1), bands[0] + bands[1] - 2, 1, 2);
  if (P.stars) {
    for (let i = 0; i < w * 0.35; i++) {
      const x = Math.floor(rnd() * w), y = Math.floor(rnd() * bands[0]);
      ctx.fillStyle = rnd() > 0.7 ? P.accent : "rgba(255,255,255,0.85)";
      ctx.fillRect(x, y, 1, 1);
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
  for (let i = 0; i < w * 0.08; i++) ctx.fillRect(Math.floor(rnd() * w), gy + Math.floor(rnd() * 2), 1, 1);
}

/* 每个 game.id 的封面配色映射在 data.js 的 PALETTE_BY_GAME 中 */
const paletteOf = (g) => PALETTE_BY_GAME[g.id] || "nightGreen";

/* ---------- 渲染 ---------- */
const $ = (sel) => document.querySelector(sel);

function renderStatic() {
  document.documentElement.dataset.lang = LANG;
  document.documentElement.lang = LANG === "zh" ? "zh-CN" : "en";
  document.querySelectorAll("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll("[data-i18n-attr]").forEach((el) => {
    const v = GAME_I18N[LANG][el.dataset.i18nAttr];
    if (v) el.placeholder = v;
  });
}

function renderGame() {
  // 横幅:真图或像素画
  const media = $("#heroMedia");
  if (game.banner) {
    media.innerHTML = `<img src="${game.banner}" alt="${game.title[LANG]}">`;
  } else {
    const c = document.createElement("canvas");
    pixelCover(c, game.hot + 100, paletteOf(game), 320, 120);
    c.setAttribute("role", "img");
    c.setAttribute("aria-label", game.title[LANG] + (LANG === "zh" ? " 像素横幅" : " pixel banner"));
    media.innerHTML = "";
    media.appendChild(c);
  }
  document.title = `${game.title[LANG]} - IVOIncubator`;
  $("#gameTitle").textContent = game.title[LANG];
  $("#gameName").textContent = game.title[LANG];
  const plats = game.platforms.map((p) => (p === "android" ? t("platAndroid") : t("platIos")));
  $("#gamePlatform").textContent = plats.length === 2 ? t("platAll") : plats[0];

  // SEO:按游戏动态更新 meta(支持执行 JS 的抓取器;静态 OG 兜底见 <head>)
  const desc = game.tagline[LANG] + (LANG === "zh"
    ? " — IVOIncubator 精选手机游戏。" : " — Curated by IVOIncubator.");
  const setMeta = (id, v) => { const el = document.getElementById(id); if (el) el.content = v; };
  setMeta("ogTitle", document.title); setMeta("twTitle", document.title);
  setMeta("ogDesc", desc); setMeta("twDesc", desc);
  if (typeof CONFIG !== "undefined" && CONFIG.siteUrl) {
    const url = CONFIG.siteUrl + "/game.html?id=" + game.id;
    setMeta("ogUrl", url);
    const can = document.getElementById("canonical");
    if (can) can.href = url;
  }

  // 评分
  const ratingEl = $("#gameRating");
  if (game.rating) {
    const full = Math.round(game.rating);
    ratingEl.innerHTML =
      "★".repeat(full) + "☆".repeat(5 - full) +
      ` <span class="num">${game.rating.toFixed(1)} / 5</span>`;
    ratingEl.hidden = false;
  } else {
    ratingEl.hidden = true;
  }

  // 收藏按钮状态
  refreshFavBtn();

  // 特性标签
  $("#featureTags").innerHTML = detail.features.map((f) =>
    `<li class="${f.cls}">${f[LANG]}</li>`).join("");

  // 描述
  const ps = detail.paragraphs[LANG];
  $("#descBox").innerHTML = ps.map((p, i) =>
    `<p${i === ps.length - 2 && ps.length > 3 ? ' style="margin-top:1.6em"' : ""}>${p}</p>`).join("");

  // 截图:真图或两张不同 seed 的像素画
  const shots = $("#gameShots");
  if (game.shots) {
    shots.innerHTML = game.shots.map((s, i) =>
      `<img src="${s}" loading="lazy" alt="${game.title[LANG]} 截图${i + 1}">`).join("");
  } else {
    shots.innerHTML = "";
    [game.hot + 1, game.hot + 2].forEach((seed) => {
      const c = document.createElement("canvas");
      pixelCover(c, seed, paletteOf(game), 320, 180);
      c.setAttribute("role", "img");
      c.setAttribute("aria-label", game.title[LANG] + (LANG === "zh" ? " 像素场景图" : " pixel scene"));
      shots.appendChild(c);
    });
  }

  // 即将推出的游戏:显示上线通知订阅
  const notifyBox = $("#notifyBox");
  if (game.soon) {
    notifyBox.hidden = false;
    const saved = (() => { try { return localStorage.getItem("ivo-notify") || ""; } catch (_) { return ""; } })();
    if (saved.includes(game.id)) {
      $("#notifyForm").hidden = true;
      $("#notifyDone").hidden = false;
    }
  } else {
    notifyBox.hidden = true;
  }
}

/* ---------- 收藏 / 分享 / 相关推荐 ---------- */
function refreshFavBtn() {
  const btn = document.getElementById("favBtn");
  const on = FAVS.includes(game.id);
  btn.classList.toggle("on", on);
  btn.childNodes[0].textContent = on ? "♥ " : "♡ ";
  btn.querySelector("span").textContent = on ? t("favDone") : t("favBtn");
}

function renderRelated() {
  const others = GAMES.filter((g) => g.id !== game.id);
  let rel = others.filter((g) => g.genre === game.genre);
  for (const g of others) {
    if (rel.length >= 4) break;
    if (!rel.includes(g)) rel.push(g);
  }
  rel = rel.slice(0, 4);
  $("#relGrid").innerHTML = rel.map((g) => {
    const info = g.price.type === "free" ? { cls: "pill-free", text: t("priceFreeShort") }
      : g.price.type === "soon" ? { cls: "pill-soon", text: t("priceSoonShort") }
      : { cls: "pill-paid", text: "¥" + g.price.amount };
    const pal = PALETTE_BY_GAME[g.id] || "nightGreen";
    return `
      <a class="game-card" href="game.html?id=${g.id}">
        <div class="cover"><canvas data-seed="${g.hot}" data-pal="${pal}" role="img" aria-label="${g.title[LANG]} ${LANG === "zh" ? "像素封面" : "pixel cover"}"></canvas><span class="pill ${info.cls}">${info.text}</span></div>
        <div class="card-body"><div class="card-title">${g.title[LANG]}</div></div>
      </a>`;
  }).join("");
  document.querySelectorAll("#relGrid canvas").forEach((c) => pixelCover(c, parseInt(c.dataset.seed, 10), c.dataset.pal, 192, 128));
}

/* ---------- 事件 ---------- */
document.querySelectorAll("[data-link]").forEach((a) => { a.href = LINKS_GAME[a.dataset.link] || "#"; });
$("#langBtn").addEventListener("click", () => {
  LANG = LANG === "zh" ? "en" : "zh";
  try { localStorage.setItem("ivo-lang", LANG); } catch (_) {}
  renderStatic();
  renderGame();
});

document.getElementById("favBtn").addEventListener("click", () => {
  const i = FAVS.indexOf(game.id);
  if (i >= 0) { FAVS.splice(i, 1); toast(t("favRemove")); }
  else { FAVS.push(game.id); toast(t("favAdd")); }
  saveFavs();
  refreshFavBtn();
});

document.getElementById("shareBtn").addEventListener("click", async () => {
  const url = location.href;
  try {
    if (navigator.share) { await navigator.share({ title: game.title[LANG], url }); return; }
    await navigator.clipboard.writeText(url);
    toast(t("shareOk"));
  } catch (_) {
    /* 用户取消分享或剪贴板不可用 */
  }
});

/* 上线通知订阅:暂存本地,接入后端后把此 handler 换成真实 API 即可 */
document.getElementById("notifyForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("notifyEmail").value.trim();
  if (!email) return;
  let list = [];
  try { list = JSON.parse(localStorage.getItem("ivo-notify") || "[]"); } catch (_) {}
  if (!list.includes(game.id)) list.push(game.id);
  try { localStorage.setItem("ivo-notify", JSON.stringify(list)); } catch (_) {}
  e.target.hidden = true;
  document.getElementById("notifyDone").hidden = false;
  toast(t("notifyDone"));
});

/* 返回顶部 */
const backTop = document.getElementById("backTop");
backTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
window.addEventListener("scroll", () => {
  backTop.classList.toggle("show", window.scrollY > 600);
}, { passive: true });

/* 启动 */
renderStatic();
renderGame();
renderRelated();
