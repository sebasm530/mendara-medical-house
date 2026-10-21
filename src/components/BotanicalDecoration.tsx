import Image from "next/image";
import styles from "./BotanicalDecoration.module.css";

const assets = {
  hero: { name: "hero", width: 1536, height: 1024 },
  invitation: { name: "invitacion", width: 1271, height: 1237 },
  form: { name: "formulario", width: 1317, height: 1194 },
  footer: { name: "footer", width: 1536, height: 1024 },
} as const;

/** Transparent local assets only; decorative layers never take part in layout. */
export function BotanicalDecoration({ placement }: { placement: keyof typeof assets }) {
  const asset = assets[placement];
  const image = (
    <Image
      src={`/images/decoracion/hojas-${asset.name}.png`}
      alt=""
      width={asset.width}
      height={asset.height}
      sizes={placement === "footer" ? "440px" : "320px"}
      className={styles.image}
      loading="lazy"
    />
  );
  return (
    <div className={`${styles.layer} ${styles[placement]}`} aria-hidden="true">
      <span className={styles.left}>{image}</span>
      {placement === "footer" && <span className={styles.right}>{image}</span>}
    </div>
  );
}
