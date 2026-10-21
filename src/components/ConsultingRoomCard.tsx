import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { type ConsultingRoom, formatRoomArea, formatRoomPrice } from "@/data/consultingRooms";
import styles from "./ConsultingRoomsSection.module.css";

export function ConsultingRoomCard({ room }: { room: ConsultingRoom }) {
  return (
    <article className={styles.card} aria-labelledby={`room-${room.number}-title`}>
      <figure className={styles.figure}>
        <Image
          src={room.referenceImage}
          alt="Ambientación ilustrativa de un consultorio médico; no representa exactamente este espacio."
          fill
          sizes="(min-width: 1000px) 260px, (min-width: 600px) 40vw, 80vw"
          className={styles.image}
        />
        <figcaption className={styles.imageLabel}>Imagen de referencia</figcaption>
      </figure>
      <div className={styles.cardBody}>
        <h3 id={`room-${room.number}-title`}>Consultorio {room.number}</h3>
        <p className={styles.area}>{formatRoomArea(room.area)}</p>
        <p className={styles.price}>
          <strong>{formatRoomPrice(room.monthlyPrice)}</strong>
          <span> + IVA / mes</span>
        </p>
        <details className={styles.details}>
          <summary>
            <span>Ver detalles<span className="sr-only"> del consultorio {room.number}</span></span>
            <ChevronDown size={16} strokeWidth={1.5} aria-hidden="true" />
          </summary>
          <div className={styles.detailContent}>
            <dl>
              <div><dt>Piso</dt><dd>{room.level}</dd></div>
              <div><dt>Área</dt><dd>{formatRoomArea(room.area)}</dd></div>
              <div><dt>Mensualidad</dt><dd>{formatRoomPrice(room.monthlyPrice)} USD + IVA</dd></div>
            </dl>
            <p>La imagen es de ambientación y no garantiza equipamiento.</p>
          </div>
        </details>
      </div>
    </article>
  );
}
