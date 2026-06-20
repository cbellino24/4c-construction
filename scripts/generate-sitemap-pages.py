#!/usr/bin/env python3
"""Generate local HTML pages matching 4c-omaha.com sitemap URLs."""

import html
import os
import re
import urllib.request
from xml.etree import ElementTree

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LIVE = "https://4c-omaha.com"

SKIP_SLUGS = {
    "home", "custom-home-building-old", "bathroom-remodeling-old", "xmlrpc.php"
}

ALIASES = {
    "about-us.html": "about.html",
    "contact-us.html": "contact.html",
    "custom-home-building.html": "custom-homes.html",
    "house-remodeling.html": "whole-home-remodeling.html",
    "our-services/deck-builders.html": "decks-carpentry.html",
}

MANUAL_PAGES = {
    "blog.html": "blog",
    "media-room.html": "media-room",
}


def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=20) as resp:
        return resp.read().decode("utf-8", errors="replace")


def text_clean(s):
    s = re.sub(r"\s+", " ", s or "").strip()
    return html.unescape(s)


def scrape_page(url):
    raw = fetch(url)
    title = text_clean(re.search(r"<title>([^<]+)</title>", raw, re.I).group(1)) if re.search(r"<title>", raw, re.I) else ""
    title = re.sub(r"\s*[|\u2013-]\s*4C Construction.*", "", title, flags=re.I).strip()
    meta = ""
    m = re.search(r'name="description"\s+content="([^"]*)"', raw, re.I)
    if m:
        meta = text_clean(m.group(1))
    h1 = ""
    m = re.search(r"<h1[^>]*>(.*?)</h1>", raw, re.I | re.S)
    if m:
        h1 = text_clean(re.sub(r"<[^>]+>", "", m.group(1)))

    paragraphs = []
    for block in re.findall(r"<p[^>]*>(.*?)</p>", raw, re.I | re.S):
        t = text_clean(re.sub(r"<[^>]+>", "", block))
        if len(t) > 40 and "cookie" not in t.lower()[:30]:
            paragraphs.append(t)
    paragraphs = list(dict.fromkeys(paragraphs))[:8]

    h2_blocks = []
    for m in re.finditer(r"<h2[^>]*>(.*?)</h2>(.*?)(?=<h2|<footer|$)", raw, re.I | re.S):
        h2 = text_clean(re.sub(r"<[^>]+>", "", m.group(1)))
        body = text_clean(re.sub(r"<[^>]+>", " ", m.group(2)))
        if h2 and len(body) > 30:
            h2_blocks.append((h2, body[:600]))

    return title, meta, h1, paragraphs, h2_blocks


