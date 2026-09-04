#!/usr/bin/env python3
"""
Genera los iconos del sitio (favicon + app icons) a partir de la marca byld:
corchetes redondeados con el dato azul al centro.

    python3 tools/make-icons.py

Escribe en la raiz del repo: favicon.ico, favicon.svg, favicon-32.png,
favicon-48.png, favicon-96.png, favicon-192.png, apple-touch-icon.png,
icon-512.png
"""

import os

from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

INK = (13, 15, 18, 255)        # --ink-900, fondo del mosaico
LIGHT = (255, 255, 255, 255)   # corchetes
BLUE = (47, 93, 245, 255)      # --blue

SS = 16          # supersampling
BOX = 100.0      # espacio de diseno de la marca (mismo viewBox que byld-brand.js)
MARK_SCALE = 1.16  # la marca ocupa ~78% del mosaico (en la web ocupa 67%)
TILE_RADIUS = 0.22  # radio de esquina del mosaico, en fraccion del lado


def scaled(v):
    """Escala un valor del viewBox 100x100 respecto al centro."""
    return 50.0 + (v - 50.0) * MARK_SCALE


def draw_mark(size, rounded_tile=True, bg=INK):
    """Dibuja el mosaico con la marca byld a `size` px."""
    n = size * SS
    u = n / BOX  # unidades de diseno -> px

    img = Image.new("RGBA", (n, n), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    if rounded_tile:
        d.rounded_rectangle([0, 0, n - 1, n - 1], radius=n * TILE_RADIUS, fill=bg)
    else:
        d.rectangle([0, 0, n - 1, n - 1], fill=bg)

    # --- corchetes -------------------------------------------------------
    # Rectangulo redondeado 22..78 con trazo 11 y esquinas r=4 (linea media),
    # al que se le abre un hueco arriba y abajo entre x=40 y x=60.
    sw = 11.0 * MARK_SCALE          # grosor de trazo
    a, b = scaled(22), scaled(78)   # linea media del rectangulo
    r = 4.0 * MARK_SCALE            # radio de esquina (linea media)
    gap_l, gap_r = scaled(40), scaled(60)

    mark = Image.new("RGBA", (n, n), (0, 0, 0, 0))
    md = ImageDraw.Draw(mark)
    md.rounded_rectangle(
        [(a - sw / 2) * u, (a - sw / 2) * u, (b + sw / 2) * u, (b + sw / 2) * u],
        radius=(r + sw / 2) * u,
        outline=LIGHT,
        width=int(round(sw * u)),
    )

    # Hueco superior e inferior (borra hasta transparente).
    for y0, y1 in ((a - sw, a + sw), (b - sw, b + sw)):
        md.rectangle([gap_l * u, y0 * u, gap_r * u, y1 * u], fill=(0, 0, 0, 0))

    # Tapas redondeadas en los cuatro extremos abiertos.
    for cx in (gap_l, gap_r):
        for cy in (a, b):
            md.ellipse(
                [(cx - sw / 2) * u, (cy - sw / 2) * u,
                 (cx + sw / 2) * u, (cy + sw / 2) * u],
                fill=LIGHT,
            )

    img.alpha_composite(mark)

    # --- dato azul al centro --------------------------------------------
    c0, c1 = scaled(38), scaled(62)
    d.rounded_rectangle(
        [c0 * u, c0 * u, c1 * u, c1 * u],
        radius=6.0 * MARK_SCALE * u,
        fill=BLUE,
    )

    return img.resize((size, size), Image.LANCZOS)


def build_svg():
    """Mismo dibujo que draw_mark(), en vectorial."""
    sw = 11.0 * MARK_SCALE
    a, b = scaled(22), scaled(78)
    r = 4.0 * MARK_SCALE
    gl, gr = scaled(40), scaled(60)
    c0, c1 = scaled(38), scaled(62)
    cr = 6.0 * MARK_SCALE

    def f(v):
        return f"{v:.2f}".rstrip("0").rstrip(".")

    left = (f"M{f(gl)} {f(a)} H{f(a + r)} A{f(r)} {f(r)} 0 0 0 {f(a)} {f(a + r)} "
            f"V{f(b - r)} A{f(r)} {f(r)} 0 0 0 {f(a + r)} {f(b)} H{f(gl)}")
    right = (f"M{f(gr)} {f(a)} H{f(b - r)} A{f(r)} {f(r)} 0 0 1 {f(b)} {f(a + r)} "
             f"V{f(b - r)} A{f(r)} {f(r)} 0 0 1 {f(b - r)} {f(b)} H{f(gr)}")

    return (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" '
        'role="img" aria-label="byld">\n'
        f'  <rect width="100" height="100" rx="{f(100 * TILE_RADIUS)}" fill="#0D0F12"/>\n'
        f'  <g fill="none" stroke="#FFFFFF" stroke-width="{f(sw)}" stroke-linecap="round">\n'
        f'    <path d="{left}"/>\n'
        f'    <path d="{right}"/>\n'
        '  </g>\n'
        f'  <rect x="{f(c0)}" y="{f(c0)}" width="{f(c1 - c0)}" height="{f(c1 - c0)}" '
        f'rx="{f(cr)}" fill="#2F5DF5"/>\n'
        '</svg>\n'
    )




def main():
    out = {
        "favicon-32.png": 32,
        "favicon-48.png": 48,
        "favicon-96.png": 96,
        "favicon-192.png": 192,
        "icon-512.png": 512,
    }
    for name, size in out.items():
        draw_mark(size).save(os.path.join(ROOT, name))
        print("wrote", name, f"{size}x{size}")

    # apple-touch-icon: iOS aplica su propia mascara, mosaico sin redondear.
    draw_mark(180, rounded_tile=False).save(os.path.join(ROOT, "apple-touch-icon.png"))
    print("wrote apple-touch-icon.png 180x180")

    # favicon.ico multi-resolucion (lo que rastrea Google como respaldo).
    ico = draw_mark(256)
    ico.save(
        os.path.join(ROOT, "favicon.ico"),
        sizes=[(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)],
    )
    print("wrote favicon.ico 16..256")

    with open(os.path.join(ROOT, "favicon.svg"), "w") as f:
        f.write(build_svg())
    print("wrote favicon.svg")


if __name__ == "__main__":
    main()
