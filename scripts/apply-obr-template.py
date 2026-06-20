#!/usr/bin/env python3
"""Apply Omaha Bath Remodel-style inner page layout to all sub-pages."""

import html
import os
import re
import sys

MINIMAL_PAGES = {
    "about-us.html",
    "about.html",
    "contact-us.html",
    "contact.html",
    "reviews.html",
    "portfolio.html",
    "gallery.html",
    "blog.html",
    "privacy-policy.html",
    "selecting-a-contractor.html",
    "media-room.html",
    "ultimate-guide-kitchen-ideas.html",
    "role-custom-home-builders.html",
}

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

PROCESS_HTML = """\
    <section class="section section--gray ip-process">
      <div class="container">
        <h2 class="section-title">Our Remodeling Process</h2>
        <p class="section-sub">A clear and organized process helps ensure every project runs smoothly from start to finish.</p>
        <ol class="process-row">
          <li><span class="process-row__num">1</span><h3>Free In-Home Consultation</h3><p>Discuss your goals, timeline, budget, and vision.</p></li>
          <li><span class="process-row__num">2</span><h3>Detailed Proposal &amp; Scope</h3><p>Finalize selections, specifications, and project scope.</p></li>
          <li><span class="process-row__num">3</span><h3>Preconstruction Planning</h3><p>Material selections, scheduling, and permit coordination.</p></li>
          <li><span class="process-row__num">4</span><h3>Professional Installation</h3><p>Quality craftsmanship with clean job sites and clear communication.</p></li>
          <li><span class="process-row__num">5</span><h3>Final Walkthrough</h3><p>Ensure every detail meets your expectations.</p></li>
        </ol>
      </div>
    </section>"""

HIGHLIGHTS = {
    "bathroom": (
        "Certified Aging-in-Place Specialist (CAPS)",
        "4C Construction is a <strong>Certified Aging-in-Place Specialist (CAPS)</strong> through the National Association of Home Builders. "
        "This certification focuses on designing and remodeling bathrooms that improve safety, accessibility, and long-term comfort. "
        "Many homeowners choose bathroom remodeling as part of planning to age in place — with walk-in showers, low-threshold entries, "
        "and accessibility features that make bathrooms safer and easier to use while maintaining a clean, modern design.",
    ),
    "default": (
        "Quality You Can See in the Details",
        "We are a locally owned general contractor with over 30 years of experience across the Omaha Metro. "
        "Proper planning, quality materials, and skilled installation are not marketing phrases for us — "
        "they are how every project is run.",
    ),
}

