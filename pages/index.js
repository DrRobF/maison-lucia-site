import Head from "next/head";
import styles from "../styles/Home.module.css";

const services = [
  {
    title: "Bespoke Table Styling",
    description:
      "Custom-designed tablescapes tailored to your occasion, venue, color palette, and personal style.",
  },
  {
    title: "Celebrations & Milestones",
    description:
      "Elegant styling for showers, anniversaries, engagements, birthdays, and meaningful occasions worth celebrating beautifully.",
  },
  {
    title: "Private Gatherings",
    description:
      "Elevated hosting for dinners, holiday entertaining, and intimate celebrations.",
  },
  {
    title: "Full Event Styling",
    description:
      "A complete visual experience including tables, florals, welcome displays, signage, décor, and ambiance.",
  },
  {
    title: "Custom Experiences",
    description:
      "For clients seeking a fully personalized celebration designed around their unique vision.",
  },
];

const highlights = [
  "Tailored styling concepts for each client",
  "Elevated aesthetic with exceptional attention to detail",
  "Stress-free setup and execution",
  "Warm, personalized service from start to finish",
  "Beautiful spaces guests remember long after the celebration",
  "Experiences that photograph beautifully and feel even better in person",
];

const galleryPlaceholders = [
  "Refined neutral tablescape concept",
  "Private dinner styling with candlelight ambiance",
  "Celebration entry display with custom signage",
  "Milestone event florals and layered place setting",
  "Warm-toned lounge and welcome moment",
  "Boutique dessert vignette with styled décor",
];

const testimonials = [
  "Maison Lucia exceeded every expectation. Every detail felt luxurious.",
  "Our guests could not stop talking about how beautiful everything looked.",
  "The entire experience was seamless, elegant, and stress-free.",
];

const processSteps = [
  {
    title: "Inquire",
    detail: "Share your date, guest count, and occasion.",
  },
  {
    title: "Design",
    detail: "We create a tailored concept inspired by your vision.",
  },
  {
    title: "Styling Day",
    detail: "We install and perfect every detail.",
  },
  {
    title: "Celebrate",
    detail: "You enjoy the moment while we handle the atmosphere.",
  },
];

