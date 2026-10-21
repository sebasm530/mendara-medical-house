import { FaqAccordion } from "./FaqAccordion";
import styles from "./FaqSection.module.css";
import { sectionLabels } from "@/data/sectionLabels";

export function FaqSection() {
  return (
    <section className={styles.section} aria-labelledby="faq-title">
      <div className={styles.inner}>
        <div className={styles.introduction} data-motion-group="faq-heading">
          <p className="section-label" data-motion="fade">{sectionLabels.faq}</p>
          <h2 id="faq-title" data-motion="rise">Todo lo que necesita saber.</h2>
          <p className={styles.description} data-motion="fade">Resolvemos las dudas más importantes antes de solicitar acceso a la lista de espera de Mendara</p>
        </div>
        <FaqAccordion />
      </div>
    </section>
  );
}
