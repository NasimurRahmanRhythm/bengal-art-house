"use client";

import Quill from "quill";
import { type Attributor, EmbedBlot, Scope, StyleAttributor } from "parchment";
import { useCallback, useEffect, useRef, useState } from "react";
import { formatBytes } from "@/lib/admin/html";

/* The blog editor, built on Quill 2.

   Only ever loaded in the browser — Quill touches `document` at import time,
   so this module is behind a dynamic import in RichTextEditor.tsx.

   Two decisions worth knowing about:

   - Formats are registered as *style* attributors rather than Quill's default
     class attributors. Out of the box Quill writes `class="ql-size-large"`,
     which only means something on a page that also loads Quill's stylesheet.
     Writing `style="font-size: 18px"` instead keeps the saved post readable
     anywhere it is rendered — including inside an email or another CMS later.

   - Pictures are resized by formatting the image blot's `width`, not by
     poking at the DOM. Anything done outside Quill's model is invisible to
     undo and is quietly reverted the next time the document is normalised. */

// Pictures are stored inside the post itself until Supabase Storage is wired
// up, so an unresized phone photo would bloat the record.
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

// ---------------------------------------------------------------- formats --

const FONTS = [
  { value: "", label: "Default" },
  { value: "Fraunces, Georgia, serif", label: "Fraunces" },
  { value: "Work Sans, system-ui, sans-serif", label: "Work Sans" },
  { value: "Georgia, serif", label: "Georgia" },
  { value: "Times New Roman, Times, serif", label: "Times New Roman" },
  { value: "Arial, Helvetica, sans-serif", label: "Arial" },
  { value: "Helvetica, Arial, sans-serif", label: "Helvetica" },
  { value: "Verdana, Geneva, sans-serif", label: "Verdana" },
  { value: "Tahoma, Geneva, sans-serif", label: "Tahoma" },
  { value: "Trebuchet MS, sans-serif", label: "Trebuchet MS" },
  { value: "Courier New, Courier, monospace", label: "Courier New" },
  { value: "IBM Plex Mono, ui-monospace, monospace", label: "Plex Mono" },
];

const SIZES = [
  "10px",
  "12px",
  "14px",
  "16px",
  "18px",
  "20px",
  "24px",
  "30px",
  "36px",
  "48px",
  "60px",
];

/** Browsers re-serialise font-family with quotes and their own spacing, so
    both sides of the whitelist comparison are flattened to one form. */
