/* =====================================================
 * IVOIncubator 游戏资源站 · 数据层
 * 新增 / 修改游戏只需编辑 GAMES 数组
 * ===================================================== */

/* 外链配置 */
const LINKS = {
  discord: "https://discord.gg/your-invite-code",
  live: "https://live.bilibili.com/",
  youtube: "https://www.youtube.com/@ivoIncubator",
  bilibili: "https://space.bilibili.com/",
};

/* 站点配置:统计 ID(留空不加载任何统计脚本)、站点域名 */
const CONFIG = {
  analyticsId: "",
  siteUrl: "https://anliways.github.io/ivo",
};

/* 游戏分类 */
const GENRES = [
  { key: "all",     zh: "全部",     en: "All" },
  { key: "survival", zh: "生存",    en: "Survival" },
  { key: "zombie",   zh: "僵尸",    en: "Zombie" },
  { key: "coop",     zh: "合作",    en: "Co-op" },
  { key: "action",   zh: "动作",    en: "Action" },
  { key: "rpg",      zh: "角色扮演", en: "RPG" },
  { key: "sim",      zh: "模拟经营", en: "Simulation" },
  { key: "horror",   zh: "恐怖",    en: "Horror" },
  { key: "casual",   zh: "休闲",    en: "Casual" },
  { key: "pixel",    zh: "像素",    en: "Pixel Art" },
];

/* 游戏列表
 * hot / fresh / free / soon: 用于四个标签页筛选
 * price: { type: "free" | "paid" | "soon", amount?: number }
 * palette: 像素封面配色(cover 由 canvas 程序生成)
 */
