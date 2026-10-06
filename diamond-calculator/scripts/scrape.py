#!/usr/bin/env python3
"""Scrape diamondsizecharts.com cut charts into local JSON + images."""

from __future__ import annotations

import json
import re
import time
import urllib.error
import urllib.request
from html import unescape
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
IMG_DIR = ROOT / "public" / "images"
API = "https://diamondsizecharts.com/wp-json/wp/v2/pages?per_page=100"

# Pages that are not cut size charts
SKIP_SLUGS = {
    "contact",
    "about",
    "diamond-comparison",
    "professional-diamond-calculator",
    "testcalc-2",
    "side-stones-everything-you-need-to-know",
}

UA = "Mozilla/5.0 (compatible; DiamondCaratCalculator/1.0; +local)"


def fetch(url: str, retries: int = 4) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    delay = 1.0
    last_err: Exception | None = None
    for _ in range(retries):
        try:
            with urllib.request.urlopen(req, timeout=60) as resp:
                return resp.read()
        except (urllib.error.URLError, TimeoutError) as err:
            last_err = err
            time.sleep(delay)
            delay *= 2
    raise RuntimeError(f"Failed to fetch {url}: {last_err}")


def strip_tags(html: str) -> str:
    text = re.sub(r"<br\s*/?>", "\n", html, flags=re.I)
    text = re.sub(r"</p\s*>\s*<p[^>]*>", " - ", text, flags=re.I)
    text = re.sub(r"</?p[^>]*>", " ", text, flags=re.I)
    text = re.sub(r"<[^>]+>", "", text)
    text = unescape(text).replace("\xa0", " ").strip()
    text = re.sub(r"\s+", " ", text)
    return text


def parse_number(token: str) -> float | None:
    token = token.strip().lower().replace(",", ".")
    token = re.sub(r"[^\d.]", "", token)
    if not token or token.count(".") > 1:
        return None
    try:
        return float(token)
    except ValueError:
        return None


def parse_range(cell: str) -> tuple[float | None, float | None, float | None]:
    """Return (min, max, mid) from strings like '0.21 - 0.22 ct' or '3.80 - 3.90mm'."""
    cleaned = cell.lower().replace("ct.", "ct").replace("mm.", "mm")
    cleaned = cleaned.replace("–", "-").replace("—", "-")
    nums = re.findall(r"\d+(?:[.,]\d+)?", cleaned)
    parsed = [parse_number(n) for n in nums]
    parsed = [n for n in parsed if n is not None]
    if not parsed:
        return None, None, None
    if len(parsed) == 1:
        return parsed[0], parsed[0], parsed[0]
    lo, hi = parsed[0], parsed[1]
    return lo, hi, round((lo + hi) / 2, 4)


def is_size_header(cells: list[str]) -> bool:
    joined = " ".join(cells).lower()
    has_carat = any(k in joined for k in ("carat", "ct", "weight", "cts"))
    has_mm = "mm" in joined or "size" in joined
    if any(k in joined for k in ("excellent", "table -", "depth -", "girdle", "culet", "ratio")):
        return False
    return has_carat and has_mm


def is_size_row(cells: list[str]) -> bool:
    if len(cells) < 2:
        return False
    joined = " ".join(cells).lower()
    if any(k in joined for k in ("excellent", "very good", "table -", "depth -", "girdle", "culet")):
        return False
    cmin, _, _ = parse_range(cells[0])
    mmin, _, _ = parse_range(cells[1])
    return cmin is not None and mmin is not None


def extract_tables(html: str) -> list[list[list[str]]]:
    tables = []
    for table_html in re.findall(r"<table[\s\S]*?</table>", html, flags=re.I):
        rows = []
        for row_html in re.findall(r"<tr[\s\S]*?</tr>", table_html, flags=re.I):
            cells = [
                strip_tags(c)
                for c in re.findall(r"<t[hd][^>]*>([\s\S]*?)</t[hd]>", row_html, flags=re.I)
            ]
            cells = [c for c in cells if c is not None]
            if cells:
                rows.append(cells)
        if rows:
            tables.append(rows)
    return tables


