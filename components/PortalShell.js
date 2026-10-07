import Head from 'next/head';
import styles from '../styles/Portal.module.css';

export async function portalApi(action, data, projectId) {
  const response = await fetch(`/api/portal/${action}${projectId ? `?projectId=${encodeURIComponent(projectId)}` : ''}`, {
    method: data ? 'POST' : 'GET', cache: 'no-store',
    headers: data ? { 'Content-Type': 'application/json' } : undefined,
    body: data ? JSON.stringify(data) : undefined,
  });
  const result = await response.json();
  if (!response.ok) { const error = new Error(result.error || 'Please try again.'); error.status = response.status; throw error; }
  return result;
}
export async function readImages(files) {
  if (files.length > 3) throw new Error('Choose up to three images at a time.');
  return Promise.all(Array.from(files).map(file => new Promise((resolve, reject) => {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 8 * 1024 * 1024) return reject(new Error('Choose JPG, PNG, or WebP images under 8 MB.'));
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('This image could not be read.'));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error('This image could not be opened.'));
      image.onload = () => {
        const scale = Math.min(1, 1200 / Math.max(image.width, image.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(image.width * scale); canvas.height = Math.round(image.height * scale);
        const ctx = canvas.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        const result = canvas.toDataURL('image/jpeg', 0.72);
        if (result.length > 700000) reject(new Error('This image is too detailed. Please use a smaller version.')); else resolve(result);
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  })));
}
export function InspirationLinks() {
  return <div className={styles.tools}><a href="https://atmos.maisonluciallc.com/" target="_blank" rel="noopener noreferrer">Explore Atmos</a><a href="https://color.adobe.com/create/color-wheel" target="_blank" rel="noopener noreferrer">Explore color palettes</a></div>;
}
export default function PortalShell({ title, children, privatePage = false }) {
  return <div className={styles.page}>
    <Head><title>{title} | Maison Lucia</title>{privatePage && <meta name="robots" content="noindex,nofollow" />}</Head>
    <header className={styles.header}><a className={styles.brand} href="/">Maison Lucia</a><nav aria-label="Client navigation"><a href="/event-questionnaire">Plan Your Event</a><a href="/portal">Client Portal</a></nav></header>
    <main className={styles.main}>{children}</main>
    <footer className={styles.footer}><a href="/">Maison Lucia LLC</a><a href="/#contact">Contact Maison Lucia</a></footer>
  </div>;
}
