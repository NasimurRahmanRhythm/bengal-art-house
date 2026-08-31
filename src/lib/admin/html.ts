// The blog editor writes HTML, so something has to decide which HTML is
// allowed. Everything here is deliberately small: an allow-list, an unwrapper
// for tags that carry no meaning, and two text helpers for excerpts and
// reading time.
//
// The admin is trusted, so this is not a security boundary against them — it
// is a boundary against whatever they paste in from Word, Google Docs or a
// news site, which arrives full of style attributes, class names and the
// occasional script tag.
//
// It is also the contract with Quill: the allow-lists below are exactly what
// the editor's toolbar can produce, so nothing a writer does is silently
// thrown away on save. The one thing that is deliberately *not* preserved
// verbatim is Quill's list markup — see normaliseLists.
const ALLOWED = new Set([
  "p",
  "br",
  "h1",
  "h2",
  "h3",
  "h4",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "strike",
  "del",
  "mark",
  "blockquote",
  "ul",
  "ol",
  "li",
  "a",
  "img",
  "figure",
  "figcaption",
  "hr",
  "code",
  "pre",
  "span",
  "sub",
  "sup",
]);

// Tags that are dropped along with everything inside them. The rest of the
// unknown tags are unwrapped instead, so pasted text survives its wrapper.
const DROPPED = new Set([
  "script",
  "style",
  "iframe",
  "object",
  "embed",
  "form",
  "input",
  "button",
  "svg",
  "math",
  "link",
  "meta",
  "noscript",
]);

const ATTRS: Record<string, string[]> = {
  a: ["href", "title", "style", "class"],
  img: ["src", "alt", "width", "height", "style", "class"],
  li: ["data-list", "class", "style"],
  ol: ["class", "style"],
  ul: ["class", "style"],
  pre: ["class", "style"],
  span: ["style", "class"],
  p: ["style", "class"],
  h1: ["style", "class"],
  h2: ["style", "class"],
  h3: ["style", "class"],
  h4: ["style", "class"],
  blockquote: ["style", "class"],
};

// The only CSS the toolbar can produce. Anything else a paste drags in — the
// fonts, margins and background images Word attaches to every paragraph — is
// dropped, so pasted text takes on the site's typography instead of fighting it.
const STYLE_PROPS = new Set([
  "color",
  "background-color",
  "text-align",
  "font-family",
  "font-size",
  "font-weight",
  "font-style",
  "text-decoration",
  "width",
  "height",
]);

// Quill's own hooks: ql-indent-N for indented blocks, ql-syntax for code
// blocks. Everything else in a class attribute is somebody else's stylesheet.
const CLASS_ALLOWED = /^ql-(indent-[1-8]|syntax|align-(center|right|justify))$/;

