import Head from "next/head";
import PrimaryNav from "../../components/PrimaryNav";
import styles from "../../styles/Home.module.css";

const articleUrl = "https://www.maisonluciallc.com/journal/how-to-host-an-elegant-dinner-party-in-wellington";

const categories = [
  "Entertaining",
  "Tablescapes",
  "Floral Styling",
  "Wellington",
  "South Florida",
];

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "How to Host an Elegant Dinner Party in Wellington",
  description:
    "Discover elegant dinner party ideas for Wellington, Florida, including luxury tablescapes, floral styling, ambiance, and thoughtful entertaining details from Maison Lucia.",
  image: "https://www.maisonluciallc.com/table%20setup%201.jpg",
  datePublished: "2026-07-10",
  dateModified: "2026-07-10",
  author: {
    "@type": "Organization",
    name: "Maison Lucia",
  },
  publisher: {
    "@type": "Organization",
    name: "Maison Lucia LLC",
    url: "https://www.maisonluciallc.com",
  },
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": articleUrl,
  },
  keywords: categories.join(", "),
};

export default function WellingtonDinnerPartyJournal() {
  return (
    <>
      <Head>
        <title>How to Host an Elegant Dinner Party in Wellington | Maison Lucia</title>
        <meta
          name="description"
          content="Discover elegant dinner party ideas for Wellington, Florida, including luxury tablescapes, floral styling, ambiance, and thoughtful entertaining details from Maison Lucia."
        />
        <link rel="canonical" href={articleUrl} />
        <meta property="og:title" content="How to Host an Elegant Dinner Party in Wellington | Maison Lucia" />
        <meta property="og:description" content="Discover elegant dinner party ideas for Wellington, Florida, including luxury tablescapes, floral styling, ambiance, and thoughtful entertaining details from Maison Lucia." />
        <meta property="og:url" content={articleUrl} />
        <meta property="og:type" content="article" />
        <meta property="article:published_time" content="2026-07-10" />
        {categories.map((category) => (
          <meta property="article:tag" content={category} key={category} />
        ))}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleStructuredData) }} />
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

        <article className={styles.articlePage}>
          <section className={styles.articleHero}>
            <div className={styles.articleHeroText}>
              <p className={styles.kicker}>Journal</p>
              <h1>How to Host an Elegant Dinner Party in Wellington</h1>
              <div className={styles.articleMeta}>
                <span>July 10, 2026</span>
                <span>4 minute read</span>
              </div>
              <p className={styles.articleExcerpt}>
                Create a memorable Wellington dinner party with elegant tablescapes, seasonal florals, layered details, and thoughtful styling that makes entertaining feel effortless.
              </p>
              <div className={styles.articleTags} aria-label="Article categories">
                {categories.map((category) => <span key={category}>{category}</span>)}
              </div>
            </div>
            <figure className={styles.articleHeroImageWrap}>
              <img src="/table%20setup%201.jpg" alt="Elegant candlelit Maison Lucia dinner table styling" className={styles.articleHeroImage} />
            </figure>
          </section>

          <div className={styles.articleContent}>
            <p>There is something timeless about gathering around a beautifully set table. Whether you’re celebrating a birthday, hosting a holiday gathering, welcoming friends to your home, or simply creating an unforgettable evening, an elegant dinner party is about far more than the meal itself. It’s about creating an experience your guests will remember long after dessert has been served.</p>
            <p>At Maison Lucia, we believe every table tells a story.</p>

            <h2>Start With the Atmosphere</h2>
            <p>The most memorable dinner parties begin before anyone takes a seat. Soft lighting, thoughtfully chosen florals, candles, layered textures, and carefully selected décor create an inviting atmosphere that immediately makes guests feel welcome.</p>
            <p>Rather than overwhelming a space with decorations, focus on intentional details that complement your home’s style and allow conversation to remain the centerpiece of the evening.</p>

            <h2>Let the Table Be the Star</h2>
            <p>A beautifully designed tablescape transforms an ordinary meal into something extraordinary.</p>
            <p>Consider incorporating:</p>
            <ul>
              <li>Fresh seasonal florals</li>
              <li>Elegant charger plates</li>
              <li>Layered linens and napkins</li>
              <li>Coordinated glassware</li>
              <li>Candles for warmth and ambiance</li>
              <li>Personalized place settings</li>
              <li>Natural textures that add depth without clutter</li>
            </ul>
            <p>The goal isn’t extravagance. It’s harmony. Every piece should feel like it belongs together.</p>

            <h2>Keep Your Guests Comfortable</h2>
            <p>Elegant entertaining should never feel formal or intimidating.</p>
            <p>Create seating arrangements that encourage conversation, leave plenty of room between place settings, and keep serving dishes accessible. A relaxed host creates relaxed guests, so prepare as much as possible before everyone arrives.</p>

            <h2>Bring Nature Indoors</h2>
            <p>South Florida offers endless inspiration. Soft whites, lush greenery, textured foliage, and seasonal blooms create a sophisticated look that feels both luxurious and welcoming.</p>
            <p>Fresh floral arrangements don’t need to dominate the table. They simply need to enhance it.</p>

            <h2>Think Beyond the Meal</h2>
            <p>Some of the most memorable evenings are remembered because of the little moments.</p>
            <p>A signature welcome drink.</p>
            <p>Handwritten place cards.</p>
            <p>Background music that never overpowers conversation.</p>
            <p>Fresh flowers greeting guests at the entrance.</p>
            <p>A beautifully styled dessert display.</p>
            <p>These thoughtful touches create an experience that guests genuinely remember.</p>

            <h2>Hosting in Wellington</h2>
            <p>Wellington is known for gracious homes, beautiful outdoor spaces, and a lifestyle that naturally lends itself to entertaining. Whether you’re planning an intimate dinner for close friends or a larger celebration with family, professional floral styling and custom tablescapes allow you to enjoy your own event instead of spending the evening worrying about every detail.</p>
            <p>Maison Lucia specializes in creating elegant floral designs and luxury tablescapes that reflect your personal style while making every gathering feel effortless and refined.</p>

            <h2>Let Us Help You Create Something Beautiful</h2>
            <p>If you’re planning a dinner party, bridal shower, holiday gathering, anniversary celebration, or private event in Wellington or throughout South Florida, we’d love to help bring your vision to life.</p>
            <p>Explore our <a href="/floral-styling">Floral Styling</a> and <a href="/tablescapes">Tablescapes</a> services, and let Maison Lucia transform your next gathering into an unforgettable experience, one beautiful table at a time.</p>
            <a href="/#contact" className={styles.ctaButton}>Plan Your Event</a>
          </div>
        </article>

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
