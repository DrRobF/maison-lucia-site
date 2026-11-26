import CoastalLayout from "../components/CoastalLayout";
import { ExperienceCards } from "../components/ExperienceCards";
import styles from "../styles/Coastal.module.css";
export default function Experiences() {
  return <CoastalLayout title="Private Entertaining & Event Styling Experiences | Maison Lucia" description="Explore Maison Lucia’s private dinners, seasonal gatherings, dining experiences, estate events and boutique concierge services in Vero Beach, Palm Beach and South Florida." path="/experiences">
    <section className={styles.hero}><div><p className={styles.eyebrow}>Maison Lucia experiences</p><h1>Beautiful gatherings. Effortless hosting.</h1><p className={styles.lead}>Personalized hospitality, thoughtfully curated.</p><p>From intimate dinners at home to estate celebrations, discover an experience designed around you and your guests.</p><a className={styles.button} href="/#contact">Plan Your Gathering</a></div><img src="/table%20setup%201.jpg" alt="Elegant layered private dinner table with candlelight" /></section>
    <section className={styles.section}><p className={styles.eyebrow}>Our offerings</p><h2>Find your experience</h2><ExperienceCards /></section>
    <section className={styles.callout}><h2>Refined details, beautifully considered.</h2><p>Explore our original styling services and signature collections.</p><div className={styles.links}><a href="/floral-styling">Floral styling</a><a href="/tablescapes">Luxury tablescapes</a><a href="/#signature-collections">Signature collections</a><a href="/vero-beach">Vero Beach entertaining</a><a href="/#weddings">Weddings</a><a href="/#corporate-events">Corporate events</a></div></section>
  </CoastalLayout>;
}
