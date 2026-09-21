/* ==========================================================================
   main.js —— 项目渲染、技能渲染、联系列表、汉堡菜单、滚动渐显、花瓣、
   明神门注入、底部花瓣堆积、导航高亮
   无 JS 时内容仍完整可见（渐进增强）；prefers-reduced-motion 时关闭动效
   ========================================================================== */

(function () {
  "use strict";

  document.body.classList.add("js");

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 1. 渲染技能标签 ---------- */
  var SKILLS = ["Python", "Java", "TypeScript", "HTML/CSS", "前后端开发", "数据可视化", "AI 应用构建"];
  var skillsList = document.getElementById("skills-list");
  if (skillsList) {
    SKILLS.forEach(function (s) {
      var tag = document.createElement("span");
      tag.className = "skill-tag";
      tag.textContent = s;
      skillsList.appendChild(tag);
    });
  }

  /* ---------- 2. 渲染项目作品 ---------- */
  var projectList = document.getElementById("project-list");
  function renderProjects() {
    var data = window.PROJECTS || [];
    data.forEach(function (p, i) {
      var item = document.createElement("article");
      item.className = "p-item" + (p.variant === "full" ? " p-item--full" : "");

      var top = document.createElement("div");
      top.className = "p-top";
      var idx = document.createElement("span");
      idx.className = "p-index";
      idx.textContent = window.INDEX_NUM[i + 1] || String(i + 1).padStart(2, "0");
      var title = document.createElement("h3");
      title.className = "p-title";
      title.textContent = p.title;
      var cat = document.createElement("span");
      cat.className = "p-cat";
      cat.textContent = p.category;
      top.appendChild(idx);
      top.appendChild(title);
      top.appendChild(cat);
      item.appendChild(top);

      var meta = document.createElement("p");
      meta.className = "p-meta";
      meta.innerHTML = "完成时间 <time>" + p.date + "</time>";
      item.appendChild(meta);

      var body = document.createElement("div");
      body.className = "p-body";

      var textCol = document.createElement("div");
      var desc = document.createElement("p");
      desc.className = "p-desc";
      desc.textContent = p.desc;
      var stack = document.createElement("div");
      stack.className = "p-stack";
      (p.stack || []).forEach(function (t) {
        var tag = document.createElement("span");
        tag.textContent = t;
        stack.appendChild(tag);
      });
      textCol.appendChild(desc);
      textCol.appendChild(stack);

      var fig = document.createElement("figure");
      fig.className = "p-figure";
      var img = document.createElement("img");
      img.src = p.image;
      img.alt = p.title + " 界面示意图";
      img.loading = "lazy";
      img.width = 800;
      img.height = 600;
      fig.appendChild(img);

      if (p.variant === "full") {
        body.appendChild(fig);
        body.appendChild(textCol);
      } else {
        body.appendChild(textCol);
        body.appendChild(fig);
      }
      item.appendChild(body);
      projectList.appendChild(item);
    });
  }
  renderProjects();

  /* ---------- 3. 渲染联系方式 ---------- */
  var CONTACTS = [
    { label: "邮箱", value: "xiaohe@example.com", href: "mailto:xiaohe@example.com" },
    { label: "微信", value: "xiaohezi" },
    { label: "GitHub", value: "github.com/xiaohe-dev", href: "https://github.com/xiaohe-dev" },
    { label: "主页", value: "xiaohe.dev", href: "https://xiaohe.dev" },
    { label: "所在地", value: "中国 · 广州" }
  ];
  var contactList = document.getElementById("contact-list");
  if (contactList) {
    CONTACTS.forEach(function (c) {
      var li = document.createElement("li");
      var span = document.createElement("span");
      span.className = "c-label";
      span.textContent = c.label;
      if (c.href) {
        var a = document.createElement("a");
        a.href = c.href;
        a.target = c.href.indexOf("mailto:") === 0 ? "_self" : "_blank";
        a.rel = "noopener";
        a.appendChild(span);
        var val = document.createElement("span");
        val.textContent = c.value;
        a.appendChild(val);
        li.appendChild(a);
      } else {
        span.textContent = c.label;
        li.appendChild(span);
        var val = document.createElement("span");
        val.textContent = c.value;
        li.appendChild(val);
      }
      contactList.appendChild(li);
    });
  }

  /* ---------- 4. 移动端汉堡菜单 / 抽屉 ---------- */
  var menuBtn = document.querySelector(".menu-btn");
  var drawer = document.getElementById("mobile-drawer");
  var backdrop = document.getElementById("drawer-backdrop");

  function openDrawer() {
    if (!drawer || !backdrop) return;
    drawer.hidden = false;
    backdrop.hidden = false;
    requestAnimationFrame(function () {
      drawer.classList.add("is-open");
      backdrop.classList.add("is-visible");
    });
    if (menuBtn) {
      menuBtn.classList.add("is-open");
      menuBtn.setAttribute("aria-expanded", "true");
    }
    document.body.style.overflow = "hidden";
  }
  function closeDrawer() {
    if (!drawer || !backdrop) return;
    drawer.classList.remove("is-open");
    backdrop.classList.remove("is-visible");
    if (menuBtn) {
      menuBtn.classList.remove("is-open");
      menuBtn.setAttribute("aria-expanded", "false");
    }
    document.body.style.overflow = "";
    setTimeout(function () {
      drawer.hidden = true;
      backdrop.hidden = true;
    }, 400);
  }
  if (menuBtn) menuBtn.addEventListener("click", function () {
    if (drawer && drawer.classList.contains("is-open")) closeDrawer();
    else openDrawer();
  });
  if (backdrop) backdrop.addEventListener("click", closeDrawer);
  if (drawer) {
    drawer.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeDrawer);
    });
  }
  window.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeDrawer();
  });

  /* ---------- 5. 滚动渐显（标题 / 项目 / 关于 / 联系） + 卡片刀痕扫光 + 樱花粒子 ---------- */
  var revealEls = document.querySelectorAll(
    ".section-head, .about-body, .about-points, .contact-ways, .p-item"
  );

  function spawnPetalsAt(el, count) {
    if (reduceMotion) return;
    var rect = el.getBoundingClientRect();
    var cx = rect.left + rect.width / 2;
    var cy = rect.top + rect.height / 2;
    for (var k = 0; k < count; k++) {
      var p = document.createElement("span");
      p.className = "burst-petal";
      if (Math.random() < 0.25) p.classList.add("petal--ink");
      var ang = Math.random() * Math.PI * 2;
      var dist = 40 + Math.random() * 120;
      p.style.left = cx + "px";
      p.style.top = cy + "px";
      p.style.setProperty("--bx", Math.cos(ang) * dist + "px");
      p.style.setProperty("--by", Math.sin(ang) * dist + "px");
      p.style.setProperty("--br", (Math.random() * 540 - 270).toFixed(0) + "deg");
      p.style.setProperty("--bs", (0.5 + Math.random() * 0.9).toFixed(2));
      p.style.animation = "petalBurst " + (0.7 + Math.random() * 0.5).toFixed(2) + "s var(--ease) forwards";
      document.body.appendChild(p);
      (function (node) {
        setTimeout(function () { node.remove(); }, 1400);
      })(p);
    }
  }

  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
            if (entry.target.classList.contains("p-item")) {
              /* 注入刀痕扫光层 */
              if (!entry.target.querySelector(".slash-sweep")) {
                var sweep = document.createElement("span");
                sweep.className = "slash-sweep";
                entry.target.appendChild(sweep);
              }
              /* 墨印扩散 + 樱花粒子 */
              var title = entry.target.querySelector(".p-title");
              if (title) {
                title.style.animation = "inkDiffuse 0.9s var(--ease) both";
              }
              spawnPetalsAt(entry.target, 9);
            }
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- 6. 导航高亮 ---------- */
  var navLinks = document.querySelectorAll(".sidenav a");
  var sections = ["hero", "projects", "about", "contact"].map(function (id) {
    return document.getElementById(id);
  }).filter(Boolean);

  function setActive(id) {
    navLinks.forEach(function (a) {
      var hit = a.getAttribute("href") === "#" + id;
      a.classList.toggle("is-active", hit);
    });
  }

  if ("IntersectionObserver" in window && sections.length && navLinks.length) {
    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- 7. 明神门注入（侧栏视觉主角 + Hero 角落装饰 + 环绕粒子） ---------- */
  function toriiSvg(cls) {
    return '<svg class="' + cls + '" viewBox="0 0 200 260" fill="none" aria-hidden="true">' +
      '<path class="t-pillar-l" d="M45 130V250"/>' +
      '<path class="t-pillar-r" d="M155 130V250"/>' +
      '<path class="t-base-l" d="M30 250H70"/>' +
      '<path class="t-base-r" d="M130 250H170"/>' +
      '<path class="t-beam" d="M30 128H170"/>' +
      '<path class="t-curve" d="M20 92Q100 50 180 92"/>' +
      '</svg>';
  }

  var identity = document.querySelector(".identity");
  if (identity && !identity.querySelector(".torii-mark")) {
    identity.insertAdjacentHTML(
      "afterbegin",
      toriiSvg("torii-mark") + '<div class="torii-orbit" aria-hidden="true"></div>'
    );
    var orbit = identity.querySelector(".torii-orbit");
    for (var oi = 0; oi < 10; oi++) {
      var dot = document.createElement("span");
      dot.className = "orbit-dot";
      dot.style.animationDelay = -(oi * 3.2 / 10).toFixed(2) + "s";
      orbit.appendChild(dot);
    }
  }

  var hero = document.querySelector(".hero");
  if (hero && !hero.querySelector(".torii-mark--hero")) {
    hero.insertAdjacentHTML("beforeend", toriiSvg("torii-mark--hero"));
  }

  /* ---------- 8. 樱花花瓣（背景多层纵深 + 前景大瓣掠过 + 底部堆积） ---------- */
  if (!reduceMotion) {
    var scene = document.querySelector(".petals-scene");
    var front = document.querySelector(".petals-front");

    function rand(min, max) { return min + Math.random() * (max - min); }

    function makePetal(container, cls, wMin, wMax, durMin, durMax, anim) {
      var p = document.createElement("span");
      var w = rand(wMin, wMax);
      p.className = "petal " + cls;
      if (Math.random() < 0.22) p.className += " petal--ink";
      p.style.left = rand(0, 100) + "%";
      p.style.width = w + "px";
      p.style.height = w + "px";
      var dur = rand(durMin, durMax);
      p.style.animationDuration = dur.toFixed(2) + "s";
      p.style.animationDelay = (-Math.random() * dur).toFixed(2) + "s";
      if (anim) p.style.animationName = anim;
      container.appendChild(p);
    }

    /* 背景层：数量多、分纵深、偏淡（慢落 / 缩放 / 摇摆） */
    var B_LAYERS = [
      { cls: "petal--far",   wMin: 8,  wMax: 13, durMin: 30, durMax: 46, anim: "petalFallA" },
      { cls: "petal--mid",   wMin: 15, wMax: 22, durMin: 20, durMax: 30, anim: "petalFallB" },
      { cls: "petal--near",  wMin: 24, wMax: 32, durMin: 13, durMax: 20, anim: "petalSway" },
      { cls: "petal--close", wMin: 34, wMax: 44, durMin: 10, durMax: 15, anim: "petalSway" }
    ];
    if (scene) {
      for (var i = 0; i < 48; i++) {
        var layer = B_LAYERS[Math.floor(Math.random() * B_LAYERS.length)];
        makePetal(scene, layer.cls, layer.wMin, layer.wMax, layer.durMin, layer.durMax, layer.anim);
      }
    }

    /* 前景层：更大更明显（30-50px），频繁掠过、部分摇摆停顿 */
    if (front) {
      for (var f = 0; f < 20; f++) {
        var sweep = Math.random() < 0.55;
        makePetal(front, sweep ? "petal--front petal--sweep" : "petal--front petal--sway",
                  sweep ? 28 : 30, sweep ? 46 : 52, sweep ? 5 : 11, sweep ? 9 : 17,
                  sweep ? "petalSweep" : "petalSway");
      }
    }

    /* 底部堆积：沿视口底缘横躺的樱花，营造神社前落樱堆积感 */
    var bank = document.createElement("div");
    bank.className = "petal-bank";
    bank.setAttribute("aria-hidden", "true");
    for (var b = 0; b < 22; b++) {
      var sp = document.createElement("span");
      sp.className = "petal petal--settled" + (Math.random() < 0.32 ? " petal--ink" : "");
      var sw = rand(16, 40);
      sp.style.left = rand(0, 98) + "%";
      sp.style.width = sw + "px";
      sp.style.height = sw + "px";
      sp.style.bottom = rand(-12, 12) + "px";
      sp.style.transform = "rotate(" + rand(-95, 95).toFixed(0) + "deg)";
      bank.appendChild(sp);
    }
    document.body.appendChild(bank);

    /* 墨粒漂浮层：缓慢上升的氛围粒子 */
    var inkLayer = document.createElement("div");
    inkLayer.className = "ink-particles";
    inkLayer.setAttribute("aria-hidden", "true");
    for (var ip = 0; ip < 26; ip++) {
      var d = document.createElement("span");
      d.className = "ink-dot";
      var dw = rand(3, 9);
      d.style.width = dw + "px";
      d.style.height = dw + "px";
      d.style.left = rand(0, 100) + "%";
      d.style.setProperty("--dx", rand(-60, 60) + "px");
      d.style.animationDuration = rand(12, 26).toFixed(1) + "s";
      d.style.animationDelay = -rand(0, 20).toFixed(1) + "s";
      inkLayer.appendChild(d);
    }
    document.body.appendChild(inkLayer);
  }

  /* ---------- 9. 自定义光标（樱花默认 / 武士刀 hover 交互元素） ---------- */
  if (!reduceMotion && window.matchMedia("(pointer: fine)").matches) {
    var cursor = document.createElement("span");
    cursor.className = "cursor-dot";
    cursor.setAttribute("aria-hidden", "true");
    document.body.appendChild(cursor);

    var mx = window.innerWidth / 2, my = window.innerHeight / 2;
    var cx = mx, cy = my;
    window.addEventListener("mousemove", function (e) {
      mx = e.clientX; my = e.clientY;
    }, { passive: true });

    function tickCursor() {
      cx += (mx - cx) * 0.28;
      cy += (my - cy) * 0.28;
      cursor.style.transform = "translate(" + cx + "px," + cy + "px) translate(-50%,-50%)";
      requestAnimationFrame(tickCursor);
    }
    tickCursor();

    var interactive = "a, button, .p-item, .skill-tag, .hero-cta, .torii-mark, .theme-switch, .p-figure";
    document.addEventListener("mouseover", function (e) {
      if (e.target.closest(interactive)) cursor.classList.add("is-sword");
    });
    document.addEventListener("mouseout", function (e) {
      if (e.target.closest(interactive)) cursor.classList.remove("is-sword");
    });
    document.addEventListener("mousedown", function () { cursor.classList.add("is-click"); });
    document.addEventListener("mouseup", function () { cursor.classList.remove("is-click"); });
  }

  /* ---------- 10. 点击任意位置樱花爆发 ---------- */
  if (!reduceMotion) {
    document.addEventListener("click", function (e) {
      var count = 18;
      for (var i = 0; i < count; i++) {
        var p = document.createElement("span");
        p.className = "burst-petal";
        if (Math.random() < 0.22) p.classList.add("petal--ink");
        var ang = Math.random() * Math.PI * 2;
        var dist = 30 + Math.random() * 160;
        p.style.left = e.clientX + "px";
        p.style.top = e.clientY + "px";
        p.style.setProperty("--bx", Math.cos(ang) * dist + "px");
        p.style.setProperty("--by", Math.sin(ang) * dist + "px");
        p.style.setProperty("--br", (Math.random() * 720 - 360).toFixed(0) + "deg");
        p.style.setProperty("--bs", (0.6 + Math.random() * 1.1).toFixed(2));
        p.style.animation = "petalBurst " + (0.8 + Math.random() * 0.6).toFixed(2) + "s var(--ease) forwards";
        document.body.appendChild(p);
        (function (node) {
          setTimeout(function () { node.remove(); }, 1600);
        })(p);
      }
    });
  }

  /* ---------- 11. 项目卡片点击展开 + 樱花飞散 + 标题划线 ---------- */
  document.addEventListener("click", function (e) {
    var card = e.target.closest(".p-item");
    if (!card) return;
    try {
      var wasExpanded = card.classList.contains("p-item--expanded");
      document.querySelectorAll(".p-item--expanded").forEach(function (c) {
        c.classList.remove("p-item--expanded");
      });
      if (!wasExpanded) {
        card.classList.add("p-item--expanded");
        spawnPetalsAt(card, 22);
      }
    } catch (err) { /* ignore */ }
  });

  /* ---------- 12. 明神门交互：hover 增粒子 / click 开门 + 樱花爆发 ---------- */
  var torii = document.querySelector(".identity .torii-mark");
  var orbitBox = document.querySelector(".identity .torii-orbit");
  if (torii) {
    torii.addEventListener("mouseenter", function () {
      if (orbitBox) {
        for (var i = 0; i < 3; i++) {
          var d = document.createElement("span");
          d.className = "orbit-dot";
          d.style.animationDelay = -(Math.random() * 3.2).toFixed(2) + "s";
          orbitBox.appendChild(d);
        }
      }
    });
    torii.addEventListener("mouseleave", function () {
      if (orbitBox) {
        var dots = orbitBox.querySelectorAll(".orbit-dot");
        while (dots.length > 10) { dots[dots.length - 1].remove(); }
      }
    });
  }
  /* 明神门点击用文档委托，避免 SVG 子元素点击事件丢失 */
  document.addEventListener("click", function (e) {
    var tm = e.target.closest(".identity .torii-mark");
    if (!tm) return;
    try {
      tm.classList.remove("is-opening");
      void tm.offsetWidth;
      tm.classList.add("is-opening");
      setTimeout(function () { tm.classList.remove("is-opening"); }, 750);
      var rect = tm.getBoundingClientRect();
      for (var i = 0; i < 36; i++) {
        var p = document.createElement("span");
        p.className = "burst-petal";
        if (Math.random() < 0.3) p.classList.add("petal--ink");
        var ang = Math.random() * Math.PI * 2;
        var dist = 40 + Math.random() * 200;
        p.style.left = (rect.left + rect.width / 2) + "px";
        p.style.top = (rect.top + rect.height / 2) + "px";
        p.style.setProperty("--bx", Math.cos(ang) * dist + "px");
        p.style.setProperty("--by", Math.sin(ang) * dist + "px");
        p.style.setProperty("--br", (Math.random() * 720 - 360).toFixed(0) + "deg");
        p.style.setProperty("--bs", (0.7 + Math.random() * 1.2).toFixed(2));
        p.style.animation = "petalBurst " + (0.9 + Math.random() * 0.7).toFixed(2) + "s var(--ease) forwards";
        document.body.appendChild(p);
        (function (node) { setTimeout(function () { node.remove(); }, 1800); })(p);
      }
    } catch (err) { /* ignore */ }
  });

  /* ---------- 13. 隐藏主题切换彩蛋（右下角樱花角印 / 三连击明神门） ---------- */
  var THEME_ORDER = ["theme-sakura", "theme-samurai", "theme-shrine"];
  var THEME_LABEL = { "theme-sakura": "樱花", "theme-samurai": "武士", "theme-shrine": "神社" };
  var currentTheme = THEME_ORDER[0];
  document.body.classList.add(currentTheme);

  function cycleTheme() {
    var idx = THEME_ORDER.indexOf(currentTheme);
    idx = (idx + 1) % THEME_ORDER.length;
    document.body.classList.remove(currentTheme);
    currentTheme = THEME_ORDER[idx];
    document.body.classList.add(currentTheme);
    showThemeHint();
  }

  function showThemeHint() {
    var hint = document.querySelector(".theme-hint");
    if (!hint) {
      hint = document.createElement("div");
      hint.className = "theme-hint";
      hint.style.cssText = "position:fixed;left:50%;top:18%;transform:translateX(-50%);" +
        "z-index:99997;font-family:var(--font-display);font-size:1.4rem;letter-spacing:0.3em;" +
        "color:var(--accent-deep);opacity:0;transition:opacity .4s var(--ease);pointer-events:none;" +
        "text-shadow:0 0 12px rgba(216,138,148,.5);";
      document.body.appendChild(hint);
    }
    hint.textContent = "· " + THEME_LABEL[currentTheme] + "之境 ·";
    hint.style.opacity = "0.9";
    clearTimeout(hint._t);
    hint._t = setTimeout(function () { hint.style.opacity = "0"; }, 1400);
  }

  /* 右下角隐藏角印切换器 */
  var sw = document.createElement("div");
  sw.className = "theme-switch";
  sw.setAttribute("aria-label", "切换主题");
  var tip = document.createElement("span");
  tip.className = "theme-switch__tip";
  tip.textContent = "切 换 主 题";
  sw.appendChild(tip);
  document.body.appendChild(sw);
  sw.addEventListener("click", function (e) {
    e.stopPropagation();
    cycleTheme();
  });

  /* 彩蛋：明神门三连击也切换主题（委托） */
  var toriiClickTimes = [];
  document.addEventListener("click", function (e) {
    if (!e.target.closest(".identity .torii-mark")) return;
    var now = Date.now();
    toriiClickTimes = toriiClickTimes.filter(function (t) { return now - t < 800; });
    toriiClickTimes.push(now);
    if (toriiClickTimes.length >= 3) {
      toriiClickTimes = [];
      cycleTheme();
    }
  });

  /* 彩蛋：键盘 T 键切换主题 */
  window.addEventListener("keydown", function (e) {
    if (e.key === "t" || e.key === "T") cycleTheme();
  });

  /* ---------- 14. 顶部主题切换按钮（浅色 / 深色，localStorage 记忆） ---------- */
  (function () {
    var THEME_KEY = "portfolio-theme";
    var root = document.documentElement;
    var toggle = document.querySelector(".theme-toggle");
    if (!toggle) return;

    function applyTheme(dark) {
      /* 与隐藏彩蛋三主题互斥：切换浅/深时重置为樱花基调，避免变量冲突 */
      document.body.classList.remove("theme-samurai", "theme-shrine");
      if (!dark) document.body.classList.add("theme-sakura");
      root.classList.toggle("theme-dark", dark);
      document.body.classList.toggle("theme-dark", dark);
      toggle.classList.toggle("is-dark", dark);
      toggle.setAttribute("aria-pressed", dark ? "true" : "false");
      toggle.setAttribute("aria-label", dark ? "切换到浅色主题" : "切换到深色主题");
    }

    var saved = null;
    try { saved = localStorage.getItem(THEME_KEY); } catch (e) { saved = null; }
    applyTheme(saved === "dark");

    toggle.addEventListener("click", function () {
      var dark = root.classList.contains("theme-dark");
      applyTheme(!dark);
      try {
        localStorage.setItem(THEME_KEY, dark ? "light" : "dark");
      } catch (e) { /* localStorage 不可用时忽略 */ }
    });
  })();
})();
