(function () {
  "use strict";

  var navToggle = document.getElementById("nav-toggle");
  var mainNav = document.getElementById("main-nav");
  var siteHeader = document.getElementById("site-header");
  var navSentinel = document.getElementById("nav-sticky-sentinel");
  var headerAnchor = document.getElementById("site-header-anchor");
  var navStickY = 0;
  var navUnstickY = 0;
  var navStickyTicking = false;
  var STICKY_BUFFER = 24;

  function captureNavMetrics() {
    if (!navSentinel || !siteHeader) return;
    navStickY = navSentinel.getBoundingClientRect().top + window.scrollY;
    navUnstickY = navStickY - STICKY_BUFFER;
    document.documentElement.style.setProperty("--nav-height", siteHeader.offsetHeight + "px");
  }

  function setNavSticky(stuck) {
    if (!siteHeader || !headerAnchor) return;
    if (stuck === siteHeader.classList.contains("is-sticky")) return;

    if (stuck) {
      siteHeader.classList.add("is-sticky");
      document.body.appendChild(siteHeader);
      document.body.classList.add("nav-is-sticky");
    } else {
      siteHeader.classList.remove("is-sticky");
      headerAnchor.appendChild(siteHeader);
      document.body.classList.remove("nav-is-sticky");
      captureNavMetrics();
    }
  }

  function onNavScroll() {
    if (!siteHeader) return;
    if (!navStickyTicking) {
      navStickyTicking = true;
      requestAnimationFrame(function () {
        var y = window.scrollY;
        if (siteHeader.classList.contains("is-sticky")) {
          if (y <= navUnstickY) setNavSticky(false);
        } else if (y >= navStickY) {
          setNavSticky(true);
        }
        navStickyTicking = false;
      });
    }
  }

  if (siteHeader && navSentinel) {
    captureNavMetrics();
    setNavSticky(window.scrollY >= navStickY);
    window.addEventListener("scroll", onNavScroll, { passive: true });
    window.addEventListener("resize", function () {
      if (!siteHeader.classList.contains("is-sticky")) {
        captureNavMetrics();
      } else {
        document.documentElement.style.setProperty("--nav-height", siteHeader.offsetHeight + "px");
      }
      onNavScroll();
    });
  }

  function setNavOpen(open) {
    if (!navToggle || !mainNav) return;
    mainNav.classList.toggle("is-open", open);
    navToggle.classList.toggle("is-active", open);
    navToggle.setAttribute("aria-expanded", open);
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.classList.toggle("nav-open", open);
  }

  if (navToggle && mainNav) {
    navToggle.addEventListener("click", function () {
      setNavOpen(!mainNav.classList.contains("is-open"));
    });

    mainNav.querySelectorAll(".nav-item__toggle").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        if (window.innerWidth >= 768) return;
        e.preventDefault();
        e.stopPropagation();
        var item = btn.closest(".nav-item--has-sub");
        if (!item) return;
        var open = item.classList.toggle("is-open");
        btn.setAttribute("aria-expanded", open);
      });
    });

    var navCloseTimer;
    mainNav.querySelectorAll(".nav-item--has-sub").forEach(function (item) {
      item.addEventListener("mouseenter", function () {
        if (window.innerWidth < 768) return;
        clearTimeout(navCloseTimer);
        item.classList.add("is-hover");
      });
      item.addEventListener("mouseleave", function () {
        if (window.innerWidth < 768) return;
        var el = item;
        navCloseTimer = setTimeout(function () {
          el.classList.remove("is-hover");
        }, 180);
      });
    });

    mainNav.querySelectorAll(".nav-sub a, .main-nav__list > li > a").forEach(function (link) {
      link.addEventListener("click", function () {
        setNavOpen(false);
      });
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setNavOpen(false);
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth >= 768) {
        setNavOpen(false);
        mainNav.querySelectorAll(".nav-item--has-sub.is-open").forEach(function (item) {
          item.classList.remove("is-open");
        });
      } else {
        mainNav.querySelectorAll(".nav-item--has-sub.is-hover").forEach(function (item) {
          item.classList.remove("is-hover");
        });
      }
    });
  }

  document.querySelectorAll(".hero-form, .contact-form").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      var ok = form.querySelector(".form-msg--ok");
      var err = form.querySelector(".form-msg--err");
      if (ok) ok.hidden = false;
      if (err) err.hidden = true;
      form.reset();
      setTimeout(function () {
        if (ok) ok.hidden = true;
      }, 5000);
    });
  });

  document.querySelectorAll(".faq-item__q").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var item = btn.closest(".faq-item");
      var open = item.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", open);
    });
  });

  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener("click", function (e) {
      var id = this.getAttribute("href");
      if (!id || id === "#") return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  var galleryViewMore = document.getElementById("gallery-view-more");
  var galleryGrid = document.getElementById("gallery-grid");
  var galleryViewMoreWrap = document.getElementById("gallery-view-more-wrap");
  if (galleryViewMore && galleryGrid) {
    galleryViewMore.addEventListener("click", function () {
      galleryGrid.classList.add("is-expanded");
      if (galleryViewMoreWrap) galleryViewMoreWrap.hidden = true;
    });
    if (!galleryGrid.querySelector(".gallery-grid__item--more")) {
      if (galleryViewMoreWrap) galleryViewMoreWrap.hidden = true;
    }
  }

  var blogGrid = document.getElementById("blog-grid");
  if (blogGrid && window.BLOG_POSTS) {
    blogGrid.innerHTML = window.BLOG_POSTS.map(function (post) {
      var date = new Date(post.date);
      var dateStr = date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
      return (
        "<article class=\"blog-card\">" +
        "<a href=\"" + post.slug + "\" class=\"blog-card__media\">" +
        "<img src=\"" + post.image + "\" alt=\"" + post.imageAlt + "\" loading=\"lazy\" width=\"600\" height=\"340\">" +
        "</a>" +
        "<div class=\"blog-card__body\">" +
        "<p class=\"blog-card__category\">" + post.category + "</p>" +
        "<h2 class=\"blog-card__title\"><a href=\"" + post.slug + "\">" + post.title + "</a></h2>" +
        "<p class=\"blog-card__excerpt\">" + post.excerpt + "</p>" +
        "<p class=\"blog-card__meta\">" + post.author + " &middot; " + dateStr + "</p>" +
        "<a href=\"" + post.slug + "\" class=\"blog-card__link\">Read More</a>" +
        "</div></article>"
      );
    }).join("");
  }

  var sitemapMount = document.getElementById("sitemap-mount");
  if (sitemapMount) {
    sitemapMount.remove();
  }

  (function initTrustStatsCountUp() {
    var section = document.querySelector(".trust-stats");
    if (!section) return;

    var counters = section.querySelectorAll("[data-count]");
    if (!counters.length) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    function formatCount(el, value) {
      var decimals = parseInt(el.dataset.decimals || "0", 10);
      var suffix = el.dataset.suffix || "";
      var num = decimals ? value.toFixed(decimals) : String(Math.round(value));
      return num + suffix;
    }

    function runCounter(el, delay) {
      var target = parseFloat(el.dataset.count);
      if (isNaN(target)) return;
      var duration = 1800;

      setTimeout(function () {
        var startTime = null;
        function tick(now) {
          if (!startTime) startTime = now;
          var progress = Math.min((now - startTime) / duration, 1);
          var eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = formatCount(el, target * eased);
          if (progress < 1) {
            requestAnimationFrame(tick);
          } else {
            el.textContent = formatCount(el, target);
          }
        }
        el.textContent = formatCount(el, 0);
        requestAnimationFrame(tick);
      }, delay);
    }

    counters.forEach(function (el) {
      el.textContent = formatCount(el, 0);
    });

    if (!("IntersectionObserver" in window)) {
      counters.forEach(function (el, i) {
        runCounter(el, i * 120);
      });
      return;
    }

    var started = false;
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting || started) return;
          started = true;
          observer.disconnect();
          counters.forEach(function (el, i) {
            runCounter(el, i * 120);
          });
        });
      },
      { threshold: 0.35, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(section);
  })();

  (function initFloatActions() {
    var root = document.getElementById("float-actions");
    var toggle = document.getElementById("float-actions-toggle");
    var menu = document.getElementById("float-actions-menu");
    var shareBtn = document.getElementById("float-actions-share");
    if (!root || !toggle || !menu) return;

    function setOpen(open) {
      root.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close contact menu" : "Open contact menu");
      if (open) {
        menu.removeAttribute("hidden");
      } else {
        menu.setAttribute("hidden", "");
      }
    }

    toggle.addEventListener("click", function () {
      setOpen(!root.classList.contains("is-open"));
    });

    document.addEventListener("click", function (e) {
      if (!root.classList.contains("is-open")) return;
      if (!root.contains(e.target)) setOpen(false);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && root.classList.contains("is-open")) {
        setOpen(false);
        toggle.focus();
      }
    });

    menu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        setOpen(false);
      });
    });

    if (shareBtn) {
      shareBtn.addEventListener("click", function () {
        var title = (window.SITE && window.SITE.name) || document.title;
        var url = window.location.href;
        if (navigator.share) {
          navigator.share({ title: title, url: url }).catch(function () {});
          return;
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(url).then(function () {
            var original = shareBtn.innerHTML;
            shareBtn.innerHTML = '<span class="float-actions__icon" aria-hidden="true">&#10003;</span>Link Copied!';
            setTimeout(function () {
              shareBtn.innerHTML = original;
            }, 2000);
          });
        }
      });
    }
  })();

  (function initBlogPrint() {
    var header = document.querySelector(".blog-article__header");
    if (!header || header.querySelector(".blog-article__print")) return;

    var category = header.querySelector(".blog-article__category");
    var isGuide = category && /guide/i.test(category.textContent);
    var label = isGuide ? "Print Guide" : "Print Article";

    var actions = document.createElement("div");
    actions.className = "blog-article__actions";

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "blog-article__print";
    btn.innerHTML =
      '<span class="blog-article__print__icon" aria-hidden="true">&#128438;</span>' + label;
    btn.addEventListener("click", function () {
      window.print();
    });

    actions.appendChild(btn);
    header.appendChild(actions);
  })();
})();
