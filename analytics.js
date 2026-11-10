/* =====================================================
 * 访问统计接入点(占位)
 * 在 data.js 的 CONFIG.analyticsId 填入 Google 衡量 ID
 * (形如 G-XXXXXXXXXX)即可启用;留空则不加载任何脚本。
 * 换用 Plausible / Umami 等可直接在两页 <head> 加它们的
 * <script>,或仿照下方注入方式接入。
 * ===================================================== */
(function () {
  const id = (typeof CONFIG !== "undefined" && CONFIG.analyticsId) || "";
  if (!id) return;
  const s = document.createElement("script");
  s.async = true;
  s.src = "https://www.googletagmanager.com/gtag/js?id=" + id;
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  gtag("js", new Date());
  gtag("config", id);
})();