def extract_matrix_sizes(table: list[list[str]]) -> list[dict]:
    """Parse length×width carat matrices used by baguette/bullet charts."""
    if len(table) < 3:
        return []
    # Find header row containing length/width labels
    header_idx = None
    for i, row in enumerate(table[:4]):
        joined = " ".join(row).lower()
        # Baguette/bullet style: first cell mentions MM Length, other cells are numeric widths
        if "length" not in joined or len(row) < 4:
            continue
        if any(k in joined for k in ("weight", "carat", "ct tw", "horizontal", "vertical")):
            continue
        if not re.search(r"\bmm\b", joined):
            continue
        header_idx = i
        break
    if header_idx is None:
        return []

    header = table[header_idx]
    # Widths from columns 1+
    widths = []
    for cell in header[1:]:
        wmin, wmax, wmid = parse_range(cell)
        if wmid is None:
            widths.append(None)
        else:
            widths.append((wmin, wmax, wmid))
    if sum(1 for w in widths if w) < 2:
        return []

    sizes: list[dict] = []
    seen: set[tuple] = set()
    for row in table[header_idx + 1 :]:
        if not row:
            continue
        lmin, lmax, lmid = parse_range(row[0])
        if lmid is None or lmid > 40:
            continue
        for col_i, width in enumerate(widths):
            if width is None:
                continue
            cell_i = col_i + 1
            if cell_i >= len(row):
                continue
            cmin, cmax, cmid = parse_range(row[cell_i])
            if cmid is None or cmid <= 0 or cmid > 50:
                continue
            wmin, wmax, wmid = width
            key = (round(lmid, 4), round(wmid, 4), round(cmid, 4))
            if key in seen:
                continue
            seen.add(key)
            # Represent "mm" as length (longer axis) for sorting/display
            sizes.append(
                {
                    "carat": cmid,
                    "caratMin": cmin,
                    "caratMax": cmax,
                    "mm": lmid,
                    "mmMin": lmin,
                    "mmMax": lmax,
                    "widthMm": wmid,
                    "widthMmMin": wmin,
                    "widthMmMax": wmax,
                    "label": f"{lmin:g}–{lmax:g} × {wmin:g}–{wmax:g} mm · {cmin:g}–{cmax:g} ct"
                    if cmin != cmax
                    else f"{lmin:g}–{lmax:g} × {wmin:g}–{wmax:g} mm · {cmid:g} ct",
                }
            )
    sizes.sort(key=lambda s: (s["mm"], s.get("widthMm", 0), s["carat"]))
    return sizes


def extract_sizes(html: str) -> list[dict]:
    sizes: list[dict] = []
    seen: set[tuple] = set()
    for table in extract_tables(html):
        if not table:
            continue

        # Try matrix charts first (baguette / bullet / trapezoid-style grids)
        matrix = extract_matrix_sizes(table)
        if matrix:
            for entry in matrix:
                key = (
                    entry["carat"],
                    entry["mm"],
                    entry.get("widthMm"),
                    entry["caratMin"],
                    entry["caratMax"],
                    entry["mmMin"],
                    entry["mmMax"],
                )
                if key in seen:
                    continue
                seen.add(key)
                sizes.append(entry)
            continue

        header = table[0]
        body = table[1:]
        if not (is_size_header(header) or (body and is_size_row(body[0]))):
            candidates = table
        else:
            candidates = body if is_size_header(header) else table

        for cells in candidates:
            if not is_size_row(cells):
                continue
            cmin, cmax, cmid = parse_range(cells[0])
            mmin, mmax, mmid = parse_range(cells[1])
            if cmid is None or mmid is None or mmin is None or mmax is None:
                continue
            # Drop source typos (e.g. "130-1.35 mm") and absurd values
            if mmin > mmax or cmin > cmax:
                continue
            if mmid > 40 or cmid > 50 or mmin <= 0 or cmin <= 0:
                continue
            key = (cmid, mmid, None, cmin, cmax, mmin, mmax)
            if key in seen:
                continue
            seen.add(key)
            if cmin == cmax and mmin == mmax:
                label = f"{mmid:g} mm · {cmid:g} ct"
            elif cmin == cmax:
                label = f"{mmin:g}–{mmax:g} mm · {cmid:g} ct"
            elif mmin == mmax:
                label = f"{mmid:g} mm · {cmin:g}–{cmax:g} ct"
            else:
                label = f"{mmin:g}–{mmax:g} mm · {cmin:g}–{cmax:g} ct"
            entry: dict = {
                "carat": cmid,
                "caratMin": cmin,
                "caratMax": cmax,
                "mm": mmid,
                "mmMin": mmin,
                "mmMax": mmax,
                "label": label,
            }
            # Optional sieve / pcs columns
            if len(cells) >= 3 and cells[2]:
                entry["extra"] = cells[2]
            if len(cells) >= 4 and cells[3]:
                entry["sieve"] = cells[3]
            sizes.append(entry)

    sizes.sort(key=lambda s: (s["mm"], s.get("widthMm") or 0, s["carat"]))
    return sizes


