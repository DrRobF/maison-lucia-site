import Head from "next/head";
import styles from "../styles/Home.module.css";

const floralServices = [
  "Centerpieces",
  "Bud vases",
  "Accent florals",
  "Welcome table florals",
  "Sweetheart table styling",
  "Cake flowers",
  "Floral details for intimate events",
  "Seasonal floral styling",
];

const floralImages = [
  {
    src: "/white lace.webp",
    alt: "White floral styling with lace details for a Palm Beach celebration",
  },
  {
    src: "/lillyofthevalley.webp",
    alt: "Soft lily of the valley floral detail for an intimate South Florida event",
  },
  {
    src: "/purplepeachpinkwhite.webp",
    alt: "Purple peach pink and white floral styling for a refined celebration",
  },
  {
    src: "/italian-gerbera-tomato.webp",
    alt: "Warm Italian gerbera floral styling for a South Florida tablescape",
  },
];

const floralStructuredData = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Floral Styling & Decor in South Florida",
  provider: {
    "@type": "LocalBusiness",
    name: "Maison Lucia LLC",
    url: "https://www.maisonluciallc.com",
  },
  areaServed: [
    "West Palm Beach",
    "Palm Beach",
    "Wellington",
    "Boca Raton",
    "Miami",
    "Fort Lauderdale",
    "South Florida",
  ],
  serviceType: "Floral styling and event decor",
};

export default function FloralStyling() {
  return (
    <>
      <Head>
        <title>Floral Styling &amp; Decor in South Florida | Maison Lucia</title>
        <meta
          name="description"
          content="Maison Lucia creates curated floral styling, centerpieces, bud vases, welcome table florals, sweetheart tables, cake flowers, and refined botanical details for weddings, private dinners, corporate events, and celebrations throughout West Palm Beach, Palm Beach, Wellington, Boca Raton, Miami, and South Florida."
        />
        <meta property="og:title" content="Floral Styling & Decor in South Florida | Maison Lucia" />
        <meta property="og:description" content="Curated floral styling, centerpieces, bud vases, welcome table florals, sweetheart tables, cake flowers, and refined botanical details for South Florida celebrations." />
        <meta property="og:url" content="https://www.maisonluciallc.com/floral-styling" />
        <meta property="og:type" content="website" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(floralStructuredData) }} />
      </Head>

      <main className={styles.page}>
        <header className={styles.header}>
          <div className={styles.brandWrap}>
            <a href="/" className={styles.brandName}>Maison Lucia</a>
            <p className={styles.tagline}>South Florida Event Styling</p>
          </div>
          <nav aria-label="Primary">
            <ul className={styles.menuList}>
              <li><a href="/#services">Services</a></li>
              <li><a href="/floral-styling">Floral Styling</a></li>
              <li><a href="/tablescapes">Tablescapes</a></li>
              <li><a href="/#gallery">Gallery</a></li>
              <li><a href="/#contact">Contact</a></li>
            </ul>
          </nav>
          <a href="/#contact" className={styles.headerButton}>Inquire</a>
        </header>

        <section className={styles.serviceHero}>
          <div className={styles.serviceHeroText}>
            <p className={styles.kicker}>CURATED BOTANICAL DETAILS</p>
            <h1>Floral Styling &amp; Decor</h1>
            <p>
              Maison Lucia creates soft, intentional floral moments designed to complement your tablescape, event palette, and overall celebration. From delicate bud vases to layered centerpieces, each floral detail is styled with elegance, restraint, and intention.
            </p>
            <a href="/#contact" className={styles.primaryButton}>Inquire About Floral Styling</a>
          </div>
          <figure className={styles.serviceHeroImageWrap}>
            <img src="/lacesilverwhite.webp" alt="Luxury floral styling for a South Florida celebration" className={styles.serviceHeroImage} />
          </figure>
        </section>

        <section className={styles.serviceContentSection}>
          <div className={styles.serviceTextBlock}>
            <p className={styles.kicker}>Floral Styling</p>
            <h2>Floral Moments, Styled with Intention</h2>
            <p>
              Florals are never treated as an afterthought. Maison Lucia uses flowers as part of a complete visual story, balancing color, texture, movement, and atmosphere to create floral styling that feels refined, personal, and beautifully considered.
            </p>
          </div>
          <ul className={styles.serviceListGrid}>
            {floralServices.map((service) => <li key={service}>{service}</li>)}
          </ul>
        </section>

        <section className={styles.editorialImageGrid} aria-label="Maison Lucia floral styling gallery">
          {floralImages.map((image) => (
            <figure key={image.src}>
              <img src={image.src} alt={image.alt} />
            </figure>
          ))}
        </section>

        <section className={styles.localSeoSection}>
          <p className={styles.kicker}>South Florida</p>
          <h2>Floral Styling Across South Florida</h2>
          <p>
            Maison Lucia provides floral styling for refined celebrations throughout West Palm Beach, Palm Beach, Wellington, Boca Raton, Fort Lauderdale, Miami, Coral Gables, and surrounding South Florida communities.
          </p>
        </section>

        <section className={styles.serviceCtaSection}>
          <h2>Begin Your Floral Styling Inquiry</h2>
          <p>
            Share your date, location, palette, and celebration style, and Maison Lucia will help shape the floral details around your gathering.
          </p>
          <a href="/#contact" className={styles.ctaButton}>Inquire About Floral Styling</a>
        </section>

        <footer className={styles.footer}>
          <p className={styles.footerBrand}>Maison Lucia</p>
          <ul className={styles.footerServiceNav}>
            <li><a href="/floral-styling">Floral Styling</a></li>
            <li><a href="/tablescapes">Tablescapes</a></li>
            <li><a href="/#contact">Inquiry</a></li>
          </ul>
          <div className={styles.footerMeta}><p>© {new Date().getFullYear()} Maison Lucia LLC</p></div>
        </footer>
      </main>
    </>
  );
}
