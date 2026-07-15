import Head from "next/head";
import { useRef, useState } from "react";
import PrimaryNav, { navLinks } from "../components/PrimaryNav";
import styles from "../styles/Home.module.css";

const footerNavLinks = [{ label: "Services", href: "#services" }, ...navLinks];

const instagramProfileUrl = "https://www.instagram.com/maisonlucia_llc/";

const instagramGalleryImages = [
  {
    src: "/table setup 1.jpg",
    alt: "Maison Lucia candlelit tablescape with layered plates and refined details",
  },
  {
    src: "/colors-floral1.jpg",
    alt: "Colorful Maison Lucia floral styling for an elegant South Florida celebration",
  },
  {
    src: "/table blue setup 1.jpg",
    alt: "Maison Lucia blue-toned luxury tablescape with glassware and florals",
  },
  {
    src: "/lacesilverwhite.webp",
    alt: "Maison Lucia white lace and silver floral tablescape detail",
  },
  {
    src: "/purplepeachpinkwhite.webp",
    alt: "Maison Lucia purple peach pink and white floral arrangement",
  },
  {
    src: "/formal-table-setting-ml.PNG",
    alt: "Maison Lucia formal table setting with luxury place setting details",
  },
];

const features = [
  {
    title: "Thoughtful Design & Details",
    copy: "Every detail is intentionally chosen to create a setting that feels personal, polished, and beautifully complete.",
  },
  {
    title: "Curated with Intention",
    copy: "From linens and florals to candles and finishing touches, each layer is selected with care.",
  },
  {
    title: "Memories That Last",
    copy: "Maison Lucia designs visual moments your guests remember long after weddings, private dinners, corporate gatherings, and milestones conclude.",
  },
  {
    title: "Rooted in South Florida",
    copy: "Proudly styling refined events across West Palm Beach, Palm Beach, Wellington, Boca Raton, Miami, and South Florida with warmth and ease.",
  },
];

const floralGalleryImages = [
  {
    src: "/italian-gerbera-tomato.webp",
    alt: "Luxury floral styling with warm gerbera tones for a South Florida celebration",
    caption: "Floral Tablescape",
  },
  {
    src: "/italiangerbera1.webp",
    alt: "Refined floral styling for an intimate South Florida celebration",
    caption: "Celebration Florals",
  },
  {
    src: "/lacesilverwhite.webp",
    alt: "Luxury floral centerpiece with white lace and silver details in Palm Beach",
    caption: "White Lace & Silver",
  },
  {
    src: "/lillyofthevalley.webp",
    alt: "Soft lily of the valley floral styling for a Wellington private dinner",
    caption: "Garden-Inspired Details",
  },
  {
    src: "/purplepeachpink.webp",
    alt: "Purple peach and pink event florals for a Boca Raton celebration",
    caption: "Soft Botanical Styling",
  },
  {
    src: "/purplepeachpinkwhite.webp",
    alt: "Editorial floral arrangement for luxury event styling in South Florida",
    caption: "Celebration Florals",
  },
  {
    src: "/red-white-blue.webp",
    alt: "Red white and blue floral styling for a West Palm Beach celebration",
    caption: "Layered Table Moment",
  },
  {
    src: "/red-white-blue1.webp",
    alt: "Candlelit floral detail for South Florida event styling",
    caption: "Candlelit Detail",
  },
  {
    src: "/redwhitesmall (1).webp",
    alt: "Petite floral arrangement for refined table styling",
    caption: "Refined Place Setting",
  },
  {
    src: "/sunflower white.webp",
    alt: "White sunflower floral centerpiece for a Wellington private dinner",
    caption: "Garden-Inspired Details",
  },
  {
    src: "/white lace.webp",
    alt: "White floral styling with lace details for a Palm Beach event",
    caption: "White Lace & Silver",
  },
  {
    src: "/white-red.webp",
    alt: "White and red floral centerpiece for luxury event styling",
    caption: "Layered Table Moment",
  },
  {
    src: "/whiteblue .webp",
    alt: "Modern white and blue floral detail for a Miami celebration",
    caption: "Soft Botanical Styling",
  },
];

