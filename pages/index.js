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
              src="/green-purple-gold.PNG"
              alt="Elegant Maison Lucia tablescape with florals and gold accents"
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

          <div className={styles.approachImages} id="gallery">
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
