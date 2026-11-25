/* 站点渲染逻辑：数据全部来自 assets/data/content.js 的 site 对象 */
(function () {
  "use strict";

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  /* ---------- 基础信息 ---------- */
  function renderBase() {
    document.title = site.name + " · 作品集";
    $(".nav__name").textContent = site.name;
    $("#heroName").textContent = site.name;
    $("#heroTitle").textContent = site.title;
    $("#heroTagline").textContent = site.tagline;
    $("#heroIntro").textContent = site.intro;
    $("#aboutText").textContent = site.intro;

    const og = document.querySelector('meta[property="og:title"]');
    if (og) og.setAttribute("content", site.name + " · 作品集");

    $("#copyLine").textContent =
      "© " + new Date().getFullYear() + " " + site.name + " · 个人作品集";

    const portrait = $("#portrait");
    if (site.portrait) {
      portrait.src = site.portrait;
      portrait.onerror = () => {
        portrait.style.display = "none";
        document.querySelector(".hero__portraitNote").style.display = "none";
      };
    }

    if (site.resume) {
      ["#heroResume", "#navResume"].forEach((sel) => {
        const el = $(sel);
        if (!el) return;
        el.href = site.resume;
        el.hidden = false;
      });
    }
  }

  /* ---------- 数字成绩 ---------- */
  function renderStats() {
    const ul = $("#statsList");
    if (!site.stats || !site.stats.length) {
      $("#stats").hidden = true;
      return;
    }
    site.stats.forEach((s) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <div class="stats__num">${s.num}<small>${s.unit || ""}</small></div>
        <div class="stats__label">${s.label || ""}</div>`;
      ul.appendChild(li);
    });
  }

  /* ---------- 作品 ---------- */
  function renderWorks() {
    const grid = $("#grid");
    const filters = $("#filters");
    // 分类 = 手动配置的分类 + 作品里实际出现的分类（自动补齐）
    const seen = new Set();
    const cats = ["全部"];
    (site.categories || []).forEach((c) => {
      if (c !== "全部" && !seen.has(c)) { seen.add(c); cats.push(c); }
    });
    site.works.forEach((w) => {
      if (w.category && !seen.has(w.category)) { seen.add(w.category); cats.push(w.category); }
    });

    cats.forEach((cat, i) => {
      const btn = document.createElement("button");
      btn.textContent = cat;
      if (i === 0) btn.classList.add("is-active");
      btn.addEventListener("click", () => {
        filters.querySelectorAll("button").forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        drawGrid(cat === "全部" ? null : cat);
      });
      filters.appendChild(btn);
    });

    function drawGrid(cat) {
      grid.innerHTML = "";
      const list = cat ? site.works.filter((w) => w.category === cat) : site.works;
      list.forEach((w, i) => {
        const card = document.createElement("button");
        card.className = "card";
        card.style.animationDelay = i * 55 + "ms";
        card.innerHTML = `
          <div class="card__media">
            <img src="${w.image}" alt="${w.title}" loading="lazy">
            ${w.video ? '<span class="card__play" aria-hidden="true">▶</span>' : ""}
          </div>
          <div class="card__meta">
            <span class="card__title">${w.title}</span>
            <span class="card__year">${w.year || ""}</span>
          </div>
          <div class="card__cat">${w.category || ""}</div>`;
        card.addEventListener("click", () => openLightbox(w));
        grid.appendChild(card);
      });
    }

    drawGrid(null);
  }

  /* ---------- 荣誉 ---------- */
  function renderAwards() {
    const ol = $("#timeline");
    const raw = (site.awards || []).map((a) =>
      typeof a === "string" ? { year: "", title: a, org: "" } : a
    );
    raw.sort((a, b) => String(b.year).localeCompare(String(a.year)));

    raw.forEach((a) => {
      const li = document.createElement("li");
      li.innerHTML = `
        ${a.year ? `<div class="timeline__year">${a.year}</div>` : ""}
        <div class="timeline__title">${a.title}</div>
        ${a.org ? `<div class="timeline__org">${a.org}</div>` : ""}`;
      ol.appendChild(li);
    });

    const certs = $("#certs");
    const hint = $("#certHint");
    // awardImages 是 content.js 里的顶层 const，挂在词法作用域而非 window 上
    const certList = (typeof awardImages !== "undefined" && awardImages) ? awardImages : [];
    if (hint) hint.hidden = certList.length > 0;

    certList.forEach((c) => {
      const fig = document.createElement("figure");
      fig.innerHTML = `<img src="${c.src}" alt="${c.caption || ""}" loading="lazy">
                       <figcaption>${c.caption || ""}</figcaption>`;
      fig.addEventListener("click", () =>
        openLightbox({ title: c.caption || "", image: c.src })
      );
      certs.appendChild(fig);
    });
  }

  /* ---------- 技能 / 证书 ---------- */
  function renderSkills() {
    const ul = $("#skillList");
    if (!ul) return;
    (site.skills || []).forEach((s) => {
      const li = document.createElement("li");
      li.textContent = s;
      ul.appendChild(li);
    });
    if (!(site.skills || []).length) ul.closest(".about__col").querySelector("h3")?.remove(), ul.remove();

    const cl = $("#certList");
    if (!cl) return;
    (site.certs || []).forEach((c) => {
      const li = document.createElement("li");
      li.textContent = c;
      cl.appendChild(li);
    });
  }

  /* ---------- 经历 / 教育 ---------- */
  function fillExp(sel, list, hideWhenEmpty) {
    const ul = $(sel);
    if (!ul) return;
    if (!list || !list.length) {
      if (hideWhenEmpty) {
        const h = ul.previousElementSibling;
        if (h && h.tagName === "H3") h.style.display = "none";
        ul.style.display = "none";
      }
      return;
    }
    list.forEach((e) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <span class="exp__period">${e.period}</span>
        <span><span class="exp__role">${e.role}</span>
        <span class="exp__org">${e.org ? " · " + e.org : ""}</span></span>`;
      ul.appendChild(li);
    });
  }

  /* ---------- 联系 ---------- */
  function renderContact() {
    const ul = $("#contactList");
    const c = site.contact || {};
    const map = [
      ["邮箱", c.email, c.email ? "mailto:" + c.email : null],
      ["电话", c.phone, c.phone ? "tel:" + c.phone.replace(/\s/g, "") : null],
      ["微信", c.wechat, null],
      ["城市", c.city, null],
    ];
    map.forEach(([k, v, href]) => {
      if (!v) return;
      const li = document.createElement("li");
      li.innerHTML = `<span class="k">${k}</span><span class="v">${
        href ? `<a href="${href}">${v}</a>` : v
      }</span>`;
      ul.appendChild(li);
    });
  }

  /* ---------- 灯箱（图片 / 视频） ---------- */
  function openLightbox(w) {
    const box = $("#lightbox");
    const fig = box.querySelector(".lightbox__figure");
    const old = fig.querySelector("video");
    if (old) old.remove();

    const img = $("#lbImg");
    if (w.video) {
      img.style.display = "none";
      const v = document.createElement("video");
      v.src = w.video;
      v.controls = true;
      v.autoplay = true;
      v.playsInline = true;
      if (w.image) v.poster = w.image;
      fig.insertBefore(v, img);
    } else {
      img.style.display = "";
      img.src = w.image;
      img.alt = w.title || "";
    }

    const meta = [w.year, w.client].filter(Boolean).join(" · ");
    const lines = [w.summary || ""].concat(w.detail || []).filter(Boolean);
    $("#lbCap").innerHTML =
      `<strong>${w.title || ""}</strong>` +
      (meta ? `　${meta}` : "") +
      (lines.length ? "<br>" + lines.join("　") : "");
    box.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    const box = $("#lightbox");
    const v = box.querySelector("video");
    if (v) v.pause();
    box.hidden = true;
    document.body.style.overflow = "";
  }

  /* ---------- 交互 ---------- */
  function bindNav() {
    const nav = $("#nav");
    const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  function bindLightbox() {
    $("#lbClose").addEventListener("click", closeLightbox);
    $("#lightbox").addEventListener("click", (e) => {
      if (e.target.id === "lightbox") closeLightbox();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeLightbox();
    });
  }

  function bindReveal() {
    const items = $$(".reveal");
    document.body.classList.add("js-ready");
    if (!("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("is-in");
            io.unobserve(en.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    items.forEach((el) => io.observe(el));
  }

  /* ---------- 启动 ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    renderBase();
    renderStats();
    renderWorks();
    renderAwards();
    renderSkills();
    fillExp("#expList", site.experience, true);
    fillExp("#eduList", site.education, true);
    renderContact();
    bindNav();
    bindLightbox();
    bindReveal();
  });
})();
