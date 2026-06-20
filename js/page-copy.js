/**
 * Service- and city-specific copy — avoids robotic repeated blocks site-wide.
 */
(function (global) {
  "use strict";

  var HIGHLIGHTS = {
    kitchen: {
      title: "Designed Around How You Cook & Live",
      body: "A kitchen remodel is only successful when the layout, storage, and finishes fit your household. Led by owner Bojan Ninkovic, our team coordinates cabinetry, countertops, plumbing, and electrical under one plan — so your new kitchen works beautifully from the first meal you make in it."
    },
    bathroom: {
      title: "Certified Aging-in-Place Specialist (CAPS)",
      body: "4C Construction holds <strong>CAPS certification</strong> through the National Association of Home Builders. That means we design bathrooms with long-term safety in mind — walk-in showers, grab bars, and accessible layouts that still look polished and intentional."
    },
    basement: {
      title: "Turn Unused Space Into Real Square Footage",
      body: "Basement finishing adds living area without changing your footprint. We handle framing, egress, moisture considerations, and finish work so your lower level is comfortable, code-compliant, and ready for family nights, guests, or a quiet home office."
    },
    "custom-homes": {
      title: "Owner-Led From First Meeting to Move-In",
      body: "Building a custom home is a major investment. Bojan Ninkovic stays personally involved throughout — helping you navigate lot selection, design decisions, permitting, and construction so your home reflects how your family actually lives."
    },
    "whole-home": {
      title: "One Team for a Coordinated Renovation",
      body: "Whole-home remodeling works best when kitchen, bath, flooring, and structural updates are planned together. We manage trades, timelines, and selections as a single project — not a string of disconnected contractors."
    },
    decks: {
      title: "Built for Nebraska Weather",
      body: "Outdoor projects need solid structure and the right materials for our climate. Whether you prefer composite decking or traditional wood, we build decks and outdoor structures that look great on day one and hold up season after season."
    },
    city: {
      title: "Local Contractor, Personal Attention",
      body: "4C Construction is headquartered in Bellevue and has served the Omaha Metro for over 30 years. We are licensed, insured, and bonded — and we treat every home as if it were our own, with clear communication from estimate to final walkthrough."
    },
    default: {
      title: "Quality You Can See in the Details",
      body: "We are a locally owned general contractor with over 30 years of experience across the Omaha Metro. Proper planning, quality materials, and skilled installation are not marketing phrases for us — they are how every project is run."
    }
  };

  var CONSULT = {
    kitchen: {
      title: "Schedule Your Kitchen Consultation",
      body: "Tell us how you use your kitchen today and what you want to change. We will walk your space, discuss options, and provide a clear scope and estimate — with no pressure."
    },
    bathroom: {
      title: "Schedule Your Bathroom Consultation",
      body: "Whether you need a full remodel, a tub-to-shower conversion, or an accessible update, we will help you plan a bathroom that fits your home and your budget."
    },
    basement: {
      title: "Schedule Your Basement Consultation",
      body: "Not sure what is possible in your basement? We will evaluate the space, talk through layout ideas, and outline a realistic path from unfinished to fully livable."
    },
    "custom-homes": {
      title: "Schedule Your Custom Home Consultation",
      body: "If you are exploring a lot, a floor plan, or a timeline for building, we are happy to sit down and answer your questions before you commit to anything."
    },
    "whole-home": {
      title: "Schedule Your Remodeling Consultation",
      body: "Every whole-home project starts with a conversation about priorities — what to tackle first, what can wait, and what will make the biggest difference in how you live."
    },
    decks: {
      title: "Schedule Your Deck Consultation",
      body: "We will review your backyard, discuss size and materials, and help you plan an outdoor space your family will actually use."
    },
    default: {
      title: "Schedule Your In-Home Consultation",
      body: "Call <a href=\"tel:+14026161814\">(402) 616-1814</a> or request service online. We respond promptly and keep the process straightforward."
    }
  };

  var PROCESS_INTRO = {
    kitchen: "From first measurement to the last cabinet handle, here is how a typical kitchen remodel with 4C Construction unfolds.",
    bathroom: "Bathroom projects move quickly when waterproofing, tile, and fixtures are sequenced correctly. Here is our approach.",
    basement: "Basement finishing involves more than drywall — here is how we guide your project from concept to completion.",
    "custom-homes": "Custom home builds require careful sequencing. Here is how we keep your project organized and on track.",
    "whole-home": "Coordinated remodeling needs a clear plan. Here is what homeowners can expect when working with our team.",
    decks: "A well-built deck starts with proper footings and framing. Here is our typical project flow.",
    default: "A clear process keeps your project on schedule and your expectations aligned at every step."
  };

  function serviceKeyFromBody() {
    var body = document.body;
    var svc = body.dataset.service || "";
    if (svc) return svc;
    var nav = body.dataset.nav || "";
    var map = {
      kitchens: "kitchen",
      bathrooms: "bathroom",
      basements: "basement",
      "custom-homes": "custom-homes",
      "whole-home": "whole-home",
      decks: "decks"
    };
    return map[nav] || "";
  }

  function isCityHubPage() {
    var slug = (window.location.pathname.split("/").pop() || "").toLowerCase();
    return /remodeling-contractor\.html$/.test(slug) ||
      slug.indexOf("remodeling-contractor") >= 0 && slug.endsWith(".html") &&
      !slug.startsWith("omaha-") && !slug.startsWith("kitchen-");
  }

  function polishInnerPage() {
    var key = serviceKeyFromBody();
    var slug = (window.location.pathname.split("/").pop() || "").toLowerCase();
    var isLocal = slug.indexOf("omaha-") === 0 || slug.indexOf("bellevue") >= 0 ||
      slug.indexOf("papillion") >= 0 || slug.indexOf("la-vista") >= 0 ||
      slug.indexOf("gretna") >= 0 || slug.indexOf("elkhorn") >= 0 ||
      slug.indexOf("bennington") >= 0 || slug.indexOf("boys-town") >= 0 ||
      slug.indexOf("north-omaha") >= 0 || slug.indexOf("south-omaha") >= 0;

    var highlightKey = key === "bathroom" ? "bathroom" :
      isLocal && !key ? "city" : (key || "default");
    var hl = HIGHLIGHTS[highlightKey] || HIGHLIGHTS.default;

    var highlight = document.querySelector(".ip-highlight");
    if (highlight) {
      var h2 = highlight.querySelector("h2");
      var p = highlight.querySelector("p");
      if (h2 && (h2.textContent.indexOf("Built the Right Way") >= 0 || key === "bathroom")) {
        h2.textContent = hl.title;
        if (p) p.innerHTML = hl.body;
      }
    }

    var consult = document.querySelector(".ip-consult");
    if (consult) {
      var cKey = key || "default";
      var c = CONSULT[cKey] || CONSULT.default;
      var h2c = consult.querySelector("h2");
      var pc = consult.querySelector("p");
      if (h2c) h2c.textContent = c.title;
      if (pc && pc.textContent.indexOf("4C Construction specializes in custom home") >= 0) {
        pc.innerHTML = c.body;
      }
    }

    var processSub = document.querySelector(".ip-process .section-sub");
    if (processSub && processSub.textContent.indexOf("clear and organized process") >= 0) {
      var pk = key || "default";
      processSub.textContent = PROCESS_INTRO[pk] || PROCESS_INTRO.default;
    }

    document.querySelectorAll(".ip-kicker, .page-hero__kicker").forEach(function (el) {
      if (el.textContent === el.textContent.toUpperCase() && el.textContent.length > 4) {
        el.textContent = toTitleCase(el.textContent);
      }
    });
  }

  function toTitleCase(str) {
    return str.toLowerCase().replace(/\b\w/g, function (c) { return c.toUpperCase(); });
  }

  function schemaJson() {
    var S = global.SITE;
    if (!S) return "";
    return JSON.stringify({
      "@context": "https://schema.org",
      "@type": "GeneralContractor",
      "name": S.name,
      "description": S.tagline,
      "url": "https://4c-omaha.com/",
      "telephone": S.phone,
      "email": S.email,
      "address": {
        "@type": "PostalAddress",
        "streetAddress": S.address,
        "addressLocality": "Bellevue",
        "addressRegion": "NE",
        "postalCode": "68147",
        "addressCountry": "US"
      },
      "areaServed": S.cities.map(function (c) {
        return typeof c === "string" ? c : c.name;
      }),
      "openingHours": "Mo-Fr 07:00-19:00",
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "5.0",
        "reviewCount": "50"
      },
      "sameAs": [S.facebookUrl, S.googleReviewsUrl].filter(Boolean)
    });
  }

  function injectSchema() {
    if (document.getElementById("schema-local-business")) return;
    var script = document.createElement("script");
    script.id = "schema-local-business";
    script.type = "application/ld+json";
    script.textContent = schemaJson();
    document.head.appendChild(script);
  }

  global.PAGE_COPY = {
    polishInnerPage: polishInnerPage,
    injectSchema: injectSchema
  };
})(window);
