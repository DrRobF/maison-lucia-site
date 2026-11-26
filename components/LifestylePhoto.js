import { useState } from "react";
import styles from "../styles/Coastal.module.css";

// Replace these editorial sources with Maison Lucia's own coastal photography as it becomes available.
const sources = {
  residence: {url:"https://images.unsplash.com/photo-1793891703775-1917fee884e5?auto=format&fit=crop&w=2400&q=82",credit:"Alef Morais",link:"https://unsplash.com/photos/RkQrl-toscw",alt:"Sunlit dining room overlooking the ocean and palms",fallback:"/table%20blue%20setup%201.jpg",fallbackAlt:"Maison Lucia blue-toned table styling"},
  sunset: {url:"https://images.unsplash.com/photo-1778694276945-a3ee92331709?auto=format&fit=crop&w=2200&q=82",credit:"Romain Gal",link:"https://unsplash.com/photos/rGAoOn1p_e0",alt:"Elegant dinner setting beside a window overlooking the sea at sunset",fallback:"/table%20setup%201.jpg",fallbackAlt:"Maison Lucia candlelit table setting"},
  dinner: {url:"https://images.unsplash.com/photo-1781090876896-2dd07110eb55?auto=format&fit=crop&w=1800&q=82",credit:"milla Huyskens",link:"https://unsplash.com/photos/g-tdTXC1VDE",alt:"Outdoor dining table arranged with flowers, candles and glassware",fallback:"/lacesilverwhite.webp",fallbackAlt:"Maison Lucia white floral and silver table details"},
};
export default function LifestylePhoto({ kind, priority=false, className="" }) {
  const photo = sources[kind];
  const [fallback,setFallback] = useState(false);
  return <figure className={styles.lifestylePhoto+" "+className}>
    <img src={fallback?photo.fallback:photo.url} alt={fallback?photo.fallbackAlt:photo.alt} onError={()=>setFallback(true)} loading={priority?"eager":"lazy"} fetchPriority={priority?"high":"auto"} />
    {!fallback && <figcaption>Coastal lifestyle inspiration · <a href={photo.link} target="_blank" rel="noreferrer">{photo.credit} / Unsplash</a></figcaption>}
  </figure>;
}
