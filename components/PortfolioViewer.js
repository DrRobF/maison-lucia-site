import { useEffect, useState } from "react";
import styles from "../styles/Coastal.module.css";

// Only photographs confirmed as Veronica's own work belong in this gallery.
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
    "coastal-blue-outdoor-web.jpg",
    "Outdoor blue-and-white dining table with hydrangeas and woven place mats"
  ],
  [
    "Bluewhiteandgold.JPG",
    "Blue and white porcelain with gold flatware and blue glassware"
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
    "coastal-blue-wood-web.jpg",
    "Blue gingham linens, patterned china and a wooden charger"
  ],
  [
    "coastal-red-white-overhead-web.jpg",
    "Overhead red and white floral centerpiece with blue place settings"
  ]
];
export const photoUrl = filename => "/" + encodeURIComponent(filename);
export default function PortfolioViewer() {
  const [index,setIndex] = useState(0);
  const [playing,setPlaying] = useState(false);
  const [hovered,setHovered] = useState(false);
  const [focused,setFocused] = useState(false);
  const [failed,setFailed] = useState([]);
  const photos = portfolioPhotos.filter(([file]) => !failed.includes(file));
  const total=photos.length;
  const position=total?index%total:0;
  const current=photos[position];
  const adjacent=offset=>photos[(position+offset+total)%total];
  const move=offset=>setIndex(i=>total?(i+offset+total)%total:0);
  const markFailed=file=>setFailed(previous=>previous.includes(file)?previous:[...previous,file]);
  useEffect(()=>{
    const preference=window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply=()=>setPlaying(!preference.matches);
    apply(); preference.addEventListener("change",apply);
    return ()=>preference.removeEventListener("change",apply);
  },[]);
  useEffect(()=>{
    if(!playing||hovered||focused||total<2)return;
    const timer=window.setInterval(()=>setIndex(i=>(i+1)%total),5000);
    return ()=>window.clearInterval(timer);
  },[playing,hovered,focused,total]);
  if(!current)return <p>Our portfolio is temporarily unavailable. Please revisit shortly.</p>;
  return <div className={styles.viewer} role="region" aria-roledescription="carousel" aria-label="Maison Lucia original portfolio photographs"
    onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)}
    onFocus={()=>setFocused(true)} onBlur={event=>{if(!event.currentTarget.contains(event.relatedTarget))setFocused(false)}}
    onKeyDown={event=>{if(event.key==="ArrowLeft"){event.preventDefault();move(-1)}else if(event.key==="ArrowRight"){event.preventDefault();move(1)}}}>
    <div className={styles.viewerStage}>
      <button type="button" className={styles.viewerSide} onClick={()=>move(-1)} aria-label="Previous photograph"><img src={photoUrl(adjacent(-1)[0])} onError={()=>markFailed(adjacent(-1)[0])} alt="" /></button>
      <figure className={styles.viewerMain}><img key={current[0]} src={photoUrl(current[0])} alt={current[1]} onError={()=>markFailed(current[0])} className={styles.viewerImage} /></figure>
      <button type="button" className={styles.viewerSide} onClick={()=>move(1)} aria-label="Next photograph"><img src={photoUrl(adjacent(1)[0])} onError={()=>markFailed(adjacent(1)[0])} alt="" /></button>
    </div>
    <div className={styles.viewerBar}>
      <div className={styles.viewerCaption} aria-live={playing?"off":"polite"}><span>{String(position+1).padStart(2,"0")} / {total}</span><span>{current[1]}</span></div>
      <div className={styles.viewerControls}><button type="button" onClick={()=>move(-1)} aria-label="Previous photograph">←</button><button type="button" onClick={()=>setPlaying(p=>!p)}>{playing?"Pause":"Play"}</button><button type="button" onClick={()=>move(1)} aria-label="Next photograph">→</button></div>
    </div>
    <div className={styles.viewerThumbs} aria-label="Choose a photograph">{photos.map(([filename,alt],i)=><button key={filename} type="button" aria-label={`View photograph ${i+1}: ${alt}`} aria-current={i===position?"true":undefined} onClick={()=>setIndex(i)}><img src={photoUrl(filename)} onError={()=>markFailed(filename)} alt="" /></button>)}</div>
  </div>;
}
