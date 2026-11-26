import styles from "../styles/Home.module.css";

const serviceLinks = [
  { label: "Experiences", href: "/experiences" },
  { label: "Floral Styling", href: "/floral-styling" },
  { label: "Tablescapes", href: "/tablescapes" },
];
const navLinks = [
  { label: "Home", href: "/" },
  { label: "Experiences", href: "/experiences" },
  { label: "Vero Beach", href: "/vero-beach" },
  { label: "Gallery", href: "/#gallery" },
  { label: "About", href: "/#about" },
  { label: "Journal", href: "/#journal" },
  { label: "Contact", href: "/#contact" },
  { label: "Client Portal", href: "/portal" },
];
export { navLinks, serviceLinks };
export default function PrimaryNav() {
  return <nav aria-label="Primary"><ul className={styles.menuList}>
    {navLinks.map(link => <li key={link.label}><a href={link.href}>{link.label}</a></li>)}
  </ul></nav>;
}
