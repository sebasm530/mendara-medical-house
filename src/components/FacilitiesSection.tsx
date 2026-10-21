import Image from "next/image";
import { facilities } from "@/data/phaseFourContent";
import styles from "./FacilitiesSection.module.css";

export function FacilitiesSection() {
  return (
    <section className={styles.section} aria-labelledby="facilities-title">
      <div data-motion-group="facilities" className={styles.inner}>
        <p className="section-label">05 · Un entorno pensado en usted</p>
        <h2 data-motion="rise" id="facilities-title" className={styles.title}>Instalaciones que elevan<br className={styles.desktopBreak} /> la experiencia médica.</h2>
        <ul className={styles.gallery} tabIndex={0} aria-label="Imágenes de referencia de las instalaciones">
          {facilities.map((facility) => (
            <li data-motion="rise" key={facility.name}>
              <figure className={styles.figure}>
                <Image src={facility.image} alt={facility.alt} fill sizes="(min-width: 1000px) 300px, (min-width: 600px) 44vw, 80vw" className={styles.image} />
                <figcaption className={styles.caption}>
                  <span>{facility.name}</span>
                  <small>Imagen de referencia</small>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
