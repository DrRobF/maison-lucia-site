import styles from "../styles/BrandLogo.module.css";

export default function BrandLogo({ variant = "header", decorative = false }) {
  const monogram = variant === "watermark";
  return (
    <svg
      className={`${styles.logo} ${styles[variant]}`}
      viewBox={monogram ? "600 210 380 380" : "350 210 830 565"}
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : "Maison Lucia"}
      aria-hidden={decorative ? "true" : undefined}
      focusable="false"
    >
      <image href="/maison-lucia-logo.jpg" width="1536" height="1024" />
    </svg>
  );
}