def pick_cut_image(html: str, slug: str, title: str) -> str | None:
    """Prefer a cut-specific illustration over logos/nav thumbnails."""
    urls = re.findall(
        r"https://diamondsizecharts\.com/wp-content/uploads/[^\s\"']+\.(?:png|jpe?g|svg|webp)",
        html,
        flags=re.I,
    )
    # Drop resized variants and logos
    cleaned = []
    for u in urls:
        low = u.lower()
        if any(x in low for x in ("logo", "cropped-", "favicon", "socialsnap")):
            continue
        if re.search(r"-\d+x\d+\.(png|jpe?g|webp)$", low):
            continue
        cleaned.append(u)

    # Prefer svg charts / comparison images matching cut keywords
    keywords = re.findall(r"[a-z]+", slug.replace("-", " ") + " " + title.lower())
    keywords = [k for k in keywords if k not in {"cut", "diamond", "size", "chart", "shaped", "conversion", "tool", "charts"}]

    scored: list[tuple[int, str]] = []
    for u in cleaned:
        low = u.lower()
        score = 0
        if low.endswith(".svg"):
            score += 5
        if "cttomm" in low or "sizechart" in low or "comparison" in low or "weightchart" in low:
            score += 3
        for kw in keywords:
            if kw and kw in low:
                score += 2
        scored.append((score, u))

    scored.sort(key=lambda x: (-x[0], x[1]))
    return scored[0][1] if scored else None


def slugify(text: str) -> str:
    text = text.lower()
    text = re.sub(r"[^a-z0-9]+", "-", text).strip("-")
    return text or "cut"


def turkish_name(slug: str, title: str) -> str:
    # Longer / more specific keys first
    mapping = [
        ("rectangular-radiant", "Dikdörtgen Radiant"),
        ("rectangular-cushion", "Dikdörtgen Cushion"),
        ("tapered-baguette", "Konik Baguette"),
        ("tapered-bullet", "Konik Bullet"),
        ("old-european", "Old European"),
        ("old-mine", "Old Mine"),
        ("half-moon", "Yarım Ay (Half Moon)"),
        ("princess", "Prenses (Princess)"),
        ("marquise", "Markiz (Marquise)"),
        ("trilliant", "Trilliant"),
        ("trapezoid", "Trapez"),
        ("epaullete", "Epaullete"),
        ("flanders", "Flanders"),
        ("crisscut", "Crisscut"),
        ("asscher", "Asscher"),
        ("baguette", "Baguette"),
        ("emerald", "Zümrüt (Emerald)"),
        ("radiant", "Radiant"),
        ("cushion", "Cushion"),
        ("hexagon", "Altıgen (Hexagon)"),
        ("lozenge", "Lozenge"),
        ("ashoka", "Ashoka"),
        ("lucida", "Lucida"),
        ("french", "French Cut"),
        ("bullet", "Bullet"),
        ("shield", "Kalkan (Shield)"),
        ("heart", "Kalp (Heart)"),
        ("round", "Yuvarlak (Round)"),
        ("oval", "Oval"),
        ("pear", "Armut (Pear)"),
        ("rose", "Gül (Rose)"),
        ("kite", "Uçurtma (Kite)"),
        ("calf", "Calf"),
        ("carre", "Carré"),
    ]
    for key, label in mapping:
        if slug == key or slug.startswith(key + "-") or slug.startswith(key):
            return label
    # Fallback: clean English title
    name = re.sub(r"\s*(Cut|Shaped)?\s*Diamond Size Charts?\s*", "", title, flags=re.I)
    name = re.sub(r"\s*Conversion Tool\s*", "", name, flags=re.I)
    return name.strip() or title


