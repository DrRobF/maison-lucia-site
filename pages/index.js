import Head from "next/head";
import { useRef } from "react";
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

const floralGalleryImages = [
  {
    src: "/italian-gerbera-tomato.webp",
    alt: "Italian gerbera floral decor with warm tomato tones",
    caption: "Floral Tablescape",
  },
  {
    src: "/italiangerbera1.webp",
    alt: "Italian gerbera floral styling for a refined celebration",
    caption: "Celebration Florals",
  },
  {
    src: "/lacesilverwhite.webp",
    alt: "White and silver floral styling with lace detail",
    caption: "White Lace & Silver",
  },
  {
    src: "/lillyofthevalley.webp",
    alt: "Lily of the valley floral styling with soft white blooms",
    caption: "Garden-Inspired Details",
  },
  {
    src: "/purplepeachpink.webp",
    alt: "Purple peach and pink floral decor arrangement",
    caption: "Soft Botanical Styling",
  },
  {
    src: "/purplepeachpinkwhite.webp",
    alt: "Purple peach pink and white floral arrangement",
    caption: "Celebration Florals",
  },
  {
    src: "/red-white-blue.webp",
    alt: "Red white and blue floral styling for a celebration",
    caption: "Layered Table Moment",
  },
  {
    src: "/red-white-blue1.webp",
    alt: "Red white and blue floral decor detail",
    caption: "Candlelit Detail",
  },
  {
    src: "/redwhitesmall (1).webp",
    alt: "Small red and white floral arrangement",
    caption: "Refined Place Setting",
  },
  {
    src: "/sunflower white.webp",
    alt: "White sunflower floral decor for an intimate event",
    caption: "Garden-Inspired Details",
  },
  {
    src: "/white lace.webp",
    alt: "White floral styling with lace-inspired details",
    caption: "White Lace & Silver",
  },
  {
    src: "/white-red.webp",
    alt: "White and red floral arrangement for event styling",
    caption: "Layered Table Moment",
  },
  {
    src: "/whiteblue .webp",
    alt: "White and blue floral styling detail",
    caption: "Soft Botanical Styling",
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

const floralServiceExamples = [
  "Centerpieces",
  "Accent florals",
  "Welcome table florals",
  "Sweetheart table styling",
  "Gift table styling",
  "Bud vases",
  "Cake flowers",
  "Curated floral details for intimate events",
];

const supportingFloralImages = [
  {
    src: "/white lace.webp",
    alt: "White floral arrangement with lace-inspired styling",
  },
  {
    src: "/lillyofthevalley.webp",
    alt: "Lily of the valley floral styling with soft white blooms",
  },
  {
    src: "/sunflower white.webp",
    alt: "White sunflower floral decor with refined event styling",
  },
];

const signatureCollections = [
  {
    title: "The Lucia Collection",
    src: "/lacesilverwhite.webp",
    alt: "Maison Lucia signature floral styling in white and silver tones",
  },
  {
    title: "The Garden Collection",
    src: "/lillyofthevalley.webp",
    alt: "Garden-inspired floral styling with delicate white blooms",
  },
  {
    title: "The Editorial Collection",
    src: "/purplepeachpinkwhite.webp",
    alt: "Editorial floral arrangement with purple peach pink and white tones",
  },
  {
    title: "The Countryside Collection",
    src: "/sunflower white.webp",
    alt: "Countryside-inspired floral styling with soft sunflower details",
  },
  {
    title: "The Celebration Collection",
    src: "/italian-gerbera-tomato.webp",
    alt: "Celebration floral styling with Italian gerbera and tomato-inspired color palette",
  },
];

const tableSettingFeatures = [
  {
    title: "Casual Table Setting",
    copy: "Relaxed, refined, and inviting. Designed for everyday elegance, intimate dinners, brunches, and effortless hosting.",
  },
  {
    title: "Formal Table Setting",
    copy: "Polished, balanced, and timeless. A refined approach to elevated celebrations, special occasions, and beautifully layered tables.",
  },
  {
    title: "Styled Table Moments",
    copy: "Curated details including linens, glassware, candles, florals, place settings, and finishing touches that complete the experience.",
  },
];

const inquiryOptions = [
  "Tablescape Styling",
  "Floral Styling & Decor",
  "Full Event Styling",
  "Delivery Only",
  "Custom Request",
];

export default function Home() {
  const floralCarouselRef = useRef(null);

  const scrollFloralCarousel = (direction) => {
    floralCarouselRef.current?.scrollBy({
      left: direction * 360,
      behavior: "smooth",
    });
  };

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
            <p className={styles.heroTagline}>
              Florals. Tablescapes. Thoughtful Gatherings.
            </p>
            <p className={styles.heroCopy}>
              Maison Lucia creates thoughtful celebrations through floral
              styling, tablescapes, and beautifully curated details—bringing
              softness, elegance, and intention to every gathering.
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

        <section
          className={styles.floralDecorSection}
          aria-labelledby="floral-decor-title"
        >
          <div className={styles.floralDecorPanel}>
            <div className={styles.floralDecorText}>
              <p className={styles.kicker}>
                Florals. Tablescapes. Thoughtful Gatherings.
              </p>
              <h2 id="floral-decor-title">Floral Styling &amp; Decor</h2>
              <p className={styles.floralDecorLead}>
                Maison Lucia creates thoughtful celebrations through floral
                styling, tablescapes, and beautifully curated details—bringing
                softness, elegance, and intention to every gathering.
              </p>
              <p>
                Soft, intentional floral details designed to complement your
                tablescape, event palette, and overall atmosphere.
              </p>
              <ul className={styles.floralServiceList}>
                {floralServiceExamples.map((example) => (
                  <li key={example}>{example}</li>
                ))}
              </ul>
              <p className={styles.floralDecorNote}>
                Floral decor is available as part of Maison Lucia event styling
                services.
              </p>
            </div>

            <figure className={styles.floralTablescapeHero}>
              <img
                src="/lacesilverwhite.webp"
                alt="Luxury floral tablescape with white lace and silver accents"
                className={styles.floralTablescapeImage}
              />
              <figcaption>
                White lace, silver accents, and styled florals
              </figcaption>
            </figure>
          </div>
        </section>

        <section className={styles.approachSection} id="about">
          <div className={styles.approachPanel}>
            <div className={styles.approachText}>
              <p className={styles.kicker}>A Modern Approach to Celebration</p>
              <h2>
                Timeless Style.
                <br />
                Effortless Execution.
              </h2>
              <p className={styles.approachLead}>
                From intimate dinners to weddings and meaningful milestones,
                Maison Lucia transforms gatherings into elevated experiences
                through seamless planning, thoughtful design, and refined table
                styling.
              </p>
              <div className={styles.tableFeatureGrid}>
                {tableSettingFeatures.map((feature) => (
                  <article
                    key={feature.title}
                    className={styles.tableFeatureCard}
                  >
                    <h3>{feature.title}</h3>
                    <p>{feature.copy}</p>
                  </article>
                ))}
              </div>
              <a href="#contact" className={styles.primaryButton}>
                Inquire Today
              </a>
            </div>

            <div
              className={styles.approachImages}
              id="gallery"
              aria-label="Maison Lucia table setting details"
            >
              <figure className={styles.approachHeroImage}>
                <img
                  src="/table setup 1.jpg"
                  alt="Elegant Maison Lucia table setting with layered plates, glassware, and refined details"
                  className={styles.approachMainImage}
                />
                <figcaption>
                  Layered plates, candlelight, and refined details
                </figcaption>
              </figure>
              <div className={styles.tableSettingPair}>
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
            </div>
          </div>
        </section>

        <section
          className={styles.detailsSection}
          aria-label="Styled details gallery"
        >
          <div className={styles.detailsHeader}>
            <p className={styles.kicker}>Selected Details</p>
            <h2>Chosen for Taste</h2>
            <p className={styles.galleryCategory}>
              Florals &amp; Table Details
            </p>
            <p>
              A curated look at textures, florals, and layered table moments
              that define each Maison Lucia setting.
            </p>
          </div>

          <div className={styles.carouselShell}>
            <div
              className={styles.carouselControls}
              aria-label="Floral gallery controls"
            >
              <button
                type="button"
                onClick={() => scrollFloralCarousel(-1)}
                aria-label="Previous floral details"
              >
                ←
              </button>
              <button
                type="button"
                onClick={() => scrollFloralCarousel(1)}
                aria-label="Next floral details"
              >
                →
              </button>
            </div>
            <div
              className={styles.floralCarousel}
              ref={floralCarouselRef}
              aria-label="Florals and table details carousel"
            >
              {floralGalleryImages.map((image) => (
                <figure key={image.src} className={styles.floralGalleryItem}>
                  <img
                    src={image.src}
                    alt={image.alt}
                    className={styles.floralGalleryImage}
                  />
                  <figcaption>{image.caption}</figcaption>
                </figure>
              ))}
            </div>
          </div>

          <div className={styles.signatureMoments}>
            <div className={styles.signatureHeader}>
              <h3>Signature Moments</h3>
            </div>
            {signatureMoments.map((image) => (
              <figure key={image.src} className={styles.signatureImageWrap}>
                <img
                  src={image.src}
                  alt={image.alt}
                  className={styles.signatureImage}
                />
                <figcaption>{image.caption}</figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section
          className={styles.floralSection}
          aria-label="Signature Floral Styling"
        >
          <div className={styles.floralIntro}>
            <p className={styles.kicker}>Botanical Details</p>
            <h2>Signature Floral Styling</h2>
            <p>
              At Maison Lucia, florals are never an afterthought. Each
              arrangement is thoughtfully curated to complement the story,
              palette, and atmosphere of your celebration. From delicate bud
              vases to layered centerpiece styling, every floral detail is
              designed to feel refined, personal, and beautifully intentional.
            </p>
            <p className={styles.positioningLine}>
              Floral decor is available as part of Maison Lucia event styling
              services.
            </p>
          </div>

          <div className={styles.supportingFloralGrid}>
            {supportingFloralImages.map((image) => (
              <figure key={image.src} className={styles.supportingFloralCard}>
                <img
                  src={image.src}
                  alt={image.alt}
                  className={styles.supportingFloralImage}
                />
              </figure>
            ))}
          </div>

          <div className={styles.collectionSection}>
            <p className={styles.kicker}>Signature Collections</p>
            <div className={styles.collectionList}>
              {signatureCollections.map((collection) => (
                <article
                  key={collection.title}
                  className={styles.collectionCard}
                >
                  <img
                    src={collection.src}
                    alt={collection.alt}
                    className={styles.collectionImage}
                  />
                  <h3>{collection.title}</h3>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.ctaBanner} id="contact">
          <div className={styles.ctaIntro}>
            <h2>Ready to create something beautiful?</h2>
            <p>
              Weddings, milestones, intimate gatherings, and unforgettable
              celebrations.
            </p>
          </div>
          <form
            className={styles.inquiryForm}
            action="mailto:hello@maisonluciallc.com"
            method="post"
            encType="text/plain"
          >
            <label>
              Name
              <input name="name" type="text" autoComplete="name" required />
            </label>
            <label>
              Email
              <input name="email" type="email" autoComplete="email" required />
            </label>
            <fieldset>
              <legend>Interested Services</legend>
              {inquiryOptions.map((option) => (
                <label key={option} className={styles.checkboxLabel}>
                  <input name="services" type="checkbox" value={option} />
                  <span>{option}</span>
                </label>
              ))}
            </fieldset>
            <label>
              Event Notes
              <textarea name="event-notes" rows="4" />
            </label>
            <button type="submit" className={styles.ctaButton}>
              Inquire Today
            </button>
          </form>
        </section>

        <section
          className={styles.journalStub}
          id="journal"
          aria-label="Journal"
        >
          <p>Journal coming soon.</p>
        </section>

        <section className={styles.atmosFeature} aria-label="Atmos AI feature">
          <div className={styles.atmosFeatureVisual} aria-hidden="true" />
          <div className={styles.atmosFeatureContent}>
            <p className={styles.kicker}>Featured Experience</p>
            <h2>Design Your Table Before It Exists</h2>
            <p>
              Explore Atmos AI — a guided experience to visualize your event
              before it’s set.
            </p>
            <a
              href="https://atmos.maisonluciallc.com/"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.atmosFeatureButton}
            >
              Explore Atmos AI
            </a>
          </div>
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
            <div
              className={styles.socialPlaceholders}
              aria-label="Social links"
            >
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
