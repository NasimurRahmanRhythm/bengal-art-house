"use client";

import { useRef, type ClipboardEvent, type KeyboardEvent } from "react";
import styles from "./OtpInput.module.css";

type OtpInputProps = {
  value: string;
  onChange: (value: string) => void;
  /** Called once every box is filled — the forms use it to submit. */
  onComplete?: (value: string) => void;
  length?: number;
  disabled?: boolean;
  autoFocus?: boolean;
  invalid?: boolean;
  className?: string;
};

/**
 * A one-time code entered as one digit per box.
 *
 * The boxes are separate inputs, but the value is a single string held by the
 * parent, so the forms keep working with `code` exactly as they did with one
 * text field. Typing moves forward, Backspace moves back, the arrow keys move
 * between boxes, and a pasted or autofilled code (iOS and Android offer the
 * emailed code above the keyboard) is spread across all of them at once.
 */
export default function OtpInput({
  value,
  onChange,
  onComplete,
  length = 6,
  disabled,
  autoFocus,
  invalid,
  className,
}: OtpInputProps) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  // The value as of the last keystroke. focus() runs before the parent has
  // re-rendered with the new value, so onFocus cannot trust the prop.
  const latest = useRef(value);
  latest.current = value;
  const digits = Array.from({ length }, (_, i) => value[i] ?? "");

  const focus = (i: number) => {
    const el = refs.current[Math.max(0, Math.min(length - 1, i))];
    el?.focus();
    el?.select();
  };

  const commit = (next: string) => {
    const clean = next.replace(/\D/g, "").slice(0, length);
    latest.current = clean;
    onChange(clean);
    if (clean.length === length) onComplete?.(clean);
  };

  /** Writes `typed` starting at box `i`. One digit is ordinary typing; more
      than one is an autofill or a paste landing in a single box. */
  const fill = (i: number, typed: string) => {
    const incoming = typed.replace(/\D/g, "");
    if (!incoming) return;
    const chars = digits.slice();
    // A full-length code replaces everything, wherever it landed.
    const start = incoming.length >= length ? 0 : i;
    for (let k = 0; k < incoming.length && start + k < length; k++) {
      chars[start + k] = incoming[k];
    }
    // Keep the value contiguous: a gap left earlier ends the code there.
    const firstGap = chars.indexOf("");
    const next = (firstGap === -1 ? chars : chars.slice(0, firstGap)).join("");
    commit(next);
    focus(Math.min(start + incoming.length, length - 1));
  };

  const onKeyDown = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (digits[i]) {
        commit(value.slice(0, i));
      } else if (i > 0) {
        commit(value.slice(0, i - 1));
        focus(i - 1);
      }
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      focus(i - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      focus(i + 1);
    }
  };

  const onPaste = (i: number, e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    fill(i, e.clipboardData.getData("text"));
  };

  return (
    <div
      className={`${styles.group} ${className ?? ""}`}
      role="group"
      aria-label={`${length}-digit code`}
      data-invalid={invalid || undefined}
      style={{ gridTemplateColumns: `repeat(${length}, minmax(0, 1fr))` }}
    >
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          className={styles.box}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          // Only the first box asks for autofill; the browser then hands it
          // the whole code, which fill() spreads across the rest.
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={i === 0 ? length : 1}
          aria-label={`Digit ${i + 1} of ${length}`}
          autoFocus={autoFocus && i === 0}
          disabled={disabled}
          value={d}
          // Only the next empty box (or the last) takes a click — typing into
          // box 4 while box 2 is empty would leave a hole in the code.
          onFocus={(e) => {
            const target = Math.min(latest.current.length, length - 1);
            if (i > target) focus(target);
            else e.target.select();
          }}
          onChange={(e) => {
            const raw = e.target.value;
            // Typing into a box that already holds a digit gives two
            // characters (old + new, either order, depending on the caret).
            // Keep the new one; anything longer is a paste or autofill.
            if (d && raw.length === 2) fill(i, raw[0] === d ? raw[1] : raw[0]);
            else fill(i, raw);
          }}
          onKeyDown={(e) => onKeyDown(i, e)}
          onPaste={(e) => onPaste(i, e)}
        />
      ))}
    </div>
  );
}
