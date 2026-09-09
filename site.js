/* ==========================================================================
   Deck Buddy marketing site — assets/site.js
   Plain vanilla JS. Every feature is defensive: no-ops when its markup is
   absent, and every localStorage access is wrapped in try/catch.

   Hook contract other pages should match:
   - Theme toggle button:      [data-theme-toggle]  (icon button in .nav)
   - Mobile nav toggle:        [data-nav-toggle]     controls .nav-drawer
   - Nav drawer:               .nav-drawer           (links: .nav-link)
   - Scroll-spy sub-nav links: [data-spy] with href="#section-id"
   - Deck mock root:           [data-deck-mock]      (see index.html)
   - Demo iframe:              iframe.demo-frame     inside [data-demo-stage]
   - Demo fallback panel:      .demo-fallback         inside [data-demo-stage]
   - Demo reload button:       [data-demo-reload]
   - Call form:                form#call-form, fields addressed by [name]
   - Availability chip group:  [data-availability]   holding .toggle-chip[data-value]
   - Call success panel:       #call-success[hidden], text sink #call-success-text,
                                 [data-copy-request], [data-start-over]
   ========================================================================== */
(function () {
  "use strict";

  /* ---- tiny safe-storage helpers -------------------------------------- */
  function storageGet(key) {
    try { return window.localStorage.getItem(key); } catch (e) { return null; }
  }
  function storageSet(key, value) {
    try { window.localStorage.setItem(key, value); } catch (e) { /* ignore */ }
  }

  var reducedMotion = false;
  try {
    reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch (e) { reducedMotion = false; }

  var isTouchOnly = false;
  try {
    isTouchOnly = window.matchMedia && window.matchMedia("(hover: none) and (pointer: coarse)").matches;
  } catch (e) { isTouchOnly = false; }

  function onReady(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  /* ======================================================================
     1. Theme toggle
     ====================================================================== */
  function initThemeToggle() {
    var btns = document.querySelectorAll("[data-theme-toggle]");
    if (!btns.length) return;

    var sunIcon =
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
      'stroke-linecap="round" stroke-linejoin="round" role="img" aria-hidden="true">' +
      '<circle cx="12" cy="12" r="4.2"></circle>' +
      '<path d="M12 2.5v2.4M12 19.1v2.4M4.4 4.4l1.7 1.7M17.9 17.9l1.7 1.7M2.5 12h2.4M19.1 12h2.4M4.4 19.6l1.7-1.7M17.9 6.1l1.7-1.7"></path>' +
      "</svg>";
    var moonIcon =
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
      'stroke-linecap="round" stroke-linejoin="round" role="img" aria-hidden="true">' +
      '<path d="M20.5 14.7A8.5 8.5 0 1 1 9.3 3.5a7 7 0 0 0 11.2 11.2z"></path>' +
      "</svg>";

    function currentTheme() {
      return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
    }

    function paint() {
      var t = currentTheme();
      var icon = t === "dark" ? sunIcon : moonIcon;
      var label = t === "dark" ? "Switch to light theme" : "Switch to dark theme";
      for (var i = 0; i < btns.length; i++) {
        btns[i].innerHTML = icon;
        btns[i].setAttribute("aria-label", label);
        btns[i].setAttribute("title", label);
      }
    }

    function toggle() {
      var next = currentTheme() === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      storageSet("db-theme", next);
      paint();
    }

    for (var i = 0; i < btns.length; i++) {
      btns[i].addEventListener("click", toggle);
    }
    paint();
  }

  /* ======================================================================
     2 + 3 + 4. Scroll reveal, count-up, bars — one shared observer
     ====================================================================== */
  function initRevealSystem() {
    var revealEls = document.querySelectorAll(".reveal, .count, .bar");
    if (!revealEls.length) return;

    // assign stagger indices
    var staggers = document.querySelectorAll(".stagger");
    for (var s = 0; s < staggers.length; s++) {
      var kids = staggers[s].children;
      for (var k = 0; k < kids.length; k++) {
        kids[k].style.setProperty("--i", String(k));
        kids[k].style.transitionDelay = (k * 70) + "ms";
      }
    }

    function revealNow(el) {
      if (el.classList.contains("reveal")) el.classList.add("in");
      if (el.classList.contains("count")) animateCount(el);
      if (el.classList.contains("bar")) fillBar(el);
    }

    if (reducedMotion) {
      for (var r = 0; r < revealEls.length; r++) revealNow(revealEls[r]);
      return;
    }

    var hasIO = typeof window.IntersectionObserver === "function";
    if (!hasIO) {
      for (var j = 0; j < revealEls.length; j++) revealNow(revealEls[j]);
      return;
    }

    var io = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            revealNow(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    for (var n = 0; n < revealEls.length; n++) io.observe(revealEls[n]);
  }

  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    if (isNaN(target)) return;
    var prefix = el.getAttribute("data-prefix") || "";
    var suffix = el.getAttribute("data-suffix") || "";
    var duration = 1100;
    var start = null;
    var from = 0;

    function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

    function frame(ts) {
      if (start === null) start = ts;
      var elapsed = ts - start;
      var progress = Math.min(elapsed / duration, 1);
      var value = from + (target - from) * easeOut(progress);
      var display = target % 1 === 0 ? Math.round(value).toLocaleString("en-US") : value.toFixed(1);
      el.textContent = prefix + display + suffix;
      if (progress < 1) {
        window.requestAnimationFrame(frame);
      } else {
        var finalDisplay = target % 1 === 0 ? Math.round(target).toLocaleString("en-US") : target.toFixed(1);
        el.textContent = prefix + finalDisplay + suffix;
      }
    }
    window.requestAnimationFrame(frame);
  }

  function fillBar(el) {
    var pct = parseFloat(el.getAttribute("data-pct"));
    if (isNaN(pct)) return;
    var fill = el.querySelector(".bar-fill");
    if (!fill) return;
    // next tick so the transition actually runs
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        fill.style.width = Math.max(0, Math.min(100, pct)) + "%";
      });
    });
  }

  /* ======================================================================
     5. Sticky nav + scroll progress
     ====================================================================== */
  function initNavScroll() {
    var nav = document.querySelector(".nav");
    var progress = document.querySelector(".progress");
    if (!nav && !progress) return;

    var ticking = false;
    function update() {
      ticking = false;
      var y = window.scrollY || window.pageYOffset || 0;
      if (nav) {
        if (y > 12) nav.classList.add("scrolled");
        else nav.classList.remove("scrolled");
      }
      if (progress) {
        var doc = document.documentElement;
        var max = (doc.scrollHeight || 0) - (window.innerHeight || 0);
        var pct = max > 0 ? (y / max) * 100 : 0;
        progress.style.width = Math.max(0, Math.min(100, pct)) + "%";
      }
    }
    function onScroll() {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
  }

  /* ======================================================================
     6. Mobile drawer
     ====================================================================== */
  function initNavDrawer() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var drawer = document.querySelector(".nav-drawer");
    if (!toggle || !drawer) return;

    function close() {
      drawer.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    }
    function open() {
      drawer.classList.add("open");
      toggle.setAttribute("aria-expanded", "true");
    }
    function isOpen() { return drawer.classList.contains("open"); }

    toggle.setAttribute("aria-expanded", "false");
    toggle.addEventListener("click", function () {
      if (isOpen()) close(); else open();
    });

    var links = drawer.querySelectorAll("a");
    for (var i = 0; i < links.length; i++) {
      links[i].addEventListener("click", close);
    }

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && isOpen()) {
        close();
        toggle.focus();
      }
    });

    document.addEventListener("click", function (e) {
      if (!isOpen()) return;
      if (drawer.contains(e.target) || toggle.contains(e.target)) return;
      close();
    });
  }

  /* ======================================================================
     7. Parallax orbs
     ====================================================================== */
  function initParallax() {
    if (reducedMotion || isTouchOnly) return;
    var a = document.querySelectorAll(".float-a");
    var b = document.querySelectorAll(".float-b");
    var c = document.querySelectorAll(".float-c");
    if (!a.length && !b.length && !c.length) return;

    var ticking = false;
    function apply(list, factor, y) {
      for (var i = 0; i < list.length; i++) {
        list[i].style.transform = "translate3d(0," + (y * factor).toFixed(1) + "px,0)";
      }
    }
    function update() {
      ticking = false;
      var y = window.scrollY || window.pageYOffset || 0;
      apply(a, -0.06, y);
      apply(b, 0.04, y);
      apply(c, -0.09, y);
    }
    function onScroll() {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    update();
  }

  /* ======================================================================
     8. Tilt
     ====================================================================== */
  function initTilt() {
    if (reducedMotion || isTouchOnly) return;
    var els = document.querySelectorAll(".tilt");
    if (!els.length) return;

    els.forEach(function (el) {
      function onMove(e) {
        var rect = el.getBoundingClientRect();
        var px = (e.clientX - rect.left) / rect.width;
        var py = (e.clientY - rect.top) / rect.height;
        var rx = (0.5 - py) * 10; // up to ~5deg
        var ry = (px - 0.5) * 10;
        el.style.transform = "perspective(800px) rotateX(" + rx.toFixed(2) + "deg) rotateY(" + ry.toFixed(2) + "deg)";
      }
      function onLeave() {
        el.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg)";
      }
      el.addEventListener("pointermove", onMove);
      el.addEventListener("pointerleave", onLeave);
      el.addEventListener("pointercancel", onLeave);
    });
  }

  /* ======================================================================
     9. Deck mock animation loop
     ====================================================================== */
  var SAMPLE_TAGS = ["Turns", "Streamline", "Finishes", "Breathing", "Underwaters"];

  function initDeckMocks() {
    var mocks = document.querySelectorAll("[data-deck-mock]");
    if (!mocks.length) return;
    mocks.forEach(setupDeckMock);
  }

  function setupDeckMock(root) {
    var water = root.querySelector('[data-panel="water"]');
    var previous = root.querySelector('[data-panel="previous"]');
    var flipTiles = root.querySelectorAll("[data-flip-tile]");
    var tagPop = root.querySelector("[data-tag-pop]");
    var nowBadgeEvents = root.querySelectorAll(".sheet-event");

    var laneBoxes = water ? water.querySelectorAll(".lane-box[data-role='place']") : [];
    var placeLabels = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th"];

    function resetBoxes() {
      for (var i = 0; i < laneBoxes.length; i++) {
        laneBoxes[i].classList.remove("filled");
        laneBoxes[i].textContent = "—";
      }
    }

    if (reducedMotion) {
      // Static mid-race state: fill half the boxes so it reads as "in progress".
      for (var i = 0; i < laneBoxes.length; i++) {
        if (i < Math.ceil(laneBoxes.length / 2)) {
          laneBoxes[i].classList.add("filled");
          laneBoxes[i].textContent = placeLabels[i] || (i + 1) + "th";
        } else {
          laneBoxes[i].textContent = "—";
        }
      }
      flipTiles.forEach(function (t) {
        if (!t.hasAttribute("data-static")) return;
        t.textContent = t.getAttribute("data-static");
      });
      return; // no animation loop, no clock tick
    }

    // --- visibility tracking: pause off-screen or when tab hidden ---
    var visible = true;
    if (typeof window.IntersectionObserver === "function") {
      var vio = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) { visible = entry.isIntersecting; });
        },
        { threshold: 0.1 }
      );
      vio.observe(root);
    }
    function runnable() {
      return visible && !document.hidden;
    }

    // --- split-flap clock, ticks every second ---
    var seconds = 41;
    function renderClock(force) {
      var str = "0:" + (seconds < 10 ? "0" + seconds : String(seconds));
      var chars = str.split("");
      for (var i = 0; i < flipTiles.length && i < chars.length; i++) {
        var tile = flipTiles[i];
        if (force || tile.textContent !== chars[i]) {
          tile.textContent = chars[i];
          tile.classList.remove("flipping");
          // force reflow so the animation can restart
          void tile.offsetWidth;
          tile.classList.add("flipping");
        }
      }
    }
    renderClock(true);
    window.setInterval(function () {
      if (!runnable()) return;
      seconds = seconds >= 59 ? 0 : seconds + 1;
      renderClock(false);
    }, 1000);

    // --- heat cycle: fill places, end heat, advance NOW, pop a tag ---
    var CYCLE_MS = 9000;
    var TICK_MS = 300;
    var ticksPerCycle = Math.round(CYCLE_MS / TICK_MS);
    var tick = 0;
    var filled = 0;
    var fillEvery = laneBoxes.length ? Math.max(2, Math.floor((ticksPerCycle * 0.55) / laneBoxes.length)) : 0;

    function fillNextBox() {
      if (filled >= laneBoxes.length) return;
      var box = laneBoxes[filled];
      box.textContent = placeLabels[filled] || (filled + 1) + "th";
      box.classList.add("filled");
      filled++;
    }

    function endHeat() {
      if (previous && water) {
        var prevLanes = previous.querySelectorAll(".lane");
        var waterLanes = water.querySelectorAll(".lane");
        for (var i = 0; i < prevLanes.length && i < waterLanes.length; i++) {
          var srcName = waterLanes[i].querySelector(".lane-name");
          var srcTeam = waterLanes[i].querySelector(".lane-team");
          var srcBox = waterLanes[i].querySelector(".lane-box[data-role='place']");
          var dstName = prevLanes[i].querySelector(".lane-name");
          var dstTeam = prevLanes[i].querySelector(".lane-team");
          var dstBox = prevLanes[i].querySelector(".lane-box[data-role='place']");
          if (srcName && dstName) dstName.textContent = srcName.textContent;
          if (srcTeam && dstTeam) {
            dstTeam.textContent = srcTeam.textContent;
            dstTeam.style.setProperty("--team-color", srcTeam.style.getPropertyValue("--team-color"));
          }
          if (srcBox && dstBox) {
            dstBox.textContent = srcBox.textContent;
            dstBox.classList.toggle("filled", srcBox.classList.contains("filled"));
          }
        }
      }
      resetBoxes();

      // advance NOW badge to the next sheet-event, if more than one is present
      if (nowBadgeEvents.length > 1) {
        var activeIdx = -1;
        for (var j = 0; j < nowBadgeEvents.length; j++) {
          if (nowBadgeEvents[j].classList.contains("now-rail")) { activeIdx = j; break; }
        }
        if (activeIdx > -1) {
          nowBadgeEvents[activeIdx].classList.remove("now-rail");
          var badge = nowBadgeEvents[activeIdx].querySelector(".badge");
          if (badge) badge.remove();
          var nextIdx = (activeIdx + 1) % nowBadgeEvents.length;
          nowBadgeEvents[nextIdx].classList.add("now-rail");
          var head = nowBadgeEvents[nextIdx].querySelector(".sheet-event-head");
          if (head && !nowBadgeEvents[nextIdx].querySelector(".badge")) {
            var b = document.createElement("span");
            b.className = "badge";
            b.textContent = "NOW";
            head.appendChild(b);
          }
        }
      }

      if (tagPop) {
        tagPop.textContent = SAMPLE_TAGS[Math.floor(Math.random() * SAMPLE_TAGS.length)];
        tagPop.classList.remove("showing");
        void tagPop.offsetWidth;
        tagPop.classList.add("showing");
      }
    }

    window.setInterval(function () {
      if (!runnable()) return;
      tick++;
      if (fillEvery && tick % fillEvery === 0 && filled < laneBoxes.length) {
        fillNextBox();
      }
      if (tick >= ticksPerCycle) {
        tick = 0;
        filled = laneBoxes.length; // safety
        endHeat();
        filled = 0;
      }
    }, TICK_MS);
  }

  /* ======================================================================
     Generic [data-spy] scroll-spy (features.html sub-nav)
     ====================================================================== */
  function initScrollSpy() {
    var links = document.querySelectorAll("[data-spy]");
    if (!links.length) return;

    var map = []; // { link, target }
    links.forEach(function (link) {
      var href = link.getAttribute("href") || "";
      if (href.charAt(0) !== "#") return;
      var target = document.getElementById(href.slice(1));
      if (target) map.push({ link: link, target: target });
    });
    if (!map.length) return;

    function setActive(link) {
      map.forEach(function (m) { m.link.classList.toggle("is-active", m.link === link); });
    }

    if (typeof window.IntersectionObserver === "function") {
      var io = new IntersectionObserver(
        function (entries) {
          var best = null;
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              if (!best || entry.boundingClientRect.top < best.boundingClientRect.top) best = entry;
            }
          });
          if (best) {
            var match = map.filter(function (m) { return m.target === best.target; })[0];
            if (match) setActive(match.link);
          }
        },
        { rootMargin: "-20% 0px -70% 0px", threshold: [0, 1] }
      );
      map.forEach(function (m) { io.observe(m.target); });
    } else {
      function onScroll() {
        var y = window.scrollY || window.pageYOffset || 0;
        var current = map[0];
        map.forEach(function (m) {
          if (m.target.offsetTop - 120 <= y) current = m;
        });
        if (current) setActive(current.link);
      }
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }
  }

  /* ======================================================================
     Demo page: iframe with fallback
     ====================================================================== */
  function initDemoFrame() {
    var stage = document.querySelector("[data-demo-stage]");
    if (!stage) return;
    var iframe = stage.querySelector("iframe.demo-frame");
    var fallback = stage.querySelector(".demo-fallback");
    var loadBtn = stage.querySelector("[data-demo-reload]");
    if (!iframe || !fallback) return;

    // A cross-origin frame that is refused still fires `load`, so there is no
    // reliable way to detect the block. The honest default is therefore the
    // link-out panel, with the inline frame as an explicit opt-in.
    var src = iframe.getAttribute("data-src") || iframe.getAttribute("src") || "";
    iframe.hidden = true;
    fallback.hidden = false;

    if (!loadBtn) return;
    loadBtn.addEventListener("click", function () {
      if (!iframe.hidden) {
        try { iframe.src = "about:blank"; } catch (e) { /* ignore */ }
        window.setTimeout(function () { iframe.src = src; }, 30);
        return;
      }
      iframe.src = src;
      iframe.hidden = false;
      loadBtn.textContent = "Reload the frame";
      var note = document.createElement("p");
      note.className = "faint center mt-half";
      note.textContent = "Blank frame? claude.ai is refusing to be embedded \u2014 use the button above.";
      fallback.appendChild(note);
    });
  }

  /* ======================================================================
     Call form: validation, mailto, success panel, clipboard copy
     ====================================================================== */
  /* ======================================================================
     Reveal backstop: a fast scroll or a jump-to-anchor can outrun the
     observer, so sweep anything already in view and reveal it outright.
     ====================================================================== */
  function initRevealBackstop() {
    var pending = null;
    function sweep() {
      pending = null;
      var els = document.querySelectorAll(".reveal:not(.in)");
      for (var i = 0; i < els.length; i++) {
        var r = els[i].getBoundingClientRect();
        if (r.top < window.innerHeight * 0.96 && r.bottom > 0) els[i].classList.add("in");
      }
    }
    function schedule() {
      if (pending) return;
      pending = window.requestAnimationFrame
        ? window.requestAnimationFrame(sweep)
        : window.setTimeout(sweep, 60);
    }
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    window.addEventListener("hashchange", function () { window.setTimeout(sweep, 80); });
    window.setTimeout(sweep, 400);
    window.setTimeout(sweep, 1600);
  }

  function initCallForm() {
    var form = document.getElementById("call-form");
    if (!form) return;

    var FIELD_DEFS = [
      { name: "name", label: "Name", required: true },
      { name: "email", label: "Email", required: true, email: true },
      { name: "program", label: "Program / team", required: true },
      { name: "role", label: "Role", required: true },
      { name: "swimmers", label: "Roughly how many swimmers", required: false },
      { name: "timing", label: "Timing system", required: false },
      { name: "timezone", label: "Time zone", required: false },
      { name: "notes", label: "Anything to cover", required: false }
    ];

    var availabilityGroup = form.querySelector("[data-availability]");

    function findControl(name) {
      return form.querySelector("[name='" + name + "']");
    }
    function findFieldWrap(control) {
      if (!control) return null;
      return control.closest(".field") || control.closest("[data-field]");
    }

    function clearError(wrap, control) {
      if (wrap) {
        wrap.classList.remove("field-error");
        var msg = wrap.querySelector(".field-msg");
        if (msg) msg.textContent = "";
      }
      if (control) control.removeAttribute("aria-invalid");
    }

    function setError(wrap, control, message) {
      if (wrap) {
        wrap.classList.add("field-error");
        var msg = wrap.querySelector(".field-msg");
        if (msg) msg.textContent = message;
      }
      if (control) control.setAttribute("aria-invalid", "true");
    }

    function isEmailValid(value) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }

    function getAvailabilitySelections() {
      if (!availabilityGroup) return [];
      var chips = availabilityGroup.querySelectorAll(".toggle-chip[aria-pressed='true']");
      var out = [];
      chips.forEach(function (c) { out.push(c.getAttribute("data-value") || c.textContent.trim()); });
      return out;
    }

    if (availabilityGroup) {
      var allChips = availabilityGroup.querySelectorAll(".toggle-chip");
      allChips.forEach(function (chip) {
        if (!chip.hasAttribute("aria-pressed")) chip.setAttribute("aria-pressed", "false");
        chip.addEventListener("click", function () {
          var pressed = chip.getAttribute("aria-pressed") === "true";
          chip.setAttribute("aria-pressed", pressed ? "false" : "true");
          if (getAvailabilitySelections().length) {
            clearError(findFieldWrap(availabilityGroup) || availabilityGroup.closest("[data-field]"), null);
          }
        });
      });
    }

    function buildBody(values, availability) {
      var lines = [];
      lines.push("Name: " + values.name);
      lines.push("Email: " + values.email);
      lines.push("Program / team: " + values.program);
      if (values.role) lines.push("Role: " + values.role);
      if (values.swimmers) lines.push("Roughly how many swimmers: " + values.swimmers);
      if (values.timing) lines.push("Timing system: " + values.timing);
      lines.push("When works: " + (availability.length ? availability.join(", ") : "Not specified"));
      if (values.timezone) lines.push("Time zone: " + values.timezone);
      if (values.notes) lines.push("Notes: " + values.notes);
      lines.push("");
      lines.push("Sent from deckbuddy.app");
      return lines.join("\n");
    }

    function showSuccess(bodyText) {
      var successPanel = document.getElementById("call-success");
      var textSink = document.getElementById("call-success-text");
      if (textSink) textSink.textContent = bodyText;
      if (successPanel) successPanel.hidden = false;
      form.hidden = true;
      if (successPanel) {
        successPanel.setAttribute("tabindex", "-1");
        try { successPanel.focus(); } catch (e) { /* ignore */ }
      }
    }

    function copyText(text) {
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).catch(function () { fallbackCopy(text); });
          return;
        }
      } catch (e) { /* fall through */ }
      fallbackCopy(text);
    }
    function fallbackCopy(text) {
      try {
        var ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.top = "-1000px";
        ta.style.left = "-1000px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      } catch (e) { /* nothing else we can do without alert() */ }
    }

    var copyBtn = document.querySelector("[data-copy-request]");
    if (copyBtn) {
      copyBtn.addEventListener("click", function () {
        var textSink = document.getElementById("call-success-text");
        var text = textSink ? textSink.textContent : "";
        copyText(text);
        var original = copyBtn.textContent;
        copyBtn.textContent = "Copied";
        window.setTimeout(function () { copyBtn.textContent = original; }, 1800);
      });
    }

    var startOverBtn = document.querySelector("[data-start-over]");
    if (startOverBtn) {
      startOverBtn.addEventListener("click", function () {
        form.reset();
        if (availabilityGroup) {
          availabilityGroup.querySelectorAll(".toggle-chip").forEach(function (c) {
            c.setAttribute("aria-pressed", "false");
          });
        }
        FIELD_DEFS.forEach(function (def) {
          var control = findControl(def.name);
          clearError(findFieldWrap(control), control);
        });
        var successPanel = document.getElementById("call-success");
        if (successPanel) successPanel.hidden = true;
        form.hidden = false;
        var first = findControl("name");
        if (first) { try { first.focus(); } catch (e) { /* ignore */ } }
      });
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var firstBad = null;
      var values = {};

      FIELD_DEFS.forEach(function (def) {
        var control = findControl(def.name);
        if (!control) return;
        var wrap = findFieldWrap(control);
        var value = (control.value || "").trim();
        values[def.name] = value;
        clearError(wrap, control);

        if (def.required && !value) {
          setError(wrap, control, "This field is required.");
          if (!firstBad) firstBad = control;
          return;
        }
        if (def.email && value && !isEmailValid(value)) {
          setError(wrap, control, "Enter a valid email address.");
          if (!firstBad) firstBad = control;
        }
      });

      var availability = getAvailabilitySelections();
      if (availabilityGroup && !availability.length) {
        var availWrap = availabilityGroup.closest("[data-field]") || availabilityGroup.closest(".field") || availabilityGroup;
        availWrap.classList.add("field-error");
        var availMsg = availWrap.querySelector(".field-msg");
        if (availMsg) availMsg.textContent = "Pick at least one option.";
        if (!firstBad) firstBad = availabilityGroup.querySelector(".toggle-chip");
      }

      if (firstBad) {
        try { firstBad.focus(); } catch (err) { /* ignore */ }
        return;
      }

      var bodyText = buildBody(values, availability);
      var subject = "Deck Buddy demo call — " + values.name + ", " + values.program;
      var mailto =
        "mailto:cpisani@deckbuddy.app" +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(bodyText);

      showSuccess(bodyText);

      window.setTimeout(function () {
        window.location.href = mailto;
      }, 60);
    });
  }

  /* ======================================================================
     Boot
     ====================================================================== */
  onReady(function () {
    initThemeToggle();
    initNavScroll();
    initNavDrawer();
    initRevealSystem();
    initParallax();
    initTilt();
    initDeckMocks();
    initScrollSpy();
    initDemoFrame();
    initRevealBackstop();
    initCallForm();
  });
})();