BENEFITS = {
    "bathroom": [
        ("Improved Accessibility", "Walk-in and low-threshold shower entries make stepping in and out safer and easier."),
        ("Enhanced Safety", "Slip-resistant bases, properly anchored grab bars, and thoughtful layouts help reduce fall risks."),
        ("Added Comfort", "Built-in benches, handheld showerheads, and customizable features improve everyday convenience."),
        ("Modern Appearance", "A clean, updated bathroom design can instantly refresh the look of your home."),
        ("Better Use of Space", "Showers and updated layouts often create a more open, functional bathroom."),
    ],
    "kitchen": [
        ("Better Workflow", "Improved layouts make cooking, prep, and cleanup more efficient every day."),
        ("Increased Storage", "Custom cabinetry and islands maximize usable space for your household."),
        ("Updated Style", "New finishes, lighting, and surfaces refresh the heart of your home."),
        ("Higher Home Value", "Quality kitchen upgrades are among the most impactful remodeling investments."),
        ("Coordinated Trades", "One team manages plumbing, electrical, flooring, and cabinetry for a smoother remodel."),
    ],
    "basement": [
        ("More Living Space", "Turn unused square footage into family rooms, bedrooms, or offices."),
        ("Increased Home Value", "Finished basements add functional space buyers appreciate."),
        ("Flexible Layouts", "Design for entertainment, guests, work-from-home, or everyday family life."),
        ("Code-Compliant Builds", "Proper egress, framing, and mechanical planning done right."),
        ("Single-Team Coordination", "Framing, electrical, plumbing, and finishes managed under one contractor."),
    ],
    "custom-homes": [
        ("Personalized Design", "Build a home tailored to your family, lot, and lifestyle."),
        ("Owner-Led Management", "Bojan Ninkovic stays involved from consultation through final walkthrough."),
        ("Quality Construction", "Modern methods and documented specifications before breaking ground."),
        ("Transparent Process", "Clear communication on budget, timeline, and selections throughout the build."),
        ("Lasting Value", "Homes built with craftsmanship and attention to detail that stand the test of time."),
    ],
    "remodeling": [
        ("Updated Living Spaces", "Transform outdated rooms into comfortable, modern areas your family will love."),
        ("Improved Function", "Open layouts, better storage, and smarter floor plans for how you live today."),
        ("Coordinated Upgrades", "Kitchen, bath, flooring, and structural work managed as one project."),
        ("Increased Home Value", "Quality remodeling improves daily comfort and long-term resale appeal."),
        ("Trusted Experience", "30+ years of remodeling expertise across the Omaha Metro."),
    ],
    "decks": [
        ("Expanded Outdoor Living", "Custom decks and pergolas extend your usable space outdoors."),
        ("Durable Construction", "Built for Nebraska weather with quality materials and solid structure."),
        ("Low-Maintenance Options", "Composite decking and quality finishes reduce long-term upkeep."),
        ("Custom Design", "Layouts, railings, and details tailored to your home and lifestyle."),
        ("Professional Finish", "Clean installation and craftsmanship you can enjoy for years."),
    ],
    "default": [
        ("Trusted Experience", "Over 30 years serving homeowners throughout the Omaha Metro."),
        ("Licensed & Insured", "Fully licensed, insured, and bonded for your peace of mind."),
        ("Quality Craftsmanship", "Professional installation and attention to detail on every project."),
        ("Clear Communication", "Customer, Cost, Communication & Courtesy — our core values on every job."),
        ("Local & Reliable", "Locally owned and operated with a 5.0 Google rating."),
    ],
}

SERVICE_KEY_MAP = {
    "bathroom": "bathroom",
    "kitchen": "kitchen",
    "basement": "basement",
    "custom-homes": "custom-homes",
    "custom-home": "custom-homes",
    "whole-home": "remodeling",
    "house-remodeling": "remodeling",
    "remodeling": "remodeling",
    "decks": "decks",
    "deck": "decks",
}


def rel_prefix(filepath):
    depth = filepath.replace("\\", "/").count("/")
    return "../" * depth if depth else ""


def parse_body_attrs(content):
    m = re.search(r"<body([^>]*)>", content, re.I)
    if not m:
        return {}
    attrs = {}
    for key in ("page", "nav", "title", "subtitle", "service", "kicker"):
        am = re.search(rf'data-{key}="([^"]*)"', m.group(1))
        if am:
            attrs[key] = html.unescape(am.group(1))
    return attrs


def parse_head(content):
    title = re.search(r"<title>([^<]+)</title>", content, re.I)
    meta = re.search(r'name="description"\s+content="([^"]*)"', content, re.I)
    return (
        html.unescape(title.group(1)) if title else "4C Construction",
        html.unescape(meta.group(1)) if meta else "",
    )


def parse_intro_paragraphs(main_html):
    """Extract intro copy only — not feature cards or FAQ answers."""
    paras = []
    for sel in (
        r'class="story-block"[^>]*>(.*?)</div>',
        r'class="two-col"[^>]*>(.*?)</div>\s*</div>',
        r'class="ip-intro__body"[^>]*>(.*?)</div>',
    ):
        m = re.search(sel, main_html, re.I | re.S)
        if m:
            block = m.group(1)
            for p in re.findall(r"<p[^>]*>(.*?)</p>", block, re.I | re.S):
                t = re.sub(r"<[^>]+>", "", p)
                t = html.unescape(re.sub(r"\s+", " ", t).strip())
                if len(t) > 35:
                    paras.append(t)
            if paras:
                return paras[:2] if "ip-intro__body" in sel else paras[:4]
    if not paras:
        m = re.search(r"<main[^>]*>\s*<section[^>]*>.*?<div class=\"container\">(.*?)</section>", main_html, re.I | re.S)
        if m:
            block = m.group(1)
            if "feature-grid" not in block and "faq-list" not in block:
                for p in re.findall(r"<p[^>]*>(.*?)</p>", block, re.I | re.S):
                    t = re.sub(r"<[^>]+>", "", p)
                    t = html.unescape(re.sub(r"\s+", " ", t).strip())
                    if len(t) > 35 and "section-sub" not in p:
                        paras.append(t)
    seen = set()
    out = []
    for p in paras:
        if p not in seen:
            seen.add(p)
            out.append(p)
    return out[:4]


