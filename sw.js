/* =====================================================
 * IVOIncubator Service Worker
 * 策略:同源 GET 一律 network-first + 缓存回退。
 * 站点更新频繁且资源无内容哈希,network-first 保证发布后立即生效;
 * 缓存(install 预热 + 运行时回填)保证离线可打开全部页面。
 * 发新版本时把 VERSION 递增即可清掉旧缓存。
 * ===================================================== */
const VERSION = "ivo-v3";
const PRECACHE = [
  "./",
  "./index.html",
  "./game.html",
  "./favorites.html",
  "./charts.html",
  "./play.html",
  "./stats.html",
  "./common.css",
  "./home.css",
  "./game.css",
  "./charts.css",
  "./play.css",
  "./stats.css",
  "./data.js",
  "./home.js",
  "./game.js",
  "./charts.js",
  "./play.js",
  "./stats.js",
  "./cursor.js",
  "./analytics.js",
  "./favorites.js",
  "./manifest.json",
  "./assets/logo.png",
  "./assets/emoji.png",
  "./assets/discord.png",
  "./assets/shot-left.jpg",
  "./assets/shot-right.jpg",
  "./assets/FusionPixel12-subset.woff2",
  "./assets/FusionPixel12-latin-subset.woff2",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(VERSION).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return; // 外链(Steam 图等)不代理

  // 页面导航:网络优先,失败回退缓存(带参数的 game.html?id=… 回退到同路径基础页)
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(VERSION).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() =>
          caches.match(req).then((hit) => hit || caches.match(url.pathname)),
        ),
    );
    return;
  }

  // 静态资源:网络优先,离线用缓存
  e.respondWith(
    fetch(req)
      .then((res) => {
        const copy = res.clone();
        caches.open(VERSION).then((c) => c.put(req, copy));
        return res;
      })
      .catch(() => caches.match(req)),
  );
});
