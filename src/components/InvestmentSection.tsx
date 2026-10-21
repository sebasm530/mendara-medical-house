import { CalendarDays, Coins, Crown, FileText } from "lucide-react";
import { investmentTerms } from "@/data/phaseFourContent";
import styles from "./LocationInvestment.module.css";

export function InvestmentSection() {
  const terms = investmentTerms;
  const price = `$${terms.startingMonthlyPriceUsd.toLocaleString("de-DE")}`;
  return (
    <section data-motion-group="investment" className={styles.investment} aria-labelledby="investment-title">
      <p className="section-label">07 · Inversión</p>
      <h2 data-motion="rise" id="investment-title" className={styles.title}>Una decisión que<br />impulsa su crecimiento.</h2>
      <dl className={styles.terms}>
        <div data-motion="rise">
          <Coins size={25} strokeWidth={1.25} aria-hidden="true" />
          <dt>Desde</dt>
          <dd><strong>{price}</strong><span>+ IVA por mes · USD</span></dd>
        </div>
        <div data-motion="rise">
          <FileText size={24} strokeWidth={1.25} aria-hidden="true" />
          <dt>Contrato</dt>
          <dd><strong>{terms.contractYears} años</strong></dd>
        </div>
        <div data-motion="rise">
          <CalendarDays size={25} strokeWidth={1.25} aria-hidden="true" />
          <dt>Disponibilidad prevista</dt>
          <dd><time dateTime={terms.expectedAvailability.iso}>{terms.expectedAvailability.label}</time></dd>
        </div>
      </dl>
      <p data-motion="fade" className={styles.financing}>Mendara ofrece financiamiento para la adecuación del consultorio, con un diseño personalizado. El monto financiado se incorpora a la renta mensual.</p>
      <aside data-motion="fade" className={styles.founder} aria-labelledby="founder-title">
        <div className={styles.crown}><Crown size={30} strokeWidth={1.1} aria-hidden="true" /></div>
        <div>
          <p className={styles.founderLabel}>Beneficio fundador</p>
          <h3 id="founder-title">{terms.founder.title}</h3>
          <p>{terms.founder.description}</p>
        </div>
      </aside>
    </section>
  );
}
