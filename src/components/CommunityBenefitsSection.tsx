import styles from "./CommunityBenefitsSection.module.css";

export function CommunityBenefitsSection() {
  return (
    <section className={styles.section} aria-labelledby="community-benefits-title">
      <div className={styles.inner} data-motion-group="community-benefits">
        <p className="section-label">04 · Comunidad Mendara</p>
        <h2 id="community-benefits-title" data-motion="rise" className={styles.title}>Beneficios de pertenecer a Mendara</h2>
        <div className={styles.cards}>
          <article data-motion="rise" className={styles.card}>
            <p className={styles.discount}>20<span>%</span></p>
            <h3>Diseño interior</h3>
            <p>20% de descuento en asesoría de diseño interior con Pili Benito, decoradora.</p>
            <p className={styles.price}>Precio especial: <strong>₡120.000 + IVA</strong></p>
            <p className={styles.regular}>Precio regular: ₡150.000.</p>
          </article>
          <article data-motion="rise" className={styles.card}>
            <p className={styles.discount}>35<span>%</span></p>
            <h3>Permisos y trámites</h3>
            <p>35% de descuento en permisos y trámites de construcción con INGECI Consultores.</p>
            <p className={styles.eligibility}>Aplica para médicos de la comunidad Mendara y sus familiares hasta segundo grado.</p>
          </article>
        </div>
      </div>
    </section>
  );
}
