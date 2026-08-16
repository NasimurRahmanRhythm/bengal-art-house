"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";
import { NAV, SITE, SOCIALS } from "@/data/site";
import { useCart } from "@/context/CartContext";
import { CartIcon, ChevronIcon, SOCIAL_ICONS, UserIcon } from "@/components/Icons";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const pathname = usePathname();
  const { count, pulse, openCart } = useCart();

  const header = useRef<HTMLElement>(null);
  const badge = useRef<HTMLSpanElement>(null);
  const progress = useRef<HTMLSpanElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const [openDrop, setOpenDrop] = useState<string | null>(null);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  useGSAP(
    () => {
      const el = header.current;
      if (!el) return;

      if (!prefersReducedMotion()) {
        gsap.from(el.querySelectorAll("[data-nav-item]"), {
          y: -18,
          opacity: 0,
          duration: 0.8,
          stagger: 0.05,
          delay: 0.15,
          ease: "power3.out",
        });
      }

      ScrollTrigger.create({
        start: "top -60",
        end: "max",
        onToggle: (self) => el.classList.toggle(styles.condensed, self.isActive),
      });

      if (progress.current) {
        gsap.fromTo(
          progress.current,
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: "none",
            scrollTrigger: { start: 0, end: "max", scrub: 0.3 },
          }
        );
      }
    },
    { scope: header }
  );

  useEffect(() => {
    if (!pulse || !badge.current || prefersReducedMotion()) return;
    gsap.fromTo(
      badge.current,
      { scale: 1 },
      { scale: 1.75, duration: 0.22, yoyo: true, repeat: 1, ease: "back.out(3)" }
    );
  }, [pulse]);

  useGSAP(
    () => {
      const el = panel.current;
      if (!el) return;
      const items = el.querySelectorAll("[data-panel-item]");

      if (menuOpen) {
        gsap
          .timeline()
          .set(el, { pointerEvents: "auto" })
          .fromTo(
            el,
            { clipPath: "inset(0% 0% 100% 0%)" },
            { clipPath: "inset(0% 0% 0% 0%)", duration: 0.6, ease: "power4.inOut" }
          )
          .fromTo(
            items,
            { y: 34, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.55, stagger: 0.055, ease: "power3.out" },
            "-=0.28"
          );
      } else {
        gsap.to(el, {
          clipPath: "inset(0% 0% 100% 0%)",
          duration: 0.45,
          ease: "power3.inOut",
          onComplete: () => gsap.set(el, { pointerEvents: "none" }),
        });
      }
    },
    { dependencies: [menuOpen] }
  );

  useEffect(() => {
    setMenuOpen(false);
    setOpenDrop(null);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setMenuOpen(false);
      setOpenDrop(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header ref={header} className={styles.header}>
      <div className={styles.utility}>
        <div className={`wrap ${styles.utilityInner}`}>
          <span className={styles.utilityText}>{SITE.address}</span>
          <div className={styles.utilityRight}>
            <div className={styles.socials}>
              {SOCIALS.map((s) => {
                const Icon = SOCIAL_ICONS[s.icon];
                return (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={s.label}
                    className={styles.socialLink}
                  >
                    <Icon size={13} />
                  </a>
                );
              })}
            </div>
            <Link href="/contact" className={styles.members}>
              <UserIcon size={13} />
              Members
            </Link>
          </div>
        </div>
      </div>

      <div className={`wrap ${styles.bar}`}>
        <Link href="/" className={styles.brand} data-nav-item aria-label={`${SITE.name} — home`}>
          <span className={styles.brandMark}>
            <Image
              src="/images/sculpture.jpg"
              alt=""
              width={80}
              height={80}
              priority
              className={styles.brandImg}
            />
          </span>
          <span className={styles.brandText}>
            Bengal
            <span className={styles.brandName}>Art House</span>
          </span>
        </Link>

        <nav className={styles.nav} aria-label="Primary">
          <ul className={styles.navList}>
            {NAV.map((item) => (
              <li
                key={item.label}
                className={item.children ? styles.hasDrop : undefined}
                onMouseEnter={() => item.children && setOpenDrop(item.label)}
                onMouseLeave={() => item.children && setOpenDrop(null)}
              >
                <Link
                  href={item.href}
                  data-nav-item
                  className={`${styles.navLink} ${isActive(item.href) ? styles.navLinkActive : ""}`}
                  aria-expanded={item.children ? openDrop === item.label : undefined}
                >
                  <span className={styles.navLabel} data-text={item.label}>
                    {item.label}
                  </span>
                  {item.children && <ChevronIcon size={11} className={styles.chevron} />}
                </Link>

                {item.children && (
                  <div
                    className={`${styles.drop} ${openDrop === item.label ? styles.dropOpen : ""}`}
                  >
                    {item.children.map((child) => (
                      <Link key={child.label} href={child.href} className={styles.dropLink}>
                        <span className={styles.dropTitle}>{child.label}</span>
                        <span className={styles.dropNote}>{child.note}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.actions}>
          <button
            type="button"
            onClick={openCart}
            className={styles.cartBtn}
            data-nav-item
            aria-label={`Open cart, ${count} ${count === 1 ? "item" : "items"}`}
          >
            <CartIcon size={15} />
            <span className={styles.cartLabel}>Cart</span>
            <span ref={badge} className={styles.cartCount}>
              {count}
            </span>
          </button>

          <button
            type="button"
            className={`${styles.burger} ${menuOpen ? styles.burgerOpen : ""}`}
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            <span />
            <span />
          </button>
        </div>
      </div>

      <span ref={progress} className={styles.progress} aria-hidden="true" />

      <div ref={panel} className={styles.panel} id="mobile-menu">
        <div className={styles.panelInner}>
          {NAV.map((item, i) => (
            <div key={item.label} data-panel-item className={styles.panelRow}>
              <Link href={item.href} className={styles.panelLink}>
                <span className={styles.panelIndex}>{String(i + 1).padStart(2, "0")}</span>
                {item.label}
              </Link>
              {item.children && (
                <div className={styles.panelSub}>
                  {item.children.map((child) => (
                    <Link key={child.label} href={child.href} className={styles.panelSubLink}>
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}

          <div data-panel-item className={styles.panelFoot}>
            <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
            <a href={`tel:${SITE.phoneHref}`}>{SITE.phone}</a>
            <div className={styles.panelSocials}>
              {SOCIALS.map((s) => {
                const Icon = SOCIAL_ICONS[s.icon];
                return (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={s.label}
                  >
                    <Icon size={16} />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
