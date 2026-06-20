#!/usr/bin/env python3
"""Humanize repetitive SEO copy and add polish across all HTML pages."""

import os
import re
from typing import Optional, Tuple

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

HIGHLIGHTS = {
    "kitchen": (
        "Designed Around How You Cook & Live",
        "A kitchen remodel is only successful when the layout, storage, and finishes fit your household. "
        "Led by owner Bojan Ninkovic, our team coordinates cabinetry, countertops, plumbing, and electrical "
        "under one plan — so your new kitchen works beautifully from the first meal you make in it.",
    ),
    "bathroom": (
        "Certified Aging-in-Place Specialist (CAPS)",
        "4C Construction holds <strong>CAPS certification</strong> through the National Association of Home Builders. "
        "That means we design bathrooms with long-term safety in mind — walk-in showers, grab bars, and accessible "
        "layouts that still look polished and intentional.",
    ),
    "basement": (
        "Turn Unused Space Into Real Square Footage",
        "Basement finishing adds living area without changing your footprint. We handle framing, egress, moisture "
        "considerations, and finish work so your lower level is comfortable, code-compliant, and ready for family "
        "nights, guests, or a quiet home office.",
    ),
    "custom-homes": (
        "Owner-Led From First Meeting to Move-In",
        "Building a custom home is a major investment. Bojan Ninkovic stays personally involved throughout — helping "
        "you navigate lot selection, design decisions, permitting, and construction so your home reflects how your "
        "family actually lives.",
    ),
    "whole-home": (
        "One Team for a Coordinated Renovation",
        "Whole-home remodeling works best when kitchen, bath, flooring, and structural updates are planned together. "
        "We manage trades, timelines, and selections as a single project — not a string of disconnected contractors.",
    ),
    "decks": (
        "Built for Nebraska Weather",
        "Outdoor projects need solid structure and the right materials for our climate. Whether you prefer composite "
        "decking or traditional wood, we build decks and outdoor structures that look great on day one and hold up "
        "season after season.",
    ),
    "city": (
        "Local Contractor, Personal Attention",
        "4C Construction is headquartered in Bellevue and has served the Omaha Metro for over 30 years. We are "
        "licensed, insured, and bonded — and we treat every home as if it were our own, with clear communication "
        "from estimate to final walkthrough.",
    ),
}

CONSULT = {
    "kitchen": (
        "Schedule Your Kitchen Consultation",
        "Tell us how you use your kitchen today and what you want to change. We will walk your space, discuss "
        "options, and provide a clear scope and estimate — with no pressure.",
    ),
    "bathroom": (
        "Schedule Your Bathroom Consultation",
        "Whether you need a full remodel, a tub-to-shower conversion, or an accessible update, we will help you "
        "plan a bathroom that fits your home and your budget.",
    ),
    "basement": (
        "Schedule Your Basement Consultation",
        "Not sure what is possible in your basement? We will evaluate the space, talk through layout ideas, and "
        "outline a realistic path from unfinished to fully livable.",
    ),
    "custom-homes": (
        "Schedule Your Custom Home Consultation",
        "If you are exploring a lot, a floor plan, or a timeline for building, we are happy to sit down and "
        "answer your questions before you commit to anything.",
    ),
    "whole-home": (
        "Schedule Your Remodeling Consultation",
        "Every whole-home project starts with a conversation about priorities — what to tackle first, what can "
        "wait, and what will make the biggest difference in how you live.",
    ),
    "decks": (
        "Schedule Your Deck Consultation",
        "We will review your backyard, discuss size and materials, and help you plan an outdoor space your family "
        "will actually use.",
    ),
}

PROCESS_INTRO = {
    "kitchen": "From first measurement to the last cabinet handle, here is how a typical kitchen remodel with 4C Construction unfolds.",
    "bathroom": "Bathroom projects move quickly when waterproofing, tile, and fixtures are sequenced correctly. Here is our approach.",
    "basement": "Basement finishing involves more than drywall — here is how we guide your project from concept to completion.",
    "custom-homes": "Custom home builds require careful sequencing. Here is how we keep your project organized and on track.",
    "whole-home": "Coordinated remodeling needs a clear plan. Here is what homeowners can expect when working with our team.",
    "decks": "A well-built deck starts with proper footings and framing. Here is our typical project flow.",
    "city": "Every project starts with a conversation and ends with a walkthrough you are proud to show neighbors.",
}

SERVICE_LABELS = {
    "kitchen": "kitchen remodeling",
    "bathroom": "bathroom remodeling",
    "basement": "basement finishing",
    "custom-homes": "custom home building",
    "whole-home": "whole-home remodeling",
    "decks": "deck construction",
}

CITY_MAP = {
    "omaha": "Omaha",
    "bellevue": "Bellevue",
    "papillion": "Papillion",
    "la-vista": "La Vista",
    "gretna": "Gretna",
    "elkhorn": "Elkhorn",
    "bennington": "Bennington",
    "boys-town": "Boys Town",
    "north-omaha": "North Omaha",
    "south-omaha": "South Omaha",
}