def body_html_from_scrape(paragraphs, h2_blocks):
    parts = []
    if paragraphs:
        parts.append('<section class="section section--white"><div class="container">')
        parts.append('<div class="two-col">')
        mid = max(1, len(paragraphs) // 2)
        for p in paragraphs[:mid]:
            parts.append(f"<div><p>{html.escape(p)}</p></div>")
        for p in paragraphs[mid:]:
            parts.append(f"<div><p>{html.escape(p)}</p></div>")
        if len(paragraphs) == 1:
            parts.append("<div></div>")
        parts.append("</div></div></section>")

    if h2_blocks:
        parts.append('<section class="section section--gray"><div class="container">')
        parts.append('<div class="feature-grid">')
        for h2, body in h2_blocks[:6]:
            parts.append(f'<article class="feature-card"><h3>{html.escape(h2)}</h3><p>{html.escape(body)}</p></article>')
        parts.append("</div></div></section>")

    if not parts:
        parts.append(
            '<section class="section section--white"><div class="container">'
            '<p>4C Construction is a full-service general contractor serving the Omaha Metro. '
            f'Call <a href="tel:+14026161814">(402) 616-1814</a> or <a href="contact-us.html">contact us</a> for a free consultation.</p>'
            "</div></section>"
        )

    parts.append(
        '<section class="section section--gray"><div class="container section-cta-block">'
        "<h2>Ready to Get Started?</h2>"
        "<p>Schedule your free consultation with 4C Construction today.</p>"
        '<a href="contact-us.html" class="btn btn--primary"><span class="btn__icon" aria-hidden="true">&#9733;</span> Request Service</a>'
        '<a href="tel:+14026161814" class="btn btn--dark-outline">(402) 616-1814</a>'
        "</div></section>"
    )
    return "\n    ".join(parts)


def render_page(rel_path, page_title, meta_desc, hero_title, hero_sub, main_html, nav_key="", service=""):
    depth = rel_path.count("/")
    prefix = "../" * depth if depth else ""
    canonical = rel_path.replace("index.html", "")

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <meta name="description" content="{html.escape(meta_desc or page_title)}">
  <link rel="canonical" href="{LIVE}/{canonical.replace('.html', '/').replace('our-services/', 'our-services/')}">
  <title>{html.escape(page_title)} | 4C Construction</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700&family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="{prefix}css/styles.css">
</head>
<body data-page="inner" data-nav="{nav_key}" data-title="{html.escape(hero_title)}" data-subtitle="{html.escape(hero_sub)}" data-service="{service}">
  <div id="site-top"></div>
  <main>
    {main_html}
  </main>
  <div id="site-bottom"></div>
  <script src="{prefix}js/config.js"></script>
  <script src="{prefix}js/layout.js"></script>
  <script src="{prefix}js/main.js"></script>
</body>
</html>
"""


def write_page(rel_path, content):
    out = os.path.join(BASE, rel_path)
    os.makedirs(os.path.dirname(out), exist_ok=True)
    with open(out, "w", encoding="utf-8") as f:
        f.write(content)
    print("Wrote", rel_path)


def get_sitemap_urls():
    xml = fetch(f"{LIVE}/page-sitemap.xml")
    root = ElementTree.fromstring(xml)
    ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    urls = [el.text for el in root.findall(".//sm:loc", ns)]
    post_xml = fetch(f"{LIVE}/post-sitemap.xml")
    post_root = ElementTree.fromstring(post_xml)
    urls += [el.text for el in post_root.findall(".//sm:loc", ns)]
    return sorted(set(urls))


def url_to_file(url):
    path = url.replace(LIVE, "").strip("/")
    if not path:
        return None
    if path.endswith("/"):
        path = path[:-1]
    slug = path.split("/")[-1] if "/" in path else path
    if slug in SKIP_SLUGS:
        return None
    if path.startswith("our-services/"):
        return path + ".html"
    return path + ".html"


def nav_key_for_file(rel_path):
    mapping = {
        "about-us.html": "about",
        "contact-us.html": "contact",
        "custom-home-building.html": "custom-homes",
        "house-remodeling.html": "whole-home",
        "kitchen-remodeling.html": "kitchens",
        "bathroom-remodeling.html": "bathrooms",
        "basement-finishing.html": "basements",
        "basement-remodeling.html": "basements",
        "our-services/deck-builders.html": "decks",
        "decks-carpentry.html": "decks",
    }
    return mapping.get(rel_path, "")


def service_for_file(rel_path):
    mapping = {
        "custom-home-building.html": "custom-homes",
        "house-remodeling.html": "whole-home",
        "kitchen-remodeling.html": "kitchen",
        "bathroom-remodeling.html": "bathroom",
        "basement-finishing.html": "basement",
        "basement-remodeling.html": "basement",
        "our-services/deck-builders.html": "decks",
    }
    return mapping.get(rel_path, "")


def main():
    # Aliases from existing rich pages
    for target, source in ALIASES.items():
        src_path = os.path.join(BASE, source)
        if os.path.exists(src_path):
            content = open(src_path, encoding="utf-8").read()
            depth = target.count("/")
            prefix = "../" * depth
            content = content.replace('href="css/', f'href="{prefix}css/')
            content = content.replace('href="js/', f'href="{prefix}js/')
            content = content.replace('href="contact.html"', 'href="contact-us.html"')
            content = content.replace('href="about.html"', 'href="about-us.html"')
            content = content.replace('href="custom-homes.html"', 'href="custom-home-building.html"')
            content = content.replace('href="whole-home-remodeling.html"', 'href="house-remodeling.html"')
            content = content.replace('href="decks-carpentry.html"', 'href="our-services/deck-builders.html"')
            write_page(target, content)

    urls = get_sitemap_urls()
    generated = set(ALIASES.keys())

    for url in urls:
        rel = url_to_file(url)
        if not rel or rel in generated:
            continue
        out_path = os.path.join(BASE, rel)
        if os.path.exists(out_path):
            print("Skip existing", rel)
            generated.add(rel)
            continue
        try:
            title, meta, h1, paragraphs, h2_blocks = scrape_page(url)
            hero = h1 or title or "4C Construction"
            sub = meta[:160] if meta else f"4C Construction serves the Omaha Metro — call (402) 616-1814."
            main = body_html_from_scrape(paragraphs, h2_blocks)
            page = render_page(rel, title or hero, meta, hero, sub, main, nav_key_for_file(rel), service_for_file(rel))
            write_page(rel, page)
            generated.add(rel)
        except Exception as e:
            print("FAIL", url, e)

    # Blog posts from post sitemap
    for url in urls:
        if "/role-custom-home-builders" in url or "/ultimate-guide-kitchen" in url:
            rel = url_to_file(url)
            if rel and not os.path.exists(os.path.join(BASE, rel)):
                try:
                    title, meta, h1, paragraphs, h2_blocks = scrape_page(url)
                    hero = h1 or title
                    main = body_html_from_scrape(paragraphs, h2_blocks)
                    page = render_page(rel, title, meta, hero, meta[:160], main)
                    write_page(rel, page)
                except Exception as e:
                    print("FAIL post", url, e)

    print("Done. Generated", len(generated), "page paths tracked.")


if __name__ == "__main__":
    main()
