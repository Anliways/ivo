/* =====================================================
 * 全站像素光标:运行时用 canvas 逐格绘制箭头 → PNG data URI
 * 白色 = 默认,蓝色 = 可点击元素;注入 CSS 变量供样式表引用
 * ===================================================== */
(function () {
  /* X = 黑边,O = 填充,. = 透明(经典指针轮廓) */
  var ART = [
    "X.........",
    "XX........",
    "XOX.......",
    "XOOX......",
    "XOOOX.....",
    "XOOOOX....",
    "XOOOOOX...",
    "XOOOOOOX..",
    "XOOOOOOOX.",
    "XOOOOOOOOX",
    "XOOX......",
    "XOX.......",
    "XX........",
  ];
  var S = 2; /* 每格 2px,总尺寸 20x26 */

  function makeCursor(fill) {
    var c = document.createElement("canvas");
    c.width = ART[0].length * S;
    c.height = ART.length * S;
    var ctx = c.getContext("2d");
    ART.forEach(function (row, y) {
      for (var x = 0; x < row.length; x++) {
        var ch = row[x];
        if (ch === ".") continue;
        ctx.fillStyle = ch === "X" ? "#000000" : fill;
        ctx.fillRect(x * S, y * S, S, S);
      }
    });
    return "url(" + c.toDataURL("image/png") + ") 1 1, auto";
  }

  var root = document.documentElement;
  root.style.setProperty("--cursor-arrow", makeCursor("#ffffff"));
  root.style.setProperty("--cursor-point", makeCursor("#4f8cff"));
})();
