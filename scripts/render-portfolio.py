# -*- coding: utf-8 -*-
"""
Render the portfolio PDF into web assets.

The source is ~400MB: 20 spreads whose photographs are stored as raw
FlateDecode RGB, so a single 2048x1529 photo costs 8MB. MuPDF then refuses to
build a display list for the heaviest pages ("Private data too large to pack
into display list node"), which is why pages 1-2 cannot be rasterised
directly.

So the images are re-encoded to JPEG first, in memory:

  - Page.replace_image() is unusable here because nearly every heavy image
    carries an /SMask, and rebuilding the image object drops the soft mask,
    turning transparent artwork into black boxes. Streams are swapped in place
    instead and only the encoding keys are rewritten, leaving /SMask pointing
    where it always did.
  - The mutated document is never written back to disk. Saving it tripped a
    PyMuPDF failure ("cannot save with zero pages"), and the reduced PDF was
    only ever a means to an end — rasterising straight from the in-memory
    document skips the problem entirely.

Produces, in study/public/portfolio/:
  page-NN.webp    2x spreads for the viewer
  thumb-NN.webp   small versions for the strip
  portfolio.pdf   compressed PDF for download, rebuilt from the rasters
  manifest.json   page list + dimensions + extracted text
"""
import io
import json
import os
import sys

import fitz
from PIL import Image

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

HERE = os.path.dirname(os.path.abspath(__file__))
DEFAULT_SRC = r"G:\作品集\作品集-人工智能-王心蕊.pdf"

# usage: python scripts/render-portfolio.py [path-to-portfolio.pdf]
SRC = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_SRC
OUT = os.path.join(HERE, os.pardir, "study", "public", "portfolio")

MAX_IMG_W = 2400        # cap for any single embedded bitmap
MAX_RAW_BYTES = 300000  # re-encode anything heavier, whatever its dimensions
IMG_QUALITY = 80
VIEW_ZOOM = 2.0         # -> ~3368px wide spreads
THUMB_WIDTH = 560
WEBP_QUALITY = 82
PDF_JPEG_QUALITY = 78

os.makedirs(OUT, exist_ok=True)


def shrink_images(doc):
    rewritten = light = failed = 0
    saved = 0

    for xref in range(1, doc.xref_length()):
        try:
            if doc.xref_get_key(xref, "Subtype")[1] != "/Image":
                continue
            raw_len = len(doc.xref_stream_raw(xref))
        except Exception:
            continue

        if raw_len <= MAX_RAW_BYTES:
            light += 1
            continue

        try:
            raw = doc.extract_image(xref)
            if not raw or not raw.get("image"):
                failed += 1
                continue
            img = Image.open(io.BytesIO(raw["image"]))

            gray = img.mode in ("L", "1", "LA", "I;16", "I")
            img = img.convert("L" if gray else "RGB")

            if img.width > MAX_IMG_W:
                ratio = MAX_IMG_W / float(img.width)
                img = img.resize(
                    (MAX_IMG_W, max(1, int(img.height * ratio))), Image.LANCZOS
                )

            buf = io.BytesIO()
            img.save(buf, "JPEG", quality=IMG_QUALITY, optimize=True)
            new = buf.getvalue()

            doc.update_stream(xref, new, new=False, compress=False)
            doc.xref_set_key(xref, "Filter", "/DCTDecode")
            doc.xref_set_key(xref, "Width", str(img.width))
            doc.xref_set_key(xref, "Height", str(img.height))
            doc.xref_set_key(xref, "BitsPerComponent", "8")
            doc.xref_set_key(
                xref, "ColorSpace", "/DeviceGray" if gray else "/DeviceRGB"
            )
            if doc.xref_get_key(xref, "DecodeParms")[0] != "null":
                doc.xref_set_key(xref, "DecodeParms", "null")

            rewritten += 1
            saved += max(0, raw_len - len(new))
        except Exception:
            failed += 1

    print("images: %d re-encoded (%.0f MB saved), %d already light, %d skipped"
          % (rewritten, saved / 1024.0 / 1024.0, light, failed))


