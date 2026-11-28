import styles from "../styles/Coastal.module.css";
export const experiences = [
  { title: "Private Entertaining", copy: "Intimate dinners, birthdays, anniversaries and special gatherings at private residences.", price: "Starting at $950", image: "/table%20setup%201.jpg", alt: "Layered dinner table with candles and refined place settings" },
  { title: "Seasonal Living", copy: "Holiday table styling, seasonal welcome-back dinners and festive gatherings.", price: "Starting at $750", image: "/Blue%20table%20.JPG", alt: "Blue-and-white seasonal tablescape with navy botanical plates and white hydrangeas" },
  { title: "The Maison Lucia Dining Experience", copy: "Tablescape design, florals, private chef coordination, staffing arrangements and event logistics.", price: "Starting at $1,500", image: "/Blueandglass.JPG", alt: "Maison Lucia navy botanical plate with glassware, blue vases and white hydrangeas" },
  { title: "Estate Events", copy: "Personalized celebrations at private homes and estates, with vendor coordination, design and on-site execution.", price: "Starting at $2,500", image: "/formal-table-setting-ml.PNG", alt: "Formal table setting with layered tableware" },
  { title: "Concierge — By Request", copy: "Special occasion arrangements, guest welcome amenities, gifting and personalized hospitality coordination.", price: "Custom quote", image: "/lacesilverwhite.webp", alt: "White floral arrangement with silver accents" },
];
const coastalPhotos = [
 ["/coastal-blue-outdoor-web.jpg","Outdoor blue-and-white Maison Lucia tablescape with hydrangeas"],
 ["/Blue%20table%20.JPG","Overhead blue-and-white seasonal tablescape"],
 ["/Blueandglass.JPG","Botanical porcelain, glassware and white hydrangeas"],
 ["/Blueredandwhite.JPG","Red roses, white hydrangeas and blue tableware"],
 ["/coastal-blue-wood-web.jpg","Blue gingham, patterned porcelain and wooden charger"],
];
const generalPhotos = [
 ["/table%20setup%201.jpg","Layered private dinner table styling"],
 ["/white-red.webp","White and red seasonal floral details"],
 ["/table%20setup%202.jpg","Layered dining table arrangement"],
 ["/table%20blue%20setup%201.jpg","Blue-toned tablescape and glassware"],
 ["/lacesilverwhite.webp","White floral details with silver accents"],
];
export const inquiryLink = (title) => "/?experience=" + encodeURIComponent(title) + "#contact";
export function ExperienceCards({ limit, inquiryPage, originalOnly = false }) {
  return <><div className={styles.cards}>{experiences.slice(0,limit ?? experiences.length).map((item,index) => (
    <article key={item.title} className={styles.card}>
      <img src={originalOnly ? coastalPhotos[index][0] : generalPhotos[index][0]} alt={originalOnly ? coastalPhotos[index][1] : generalPhotos[index][1]} loading="lazy" />
      <div className={styles.cardBody}><h3>{item.title}</h3><p>{item.copy}</p>
        <p className={styles.price}>{item.price}</p><a className={styles.button} href={inquiryPage ? inquiryPage + "?experience=" + encodeURIComponent(item.title) + "#vero-inquiry" : inquiryLink(item.title)}>Inquire<span className={styles.srOnly}> about {item.title}</span></a></div>
    </article>
  ))}</div><p className={styles.finePrint}>Food, rentals, staffing, premium florals and other third-party costs are quoted separately.</p></>;
}
