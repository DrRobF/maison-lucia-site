import CoastalLayout from "../components/CoastalLayout";
import { ExperienceCards } from "../components/ExperienceCards";
import PortfolioViewer from "../components/PortfolioViewer";
import VeroInquiry from "../components/VeroInquiry";
import styles from "../styles/Coastal.module.css";

const title = "Luxury Event Styling & Private Entertaining in Vero Beach | Maison Lucia";
const description = "Maison Lucia offers refined tablescapes, floral styling, private dinners and personalized event coordination in Vero Beach and the Treasure Coast.";

export default function VeroBeach() {
 return <CoastalLayout title={title} description={description} path="/vero-beach" image="/Bluewhiteandgold.JPG" inquiryHref="#vero-inquiry">
  <div className={styles.veroPage}>
   <section className={styles.veroHero} aria-labelledby="vero-title">
    <div className={styles.veroHeroText}>
     <p className={styles.eyebrow}>Maison Lucia · Vero Beach &amp; the Treasure Coast</p>
     <h1 id="vero-title">The Art of Entertaining in Vero Beach</h1>
     <p className={styles.veroLead}>Refined gatherings inspired by coastal living.</p>
     <p>Private entertaining, beautifully curated celebrations and personalized event coordination throughout Vero Beach, the Treasure Coast and South Florida.</p>
     <a href="#vero-inquiry" className={styles.veroButton}>Inquire about your gathering</a>
    </div>
    <figure className={styles.veroHeroPhoto}><img src="/Bluewhiteandgold.JPG" alt="Original Maison Lucia blue-and-white porcelain, patterned linens, gold flatware and blue glassware" fetchPriority="high"/></figure>
   </section>
   <section id="vero-tables" className={styles.veroTables} aria-labelledby="vero-tables-title">
    <div className={styles.veroIntro}>
     <p className={styles.eyebrow}>The Art of Entertaining</p>
     <h2 id="vero-tables-title">Vero Beach Tables by Maison Lucia <span>— The Art of Coastal Entertaining</span></h2>
     <p className={styles.veroLead}>Thoughtfully curated tables. Beautifully appointed gatherings. Timeless celebrations.</p>
     <p>Inspired by the elegance of coastal living, Maison Lucia brings a refined and personal approach to entertaining, where every detail is considered and every occasion is uniquely yours.</p>
     <p className={styles.signature}>Leave everything to us and just show up to enjoy.</p>
    </div>
    <div className={styles.veroSpread}>
     <figure><img src="/Blue%20table%20.JPG" alt="Overhead Maison Lucia tablescape with six blue-and-white botanical place settings, hydrangeas and layered linens" loading="lazy"/><figcaption>Thoughtfully layered tables</figcaption></figure>
     <figure><img src="/Blueandglass.JPG" alt="Blue botanical dinner plate, glassware and white hydrangeas arranged by Maison Lucia" loading="lazy"/><figcaption>Beautifully considered details</figcaption></figure>
     <figure><img src="/coastal-blue-outdoor-web.jpg" alt="Maison Lucia outdoor blue-and-white dining table with woven chargers and hydrangeas" loading="lazy"/><figcaption>Effortless coastal entertaining</figcaption></figure>
    </div>
    <div className={styles.veroGallery} aria-label="Original Maison Lucia photo collection"><PortfolioViewer /></div>
    <a href="#vero-inquiry" className={styles.veroButton}>Inquire about private entertaining &amp; tablescape design</a>
   </section>
   <section className={styles.veroStory}>
    <figure><img src="/Blueandraffia.JPG" alt="Blue botanical dinner plates and woven raffia chargers from Maison Lucia" loading="lazy"/></figure>
    <div>
     <p className={styles.eyebrow}>Personalized hospitality</p>
     <h2>Be a Guest at Your Own Event</h2>
     <p>From an intimate dinner at home to an elegant celebration, we bring thoughtful design, floral styling, personalized planning and seamless coordination together so you can enjoy your guests.</p>
     <ul className={styles.veroList}><li>Private dinners and at-home entertaining</li><li>Seasonal celebrations and holiday gatherings</li><li>Luxury tablescapes and floral styling</li><li>Intimate weddings and rehearsal dinners</li><li>Cocktail receptions and elegant luncheons</li><li>Private estate celebrations</li></ul>
     <p className={styles.signature}>Because the true luxury of entertaining is being able to enjoy it yourself.</p>
    </div>
   </section>
   <section className={styles.veroExperiences} aria-labelledby="vero-experiences-title"><p className={styles.eyebrow}>Signature hospitality</p><h2 id="vero-experiences-title">Experiences for coastal living</h2><ExperienceCards limit={3} originalOnly inquiryPage="/vero-beach" /><a className={styles.textLink} href="/experiences">Explore all Maison Lucia experiences</a></section>
   <section className={styles.veroArea}><p className={styles.eyebrow}>Our service area</p><h2>Rooted in South Florida. Welcoming the Treasure Coast.</h2><p>Serving Vero Beach and surrounding communities, including Indian River Shores, John’s Island, Windsor, Orchid Island, The Moorings and Grand Harbor, by arrangement. Maison Lucia continues to serve clients throughout the Treasure Coast, Palm Beach and South Florida.</p></section>
   <VeroInquiry />
  </div>
 </CoastalLayout>;
}
