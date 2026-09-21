/* ==========================================================================
   theme-init.js —— 主题预加载：首帧渲染前根据 localStorage 应用深色主题，
   避免页面加载时出现浅色闪烁。仅做前置 class 设置，交互逻辑见 main.js。
   ========================================================================== */
(function () {
  "use strict";
  try {
    if (localStorage.getItem("portfolio-theme") === "dark") {
      document.documentElement.classList.add("theme-dark");
    }
  } catch (e) { /* localStorage 不可用时忽略 */ }
})();
