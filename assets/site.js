// Shared navigation behavior: sticky shadow, mobile menu, and Work dropdown.
(function () {
  var nav = document.getElementById('nav');
  if (nav) {
    window.addEventListener('scroll', function () {
      nav.classList.toggle('scrolled', window.scrollY > 10);
    });
  }

  var toggle = document.getElementById('nav-toggle');
  var links = document.getElementById('nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      toggle.classList.toggle('open');
      links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(links.classList.contains('open')));
    });
  }

  var menu = document.querySelector('.work-menu');
  if (menu) {
    // Close the dropdown when clicking outside of it.
    document.addEventListener('click', function (event) {
      if (menu.open && !menu.contains(event.target)) {
        menu.open = false;
      }
    });
    // Close the dropdown after choosing a destination.
    menu.querySelectorAll('.work-panel a').forEach(function (link) {
      link.addEventListener('click', function (event) {
        menu.open = false;
        // Also close the mobile menu panel if it's open.
        if (toggle && links && links.classList.contains('open')) {
          toggle.classList.remove('open');
          links.classList.remove('open');
          toggle.setAttribute('aria-expanded', 'false');
        }
        // For links that point to a section on the current page, handle the
        // scroll ourselves. A plain hash change can silently fail when a medium
        // filter has hidden the target section (display:none) or when the page
        // is already at that hash — so reset the filter and force the scroll.
        var url = new URL(link.href, window.location.href);
        if (url.pathname === window.location.pathname && url.hash.length > 1) {
          var target = document.querySelector(url.hash);
          if (target) {
            event.preventDefault();
            var allBtn = document.querySelector('.collateral-controls button[data-filter="all"]');
            if (allBtn && !allBtn.classList.contains('active')) {
              allBtn.click();
            }
            history.pushState(null, '', url.hash);
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      });
    });
    // Close on Escape for keyboard users.
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && menu.open) {
        menu.open = false;
      }
    });
  }

  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Count-up animation for stat numbers.
  function animateCount(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    if (isNaN(target)) return;
    var prefix = el.getAttribute('data-prefix') || '';
    var suffix = el.getAttribute('data-suffix') || '';
    if (reduceMotion) {
      el.textContent = prefix + target + suffix;
      return;
    }
    var duration = 1400;
    var start = null;
    function step(ts) {
      if (start === null) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      var value = Math.round(target * eased);
      el.textContent = prefix + value + suffix;
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = prefix + target + suffix;
    }
    requestAnimationFrame(step);
  }

  // Scroll reveal for elements that opt in (+ trigger counters when in view).
  var revealables = document.querySelectorAll('.reveal, .reveal-group');
  if (revealables.length && 'IntersectionObserver' in window) {
    var reveal = function (el) {
      el.classList.add('visible');
      el.querySelectorAll('[data-count]').forEach(animateCount);
    };
    // threshold 0 + a small bottom rootMargin fires as soon as any part of the
    // element enters the viewport. This matters for very tall sections (e.g. the
    // portfolio galleries) where a percentage threshold would never be met while
    // the section is only partially on screen — causing items to stay hidden
    // until the user scrolled. Now anything already in view on load reveals immediately.
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        reveal(entry.target);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0, rootMargin: '0px 0px -8% 0px' });
    revealables.forEach(function (el) { observer.observe(el); });
  } else {
    revealables.forEach(function (el) {
      el.classList.add('visible');
      el.querySelectorAll('[data-count]').forEach(animateCount);
    });
  }

  // Scroll progress bar (only on pages that include the element).
  var progress = document.getElementById('scroll-progress');
  if (progress) {
    var updateProgress = function () {
      var doc = document.documentElement;
      var scrollable = doc.scrollHeight - doc.clientHeight;
      var pct = scrollable > 0 ? (doc.scrollTop / scrollable) * 100 : 0;
      progress.style.width = pct + '%';
    };
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);
    updateProgress();
  }

  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Dark-mode toggle (initial theme is set inline in <head> to avoid a flash).
  var themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      var next = isDark ? 'light' : 'dark';
      if (next === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
      themeToggle.setAttribute('aria-pressed', String(next === 'dark'));
      try { localStorage.setItem('theme', next); } catch (e) {}
    });
  }
})();