const signatureMoments = [
  {
    src: "/table setup 1.jpg",
    alt: "Private dinner styling in West Palm Beach with candlelight and layered place settings",
    caption: "Intimate Candlelight Dinner",
  },
  {
    src: "/colors-floral1.jpg",
    alt: "Colorful floral styling and curated tableware for a South Florida garden celebration",
    caption: "Garden Celebration",
  },
  {
    src: "/table blue setup 1.jpg",
    alt: "Modern tablescape design for a Miami celebration with blue tones and glassware",
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
    alt: "Luxury floral styling for a South Florida celebration with white blooms",
  },
  {
    src: "/lillyofthevalley.webp",
    alt: "Soft lily of the valley floral styling for a Wellington private dinner",
  },
  {
    src: "/sunflower white.webp",
    alt: "Floral centerpiece for a Wellington private dinner with refined white blooms",
  },
];

const signatureCollections = [
  {
    title: "The Lucia Collection",
    src: "/lacesilverwhite.webp",
    alt: "Maison Lucia luxury floral styling in white and silver tones for Palm Beach events",
  },
  {
    title: "The Garden Collection",
    src: "/lillyofthevalley.webp",
    alt: "Garden-inspired floral styling with delicate white blooms for South Florida celebrations",
  },
  {
    title: "The Editorial Collection",
    src: "/purplepeachpinkwhite.webp",
    alt: "Editorial floral arrangement for South Florida wedding styling",
  },
  {
    title: "The Countryside Collection",
    src: "/sunflower white.webp",
    alt: "Countryside-inspired floral styling for a Wellington celebration",
  },
  {
    title: "The Celebration Collection",
    src: "/italian-gerbera-tomato.webp",
    alt: "Celebration floral styling with Italian gerbera for South Florida events",
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

const initialInquiryForm = {
  name: "",
  email: "",
  services: [],
  eventNotes: "",
};

const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);

const servicePages = [
  {
    id: "floral-styling-service",
    href: "/floral-styling",
    eyebrow: "Floral Styling",
    title: "Floral Styling",
    copy: "Curated botanical details that bring softness, texture, and elegance to every gathering.",
    linkLabel: "Learn More →",
  },
  {
    id: "tablescapes-service",
    href: "/tablescapes",
    eyebrow: "Tablescapes",
    title: "Luxury Tablescapes",
    copy: "Layered place settings, linens, candlelight, and refined details designed for meaningful celebrations.",
    linkLabel: "Learn More →",
  },
  {
    id: "weddings",
    href: "#weddings",
    eyebrow: "Weddings",
    title: "Wedding Styling in Palm Beach & South Florida",
    copy: "Wedding table styling, floral styling, ceremony and reception details, bridal showers, rehearsal dinners, sweetheart tables, and intimate weddings throughout Palm Beach, West Palm Beach, Wellington, Boca Raton, Miami, and South Florida.",
    linkLabel: "Explore Wedding Styling",
  },
  {
    id: "corporate-events",
    href: "#corporate-events",
    eyebrow: "Corporate Events",
    title: "Corporate Event Styling in South Florida",
    copy: "Corporate dinners, client events, brand moments, holiday parties, professional gatherings, and elevated tablescapes for businesses in West Palm Beach, Palm Beach, Boca Raton, Fort Lauderdale, Miami, and South Florida.",
    linkLabel: "Explore Corporate Events",
  },
  {
    id: "private-dinners",
    href: "#private-dinners",
    eyebrow: "Private Dinners",
    title: "Private Dinner Styling in West Palm Beach & South Florida",
    copy: "Intimate dinner parties, home entertaining, milestone dinners, tablescapes, florals, candles, linens, and beautifully curated details for gatherings that feel personal and polished.",
    linkLabel: "Plan a Private Dinner",
  },
];

const serviceAreas = [
  "West Palm Beach",
  "Palm Beach",
  "Wellington",
  "Boca Raton",
  "Jupiter",
  "Palm Beach Gardens",
  "Delray Beach",
  "Fort Lauderdale",
  "Miami",
  "Coral Gables",
];

const faqs = [
  {
    question: "What areas does Maison Lucia serve?",
    answer: "Maison Lucia styles events throughout South Florida, including West Palm Beach, Palm Beach, Wellington, Royal Palm Beach, Palm Beach Gardens, Jupiter, Delray Beach, Boca Raton, Fort Lauderdale, Miami, Coral Gables, and surrounding communities.",
  },
  {
    question: "What types of events does Maison Lucia style?",
    answer: "Maison Lucia styles weddings, bridal showers, baby showers, private dinners, corporate gatherings, milestone celebrations, intimate events, and refined home gatherings.",
  },
  {
    question: "Does Maison Lucia offer floral styling?",
    answer: "Yes. Maison Lucia offers curated floral styling as part of its event styling services, including centerpieces, bud vases, accent florals, welcome table florals, sweetheart table styling, cake flowers, and refined botanical details.",
  },
  {
    question: "Does Maison Lucia provide tablescape design?",
    answer: "Yes. Maison Lucia creates casual and formal tablescapes with layered place settings, linens, candles, glassware, florals, and finishing touches designed around the tone of each celebration.",
  },
  {
    question: "Do you style events in Wellington and West Palm Beach?",
    answer: "Yes. Maison Lucia works with clients in Wellington, West Palm Beach, Palm Beach, and surrounding South Florida communities.",
  },
  {
    question: "Do you style events in Miami or Fort Lauderdale?",
    answer: "Yes. Maison Lucia accepts select events in Miami, Fort Lauderdale, Coral Gables, and nearby South Florida areas.",
  },
  {
    question: "How do I inquire about an event?",
    answer: "Submit an inquiry through the Maison Lucia contact form with your event date, location, guest count, and the type of styling support you are interested in.",
  },
];

const journalTopics = [
  {
    title: "How to Host an Elegant Dinner Party in Wellington",
    status: "Featured Journal",
    href: "/journal/how-to-host-an-elegant-dinner-party-in-wellington",
    excerpt: "Create a memorable Wellington dinner party with elegant tablescapes, seasonal florals, layered details, and thoughtful styling that makes entertaining feel effortless.",
    cta: "Read Article",
  },
  { title: "Luxury Tablescape Ideas for Palm Beach Celebrations" },
  { title: "Floral Styling Trends for South Florida Events" },
  { title: "The Difference Between Event Styling and Event Planning" },
  { title: "Wedding Table Styling Ideas for Palm Beach and Miami" },
  { title: "Corporate Event Styling for South Florida Brands" },
];

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "EventService",
    name: "Maison Lucia LLC",
    url: "https://www.maisonluciallc.com",
    areaServed: [
      "South Florida",
      "West Palm Beach",
      "Palm Beach",
      "Wellington",
      "Boca Raton",
      "Miami",
      "Fort Lauderdale",
    ],
    serviceType: [
      "Luxury event styling",
      "Floral styling",
      "Tablescape design",
      "Wedding styling",
      "Private dinner styling",
      "Corporate event styling",
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  },
];

