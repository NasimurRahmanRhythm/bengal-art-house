"use client";

import { useState, type CSSProperties, type FormEvent } from "react";
import { prefersReducedMotion } from "@/lib/motion";
import { SITE } from "@/data/site";
import { ArrowIcon } from "@/components/Icons";
import Reveal from "@/components/motion/Reveal";
import styles from "./Sections.module.css";

const SUBJECTS = [
  "Private viewing",
  "Acquisition enquiry",
  "Conservation & restoration",
  "Public art commission",
  "Press & research",
];

const DETAILS = [
  { label: "Gallery", value: SITE.address },
  { label: "Email", value: SITE.email, href: `mailto:${SITE.email}` },
  { label: "Telephone", value: SITE.phone, href: `tel:${SITE.phoneHref}` },
  { label: "Opening hours", value: "Tue – Sat, 11:00 – 19:00" },
];

const fieldDelay = (i: number) => ({ "--i": i }) as CSSProperties;

export default function ContactBlock() {
  const [sent, setSent] = useState(false);
  const [exiting, setExiting] = useState(false);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (prefersReducedMotion()) {
      setSent(true);
      return;
    }
    setExiting(true);
    window.setTimeout(() => setSent(true), 450);
  };

  return (
    <div className={styles.contactGrid}>
      <Reveal className={styles.contactDetails} stagger={0.09}>
        {DETAILS.map((d) => (
          <div key={d.label} className={styles.detailRow}>
            <span className={styles.detailLabel}>{d.label}</span>
            {d.href ? (
              <a href={d.href} className={styles.detailValue}>
                {d.value}
              </a>
            ) : (
              <span className={styles.detailValue}>{d.value}</span>
            )}
          </div>
        ))}
        <p className={styles.detailNote}>
          Private viewings are arranged by appointment. For works held in public collections, please
          note the site and title in your message.
        </p>
      </Reveal>

      <div className={styles.formWrap}>
        {sent ? (
          <div className={styles.sentNote} role="status">
            <span className={styles.sentMark}>✓</span>
            <h3>Thank you — your note is with us.</h3>
            <p>
              A member of the gallery will reply within two working days. For anything urgent, call{" "}
              <a href={`tel:${SITE.phoneHref}`}>{SITE.phone}</a>.
            </p>
            <button type="button" className={styles.sentReset} onClick={() => setSent(false)}>
              Send another enquiry
            </button>
          </div>
        ) : (
          <form
            className={`${styles.form} ${exiting ? styles.formExiting : ""}`}
            onSubmit={onSubmit}
          >
            <div className={styles.fieldRow}>
              <label className={styles.field} data-field style={fieldDelay(0)}>
                <span>Your name</span>
                <input type="text" name="name" required autoComplete="name" />
              </label>
              <label className={styles.field} data-field style={fieldDelay(0)}>
                <span>Email</span>
                <input type="email" name="email" required autoComplete="email" />
              </label>
            </div>

            <label className={styles.field} data-field style={fieldDelay(1)}>
              <span>Subject</span>
              <select name="subject" defaultValue={SUBJECTS[0]}>
                {SUBJECTS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>

            <label className={styles.field} data-field style={fieldDelay(2)}>
              <span>Message</span>
              <textarea name="message" rows={5} required />
            </label>

            <button
              type="submit"
              className={styles.submit}
              data-field
              data-cursor="link"
              style={fieldDelay(3)}
            >
              Send enquiry <ArrowIcon size={15} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
