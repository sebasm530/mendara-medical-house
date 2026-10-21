import Image from "next/image";
import { ArrowRight, Camera } from "lucide-react";
import { doctorProfile, type DoctorProfile } from "@/data/phaseFourContent";
import styles from "./DoctorSection.module.css";

/** Fotografía facilitada y testimonio editorial editable para aprobación definitiva. */
export function DoctorSection({ profile = doctorProfile }: { profile?: DoctorProfile }) {
  return (
    <section className={styles.section} aria-labelledby="doctor-heading" data-content-status={profile.status}>
      <div className={styles.inner}>
        <header data-motion-group="doctor-heading" className={styles.heading}>
          <h2 id="doctor-heading" data-motion="rise">
            <span>La primera especialista</span>{" "}
            <span><em>en confiar</em> en Mendara.</span>
          </h2>
        </header>
        <div data-motion-group="doctor-photo" className={styles.photoColumn}>
          <div data-motion="rise" className={styles.frame}>
            <div className={styles.portrait}>
              {profile.photo ? (
                <Image src={profile.photo.src} alt={profile.photo.alt} fill sizes="(min-width: 1200px) 382px, (min-width: 900px) 36vw, (min-width: 600px) 342px, (min-width: 388px) 322px, calc(100vw - 66px)" className={styles.photo} />
              ) : (
                <div className={styles.placeholder}>
                  <Camera size={38} strokeWidth={1} aria-hidden="true" />
                  <p>Fotografía pendiente<br />de confirmar</p>
                </div>
              )}
            </div>
          </div>
        </div>
        <div data-motion-group="doctor-quote" className={styles.editorial}>
          {/* La versión editorial del testimonio queda centralizada en doctorProfile. */}
          <div data-motion="fade" className={styles.quoteFrame}>
            <span className={styles.openQuote} aria-hidden="true">“</span>
            <blockquote className={styles.quote}>{profile.quote ?? "Frase pendiente de confirmar"}</blockquote>
            <span className={styles.closeQuote} aria-hidden="true">”</span>
          </div>
          <span data-motion="line" data-motion-delay="0.12" className={styles.rule} aria-hidden="true" />
          <h2 data-motion="rise" data-motion-delay="0.2" id="doctor-name" className={styles.name}>{profile.name}</h2>
          <p data-motion="fade" data-motion-delay="0.27" className={styles.specialty}>{profile.specialty}</p>
          <div className={styles.cta}>
            <p data-motion="rise" data-motion-delay="0.32" className={styles.ctaMessage}>Sea usted el próximo especialista en confiar en Mendara.</p>
            <a data-motion="rise" data-motion-delay="0.4" className={`visit-button ${styles.ctaButton}`} href="#lista-de-espera">
              <span>Unirme a la lista de espera</span>
              <ArrowRight className="button-arrow" size={18} strokeWidth={1.5} aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
