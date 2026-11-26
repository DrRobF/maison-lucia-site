import CoastalLayout from "../components/CoastalLayout";
import { ExperienceCards } from "../components/ExperienceCards";
import styles from "../styles/Coastal.module.css";
const title = "Luxury Event Styling & Private Entertaining in Vero Beach | Maison Lucia";
const description = "Maison Lucia offers refined tablescapes, floral styling, private dinners and personalized event coordination in Vero Beach and the Treasure Coast.";
export default function VeroBeach() {
  return <CoastalLayout title={title} description={description} path="/vero-beach">
    <section className={styles.hero}><div><p className={styles.eyebrow}>Vero Beach &amp; the Treasure Coast</p><h1>The Art of Entertaining in Vero Beach</h1>
      <p className={styles.lead}>Refined gatherings inspired by coastal living.</p>
      <p>Maison Lucia brings thoughtful design, personalized service and effortless entertaining to Vero Beach and the Treasure Coast.</p>
      <p>Whether you are welcoming friends into your oceanfront residence, hosting a seasonal gathering, celebrating a milestone or planning an intimate dinner, we create an atmosphere that feels sophisticated, personal and inviting.</p>
      <p>Our approach combines beautifully curated details with seamless coordination, allowing you to spend less time preparing and more time enjoying your guests.</p>
      <a className={styles.button} href="/#contact">Discover the Maison Lucia Experience</a></div>
      <img src="/table%20blue%20setup%201.jpg" alt="Refined blue and white tablescape with florals and glassware" />
    </section>
    <section className={styles.editorial}><img src="/lacesilverwhite.webp" alt="White floral centerpiece and silver table accents" loading="lazy" /><div>
      <p className={styles.eyebrow}>Personalized hospitality</p><h2>Thoughtfully designed for your lifestyle</h2>
      <ul className={styles.list}><li>Private dinners and at-home entertaining</li><li>Seasonal celebrations and holiday gatherings</li><li>Luxury tablescapes and floral styling</li><li>Intimate weddings and rehearsal dinners</li><li>Cocktail receptions and elegant luncheons</li><li>Private estate celebrations</li></ul>
      <p className={styles.signature}>Because the true luxury of entertaining is being able to enjoy it yourself.</p></div>
    </section>
    <section className={styles.section}><p className={styles.eyebrow}>Signature hospitality</p><h2>Experiences for coastal living</h2><ExperienceCards limit={3} /><a className={styles.button} href="/experiences">Explore all experiences</a></section>
    <section className={styles.callout}><p className={styles.eyebrow}>Our service area</p><h2>Vero Beach &amp; surrounding communities</h2><p>Serving Vero Beach and surrounding communities, including Indian River Shores, John’s Island, Windsor, Orchid Island, The Moorings and Grand Harbor, by arrangement.</p><a href="/#contact" className={styles.button}>Discover the Maison Lucia Experience</a></section>
  </CoastalLayout>;
}