def parse_paragraphs(main_html):
    return parse_intro_paragraphs(main_html)


def parse_feature_cards(main_html):
    cards = []
    for m in re.finditer(
        r'<article class="feature-card"><h3>(.*?)</h3><p>(.*?)</p></article>',
        main_html,
        re.I | re.S,
    ):
        cards.append(
            (
                html.unescape(re.sub(r"<[^>]+>", "", m.group(1)).strip()),
                html.unescape(re.sub(r"<[^>]+>", "", m.group(2)).strip()),
            )
        )
    return cards


def parse_gallery(main_html):
    items = re.findall(
        r'(<a href="[^"]*" class="portfolio-item">.*?</a>)',
        main_html,
        re.I | re.S,
    )
    return items[:6]


def parse_faqs(main_html):
    faqs = []
    for m in re.finditer(
        r'<div class="faq-item"><button class="faq-item__q"[^>]*>(.*?)</button><div class="faq-item__a"><p>(.*?)</p></div></div>',
        main_html,
        re.I | re.S,
    ):
        faqs.append(
            (
                html.unescape(re.sub(r"<[^>]+>", "", m.group(1)).strip()),
                html.unescape(re.sub(r"<[^>]+>", "", m.group(2)).strip()),
            )
        )
    return faqs


def service_key(attrs, filename):
    svc = attrs.get("service", "")
    if svc in SERVICE_KEY_MAP:
        return SERVICE_KEY_MAP[svc]
    name = filename.lower()
    for token, key in SERVICE_KEY_MAP.items():
        if token in name:
            return key
    if "bathroom" in name or "bath" in name:
        return "bathroom"
    if "kitchen" in name:
        return "kitchen"
    if "basement" in name:
        return "basement"
    if "deck" in name:
        return "decks"
    if "custom-home" in name or "custom-home" in name:
        return "custom-homes"
    if "remodel" in name or "renovation" in name:
        return "remodeling"
    return "default"


def kicker_from_title(title):
    t = re.sub(r"\s*[|\u2013-]\s*4C Construction.*", "", title, flags=re.I).strip()
    return t.upper() if t else "4C CONSTRUCTION"


def intro_paragraphs(attrs, paras, filename):
    if paras:
        return paras
    subtitle = attrs.get("subtitle", "")
    title = attrs.get("title", "")
    city_match = re.search(r"(Omaha|Bellevue|Papillion|La Vista|Gretna|Elkhorn|Bennington)", title, re.I)
    city = city_match.group(1) if city_match else "Omaha"
    svc = service_key(attrs, filename)
    if city_match:
        return [
            f"4C Construction provides professional {title.lower().replace(city.lower(), '').strip()} services for homeowners in {city} and surrounding communities.",
            f"As a locally owned, licensed, insured, and bonded contractor with over 30 years of experience, we deliver quality workmanship, clear communication, and results built to last.",
        ]
    return [
        subtitle or f"4C Construction specializes in {title.lower()} for homeowners throughout the Omaha Metro.",
        "Request a free consultation to discuss your project goals, timeline, and budget with our experienced team.",
    ]


def benefits_html(key):
    items = BENEFITS.get(key, BENEFITS["default"])
    lis = "".join(f"<li><strong>{html.escape(t)}</strong> &ndash; {html.escape(b)}</li>" for t, b in items)
    label = {
        "bathroom": "Benefits of Bathroom Remodeling",
        "kitchen": "Benefits of Kitchen Remodeling",
        "basement": "Benefits of Basement Finishing",
        "custom-homes": "Benefits of Building a Custom Home",
        "remodeling": "Benefits of Whole Home Remodeling",
        "decks": "Benefits of a Custom Deck",
    }.get(key, "Why Homeowners Choose 4C Construction")
    return f"""\
    <section class="section section--white ip-benefits">
      <div class="container">
        <h2 class="section-title">{html.escape(label)}</h2>
        <ul class="ip-benefits__list">{lis}</ul>
      </div>
    </section>"""


