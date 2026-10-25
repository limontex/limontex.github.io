/* =====================================================================
   Md. Limon Miah | Portfolio behaviour
   Plain JavaScript, no dependencies. Each feature is its own small module.
   ===================================================================== */
(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Flag that JS is running so CSS can safely hide .reveal items until they scroll in. */
  document.documentElement.classList.add('js');

  /* ---------------------------------------------------------------
     Module: header state, scroll progress bar, mobile menu
     --------------------------------------------------------------- */
  function initHeader() {
    var header = document.getElementById('siteHeader');
    var progress = document.getElementById('scrollProgress');
    var toggle = document.getElementById('navToggle');
    var nav = document.getElementById('siteNav');
    var ticking = false;

    function update() {
      var y = window.scrollY || document.documentElement.scrollTop;
      var max = document.documentElement.scrollHeight - window.innerHeight;
      header.classList.toggle('is-scrolled', y > 24);
      progress.style.transform = 'scaleX(' + (max > 0 ? Math.min(y / max, 1) : 0) + ')';
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();

    function setMenu(open) {
      nav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      toggle.querySelector('use').setAttribute('href', open ? '#i-close' : '#i-menu');
    }
    toggle.addEventListener('click', function () { setMenu(!nav.classList.contains('is-open')); });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) { setMenu(false); toggle.focus(); }
    });
  }

  /* ---------------------------------------------------------------
     Module: highlight the nav link of the section in view
     --------------------------------------------------------------- */
  function initActiveNav() {
    if (!('IntersectionObserver' in window)) return;
    var links = document.querySelectorAll('.site-nav li a');
    var map = {};
    links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (a) { a.removeAttribute('aria-current'); });
        var link = map[entry.target.id];
        if (link) link.setAttribute('aria-current', 'true');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    Object.keys(map).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) observer.observe(el);
    });
  }

  /* ---------------------------------------------------------------
     Module: reveal-on-scroll
     --------------------------------------------------------------- */
  function initReveal() {
    var items = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window) || prefersReducedMotion) {
      items.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    items.forEach(function (el) { observer.observe(el); });
  }

  /* ---------------------------------------------------------------
     Module: count-up for the headline numbers (values live in the HTML,
     so the page stays correct with JS off or reduced motion on)
     --------------------------------------------------------------- */
  function initCounters() {
    if (prefersReducedMotion) return;
    var counters = document.querySelectorAll('[data-count]');
    counters.forEach(function (el) {
      var target = parseInt(el.getAttribute('data-count'), 10);
      var suffix = el.getAttribute('data-suffix') || '';
      var duration = 1400;
      var start = null;
      el.textContent = '0' + suffix;

      function step(ts) {
        if (start === null) start = ts;
        var p = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (p < 1) window.requestAnimationFrame(step);
      }
      /* Begin after the hero intro has played */
      window.setTimeout(function () { window.requestAnimationFrame(step); }, 700);
    });
  }

  /* ---------------------------------------------------------------
     Module: product gallery with filters and lightbox
     File names now point to the assets/Gallery/ folder.
     --------------------------------------------------------------- */
  var CATEGORIES = [
    { id: 'all',   label: 'All' },
    { id: 'team',  label: 'Team and match' },
    { id: 'perf',  label: 'Training and performance' },
    { id: 'knit',  label: 'Knit and lifestyle' },
    { id: 'outer', label: 'Outerwear' },
    { id: 'woven', label: 'Woven' }
  ];

  var PRODUCTS = [
    /* Team and match */
    { file: 'assets/Gallery/Cabo Verde Match Jersey.jfif', name: 'Cabo Verde 2026 World Cup match jersey', cat: 'team' },
    { file: 'assets/Gallery/Cabo Verde Pre Match Jersey.jfif', name: 'Cabo Verde 2026 pre-match jersey', cat: 'team' },
    { file: 'assets/Gallery/AGA-14910  Camo Button Jersey.jfif', name: 'Camo button jersey', cat: 'team' },
    { file: 'assets/Gallery/AGA-12454 Serbia Match Jersey.jfif', name: 'Serbia FA home jersey', cat: 'team' },
    { file: 'assets/Gallery/Serbia Away Jersey.jfif', name: 'Serbia FA away jersey', cat: 'team' },
    { file: 'assets/Gallery/Goalkeeper Jersey.jfif', name: 'Goalkeeper jersey', cat: 'team' },
    { file: 'assets/Gallery/Reversible Match Jersey - Front 1.jfif', name: 'Reversible match jersey, view 1', cat: 'team' },
    { file: 'assets/Gallery/Reversible Match Jersey - Front 2.jfif', name: 'Reversible match jersey, view 2', cat: 'team' },
    { file: 'assets/Gallery/AGA-14830 ID Football Jersey.jfif', name: '2026 Elite ID football jersey', cat: 'team' },
    { file: 'assets/Gallery/AGA-14832 Hudson Football Pants.jfif', name: '2026 Hudson football pant', cat: 'team' },
    { file: 'assets/Gallery/Puerto Rico national basketball team Jersey.jfif', name: 'Puerto Rico national basketball team Jersey', cat: 'team' },
    { file: 'assets/Gallery/Puerto Rico national basketball team Shorts.jfif', name: 'Puerto Rico national basketball team Shorts', cat: 'team' },
    { file: 'assets/Gallery/Match Shorts.jfif', name: 'Match shorts', cat: 'team' },
    { file: 'assets/Gallery/Volleyball Sleeveless Jersey.jfif', name: 'Volleyball sleeveless jersey', cat: 'team' },
    { file: 'assets/Gallery/Match Jersey.jfif', name: 'Match Jersey', cat: 'team' },
    { file: 'assets/Gallery/Reversible LAX-FH Pinnie - Front 1.jfif', name: 'Reversible LAX-FH pinnie, view 1', cat: 'team' },
    { file: 'assets/Gallery/Reversible LAX-FH Pinnie - Front 2.jfif', name: 'Reversible LAX-FH pinnie, view 2', cat: 'team' },

    /* Training and performance */
    { file: 'assets/Gallery/Training Top.jfif', name: 'Training top', cat: 'perf' },
    { file: 'assets/Gallery/Racer Back Tank.jfif', name: 'Racer back tank', cat: 'perf' },
    { file: 'assets/Gallery/Skirt.jfif', name: 'Performance skirt', cat: 'perf' },
    { file: 'assets/Gallery/AGA- 12779MJ Base Pant.jpg', name: 'Base pant', cat: 'perf' },
    { file: 'assets/Gallery/AGA-9989LC Block Pant.jfif', name: 'Block pant', cat: 'perf' },
    { file: 'assets/Gallery/AGA-8300 Training Pants.jfif', name: 'Training pants', cat: 'perf' },
    { file: 'assets/Gallery/AGA-2320 Sports Bra.jfif', name: 'Sports bra', cat: 'perf' },
    { file: 'assets/Gallery/AGA-3246X Bodywear Pants.jfif', name: 'Bodywear pants', cat: 'perf' },
    { file: 'assets/Gallery/Body wear shorts.jfif', name: 'Bodywear shorts', cat: 'perf' },
    { file: 'assets/Gallery/Performance Sliding Shorts.jfif', name: 'Performance sliding shorts', cat: 'perf' },

    /* Knit and lifestyle */
    { file: 'assets/Gallery/AGA-6925UF Marled Polo.jfif', name: 'Marled polo', cat: 'knit' },
    { file: 'assets/Gallery/Marble Cotton Tee.jfif', name: 'Marble print cotton tee', cat: 'knit' },
    { file: 'assets/Gallery/AGA-8625 Tonal Crew Neck Sweatshirt.jfif', name: 'Tonal crew neck sweatshirt', cat: 'knit' },
    { file: 'assets/Gallery/AGA-7240 Fleece Sweatpants.jfif', name: 'Fleece sweatpants', cat: 'knit' },
    { file: 'assets/Gallery/AGA-12502  Pullover Hoodie.jfif', name: 'Pullover hoodie', cat: 'knit' },
    { file: 'assets/Gallery/AGA-6197 Zip Up Hoodie.jfif', name: 'Zip-up hoodie', cat: 'knit' },
    { file: 'assets/Gallery/Therma Fleece Hoodie Pullover.jfif', name: 'Therma Fleece Hoodie', cat: 'knit' },
    { file: 'assets/Gallery/Cotton Polo.jfif', name: 'Cotton polo', cat: 'knit' },
    { file: 'assets/Gallery/AGA-8426 Tonal Cropped Oversized Tee.jfif', name: 'Tonal Cropped Oversized Tee', cat: 'knit' },
    { file: 'assets/Gallery/AGA-8444 Tech II Joggers.jfif', name: 'Tech II joggers', cat: 'knit' },
    { file: 'assets/Gallery/AGA-8680N Tech II Shorts.jfif', name: 'Tech II shorts', cat: 'knit' },
    { file: 'assets/Gallery/AGA-5974 Polo.jfif', name: 'Poly polo', cat: 'knit' },
    { file: 'assets/Gallery/Basic Cotton Tee.jfif', name: 'Basic cotton tee', cat: 'knit' },

    /* Outerwear */
    { file: 'assets/Gallery/AGA- 14438 Bomber Jacket.jpg', name: 'Bomber jacket', cat: 'outer' },
    { file: 'assets/Gallery/AGA-10555 Coach Jacket.jfif', name: 'Coach jacket', cat: 'outer' },
    { file: 'assets/Gallery/AGA-3520 Qualting Vest.jfif', name: 'Quilted vest', cat: 'outer' },
    { file: 'assets/Gallery/Down Jacket.jfif', name: 'Down jacket', cat: 'outer' },
    { file: 'assets/Gallery/Outerwear Down Jacket.jfif', name: 'Outerwear down jacket', cat: 'outer' },
    { file: 'assets/Gallery/AGA-8000 All weather jacket.jfif', name: 'All-weather jacket', cat: 'outer' },
    { file: 'assets/Gallery/AGA-12501 Anthem Jacket.jfif', name: 'Anthem jacket', cat: 'outer' },
    { file: 'assets/Gallery/AGA-12006 Windbreaker.jfif', name: 'Windbreaker', cat: 'outer' },
    { file: 'assets/Gallery/AGA-5267LFS Qualted Hoodie.jfif', name: 'Quilted hoodie', cat: 'outer' },
    { file: 'assets/Gallery/AGA- 5998 Training Jacket.jpg', name: 'Training jacket', cat: 'outer' },

    /* Woven */
    { file: 'assets/Gallery/Flex Woven Pants.jfif', name: 'Flex woven pants', cat: 'woven' },
    { file: 'assets/Gallery/Woven Pant.jfif', name: 'Woven pant', cat: 'woven' },
    { file: 'assets/Gallery/Woven Pant 2.jfif', name: 'Woven Pant', cat: 'woven' },
    { file: 'assets/Gallery/Woven Pant 3.jfif', name: 'Woven Pant', cat: 'woven' },
    { file: 'assets/Gallery/Flex Woven Pants 2.jfif', name: 'Woven Pant', cat: 'woven' },
    { file: 'assets/Gallery/Woven Short.jfif', name: 'Woven short', cat: 'woven' },
    { file: 'assets/Gallery/Woven Short 2.jfif', name: 'Woven short', cat: 'woven' },
    { file: 'assets/Gallery/Woven Short 3.jfif', name: 'Woven short', cat: 'woven' }
  ];

  var PREVIEW_COUNT = 12;

  function initGallery() {
    var filterBar = document.getElementById('galleryFilters');
    var grid = document.getElementById('gallery');
    var moreBtn = document.getElementById('galleryMore');
    var box = document.getElementById('lightbox');
    if (!filterBar || !grid) return;

    var activeCat = 'all';
    var expanded = false;
    var visible = [];      /* products currently shown, in order */
    var lastTrigger = null;
    var lbIndex = 0;

    /* Build filter buttons */
    CATEGORIES.forEach(function (c) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'filter-btn';
      b.textContent = c.label;
      b.setAttribute('data-cat', c.id);
      b.setAttribute('aria-pressed', c.id === 'all' ? 'true' : 'false');
      filterBar.appendChild(b);
    });

    function render() {
      var list = PRODUCTS.filter(function (p) { return activeCat === 'all' || p.cat === activeCat; });
      var shown = expanded ? list : list.slice(0, PREVIEW_COUNT);
      visible = shown;

      grid.innerHTML = '';
      shown.forEach(function (p, i) {
        var li = document.createElement('li');
        li.className = 'gallery__item';
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'gallery__btn';
        btn.setAttribute('data-index', String(i));
        btn.setAttribute('aria-label', 'View larger: ' + p.name);

        var img = document.createElement('img');
        img.src = encodeURI(p.file);
        img.alt = p.name;
        img.loading = 'lazy';
        img.decoding = 'async';
        img.width = 400;
        img.height = 400;

        var cap = document.createElement('span');
        cap.className = 'gallery__name';
        cap.textContent = p.name;

        btn.appendChild(img);
        btn.appendChild(cap);
        li.appendChild(btn);
        grid.appendChild(li);
      });

      /* Show-all toggle */
      if (list.length > PREVIEW_COUNT) {
        moreBtn.hidden = false;
        moreBtn.textContent = expanded ? 'Show fewer' : 'Show all ' + list.length + ' styles';
      } else {
        moreBtn.hidden = true;
      }
    }

    filterBar.addEventListener('click', function (e) {
      var b = e.target.closest('.filter-btn');
      if (!b) return;
      activeCat = b.getAttribute('data-cat');
      expanded = false;
      filterBar.querySelectorAll('.filter-btn').forEach(function (x) {
        x.setAttribute('aria-pressed', String(x === b));
      });
      render();
    });

    moreBtn.addEventListener('click', function () { expanded = !expanded; render(); });

    /* Lightbox */
    function showInBox(i) {
      var n = visible.length;
      lbIndex = (i + n) % n;
      var p = visible[lbIndex];
      var img = document.getElementById('lightboxImg');
      img.src = encodeURI(p.file);
      img.alt = p.name;
      document.getElementById('lightboxCaption').textContent = p.name;
    }

    grid.addEventListener('click', function (e) {
      var b = e.target.closest('.gallery__btn');
      if (!b || typeof box.showModal !== 'function') return;
      lastTrigger = b;
      showInBox(parseInt(b.getAttribute('data-index'), 10));
      box.showModal();
    });

    box.addEventListener('click', function (e) {
      var action = e.target.closest('[data-lb]');
      if (action) {
        var a = action.getAttribute('data-lb');
        if (a === 'close') box.close();
        if (a === 'prev') showInBox(lbIndex - 1);
        if (a === 'next') showInBox(lbIndex + 1);
        return;
      }
      if (e.target === box) box.close(); /* click on the backdrop */
    });
    box.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') showInBox(lbIndex - 1);
      if (e.key === 'ArrowRight') showInBox(lbIndex + 1);
    });
    box.addEventListener('close', function () { if (lastTrigger) lastTrigger.focus(); });

    render();
  }

  /* ---------------------------------------------------------------
     Module: copy email to clipboard
     --------------------------------------------------------------- */
  function initCopy() {
    document.querySelectorAll('[data-copy]').forEach(function (btn) {
      var label = btn.querySelector('span');
      btn.addEventListener('click', function () {
        var text = btn.getAttribute('data-copy');
        var done = function () {
          label.textContent = 'Copied';
          window.setTimeout(function () { label.textContent = 'Copy'; }, 1800);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(done, function () { window.prompt('Copy this address:', text); });
        } else {
          window.prompt('Copy this address:', text);
        }
      });
    });
  }

  /* ---------------------------------------------------------------
     Module: footer year
     --------------------------------------------------------------- */
  function initYear() {
    var y = document.getElementById('year');
    if (y) y.textContent = String(new Date().getFullYear());
  }

  /* ---------------------------------------------------------------
     Start everything
     --------------------------------------------------------------- */
  initHeader();
  initActiveNav();
  initReveal();
  initCounters();
  initGallery();
  initCopy();
  initYear();
})();