import Image from "next/image";
import { ArrowRight, CalendarDays } from "lucide-react";
import motionStyles from "./motion/Motion.module.css";
import decorationStyles from "./HeroDecoration.module.css";

export function HeroSection() {
  return (
    <section data-motion-group="hero" className={`hero ${decorationStyles.section}`} aria-labelledby="hero-title">
      <div className={`hero-image ${motionStyles.heroPhoto}`}>
        <Image
          src="/images/hero/recepcion-principal.webp"
          alt="Render propuesto de la recepción de Mendara Medical House, con mostrador de iluminación cálida y área de espera."
          fill
          preload
          sizes="(min-width: 1200px) 70vw, 100vw"
          className="reception-image"
          data-motion="photo" data-motion-delay="0"
        />
      </div>
      <div className="hero-inner">
        <div className="hero-copy">
          <p className="hero-eyebrow" data-motion="rise" data-motion-delay="0.09">
            Una invitación exclusiva<br />
            para médicos especialistas
          </p>
          <div className={decorationStyles.rule} data-motion="line" data-motion-delay="0.12" aria-hidden="true" />
          <h1 id="hero-title">
            <span data-motion="rise" data-motion-delay="0.18">Siete consultorios.</span>{" "}
            <span data-motion="rise" data-motion-delay="0.27">Una comunidad médica</span>{" "}
            <em data-motion="rise" data-motion-delay="0.36">por invitación.</em>
          </h1>
          <p className="hero-description" data-motion="rise" data-motion-delay="0.4">
            Mendara Medical House abre en La Sabana un espacio diseñado para especialistas que desean hacer crecer su consulta privada en un entorno de alto nivel.
          </p>
          <a className={`visit-button ${motionStyles.heroButton}`} data-motion="rise" data-motion-delay="0.48" href="#lista-de-espera">
            <CalendarDays aria-hidden="true" size={22} strokeWidth={1.5} />
            <span>Unirme a la lista de espera</span>
            <ArrowRight className="button-arrow" aria-hidden="true" size={20} strokeWidth={1.5} />
          </a>
        </div>
      </div>
    </section>
  );
}