GENERIC_HIGHLIGHT = re.compile(
    r"(<section class=\"section section--gray ip-highlight\">\s*"
    r"<div class=\"container\">\s*)"
    r"<h2>.*?</h2>\s*<p>.*?</p>",
    re.DOTALL,
)

GENERIC_CONSULT = re.compile(
    r"(<section class=\"section section--(?:gray|white) ip-consult\">\s*"
    r"<div class=\"container\">\s*)"
    r"<h2>.*?</h2>\s*<p>.*?</p>",
    re.DOTALL,
)

GENERIC_PROCESS = (
    "A clear and organized process helps ensure every project runs smoothly from start to finish."
)


def title_case(s: str) -> str:
    small = {"ne", "and", "in", "for", "the", "a", "of"}
    words = s.lower().split()
    out = []
    for i, w in enumerate(words):
        if i > 0 and w in small:
            out.append(w)
        else:
            out.append(w.capitalize())
    return " ".join(out)


def extract_attr(body: str, name: str) -> str:
    m = re.search(rf'data-{name}="([^"]*)"', body)
    return m.group(1) if m else ""


def city_from_slug(slug: str) -> Optional[str]:
    slug = slug.lower().replace(".html", "")
    for key, name in CITY_MAP.items():
        if key in slug:
            return name
    return None


def is_city_hub(slug: str) -> bool:
    slug = slug.lower()
    if any(x in slug for x in ("kitchen", "bathroom", "basement", "deck", "custom-home", "house-renovation", "whole-home")):
        return False
    return any(
        x in slug
        for x in (
            "remodeling-contractor",
            "remodeling-services",
            "remodeling-company",
            "remodeling-contractors",
            "remodeling-bellevue",
            "remodeling-papillion",
            "remodeling-services",
        )
    )


def service_from_slug(slug: str, data_service: str) -> str:
    if is_city_hub(slug):
        return ""
    if data_service:
        return data_service
    slug_lower = slug.lower()
    if "kitchen" in slug_lower:
        return "kitchen"
    if "bathroom" in slug_lower or "bath" in slug_lower:
        return "bathroom"
    if "basement" in slug_lower:
        return "basement"
    if "deck" in slug_lower or "carpentry" in slug_lower:
        return "decks"
    if "custom-home" in slug_lower or slug_lower in ("custom-homes.html", "custom-home-building.html"):
        return "custom-homes"
    if "remodel" in slug_lower or "renovation" in slug_lower or "whole-home" in slug_lower:
        return "whole-home"
    return ""


def consult_copy(service: str, city: Optional[str], page_title: str) -> Tuple[str, str]:
    if service and service in CONSULT:
        return CONSULT[service]
    if city:
        return (
            f"Schedule Your {city} Consultation",
            f"Homeowners across {city} and the Omaha Metro trust 4C Construction for remodeling and new construction. "
            f"Call <a href=\"tel:+14026161814\">(402) 616-1814</a> or request service online — we respond promptly and "
            f"keep the process straightforward.",
        )
    return (
        "Schedule Your In-Home Consultation",
        "Call <a href=\"tel:+14026161814\">(402) 616-1814</a> or request service online. We respond promptly and "
        "keep the process straightforward.",
    )


def highlight_copy(service: str, city: Optional[str]) -> Tuple[str, str]:
    if service == "bathroom":
        return HIGHLIGHTS["bathroom"]
    if service and service in HIGHLIGHTS:
        return HIGHLIGHTS[service]
    if city or not service:
        return HIGHLIGHTS["city"]
    return HIGHLIGHTS["city"]


def meta_description(slug: str, service: str, title: str, city: Optional[str]) -> str:
    if slug in ("index.html",):
        return (
            "4C Construction is a Bellevue-based general contractor serving the Omaha Metro. Custom homes, kitchen and "
            "bath remodels, basement finishing, and decks — licensed, insured, and 30+ years of experience."
        )
    if slug in ("about-us.html", "about.html"):
        return (
            "Meet 4C Construction — owner Bojan Ninkovic and a licensed, insured team with 30+ years serving the Omaha Metro. "
            "NARI, MOBA, and CKBR accredited."
        )
    if slug in ("contact-us.html", "contact.html"):
        return (
            "Contact 4C Construction in Bellevue, NE. Call (402) 616-1814 or request a free in-home consultation for "
            "remodeling and custom home projects across the Omaha Metro."
        )
    if slug in ("reviews.html",):
        return "Read Google reviews for 4C Construction — a 5.0-rated remodeling and custom home contractor serving Omaha, Bellevue, and Papillion."
    if slug in ("gallery.html", "portfolio.html"):
        return "Browse kitchen, bathroom, basement, and custom home projects by 4C Construction across the Omaha Metro."

    label = SERVICE_LABELS.get(service, "")
    if city and label:
        return (
            f"{title} by 4C Construction — {label} in {city}, NE with owner-led oversight, clear estimates, and "
            f"30+ years serving the Omaha Metro."
        )
    if city:
        return (
            f"Remodeling contractor in {city}, NE. 4C Construction offers custom homes, kitchen and bath remodels, "
            f"basement finishing, and decks. Licensed, insured, locally owned."
        )
    if label:
        return (
            f"{title} by 4C Construction in the Omaha Metro — {label} with coordinated trades, quality materials, "
            f"and clear communication from consultation to final walkthrough."
        )
    if title:
        return f"{title} — 4C Construction, a licensed general contractor serving Omaha, Bellevue, Papillion, and surrounding communities."
    return "4C Construction — custom homes and remodeling contractor serving the Omaha Metro. Licensed, insured, 30+ years."


