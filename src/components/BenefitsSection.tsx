import { CalendarDays, Leaf, Paintbrush, ShieldCheck, UsersRound } from "lucide-react";
import styles from "./BenefitsSection.module.css";

const benefits = [
  { title: "Recepción y administración", description: "Atención de pacientes, manejo de expedientes y apoyo operativo.", icon: UsersRound },
  { title: "Visibilidad y agenda digital", description: "Perfil profesional en mendaramedical.com y sistema de reservas.", icon: CalendarDays },
  { title: "Instalaciones de alto nivel", description: "Parqueo, farmacia, cocineta, comedor, bodega y más.", icon: Leaf },
  { title: "Servicios incluidos", description: "Seguridad, limpieza, conectividad y pago de servicios.", icon: ShieldCheck },
  { title: "Personalización", description: "Consultorios en blanco para que los adapte a su identidad.", icon: Paintbrush },
  { title: "Consultorio compartido", description: "El médico que alquila puede compartir su consultorio con dos o tres colegas más, de la misma especialidad o de otra, siempre que esa especialidad no tenga ya un consultorio asignado en Mendara", icon: UsersRound },
] as const;

export function BenefitsSection() {
  return (
    <section className={styles.section} aria-labelledby="benefits-title">
      <div className={styles.inner}>
        <div data-motion-group="benefits-heading" className={styles.introduction}>
          <p className="section-label">03 · Beneficios</p>
          <h2 data-motion="rise" id="benefits-title">Todo lo que necesita para enfocarse en lo más importante.</h2>
          <p data-motion="fade" className={styles.description}>Más que un espacio, un ecosistema que potencia su práctica médica.</p>
        </div>
        <ul data-motion-group="benefits" className={styles.benefits}>
          {benefits.map(({ title, description, icon: Icon }) => (
            <li data-motion="rise" key={title} className={styles.benefit}>
              <Icon size={38} strokeWidth={1.2} className="text-gold" aria-hidden="true" />
              <h3>{title}</h3>
              <p>{description}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
