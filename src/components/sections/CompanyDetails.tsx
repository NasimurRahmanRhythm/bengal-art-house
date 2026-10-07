import Link from "next/link";
import { SITE } from "@/data/site";
import type { GoverningMember } from "@/data/gallery";
import styles from "./CompanyDetails.module.css";

/** The registration facts SSLCommerz asks a merchant site to publish on its
    About page: who the business is, where it is registered, its trade licence,
    and who runs it. */
export default function CompanyDetails({ members }: { members: GoverningMember[] }) {
  const rows: { label: string; value: React.ReactNode }[] = [
    { label: "Business name", value: SITE.name },
    { label: "Registered address", value: SITE.address },
    ...(SITE.tradeLicense ? [{ label: "Trade licence no.", value: SITE.tradeLicense }] : []),
    { label: "Telephone", value: <a href={`tel:${SITE.phoneHref}`}>{SITE.phone}</a> },
  ];

  return (
    <div className={styles.grid}>
      <dl className={styles.list}>
        {rows.map((r) => (
          <div key={r.label} className={styles.row}>
            <dt>{r.label}</dt>
            <dd>{r.value}</dd>
          </div>
        ))}
      </dl>

      <div>
        <span className={styles.label}>Management</span>
        {members.length > 0 ? (
          <ul className={styles.members}>
            {members.map((m) => (
              <li key={m.id}>
                <span className={styles.name}>{m.name}</span>
                {m.role && <span className={styles.role}>{m.role}</span>}
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.role}>The governing body will be listed here shortly.</p>
        )}
        <Link href="/governing-body" className={styles.more}>
          Governing body →
        </Link>
      </div>
    </div>
  );
}
