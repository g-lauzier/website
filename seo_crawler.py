#!/usr/bin/env python3
"""
SEO Crawler for guillaumelauzier.com
Checks for:
  1. Missing meta descriptions
  2. Missing 'Venture Partner' related keywords in title tags
  3. Pages with no internal links

Outputs a prioritised report of URLs needing manual SEO updates.
"""

import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
from collections import deque
import time
import sys

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
BASE_URL = "https://guillaumelauzier.com"

VENTURE_KEYWORDS = [
    "venture partner",
    "venture",
    "partner",
    "investor",
    "investment",
    "portfolio",
    "cybersecurity",
    "blockchain",
    "artificial intelligence",
    "digital infrastructure",
    "web3",
    "defi",
    "ai",
    "crypto",
    "infrastructure",
    "contrarian",
    "advisory",
]

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (compatible; SEO-Crawler/1.0; "
        "+https://guillaumelauzier.com)"
    )
}

REQUEST_DELAY = 0.3   # seconds between requests — be polite
REQUEST_TIMEOUT = 15  # seconds

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def normalise(url: str) -> str:
    """Strip fragments and trailing slashes for dedup."""
    parsed = urlparse(url)
    path = parsed.path.rstrip("/") or "/"
    return parsed._replace(fragment="", path=path, query="").geturl()


def is_internal(url: str) -> bool:
    parsed = urlparse(url)
    return parsed.netloc == "" or parsed.netloc.lstrip("www.") == urlparse(BASE_URL).netloc.lstrip("www.")


def is_crawlable(url: str) -> bool:
    """Skip binary assets, mailto:, tel:, javascript:, anchors."""
    parsed = urlparse(url)
    if parsed.scheme in ("mailto", "tel", "javascript", "data"):
        return False
    skip_exts = {
        ".pdf", ".jpg", ".jpeg", ".png", ".gif", ".svg", ".webp",
        ".mp4", ".mp3", ".zip", ".gz", ".tar", ".xml", ".json",
        ".css", ".js", ".ico", ".woff", ".woff2", ".ttf", ".eot",
    }
    path_lower = parsed.path.lower()
    return not any(path_lower.endswith(ext) for ext in skip_exts)


def has_venture_keyword(text: str) -> bool:
    text_lower = text.lower()
    return any(kw in text_lower for kw in VENTURE_KEYWORDS)


# ---------------------------------------------------------------------------
# Crawl
# ---------------------------------------------------------------------------

def crawl(base_url: str):
    visited = set()
    queue = deque([normalise(base_url)])
    results = []

    print(f"Starting crawl of {base_url}")
    print("-" * 60)

    while queue:
        url = queue.popleft()
        if url in visited:
            continue
        visited.add(url)

        try:
            time.sleep(REQUEST_DELAY)
            resp = requests.get(url, headers=HEADERS, timeout=REQUEST_TIMEOUT)
        except requests.RequestException as exc:
            print(f"  [ERROR] {url} — {exc}", file=sys.stderr)
            continue

        if resp.status_code != 200:
            print(f"  [SKIP] {url} — HTTP {resp.status_code}", file=sys.stderr)
            continue

        content_type = resp.headers.get("Content-Type", "")
        if "text/html" not in content_type:
            continue

        soup = BeautifulSoup(resp.text, "lxml")
        issues = []

        # 1. Meta description
        meta_desc = soup.find("meta", attrs={"name": "description"})
        if not meta_desc or not meta_desc.get("content", "").strip():
            issues.append("MISSING_META_DESCRIPTION")

        # 2. Title tag — Venture Partner keywords
        title_tag = soup.find("title")
        title_text = title_tag.get_text(strip=True) if title_tag else ""
        if not title_text or not has_venture_keyword(title_text):
            issues.append("MISSING_VENTURE_KEYWORD_IN_TITLE")

        # 3. Internal links
        all_links = soup.find_all("a", href=True)
        internal_links = [
            a for a in all_links
            if is_internal(urljoin(url, a["href"]))
            and is_crawlable(urljoin(url, a["href"]))
        ]
        if not internal_links:
            issues.append("NO_INTERNAL_LINKS")

        page_count = len(visited)
        if page_count % 50 == 0:
            print(f"  Crawled {page_count} pages so far … (queue: {len(queue)})")

        if issues:
            results.append({
                "url": url,
                "title": title_text,
                "issues": issues,
            })

        # Enqueue newly discovered internal links
        for a_tag in all_links:
            href = a_tag.get("href", "")
            abs_url = normalise(urljoin(url, href))
            if (
                is_internal(abs_url)
                and is_crawlable(abs_url)
                and abs_url not in visited
                and abs_url not in queue
                and abs_url.startswith(base_url)
            ):
                queue.append(abs_url)

    print(f"\nFinished. Crawled {len(visited)} pages total.")
    return results, len(visited)


# ---------------------------------------------------------------------------
# Report
# ---------------------------------------------------------------------------

def print_report(results, total_crawled: int):
    ISSUE_LABELS = {
        "MISSING_META_DESCRIPTION":        "❌ Missing meta description",
        "MISSING_VENTURE_KEYWORD_IN_TITLE": "⚠️  Title missing Venture Partner keyword",
        "NO_INTERNAL_LINKS":                "🔗 No internal links on page",
    }

    print("\n" + "=" * 70)
    print("  SEO AUDIT REPORT — guillaumelauzier.com")
    print("=" * 70)
    print(f"  Total pages crawled : {total_crawled}")
    print(f"  Pages with issues   : {len(results)}")
    print("=" * 70 + "\n")

    # Group by issue type
    by_issue = {k: [] for k in ISSUE_LABELS}
    for page in results:
        for issue in page["issues"]:
            by_issue[issue].append(page)

    for issue_key, label in ISSUE_LABELS.items():
        pages = by_issue[issue_key]
        if not pages:
            continue
        print(f"\n{'─' * 70}")
        print(f"  {label}  ({len(pages)} page{'s' if len(pages) != 1 else ''})")
        print(f"{'─' * 70}")
        for p in sorted(pages, key=lambda x: x["url"]):
            title_display = p["title"][:60] + "…" if len(p["title"]) > 60 else p["title"]
            print(f"  {p['url']}")
            if title_display:
                print(f"    Title: {title_display}")

    # Combined list for quick copy-paste
    all_urls = sorted({p["url"] for p in results})
    print(f"\n\n{'=' * 70}")
    print(f"  COMBINED LIST — {len(all_urls)} URL(s) needing attention")
    print("=" * 70)
    for u in all_urls:
        print(f"  {u}")

    # Save to file
    output_file = "seo_report.txt"
    with open(output_file, "w") as f:
        f.write(f"SEO Audit Report — guillaumelauzier.com\n")
        f.write(f"Total pages crawled: {total_crawled}\n")
        f.write(f"Pages with issues: {len(results)}\n\n")
        for issue_key, label in ISSUE_LABELS.items():
            pages = by_issue[issue_key]
            if not pages:
                continue
            f.write(f"\n{label} ({len(pages)} pages)\n")
            f.write("-" * 60 + "\n")
            for p in sorted(pages, key=lambda x: x["url"]):
                f.write(f"  {p['url']}\n")
                if p["title"]:
                    f.write(f"    Title: {p['title']}\n")
        f.write(f"\n\nCombined URL list needing attention\n")
        f.write("-" * 60 + "\n")
        for u in all_urls:
            f.write(f"  {u}\n")

    print(f"\n  Full report saved to: {output_file}\n")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    results, total = crawl(BASE_URL)
    print_report(results, total)