def highlight_html(key):
    title, body = HIGHLIGHTS.get(key, HIGHLIGHTS["default"])
    return f"""\
    <section class="section section--gray ip-highlight">
      <div class="container">
        <h2>{html.escape(title)}</h2>
        <p>{body}</p>
      </div>
    </section>"""


def build_main(attrs, main_html, filename, prefix):
    paras = parse_paragraphs(main_html)
    cards = parse_feature_cards(main_html)
    gallery = parse_gallery(main_html)
    faqs = parse_faqs(main_html)
    key = service_key(attrs, filename)
    kicker = attrs.get("kicker") or kicker_from_title(attrs.get("title", ""))
    intro = intro_paragraphs(attrs, paras, filename)
    contact = f"{prefix}contact-us.html"

    intro_body = "".join(f"<p>{html.escape(p)}</p>" for p in intro)
    parts = [
        '  <main class="inner-page">\n',
        """\
    <section class="section section--white ip-intro">
      <div class="container">
        <p class="ip-kicker">""" + html.escape(kicker) + """</p>
        <div class="ip-intro__body">"""
        + intro_body
        + """</div>
        <p class="ip-intro__cta"><a href="#request-service" class="btn btn--primary"><span class="btn__icon" aria-hidden="true">&#9733;</span> Request Your Free Consultation</a></p>
      </div>
    </section>\n""",
    ]

    minimal = os.path.basename(filename) in MINIMAL_PAGES

    if not minimal:
        parts.extend([
            highlight_html(key if key in HIGHLIGHTS else "default"),
            benefits_html(key),
            PROCESS_HTML,
        ])

    if cards:
        cards_html = "".join(
            f'<article class="feature-card"><h3>{html.escape(t)}</h3><p>{html.escape(b)}</p></article>'
            for t, b in cards
        )
        svc_title = "Our Services"
        for m in re.finditer(
            r'<section class="section[^"]*">\s*<div class="container">\s*<h2 class="section-title">([^<]+)</h2>\s*<div class="feature-grid">',
            main_html,
            re.I | re.S,
        ):
            svc_title = m.group(1).strip()
        parts.append(f"""\
    <section class="section section--white ip-services">
      <div class="container">
        <h2 class="section-title">{html.escape(svc_title)}</h2>
        <div class="feature-grid">{cards_html}</div>
      </div>
    </section>\n""")

    # Preserve unique middle sections (about, contact, reviews, etc.)
    preserve_markers = (
        "about-page-grid",
        "story-block",
        "badge-row",
        "reviews-grid",
        "contact-page",
        "contact-grid",
        "site-map-grid",
        "portfolio-grid-full",
    )
    for section in re.findall(
        r'(<section class="section section--[^"]+">.*?</section>)',
        main_html,
        re.I | re.S,
    ):
        if "section-cta-block" in section or "ip-intro" in section or "ip-consult" in section:
            continue
        if "feature-grid" in section or "portfolio-grid" in section or "faq-list" in section:
            continue
        if any(marker in section for marker in preserve_markers):
            parts.append("\n    " + section.strip() + "\n")

    if gallery:
        gal = "\n".join("        " + g for g in gallery)
        parts.append(f"""\
    <section class="section section--gray ip-gallery">
      <div class="container">
        <h2 class="section-title">Project Gallery</h2>
        <div class="portfolio-grid">
{gal}
        </div>
        <div class="section-cta"><a href="{prefix}gallery.html" class="btn btn--primary"><span class="btn__icon" aria-hidden="true">&#9733;</span> View Our Portfolio</a></div>
      </div>
    </section>\n""")

    if faqs:
        faq_html = "".join(
            f'<div class="faq-item"><button class="faq-item__q" aria-expanded="false">{html.escape(q)}</button>'
            f'<div class="faq-item__a"><p>{html.escape(a)}</p></div></div>'
            for q, a in faqs
        )
        parts.append(f"""\
    <section class="section section--white ip-faq">
      <div class="container">
        <h2 class="section-title">Frequently Asked Questions</h2>
        <div class="faq-list">{faq_html}</div>
      </div>
    </section>\n""")

    title = attrs.get("title", "your project")
    consult_lead = {
        "Contact Us": "Ready to start your project?",
        "Customer Reviews": "Ready to experience the same quality service?",
        "Project Portfolio": "Ready to start a project like these?",
        "About 4C Construction": "Ready to work with our team?",
    }.get(title, f"Ready to get started with {title}?")
    parts.append(f"""\
    <section class="section section--gray ip-consult">
      <div class="container">
        <h2>Schedule Your In-Home Consultation</h2>
        <p>{html.escape(consult_lead)} 4C Construction specializes in custom home building, remodeling, basement finishing, kitchen and bathroom renovations, and deck construction throughout the Omaha Metro. Let&rsquo;s discuss your project and provide a clear, detailed quote.</p>
        <a href="{contact}" class="btn btn--primary"><span class="btn__icon" aria-hidden="true">&#9733;</span> Request Your Free Consultation</a>
        <a href="tel:+14026161814" class="btn btn--dark-outline">(402) 616-1814</a>
      </div>
    </section>
  </main>
""")
    if not minimal:
        parts.append('  <div id="page-end"></div>\n')

    return "".join(parts)