function sanitizeStyle(value: string): string {
  return value
    .split(";")
    .map((decl) => {
      const at = decl.indexOf(":");
      if (at === -1) return "";
      const prop = decl.slice(0, at).trim().toLowerCase();
      const val = decl.slice(at + 1).trim();
      if (!STYLE_PROPS.has(prop)) return "";
      if (/url\(|expression|javascript:|@import/i.test(val)) return "";
      return `${prop}: ${val}`;
    })
    .filter(Boolean)
    .join("; ");
}

function safeUrl(value: string, allowData: boolean): string | null {
  const v = value.trim();
  if (!v) return null;
  // Anything with a scheme has to be one we recognise; scheme-less values are
  // relative paths and fine. javascript: and vbscript: are the point of this.
  const scheme = /^([a-z][a-z0-9+.-]*):/i.exec(v)?.[1]?.toLowerCase();
  if (!scheme) return v;
  if (scheme === "http" || scheme === "https" || scheme === "mailto" || scheme === "tel") return v;
  if (allowData && scheme === "data" && /^data:image\/(png|jpe?g|gif|webp|avif);base64,/i.test(v))
    return v;
  return null;
}

/* Quill 2 writes every list as <ol><li data-list="bullet"> and draws the
   marker from a <span class="ql-ui"> it injects into each item. That span is
   editor furniture — it carries contenteditable="false" and a click handler —
   so it cannot be stored, and without it the bullets vanish.

   Rather than keep Quill's markup and ship Quill's stylesheet everywhere the
   post is ever rendered, the lists are turned back into ordinary <ul> and <ol>
   on the way out. The saved post is then plain HTML that any page can render,
   and Quill's clipboard turns it back into its own format when the post is
   reopened for editing. */
function normaliseLists(doc: Document) {
  for (const list of Array.from(doc.body.querySelectorAll("ol, ul"))) {
    const items = Array.from(list.children).filter((c) => c.tagName === "LI");
    if (!items.some((li) => li.hasAttribute("data-list"))) continue;

    // One Quill container can hold both kinds of item, so consecutive runs of
    // the same kind become one real list each.
    const runs: { tag: string; items: Element[] }[] = [];
    for (const li of items) {
      const tag = li.getAttribute("data-list") === "ordered" ? "ol" : "ul";
      li.removeAttribute("data-list");
      const last = runs[runs.length - 1];
      if (last && last.tag === tag) last.items.push(li);
      else runs.push({ tag, items: [li] });
    }

    const replacement = doc.createDocumentFragment();
    for (const run of runs) {
      const el = doc.createElement(run.tag);
      run.items.forEach((li) => el.appendChild(li));
      replacement.appendChild(el);
    }
    list.replaceWith(replacement);
  }
}

/** Strip everything not on the allow-list. Browser-only — uses DOMParser. */
export function sanitizeHtml(html: string): string {
  if (typeof window === "undefined") return html;

  const doc = new DOMParser().parseFromString(`<body>${html}</body>`, "text/html");

  const walk = (node: Element) => {
    // Copied up front: the list is live and the loop reparents children.
    for (const el of Array.from(node.children)) {
      const tag = el.tagName.toLowerCase();

      // `ql-ui` is the clickable marker Quill injects into every list item.
      // It belongs to the editor, not to the post.
      if (DROPPED.has(tag) || el.classList.contains("ql-ui")) {
        el.remove();
        continue;
      }

      walk(el);

      if (!ALLOWED.has(tag)) {
        // A div, span or font adds nothing here — keep the words, drop the box.
        const parent = el.parentNode;
        if (!parent) continue;
        // Block-level wrappers become paragraphs so the text does not run on.
        if (tag === "div" || tag === "section" || tag === "article") {
          const p = doc.createElement("p");
          while (el.firstChild) p.appendChild(el.firstChild);
          parent.replaceChild(p, el);
        } else {
          while (el.firstChild) parent.insertBefore(el.firstChild, el);
          el.remove();
        }
        continue;
      }

      const keep = ATTRS[tag] ?? [];
      for (const attr of Array.from(el.attributes)) {
        const name = attr.name.toLowerCase();
        if (!keep.includes(name)) {
          el.removeAttribute(attr.name);
          continue;
        }
        if (name === "href" || name === "src") {
          const url = safeUrl(attr.value, tag === "img");
          if (url === null) el.removeAttribute(attr.name);
          else el.setAttribute(attr.name, url);
        }
        if (name === "style") {
          const style = sanitizeStyle(attr.value);
          if (style) el.setAttribute("style", style);
          else el.removeAttribute("style");
        }
        if (name === "class") {
          const kept = attr.value.split(/\s+/).filter((c) => CLASS_ALLOWED.test(c));
          if (kept.length) el.setAttribute("class", kept.join(" "));
          else el.removeAttribute("class");
        }
      }

      if (tag === "a" && el.getAttribute("href")) {
        el.setAttribute("target", "_blank");
        el.setAttribute("rel", "noreferrer noopener");
      }
      if (tag === "img" && !el.getAttribute("src")) el.remove();

      if (tag === "span" && el.attributes.length === 0) {
        const parent = el.parentNode;
        if (parent) {
          while (el.firstChild) parent.insertBefore(el.firstChild, el);
          el.remove();
        }
      }
    }
  };

  walk(doc.body);
  normaliseLists(doc);
  return doc.body.innerHTML;
}

/** Plain text, for excerpts and word counts. Works on the server too. */
export function htmlToText(html: string): string {
  return html
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, "")
    .replace(/<\/(p|h2|h3|h4|li|blockquote|figcaption|div)>/gi, " ")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

export function wordCount(html: string): number {
  const text = htmlToText(html);
  return text ? text.split(" ").length : 0;
}

export function readingTime(html: string): string {
  const mins = Math.max(1, Math.round(wordCount(html) / 220));
  return `${mins} min read`;
}

/** Empty means "no text and no image" — a lone <p><br></p> still counts as empty. */
export function isBlank(html: string): boolean {
  return !htmlToText(html) && !/<(img|hr)\b/i.test(html);
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
