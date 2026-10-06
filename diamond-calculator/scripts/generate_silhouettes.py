#!/usr/bin/env python3
"""Generate clean diamond-cut silhouette SVGs for the calculator UI."""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
IMG_DIR = ROOT / "public" / "images"

# Soft champagne fill + gold stroke — readable on dark UI
FILL = "#f3ead7"
STROKE = "#c4a35a"
STROKE_W = 2.2

# viewBox 0 0 100 100 — shapes centered
SHAPES: dict[str, str] = {
    # circle
    "round": '<circle cx="50" cy="50" r="34"/>',
    # square with slight chamfer feel
    "princess-cut": '<rect x="22" y="22" width="56" height="56" rx="2"/>',
    "carre-cut": '<rect x="24" y="24" width="52" height="52" rx="1.5"/>',
    # soft square / cushion
    "cushion-cut": '<rect x="20" y="20" width="60" height="60" rx="16"/>',
    "rectangular-cushion-cut": '<rect x="16" y="26" width="68" height="48" rx="14"/>',
    "old-mine-cut": '<rect x="21" y="21" width="58" height="58" rx="18"/>',
    "lucida-cut": '<rect x="22" y="22" width="56" height="56" rx="8"/>',
    # oval
    "oval-cut": '<ellipse cx="50" cy="50" rx="26" ry="36"/>',
    "old-european-cut": '<circle cx="50" cy="50" r="33"/>',
    # pear / teardrop (point at top)
    "pear-cut": (
        '<path d="M50 12 C34 28 24 42 24 56 C24 72 36 84 50 84 '
        'C64 84 76 72 76 56 C76 42 66 28 50 12 Z"/>'
    ),
    # emerald / octagon-ish stepped rectangle
    "emerald-cut": (
        '<path d="M28 24 H72 L82 34 V66 L72 76 H28 L18 66 V34 Z"/>'
    ),
    "asscher-cut": (
        '<path d="M30 22 H70 L80 32 V68 L70 78 H30 L20 68 V32 Z"/>'
    ),
    "ashoka-cut": (
        '<path d="M26 26 H74 L84 36 V64 L74 74 H26 L16 64 V36 Z"/>'
    ),
    "crisscut": (
        '<path d="M24 28 H76 L84 38 V62 L76 72 H24 L16 62 V38 Z"/>'
    ),
    "flanders-cut": (
        '<path d="M32 20 H68 L80 32 V68 L68 80 H32 L20 68 V32 Z"/>'
    ),
    # marquise / football
    "marquise-cuts": (
        '<path d="M50 10 C68 28 78 42 78 50 C78 58 68 72 50 90 '
        'C32 72 22 58 22 50 C22 42 32 28 50 10 Z"/>'
    ),
    # radiant — rectangle with cut corners
    "radiant-cut": (
        '<path d="M28 22 H72 L80 30 V70 L72 78 H28 L20 70 V30 Z"/>'
    ),
    "rectangular-radiant-cut": (
        '<path d="M18 28 H82 L88 34 V66 L82 72 H18 L12 66 V34 Z"/>'
    ),
    "french-cut": (
        '<path d="M30 22 H70 L78 30 V70 L70 78 H30 L22 70 V30 Z"/>'
    ),
    # heart
    "heart-cut": (
        '<path d="M50 82 C50 82 18 60 18 40 C18 28 28 22 38 22 '
        'C44 22 48 26 50 30 C52 26 56 22 62 22 C72 22 82 28 82 40 '
        'C82 60 50 82 50 82 Z"/>'
    ),
    # baguette — tall thin rectangle
    "baguette": '<rect x="38" y="16" width="24" height="68" rx="1.5"/>',
    "tapered-baguette": (
        '<path d="M42 16 H58 L54 84 H46 Z"/>'
    ),
    # bullet / tapered bullet
    "bullet-cut": (
        '<path d="M36 18 H64 V62 L50 84 L36 62 Z"/>'
    ),
    "tapered-bullet-cut": (
        '<path d="M40 16 H60 V58 L50 86 L40 58 Z"/>'
    ),
    # triangle / trilliant
    "trilliant-cut": '<path d="M50 16 L84 78 H16 Z"/>',
    # hexagon
    "hexagon": (
        '<path d="M50 16 L78 33 V67 L50 84 L22 67 V33 Z"/>'
    ),
    # kite
    "kite-cut": '<path d="M50 12 L78 48 L50 88 L22 48 Z"/>',
    # lozenge (diamond orientation)
    "lozenge-cut": '<path d="M50 14 L82 50 L50 86 L18 50 Z"/>',
    # trapezoid
    "trapezoid": '<path d="M28 28 H72 L80 72 H20 Z"/>',
    # half moon
    "half-moon-cut": (
        '<path d="M22 28 A30 30 0 0 1 78 28 L78 72 A30 30 0 0 1 22 72 Z"/>'
    ),
    # shield
    "shield-cut": (
        '<path d="M50 14 L78 28 V52 C78 68 64 80 50 88 C36 80 22 68 22 52 V28 Z"/>'
    ),
    # calf (elongated cushion/pear hybrid)
    "calf-cut": (
        '<path d="M34 18 H66 C74 18 80 28 80 40 V60 C80 74 68 84 50 84 '
        'C32 84 20 74 20 60 V40 C20 28 26 18 34 18 Z"/>'
    ),
    # epaullete / shoulder
    "epaullete-cut": (
        '<path d="M18 42 L32 24 H68 L82 42 L68 76 H32 Z"/>'
    ),
    # rose cut — circle with petal hint via inner ring drawn separately
    "rose-cut": '<circle cx="50" cy="50" r="34"/>',
}