def hero_type_for(filename, attrs):
    if os.path.basename(filename) in MINIMAL_PAGES:
        return "simple"
    return "service"


def ensure_page_end(filepath, content):
    """Add page-end mount and data-kicker without rebuilding main content."""
    if 'id="page-end"' in content:
        return content, False
    content = content.replace(
        '<div id="site-bottom"></div>',
        '<div id="page-end"></div>\n  <div id="site-bottom"></div>',
    )
    if 'class="inner-page"' not in content and "<main>" in content:
        content = content.replace("<main>", '<main class="inner-page">')
    attrs = parse_body_attrs(content)
    if attrs.get("title") and "data-kicker" not in content:
        kicker = attrs.get("kicker") or kicker_from_title(attrs.get("title", ""))
        content = re.sub(
            r"<body([^>]*)>",
            lambda m: f'<body{m.group(1)} data-kicker="{html.escape(kicker)}"'.rstrip('"') + ">",
            content,
            count=1,
            flags=re.I,
        )
    return content, True


def rebuild_page(filepath):
    with open(filepath, encoding="utf-8") as f:
        content = f.read()

    if 'data-page="home"' in content or "data-page='home'" in content:
        return False

    if os.path.basename(filepath) in MINIMAL_PAGES:
        updated, changed = ensure_page_end(filepath, content)
        if changed:
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(updated)
        return changed

    prefix = rel_prefix(os.path.relpath(filepath, BASE))
    attrs = parse_body_attrs(content)
    title, meta = parse_head(content)

    main_m = re.search(r"<main[^>]*>(.*?)</main>", content, re.I | re.S)
    main_html = main_m.group(1) if main_m else ""

    kicker = attrs.get("kicker") or kicker_from_title(attrs.get("title") or title)
    body_attrs = (
        f'data-page="inner" data-hero="{hero_type_for(filename, attrs)}" '
        f'data-nav="{html.escape(attrs.get("nav", ""))}" '
        f'data-title="{html.escape(attrs.get("title") or title)}" '
        f'data-kicker="{html.escape(kicker)}" '
    )
    if attrs.get("subtitle"):
        body_attrs += f'data-subtitle="{html.escape(attrs["subtitle"])}" '
    if attrs.get("service"):
        body_attrs += f'data-service="{html.escape(attrs["service"])}" '

    css = f"{prefix}css/styles.css"
    js = f"{prefix}js/"
    new_main = build_main(attrs, main_html, os.path.basename(filepath), prefix)

    page = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <meta name="description" content="{html.escape(meta)}">
  <title>{html.escape(title)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700&family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="{css}">
</head>
<body {body_attrs.strip()}>
  <div id="site-top"></div>
{new_main}  <div id="site-bottom"></div>
  <script src="{js}config.js"></script>
  <script src="{js}layout.js"></script>
  <script src="{js}main.js"></script>
</body>
</html>
"""

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(page)
    return True


def main():
    updated = 0
    for root, _dirs, files in os.walk(BASE):
        if "node_modules" in root or ".git" in root:
            continue
        for name in files:
            if not name.endswith(".html"):
                continue
            path = os.path.join(root, name)
            if rebuild_page(path):
                updated += 1
                print("Updated:", os.path.relpath(path, BASE))
    print(f"\nDone. Updated {updated} pages.")


if __name__ == "__main__":
    main()
