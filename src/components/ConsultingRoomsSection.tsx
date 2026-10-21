"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { consultingRooms, type RoomLevel } from "@/data/consultingRooms";
import { ConsultingRoomCard } from "./ConsultingRoomCard";
import styles from "./ConsultingRoomsSection.module.css";
import { entrance } from "./motion/entrance";

export function ConsultingRoomsSection() {
  const [level, setLevel] = useState<RoomLevel>(1);
  const [navigation, setNavigation] = useState({ previous: false, next: false });
  const trackRef = useRef<HTMLUListElement>(null);
  const previousLevel = useRef(level);
  const rooms = consultingRooms.filter((room) => room.level === level);

  useEffect(() => {
    const changed = previousLevel.current !== level;
    previousLevel.current = level;
    const track = trackRef.current;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!changed || !track || preference.matches) return;
    const cancel = entrance(track, "swap");
    const onPreference = () => { if (preference.matches) cancel(); };
    preference.addEventListener("change", onPreference);
    return () => { cancel(); preference.removeEventListener("change", onPreference); };
  }, [level]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const updateNavigation = () => {
      setNavigation({
        previous: track.scrollLeft > 2,
        next: track.scrollLeft + track.clientWidth < track.scrollWidth - 2,
      });
    };
    const observer = new ResizeObserver(updateNavigation);
    observer.observe(track);
    track.addEventListener("scroll", updateNavigation, { passive: true });
    const frame = requestAnimationFrame(updateNavigation);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      track.removeEventListener("scroll", updateNavigation);
    };
  }, [level]);

  function move(direction: -1 | 1) {
    const track = trackRef.current;
    if (!track) return;
    const firstCard = track.firstElementChild;
    const distance = firstCard ? firstCard.getBoundingClientRect().width + 16 : track.clientWidth;
    track.scrollBy({
      left: direction * distance,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
    });
  }

  return (
    <section className={styles.section} aria-labelledby="rooms-title">
      <div className={styles.inner}>
        <div data-motion-group="rooms-heading" className={styles.introduction}>
          <p className="section-label">02 · Los consultorios</p>
          <h2 data-motion="rise" id="rooms-title">Siete opciones funcionales y versátiles.</h2>
          <p data-motion="fade" className={styles.description}>Conozca sus características, metros cuadrados y precio mensual. Elija el espacio ideal para su especialidad.</p>
          <div className={styles.plans}>
            <p>Pendiente de planos oficiales actualizados.</p>
          </div>
        </div>
        <div data-motion-group="rooms-gallery" className={styles.gallery}>
          <div data-motion="fade" className={styles.galleryHeader}>
            <div className={styles.levelSelector} role="group" aria-label="Piso de los consultorios">
              {([1, 2] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  aria-pressed={level === option}
                  aria-controls="rooms-track"
                  onClick={() => setLevel(option)}
                >Piso {option}</button>
              ))}
            </div>
            <div className={styles.navigation} role="group" aria-label="Recorrer consultorios">
              <button type="button" aria-label="Consultorio anterior" aria-controls="rooms-track" disabled={!navigation.previous} onClick={() => move(-1)}>
                <ArrowLeft size={19} strokeWidth={1.5} aria-hidden="true" />
              </button>
              <button type="button" aria-label="Consultorio siguiente" aria-controls="rooms-track" disabled={!navigation.next} onClick={() => move(1)}>
                <ArrowRight size={19} strokeWidth={1.5} aria-hidden="true" />
              </button>
            </div>
          </div>
          <p className="sr-only" role="status">Piso {level}: {rooms.length} consultorios.</p>
          <ul data-motion="fade" key={level} id="rooms-track" className={styles.track} ref={trackRef} aria-label={`Consultorios del piso ${level}`}>
            {rooms.map((room) => <li key={room.number}><ConsultingRoomCard room={room} /></li>)}
          </ul>
          <div className={styles.galleryNotes}>
            <p className={styles.levelCount}>Piso {level} · {rooms.length} consultorios</p>
            <p>Precios mensuales en USD, antes de IVA.</p>
            <p>Imágenes de ambientación. No representan exactamente cada consultorio.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
