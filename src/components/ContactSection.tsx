import { getVisitConfiguration } from "@/lib/visitConfiguration";
import { VisitForm } from "./VisitForm";
import styles from "./ContactSection.module.css";
import { sectionLabels } from "@/data/sectionLabels";

export function ContactSection() {
  const { enabled, privacyUrl } = getVisitConfiguration();
  return (
    <section data-motion-group="contact" id="lista-de-espera" aria-labelledby="visit-title" className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.introduction}>
          <p className="section-label">{sectionLabels.waitingList}</p>
          <h2 data-motion="rise" id="visit-title">Solicite ingresar a la lista de espera</h2>
          <p data-motion="fade" className={styles.description}>Complete sus datos para solicitar su incorporación a la lista de espera de Mendara. Nuestro equipo revisará su solicitud y le informará sobre los siguientes pasos</p>
        </div>
        <VisitForm enabled={enabled} privacyUrl={privacyUrl} />
      </div>
    </section>
  );
}