def script_prefix(content: str) -> str:
    if "../css/styles.css" in content or '../css/styles.css' in content:
        return "../js/"
    return "js/"


def polish_file(path: str) -> bool:
    with open(path, encoding="utf-8") as f:
        content = f.read()
    original = content
    slug = os.path.basename(path)
    body_m = re.search(r"<body[^>]*>", content)
    if not body_m:
        return False
    body_tag = body_m.group(0)
    data_service = extract_attr(body_tag, "service")
    page_title = extract_attr(body_tag, "title")
    city = city_from_slug(slug)
    service = service_from_slug(slug, data_service)
    hl_title, hl_body = highlight_copy(service, city)
    c_title, c_body = consult_copy(service, city, page_title)

    # Highlight + consult blocks (idempotent replace)
    if "ip-highlight" in content:
        content = GENERIC_HIGHLIGHT.sub(
            rf"\1<h2>{hl_title}</h2>\n        <p>{hl_body}</p>",
            content,
            count=1,
        )
    if "ip-consult" in content:
        content = GENERIC_CONSULT.sub(
            rf"\1<h2>{c_title}</h2>\n        <p>{c_body}</p>",
            content,
            count=1,
        )

    # Process intro
    proc_key = service or ("city" if city else "")
    proc_intro = PROCESS_INTRO.get(proc_key, PROCESS_INTRO["city"])
    content = re.sub(
        r'(<section class="section section--gray ip-process">\s*<div class="container">\s*'
        r'<h2 class="section-title">Our Remodeling Process</h2>\s*'
        r'<p class="section-sub">)(.*?)(</p>)',
        rf"\1{proc_intro}\3",
        content,
        count=1,
        flags=re.DOTALL,
    )

    # Title-case kickers
    if 'class="ip-kicker"' in content:
        content = re.sub(
            r'(<p class="ip-kicker">)([^<]+)(</p>)',
            lambda m: m.group(1) + title_case(m.group(2).strip()) + m.group(3),
            content,
        )
    content = re.sub(
        r'(data-kicker=")([^"]+)(")',
        lambda m: m.group(1) + title_case(m.group(2).strip()) + m.group(3),
        content,
    )

    # Meta description
    desc = meta_description(slug, service, page_title, city)
    if re.search(r'<meta name="description"', content):
        content = re.sub(
            r'<meta name="description" content="[^"]*">',
            f'<meta name="description" content="{desc}">',
            content,
        )
    else:
        content = content.replace(
            '<meta name="viewport"',
            f'<meta name="description" content="{desc}">\n  <meta name="viewport"',
        )

    # Canonical (skip home, contact alias)
    prefix = script_prefix(content)
    canonical = f"https://4c-omaha.com/{slug}" if prefix == "js/" else f"https://4c-omaha.com/our-services/{slug}"
    if slug == "portfolio.html":
        canonical = "https://4c-omaha.com/gallery.html"
    if slug not in ("index.html", "contact.html") and 'rel="canonical"' not in content:
        content = content.replace(
            "<title>",
            f'<link rel="canonical" href="{canonical}">\n  <title>',
        )

    # contact.html -> contact-us.html
    content = content.replace('href="contact.html"', 'href="contact-us.html"')

    # Add page-copy.js before layout.js
    sp = script_prefix(content)
    if f'{sp}page-copy.js' not in content:
        content = content.replace(
            f'<script src="{sp}layout.js"></script>',
            f'<script src="{sp}page-copy.js"></script>\n  <script src="{sp}layout.js"></script>',
        )

    if content != original:
        with open(path, "w", encoding="utf-8") as f:
            f.write(content)
        return True
    return False


def main():
    updated = 0
    for root, _dirs, files in os.walk(BASE):
        for name in files:
            if not name.endswith(".html"):
                continue
            path = os.path.join(root, name)
            if polish_file(path):
                updated += 1
                print("updated:", os.path.relpath(path, BASE))
    print(f"Done. {updated} files updated.")


if __name__ == "__main__":
    main()