def wrap(inner: str, extra: str = "") -> str:
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" role="img" aria-hidden="true">
  <defs>
    <linearGradient id="g" x1="20" y1="10" x2="80" y2="90" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#fff8ea"/>
      <stop offset="55%" stop-color="{FILL}"/>
      <stop offset="100%" stop-color="#d9c49a"/>
    </linearGradient>
  </defs>
  <g fill="url(#g)" stroke="{STROKE}" stroke-width="{STROKE_W}" stroke-linejoin="round" stroke-linecap="round">
    {inner}
  </g>
  {extra}
</svg>
"""


def rose_extra() -> str:
    return f"""  <g fill="none" stroke="{STROKE}" stroke-width="1.4" opacity="0.85">
    <circle cx="50" cy="50" r="18"/>
    <path d="M50 32 L58 50 L50 68 L42 50 Z"/>
    <path d="M32 50 H68"/>
  </g>
"""


def write_all(cut_ids: list[str]) -> None:
    IMG_DIR.mkdir(parents=True, exist_ok=True)
    # Remove muddy photo formats we no longer want
    for stale in IMG_DIR.glob("*"):
        if stale.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"}:
            stale.unlink()
            print(f"removed {stale.name}")

    for cut_id in cut_ids:
        shape = SHAPES.get(cut_id)
        if not shape:
            # fallback: rounded square
            shape = '<rect x="24" y="24" width="52" height="52" rx="10"/>'
            print(f"fallback silhouette for {cut_id}")
        extra = rose_extra() if cut_id == "rose-cut" else ""
        # Round / old european: subtle facet ring
        if cut_id in {"round", "old-european-cut"}:
            extra = f'  <circle cx="50" cy="50" r="18" fill="none" stroke="{STROKE}" stroke-width="1.3" opacity="0.7"/>\n'
        path = IMG_DIR / f"{cut_id}.svg"
        path.write_text(wrap(shape, extra), encoding="utf-8")
        print(f"wrote {path.name}")


def main() -> None:
    import json

    data = json.loads((ROOT / "data" / "diamonds.json").read_text(encoding="utf-8"))
    cut_ids = [c["id"] for c in data["cuts"]]
    write_all(cut_ids)

    # Point every cut at its silhouette SVG; drop jpg/webp sources
    for cut in data["cuts"]:
        cut["image"] = f"images/{cut['id']}.svg"
        cut["imageSource"] = "local-silhouette"
    payload = json.dumps(data, ensure_ascii=False, indent=2)
    (ROOT / "data" / "diamonds.json").write_text(payload + "\n", encoding="utf-8")
    public = ROOT / "public" / "data"
    public.mkdir(parents=True, exist_ok=True)
    (public / "diamonds.json").write_text(payload + "\n", encoding="utf-8")
    print("updated diamonds.json image paths")


if __name__ == "__main__":
    main()
