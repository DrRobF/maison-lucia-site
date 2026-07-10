import Head from "next/head";
import PrimaryNav from "../components/PrimaryNav";
import styles from "../styles/Home.module.css";

const tableServices = [
  "Casual table settings",
  "Formal table settings",
  "Private dinner tablescapes",
  "Wedding table styling",
  "Bridal shower tables",
  "Baby shower tables",
  "Corporate dinner styling",
  "Linens, candles, glassware, and finishing details",
];

const featureCards = [
  {
    title: "Casual Table Setting",
    copy: "Relaxed, refined, and inviting. Designed for everyday elegance, intimate dinners, brunches, and effortless hosting.",
  },
  {
    title: "Formal Table Setting",
    copy: "Polished, balanced, and timeless. A refined approach to elevated celebrations, weddings, milestones, and beautifully layered tables.",
  },
  {
    title: "Styled Table Moments",
    copy: "Curated details including linens, glassware, candles, florals, place settings, and finishing touches that complete the experience.",
  },
];

const tableStructuredData = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Luxury Tablescapes & Table Styling in South Florida",
  provider: {
    "@type": "LocalBusiness",
    name: "Maison Lucia LLC",
    url: "https://www.maisonluciallc.com",
  },
  areaServed: ["West Palm Beach", "Palm Beach", "Wellington", "Boca Raton", "Miami", "Fort Lauderdale", "South Florida"],
  serviceType: "Luxury tablescapes and table styling",
};

export default function Tablescapes() {
  return (
    <>
      <Head>
        <title>Luxury Tablescapes &amp; Table Styling in South Florida | Maison Lucia</title>
        <meta
          name="description"
          content="Maison Lucia creates luxury tablescapes and refined table styling for weddings, private dinners, corporate gatherings, bridal showers, baby showers, and celebrations throughout West Palm Beach, Palm Beach, Wellington, Boca Raton, Miami, and South Florida."
        />
        <meta property="og:title" content="Luxury Tablescapes & Table Styling in South Florida | Maison Lucia" />
        <meta property="og:description" content="Luxury tablescapes and refined table styling for weddings, private dinners, corporate gatherings, bridal showers, baby showers, and South Florida celebrations." />
        <meta property="og:url" content="https://www.maisonluciallc.com/tablescapes" />
        <meta property="og:type" content="website" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(tableStructuredData) }} />
      </Head>

      <main className={styles.page}>
        <header className={styles.header}>
          <div className={styles.brandWrap}>
            <a href="/" className={styles.brandName}>Maison Lucia</a>
            <p className={styles.tagline}>South Florida Event Styling</p>
          </div>
          <PrimaryNav />
          <a href="/#contact" className={styles.headerButton}>Inquire</a>
        </header>

        <section className={styles.serviceHero}>
          <div className={styles.serviceHeroText}>
            <p className={styles.kicker}>REFINED TABLE STYLING</p>
            <h1>Luxury Tablescapes</h1>
            <p>
              Maison Lucia designs layered table settings that feel polished, warm, and memorable. From linens and glassware to candles, florals, place settings, and finishing touches, every element is curated to create a beautifully considered gathering.
            </p>
            <a href="/#contact" className={styles.primaryButton}>Inquire About Tablescapes</a>
          </div>
          <figure className={styles.serviceHeroImageWrap}>
            <img src="/whiteblue%20.webp" alt="Elegant Maison Lucia tablescape with white and blue styling details" className={styles.serviceHeroImage} />
          </figure>
        </section>

        <section className={styles.serviceContentSection}>
          <div className={styles.serviceTextBlock}>
            <p className={styles.kicker}>Tablescape Design</p>
            <h2>Tables Designed for Meaningful Moments</h2>
            <p>
              A Maison Lucia tablescape is more than a place setting. It is the visual center of the celebration—layered with texture, color, candlelight, florals, and thoughtful details that reflect the mood of the moment.
            </p>
          </div>
          <ul className={styles.serviceListGrid}>
            {tableServices.map((service) => <li key={service}>{service}</li>)}
          </ul>
        </section>

        <section className={styles.serviceFeatureCards} aria-label="Tablescape service options">
          {featureCards.map((card) => (
            <article key={card.title} className={styles.tableFeatureCard}>
              <h3>{card.title}</h3>
              <p>{card.copy}</p>
            </article>
          ))}
        </section>

        <section className={styles.editorialImageGrid} aria-label="Maison Lucia tablescape gallery">
          <figure><img src="/white-red.webp" alt="White and red Maison Lucia tablescape with floral centerpiece" /></figure>
          <figure><img src="/table setup 1.jpg" alt="Layered table setting with glassware and candlelight" /></figure>
          <figure><img src="/table blue setup 1.jpg" alt="Blue toned table styling for a refined South Florida celebration" /></figure>
        </section>

        <section className={styles.atmosResourceSection}>
          <p className={styles.kicker}>Planning Resource</p>
          <h2>Need Help Planning the Atmosphere?</h2>
          <p>
            For clients exploring mood, ambiance, music, and the emotional tone of their gathering, Maison Lucia also recommends Atmos.ai as a helpful planning resource.
          </p>
          <a href="https://atmos.ai" target="_blank" rel="noopener noreferrer" className={styles.secondaryButton}>Visit Atmos.ai</a>
        </section>

        <section className={styles.localSeoSection}>
          <p className={styles.kicker}>South Florida</p>
          <h2>Tablescape Design Across South Florida</h2>
          <p>
            Maison Lucia creates refined tablescapes and table styling throughout West Palm Beach, Palm Beach, Wellington, Royal Palm Beach, Boca Raton, Jupiter, Fort Lauderdale, Miami, Coral Gables, and surrounding South Florida communities.
          </p>
        </section>

        <section className={styles.serviceCtaSection}>
          <h2>Begin Your Tablescape Inquiry</h2>
          <p>
            Share your celebration date, location, guest count, and style direction, and Maison Lucia will help create a table setting that feels personal, elevated, and unforgettable.
          </p>
          <a href="/#contact" className={styles.ctaButton}>Inquire About Tablescapes</a>
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
