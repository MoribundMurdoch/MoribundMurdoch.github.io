(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  const topBtn = document.getElementById("back-to-top");
  if (topBtn) {
    topBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  // Scroll reveals
  const revealables = document.querySelectorAll(".reveal, .tool-card");
  if (revealables.length) {
    if (reduceMotion || !("IntersectionObserver" in window)) {
      revealables.forEach((el) => el.classList.add("is-visible"));
    } else {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
      );
      revealables.forEach((el) => io.observe(el));
    }
  }

  // Soft cursor aura + CSS pointer vars
  if (!reduceMotion) {
    const aura = document.createElement("div");
    aura.className = "aura";
    aura.setAttribute("aria-hidden", "true");
    document.body.appendChild(aura);

    let tx = window.innerWidth * 0.5;
    let ty = window.innerHeight * 0.3;
    let cx = tx;
    let cy = ty;
    let active = false;
    let raf = 0;

    const tick = () => {
      cx += (tx - cx) * 0.12;
      cy += (ty - cy) * 0.12;
      aura.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      document.documentElement.style.setProperty(
        "--pointer-x",
        `${(cx / window.innerWidth) * 100}%`
      );
      document.documentElement.style.setProperty(
        "--pointer-y",
        `${(cy / window.innerHeight) * 100}%`
      );
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener(
      "pointermove",
      (e) => {
        tx = e.clientX;
        ty = e.clientY;
        if (!active) {
          active = true;
          aura.classList.add("is-on");
          raf = requestAnimationFrame(tick);
        }
      },
      { passive: true }
    );

    window.addEventListener(
      "pointerleave",
      () => {
        aura.classList.remove("is-on");
      },
      { passive: true }
    );

    // Card tilt toward pointer
    document.querySelectorAll(".tool-card").forEach((card) => {
      card.addEventListener(
        "pointermove",
        (e) => {
          const r = card.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width;
          const py = (e.clientY - r.top) / r.height;
          const ry = (px - 0.5) * 8;
          const rx = (0.5 - py) * 6;
          card.classList.add("is-tilting");
          card.style.setProperty("--rx", `${rx}deg`);
          card.style.setProperty("--ry", `${ry}deg`);
        },
        { passive: true }
      );
      card.addEventListener(
        "pointerleave",
        () => {
          card.classList.remove("is-tilting");
          card.style.setProperty("--rx", "0deg");
          card.style.setProperty("--ry", "0deg");
        },
        { passive: true }
      );
    });
  }

  // Music player
  const player = document.getElementById("music-player");
  const playBtn = document.getElementById("play-button");
  const pauseBtn = document.getElementById("pause-button");
  if (player && playBtn && pauseBtn) {
    const showPlay = (playing) => {
      playBtn.hidden = playing;
      pauseBtn.hidden = !playing;
    };

    playBtn.addEventListener("click", () => {
      player.play().then(() => showPlay(true)).catch(() => showPlay(false));
    });

    pauseBtn.addEventListener("click", () => {
      player.pause();
      showPlay(false);
    });

    player.addEventListener("ended", () => showPlay(false));
    player.addEventListener("pause", () => showPlay(false));
    player.addEventListener("play", () => showPlay(true));
  }

  // ----- Site search (client-side index of this hub) -----
  initSiteSearch();

  function initSiteSearch() {
    const root = document.querySelector("[data-site-search]");
    if (!root) return;

    const input = root.querySelector(".site-search__input");
    const panel = root.querySelector(".site-search__results");
    if (!input || !panel) return;

    const hubBase = root.getAttribute("data-search-hub") || "";
    const isHubPage = !hubBase;
    let index = [];
    let results = [];
    let active = -1;
    let open = false;

    const sectionLabel = {
      tools: "Inventory",
      "field-kit": "Field kit",
      institute: "Institute",
      stacks: "Stacks",
      murdoverse: "World map",
      dewey: "Call table",
    };

    const clean = (s) => (s || "").replace(/\s+/g, " ").trim();

    const slug = (s) =>
      clean(s)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 48) || "item";

    const ensureId = (el, title) => {
      if (el.id) return el.id;
      let base = "find-" + slug(title);
      let id = base;
      let n = 2;
      while (document.getElementById(id)) {
        id = base + "-" + n++;
      }
      el.id = id;
      return id;
    };

    const primaryHref = (el) => {
      const a =
        el.querySelector(".btn--primary[href]") ||
        el.querySelector(".map-item__site[href]") ||
        el.querySelector("a[href]");
      return a ? a.getAttribute("href") : "";
    };

    const resolveHref = (href, hashId) => {
      if (!href && hashId) {
        return isHubPage ? "#" + hashId : hubBase + "#" + hashId;
      }
      if (!href) return isHubPage ? "./" : hubBase || "./";
      if (/^(https?:|mailto:|#)/i.test(href)) {
        if (href.startsWith("#") && !isHubPage) return hubBase + href;
        return href;
      }
      // relative path from hub root
      if (!isHubPage && !href.startsWith("../") && !href.startsWith("./")) {
        return hubBase + href.replace(/^\//, "");
      }
      return href;
    };

    const pushItem = (items, item) => {
      if (!item.title) return;
      item.hay = clean(
        [
          item.title,
          item.category,
          item.badge,
          item.blurb,
          item.tags,
          item.dewey,
        ].join(" ")
      ).toLowerCase();
      items.push(item);
    };

    const indexDocument = (doc, opts = {}) => {
      const items = [];
      const live = opts.live !== false && doc === document;

      doc.querySelectorAll(".tool-card").forEach((card) => {
        const title = clean(card.querySelector(".tool-card__title")?.textContent);
        const section = card.closest("section[id]")?.id || "tools";
        const tags = clean(card.querySelector(".tool-card__tags")?.textContent);
        const slot = clean(card.querySelector(".tool-card__slot")?.textContent);
        const blurb = clean(card.querySelector(".tool-card__desc")?.textContent);
        const id = live ? ensureId(card, title) : "";
        pushItem(items, {
          title,
          category: sectionLabel[section] || "Tools",
          badge: slot || sectionLabel[section] || "Tool",
          blurb,
          tags,
          dewey: "",
          href: resolveHref(primaryHref(card), id),
          el: live ? card : null,
        });
      });

      doc.querySelectorAll(".class-card").forEach((card) => {
        const title = clean(card.querySelector(".class-card__title")?.textContent);
        const job = clean(card.querySelector(".class-card__job")?.textContent);
        const tags = clean(card.querySelector(".class-card__tags")?.textContent);
        const deweyNum = clean(card.querySelector(".dewey__num")?.textContent);
        const deweyLabel = clean(card.querySelector(".dewey__label")?.textContent);
        const holdings = clean(card.querySelector(".kit-subs")?.textContent);
        const id = live ? ensureId(card, title) : "";
        pushItem(items, {
          title,
          category: "Stacks",
          badge: deweyNum ? "DDC " + deweyNum : "Stack",
          blurb: job,
          tags: clean([tags, holdings].join(" ")),
          dewey: clean([deweyNum, deweyLabel].join(" ")),
          href: resolveHref(primaryHref(card), id),
          el: live ? card : null,
        });
      });

      doc.querySelectorAll(".map-item").forEach((item) => {
        const title = clean(item.querySelector(".map-item__site")?.textContent);
        const role = clean(item.querySelector(".map-item__role")?.textContent);
        const id = live ? ensureId(item, title) : "";
        const site = item.querySelector(".map-item__site");
        const href = site ? site.getAttribute("href") : "";
        pushItem(items, {
          title,
          category: "World map",
          badge: "Map",
          blurb: role,
          tags: "",
          dewey: role.match(/DDC\s*[\d./]+/i)?.[0] || "",
          href: resolveHref(href, id),
          el: live ? item : null,
        });
      });

      doc
        .querySelectorAll(".dewey-catalog tbody tr:not(.dewey-catalog__group)")
        .forEach((row) => {
          const cells = [...row.querySelectorAll("td")].map((td) =>
            clean(td.textContent)
          );
          if (cells.length < 3) return;
          const [call, klass, constellation, holdings = ""] = cells;
          const title = constellation || klass;
          const id = live ? ensureId(row, call + "-" + title) : row.id || "";
          const link = row.querySelector("a[href]");
          pushItem(items, {
            title,
            category: "Call table",
            badge: call || "DDC",
            blurb: clean([klass, holdings].join(" · ")),
            tags: holdings,
            dewey: call,
            href: resolveHref(link ? link.getAttribute("href") : "", id),
            el: live ? row : null,
          });
        });

      // Section landmarks
      [
        ["tools", "Inventory", "Live GitHub Pages webapps"],
        ["field-kit", "Field kit", "Personal CLIs, desktop tools, themes"],
        ["institute", "Institute armory", "Moribund Institute products"],
        ["stacks", "Stacks", "Dewey-classified constellations"],
        ["dewey", "Dewey call table", "Compact Murdoverse call numbers"],
        ["murdoverse", "World map", "Which surface does which job"],
        ["stack-000", "Stack 000", "Information & computing"],
        ["stack-300", "Stack 300", "Social sciences"],
        ["stack-400", "Stack 400", "Language"],
      ].forEach(([id, title, blurb]) => {
        if (!doc.getElementById(id) && live) return;
        if (!live && !doc.getElementById(id)) return;
        pushItem(items, {
          title,
          category: "Section",
          badge: "Jump",
          blurb,
          tags: id,
          dewey: "",
          href: resolveHref("#" + id, id),
          el: live ? doc.getElementById(id) : null,
        });
      });

      return items;
    };

    const dedupe = (items) => {
      const seen = new Set();
      return items.filter((it) => {
        const key = (it.title + "|" + it.category).toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    };

    const buildLocalIndex = () => dedupe(indexDocument(document, { live: true }));

    const loadIndex = async () => {
      let items = buildLocalIndex();
      // Lore page (or other thin pages): pull hub HTML so search still finds tools
      if (items.filter((i) => i.category !== "Section").length < 8 && hubBase) {
        try {
          const url = new URL("index.html", new URL(hubBase, location.href));
          const res = await fetch(url.href, { credentials: "same-origin" });
          if (res.ok) {
            const html = await res.text();
            const doc = new DOMParser().parseFromString(html, "text/html");
            items = dedupe(indexDocument(doc, { live: false }).concat(items));
          }
        } catch {
          /* keep local */
        }
      }
      index = items;
      return index;
    };

    const escapeHtml = (s) =>
      String(s)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");

    const highlight = (text, terms) => {
      let out = escapeHtml(text);
      terms.forEach((t) => {
        if (t.length < 2 && !/^\d/.test(t)) return;
        const re = new RegExp(
          "(" + t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")",
          "ig"
        );
        out = out.replace(re, "<mark>$1</mark>");
      });
      return out;
    };

    const scoreItem = (item, terms, q) => {
      let score = 0;
      const title = item.title.toLowerCase();
      const hay = item.hay;
      if (title === q) score += 120;
      if (title.startsWith(q)) score += 80;
      if (title.includes(q)) score += 50;
      if (item.dewey && item.dewey.toLowerCase().includes(q)) score += 70;
      terms.forEach((t) => {
        if (title.includes(t)) score += 28;
        if (item.dewey && item.dewey.toLowerCase().includes(t)) score += 36;
        if (item.badge && item.badge.toLowerCase().includes(t)) score += 18;
        if (item.tags && item.tags.toLowerCase().includes(t)) score += 12;
        if (item.blurb && item.blurb.toLowerCase().includes(t)) score += 8;
        if (hay.includes(t)) score += 4;
        // whole-word-ish bonus
        if (new RegExp("(^|\\s)" + t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "(\\s|$)").test(title)) {
          score += 10;
        }
      });
      return score;
    };

    const search = (raw) => {
      const q = clean(raw).toLowerCase();
      if (!q) return [];
      const terms = q.split(/\s+/).filter(Boolean);
      return index
        .map((item) => ({ item, score: scoreItem(item, terms, q) }))
        .filter((r) => r.score > 0 && terms.every((t) => r.item.hay.includes(t)))
        .sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title))
        .slice(0, 12)
        .map((r) => r.item);
    };

    const setOpen = (next) => {
      open = next;
      root.classList.toggle("is-open", open);
      input.setAttribute("aria-expanded", open ? "true" : "false");
      panel.hidden = !open;
      if (!open) {
        active = -1;
      }
    };

    const render = (list, q) => {
      results = list;
      active = list.length ? 0 : -1;
      const terms = clean(q)
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean);

      if (!clean(q)) {
        panel.innerHTML =
          '<p class="site-search__hint">Try <strong>flash</strong>, <strong>420</strong>, <strong>blogger</strong>, <strong>morenglish</strong>, or a Dewey class like <strong>400</strong>.</p>';
        setOpen(true);
        return;
      }

      if (!list.length) {
        panel.innerHTML =
          '<p class="site-search__empty">No matches for <strong>' +
          escapeHtml(clean(q)) +
          "</strong>. Try a tool name, tag, or call number.</p>";
        setOpen(true);
        return;
      }

      const groups = new Map();
      list.forEach((item, i) => {
        if (!groups.has(item.category)) groups.set(item.category, []);
        groups.get(item.category).push({ item, i });
      });

      let html = "";
      groups.forEach((entries, cat) => {
        html += '<div class="site-search__group">' + escapeHtml(cat) + "</div>";
        entries.forEach(({ item, i }) => {
          html +=
            '<button type="button" class="site-search__item' +
            (i === active ? " is-active" : "") +
            '" role="option" id="search-opt-' +
            i +
            '" data-index="' +
            i +
            '" aria-selected="' +
            (i === active ? "true" : "false") +
            '">' +
            '<span class="site-search__badge">' +
            escapeHtml(item.badge || item.category) +
            "</span>" +
            '<span class="site-search__title">' +
            highlight(item.title, terms) +
            "</span>" +
            '<span class="site-search__meta">' +
            highlight(item.blurb || item.tags || item.dewey || item.category, terms) +
            "</span>" +
            "</button>";
        });
      });
      panel.innerHTML = html;
      setOpen(true);
      input.setAttribute(
        "aria-activedescendant",
        active >= 0 ? "search-opt-" + active : ""
      );
    };

    const paintActive = () => {
      panel.querySelectorAll(".site-search__item").forEach((btn) => {
        const i = Number(btn.getAttribute("data-index"));
        const on = i === active;
        btn.classList.toggle("is-active", on);
        btn.setAttribute("aria-selected", on ? "true" : "false");
      });
      input.setAttribute(
        "aria-activedescendant",
        active >= 0 ? "search-opt-" + active : ""
      );
      const el = panel.querySelector('#search-opt-' + active);
      if (el) el.scrollIntoView({ block: "nearest" });
    };

    const flash = (el) => {
      if (!el) return;
      document
        .querySelectorAll(".is-search-target")
        .forEach((n) => n.classList.remove("is-search-target"));
      el.classList.add("is-search-target");
      window.setTimeout(() => el.classList.remove("is-search-target"), 2200);
    };

    const go = (item) => {
      if (!item) return;
      setOpen(false);
      input.blur();

      // Same-document element with id
      if (item.el && document.contains(item.el)) {
        item.el.scrollIntoView({
          behavior: reduceMotion ? "auto" : "smooth",
          block: "center",
        });
        flash(item.el);
        return;
      }

      const href = item.href || "./";
      // Hash on this page
      if (href.startsWith("#")) {
        const target = document.getElementById(href.slice(1));
        if (target) {
          target.scrollIntoView({
            behavior: reduceMotion ? "auto" : "smooth",
            block: "start",
          });
          flash(target);
          history.pushState(null, "", href);
          return;
        }
      }

      // Cross-page: pass query so hub can re-open and jump
      if (!isHubPage && href.startsWith(hubBase)) {
        const q = encodeURIComponent(item.title);
        const sep = href.includes("?") ? "&" : href.includes("#") ? "" : "?";
        // Prefer ?q= on hub root
        if (href === hubBase || href === hubBase + "index.html" || /^(\.\.\/)?#?$/.test(href)) {
          location.href = hubBase + "?q=" + q;
          return;
        }
        if (href.includes("#")) {
          location.href = href.replace(/#/, "?q=" + q + "#");
          return;
        }
      }

      location.href = href;
    };

    let debounce = 0;
    const onInput = () => {
      window.clearTimeout(debounce);
      debounce = window.setTimeout(() => {
        render(search(input.value), input.value);
      }, 60);
    };

    input.addEventListener("input", onInput);
    input.addEventListener("focus", () => {
      if (!index.length) return;
      render(search(input.value), input.value);
    });

    panel.addEventListener("mousedown", (e) => {
      // keep focus while clicking results
      e.preventDefault();
    });

    panel.addEventListener("click", (e) => {
      const btn = e.target.closest(".site-search__item");
      if (!btn) return;
      const i = Number(btn.getAttribute("data-index"));
      go(results[i]);
    });

    input.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        input.value = "";
        setOpen(false);
        input.blur();
        return;
      }
      if (!open && (e.key === "ArrowDown" || e.key === "Enter")) {
        render(search(input.value), input.value);
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (!results.length) return;
        active = (active + 1) % results.length;
        paintActive();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (!results.length) return;
        active = (active - 1 + results.length) % results.length;
        paintActive();
      } else if (e.key === "Enter") {
        if (active >= 0 && results[active]) {
          e.preventDefault();
          go(results[active]);
        }
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "/" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const tag = (e.target && e.target.tagName) || "";
        if (/^(INPUT|TEXTAREA|SELECT)$/.test(tag) || e.target?.isContentEditable) {
          return;
        }
        e.preventDefault();
        input.focus();
        input.select();
      }
      // Ctrl/Cmd+K
      if ((e.key === "k" || e.key === "K") && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        input.focus();
        input.select();
      }
    });

    document.addEventListener("click", (e) => {
      if (!root.contains(e.target)) setOpen(false);
    });

    loadIndex().then(() => {
      // Deep link: ?q=flash or #search handled via query
      const params = new URLSearchParams(location.search);
      const q = params.get("q");
      if (q) {
        input.value = q;
        render(search(q), q);
        if (results[0]) {
          // slight delay so layout is ready
          window.setTimeout(() => go(results[0]), 50);
        }
      }
    });
  }
})();
