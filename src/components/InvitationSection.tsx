import { BotanicalDecoration } from "./BotanicalDecoration";
import styles from "./InvitationSection.module.css";

export function InvitationSection() {
  return (
    <section data-motion-group="invitation" className={styles.section} aria-labelledby="invitation-title">
      <div className={styles.left}>
        <BotanicalDecoration placement="invitation" />
        <div className={styles.message}>
          <p data-motion="fade" data-motion-delay="0" className={styles.label}>01 · Su invitación</p>
          <h2 data-motion="rise" data-motion-delay="0.06" id="invitation-title">Esta invitación no es casualidad.</h2>
          <div data-motion="line" data-motion-delay="0.12" className={styles.rule} aria-hidden="true" />
          <p data-motion="fade" data-motion-delay="0.18">Hemos seleccionado personalmente a médicos especialistas que, como usted, valoran la excelencia, la independencia y un entorno profesional a la altura de su vocación. Esta invitación exclusiva está dirigida a solo siete especialistas, uno por especialidad, para formar una comunidad médica complementaria en Mendara Medical House.</p>
        </div>
      </div>
    </section>
  );
}
