from PIL import Image, ImageDraw
import os

OUT = os.path.join(os.path.dirname(__file__), '..', 'public')
NAVY = (31, 59, 99)
WHITE = (255, 255, 255)
GREEN = (76, 175, 110)


def icon(size, name):
    im = Image.new('RGB', (size, size), NAVY)
    d = ImageDraw.Draw(im)
    s = size / 180
    line = max(1, round(4 * s))
    thin = max(1, round(3 * s))
    x0, y0, x1, y1 = 32 * s, 40 * s, 148 * s, 148 * s
    d.rounded_rectangle([x0, y0, x1, y1], radius=10 * s, outline=WHITE, width=line)
    d.rectangle([x0, y0, x1, y0 + 24 * s], fill=WHITE)
    for x in (62, 118):
        d.rounded_rectangle([x * s - 4 * s, 28 * s, x * s + 4 * s, 50 * s], radius=3 * s, fill=WHITE)
    gx0, gy0, gx1, gy1 = x0, y0 + 24 * s, x1, y1
    cols, rows = 5, 4
    for i in range(1, cols):
        x = gx0 + (gx1 - gx0) * i / cols
        d.line([x, gy0, x, gy1], fill=WHITE, width=thin)
    for j in range(1, rows):
        y = gy0 + (gy1 - gy0) * j / rows
        d.line([gx0, y, gx1, y], fill=WHITE, width=thin)
    cw = (gx1 - gx0) / cols
    ch = (gy1 - gy0) / rows
    pad = 3 * s
    d.rectangle([gx0 + 2 * cw + pad, gy0 + ch + pad, gx0 + 3 * cw - pad, gy0 + 2 * ch - pad], fill=GREEN)
    im.save(os.path.join(OUT, name))


for size, name in [(180, 'icon-180.png'), (192, 'icon-192.png'), (512, 'icon-512.png')]:
    icon(size, name)
print('ok')
