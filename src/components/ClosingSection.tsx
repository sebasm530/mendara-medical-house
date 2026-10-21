import styles from "./ClosingSection.module.css";
import { ExternalLink, MapPin } from "lucide-react";
import { footerLinks } from "@/data/footerLinks";

/** Símbolos reconocibles equivalentes; no requieren paquetes de marcas. */
function SocialIcon({ platform }: { platform: "instagram" | "facebook" }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      {platform === "instagram" ? (
        <g stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
        </g>
      ) : (
        <path fill="currentColor" d="M15 3h-3a4 4 0 0 0-4 4v3H5v4h3v7h4v-7h3l1-4h-4V7a1 1 0 0 1 1-1h2V3Z" />
      )}
    </svg>
  );
}

export function ClosingSection() {
  return (
    <footer data-motion-group="closing" className={styles.footer}>
      <div className={styles.inner}>
        {/* Tratamiento tipográfico provisional anterior, restaurado en fase 6A. */}
        <div data-motion="fade" className={styles.wordmark} role="img" aria-label="Mendara Medical House">
          <span className={styles.name} aria-hidden="true">Mendara</span>
          <span className={styles.descriptor} aria-hidden="true">Medical House</span>
        </div>
        <div data-motion="fade" className={styles.editorial}><p>Un hogar para quienes<br />hacen de cuidar su vocación.</p><span data-motion="line" data-motion-delay="0.2" aria-hidden="true" /></div>
      </div>
      <div className={styles.bottom}>
        <div className={styles.bottomInner}>
          <p className={styles.copyright}>© 2026 Mendara Medical House. Todos los derechos reservados.</p>
          <div className={styles.links}>
            <ul className={styles.socials} aria-label="Redes sociales de Mendara">
              {footerLinks.social.map(({ platform, label, url }) => (
                <li key={platform}>
                  {url ? (
                    <a className={styles.socialLink} href={url} target="_blank" rel="noopener noreferrer" aria-label={`${label} (abre en una nueva pestaña)`}>
                      <SocialIcon platform={platform} />
                    </a>
                  ) : (
                    <span className={styles.socialPending} role="img" aria-label={`${label}: enlace pendiente de configuración`}>
                      <SocialIcon platform={platform} />
                    </span>
                  )}
                </li>
              ))}
            </ul>
            <a className={styles.patientLink} href={footerLinks.patients} target="_blank" rel="noopener noreferrer">
              <span>Sitio web para pacientes<span className="sr-only"> (abre en una nueva pestaña)</span></span>
              <ExternalLink size={14} strokeWidth={1.5} aria-hidden="true" />
            </a>
            <div className={styles.locationLinks} role="group" aria-label="Cómo llegar a Mendara">
              {footerLinks.locations.map(({ provider, label, url }) => (
                <a key={provider} className={styles.patientLink} href={url} target="_blank" rel="noopener noreferrer">
                  {provider === "googleMaps" ? <MapPin size={18} strokeWidth={1.5} aria-hidden="true" /> : (
                    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                      <path d="M5 17c-2-1-3-3-3-5 1 1 2 1 3 0V9a8 8 0 1 1 8 8H5Z" />
                      <circle cx="8" cy="18" r="2" fill="currentColor" stroke="none" />
                      <circle cx="16" cy="18" r="2" fill="currentColor" stroke="none" />
                      <circle cx="11" cy="8" r="0.8" fill="currentColor" stroke="none" />
                      <circle cx="16" cy="8" r="0.8" fill="currentColor" stroke="none" />
                      <path d="M11 11c1 2 3 2 4 0" />
                    </svg>
                  )}
                  <span>{label}<span className="sr-only"> (abre en una nueva pestaña)</span></span>
                </a>
              ))}
            </div>
          </div>
        </div>
        <p className={styles.credit}>Desarrollado por <a href="https://www.kibina.com/" target="_blank" rel="noopener noreferrer">kibina<span className="sr-only"> (abre en una nueva pestaña)</span></a></p>
      </div>
    </footer>
  );
}