const GAMES = [
  {
    id: "survival-hope",
    rating: 4.8,
    title: { zh: "生存与希望", en: "Survival & Hope" },
    tagline: { zh: "手机版“僵尸毁灭工程”", en: "Mobile “Project Zomboid”" },
    genre: "zombie",
    tags: ["survival", "coop", "zombie"],
    price: { type: "free" },
    platforms: ["android", "ios"],
    hot: 100, fresh: true, free: true, soon: false,
    banner: "assets/shot-left.jpg",
    shots: ["assets/shot-left.jpg", "assets/shot-right.jpg"],
  },
  {
    id: "stardust-farm",
    rating: 4.6,
    title: { zh: "星尘农场", en: "Stardust Farm" },
    tagline: { zh: "在外星球种田的治愈物语", en: "A cozy farm on a faraway planet" },
    genre: "sim",
    tags: ["pixel", "sim"],
    price: { type: "paid", amount: 12 },
    platforms: ["android", "ios"],
    hot: 86, fresh: false, free: false, soon: false,
  },
  {
    id: "abyss-echo",
    rating: 4.7,
    title: { zh: "深海回响", en: "Abyss Echo" },
    tagline: { zh: "潜入无声深渊,回应它的呼唤", en: "Dive into the silent deep" },
    genre: "horror",
    tags: ["horror", "rpg"],
    price: { type: "paid", amount: 18 },
    platforms: ["android"],
    hot: 91, fresh: true, free: false, soon: false,
  },
  {
    id: "neko-mart",
    rating: 4.3,
    title: { zh: "猫咪小卖部", en: "Neko Mart" },
    tagline: { zh: "和猫店长一起经营深夜小卖部", en: "Run a midnight shop with cats" },
    genre: "sim",
    tags: ["casual", "pixel"],
    price: { type: "free" },
    platforms: ["android", "ios"],
    hot: 78, fresh: true, free: true, soon: false,
  },
  {
    id: "ninja-strike",
    rating: 4.1,
    title: { zh: "忍者之一击", en: "Ninja Strike" },
    tagline: { zh: "一击必杀,影子般的动作爽游", en: "One hit, one kill. Shadow action" },
    genre: "action",
    tags: ["action", "pixel"],
    price: { type: "paid", amount: 6 },
    platforms: ["android", "ios"],
    hot: 74, fresh: true, free: false, soon: false,
  },
  {
    id: "rabbit-hole",
    rating: 4.0,
    title: { zh: "兔子洞大冒险", en: "Rabbit Hole" },
    tagline: { zh: "地底世界的平台跳跃冒险", en: "A platformer under the burrow" },
    genre: "casual",
    tags: ["casual", "pixel"],
    price: { type: "free" },
    platforms: ["android", "ios"],
    hot: 69, fresh: false, free: true, soon: false,
  },
  {
    id: "neon-runner",
    rating: 3.9,
    title: { zh: "霓虹跑者", en: "Neon Runner" },
    tagline: { zh: "在赛博城市天际线上狂奔", en: "Sprint across the cyber skyline" },
    genre: "action",
    tags: ["action", "pixel"],
    price: { type: "free" },
    platforms: ["android"],
    hot: 64, fresh: true, free: true, soon: false,
  },
  {
    id: "dungeon-caged",
    rating: 4.5,
    title: { zh: "地下囚徒", en: "Dungeon Caged" },
    tagline: { zh: "随机地牢,每一步都是抉择", en: "A roguelike of hard choices" },
    genre: "rpg",
    tags: ["rpg", "pixel"],
    price: { type: "paid", amount: 15 },
    platforms: ["android", "ios"],
    hot: 81, fresh: true, free: false, soon: false,
  },
  {
    id: "mecha-era",
    rating: null,
    title: { zh: "机甲纪元", en: "Mecha Era" },
    tagline: { zh: "驾驶百吨机甲,守卫最后的城市", en: "Pilot a 100-ton mecha" },
    genre: "action",
    tags: ["action", "sim"],
    price: { type: "soon" },
    platforms: ["android", "ios"],
    hot: 95, fresh: false, free: false, soon: true,
  },
  {
    id: "kingdom-tales",
    rating: null,
    title: { zh: "王国旧事", en: "Kingdom Tales" },
    tagline: { zh: "从一座村庄开始的中世纪史诗", en: "A medieval saga from one village" },
    genre: "sim",
    tags: ["sim", "rpg"],
    price: { type: "soon" },
    platforms: ["android", "ios"],
    hot: 88, fresh: false, free: false, soon: true,
  },
  {
    id: "star-caravan",
    rating: 4.4,
    title: { zh: "星轨商队", en: "Star Caravan" },
    tagline: { zh: "带领商队穿越星海,在异星城镇间倒卖传说", en: "Lead a caravan across the star sea" },
    genre: "rpg",
    tags: ["rpg", "pixel"],
    price: { type: "paid", amount: 25 },
    platforms: ["android", "ios"],
    hot: 83, fresh: true, free: false, soon: false,
  },
  {
    id: "steam-chef",
    rating: 4.2,
    title: { zh: "蒸汽小厨", en: "Steam Chef" },
    tagline: { zh: "在齿轮与蒸汽间掌勺,出餐速度就是一切", en: "Cook in a steampunk kitchen rush" },
    genre: "sim",
    tags: ["sim", "casual"],
    price: { type: "paid", amount: 18 },
    platforms: ["android"],
    hot: 72, fresh: true, free: false, soon: false,
  },
  {
    id: "waste-courier",
    rating: 4.0,
    title: { zh: "废土快递", en: "Wasteland Express" },
    tagline: { zh: "末日之后,最后一封信也要送到", en: "Deliver the last letters after doomsday" },
    genre: "survival",
    tags: ["survival", "action"],
    price: { type: "free" },
    platforms: ["ios"],
    hot: 77, fresh: false, free: true, soon: false,
  },
  {
    id: "paper-dungeon",
    rating: null,
    title: { zh: "纸间地牢", en: "Paper Dungeon" },
    tagline: { zh: "在折纸与涂鸦之间,翻页即换一层地牢", en: "A dungeon folded from paper" },
    genre: "rpg",
    tags: ["rpg", "pixel"],
    price: { type: "soon" },
    platforms: ["android", "ios"],
    hot: 90, fresh: false, free: false, soon: true,
  },
];

/* 首页轮播(引用 GAMES 的 id) */
const CAROUSEL = ["survival-hope", "stardust-farm", "abyss-echo"];