def rasterise(doc, pno, rect):
    """
    Returns (PIL image, zoom, how).

    Two spreads carry a vector object complex enough that MuPDF cannot pack it
    into a display list node, and no amount of image re-encoding helps — the
    problem is path complexity, not bytes. Re-wrapping the page as an XObject
    on a fresh page makes MuPDF build the list differently and it goes
    through, so that is the fallback.
    """
    last = None
    page = doc.load_page(pno)
    for zoom in (VIEW_ZOOM, 1.5, 1.0):
        try:
            pix = page.get_pixmap(matrix=fitz.Matrix(zoom, zoom), alpha=False)
            return (Image.frombytes("RGB", (pix.width, pix.height), pix.samples),
                    zoom, "direct")
        except Exception as exc:
            last = exc

    for zoom in (VIEW_ZOOM, 1.5, 1.0):
        try:
            tmp = fitz.open()
            p = tmp.new_page(width=rect.width, height=rect.height)
            p.show_pdf_page(p.rect, doc, pno)
            pix = p.get_pixmap(matrix=fitz.Matrix(zoom, zoom), alpha=False)
            img = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
            tmp.close()
            return img, zoom, "wrapped"
        except Exception as exc:
            last = exc

    return None, None, str(last)


def render(doc):
    out_pdf = fitz.open()
    manifest = []
    missing = []

    for i in range(doc.page_count):
        rect = doc.load_page(i).rect
        num = "%02d" % (i + 1)

        img, used, how = rasterise(doc, i, rect)
        if img is None:
            print("  p%s FAILED: %s" % (num, how))
            missing.append(i + 1)
            continue

        view_name = "page-%s.webp" % num
        img.save(os.path.join(OUT, view_name), "WEBP",
                 quality=WEBP_QUALITY, method=5)

        thumb = img.copy()
        thumb.thumbnail((THUMB_WIDTH, THUMB_WIDTH * 4), Image.LANCZOS)
        thumb_name = "thumb-%s.webp" % num
        thumb.save(os.path.join(OUT, thumb_name), "WEBP", quality=76, method=5)

        buf = io.BytesIO()
        img.save(buf, "JPEG", quality=PDF_JPEG_QUALITY, optimize=True,
                 progressive=True)
        new_page = out_pdf.new_page(width=rect.width, height=rect.height)
        new_page.insert_image(new_page.rect, stream=buf.getvalue())

        manifest.append({
            "index": i + 1,
            "image": "/portfolio/" + view_name,
            "thumb": "/portfolio/" + thumb_name,
            "width": img.width,
            "height": img.height,
            "aspect": round(img.width / float(img.height), 4),
            "text": doc.load_page(i).get_text().strip(),
        })

        kb = os.path.getsize(os.path.join(OUT, view_name)) / 1024.0
        flag = "" if (how == "direct" and used == VIEW_ZOOM) else "  (%s @%.1fx)" % (how, used)
        print("p%s  %dx%d  webp %.0fKB%s" % (num, img.width, img.height, kb, flag))

    pdf_path = os.path.join(OUT, "portfolio.pdf")
    out_pdf.save(pdf_path, garbage=4, deflate=True)
    out_pdf.close()

    with open(os.path.join(OUT, "manifest.json"), "w", encoding="utf-8") as f:
        json.dump({"pages": manifest}, f, ensure_ascii=False, indent=1)

    total = sum(os.path.getsize(os.path.join(OUT, f))
                for f in os.listdir(OUT)) / 1024.0 / 1024.0
    print("\nrendered     %d / %d pages" % (len(manifest), doc.page_count))
    if missing:
        print("MISSING      pages %s" % missing)
    print("source       %.1f MB" % (os.path.getsize(SRC) / 1024.0 / 1024.0))
    print("download pdf %.1f MB" % (os.path.getsize(pdf_path) / 1024.0 / 1024.0))
    print("web assets   %.1f MB total" % total)


doc = fitz.open(SRC)
print("opened %d pages" % doc.page_count)
print("\npass 1: re-encoding embedded images")
shrink_images(doc)
print("pages after rewrite: %d" % doc.page_count)
print("\npass 2: rasterising")
render(doc)
