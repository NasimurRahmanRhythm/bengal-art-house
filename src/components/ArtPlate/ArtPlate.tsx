import { useId } from "react";
import styles from "./ArtPlate.module.css";

const C = {
  marble: "#efeae0",
  marbleDim: "#e3ddcf",
  ink: "#16150f",
  oxide: "#c1420f",
  oxideDark: "#7e3521",
  patina: "#6e7f5c",
  stone: "#9c9284",
};

type PlateProps = {
  variant: number;
  className?: string;
};

export default function ArtPlate({ variant, className }: PlateProps) {
  const uid = useId().replace(/:/g, "");
  const v = ((variant % 9) + 9) % 9;

  return (
    <svg
      viewBox="0 0 300 375"
      preserveAspectRatio="xMidYMid slice"
      className={`${styles.plate} ${className ?? ""}`}
      role="img"
      aria-label="Abstract plate standing in for the artwork image"
    >
      <defs>
        <linearGradient id={`g-${uid}`} x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.18" />
        </linearGradient>
      </defs>

      {v === 0 && (
        <>
          <rect width="300" height="375" fill={C.marbleDim} />
          <path
            className={styles.accent}
            d="M118 40h64l-8 92 34 96-26 108h-70l24-108-30-96z"
            fill={C.oxide}
          />
          <path d="M150 40v335" stroke={C.oxideDark} strokeWidth="2" opacity="0.5" />
        </>
      )}

      {v === 1 && (
        <>
          <rect width="300" height="375" fill={C.oxideDark} />
          <path
            className={styles.accent}
            d="M42 300C88 176 148 96 258 62c-26 92-72 168-130 214-24 19-52 27-86 24z"
            fill={C.oxide}
          />
          <path
            d="M78 288C118 200 168 138 244 96"
            stroke={C.marble}
            strokeWidth="1.5"
            fill="none"
            opacity="0.55"
          />
        </>
      )}

      {v === 2 && (
        <>
          <rect width="300" height="375" fill={C.marble} />
          <path className={styles.accent} d="M0 232h300v26H0z" fill={C.patina} opacity="0.34" />
          <path d="M0 268h300v14H0z" fill={C.patina} opacity="0.24" />
          <path d="M0 292h300v9H0z" fill={C.patina} opacity="0.16" />
          <path d="M52 232 132 96l58 136z" fill={C.patina} opacity="0.55" />
          <path d="M158 232 214 130l50 102z" fill={C.stone} opacity="0.5" />
          <circle cx="228" cy="82" r="20" fill={C.oxide} opacity="0.7" />
        </>
      )}

      {v === 3 && (
        <>
          <rect width="300" height="375" fill={C.stone} />
          <path d="M64 375 84 84h132l20 291z" fill={C.ink} opacity="0.82" />
          <circle className={styles.accent} cx="150" cy="176" r="42" fill={C.marble} />
          <circle cx="150" cy="176" r="15" fill={C.ink} />
        </>
      )}

      {v === 4 && (
        <>
          <rect width="300" height="375" fill={C.marbleDim} />
          <path
            className={styles.accent}
            d="M96 320c-14-70 6-118 44-152 30-27 66-24 78 6 12 32-16 52-42 66-30 16-44 40-40 80z"
            fill={C.marble}
            stroke={C.ink}
            strokeOpacity="0.45"
            strokeWidth="2"
          />
          <path d="M72 320h160" stroke={C.ink} strokeWidth="2" strokeOpacity="0.35" />
        </>
      )}

      {v === 5 && (
        <>
          <rect width="300" height="375" fill={C.marble} />
          <g fill="none" stroke={C.ink} strokeOpacity="0.62" strokeWidth="1.6">
            <path className={styles.accent} d="M78 314 150 62l72 252z" />
            <path d="M104 232h92" />
            <path d="M150 62v252" />
            <path d="M60 340h180" />
          </g>
          <circle cx="150" cy="62" r="5" fill={C.oxide} />
        </>
      )}

      {v === 6 && (
        <>
          <rect width="300" height="375" fill={C.oxide} />
          <path
            className={styles.accent}
            d="M60 330 168 44l76 60-58 226z"
            fill={C.marble}
            opacity="0.94"
          />
          <path d="M168 44 186 330" stroke={C.oxideDark} strokeWidth="2" opacity="0.65" />
        </>
      )}

      {v === 7 && (
        <>
          <rect width="300" height="375" fill={C.marbleDim} />
          <g fill={C.stone}>
            <rect className={styles.accent} x="42" y="252" width="216" height="66" />
            <rect x="72" y="192" width="156" height="60" fill={C.ink} opacity="0.72" />
            <rect x="104" y="134" width="92" height="58" />
            <rect x="132" y="86" width="36" height="48" fill={C.oxide} />
          </g>
        </>
      )}

      {v === 8 && (
        <>
          <rect width="300" height="375" fill={C.patina} />
          <path
            className={styles.accent}
            d="M112 288c-6-64 4-104 26-136 16-24 44-22 52 2 8 26-10 44-26 62-18 20-24 42-20 72z"
            fill={C.oxideDark}
          />
          <rect x="88" y="288" width="118" height="20" fill={C.ink} opacity="0.6" />
        </>
      )}

      <rect width="300" height="375" fill={`url(#g-${uid})`} />
    </svg>
  );
}