export default function Home() {
  const floralCarouselRef = useRef(null);
  const [inquiryForm, setInquiryForm] = useState(initialInquiryForm);
  const [formErrors, setFormErrors] = useState({});
  const [submissionStatus, setSubmissionStatus] = useState("idle");

  const handleInquiryChange = (event) => {
    const { name, value, checked, type } = event.target;

    setSubmissionStatus("idle");
    setFormErrors((currentErrors) => ({ ...currentErrors, [name]: undefined }));

    if (name === "services") {
      setInquiryForm((currentForm) => ({
        ...currentForm,
        services: checked
          ? [...currentForm.services, value]
          : currentForm.services.filter((service) => service !== value),
      }));
      return;
    }

    if (type === "checkbox") {
      return;
    }

    setInquiryForm((currentForm) => ({ ...currentForm, [name]: value }));
  };

  const validateInquiryForm = () => {
    const errors = {};

    if (!inquiryForm.name.trim()) {
      errors.name = "Please enter your name.";
    }

    if (!inquiryForm.email.trim()) {
      errors.email = "Please enter your email address.";
    } else if (!isValidEmail(inquiryForm.email.trim())) {
      errors.email = "Please enter a valid email address.";
    }

    if (inquiryForm.services.length === 0) {
      errors.services = "Please select at least one interested service.";
    }

    if (!inquiryForm.eventNotes.trim()) {
      errors.eventNotes = "Please share a few event notes.";
    }

    return errors;
  };

  const handleInquirySubmit = async (event) => {
    event.preventDefault();

    const errors = validateInquiryForm();
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      setSubmissionStatus("idle");
      return;
    }

    const accessKey = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY;

    if (!accessKey) {
      console.error("Maison Lucia inquiry form configuration error: missing Web3Forms access key environment variable.");
      setSubmissionStatus("error");
      return;
    }

    const services = inquiryForm.services.join(", ");
    const message = [
      `Name: ${inquiryForm.name.trim()}`,
      `Email: ${inquiryForm.email.trim()}`,
      `Interested Service: ${services}`,
      `Event Notes: ${inquiryForm.eventNotes.trim()}`,
    ].join("\n");

    const payload = {
      access_key: accessKey,
      subject: "New Maison Lucia Event Inquiry",
      from_name: "Maison Lucia Website",
      name: inquiryForm.name.trim(),
      email: inquiryForm.email.trim(),
      services,
      event_notes: inquiryForm.eventNotes.trim(),
      message,
      replyto: inquiryForm.email.trim(),
      botcheck: "",
    };

    setSubmissionStatus("sending");

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        console.error("Maison Lucia inquiry form submission failed", {
          status: response.status,
          message: result.message,
        });
        setSubmissionStatus("error");
        return;
      }

      setInquiryForm(initialInquiryForm);
      setFormErrors({});
      setSubmissionStatus("success");
    } catch (error) {
      console.error("Maison Lucia inquiry form network error", {
        name: error.name,
        message: error.message,
      });
      setSubmissionStatus("error");
    }
  };

  const scrollFloralCarousel = (direction) => {
    floralCarouselRef.current?.scrollBy({
      left: direction * 360,
      behavior: "smooth",
    });
  };

  return (
    <>
      <Head>
        <title>Maison Lucia | Luxury Event Styling, Florals &amp; Tablescapes in South Florida</title>
        <meta
          name="description"
          content="Maison Lucia creates luxury event styling, floral styling, and refined tablescapes for weddings, private dinners, corporate gatherings, and celebrations throughout West Palm Beach, Palm Beach, Wellington, Boca Raton, Miami, and South Florida."
        />
        <meta property="og:title" content="Maison Lucia | Luxury Event Styling, Florals & Tablescapes in South Florida" />
        <meta property="og:description" content="Luxury event styling, floral styling, and refined tablescapes for weddings, private dinners, corporate gatherings, and celebrations throughout West Palm Beach, Palm Beach, Wellington, Boca Raton, Miami, and South Florida." />
        <meta property="og:url" content="https://www.maisonluciallc.com" />
        <meta property="og:type" content="website" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      </Head>

      <main className={styles.page}>
        <header className={styles.header}>
          <div className={styles.brandWrap}>
            <a href="#top" className={styles.brandName}>
              Maison Lucia
            </a>
            <p className={styles.tagline}>South Florida Event Styling</p>
          </div>

          <PrimaryNav />

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
              Maison Lucia creates luxury event styling, floral styling, and refined
              tablescapes for weddings, private dinners, corporate gatherings,
              bridal showers, baby showers, and beautiful celebrations across
              West Palm Beach, Palm Beach, Wellington, Boca Raton, Miami, Fort
              Lauderdale, and South Florida.
            </p>
            <div className={styles.heroActions}>
              <a href="#contact" className={styles.primaryButton}>
                Inquire About Your Event
              </a>
              <a href="#gallery" className={styles.secondaryButton}>
                View Tablescapes
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
              src="/whiteblue%20.webp"
              alt="Elegant white and blue Maison Lucia table styling with refined floral details"
              className={styles.heroImage}
            />
          </div>
        </section>

        <section className={styles.featureSection} id="services">
          <div className={styles.featureIntro}>
            <p className={styles.kicker}>The Maison Lucia Approach</p>
            <h2>Intentional styling for beautifully considered gatherings.</h2>
            <p>
              Intentional styling, refined details, and thoughtful moments
              designed to make every gathering feel beautifully considered.
            </p>
          </div>
          <figure className={styles.featureEditorialImageWrap}>
            <img
              src="/white-red.webp"
              alt="White and red Maison Lucia table styling with refined floral details"
              className={styles.featureEditorialImage}
            />
          </figure>
          <div className={styles.featureRow}>
            {features.map((feature, index) => (
              <article key={feature.title} className={styles.featureCard}>
                <span className={styles.featureNumber}>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3>{feature.title}</h3>
                <p>{feature.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section
          className={styles.floralDecorSection}
          id="floral-styling"
          aria-labelledby="floral-decor-title"
        >
          <div className={styles.floralDecorPanel}>
            <div className={styles.floralDecorText}>
              <p className={styles.kicker}>
                Florals. Tablescapes. Thoughtful Gatherings.
              </p>
              <h2 id="floral-decor-title">Floral Styling &amp; Decor in South Florida</h2>
              <p className={styles.floralDecorLead}>
                Luxury floral styling, centerpieces, bud vases, welcome table florals,
                sweetheart tables, cake flowers, and event floral design for
                celebrations in West Palm Beach, Palm Beach, Wellington, Boca
                Raton, Miami, and South Florida.
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
              <a
                href="/floral-styling"
                className={`${styles.subtleLink} ${styles.servicePathwayLink}`}
              >
                Explore Floral Styling →
              </a>
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

        <section className={styles.approachSection} id="tablescapes">
          <div className={styles.approachPanel}>
            <div className={styles.approachText}>
              <p className={styles.kicker}>Luxury Tablescapes &amp; Table Styling</p>
              <h2>
                Timeless Tables.
                <br />
                Effortless Celebration.
              </h2>
              <p className={styles.approachLead}>
                From formal tables to casual table settings, Maison Lucia layers
                linens, candles, glassware, florals, place settings, and
                finishing touches for private dinners, weddings, and
                celebrations across West Palm Beach, Wellington, Palm Beach,
                Boca Raton, and Miami.
              </p>
              <a
                href="/tablescapes"
                className={`${styles.subtleLink} ${styles.servicePathwayLink}`}
              >
                Explore Luxury Tablescapes →
              </a>
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
                Plan a Private Dinner
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
          id="about"
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


        <section className={styles.serviceSeoSection} aria-labelledby="services-seo-title">
          <div className={styles.serviceSeoIntro}>
            <p className={styles.kicker}>Services</p>
            <h2 id="services-seo-title">Refined styling for the moments you gather around.</h2>
          </div>
          <div className={styles.serviceSeoGrid}>
            {servicePages.map((service) => (
              <article key={service.id} id={service.id} className={styles.serviceSeoCard}>
                <p className={styles.serviceEyebrow}>{service.eyebrow}</p>
                <h3>{service.title}</h3>
                <p>{service.copy}</p>
                <a href={service.href} className={styles.subtleLink}>{service.linkLabel}</a>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.serviceAreaSection} aria-labelledby="service-area-title">
          <p className={styles.kicker}>Service Area</p>
          <h2 id="service-area-title">Serving South Florida’s Most Beautiful Gatherings</h2>
          <p>Based in South Florida, Maison Lucia styles refined celebrations across West Palm Beach, Palm Beach, Wellington, Royal Palm Beach, Palm Beach Gardens, Jupiter, Delray Beach, Boca Raton, Boynton Beach, Fort Lauderdale, Miami, Coral Gables, and surrounding communities.</p>
          <div className={styles.cityPills} aria-label="Featured service areas">
            {serviceAreas.map((city) => <span key={city}>{city}</span>)}
          </div>
        </section>

        <section className={styles.faqSection} id="faq" aria-labelledby="faq-title">
          <p className={styles.kicker}>Questions</p>
          <h2 id="faq-title">Frequently Asked Questions</h2>
          <div className={styles.faqGrid}>
            {faqs.map((faq) => (
              <article key={faq.question} className={styles.faqCard}>
                <h3>{faq.question}</h3>
                <p>{faq.answer}</p>
              </article>
            ))}
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
          <form className={styles.inquiryForm} onSubmit={handleInquirySubmit} noValidate>
            <label htmlFor="inquiry-name">
              Name
              <input
                id="inquiry-name"
                name="name"
                type="text"
                autoComplete="name"
                value={inquiryForm.name}
                onChange={handleInquiryChange}
                aria-invalid={Boolean(formErrors.name)}
                aria-describedby={formErrors.name ? "inquiry-name-error" : undefined}
                required
              />
            </label>
            {formErrors.name && <p id="inquiry-name-error" className={styles.formError}>{formErrors.name}</p>}
            <label htmlFor="inquiry-email">
              Email
              <input
                id="inquiry-email"
                name="email"
                type="email"
                autoComplete="email"
                value={inquiryForm.email}
                onChange={handleInquiryChange}
                aria-invalid={Boolean(formErrors.email)}
                aria-describedby={formErrors.email ? "inquiry-email-error" : undefined}
                required
              />
            </label>
            {formErrors.email && <p id="inquiry-email-error" className={styles.formError}>{formErrors.email}</p>}
            <fieldset
              aria-invalid={Boolean(formErrors.services)}
              aria-describedby={formErrors.services ? "inquiry-services-error" : undefined}
            >
              <legend>Interested Services</legend>
              {inquiryOptions.map((option) => (
                <label key={option} className={styles.checkboxLabel}>
                  <input
                    name="services"
                    type="checkbox"
                    value={option}
                    checked={inquiryForm.services.includes(option)}
                    onChange={handleInquiryChange}
                    autoComplete="off"
                  />
                  <span>{option}</span>
                </label>
              ))}
            </fieldset>
            {formErrors.services && <p id="inquiry-services-error" className={styles.formError}>{formErrors.services}</p>}
            <label htmlFor="inquiry-event-notes">
              Event Notes
              <textarea
                id="inquiry-event-notes"
                name="eventNotes"
                rows="4"
                autoComplete="off"
                value={inquiryForm.eventNotes}
                onChange={handleInquiryChange}
                aria-invalid={Boolean(formErrors.eventNotes)}
                aria-describedby={formErrors.eventNotes ? "inquiry-event-notes-error" : undefined}
                required
              />
            </label>
            {formErrors.eventNotes && <p id="inquiry-event-notes-error" className={styles.formError}>{formErrors.eventNotes}</p>}
            <input
              type="checkbox"
              name="botcheck"
              className="hidden"
              style={{ display: "none" }}
              tabIndex={-1}
              autoComplete="off"
            />
            {submissionStatus === "success" && (
              <p className={styles.formSuccess} role="status">
                Thank you. Your inquiry has been sent to Maison Lucia. We’ll be in touch soon.
              </p>
            )}
            {submissionStatus === "error" && (
              <p className={styles.formError} role="alert">
                We’re sorry, your inquiry could not be sent. Please try again.
              </p>
            )}
            <button type="submit" className={styles.ctaButton} disabled={submissionStatus === "sending"}>
              {submissionStatus === "sending" ? "Sending…" : "Inquire Today"}
            </button>
          </form>
        </section>

        <section className={styles.journalSection} id="journal" aria-label="Journal">
          <div className={styles.journalHeader}>
            <p className={styles.kicker}>Journal</p>
            <h2>Notes on refined South Florida gatherings.</h2>
            <p>Coming soon: thoughtful hosting ideas, tablescape inspiration, and styling guidance from the Maison Lucia studio.</p>
          </div>
          <div className={styles.journalGrid}>
            {journalTopics.map((topic) => (
              <article key={topic.title} className={styles.journalCard}>
                {topic.href ? (
                  <a href={topic.href} className={styles.journalCardLink}>
                    <p>{topic.status}</p>
                    <h3>{topic.title}</h3>
                    <span className={styles.journalExcerpt}>{topic.excerpt}</span>
                    <span className={styles.journalCta}>{topic.cta}</span>
                  </a>
                ) : (
                  <>
                    <p>Coming Soon</p>
                    <h3>{topic.title}</h3>
                  </>
                )}
              </article>
            ))}
          </div>
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

        <section className={styles.instagramSection} aria-labelledby="instagram-title">
          <div className={styles.instagramIntro}>
            <p className={styles.kicker}>Instagram</p>
            <h2 id="instagram-title">Follow Our Story</h2>
            <p>
              Elegant florals, luxury tablescapes, and beautiful celebrations from across South Florida.
            </p>
            <a
              href={instagramProfileUrl}
              className={styles.instagramButton}
              target="_blank"
              rel="noopener noreferrer"
            >
              Follow @maisonlucia_llc on Instagram
            </a>
          </div>
          <div className={styles.instagramGrid} aria-label="Maison Lucia Instagram preview gallery">
            {instagramGalleryImages.map((image) => (
              <a
                key={image.src}
                href={instagramProfileUrl}
                className={styles.instagramTile}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open Maison Lucia on Instagram"
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  className={styles.instagramImage}
                  loading="lazy"
                />
                <span className={styles.instagramOverlay} aria-hidden="true">
                  <svg viewBox="0 0 24 24" focusable="false" className={styles.instagramIcon}>
                    <rect x="3" y="3" width="18" height="18" rx="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="17.5" cy="6.5" r="1" />
                  </svg>
                </span>
              </a>
            ))}
          </div>
        </section>

        <footer className={styles.footer}>
          <p className={styles.footerBrand}>Maison Lucia</p>
          <p className={styles.footerSeo}>Luxury event styling, floral styling, and tablescape design for weddings, private dinners, corporate gatherings, and refined celebrations throughout West Palm Beach, Palm Beach, Wellington, Boca Raton, Miami, and South Florida.</p>
          <ul className={styles.footerNav}>
            {footerNavLinks.map((link) => (
              <li key={link.label}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
          </ul>
          <div className={styles.footerServices}>
            <p className={styles.footerColumnTitle}>Services</p>
            <ul className={styles.footerServiceNav}>
              <li><a href="/floral-styling">Floral Styling</a></li>
              <li><a href="/tablescapes">Tablescapes</a></li>
              <li><a href="#weddings">Weddings</a></li>
              <li><a href="#corporate-events">Corporate Events</a></li>
              <li><a href="#private-dinners">Private Dinners</a></li>
              <li><a href="#contact">Inquiry</a></li>
            </ul>
          </div>
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
