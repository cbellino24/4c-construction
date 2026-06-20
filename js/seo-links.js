/**
 * Internal link registry for SEO landing pages.
 * Powers contextual "Related Pages" blocks on service, city, and project pages.
 */
(function (global) {
  "use strict";

  var CITY_HUBS = {
    "omaha-remodeling-contractor.html": {
      name: "Omaha",
      links: [
        { href: "remodeling-services-omaha.html", label: "Remodeling Services — Omaha" },
        { href: "remodeling-contractor-north-omaha-ne.html", label: "North Omaha Remodeling" },
        { href: "remodeling-contractor-south-omaha-ne.html", label: "South Omaha Remodeling" },
        { href: "remodeling-contractor-boys-town.html", label: "Boys Town Remodeling" },
        { href: "omaha-custom-home-builder.html", label: "Custom Home Builder — Omaha" },
        { href: "omaha-kitchen-remodeling.html", label: "Kitchen Remodeling — Omaha" },
        { href: "omaha-bathroom-remodeling.html", label: "Bathroom Remodeling — Omaha" },
        { href: "omaha-basement-finishing.html", label: "Basement Finishing — Omaha" },
        { href: "omaha-deck-builder.html", label: "Deck Builder — Omaha" }
      ]
    },
    "bellevue-remodeling-contractor.html": {
      name: "Bellevue",
      links: [
        { href: "remodeling-bellevue-ne.html", label: "Remodeling — Bellevue" },
        { href: "remodeling-contractor-bellevue-ne.html", label: "Remodeling Contractor — Bellevue" },
        { href: "custom-home-builder-bellevue.html", label: "Custom Home Builder — Bellevue" },
        { href: "kitchen-remodeling-bellevue-ne.html", label: "Kitchen Remodeling — Bellevue" },
        { href: "bathroom-remodeling-bellevue-ne.html", label: "Bathroom Remodeling — Bellevue" },
        { href: "basement-remodeling-contractors-bellevue.html", label: "Basement Remodeling — Bellevue" },
        { href: "deck-builders-bellevue-ne.html", label: "Deck Builders — Bellevue" },
        { href: "house-renovation-bellevue-ne.html", label: "House Renovation — Bellevue" }
      ]
    },
    "papillion-remodeling-contractor.html": {
      name: "Papillion",
      links: [
        { href: "remodeling-papillion-ne.html", label: "Remodeling — Papillion" },
        { href: "remodeling-company-papillion-ne.html", label: "Remodeling Company — Papillion" },
        { href: "remodeling-contractors-papillion-ne.html", label: "Remodeling Contractors — Papillion" },
        { href: "custom-home-builders-papillion-ne.html", label: "Custom Home Builders — Papillion" },
        { href: "basement-finishing-papillion-ne.html", label: "Basement Finishing — Papillion" },
        { href: "deck-builders-papillion-ne.html", label: "Deck Builders — Papillion" },
        { href: "house-renovation-services-papillion-ne.html", label: "House Renovation — Papillion" }
      ]
    },
    "la-vista-remodeling-contractor.html": {
      name: "La Vista",
      links: [
        { href: "remodeling-services-la-vista.html", label: "Remodeling Services — La Vista" }
      ]
    },
    "gretna-remodeling-contractor.html": { name: "Gretna", links: [] },
    "elkhorn-remodeling-contractor.html": { name: "Elkhorn", links: [] },
    "bennington-remodeling-contractor.html": { name: "Bennington", links: [] }
  };

  var SERVICE_MAIN = {
    "custom-home-building.html": {
      name: "Custom Home Building",
      local: [
        { href: "omaha-custom-home-builder.html", label: "Omaha" },
        { href: "custom-home-builder-bellevue.html", label: "Bellevue" },
        { href: "custom-home-builders-papillion-ne.html", label: "Papillion" }
      ]
    },
    "kitchen-remodeling.html": {
      name: "Kitchen Remodeling",
      local: [
        { href: "omaha-kitchen-remodeling.html", label: "Omaha" },
        { href: "kitchen-remodeling-bellevue-ne.html", label: "Bellevue" }
      ]
    },
    "bathroom-remodeling.html": {
      name: "Bathroom Remodeling",
      local: [
        { href: "omaha-bathroom-remodeling.html", label: "Omaha" },
        { href: "bathroom-remodeling-bellevue-ne.html", label: "Bellevue" }
      ]
    },
    "basement-finishing.html": {
      name: "Basement Finishing",
      local: [
        { href: "omaha-basement-finishing.html", label: "Omaha" },
        { href: "basement-remodeling-contractors-bellevue.html", label: "Bellevue" },
        { href: "basement-finishing-papillion-ne.html", label: "Papillion" }
      ]
    },
    "house-remodeling.html": {
      name: "Whole Home Remodeling",
      local: [
        { href: "omaha-remodeling-contractor.html", label: "Omaha" },
        { href: "bellevue-remodeling-contractor.html", label: "Bellevue" },
        { href: "house-renovation-bellevue-ne.html", label: "House Renovation — Bellevue" },
        { href: "house-renovation-services-papillion-ne.html", label: "House Renovation — Papillion" }
      ]
    },
    "our-services/deck-builders.html": {
      name: "Decks & Carpentry",
      local: [
        { href: "omaha-deck-builder.html", label: "Omaha" },
        { href: "deck-builders-bellevue-ne.html", label: "Bellevue" },
        { href: "deck-builders-papillion-ne.html", label: "Papillion" }
      ]
    }
  };

  var LOCAL_PAGES = {
    "omaha-custom-home-builder.html": { service: "custom-home-building.html", hub: "omaha-remodeling-contractor.html", city: "Omaha", serviceName: "Custom Home Building" },
    "custom-home-builder-bellevue.html": { service: "custom-home-building.html", hub: "bellevue-remodeling-contractor.html", city: "Bellevue", serviceName: "Custom Home Building" },
    "custom-home-builders-papillion-ne.html": { service: "custom-home-building.html", hub: "papillion-remodeling-contractor.html", city: "Papillion", serviceName: "Custom Home Building" },
    "omaha-kitchen-remodeling.html": { service: "kitchen-remodeling.html", hub: "omaha-remodeling-contractor.html", city: "Omaha", serviceName: "Kitchen Remodeling" },
    "kitchen-remodeling-bellevue-ne.html": { service: "kitchen-remodeling.html", hub: "bellevue-remodeling-contractor.html", city: "Bellevue", serviceName: "Kitchen Remodeling" },
    "omaha-bathroom-remodeling.html": { service: "bathroom-remodeling.html", hub: "omaha-remodeling-contractor.html", city: "Omaha", serviceName: "Bathroom Remodeling" },
    "bathroom-remodeling-bellevue-ne.html": { service: "bathroom-remodeling.html", hub: "bellevue-remodeling-contractor.html", city: "Bellevue", serviceName: "Bathroom Remodeling" },
    "omaha-basement-finishing.html": { service: "basement-finishing.html", hub: "omaha-remodeling-contractor.html", city: "Omaha", serviceName: "Basement Finishing" },
    "basement-remodeling-contractors-bellevue.html": { service: "basement-finishing.html", hub: "bellevue-remodeling-contractor.html", city: "Bellevue", serviceName: "Basement Finishing" },
    "basement-finishing-papillion-ne.html": { service: "basement-finishing.html", hub: "papillion-remodeling-contractor.html", city: "Papillion", serviceName: "Basement Finishing" },
    "omaha-deck-builder.html": { service: "our-services/deck-builders.html", hub: "omaha-remodeling-contractor.html", city: "Omaha", serviceName: "Decks & Carpentry" },
    "deck-builders-bellevue-ne.html": { service: "our-services/deck-builders.html", hub: "bellevue-remodeling-contractor.html", city: "Bellevue", serviceName: "Decks & Carpentry" },
    "deck-builders-papillion-ne.html": { service: "our-services/deck-builders.html", hub: "papillion-remodeling-contractor.html", city: "Papillion", serviceName: "Decks & Carpentry" },
    "house-renovation-bellevue-ne.html": { service: "house-remodeling.html", hub: "bellevue-remodeling-contractor.html", city: "Bellevue", serviceName: "Whole Home Remodeling" },
    "house-renovation-services-papillion-ne.html": { service: "house-remodeling.html", hub: "papillion-remodeling-contractor.html", city: "Papillion", serviceName: "Whole Home Remodeling" },
    "remodeling-bellevue-ne.html": { service: "house-remodeling.html", hub: "bellevue-remodeling-contractor.html", city: "Bellevue", serviceName: "Remodeling" },
    "remodeling-contractor-bellevue-ne.html": { service: "house-remodeling.html", hub: "bellevue-remodeling-contractor.html", city: "Bellevue", serviceName: "Remodeling" },
    "remodeling-papillion-ne.html": { service: "house-remodeling.html", hub: "papillion-remodeling-contractor.html", city: "Papillion", serviceName: "Remodeling" },
    "remodeling-company-papillion-ne.html": { service: "house-remodeling.html", hub: "papillion-remodeling-contractor.html", city: "Papillion", serviceName: "Remodeling" },
    "remodeling-contractors-papillion-ne.html": { service: "house-remodeling.html", hub: "papillion-remodeling-contractor.html", city: "Papillion", serviceName: "Remodeling" },
    "remodeling-services-omaha.html": { service: "house-remodeling.html", hub: "omaha-remodeling-contractor.html", city: "Omaha", serviceName: "Remodeling Services" },
    "remodeling-services-la-vista.html": { service: "house-remodeling.html", hub: "la-vista-remodeling-contractor.html", city: "La Vista", serviceName: "Remodeling Services" },
    "remodeling-contractor-north-omaha-ne.html": { service: "house-remodeling.html", hub: "omaha-remodeling-contractor.html", city: "North Omaha", serviceName: "Remodeling" },
    "remodeling-contractor-south-omaha-ne.html": { service: "house-remodeling.html", hub: "omaha-remodeling-contractor.html", city: "South Omaha", serviceName: "Remodeling" },
    "remodeling-contractor-boys-town.html": { service: "house-remodeling.html", hub: "omaha-remodeling-contractor.html", city: "Boys Town", serviceName: "Remodeling" }
  };

  var PROJECT_PAGES = {
    "project-custom-home-bellevue.html": {
      name: "Custom Home Build — Bellevue",
      service: "custom-home-building.html",
      serviceName: "Custom Home Building",
      category: "Custom Homes"
    },
    "project-kitchen-remodel.html": {
      name: "Kitchen Remodel",
      service: "kitchen-remodeling.html",
      serviceName: "Kitchen Remodeling",
      category: "Kitchens"
    },
    "project-bathroom-remodel.html": {
      name: "Master Bath Renovation",
      service: "bathroom-remodeling.html",
      serviceName: "Bathroom Remodeling",
      category: "Bathrooms"
    },
    "project-basement-finish.html": {
      name: "Family Room Finish",
      service: "basement-finishing.html",
      serviceName: "Basement Finishing",
      category: "Basements"
    },
    "project-deck-build.html": {
      name: "Backyard Deck Build",
      service: "our-services/deck-builders.html",
      serviceName: "Decks & Carpentry",
      category: "Decks"
    },
    "project-whole-home-renovation.html": {
      name: "Whole Home Renovation",
      service: "house-remodeling.html",
      serviceName: "Whole Home Remodeling",
      category: "Whole Home"
    }
  };

  var PORTFOLIO_LINKS = Object.keys(PROJECT_PAGES).map(function (slug) {
    return { href: slug, label: PROJECT_PAGES[slug].name };
  });

  var SERVICE_HUB_LINKS = Object.keys(SERVICE_MAIN).map(function (slug) {
    return { href: slug, label: SERVICE_MAIN[slug].name };
  });

  var CITY_HUB_SLUGS = Object.keys(CITY_HUBS).map(function (slug) {
    return { href: slug, label: "Remodeling Contractor — " + CITY_HUBS[slug].name };
  });

  function otherCityHubLinks(currentSlug) {
    return CITY_HUB_SLUGS.filter(function (item) {
      return item.href !== currentSlug;
    });
  }

  function otherServiceLinks(currentSlug) {
    return SERVICE_HUB_LINKS.filter(function (item) {
      return item.href !== currentSlug;
    });
  }

  function getProjectRelated(slug) {
    var project = PROJECT_PAGES[slug];
    if (!project) return null;
    var result = {
      title: "Explore More",
      intro: "Browse related services and other recent projects by 4C Construction.",
      links: [
        { href: "gallery.html", label: "Full Portfolio" },
        { href: project.service, label: project.serviceName + " Services" },
        { href: "contact-us.html", label: "Request a Consultation" }
      ]
    };
    Object.keys(PROJECT_PAGES).forEach(function (other) {
      if (other !== slug) {
        result.links.push({ href: other, label: PROJECT_PAGES[other].name });
      }
    });
    result.links = uniqueLinks(result.links).slice(0, 8);
    return result;
  }

  function uniqueLinks(list) {
    var seen = {};
    return list.filter(function (item) {
      if (!item || !item.href || seen[item.href]) return false;
      seen[item.href] = true;
      return true;
    });
  }

  function getRelated(slug) {
    var aliases = {
      "custom-homes.html": "custom-home-building.html",
      "whole-home-remodeling.html": "house-remodeling.html",
      "decks-carpentry.html": "our-services/deck-builders.html"
    };
    slug = aliases[slug] || slug;

    if (PROJECT_PAGES[slug]) {
      return getProjectRelated(slug);
    }

    var result = { title: "", intro: "", links: [] };

    if (CITY_HUBS[slug]) {
      var hub = CITY_HUBS[slug];
      result.title = "Services in " + hub.name;
      result.intro = "Explore remodeling and construction services for homeowners in " + hub.name + " and nearby communities.";
      result.links = hub.links.slice();
      if (!result.links.length) {
        result.links = SERVICE_HUB_LINKS.slice();
      } else {
        result.links = result.links.concat([
          { href: "custom-home-building.html", label: "Custom Home Building — All Areas" },
          { href: "kitchen-remodeling.html", label: "Kitchen Remodeling — All Areas" },
          { href: "bathroom-remodeling.html", label: "Bathroom Remodeling — All Areas" }
        ]);
      }
      result.links = result.links.concat(otherCityHubLinks(slug));
      result.links.push({ href: "contact-us.html", label: "Request a Consultation" });
      result.links = uniqueLinks(result.links).slice(0, 10);
      return result;
    }

    if (SERVICE_MAIN[slug]) {
      var svc = SERVICE_MAIN[slug];
      result.title = svc.name + " Near You";
      result.intro = "4C Construction serves homeowners throughout the Omaha Metro. Browse local " + svc.name.toLowerCase() + " pages for your area.";
      result.links = svc.local.map(function (l) {
        return { href: l.href, label: svc.name + " — " + l.label };
      });
      result.links = result.links.concat(CITY_HUB_SLUGS);
      result.links = result.links.concat(otherServiceLinks(slug).slice(0, 4));
      result.links.push({ href: "contact-us.html", label: "Request a Consultation" });
      result.links = uniqueLinks(result.links).slice(0, 12);
      return result;
    }

    if (LOCAL_PAGES[slug]) {
      var loc = LOCAL_PAGES[slug];
      result.title = "Related Pages";
      result.intro = "Learn more about " + loc.serviceName.toLowerCase() + " and other services we offer in the Omaha Metro.";
      result.links = [
        { href: loc.service, label: loc.serviceName + " — All Service Areas" },
        { href: loc.hub, label: "Contractor — " + loc.city },
        { href: "index.html", label: "4C Construction Home" }
      ];
      var svcDef = SERVICE_MAIN[loc.service];
      if (svcDef) {
        svcDef.local.forEach(function (l) {
          if (l.href !== slug) {
            result.links.push({ href: l.href, label: loc.serviceName + " — " + l.label });
          }
        });
      }
      var hubDef = CITY_HUBS[loc.hub];
      if (hubDef) {
        hubDef.links.forEach(function (l) {
          if (l.href !== slug) {
            result.links.push(l);
          }
        });
      }
      result.links = uniqueLinks(result.links).slice(0, 10);
      return result;
    }

    return null;
  }

  global.SEO_LINKS = {
    getRelated: getRelated
  };
})(window);
