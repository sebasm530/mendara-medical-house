import { animate } from "motion/mini";

export type Entrance = "rise" | "fade" | "line" | "photo" | "swap";

/** Native animations only; restore authored styles so hover/focus remain in control. */
export function entrance(element: Element, kind: Entrance = "rise", delay = 0, hero = false) {
  const target = element as HTMLElement | SVGElement;
  const properties = ["opacity", "transform", "transform-origin"] as const;
  const original = properties.map((property) => [property, target.style.getPropertyValue(property), target.style.getPropertyPriority(property)]);
  const restore = () => original.forEach(([property, value, priority]) => {
    if (value) target.style.setProperty(property, value, priority);
    else target.style.removeProperty(property);
  });
  let cancelled = false;
  try {
    if (kind === "line") target.style.transformOrigin = "left center";
    const transform = kind === "line" ? ["scaleX(0.12)", "scaleX(1)"]
      : kind === "photo" ? ["scale(1.035)", "scale(1)"]
      : kind === "fade" ? undefined : [`translateY(${kind === "swap" ? 4 : hero ? 8 : 14}px)`, "translateY(0px)"];
    const animation = animate(target, {
      ...(kind !== "photo" ? { opacity: [kind === "swap" ? 0.55 : 0, 1] } : {}),
      ...(transform ? { transform } : {}),
    }, { duration: kind === "swap" ? 0.28 : kind === "photo" ? 1.4 : hero ? 0.7 : kind === "line" ? 0.65 : 0.6, delay, ease: [0.16, 1, 0.3, 1] });
    void animation.then(() => { if (!cancelled) restore(); });
    return () => { cancelled = true; animation.cancel(); restore(); };
  } catch {
    // Unsupported animation APIs must leave the server-rendered content visible.
    restore();
    return () => {};
  }
}
