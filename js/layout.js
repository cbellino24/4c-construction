(function () {
  "use strict";

  var S = window.SITE;
  if (!S) return;

  var body = document.body;
  var activeKey = body.dataset.nav || "";
  var isHome = body.dataset.page === "home";
  var pageTitle = body.dataset.title || "";
  var pageSubtitle = body.dataset.subtitle || "";
  var pageKicker = body.dataset.kicker || pageTitle;
  var preselectedService = body.dataset.service || "";

  function resolveHeroType() {
    if (isHome) return "home";
    if (body.dataset.hero) return body.dataset.hero;
    var simpleKeys = ["about", "contact", "reviews", "gallery", "portfolio"];
    if (simpleKeys.indexOf(activeKey) >= 0) return "simple";
    var path = (window.location.pathname.split("/").pop() || "").toLowerCase();
    if (/^(about|contact|reviews|portfolio|gallery|blog|privacy|selecting|media-room|ultimate-guide|role-custom)/.test(path)) {
      return "simple";
    }
    if (preselectedService || body.dataset.service) return "service";
    return "service";
  }

  var heroType = resolveHeroType();

  function pathPrefix() {
    var link = document.querySelector('link[rel="stylesheet"][href*="styles.css"]');
    if (!link) return "";
    var href = link.getAttribute("href") || "";
    var m = href.match(/^(\.\.\/)+/);
    return m ? m[0] : "";
  }

  function serviceNavItems() {
    var services = S.nav.filter(function (item) { return item.children; })[0];
    return services ? services.children : [];
  }

  function isServiceNavActive() {
    return serviceNavItems().some(function (item) { return item.key === activeKey; });
  }

  function navHtml() {
    return S.nav.map(function (item) {
      if (item.children) {
        var parentCls = isServiceNavActive() ? " is-active" : "";
        var subOpen = isServiceNavActive() ? " is-open" : "";
        var subHtml = item.children.map(function (child) {
          var cls = child.key === activeKey ? " is-active" : "";
          return (
            '<li><a href="' + pathPrefix() + child.href + '" class="' + cls.trim() + '">' +
            child.label + "</a></li>"
          );
        }).join("");
        return (
          '<li class="nav-item nav-item--has-sub' + parentCls + subOpen + '">' +
          '<button type="button" class="nav-item__toggle" aria-expanded="' + (isServiceNavActive() ? "true" : "false") + '" aria-haspopup="true">' +
          item.label + '<span class="nav-item__caret" aria-hidden="true"></span></button>' +
          '<ul class="nav-sub" aria-label="Services">' + subHtml + "</ul></li>"
        );
      }
      var cls = item.key === activeKey ? " is-active" : "";
      return (
        '<li><a href="' + pathPrefix() + item.href + '" class="' + cls.trim() + '">' +
        item.label + "</a></li>"
      );
    }).join("");
  }

  function footerServicesHtml() {
    return serviceNavItems().map(function (item) {
      return '<li><a href="' + pathPrefix() + item.href + '">' + item.label + "</a></li>";
    }).join("");
  }

  function currentPageSlug() {
    var path = window.location.pathname.replace(/\\/g, "/");
    var parts = path.split("/");
    return parts[parts.length - 1] || "index.html";
  }

  function seoRelatedHtml() {
    if (!window.SEO_LINKS) return "";
    var related = window.SEO_LINKS.getRelated(currentPageSlug());
    if (!related || !related.links.length) return "";
    var prefix = pathPrefix();
    var links = related.links.map(function (l) {
      return '<a href="' + prefix + l.href + '" class="seo-related__link">' + l.label + "</a>";
    }).join("");
    return (
      '<section class="section section--white seo-related" aria-label="Related pages">' +
      '<div class="container">' +
      '<h2 class="section-title">' + related.title + "</h2>" +
      (related.intro ? '<p class="section-sub">' + related.intro + "</p>" : "") +
      '<div class="seo-related__grid">' + links + "</div></div></section>"
    );
  }

  function injectSeoRelated() {
    if (isHome || document.querySelector(".seo-related")) return;
    var html = seoRelatedHtml();
    if (!html) return;
    var consult = document.querySelector(".ip-consult");
    if (consult && consult.parentNode) {
      consult.insertAdjacentHTML("beforebegin", html);
      return;
    }
    var main = document.querySelector("main");
    if (main) main.insertAdjacentHTML("beforeend", html);
  }

  function budgetOptionsHtml() {
    var opts = '<option value="">Select range (optional)</option>';
    S.budgetOptions.forEach(function (b) {
      opts += "<option>" + b + "</option>";
    });
    return opts;
  }

  function serviceOptionsHtml(selected) {
    var list = (S.serviceFormOptions && S.serviceFormOptions[preselectedService]) || S.serviceOptions;
    var defaultVal = selected;
    if (!defaultVal && preselectedService === "bathroom") {
      defaultVal = "bathroom-remodel";
    }
    if (!defaultVal && preselectedService && list === S.serviceOptions) {
      defaultVal = preselectedService;
    }
    var opts = '<option value="" disabled' + (defaultVal ? "" : " selected") + ">Select a service</option>";
    list.forEach(function (o) {
      var sel = o.value === defaultVal ? " selected" : "";
      opts += '<option value="' + o.value + '"' + sel + ">" + o.label + "</option>";
    });
    return opts;
  }

  function heroFactsHtml() {
    var facts = (S.heroFacts && (S.heroFacts[preselectedService] || S.heroFacts.default)) || [
      "30+ Years of Trusted Experience",
      "Licensed, Insured & Bonded",
      "5.0 Google Rating"
    ];
    return facts.map(function (fact) {
      return "<p>" + fact + "</p>";
    }).join("");
  }

  function requestFormHtml(id) {
    return (
      '<form class="hero-form" id="' + id + '" novalidate>' +
      '<div class="form-field"><label for="' + id + '-name">Name</label>' +
      '<input type="text" id="' + id + '-name" name="name" required placeholder="Full Name*" autocomplete="name"></div>' +
      '<div class="form-field"><label for="' + id + '-phone">Phone</label>' +
      '<input type="tel" id="' + id + '-phone" name="phone" required placeholder="Phone*" autocomplete="tel"></div>' +
      '<div class="form-field"><label for="' + id + '-email">Email</label>' +
      '<input type="email" id="' + id + '-email" name="email" required placeholder="Email*" autocomplete="email"></div>' +
      '<div class="form-field"><label for="' + id + '-contact">Preferred Method of Contact</label>' +
      '<select id="' + id + '-contact" name="contact_method">' +
      '<option value="email">Email</option><option value="phone">Phone</option></select></div>' +
      '<div class="form-field"><label for="' + id + '-service">Service*</label>' +
      '<select id="' + id + '-service" name="service" required>' + serviceOptionsHtml(preselectedService) + "</select></div>" +
      '<div class="form-field"><label for="' + id + '-city">City</label>' +
      '<input type="text" id="' + id + '-city" name="city" placeholder="e.g. Omaha, Bellevue"></div>' +
      '<div class="form-field"><label for="' + id + '-budget">Estimated Budget</label>' +
      '<select id="' + id + '-budget" name="budget">' + budgetOptionsHtml() + "</select></div>" +
      '<div class="form-field"><label for="' + id + '-msg">Project Description</label>' +
      '<textarea id="' + id + '-msg" name="message" rows="3" placeholder="Tell us about your project"></textarea></div>' +
      '<button type="submit" class="btn btn--primary btn--full"><span class="btn__icon" aria-hidden="true">&#9733;</span> Request Service</button>' +
      '<p class="form-msg form-msg--ok" hidden>Thank you for contacting us. We will get back to you as soon as possible.</p>' +
      '<p class="form-msg form-msg--err" hidden>Oops, there was an error sending your message. Please try again later.</p>' +
      "</form>"
    );
  }

  function headerTopHtml() {
    var ctaHref = isHome ? "#request-service" : pathPrefix() + "contact-us.html";
    return (
      '<div class="header-row header-row--top">' +
      '<div class="container header-row__inner">' +
      '<div class="header-reviews" aria-label="5 star rating">' +
      '<span class="header-reviews__stars">&#9733;&#9733;&#9733;&#9733;&#9733;</span>' +
      '<span class="header-reviews__text">5-Star Rated Contractor</span></div>' +
      '<a href="' + ctaHref + '" class="btn btn--primary">' +
      '<span class="btn__icon" aria-hidden="true">&#9733;</span> Request Service</a></div></div>'
    );
  }

  function headerBrandHtml() {
    return (
      '<div class="header-row header-row--brand">' +
      '<div class="container header-row__grid">' +
      '<p class="header-location"><strong>Serving Omaha, NE &amp; Surrounding Areas</strong></p>' +
      '<div class="site-logo-wrap">' +
      '<a href="' + pathPrefix() + 'index.html" class="site-logo" aria-label="' + S.name + ' Home">' +
      '<img src="' + pathPrefix() + S.logo + '" alt="' + S.name + ' Logo" width="280" height="29"></a>' +
      (S.motto ? '<p class="header-motto">' + S.motto + "</p>" : "") +
      "</div>" +
      '<a href="tel:' + S.phoneTel + '" class="header-phone"><strong>' + S.phone + "</strong></a>" +
      "</div></div>"
    );
  }

  function headerNavHtml() {
    var ctaHref = isHome ? "#request-service" : pathPrefix() + "contact-us.html";
    return (
      '<div class="site-header-anchor" id="site-header-anchor">' +
      '<div class="nav-sticky-sentinel" id="nav-sticky-sentinel" aria-hidden="true"></div>' +
      '<header class="site-header" id="site-header">' +
      '<div class="container">' +
      '<nav class="main-nav" id="main-nav" aria-label="Main navigation">' +
      '<ul class="main-nav__list">' + navHtml() + "</ul></nav>" +
      '<a href="' + ctaHref + '" class="site-header__sticky-cta">' +
      '<span class="site-header__sticky-cta__icon" aria-hidden="true">&#9733;</span> Request Service</a>' +
      '<button class="nav-toggle" id="nav-toggle" aria-label="Open menu" aria-expanded="false" aria-controls="main-nav">' +
      "<span></span><span></span><span></span></button></div></header></div>"
    );
  }

  function waveHtml() {
    return (
      '<div class="wave-divider" aria-hidden="true">' +
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none">' +
      '<path d="M50,99.8C22.43,99.8.07,55.17,0,.06H0v100H100V.06h0C99.93,55.17,77.57,99.8,50,99.8Z" fill="#ffffff"/></svg></div>'
    );
  }

  function simplePageHeroHtml() {
    var displayTitle = pageTitle.replace(/^About\s+/i, "").replace(/^Contact\s*/i, "").trim();
    if (/^about/i.test(pageKicker) || activeKey === "about") {
      displayTitle = "About";
    } else if (activeKey === "contact") {
      displayTitle = "Contact";
    } else if (activeKey === "reviews") {
      displayTitle = "Reviews";
    } else if (activeKey === "portfolio" || activeKey === "gallery") {
      displayTitle = "Portfolio";
    }
    return (
      '<section class="page-hero page-hero--simple">' +
      '<div class="container page-hero--simple__inner">' +
      '<p class="page-hero__kicker">' + pageKicker + "</p>" +
      "<h1>" + displayTitle + "</h1>" +
      '<p class="page-hero__company">' + S.name + "</p>" +
      "</div></section>" +
      waveHtml()
    );
  }

  function servicePageHeroHtml() {
    var subline = pageSubtitle
      ? '<p class="page-hero__sub">' + pageSubtitle + "</p>"
      : "";
    return (
      '<section class="page-hero">' +
      '<div class="container page-hero__grid">' +
      '<div class="page-hero__text">' +
      '<p class="page-hero__kicker">' + pageKicker + "</p>" +
      "<h1>" + pageTitle + "</h1>" +
      subline +
      '<hr class="hero__divider">' +
      '<div class="hero__facts">' +
      heroFactsHtml() +
      "</div>" +
      '<p class="page-hero__phone"><a href="tel:' + S.phoneTel + '">' + S.phone + "</a></p>" +
      '<div class="hero__btns">' +
      '<a href="#request-service" class="btn btn--primary"><span class="btn__icon" aria-hidden="true">&#9733;</span> Request Service</a>' +
      '<a href="tel:' + S.phoneTel + '" class="btn btn--outline-light">Call Now</a></div>' +
      "</div>" +
      '<aside class="hero__form-wrap" id="request-service">' +
      '<h2 class="hero__form-title">Request Service</h2>' +
      requestFormHtml("page-hero-form") +
      "</aside></div></section>" +
      waveHtml()
    );
  }

  function pageEndHtml() {
    return (
      '<section class="ip-review-band section section--dark">' +
      '<div class="container">' +
      '<h2 class="ip-review-band__title section-title section-title--light">30+ Years of Trusted Construction Experience</h2>' +
      '<p class="ip-review-band__sub">Have a project in mind? We offer free in-home consultations across the Omaha Metro.</p>' +
      '<p class="ip-review-band__phone"><a href="tel:' + S.phoneTel + '">' + S.phone + "</a></p>" +
      '<blockquote class="review-card ip-review-band__quote">' +
      '<div class="review-card__stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div>' +
      '<p>"Bo and his employees expertly installed a new patio door, kitchen lighting, recessed lighting in our family room, and moved light switches and outlets in preparation for our new kitchen install. The work was excellent!"</p>' +
      "<footer>&mdash; Noyes S. <span>Kitchen &amp; Electrical</span></footer></blockquote>" +
      '<div class="section-cta"><a href="contact-us.html" class="btn btn--primary"><span class="btn__icon" aria-hidden="true">&#9733;</span> Request Service</a></div>' +
      "</div></section>" +
      '<section class="section section--dark about-block ip-about-snippet">' +
      '<div class="container about-block__grid">' +
      '<div class="about-block__content">' +
      "<h3>" + S.name + "</h3>" +
      '<p class="about-block__subtitle"><strong>Omaha&rsquo;s Trusted Custom Home &amp; Remodeling Contractor</strong></p>' +
      "<p>" + S.footerTagline + "</p>" +
      "<p>From proper framing and waterproofing to precision finish work, our licensed, insured, and bonded team delivers clean job sites, clear communication, and results built to last.</p>" +
      '<a href="about-us.html" class="btn btn--primary"><span class="btn__icon" aria-hidden="true">&#9733;</span> About Our Company</a>' +
      "</div>" +
      '<div class="about-block__image" style="background-image:url(\'https://4c-omaha.com/wp-content/uploads/2025/03/house-complete-1-min.jpg\')"></div>' +
      "</div></section>"
    );
  }

  function accreditationsHtml() {
    if (!S.accreditations || !S.accreditations.length) return "";
    var logos = S.accreditations.map(function (a) {
      return '<img src="' + a.src + '" alt="' + a.alt + '" class="accreditations__logo" loading="lazy" width="120" height="60">';
    }).join("");
    return (
      '<section class="accreditations" aria-label="Professional accreditations">' +
      '<div class="container"><h2 class="accreditations__title">Our Accreditations</h2>' +
      '<div class="accreditations__grid">' + logos + "</div></div></section>"
    );
  }

  function footerBlockHtml() {
    var cities = S.cities.map(function (c) {
      var name = typeof c === "string" ? c : c.name;
      var href = typeof c === "string" ? "contact.html" : c.href;
      return '<li><a href="' + href + '">' + name + "</a></li>";
    }).join("");

    return (
      '<section class="section section--dark footer-block" id="contact">' +
      '<div class="container footer-block__grid">' +
      "<div><h4>Serving Area</h4><hr><ul class=\"city-list\">" + cities + "</ul></div>" +
      "<div><h4>Our Services</h4><hr><ul class=\"city-list\">" + footerServicesHtml() + "</ul></div>" +
      "<div><h4>Contact Us</h4><hr>" +
      '<p class="footer-block__tagline">' + S.footerTagline + "</p>" +
      '<p class="footer-block__phone"><a href="tel:' + S.phoneTel + '">' + S.phone + "</a></p>" +
      '<p class="footer-block__email"><a href="mailto:' + S.email + '">' + S.email + "</a></p>" +
      '<p class="footer-block__address">' + S.address + "<br>" + S.cityState + "</p>" +
      '<p class="footer-block__hours">' + S.businessHours + "</p>" +
      '<a href="contact-us.html" class="btn btn--primary"><span class="btn__icon" aria-hidden="true">&#9733;</span> Send a Message</a>' +
      '<div class="footer-block__links"><a href="about-us.html">About</a><a href="gallery.html">Portfolio</a><a href="blog.html">Blog</a>' +
      (S.facebookUrl ? '<a href="' + S.facebookUrl + '" target="_blank" rel="noopener">Facebook</a>' : "") +
      "</div>" +
      "</div></div></section>"
    );
  }

  function legalFooterHtml() {
    return (
      '<footer class="legal-footer">' +
      '<div class="container legal-footer__inner">' +
      "<p>&copy; " + new Date().getFullYear() + " " + S.name + ". All rights reserved.</p>" +
      '<nav aria-label="Legal links">' +
      (S.privacyPolicyUrl ? '<a href="' + S.privacyPolicyUrl + '">Privacy Policy</a>' : "") +
      (S.facebookUrl ? '<a href="' + S.facebookUrl + '" target="_blank" rel="noopener">Facebook</a>' : "") +
      "</nav>" +
      "</div></footer>"
    );
  }

  function mobileBarHtml() {
    return (
      '<div class="mobile-bar" aria-label="Quick contact actions">' +
      '<a href="tel:' + S.phoneTel + '" class="mobile-bar__item">Call Us</a>' +
      '<a href="sms:' + S.phoneTel + '" class="mobile-bar__item">Text Us</a>' +
      '<a href="reviews.html" class="mobile-bar__item">Reviews</a>' +
      '<a href="contact-us.html" class="mobile-bar__item mobile-bar__item--cta">Request Service</a>' +
      '<a href="mailto:' + S.email + '" class="mobile-bar__item">Email Us</a></div>'
    );
  }

  function resolveHeroImage() {
    var img = body.dataset.heroBg;
    if (!img && S.heroImages) {
      img = S.heroImages[activeKey] || S.heroImages[preselectedService];
    }
    return img;
  }

  function resolveHeroVideo() {
    var video = body.dataset.heroBgVideo;
    if (!video && S.heroVideos) {
      video = S.heroVideos[activeKey] || S.heroVideos[preselectedService];
    }
    return video;
  }

  function applyHeroBackground(el) {
    var img = resolveHeroImage();
    var videoSrc = resolveHeroVideo();
    var useVideo = videoSrc && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if ((!img && !useVideo) || !el) return;

    el.classList.add("hero-shell--animated");
    var media = el.querySelector(".hero-shell__media");
    if (!media) {
      media = document.createElement("div");
      media.className = "hero-shell__media";
      media.setAttribute("aria-hidden", "true");
      el.insertBefore(media, el.firstChild);
    }

    media.innerHTML = "";
    media.style.backgroundImage = "";

    if (useVideo) {
      var video = document.createElement("video");
      video.className = "hero-shell__video";
      video.autoplay = true;
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.preload = "auto";
      video.setAttribute("playsinline", "");
      video.setAttribute("aria-hidden", "true");
      if (img) video.poster = pathPrefix() + img;

      var source = document.createElement("source");
      source.src = pathPrefix() + videoSrc;
      source.type = "video/mp4";
      video.appendChild(source);
      media.appendChild(video);

      if (img) {
        media.style.backgroundImage = "url('" + pathPrefix() + img + "')";
      }

      video.play().catch(function () {
        if (img) {
          media.innerHTML = "";
          media.style.backgroundImage = "url('" + pathPrefix() + img + "')";
        }
      });
    } else if (img) {
      media.style.backgroundImage = "url('" + pathPrefix() + img + "')";
    }
  }

  var topMount = document.getElementById("site-top");
  if (topMount) {
    if (isHome) {
      topMount.innerHTML =
        headerTopHtml() + headerBrandHtml() + headerNavHtml();
      var homeShell = document.getElementById("home");
      if (homeShell) applyHeroBackground(homeShell);
    } else {
      topMount.className = "hero-shell hero-shell--page" + (heroType === "simple" ? " hero-shell--simple" : "");
      topMount.innerHTML =
        headerTopHtml() +
        headerBrandHtml() +
        headerNavHtml() +
        (heroType === "simple" ? simplePageHeroHtml() : servicePageHeroHtml());
      applyHeroBackground(topMount);
    }
  }

  var pageEndMount = document.getElementById("page-end");
  if (pageEndMount && heroType === "service") {
    pageEndMount.innerHTML = pageEndHtml();
  }

  var bottomMount = document.getElementById("site-bottom");
  if (bottomMount) {
    bottomMount.innerHTML = footerBlockHtml() + accreditationsHtml() + legalFooterHtml() + mobileBarHtml();
  }

  injectSeoRelated();

  if (window.PAGE_COPY) {
    window.PAGE_COPY.injectSchema();
    window.PAGE_COPY.polishInnerPage();
  }
})();
