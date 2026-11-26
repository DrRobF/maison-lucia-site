import CoastalLayout from "../components/CoastalLayout";
import { ExperienceCards } from "../components/ExperienceCards";
import styles from "../styles/Coastal.module.css";
import LifestylePhoto from "../components/LifestylePhoto";
export default function Experiences() {
  return <CoastalLayout title="Private Entertaining & Event Styling Experiences | Maison Lucia" description="Explore Maison Lucia’s private dinners, seasonal gatherings, dining experiences, estate events and boutique concierge services in Vero Beach, Palm Beach and South Florida." path="/experiences">
    <section className={styles.cover}><LifestylePhoto kind="dinner" priority className={styles.coverPhoto}/><div className={styles.coverContent}><p className={styles.coverKicker}>Maison Lucia experiences</p><h1>Beautiful gatherings.<br />Effortless hosting.</h1><p className={styles.coverLead}>Personalized hospitality, thoughtfully curated.</p><a className={styles.lightButton} href="/#contact">Plan Your Gathering</a></div></section>
    <section className={styles.manifesto}><p className={styles.eyebrow}>Designed around you</p><h2>Make room for meaningful moments.</h2><p>From intimate dinners at home to estate celebrations, discover an experience designed around you and your guests.</p></section>
    <section className={styles.section}><p className={styles.eyebrow}>Our offerings</p><h2>Find your experience</h2><ExperienceCards /></section>
    <section className={styles.callout}><h2>Refined details, beautifully considered.</h2><p>Explore our original styling services and signature collections.</p><div className={styles.links}><a href="/floral-styling">Floral styling</a><a href="/tablescapes">Luxury tablescapes</a><a href="/#signature-collections">Signature collections</a><a href="/vero-beach">Vero Beach entertaining</a><a href="/#weddings">Weddings</a><a href="/#corporate-events">Corporate events</a></div></section>
  </CoastalLayout>;
}
