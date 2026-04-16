import Head from "next/head";
import styles from "../styles/Home.module.css";

const services = [
  {
    title: "Event Planning",
    description:
      "From early concept to day-of coordination, we guide each phase so your celebration feels effortless and beautifully organized.",
  },
  {
    title: "Event Styling",
    description:
      "We design elevated visual concepts with intentional details, curated color stories, and a cohesive atmosphere your guests will remember.",
  },
  {
    title: "Setup & Installation",
    description:
      "Our team handles on-site setup with care and precision, ensuring your event is polished and ready before the first guest arrives.",
  },
  {
    title: "Custom Packages",
    description:
      "Need something tailored? We create bespoke service combinations aligned to your vision, priorities, and event scale.",
  },
];

const packages = [
  {
    name: "Signature Styling",
    price: "Starting at $1,200",
    details:
      "Perfect for intimate celebrations that need refined styling and professional setup support.",
  },
  {
    name: "Planning + Styling",
    price: "Starting at $2,800",
    details:
      "Ideal for clients who want both strategic planning guidance and a fully cohesive event design.",
  },
  {
    name: "Full-Service Experience",
    price: "Starting at $5,500",
    details:
      "A premium, white-glove package that includes planning, styling, logistics, and day-of execution.",
  },
];

const galleryPlaceholders = [
  "Editorial tablescape concept",
  "Luxury bridal shower styling",
  "Neutral-toned birthday setup",
  "Romantic ceremony detail",
  "Elegant welcome display",
  "Custom celebration backdrop",
];

export default function Home() {
  return (
    <>
      <Head>
        <title>Maison Lucia LLC | Event Planning & Styling</title>
        <meta
          name="description"
          content="Maison Lucia LLC creates elevated, thoughtfully designed events through planning, styling, setup, and custom packages."
        />
      </Head>

      <main className={styles.page}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>Maison Lucia LLC</p>
          <h1>Elevated Event Planning & Styling for Meaningful Celebrations</h1>
          <p className={styles.heroText}>
            We create refined event experiences that feel effortless, intentional, and beautifully
            aligned with your vision.
          </p>
          <a href="#inquiry" className={styles.primaryButton}>
            Start Your Inquiry
          </a>
        </section>

        <section className={styles.section} id="about">
          <div className={styles.sectionHeader}>
            <p className={styles.sectionLabel}>About</p>
            <h2>A Boutique Studio Approach</h2>
          </div>
          <p className={styles.bodyText}>
            Maison Lucia LLC is an event planning and styling studio dedicated to creating polished,
            memorable celebrations. We blend thoughtful planning with sophisticated design so every
            event feels warm, seamless, and distinctly personal.
          </p>
        </section>

        <section className={styles.section} id="services">
          <div className={styles.sectionHeader}>
            <p className={styles.sectionLabel}>Services</p>
            <h2>Designed Around Your Event Vision</h2>
          </div>
          <div className={styles.gridFour}>
            {services.map((service) => (
              <article key={service.title} className={styles.card}>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.section} id="packages">
          <div className={styles.sectionHeader}>
            <p className={styles.sectionLabel}>Packages</p>
            <h2>Investment Options</h2>
          </div>
          <div className={styles.gridThree}>
            {packages.map((pack) => (
              <article key={pack.name} className={styles.packageCard}>
                <h3>{pack.name}</h3>
                <p className={styles.price}>{pack.price}</p>
                <p>{pack.details}</p>
              </article>
            ))}
          </div>
          <p className={styles.customQuote}>Custom quotes are always available for unique events.</p>
        </section>

        <section className={styles.section} id="gallery">
          <div className={styles.sectionHeader}>
            <p className={styles.sectionLabel}>Gallery</p>
            <h2>Recent Styling Highlights</h2>
          </div>
          <div className={styles.galleryGrid}>
            {galleryPlaceholders.map((item) => (
              <div key={item} className={styles.galleryCard}>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section} id="inquiry">
          <div className={styles.sectionHeader}>
            <p className={styles.sectionLabel}>Inquiry</p>
            <h2>Tell Us About Your Event</h2>
          </div>
          <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
            <label>
              Name
              <input type="text" name="name" placeholder="Your full name" required />
            </label>
            <label>
              Email
              <input type="email" name="email" placeholder="you@example.com" required />
            </label>
            <label>
              Phone
              <input type="tel" name="phone" placeholder="(555) 123-4567" />
            </label>
            <label>
              Event Date
              <input type="date" name="date" />
            </label>
            <label>
              Event Type
              <input type="text" name="type" placeholder="Wedding, shower, birthday, etc." />
            </label>
            <label>
              Venue / Location
              <input type="text" name="location" placeholder="City or venue name" />
            </label>
            <label>
              Guest Count
              <input type="number" name="guests" min="1" placeholder="Estimated number of guests" />
            </label>
            <label>
              Package of Interest
              <select name="package">
                <option value="">Select a package</option>
                <option value="signature-styling">Signature Styling</option>
                <option value="planning-styling">Planning + Styling</option>
                <option value="full-service">Full-Service Experience</option>
                <option value="custom">Custom Package</option>
              </select>
            </label>
            <label>
              Budget Range
              <select name="budget">
                <option value="">Select budget range</option>
                <option value="under-2000">Under $2,000</option>
                <option value="2000-5000">$2,000 - $5,000</option>
                <option value="5000-10000">$5,000 - $10,000</option>
                <option value="10000-plus">$10,000+</option>
              </select>
            </label>
            <label className={styles.fullWidth}>
              Event Details / Notes
              <textarea
                name="details"
                rows="5"
                placeholder="Share your vision, inspiration, priorities, and any key event details."
              />
            </label>
            <button type="submit" className={styles.primaryButton}>
              Submit Inquiry
            </button>
          </form>
        </section>

        <footer className={styles.footer}>
          <p>Maison Lucia LLC</p>
          <p>Email: hello@maisonlucia.com</p>
          <p>Instagram: @maisonlucia</p>
        </footer>
      </main>
    </>
  );
}
