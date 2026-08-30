import React, { useEffect, useRef, useState } from "react";
import { animate, motion, useInView, useReducedMotion } from "framer-motion";

export const IMG = (name) => `${process.env.PUBLIC_URL}/images/${name}`;
export const EASE = [0.22, 0.61, 0.36, 1];
export const THEMES = [
  { id: "paper", label: "Paper" },
  { id: "carbon", label: "Carbon" },
  { id: "petrol", label: "Petrol" },
];

export function useTheme() {
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem("portfolio-theme") || "paper"; } catch { return "paper"; }
  });
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem("portfolio-theme", theme); } catch { }
  }, [theme]);
  return [theme, setTheme];
}

export function CountUp({ value, suffix = "", comma = false }) {
  const target = typeof value === "string" ? parseFloat(value) : value;
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-8% 0px" });
  const reduced = useReducedMotion();
  const final = (comma ? target.toLocaleString("en-US") : target) + suffix;
  const [display, setDisplay] = useState(reduced ? final : "0" + suffix);
  useEffect(() => {
    if (!inView || reduced) { if (reduced) setDisplay(final); return; }
    const controls = animate(0, target, {
      duration: 0.9, ease: EASE,
      onUpdate: (v) => setDisplay((comma ? Math.round(v).toLocaleString("en-US") : Math.round(v)) + suffix),
    });
    return () => controls.stop();
  }, [inView, reduced, target, suffix, comma, final]);
  return <span ref={ref} className="num" data-testid={`countup-${value}${suffix}`}>{display}</span>;
}

export function Reveal({ children, delay = 0, className = "", testId }) {
  const reduced = useReducedMotion();
  return (
    <motion.div className={className} data-testid={testId}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.62, delay, ease: EASE }}>
      {children}
    </motion.div>
  );
}

export function Wipe({ src, alt, delay = 0, className = "", testId }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.25 });
  const reduced = useReducedMotion();
  return (
    <figure ref={ref} className={`wipe ${className}`}>
      <motion.img src={src} alt={alt} loading="lazy" decoding="async" data-testid={testId}
        initial={reduced ? { opacity: 0 } : { opacity: 1, clipPath: "inset(0 100% 0 0)", scale: 1.04 }}
        animate={inView ? { opacity: 1, clipPath: "inset(0 0% 0 0)", scale: 1 } : undefined}
        transition={{ duration: 0.9, delay, ease: EASE }} />
    </figure>
  );
}

export function ThemeSwitch({ theme, setTheme, mobile = false }) {
  return (
    <div className={`theme-switch${mobile ? " theme-switch-mobile" : ""}`} role="group" aria-label="Colour theme" data-testid={mobile ? "theme-switch-mobile" : "theme-switch"}>
      {THEMES.map((t) => (
        <button type="button" key={t.id} className="theme-dot" data-theme-value={t.id}
          aria-pressed={theme === t.id} onClick={() => setTheme(t.id)} data-testid={`theme-${t.id}-button`}>
          <span className="theme-swatch" aria-hidden="true"></span><span className="theme-name">{t.label}</span>
        </button>
      ))}
    </div>
  );
}