const flatten = (v: string) =>
  v
    .replace(/["']/g, "")
    .replace(/\s*,\s*/g, ", ")
    .trim();

class FontFamilyAttributor extends StyleAttributor {
  value(node: HTMLElement) {
    return flatten(super.value(node));
  }
}

let registered = false;

function registerFormats() {
  if (registered) return;
  registered = true;

  const font = new FontFamilyAttributor("font", "font-family", {
    scope: Scope.INLINE,
    whitelist: FONTS.filter((f) => f.value).map((f) => f.value),
  });

  const size = new StyleAttributor("size", "font-size", {
    scope: Scope.INLINE,
    whitelist: SIZES,
  });

  // A plain horizontal rule — Quill has no divider of its own.
  const BlockEmbed = Quill.import("blots/block/embed") as typeof EmbedBlot;
  class Divider extends BlockEmbed {
    static blotName = "divider";
    static tagName = "HR";
  }

  Quill.register(
    {
      "formats/font": font,
      "formats/size": size,
      // The three Quill ships both ways; take the style-based ones.
      "formats/align": Quill.import("attributors/style/align") as Attributor,
      "formats/color": Quill.import("attributors/style/color") as Attributor,
      "formats/background": Quill.import("attributors/style/background") as Attributor,
      "formats/divider": Divider,
    },
    true,
  );

  const icons = Quill.import("ui/icons") as Record<string, string>;
  icons.undo =
    '<svg viewBox="0 0 18 18"><path class="ql-stroke" d="M3,7 L8,7 A4,4 0 1,1 8,15 L5,15"/><polyline class="ql-stroke" points="5.5,4 2.5,7 5.5,10"/></svg>';
  icons.redo =
    '<svg viewBox="0 0 18 18"><path class="ql-stroke" d="M15,7 L10,7 A4,4 0 1,0 10,15 L13,15"/><polyline class="ql-stroke" points="12.5,4 15.5,7 12.5,10"/></svg>';
  icons.divider =
    '<svg viewBox="0 0 18 18"><line class="ql-stroke" x1="3" y1="9" x2="15" y2="9"/><line class="ql-stroke ql-thin" x1="5" y1="5" x2="13" y2="5"/><line class="ql-stroke ql-thin" x1="5" y1="13" x2="13" y2="13"/></svg>';
}

// ---------------------------------------------------------------- toolbar --

const option = (value: string, label: string) =>
  `<option${value ? ` value="${value}"` : " selected"}>${label}</option>`;

// Written as a string and injected by hand in the setup effect below, never
// as JSX. Quill replaces every <select> in here with its own picker markup,
// and React must not own DOM that something else rewrites — rendered through
// JSX or dangerouslySetInnerHTML, the next keystroke re-renders the component
// and wipes the pickers out again.
const TOOLBAR_HTML = `
<span class="ql-formats">
  <button type="button" class="ql-undo" title="Undo"></button>
  <button type="button" class="ql-redo" title="Redo"></button>
</span>
<span class="ql-formats">
  <select class="ql-header" title="Paragraph style">
    ${option("", "Normal text")}
    ${option("1", "Title")}
    ${option("2", "Heading")}
    ${option("3", "Subheading")}
    ${option("4", "Small heading")}
  </select>
  <select class="ql-font" title="Font">
    ${FONTS.map((f) => option(f.value, f.label)).join("")}
  </select>
  <select class="ql-size" title="Font size">
    ${option("", "Normal")}
    ${SIZES.map((s) => option(s, s.replace("px", ""))).join("")}
  </select>
</span>
<span class="ql-formats">
  <button type="button" class="ql-bold" title="Bold"></button>
  <button type="button" class="ql-italic" title="Italic"></button>
  <button type="button" class="ql-underline" title="Underline"></button>
  <button type="button" class="ql-strike" title="Strikethrough"></button>
</span>
<span class="ql-formats">
  <select class="ql-color" title="Text colour"></select>
  <select class="ql-background" title="Highlight"></select>
</span>
<span class="ql-formats">
  <select class="ql-align" title="Alignment"></select>
  <button type="button" class="ql-list" value="bullet" title="Bulleted list"></button>
  <button type="button" class="ql-list" value="ordered" title="Numbered list"></button>
  <button type="button" class="ql-indent" value="-1" title="Less indent"></button>
  <button type="button" class="ql-indent" value="+1" title="More indent"></button>
</span>
<span class="ql-formats">
  <button type="button" class="ql-blockquote" title="Quote"></button>
  <button type="button" class="ql-code-block" title="Code block"></button>
  <button type="button" class="ql-script" value="sub" title="Subscript"></button>
  <button type="button" class="ql-script" value="super" title="Superscript"></button>
</span>
<span class="ql-formats">
  <button type="button" class="ql-link" title="Add a link"></button>
  <button type="button" class="ql-image" title="Add a picture"></button>
  <button type="button" class="ql-divider" title="Divider line"></button>
  <button type="button" class="ql-clean" title="Remove formatting"></button>
</span>`;

// ----------------------------------------------------------------- editor --

type Box = { left: number; top: number; width: number; height: number };

export default function QuillEditor({
  value,
  onChange,
  placeholder = "Start writing…",
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const quillRef = useRef<Quill | null>(null);

  // The last HTML this editor handed upwards. Comparing against it is what
  // stops the parent's state round-trip from resetting the document under the
  // caret on every keystroke.
  const emitted = useRef<string | null>(null);
  // Read inside the one-time setup effect, so changing them never re-creates
  // the editor.
  const latest = useRef({ value, onChange });
  latest.current = { value, onChange };

  const [warning, setWarning] = useState("");
  const selected = useRef<HTMLImageElement | null>(null);
  const [box, setBox] = useState<Box | null>(null);

  /** Position the selection frame over the picture it belongs to. */
  const measure = useCallback(() => {
    const host = hostRef.current;
    const img = selected.current;
    if (!host || !img || !img.isConnected) {
      selected.current = null;
      setBox(null);
      return;
    }
    const h = host.getBoundingClientRect();
    const r = img.getBoundingClientRect();
    setBox({ left: r.left - h.left, top: r.top - h.top, width: r.width, height: r.height });
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const toolbar = toolbarRef.current;
    if (!container || !toolbar) return;

    registerFormats();

    toolbar.innerHTML = TOOLBAR_HTML;

    const quill = new Quill(container, {
      theme: "snow",
      placeholder,
      modules: {
        toolbar: {
          container: toolbar,
          handlers: {
            image: () => fileRef.current?.click(),
            undo: () => quill.history.undo(),
            redo: () => quill.history.redo(),
            divider: () => {
              const range = quill.getSelection(true);
              quill.insertEmbed(range.index, "divider", true, Quill.sources.USER);
              quill.setSelection(range.index + 1, 0, Quill.sources.SILENT);
            },
          },
        },
        history: { delay: 700, maxStack: 300, userOnly: true },
      },
    });
    quillRef.current = quill;

    if (latest.current.value) {
      quill.clipboard.dangerouslyPasteHTML(latest.current.value, "silent");
    }
    emitted.current = latest.current.value;

    const onText = () => {
      const html = quill.root.innerHTML;
      emitted.current = html;
      latest.current.onChange(html);
      measure();
    };
    quill.on("text-change", onText);

    // Clicking a picture selects it, the way it does in a word processor;
    // clicking anywhere else lets it go.
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target instanceof HTMLImageElement) {
        selected.current = target;
        measure();
      } else {
        selected.current = null;
        setBox(null);
      }
    };
    quill.root.addEventListener("click", onClick);

    const onWindow = () => measure();
    window.addEventListener("scroll", onWindow, true);
    window.addEventListener("resize", onWindow);

    return () => {
      quill.off("text-change", onText);
      quill.root.removeEventListener("click", onClick);
      window.removeEventListener("scroll", onWindow, true);
      window.removeEventListener("resize", onWindow);
      quillRef.current = null;
      selected.current = null;
      // Both elements are handed back the way they were found, so React's
      // development-mode double mount rebuilds one editor rather than two.
      container.innerHTML = "";
      container.className = "";
      toolbar.innerHTML = "";
      toolbar.className = "a-qlToolbar";
    };
    // Set up once; `placeholder` is not expected to change mid-edit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Only fires when the parent replaces the document wholesale (a reset, or a
  // different post) — never on the writer's own keystrokes.
  useEffect(() => {
    const quill = quillRef.current;
    if (!quill || value === emitted.current) return;
    quill.clipboard.dangerouslyPasteHTML(value || "", "silent");
    emitted.current = value;
  }, [value]);

  /** The image's position in the document, or null if it has gone. */
  const imageIndex = () => {
    const quill = quillRef.current;
    const img = selected.current;
    if (!quill || !img) return null;
    const blot = Quill.find(img);
    return blot ? quill.getIndex(blot as Parameters<Quill["getIndex"]>[0]) : null;
  };

  const setWidth = (px: number) => {
    const quill = quillRef.current;
    const index = imageIndex();
    if (!quill || index === null) return;
    quill.formatText(index, 1, "width", String(Math.round(px)), Quill.sources.USER);
    // Height would fight the width once one of them is set by hand.
    quill.formatText(index, 1, "height", "", Quill.sources.USER);
    requestAnimationFrame(measure);
  };

  const alignImage = (align: "" | "center" | "right") => {
    const quill = quillRef.current;
    const index = imageIndex();
    if (!quill || index === null) return;
    quill.formatLine(index, 1, "align", align, Quill.sources.USER);
    requestAnimationFrame(measure);
  };

  const removeImage = () => {
    const quill = quillRef.current;
    const index = imageIndex();
    if (!quill || index === null) return;
    quill.deleteText(index, 1, Quill.sources.USER);
    selected.current = null;
    setBox(null);
  };

  /** Corner drag.

      Every step goes through Quill rather than straight onto the element.
      Setting the attribute by hand looks identical while the mouse is down,
      but the change then exists only in the DOM: Quill's history has no record
      of it, so one Ctrl+Z throws the picture back to its original size and
      Ctrl+Y cannot bring the new one back. History's own delay window merges
      the whole drag into a single undo step. */
  const startResize = (e: React.PointerEvent, corner: "nw" | "ne" | "sw" | "se") => {
    e.preventDefault();
    e.stopPropagation();
    const quill = quillRef.current;
    const img = selected.current;
    if (!quill || !img) return;

    const startX = e.clientX;
    const startWidth = img.getBoundingClientRect().width;
    const direction = corner === "nw" || corner === "sw" ? -1 : 1;
    const maxWidth = quill.root.clientWidth;
    let applied = Math.round(startWidth);

    const move = (ev: PointerEvent) => {
      const next = Math.round(
        Math.min(Math.max(startWidth + direction * (ev.clientX - startX), 48), maxWidth),
      );
      if (next === applied) return;
      applied = next;
      setWidth(next);
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const addImage = (file: File) => {
    const quill = quillRef.current;
    if (!quill) return;
    if (!file.type.startsWith("image/")) {
      setWarning(`${file.name} is not a picture.`);
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setWarning(
        `That picture is ${formatBytes(file.size)}. Please use one under ${formatBytes(
          MAX_IMAGE_BYTES,
        )}.`,
      );
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setWarning("");
      const range = quill.getSelection(true);
      quill.insertEmbed(range.index, "image", String(reader.result), Quill.sources.USER);
      quill.setSelection(range.index + 1, 0, Quill.sources.SILENT);
    };
    reader.onerror = () => setWarning(`Could not open ${file.name}.`);
    reader.readAsDataURL(file);
  };

  /** Widths offered as a share of the column, the way a word processor does. */
  const preset = (fraction: number) => {
    const quill = quillRef.current;
    if (!quill) return;
    setWidth((quill.root.clientWidth - 4) * fraction);
  };

  return (
    <div className="a-editorWrap">
      <div className="a-qlToolbar" ref={toolbarRef} />

      <div className="a-qlHost" ref={hostRef}>
        <div ref={containerRef} />

        {box && (
          <>
            <div className="a-imgFrame" style={{ ...box }}>
              {(["nw", "ne", "sw", "se"] as const).map((c) => (
                <span
                  key={c}
                  className="a-imgHandle"
                  data-corner={c}
                  onPointerDown={(e) => startResize(e, c)}
                />
              ))}
            </div>

            <div
              className="a-imgBar"
              style={{ left: box.left, top: box.top + box.height + 8 }}
              onMouseDown={(e) => e.preventDefault()}
            >
              <button type="button" onClick={() => preset(0.25)}>
                25%
              </button>
              <button type="button" onClick={() => preset(0.5)}>
                50%
              </button>
              <button type="button" onClick={() => preset(0.75)}>
                75%
              </button>
              <button type="button" onClick={() => preset(1)}>
                Full
              </button>
              <span className="a-imgBarSep" />
              <button type="button" title="Align left" onClick={() => alignImage("")}>
                Left
              </button>
              <button type="button" title="Centre" onClick={() => alignImage("center")}>
                Centre
              </button>
              <button type="button" title="Align right" onClick={() => alignImage("right")}>
                Right
              </button>
              <span className="a-imgBarSep" />
              <button type="button" data-danger onClick={removeImage}>
                Remove
              </button>
            </div>
          </>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) addImage(file);
          e.target.value = "";
        }}
      />

      {warning && (
        <p className="a-editorWarning" role="status">
          {warning}
        </p>
      )}
    </div>
  );
}
