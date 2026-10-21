"use client";

import { useEffect } from "react";
import { entrance, type Entrance } from "./entrance";

/** One observer, no scroll listeners, no hidden SSR states or layout wrappers. */
export function MotionExperience() {
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (preference.matches || !window.IntersectionObserver || !Element.prototype.animate) return;
    const groups = document.querySelectorAll<HTMLElement>("[data-motion-group]");
    const seen = new WeakSet<Element>();
    const active = new Map<Element, (() => void)[]>();
    const stop = (group: Element) => {
      active.get(group)?.forEach((cancel) => cancel());
      active.delete(group);
    };
    const reveal = (group: HTMLElement) => {
      if (seen.has(group)) return;
      seen.add(group);
      if (preference.matches || group.contains(document.activeElement)) return;
      const hero = group.dataset.motionGroup === "hero";
      const elements = Array.from(group.querySelectorAll<HTMLElement>("[data-motion]"))
        .filter((element) => element.closest("[data-motion-group]") === group);
      active.set(group, elements.map((element, index) => entrance(
        element, element.dataset.motion as Entrance,
        Math.min(Number(element.dataset.motionDelay ?? index * (hero ? 0.09 : 0.07)), hero ? 0.54 : 0.28), hero,
      )));
    };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        reveal(entry.target as HTMLElement);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    groups.forEach((group) => {
      if (group.dataset.motionGroup === "hero") reveal(group);
      else observer.observe(group);
    });
    // Interaction takes priority over an entrance, especially while filling the form.
    const onInteract = (event: Event) => {
      const group = event.target instanceof Element ? event.target.closest("[data-motion-group]") : null;
      if (!group) return;
      seen.add(group);
      observer.unobserve(group);
      stop(group);
    };
    const onPreference = () => {
      if (!preference.matches) return;
      observer.disconnect();
      active.forEach((_, group) => stop(group));
    };
    document.addEventListener("focusin", onInteract);
    document.addEventListener("pointerdown", onInteract, { passive: true });
    preference.addEventListener("change", onPreference);
    return () => {
      observer.disconnect();
      active.forEach((_, group) => stop(group));
      document.removeEventListener("focusin", onInteract);
      document.removeEventListener("pointerdown", onInteract);
      preference.removeEventListener("change", onPreference);
    };
  }, []);
  return null;
}