export default function Home() {
  return (
    <>
      <Head>
        <title>Maison Lucia | Luxury Event Styling & Tablescapes</title>
        <meta
          name="description"
          content="Maison Lucia creates refined tablescapes and elevated event styling for celebrations, milestones, and memorable moments throughout South Florida."
        />
      </Head>

      <main className={styles.page}>
        <header className={styles.topNav}>
          <p className={styles.brandMark}>Maison Lucia</p>
          <nav aria-label="Primary">
            <ul className={styles.menuList}>
              <li>
                <a href="#services">Services</a>
              </li>
              <li>
                <a href="#gallery">Gallery</a>
              </li>
              <li>
                <a href="#atmos">Atmos</a>
              </li>
              <li>
                <a href="#contact">Contact</a>
              </li>
            </ul>
          </nav>
        </header>

        <section className={styles.hero}>
          <div className={styles.heroPanel}>
            <p className={styles.eyebrow}>Maison Lucia</p>
            <h1>Beautifully Styled Celebrations, Designed to Be Remembered</h1>
            <p className={styles.heroText}>
              Maison Lucia creates refined tablescapes and elevated event styling for celebrations,
              milestones, and memorable moments throughout South Florida.
            </p>
            <div className={styles.heroActions}>
              <a href="#contact" className={styles.primaryButton}>
                Reserve Your Date
              </a>
              <a href="#gallery" className={styles.secondaryButton}>
                View Portfolio
              </a>
            </div>
          </div>
        </section>

        <section className={styles.section} id="intro">
          <div className={styles.sectionHeader}>
            <h2>Where Meaningful Moments Meet Beautiful Design</h2>
          </div>
          <div className={styles.copyStack}>
            <p>
              At Maison Lucia, we believe the most memorable gatherings begin with intention.
            </p>
            <p>
              For years, we have created beautiful tablescapes and designed events for our family
              and loved ones&mdash;celebrating life&apos;s most meaningful moments with care and style.
              Along the way, we even created our own luxury table linen brand rooted in elegance and
              quality.
            </p>
            <p>
              Today, Maison Lucia brings that same passion for design, d&eacute;cor, and the art of
              table setting to your celebration&mdash;transforming gatherings into experiences your
              guests will never forget.
            </p>
          </div>
        </section>

        <section className={`${styles.section} ${styles.atmosSection}`} id="atmos">
          <div className={styles.sectionHeader}>
            <p className={styles.sectionLabel}>Atmos</p>
            <h2>Atmos by Maison Lucia</h2>
            <p className={styles.sectionSubtext}>Design your atmosphere.</p>
          </div>
          <a
            href="https://atmos.maisonluciallc.com/"
            className={styles.primaryButton}
            target="_blank"
            rel="noopener noreferrer"
          >
            Design Your Atmosphere
          </a>
        </section>

        <section className={styles.section} id="services">
          <div className={styles.sectionHeader}>
            <p className={styles.sectionLabel}>Services</p>
            <h2>Signature Offerings</h2>
          </div>
          <div className={styles.gridFive}>
            {services.map((service) => (
              <article key={service.title} className={styles.card}>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </article>
            ))}
          </div>
          <a href="#contact" className={styles.primaryButton}>
            Request a Custom Proposal
          </a>
        </section>

        <section className={`${styles.section} ${styles.experience}`} id="experience">
          <div className={styles.sectionHeader}>
            <h2>The Maison Lucia Experience</h2>
          </div>
          <div className={styles.copyStack}>
            <p>
              Our process is seamless, personal, and intentionally designed to feel effortless.
            </p>
            <p>
              You share your vision. We refine the details. Then we transform your space with care
              and precision&mdash;so you can be fully present for the moment.
            </p>
            <p>Luxury should feel beautiful, calm, and easy.</p>
          </div>
        </section>

        <section className={styles.section} id="why-us">
          <div className={styles.sectionHeader}>
            <h2>Chosen for Taste. Remembered for Experience.</h2>
          </div>
          <ul className={styles.featureList}>
            {highlights.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </section>

        <section className={styles.section} id="gallery">
          <div className={styles.sectionHeader}>
            <p className={styles.sectionLabel}>Gallery</p>
            <h2>Styled Moments</h2>
            <p className={styles.sectionSubtext}>
              A glimpse into celebrations designed with beauty, warmth, and intention.
            </p>
          </div>
          <div className={styles.galleryGrid}>
            {galleryPlaceholders.map((item, index) => (
              <figure key={item} className={styles.galleryCard}>
                <div className={styles.imagePlaceholder} aria-hidden="true" />
                <figcaption>
                  <span className={styles.placeholderTag}>Placeholder visual {index + 1}</span>
                  {item}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className={styles.section} id="about">
          <div className={styles.sectionHeader}>
            <h2>About Maison Lucia</h2>
          </div>
          <div className={styles.copyStack}>
            <p>
              Maison Lucia was founded from a lifelong love of beautiful hosting, meaningful
              gatherings, and thoughtful design.
            </p>
            <p>
              We believe celebrations deserve more than decorations&mdash;they deserve atmosphere,
              elegance, and care. Our purpose is to create spaces where people feel welcomed,
              celebrated, and connected.
            </p>
            <p>Every table tells a story. It would be our honor to design yours.</p>
          </div>
        </section>

        <section className={styles.section} id="testimonials">
          <div className={styles.sectionHeader}>
            <h2>Kind Words</h2>
          </div>
          <div className={styles.gridThree}>
            {testimonials.map((quote) => (
              <blockquote key={quote} className={styles.quoteCard}>
                <p>&ldquo;{quote}&rdquo;</p>
              </blockquote>
            ))}
          </div>
        </section>

        <section className={styles.section} id="process">
          <div className={styles.sectionHeader}>
            <h2>From Vision to Celebration</h2>
          </div>
          <ol className={styles.processGrid}>
            {processSteps.map((step, index) => (
              <li key={step.title} className={styles.processCard}>
                <p className={styles.stepCount}>{String(index + 1).padStart(2, "0")}</p>
                <h3>{step.title}</h3>
                <p>{step.detail}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className={styles.section} id="contact">
          <div className={styles.sectionHeader}>
            <h2>Reserve Your Celebration</h2>
            <p className={styles.sectionSubtext}>
              We accept a limited number of events each month to ensure an exceptional client
              experience.
            </p>
            <p className={styles.sectionSubtext}>
              Inquire today for availability, custom pricing, and next steps.
            </p>
          </div>
          <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
            <label>
              First Name
              <input type="text" name="firstName" placeholder="First name" />
            </label>
            <label>
              Last Name
              <input type="text" name="lastName" placeholder="Last name" />
            </label>
            <label>
              Email
              <input type="email" name="email" placeholder="you@example.com" required />
            </label>
            <label>
              Phone
              <input type="tel" name="phone" placeholder="(555) 123-4567" />
            </label>
            <label className={styles.fullWidth}>
              Message
              <textarea
                name="message"
                rows="5"
                placeholder="Tell us about your event and styling needs."
                required
              />
            </label>
            <button type="submit" className={styles.primaryButton}>
              Send Message
            </button>
          </form>
        </section>

        <footer className={styles.footer}>
          <p>Maison Lucia</p>
          <p>Luxury Event Styling &amp; Tablescapes</p>
          <p>Miami, Florida | Serving South Florida</p>
        </footer>
      </main>
    </>
  );
}
