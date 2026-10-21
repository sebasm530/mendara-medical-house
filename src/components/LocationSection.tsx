import type { ReactNode } from "react";
import { MapPin } from "lucide-react";
import { locationContent } from "@/data/phaseFourContent";
import styles from "./LocationInvestment.module.css";

/** Mapa oficial facilitado por Mendara; conserva la posibilidad de suministrar otro contenido. */
export function LocationSection({ officialMap }: { officialMap?: ReactNode }) {
  return (
    <section data-motion-group="location" className={styles.location} aria-labelledby="location-title">
      <div className={styles.locationCopy}>
      <p className="section-label">06 · Ubicación</p>
        <h2 data-motion="rise" id="location-title" className={styles.title}>En el corazón<br />de La Sabana.</h2>
        <p data-motion="rise" className={styles.address}><MapPin size={21} strokeWidth={1.4} aria-hidden="true" /><span>{locationContent.locality}</span></p>
      </div>
      <div data-motion="fade" className={styles.mapSlot}>
        {officialMap ?? (
          <iframe
            className={styles.mapFrame}
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3929.9901937363456!2d-84.11346962427005!3d9.934773374152297!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8fa0fd7ff3f087bb%3A0x53a47714cb9a7e65!2sMendara%20Medical%20House!5e0!3m2!1ses!2scr!4v1792188537658!5m2!1ses!2scr"
            title="Ubicación de Mendara Medical House"
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        )}
      </div>
    </section>
  );
}