/* 游戏封面配色映射(game.id → PALETTES key) */
const PALETTE_BY_GAME = {
  "survival-hope": "nightGreen", "stardust-farm": "nightPurple", "abyss-echo": "deepBlue",
  "neko-mart": "sunset", "ninja-strike": "bloodRed", "rabbit-hole": "meadow",
  "neon-runner": "neonPink", "dungeon-caged": "brownDun", "mecha-era": "ironRed",
  "kingdom-tales": "golden", "star-caravan": "aurora", "steam-chef": "candy",
  "waste-courier": "rust", "paper-dungeon": "dusk",
};

/* 像素封面配色:sky 三段渐变 / 山三层 / 地面 / 点缀 */
const PALETTES = {
  nightGreen:  { sky: ["#0c1a12", "#14291c", "#1e3b28"], hills: ["#122418", "#0d1a11", "#09120b"], ground: "#060a07", accent: "#57d98a", moon: "#d6ffe4", stars: true },
  nightPurple: { sky: ["#191033", "#241a4d", "#33246b"], hills: ["#1c123a", "#150d2b", "#0f081e"], ground: "#0a0616", accent: "#b18cff", moon: "#efe6ff", stars: true },
  deepBlue:    { sky: ["#06121f", "#0a1e33", "#0f2c4a"], hills: ["#0a1a2c", "#071220", "#040b13"], ground: "#030810", accent: "#4fc3ff", moon: "#dcefff", stars: true },
  sunset:      { sky: ["#3a1230", "#6e1f3c", "#a83a4a"], hills: ["#33122a", "#230c1d", "#160712"], ground: "#120610", accent: "#ffb057", moon: "#ffe3b8", stars: false },
  bloodRed:    { sky: ["#1a0508", "#2e0a10", "#4a1018"], hills: ["#200609", "#160406", "#0d0203"], ground: "#0a0103", accent: "#ff4d5e", moon: "#ff8a8a", stars: true },
  meadow:      { sky: ["#0f2e3f", "#175061", "#2b7d8c"], hills: ["#14442f", "#0e301f", "#091f14"], ground: "#0a1810", accent: "#a4f26b", moon: "#f4ffe0", stars: false },
  golden:      { sky: ["#2d1a08", "#5a3210", "#8c5a1e"], hills: ["#2a1a0a", "#1c1106", "#120a04"], ground: "#0d0703", accent: "#ffd06b", moon: "#fff0c8", stars: false },
  ironRed:     { sky: ["#14161c", "#1f242e", "#2c333f"], hills: ["#1a1e26", "#12151b", "#0b0d11"], ground: "#080a0d", accent: "#ff6b4a", moon: "#ffb8a0", stars: true },
  brownDun:    { sky: ["#1c130c", "#2c1e12", "#3f2d1a"], hills: ["#20150c", "#150d08", "#0d0805"], ground: "#0a0604", accent: "#d99c4f", moon: "#ffe8c4", stars: true },
  neonPink:    { sky: ["#12081f", "#200f38", "#331551"], hills: ["#1b0c30", "#120820", "#0a0413"], ground: "#070310", accent: "#ff2ea6", moon: "#ffb8e8", stars: true },
  aurora:      { sky: ["#04121a", "#0a2733", "#123f4a"], hills: ["#0a2028", "#06161c", "#030c10"], ground: "#02090c", accent: "#4be3c8", moon: "#d8fff4", stars: true },
  candy:       { sky: ["#2a0f2e", "#57164a", "#8f2d5e"], hills: ["#3a1236", "#280d24", "#190816"], ground: "#12050f", accent: "#ff8ac2", moon: "#ffe0f0", stars: false },
  rust:        { sky: ["#1c0f08", "#361a0d", "#54290f"], hills: ["#2a1409", "#1c0d05", "#100702"], ground: "#0a0402", accent: "#ff9d4d", moon: "#ffd9ad", stars: true },
  dusk:        { sky: ["#14121d", "#211d30", "#312b47"], hills: ["#1c1828", "#130f1c", "#0b0812"], ground: "#070509", accent: "#b9a7ff", moon: "#e8e2ff", stars: true },
};
