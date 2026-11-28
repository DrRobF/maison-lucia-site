import Head from "next/head";
import BrandLogo from "./BrandLogo";
import PrimaryNav, { navLinks } from "./PrimaryNav";
import home from "../styles/Home.module.css";
import styles from "../styles/Coastal.module.css";
export default function CoastalLayout({ title, description, path, image, inquiryHref = "/#contact", children }) {
  const url = "https://www.maisonluciallc.com" + path;
  return <><Head><title>{title}</title><meta name="description" content={description} /><link rel="canonical" href={url} />
    <meta property="og:title" content={title} /><meta property="og:description" content={description} /><meta property="og:url" content={url} /><meta property="og:type" content="website" />
    {image && <><meta property="og:image" content={"https://www.maisonluciallc.com"+image} /><meta name="twitter:card" content="summary_large_image" /></>}
  </Head><main className={home.page}><header className={home.header}>
    <div className={home.brandWrap}><a href="/" className={home.brandName} aria-label="Maison Lucia home"><BrandLogo /></a><p className={home.tagline}>Private Entertaining &amp; Event Styling</p></div>
    <PrimaryNav /><a href={inquiryHref} className={home.headerButton}>Inquire</a>
  </header>{children}<footer className={styles.footer}><a href="/" aria-label="Maison Lucia home"><BrandLogo variant="footer" /></a>
    <nav aria-label="Footer">{navLinks.map(link => <a key={link.label} href={link.href}>{link.label}</a>)}<a href="https://atmos.maisonluciallc.com/">Atmos AI</a><a href="/portal/manage">Owner sign-in</a></nav>
    <p>© {new Date().getFullYear()} Maison Lucia LLC · Vero Beach, Treasure Coast, Palm Beach &amp; South Florida</p>
  </footer></main></>;
}
