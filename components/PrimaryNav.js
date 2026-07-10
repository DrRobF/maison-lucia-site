import { useState } from "react";
import styles from "../styles/Home.module.css";

const serviceLinks = [
  { label: "Services Overview", href: "/#services" },
  { label: "Floral Styling", href: "/floral-styling" },
  { label: "Tablescapes", href: "/tablescapes" },
];

const navLinks = [
  { label: "Gallery", href: "/#gallery" },
  { label: "About", href: "/#about" },
  { label: "Journal", href: "/#journal" },
  { label: "FAQ", href: "/#faq" },
  { label: "Contact", href: "/#contact" },
];

export { navLinks, serviceLinks };

export default function PrimaryNav() {
  const [isServicesOpen, setIsServicesOpen] = useState(false);

  const closeServices = () => setIsServicesOpen(false);
  const toggleServices = () => setIsServicesOpen((isOpen) => !isOpen);

  return (
    <nav aria-label="Primary">
      <ul className={styles.menuList}>
        <li
          className={styles.navItemDropdown}
          onMouseEnter={() => setIsServicesOpen(true)}
          onMouseLeave={() => setIsServicesOpen(false)}
          onFocus={() => setIsServicesOpen(true)}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) {
              closeServices();
            }
          }}
        >
          <button
            type="button"
            className={styles.navDropdownButton}
            aria-haspopup="true"
            aria-expanded={isServicesOpen}
            aria-controls="services-menu"
            onClick={toggleServices}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                closeServices();
              }
            }}
          >
            Services
          </button>
          <ul
            id="services-menu"
            className={styles.dropdownMenu}
            aria-label="Services submenu"
            data-open={isServicesOpen}
          >
            {serviceLinks.map((link) => (
              <li key={link.label}>
                <a href={link.href} onClick={closeServices}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </li>
        {navLinks.map((link) => (
          <li key={link.label}>
            <a href={link.href}>{link.label}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
