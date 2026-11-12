/* =====================================================
 * IVOIncubator 站点统计页逻辑
 * 依赖 data.js;全部数据由 GAMES 实时计算,无手工维护
 * ===================================================== */

/* ---------- i18n ---------- */
const STATS_I18N = {
  zh: {
    navDiscover: "发现", navCharts: "榜单", navStats: "统计",
    navCommunity: "社群", navFavs: "我的收藏",
    statTitle: "站点统计", statSub: "收录游戏的类型 / 价格 / 评分 / 平台分布,全部实时计算",
    gamesTotal: "收录游戏", demoTotal: "可试玩", devlogTotal: "有开发日志", ratingAvg: "平均评分",
    genreTitle: "类型分布", priceTitle: "价格分布", ratingTitle: "评分分布", platTitle: "平台分布",
    unit: "款",
    priceFree: "免费", priceSoon: "即将推出", pricePaid: "付费",
    rHigh: "4.5 以上", rMid: "4.0 ~ 4.4", rLow: "3.5 ~ 3.9", rMin: "3.5 以下", rNone: "未评分",
    platAndroidOnly: "仅安卓", platBoth: "双端",
    footAbout: "精品手机游戏之家,曾被多家国际头部游戏媒体报道!我们致力于服务移动游戏玩家群体。",
    footSupport: "支持合作", footFollow: "关注我们",
    footLive: "游戏实况", footInvest: "参与投资", footRights: "精品手机游戏之家",
    backTop: "回到顶部",
  },
  en: {
    navDiscover: "Discover", navCharts: "Charts", navStats: "Stats",
    navCommunity: "Community", navFavs: "My Favourites",
    statTitle: "Site Stats", statSub: "Genre / price / rating / platform mix of curated games, computed live",
    gamesTotal: "Games", demoTotal: "Playable Demos", devlogTotal: "With Devlog", ratingAvg: "Avg Rating",
    genreTitle: "By Genre", priceTitle: "By Price", ratingTitle: "By Rating", platTitle: "By Platform",
    unit: "",
    priceFree: "Free", priceSoon: "Coming Soon", pricePaid: "Paid",
    rHigh: "4.5 & up", rMid: "4.0 ~ 4.4", rLow: "3.5 ~ 3.9", rMin: "Below 3.5", rNone: "Unrated",
    platAndroidOnly: "Android only", platBoth: "Both platforms",
    footAbout: "Home of quality mobile games, reported by leading international gaming media. Dedicated to serving mobile gamers.",
    footSupport: "Support", footFollow: "Follow Us",
    footLive: "Live Streams", footInvest: "Invest", footRights: "Quality Mobile Games",
    backTop: "Back to top",
  },
};
let LANG = "zh";
try { LANG = localStorage.getItem("ivo-lang") || "zh"; } catch (_) {}
const t = (k) => STATS_I18N[LANG][k] || k;

/* ---------- 统计计算 ---------- */
function computeData() {
  const genreRows = GENRES
    .filter((g) => g.key !== "all")
    .map((g) => ({ label: g[LANG], count: GAMES.filter((x) => x.genre === g.key).length }))
    .filter((r) => r.count > 0)
    .sort((a, b) => b.count - a.count);
  const priceRows = [
    { label: t("priceFree"), count: GAMES.filter((x) => x.price.type === "free").length },
    { label: t("pricePaid"), count: GAMES.filter((x) => x.price.type === "paid").length },
    { label: t("priceSoon"), count: GAMES.filter((x) => x.price.type === "soon").length },
  ].filter((r) => r.count > 0);
  const rated = GAMES.filter((x) => x.rating != null);
  const ratingRows = [
    { label: t("rHigh"), count: rated.filter((x) => x.rating >= 4.5).length },
    { label: t("rMid"), count: rated.filter((x) => x.rating >= 4.0 && x.rating < 4.5).length },
    { label: t("rLow"), count: rated.filter((x) => x.rating >= 3.5 && x.rating < 4.0).length },
    { label: t("rMin"), count: rated.filter((x) => x.rating < 3.5).length },
    { label: t("rNone"), count: GAMES.length - rated.length },
  ].filter((r) => r.count > 0);
  const platRows = [
    { label: t("platBoth"), count: GAMES.filter((x) => x.platforms.length === 2).length },
    { label: t("platAndroidOnly"), count: GAMES.filter((x) => x.platforms.length === 1).length },
  ].filter((r) => r.count > 0);
  const ratedAvg = rated.length
    ? rated.reduce((s, x) => s + x.rating, 0) / rated.length : 0;
  return {
    total: [
      { num: String(GAMES.length), label: t("gamesTotal") },
      { num: String(GAMES.filter((x) => x.demo).length), label: t("demoTotal") },
      { num: String(GAMES.filter((x) => x.devlog && x.devlog.length).length), label: t("devlogTotal") },
      { num: ratedAvg ? ratedAvg.toFixed(1) : "-", label: t("ratingAvg") },
    ],
    panels: [
      { title: t("genreTitle"), color: "c-brand", rows: genreRows },
      { title: t("priceTitle"), color: "c-green", rows: priceRows },
      { title: t("ratingTitle"), color: "c-gold", rows: ratingRows },
      { title: t("platTitle"), color: "c-pink", rows: platRows },
    ],
  };
}

/* ---------- 渲染 ---------- */
const $ = (sel) => document.querySelector(sel);

function renderStatic() {
  document.documentElement.dataset.lang = LANG;
  document.documentElement.lang = LANG === "zh" ? "zh-CN" : "en";
  document.querySelectorAll("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
    const v = STATS_I18N[LANG][el.dataset.i18nAria];
    if (v) el.setAttribute("aria-label", v);
  });
}

function renderStats() {
  const data = computeData();
  document.getElementById("statsTotal").innerHTML = data.total.map((c) => `
    <div class="total-card">
      <div class="total-num">${c.num}</div>
      <div class="total-label">${c.label}</div>
    </div>`).join("");
  document.getElementById("statsGrid").innerHTML = data.panels.map((p) => {
    const max = Math.max(...p.rows.map((r) => r.count), 1);
    const rows = p.rows.map((r) => `
      <div class="stat-row">
        <span class="stat-label">${r.label}</span>
        <span class="stat-bar"><span class="stat-fill ${p.color}" style="width:${Math.round((r.count / max) * 100)}%"></span></span>
        <span class="stat-num">${r.count}${t("unit")}</span>
      </div>`).join("");
    return `
      <section class="stat-panel">
        <h2>${p.title}</h2>
        <div class="stat-rows">${rows}</div>
      </section>`;
  }).join("");
}

/* ---------- 事件 ---------- */
document.querySelectorAll("[data-link]").forEach((a) => {
  a.href = typeof LINKS !== "undefined" ? (LINKS[a.dataset.link] || "#") : "#";
});
$("#langBtn").addEventListener("click", () => {
  LANG = LANG === "zh" ? "en" : "zh";
  try { localStorage.setItem("ivo-lang", LANG); } catch (_) {}
  renderStatic();
  renderStats();
});
const backTop = document.getElementById("backTop");
backTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
window.addEventListener("scroll", () => {
  backTop.classList.toggle("show", window.scrollY > 600);
}, { passive: true });
/* 收藏角标与全站一致 */
try {
  const favs = JSON.parse(localStorage.getItem("ivo-favs") || "[]");
  document.querySelectorAll("[data-fav-badge]").forEach((b) => { b.textContent = favs.length; });
} catch (_) {}

/* 启动 */
renderStatic();
renderStats();
