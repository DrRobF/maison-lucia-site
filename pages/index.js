import Head from "next/head";
import styles from "../styles/Home.module.css";

const navLinks = [
  { label: "Services", href: "#services" },
  { label: "Gallery", href: "#gallery" },
  { label: "About", href: "#about" },
  { label: "Journal", href: "#journal" },
  { label: "Contact", href: "#contact" },
];

const features = [
  {
    title: "Thoughtful Design & Details",
    copy: "Every detail is intentionally considered and beautifully curated.",
  },
  {
    title: "Curated With Intention",
    copy: "Layered styling that feels personal, polished, and meaningful.",
  },
  {
    title: "Memories That Last",
    copy: "Timeless visual moments your guests remember long after the celebration.",
  },
  {
    title: "Rooted in South Florida",
    copy: "Proudly styling refined events across South Florida and beyond.",
  },
];

const detailsGroups = [
  {
    title: "Blue Garden Palette",
    description:
      "Layered blues, delicate florals, and clean place settings bring a modern coastal elegance.",
    images: [
      {
        src: "/floral-blue1.jpg",
        alt: "Blue floral centerpiece detail for Maison Lucia table styling",
      },
      {
        src: "/floral-blue-2.jpg",
        alt: "Blue floral and candle arrangement on a styled event table",
      },
      {
        src: "/table blue setup 1.jpg",
        alt: "Blue themed full table setup styled by Maison Lucia",
      },
    ],
  },
  {
    title: "Warm Signature Styling",
    description:
      "Warm neutrals, gold accents, and textured florals create an elevated, intimate atmosphere.",
    images: [
      {
        src: "/beige-floral1.jpg",
        alt: "Beige floral arrangement with soft neutral tones",
      },
      {
        src: "/beige-floral2.jpg",
        alt: "Warm beige floral event detail styled by Maison Lucia",
      },
      {
        src: "/green-purple-gold.PNG",
        alt: "Luxury table setting with green, purple, and gold details",
      },
    ],
  },
];

const signatureMoments = [
  {
    src: "/table setup 1.jpg",
    alt: "Intimate candlelight dinner with layered place settings",
    caption: "Intimate Candlelight Dinner",
  },
  {
    src: "/colors-floral1.jpg",
    alt: "Garden celebration with colorful florals and curated tableware",
    caption: "Garden Celebration",
  },
  {
    src: "/table blue setup 1.jpg",
    alt: "Modern coastal table with blue tones and elegant glassware",
    caption: "Modern Coastal Table",
  },
];

