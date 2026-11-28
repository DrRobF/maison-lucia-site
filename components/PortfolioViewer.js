import { useEffect, useState } from "react";
import styles from "../styles/Coastal.module.css";

export const portfolioPhotos = [
  [
    "Blue table .JPG",
    "Overhead blue-and-white tablescape with hydrangeas and six place settings"
  ],
  [
    "Blueandglass.JPG",
    "Navy botanical dinner plate, clear glassware and white hydrangeas"
  ],
  [
    "coastal-blue-outdoor.jpg",
    "Outdoor blue-and-white dining table with hydrangeas and woven place mats"
  ],
  [
    "Bluewhiteandgold.JPG",
    "Blue and white porcelain with gold flatware and blue glassware"
  ],
  [
    "table setup 1.jpg",
    "Layered dinner table with candlelight"
  ],
  [
    "Blueredandwhite.JPG",
    "Red roses and white hydrangeas with navy blue tableware"
  ],
  [
    "Blueandraffia.JPG",
    "Blue botanical plates and woven raffia chargers"
  ],
  [
    "coastal-blue-wood.jpg",
    "Blue gingham linens, patterned china and a wooden charger"
  ],
  [
    "coastal-red-white-overhead.jpg",
    "Overhead red and white floral centerpiece with blue place settings"
  ],
  [
    "table setup 2.jpg",
    "Layered dining table arrangement"
  ],
  [
    "table blue setup 1.jpg",
    "Blue-toned table setting with florals"
  ],
  [
    "casual-table-setting-ml.PNG",
    "Casual table setting"
  ],
  [
    "formal-table-setting-ml.PNG",
    "Formal table setting"
  ],
  [
    "beige-floral1.jpg",
    "Neutral floral composition"
  ],
  [
    "beige-floral2.jpg",
    "Soft beige floral details"
  ],
  [
    "cocktail detail 1.jpg",
    "Cocktail styling detail"
  ],
  [
    "colors-floral1.jpg",
    "Colorful floral arrangement"
  ],
  [
    "floral-blue-2.jpg",
    "Blue floral composition"
  ],
  [
    "floral-blue1.jpg",
    "Blue floral detail"
  ],
  [
    "green-purple-gold.PNG",
    "Green, purple and gold styling palette"
  ],
  [
    "italian-gerbera-tomato.webp",
    "Italian gerbera floral composition"
  ],
  [
    "italiangerbera1.webp",
    "Gerbera floral styling detail"
  ],
  [
    "lacesilverwhite.webp",
    "White lace and silver floral details"
  ],
  [
    "lillyofthevalley.webp",
    "Garden-inspired white floral detail"
  ],
  [
    "napkin detail 1 .jpg",
    "Refined napkin detail"
  ],
  [
    "napkin-setting 2.jpg",
    "Styled napkin and place setting"
  ],
  [
    "purplepeachpink.webp",
    "Purple, peach and pink blooms"
  ],
  [
    "purplepeachpinkwhite.webp",
    "Purple, peach, pink and white florals"
  ],
  [
    "red-white-blue.webp",
    "Red, white and blue floral styling"
  ],
  [
    "red-white-blue1.webp",
    "Red, white and blue floral details"
  ],
  [
    "redwhitesmall (1).webp",
    "Petite floral arrangement"
  ],
  [
    "sunflower white.webp",
    "White sunflower arrangement"
  ],
  [
    "white lace.webp",
    "White florals and lace"
  ],
  [
    "white-red.webp",
    "White and red floral details"
  ],
  [
    "whiteblue .webp",
    "White and blue floral arrangement"
  ]
];
export const photoUrl = (filename) => "/" + encodeURIComponent(filename);
const total = portfolioPhotos.length;

export default function PortfolioViewer() {
  const [index,setIndex] = useState(0);
  const [playing,setPlaying] = useState(false);
  const [hovered,setHovered] = useState(false);
  const [focused,setFocused] = useState(false);
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setPlaying(!preference.matches);
    apply(); preference.addEventListener("change",apply);
    return () => preference.removeEventListener("change",apply);
  }, []);
  useEffect(() => {
    if (!playing || hovered || focused) return;
    const timer = window.setInterval(() => setIndex(i => (i+1)%total),5000);
    return () => window.clearInterval(timer);
  },[playing,hovered,focused]);
  const move = (offset) => setIndex(i => (i+offset+total)%total);
  const current=portfolioPhotos[index];
  const adjacent = (offset) => portfolioPhotos[(index+offset+total)%total];
  return <div className={styles.viewer} role="region" aria-roledescription="carousel" aria-label="Maison Lucia portfolio photographs"
    onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)}
    onFocus={()=>setFocused(true)} onBlur={event=>{if(!event.currentTarget.contains(event.relatedTarget))setFocused(false)}}
    onKeyDown={event=>{if(event.key==="ArrowLeft"){event.preventDefault();move(-1)}else if(event.key==="ArrowRight"){event.preventDefault();move(1)}}}>
    <div className={styles.viewerStage}>
      <button type="button" className={styles.viewerSide} onClick={()=>move(-1)} aria-label="Previous photograph"><img src={photoUrl(adjacent(-1)[0])} alt="" loading="lazy" /></button>
      <figure className={styles.viewerMain}>
        <img key={current[0]} src={photoUrl(current[0])} alt={current[1]} className={styles.viewerImage} />
      </figure>
      <button type="button" className={styles.viewerSide} onClick={()=>move(1)} aria-label="Next photograph"><img src={photoUrl(adjacent(1)[0])} alt="" loading="lazy" /></button>
    </div>
    <div className={styles.viewerBar}>
      <div className={styles.viewerCaption} aria-live={playing?"off":"polite"}><span>{String(index+1).padStart(2,"0")} / {total}</span><span>{current[1]}</span></div>
      <div className={styles.viewerControls}><button type="button" onClick={()=>move(-1)} aria-label="Previous photograph">←</button><button type="button" onClick={()=>setPlaying(p=>!p)}>{playing?"Pause":"Play"}</button><button type="button" onClick={()=>move(1)} aria-label="Next photograph">→</button></div>
    </div>
    <div className={styles.viewerThumbs} aria-label="Choose a photograph">{portfolioPhotos.map(([filename,alt],i)=><button key={filename} type="button" aria-label={`View photograph ${i+1}: ${alt}`} aria-current={i===index?"true":undefined} onClick={()=>setIndex(i)}><img src={photoUrl(filename)} alt="" loading="lazy" /></button>)}</div>
  </div>;
}
