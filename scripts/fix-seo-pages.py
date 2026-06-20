#!/usr/bin/env python3
"""Replace scraped/robotic feature grids and intro copy on SEO landing pages."""

import html
import os
import re
from typing import List, Optional, Tuple

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

FEATURE_GRIDS = {
    "kitchen": [
        ("Kitchen Design", "Layouts optimized for cooking, entertaining, and daily family use."),
        ("Custom Cabinetry", "Quality cabinets tailored to your storage needs and design style."),
        ("Countertops", "Quartz, granite, and other durable surfaces professionally installed."),
        ("Kitchen Islands", "Added prep space, seating, and storage with proper electrical planning."),
    ],
    "bathroom": [
        ("Walk-In Showers", "Curbless and low-threshold showers with quality waterproofing."),
        ("Onyx Shower Systems", "Durable, low-maintenance shower panel systems with a seamless finished look."),
        ("Custom Tile Showers", "Precision tile work with niches, benches, and custom patterns."),
        ("Accessibility & Aging-in-Place", "Grab bars, wider doorways, comfort-height fixtures, and safer layouts."),
    ],
    "basement": [
        ("Basement Design & Planning", "Layouts that maximize usable space and natural light."),
        ("Family Rooms", "Comfortable gathering spaces with proper electrical and HVAC planning."),
        ("Additional Bedrooms", "Guest rooms and kids' rooms with egress-compliant windows."),
        ("Entertainment Spaces", "Media rooms, bars, and recreation areas built for your lifestyle."),
    ],
    "custom-homes": [
        ("Design-Build Approach", "One team manages planning, design coordination, and construction for a smoother build process."),
        ("Construction Loan Guidance", "We help you understand the construction loan process and coordinate draw schedules with your lender."),
        ("Build Specifications", "Detailed specs for framing, mechanical systems, finishes, and fixtures — documented before we break ground."),
        ("Energy Efficiency & Quality Standards", "Modern building methods and quality materials that improve comfort and long-term performance."),
    ],
    "decks": [
        ("Composite Decks", "Low-maintenance decking with clean, modern lines."),
        ("Wood Decks", "Traditional cedar and treated lumber decks built to last."),
        ("Covered Decks & Pergolas", "Roof structures and shade features that extend seasonal usability."),
        ("Railings & Outdoor Living", "Code-compliant rail systems and complete backyard upgrades for entertaining."),
    ],
    "whole-home": [
        ("Open Concept Transformations", "Remove walls, improve flow, and create connected living spaces that fit modern lifestyles."),
        ("Structural Modifications", "Safe framing changes, beam installations, and layout updates executed to code."),
        ("Interior Remodeling", "Coordinated updates across multiple rooms for a cohesive finished result."),
        ("Flooring & Finish Upgrades", "Hardwood, tile, trim, paint, and detail work that elevates the entire home."),
    ],
    "city-remodeling": [
        ("Whole Home Remodeling", "Coordinated renovations that improve how your entire home functions and feels."),
        ("Kitchen Remodeling", "Custom cabinetry, islands, countertops, and layouts designed for daily life."),
        ("Bathroom Remodeling", "Walk-in showers, tile work, vanities, and accessible bathroom designs."),
        ("Basement Finishing", "Family rooms, bedrooms, bathrooms, and entertainment spaces below grade."),
    ],
    "city-custom": [
        ("Custom Home Building", "Design and build a home tailored to your family, lot, and lifestyle."),
        ("Whole Home Remodeling", "Coordinated renovations that improve how your entire home functions and feels."),
        ("Kitchen Remodeling", "Custom cabinetry, islands, countertops, and layouts designed for daily life."),
        ("Bathroom Remodeling", "Walk-in showers, tile work, vanities, and accessible bathroom designs."),
    ],
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

SERVICE_LABELS = {
    "kitchen": "kitchen remodeling",
    "bathroom": "bathroom remodeling",
    "basement": "basement finishing",
    "custom-homes": "custom home building",
    "whole-home": "whole-home remodeling",
    "decks": "deck construction",
}

BAD_INTRO_MARKERS = (
    "Email Us",
    "Suggested text:",
    "CUSTOMER, COST, COMMUNICATION",
    "Comprehensive and Creative Comprehensive",
)

SKIP_FILES = {
    "privacy-policy.html",
    "index.html",
    "about-us.html",
    "about.html",
    "contact-us.html",
    "contact.html",
    "reviews.html",
    "gallery.html",
    "portfolio.html",
    "blog.html",
    "selecting-a-contractor.html",
    "role-custom-home-builders.html",
    "ultimate-guide-kitchen-ideas.html",
    "media-room.html",
}


def city_from_slug(slug: str) -> Optional[str]:
    slug = slug.lower().replace(".html", "")
    for key, name in CITY_MAP.items():
        if key in slug:
            return name
    return None


def is_city_hub(slug: str) -> bool:
    slug = slug.lower()
    if any(x in slug for x in ("kitchen", "bathroom", "basement", "deck", "custom-home", "house-renovation")):
        return False
    return slug.endswith("-remodeling-contractor.html") or slug in (
        "omaha-remodeling-contractor.html",
        "bellevue-remodeling-contractor.html",
        "papillion-remodeling-contractor.html",
        "la-vista-remodeling-contractor.html",
        "gretna-remodeling-contractor.html",
        "elkhorn-remodeling-contractor.html",
        "bennington-remodeling-contractor.html",
    )


def service_from_slug(slug: str, data_service: str) -> str:
    if is_city_hub(slug):
        return "city-remodeling" if data_service != "custom-homes" else "city-custom"
    if data_service == "whole-home":
        return "whole-home"
    if data_service:
        return data_service
    slug_lower = slug.lower()
    if "kitchen" in slug_lower:
        return "kitchen"
    if "bathroom" in slug_lower or "bath" in slug_lower:
        return "bathroom"
    if "basement" in slug_lower:
        return "basement"
    if "deck" in slug_lower:
        return "decks"
    if "custom-home" in slug_lower:
        return "custom-homes"
    if "remodel" in slug_lower or "renovation" in slug_lower:
        return "whole-home"
    return "city-remodeling"


def cards_are_bad(content: str) -> bool:
    for m in re.finditer(
        r'<article class="feature-card"><h3>(.*?)</h3><p>(.*?)</p></article>',
        content,
        re.I | re.S,
    ):
        body = re.sub(r"<[^>]+>", "", m.group(2))
        if len(body) > 180 or any(x in body for x in ("Comprehensive and Creative", "Transform Transform", " remodel ", "Suggested text")):
            return True
    return False


def build_feature_grid(cards: List[Tuple[str, str]]) -> str:
    items = "".join(
        f'<article class="feature-card"><h3>{html.escape(t)}</h3><p>{html.escape(b)}</p></article>'
        for t, b in cards
    )
    return f'<div class="feature-grid">{items}</div>'


def intro_is_bad(intro_html: str) -> bool:
    text = re.sub(r"<[^>]+>", " ", intro_html)
    return any(marker in text for marker in BAD_INTRO_MARKERS) or len(text.strip()) < 80


def build_intro(service: str, city: Optional[str], title: str) -> str:
    label = SERVICE_LABELS.get(service, "remodeling and construction")
    if city:
        if service in SERVICE_LABELS:
            return (
                f"<p>4C Construction provides professional {label} for homeowners in {city} and surrounding "
                f"communities. Owner Bojan Ninkovic stays involved from consultation through completion — with clear "
                f"communication, detailed proposals, and craftsmanship built to last.</p>"
                f"<p>Whether you are planning a single-room update or a larger renovation, we help you understand "
                f"scope, timeline, and budget before work begins. Call <a href=\"tel:+14026161814\">(402) 616-1814</a> "
                f"or request service online for a free consultation.</p>"
            )
        return (
            f"<p>4C Construction serves homeowners in {city} with custom home building, whole-home remodeling, "
            f"kitchen and bathroom updates, basement finishing, and deck construction. As a locally owned contractor "
            f"headquartered in Bellevue, we bring over 30 years of experience to every project.</p>"
            f"<p>Owner Bojan Ninkovic provides hands-on project management and transparent communication from the first "
            f"meeting through final walkthrough. Contact us to discuss your goals and schedule a free in-home consultation.</p>"
        )
    return (
        f"<p>{html.escape(title)} by 4C Construction — licensed, insured, and locally owned with over 30 years serving "
        f"the Omaha Metro. We coordinate trades, materials, and timelines so your project stays organized from start to finish.</p>"
        f"<p>Request a free consultation to discuss your project goals, timeline, and budget with our experienced team.</p>"
    )


def fix_file(path: str) -> bool:
    slug = os.path.basename(path)
    if slug in SKIP_FILES or slug.startswith("project-"):
        return False

    with open(path, encoding="utf-8") as f:
        content = f.read()

    if "feature-grid" not in content and "ip-intro__body" not in content:
        return False

    original = content
    body_m = re.search(r"<body([^>]*)>", content)
    data_service = ""
    page_title = ""
    if body_m:
        sm = re.search(r'data-service="([^"]*)"', body_m.group(1))
        if sm:
            data_service = sm.group(1)
        tm = re.search(r'data-title="([^"]*)"', body_m.group(1))
        if tm:
            page_title = html.unescape(tm.group(1))

    city = city_from_slug(slug)
    service = service_from_slug(slug, data_service)

    if cards_are_bad(content):
        grid = build_feature_grid(FEATURE_GRIDS.get(service, FEATURE_GRIDS["city-remodeling"]))
        content = re.sub(
            r'<div class="feature-grid">.*?</div>\s*(?=</div>\s*</section>)',
            grid,
            content,
            count=1,
            flags=re.DOTALL,
        )

    intro_m = re.search(r'(<div class="ip-intro__body">)(.*?)(</div>)', content, re.I | re.S)
    if intro_m and intro_is_bad(intro_m.group(2)):
        new_intro = build_intro(service if service not in ("city-remodeling", "city-custom") else "whole-home", city, page_title)
        content = content[: intro_m.start(2)] + new_intro + content[intro_m.end(2) :]

    if content != original:
        with open(path, "w", encoding="utf-8") as f:
            f.write(content)
        return True
    return False


def main():
    updated = 0
    for root, _dirs, files in os.walk(BASE):
        if "node_modules" in root or ".git" in root:
            continue
        for name in files:
            if not name.endswith(".html"):
                continue
            path = os.path.join(root, name)
            if fix_file(path):
                updated += 1
                print("updated:", os.path.relpath(path, BASE))
    print(f"Done. {updated} files updated.")


if __name__ == "__main__":
    main()
