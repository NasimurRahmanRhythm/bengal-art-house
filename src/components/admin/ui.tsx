"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ChevronIcon, CloseIcon, TrashIcon } from "./Icons";

/* Small primitives shared by every admin screen. Kept in one file because they
   are each a few lines and always used together. */

export function Field({
  label,
  optional,
  hint,
  error,
  children,
}: {
  label: string;
  optional?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="a-field">
      <label className="a-label">
        {label}
        {optional && <span className="a-optional">optional</span>}
      </label>
      {children}
      {error ? <span className="a-error">{error}</span> : hint ? <span className="a-hint">{hint}</span> : null}
    </div>
  );
}

export function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="a-switch">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="a-switchTrack" />
      <span>{label}</span>
    </label>
  );
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="a-seg" role="group">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          className="a-segBtn"
          aria-pressed={value === o.value}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Badge({
  tone,
  children,
  dot,
}: {
  tone: "good" | "muted" | "warn" | "accent";
  children: React.ReactNode;
  dot?: boolean;
}) {
  return (
    <span className="a-badge" data-tone={tone}>
      {dot && <span className="a-dot" />}
      {children}
    </span>
  );
}

/** Optional detail behind a disclosure, so the default form stays short. */
export function More({
  label,
  children,
  defaultOpen = false,
}: {
  label: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  return (
    <div className="a-more">
      <button
        type="button"
        className="a-moreToggle"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((v) => !v)}
      >
        <ChevronIcon size={13} />
        {label}
      </button>
      {open && (
        <div id={id} className="a-grid" style={{ marginTop: 15 }}>
          {children}
        </div>
      )}
    </div>
  );
}

/** Two-step delete — no modal, but not a single misclick either. */
export function ConfirmDelete({
  onConfirm,
  label = "Delete",
  size = "sm",
}: {
  onConfirm: () => void;
  label?: string;
  size?: "sm" | "md";
}) {
  const [armed, setArmed] = useState(false);

  if (!armed) {
    return (
      <button
        type="button"
        className="a-btn"
        data-variant="danger"
        data-size={size}
        onClick={() => setArmed(true)}
        aria-label={label}
      >
        <TrashIcon size={14} />
        {size === "md" && label}
      </button>
    );
  }

  return (
    <span style={{ display: "inline-flex", gap: 5 }}>
      <button
        type="button"
        className="a-btn"
        data-variant="danger"
        data-size={size}
        onClick={onConfirm}
      >
        Confirm
      </button>
      <button type="button" className="a-btn" data-size={size} onClick={() => setArmed(false)}>
        Cancel
      </button>
    </span>
  );
}

export function Empty({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="a-empty">
      <p className="a-emptyTitle">{title}</p>
      {children}
    </div>
  );
}

/** Repeatable label/value pairs — used for artist facts. */
export function FactRows({
  rows,
  onChange,
  suggestions = [],
}: {
  rows: { label: string; value: string }[];
  onChange: (rows: { label: string; value: string }[]) => void;
  suggestions?: string[];
}) {
  const listId = useId();
  const set = (i: number, patch: Partial<{ label: string; value: string }>) =>
    onChange(rows.map((r, j) => (j === i ? { ...r, ...patch } : r)));

  return (
    <div className="a-repeat">
      <datalist id={listId}>
        {suggestions.map((s) => (
          <option key={s} value={s} />
        ))}
      </datalist>

      {rows.map((r, i) => (
        <div className="a-repeatRow" key={i}>
          <input
            className="a-input"
            list={listId}
            placeholder="Label"
            value={r.label}
            onChange={(e) => set(i, { label: e.target.value })}
          />
          <input
            className="a-input"
            placeholder="Value"
            value={r.value}
            onChange={(e) => set(i, { value: e.target.value })}
          />
          <button
            type="button"
            className="a-btn a-btnIcon"
            data-variant="danger"
            onClick={() => onChange(rows.filter((_, j) => j !== i))}
            aria-label={`Remove row ${i + 1}`}
          >
            <TrashIcon size={14} />
          </button>
        </div>
      ))}

      <div>
        <button
          type="button"
          className="a-btn"
          data-size="sm"
          onClick={() => onChange([...rows, { label: "", value: "" }])}
        >
          Add row
        </button>
      </div>
    </div>
  );
}

/** Overlay panel. Rendered inline rather than through a portal so it stays
    inside `.a-shell` and inherits the admin palette variables from it. */
export function Modal({
  open,
  onClose,
  title,
  subtitle,
  size = "md",
  footer,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: React.ReactNode;
  size?: "md" | "lg";
  footer?: React.ReactNode;
  children: React.ReactNode;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const labelId = useId();

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);

    // Stop the page behind from scrolling under the overlay, and put focus in
    // the panel so Tab and Escape land somewhere sensible.
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="a-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        className="a-modal"
        data-size={size}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelId}
        tabIndex={-1}
        ref={panel}
      >
        <header className="a-modalHead">
          <div style={{ minWidth: 0 }}>
            <h2 className="a-modalTitle" id={labelId}>
              {title}
            </h2>
            {subtitle && <div className="a-modalSub">{subtitle}</div>}
          </div>
          <button type="button" className="a-btn a-btnIcon" onClick={onClose} aria-label="Close">
            <CloseIcon />
          </button>
        </header>

        <div className="a-modalBody">{children}</div>

        {footer && <footer className="a-modalFoot">{footer}</footer>}
      </div>
    </div>
  );
}

/** Label/value row used inside the order detail panel. */
export function DetailRow({
  label,
  children,
  mono,
}: {
  label: string;
  children: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="a-detailRow">
      <span className="a-detailLabel">{label}</span>
      <span className="a-detailValue" data-mono={mono || undefined}>
        {children}
      </span>
    </div>
  );
}
