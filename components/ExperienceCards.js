import styles from "../styles/Coastal.module.css";
export const experiences = [
  { title: "Private Entertaining", copy: "Intimate dinners, birthdays, anniversaries and special gatherings at private residences.", price: "Starting at $950", image: "/table%20setup%201.jpg", alt: "Layered dinner table with candles and refined place settings" },
  { title: "Seasonal Living", copy: "Holiday table styling, seasonal welcome-back dinners and festive gatherings.", price: "Starting at $750", image: "/table%20blue%20setup%201.jpg", alt: "Elegant blue-toned tablescape with glassware and florals" },
  { title: "The Maison Lucia Dining Experience", copy: "Tablescape design, florals, private chef coordination, staffing arrangements and event logistics.", price: "Starting at $1,500", image: "/table%20setup%202.jpg", alt: "Layered Maison Lucia dining table setting" },
  { title: "Estate Events", copy: "Personalized celebrations at private homes and estates, with vendor coordination, design and on-site execution.", price: "Starting at $2,500", image: "/formal-table-setting-ml.PNG", alt: "Formal table setting with layered tableware" },
  { title: "Concierge — By Request", copy: "Special occasion arrangements, guest welcome amenities, gifting and personalized hospitality coordination.", price: "Custom quote", image: "/lacesilverwhite.webp", alt: "White floral arrangement with silver accents" },
];
export const inquiryLink = (title) => "/?experience=" + encodeURIComponent(title) + "#contact";
export function ExperienceCards({ limit }) {
  return <><div className={styles.cards}>{experiences.slice(0,limit ?? experiences.length).map(item => (
    <article key={item.title} className={styles.card}>
      <img src={item.image} alt={item.alt} loading="lazy" />
      <div className={styles.cardBody}><h3>{item.title}</h3><p>{item.copy}</p>
        <p className={styles.price}>{item.price}</p><a className={styles.button} href={inquiryLink(item.title)}>Inquire<span className={styles.srOnly}> about {item.title}</span></a></div>
    </article>
  ))}</div><p className={styles.finePrint}>Food, rentals, staffing, premium florals and other third-party costs are quoted separately.</p></>;
}
