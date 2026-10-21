import Image from "next/image";
import styles from "./BrandWordmark.module.css";

/** Recreación visual provisional; no es el logo oficial. */
export function BrandWordmark() {
  return (
    <div data-motion="rise" data-motion-delay="0" className={`brand-wordmark ${styles.wordmark}`}>
      <div className={styles.frame}>
        <Image
        src="/images/branding/mendara-logo-recreado.png"
        alt="Mendara Medical House"
        width={1774}
        height={887}
        sizes="(min-width: 900px) 195px, 184px"
        className={styles.logo}
      />
      </div>
    </div>
  );
}