export default function Home() {
  return (
    <>
      <Head>
        <title>Maison Lucia | South Florida Event Styling</title>
        <meta
          name="description"
          content="Refined tablescapes and elevated event styling for celebrations, milestones, and unforgettable gatherings throughout South Florida."
        />
      </Head>

      <main className={styles.page}>
        <header className={styles.header}>
          <div className={styles.brandWrap}>
            <a href="#top" className={styles.brandName}>
              Maison Lucia
            </a>
            <p className={styles.tagline}>South Florida Event Styling</p>
          </div>

          <nav aria-label="Primary">
            <ul className={styles.menuList}>
              {navLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href}>{link.label}</a>
                </li>
              ))}
            </ul>
          </nav>

          <a href="#contact" className={styles.headerButton}>
            Inquire
          </a>
        </header>

        <section className={styles.hero} id="top">
          <div className={styles.heroTextCol}>
            <h1>
              Modern Tables.
              <br />
              Meaningful Moments.
            </h1>
            <p className={styles.heroCopy}>
              Refined tablescapes and elevated event styling for celebrations, milestones, and
              unforgettable gatherings throughout South Florida.
            </p>
            <div className={styles.heroActions}>
              <a href="#contact" className={styles.primaryButton}>
                Reserve Your Date
              </a>
              <a href="#gallery" className={styles.secondaryButton}>
                View Our Work
              </a>
            </div>
            <a
              href="https://atmos.maisonluciallc.com/"
              className={styles.atmosLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              Explore Atmos AI
            </a>
          </div>

          <div className={styles.heroImageCol}>
            <img
              src="/table setup 2.jpg"
              alt="Signature Maison Lucia table setup with candles and florals"
              className={styles.heroImage}
            />
          </div>
        </section>

        <section className={styles.featureRow} id="services">
          {features.map((feature) => (
            <article key={feature.title} className={styles.featureCard}>
              <h2>{feature.title}</h2>
              <p>{feature.copy}</p>
            </article>
          ))}
        </section>

        <section className={styles.approachSection} id="about">
          <div className={styles.approachText}>
            <p className={styles.kicker}>A Modern Approach to Celebration</p>
            <h2>
              Timeless Style.
              <br />
              Effortless Execution.
            </h2>
            <p>
              From intimate dinners to weddings and meaningful milestones, we transform gatherings
              into elevated experiences through seamless planning, thoughtful design, and refined
              styling.
            </p>
            <a href="#contact" className={styles.primaryButton}>
              Inquire Today
            </a>
          </div>

          <div className={styles.approachImages} id="gallery" aria-label="Chosen for taste details">
            <figure className={styles.editorialImageWrap}>
              <img
                src="/casual-table-setting-ml.PNG"
                alt="Casual elegant table setting by Maison Lucia"
                className={styles.editorialImage}
              />
            </figure>
            <figure className={styles.editorialImageWrap}>
              <img
                src="/formal-table-setting-ml.PNG"
                alt="Formal luxury table setting by Maison Lucia"
                className={styles.editorialImage}
              />
            </figure>
          </div>
        </section>

        <section className={styles.detailsSection} aria-label="Styled details gallery">
          <div className={styles.detailsHeader}>
            <p className={styles.kicker}>Selected Details</p>
            <h2>Chosen for Taste</h2>
            <p>
              A curated look at textures, florals, and layered table moments that define each Maison
              Lucia setting.
            </p>
          </div>

          <div className={styles.detailsGroups}>
            {detailsGroups.map((group) => (
              <article key={group.title} className={styles.detailsGroupCard}>
                <div className={styles.groupText}>
                  <h3>{group.title}</h3>
                  <p>{group.description}</p>
                </div>
                <div className={styles.groupImageRow}>
                  {group.images.map((image) => (
                    <figure key={image.src} className={styles.groupImageWrap}>
                      <img src={image.src} alt={image.alt} className={styles.groupImage} />
                    </figure>
                  ))}
                </div>
              </article>
            ))}
          </div>

          <div className={styles.signatureMoments}>
            <div className={styles.signatureHeader}>
              <h3>Signature Moments</h3>
            </div>
            {signatureMoments.map((image) => (
              <figure key={image.src} className={styles.signatureImageWrap}>
                <img src={image.src} alt={image.alt} className={styles.signatureImage} />
                <figcaption>{image.caption}</figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className={styles.ctaBanner} id="contact">
          <div>
            <h2>Ready to create something beautiful?</h2>
            <p>Weddings, milestones, intimate gatherings, and unforgettable celebrations.</p>
          </div>
          <a href="mailto:hello@maisonluciallc.com" className={styles.ctaButton}>
            Inquire Today
          </a>
        </section>

        <section className={styles.journalStub} id="journal" aria-label="Journal">
          <p>Journal coming soon.</p>
          <a
            href="https://atmos.maisonluciallc.com/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.subtleLink}
          >
            Plan the atmosphere for your event
          </a>
        </section>

        <footer className={styles.footer}>
          <p className={styles.footerBrand}>Maison Lucia</p>
          <ul className={styles.footerNav}>
            {navLinks.map((link) => (
              <li key={link.label}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
          </ul>
          <div className={styles.footerMeta}>
            <p>© {new Date().getFullYear()} Maison Lucia LLC</p>
            <div className={styles.socialPlaceholders} aria-label="Social links">
              <a href="#" aria-label="Instagram">
                IG
              </a>
              <a href="#" aria-label="Pinterest">
                PI
              </a>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
