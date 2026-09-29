// A minimal PDF writer, enough for a one-page invoice and no more.
//
// Why hand-rolled rather than pdfkit / @react-pdf/renderer: an invoice is
// text, rules and right-aligned numbers on A4. Both libraries pull in a font
// subsetter and a stream shim that together weigh more than this whole app's
// server bundle, to render something the base-14 fonts already cover. Nothing
// here handles images, embedded fonts or unicode beyond Latin-1 — if the
// invoice ever needs Bangla type, throw this away and take the dependency.

const A4 = { width: 595.28, height: 841.89 };

export type Font = "regular" | "bold";

// Adobe's Helvetica metrics, 1000 units to the em, ASCII only. Used solely to
// right-align money columns; anything outside the table falls back to the
// width of a digit, which is close enough for a character the invoice should
// not contain anyway.
const WIDTHS: Record<Font, Record<string, number>> = {
  regular: buildWidths(
    "278 278 355 556 556 889 667 191 333 333 389 584 278 333 278 278 556 556 556 556 556 556 556 556 556 556 278 278 584 584 584 556 1015 667 667 722 722 667 611 778 722 278 500 667 556 833 722 778 667 778 722 667 611 722 667 944 667 667 611 278 278 278 469 556 333 556 556 500 556 556 278 556 556 222 222 500 222 833 556 556 556 556 333 500 278 556 500 722 500 500 500 334 260 334 584",
  ),
  bold: buildWidths(
    "278 333 474 556 556 889 722 238 333 333 389 584 278 333 278 278 556 556 556 556 556 556 556 556 556 556 333 333 584 584 584 611 975 722 722 722 722 667 611 778 722 278 556 722 611 833 722 778 667 778 722 667 611 722 667 944 667 667 611 333 278 333 584 556 333 556 611 556 611 556 333 611 611 278 278 556 278 889 611 611 611 611 389 556 333 611 556 778 556 556 500 389 280 389 584",
  ),
};

function buildWidths(spec: string): Record<string, number> {
  const out: Record<string, number> = {};
  spec.split(" ").forEach((w, i) => {
    out[String.fromCharCode(32 + i)] = Number(w);
  });
  return out;
}

/** Everything the invoice prints is normalised to Latin-1 first: the
    catalogue is full of en dashes, curly quotes and the × in dimensions, and
    an unmapped byte is a corrupt PDF rather than a missing glyph. */
export function ascii(input: string): string {
  return input
    .replace(/[‘’‛]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/…/g, "...")
    .replace(/[×✕]/g, "x")
    .replace(/ /g, " ")
    .replace(/[^\x20-\x7E]/g, "");
}

export function textWidth(text: string, size: number, font: Font = "regular"): number {
  const table = WIDTHS[font];
  let total = 0;
  for (const ch of ascii(text)) total += table[ch] ?? 556;
  return (total * size) / 1000;
}

/** Greedy wrap, used only where a catalogue title can run long. */
export function wrap(text: string, size: number, maxWidth: number, font: Font = "regular"): string[] {
  const words = ascii(text).split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (textWidth(next, size, font) <= maxWidth || !line) {
      line = next;
    } else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines.length ? lines : [""];
}

const escape = (text: string) => ascii(text).replace(/([\\()])/g, "\\$1");

export class PdfDoc {
  readonly width = A4.width;
  readonly height = A4.height;

  private pages: string[] = [];
  private ops: string[] = [];

  /** Draws text with the origin at the LEFT BASELINE, PDF-style: y grows
      upward from the bottom of the page. Callers work in "distance from the
      top" and convert once, at the call site, which keeps the layout code
      reading top-down like the page does. */
  text(
    content: string,
    x: number,
    y: number,
    opts: { size?: number; font?: Font; gray?: number } = {},
  ): void {
    const size = opts.size ?? 10;
    const font = opts.font === "bold" ? "F2" : "F1";
    const gray = opts.gray ?? 0;

    this.ops.push(
      `BT /${font} ${size} Tf ${gray} g ${x.toFixed(2)} ${y.toFixed(2)} Td (${escape(content)}) Tj ET`,
    );
  }

  /** Right-aligns against `right` — the only reason the width tables exist. */
  textRight(
    content: string,
    right: number,
    y: number,
    opts: { size?: number; font?: Font; gray?: number } = {},
  ): void {
    const size = opts.size ?? 10;
    this.text(content, right - textWidth(content, size, opts.font ?? "regular"), y, opts);
  }

  line(x1: number, y1: number, x2: number, y2: number, gray = 0.8, thickness = 0.6): void {
    this.ops.push(
      `${gray} G ${thickness} w ${x1.toFixed(2)} ${y1.toFixed(2)} m ${x2.toFixed(2)} ${y2.toFixed(2)} l S`,
    );
  }

  rect(x: number, y: number, w: number, h: number, gray = 0.94): void {
    this.ops.push(`${gray} g ${x.toFixed(2)} ${y.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re f`);
  }

  endPage(): void {
    this.pages.push(this.ops.join("\n"));
    this.ops = [];
  }

  build(): Buffer {
    if (this.ops.length > 0) this.endPage();
    if (this.pages.length === 0) this.pages.push("");

    const pageCount = this.pages.length;

    // Object numbering: 1 catalog, 2 pages tree, 3 F1, 4 F2, then a page and
    // a content stream per page.
    const firstPageObj = 5;
    const pageIds = this.pages.map((_, i) => firstPageObj + i * 2);
    const contentIds = pageIds.map((id) => id + 1);

    const objects: string[] = [];

    objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
    objects[2] =
      `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageCount} >>`;
    objects[3] =
      "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>";
    objects[4] =
      "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>";

    this.pages.forEach((stream, i) => {
      objects[pageIds[i]] =
        `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${A4.width} ${A4.height}] ` +
        `/Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentIds[i]} 0 R >>`;
      objects[contentIds[i]] =
        `<< /Length ${Buffer.byteLength(stream, "latin1")} >>\nstream\n${stream}\nendstream`;
    });

    // Offsets are byte offsets into the finished file, so the document is
    // assembled as buffers and measured as it goes — counting characters
    // would be wrong the moment a Latin-1 accent appears.
    const chunks: Buffer[] = [];
    let offset = 0;
    const offsets: number[] = [];

    const push = (text: string) => {
      const buf = Buffer.from(text, "latin1");
      chunks.push(buf);
      offset += buf.length;
    };

    push("%PDF-1.4\n");

    for (let i = 1; i < objects.length; i++) {
      if (objects[i] === undefined) continue;
      offsets[i] = offset;
      push(`${i} 0 obj\n${objects[i]}\nendobj\n`);
    }

    const xrefOffset = offset;
    const size = objects.length;

    let xref = `xref\n0 ${size}\n0000000000 65535 f \n`;
    for (let i = 1; i < size; i++) {
      xref += `${String(offsets[i] ?? 0).padStart(10, "0")} 00000 n \n`;
    }
    push(xref);
    push(`trailer\n<< /Size ${size} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`);

    return Buffer.concat(chunks);
  }
}