def download_image(url: str, dest: Path) -> bool:
    try:
        data = fetch(url)
        dest.write_bytes(data)
        return True
    except Exception as exc:  # noqa: BLE001
        print(f"  ! image failed {url}: {exc}")
        return False


def main() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    IMG_DIR.mkdir(parents=True, exist_ok=True)

    print("Fetching page list…")
    pages = json.loads(fetch(API).decode("utf-8"))
    cuts = []

    for page in pages:
        slug = page.get("slug") or ""
        link = page.get("link") or ""
        title = strip_tags(page.get("title", {}).get("rendered", ""))
        if slug in SKIP_SLUGS:
            continue
        # Keep homepage (round) and any *-size-chart* / conversion tool cut pages
        is_cut = (
            page.get("id") == 9
            or "size-chart" in slug
            or "size-charts" in slug
            or "conversion-tool" in slug
        )
        if not is_cut:
            continue

        print(f"Scraping {title} ({link})")
        html = fetch(link).decode("utf-8", errors="replace")
        sizes = extract_sizes(html)
        image_url = pick_cut_image(html, slug, title)
        cut_id = "round" if page.get("id") == 9 else slug.replace("-diamond-size-chart", "").replace("-diamond-size-charts", "").replace("-diamond-conversion-tool", "")
        cut_id = cut_id.replace("-shaped", "").strip("-") or slugify(title)

        local_image = None
        if image_url:
            ext = Path(image_url.split("?")[0]).suffix or ".png"
            local_name = f"{cut_id}{ext}"
            dest = IMG_DIR / local_name
            if download_image(image_url, dest):
                local_image = f"images/{local_name}"
                print(f"  image -> {local_name}")

        cut = {
            "id": cut_id,
            "name": turkish_name(cut_id, title),
            "nameEn": title,
            "sourceUrl": link,
            "image": local_image,
            "imageSource": image_url,
            "sizeCount": len(sizes),
            "sizes": sizes,
        }
        cuts.append(cut)
        print(f"  sizes: {len(sizes)}")
        time.sleep(0.35)

    # Prefer common cuts first (match by id prefix)
    priority = [
        "round",
        "princess",
        "oval",
        "cushion-cut",
        "pear",
        "emerald",
        "marquise",
        "radiant-cut",
        "heart",
        "asscher",
        "baguette",
    ]

    def sort_key(c: dict) -> tuple:
        cid = c["id"]
        for i, p in enumerate(priority):
            if cid == p or cid.startswith(p):
                return (0, i)
        return (1, c["name"].lower())

    cuts.sort(key=sort_key)

    payload = {
        "source": "https://diamondsizecharts.com/",
        "scrapedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "cutCount": len(cuts),
        "totalSizes": sum(c["sizeCount"] for c in cuts),
        "cuts": cuts,
    }
    out = DATA_DIR / "diamonds.json"
    out.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    public_data = ROOT / "public" / "data"
    public_data.mkdir(parents=True, exist_ok=True)
    (public_data / "diamonds.json").write_text(
        json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"\nWrote {out} — {payload['cutCount']} cuts, {payload['totalSizes']} sizes")
    print(f"Also wrote {public_data / 'diamonds.json'}")


if __name__ == "__main__":
    main()
