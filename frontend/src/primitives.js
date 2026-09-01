import React, { useEffect, useRef, useState } from "react";
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";

export const IMG = (name) => `${process.env.PUBLIC_URL}/images/${name}`;

/* Shared motion language -------------------------------------------------- */
export const EASE = [0.22, 0.61, 0.36, 1]; // entrances — fast out, long settle
export const EASE_STATE = [0.65, 0, 0.35, 1]; // state changes — symmetrical

export const THEMES = [
  { id: "paper", label: "Paper", color: "#F2EEE7" },
  { id: "carbon", label: "Carbon", color: "#0B0B0B" },
  { id: "petrol", label: "Petrol", color: "#052A31" },
];

/* Theme ------------------------------------------------------------------- */
export function useTheme() {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("portfolio-theme") || "paper";
    } catch {
      return "paper";
    }
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem("portfolio-theme", theme);
    } catch {
      /* private mode — ignore */
    }
    // Keep the browser chrome (mobile address bar) in sync with the palette.
    const meta = document.querySelector('meta[name="theme-color"]');
    const entry = THEMES.find((t) => t.id === theme);
    if (meta && entry) meta.setAttribute("content", entry.color);
  }, [theme]);

  return [theme, setTheme];
}

/* Count-up ---------------------------------------------------------------- */
export function CountUp({ value, suffix = "", comma = false }) {
  const target = typeof value === "string" ? parseFloat(value) : value;
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-8% 0px" });
  const reduced = useReducedMotion();
  const final = (comma ? target.toLocaleString("en-US") : target) + suffix;
  const [display, setDisplay] = useState(reduced ? final : "0" + suffix);

  useEffect(() => {
    if (reduced) {
      setDisplay(final);
      return;
    }
    if (!inView) return;
    const controls = animate(0, target, {
      duration: 1.1,
      ease: EASE,
      onUpdate: (v) =>
        setDisplay(
          (comma ? Math.round(v).toLocaleString("en-US") : Math.round(v)) +
            suffix,
        ),
    });
    return () => controls.stop();
  }, [inView, reduced, target, suffix, comma, final]);

  return (
    <span ref={ref} className="num">
      {display}
    </span>
  );
}

/* Generic in-view reveal --------------------------------------------------- */
export function Reveal({
  children,
  delay = 0,
  className = "",
  testId,
  amount = 0.15,
  y = 26,
  style,
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      data-testid={testId}
      style={style}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{ duration: 0.72, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/* Word-by-word masked headline reveal -------------------------------------
   Each word sits inside its own overflow-hidden wrapper so words rise out of
   a mask instead of simply fading. Wrappers carry padding + negative margin so
   descenders (g, y, p) are never clipped. */
export function SplitText({
  text,
  as: Tag = "span",
  className = "",
  delay = 0,
  stagger = 0.045,
  once = true,
  testId,
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once, amount: 0.4 });
  const reduced = useReducedMotion();
  const words = String(text).split(" ");

  return (
    <Tag ref={ref} className={`split ${className}`} data-testid={testId}>
      {words.map((word, i) => (
        <React.Fragment key={`${word}-${i}`}>
          <span className="split-w">
            <motion.span
              className="split-i"
              initial={reduced ? { opacity: 0 } : { y: "110%" }}
              animate={inView ? (reduced ? { opacity: 1 } : { y: 0 }) : undefined}
              transition={{
                duration: 0.85,
                delay: delay + i * stagger,
                ease: EASE,
              }}
            >
              {word}
            </motion.span>
          </span>
          {i < words.length - 1 ? " " : null}
        </React.Fragment>
      ))}
    </Tag>
  );
}

/* Clip-path image wipe -----------------------------------------------------
   Renders a <div>, not a <figure>, so callers can wrap it in their own
   <figure>/<figcaption> without nesting figures (invalid HTML in the old
   version). Border and background live on the caller, so frames never
   double up. */
export function Wipe({
  src,
  alt,
  delay = 0,
  className = "",
  testId,
  ratio,
  fit = "cover",
  position = "center",
  zoom = true,
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.25 });
  const reduced = useReducedMotion();

  return (
    <div
      ref={ref}
      className={`wipe${zoom ? " wipe-zoom" : ""} ${className}`}
      style={ratio ? { aspectRatio: ratio } : undefined}
    >
      <motion.img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        data-testid={testId}
        style={{ objectFit: fit, objectPosition: position }}
        initial={
          reduced
            ? { opacity: 0 }
            : { opacity: 1, clipPath: "inset(0 100% 0 0)", scale: 1.06 }
        }
        animate={
          inView
            ? { opacity: 1, clipPath: "inset(0 0% 0 0)", scale: 1 }
            : undefined
        }
        transition={{ duration: 1.05, delay, ease: EASE }}
      />
    </div>
  );
}

/* Magnetic hover ----------------------------------------------------------- */
export function Magnetic({ children, strength = 0.28, className = "" }) {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const x = useSpring(useMotionValue(0), { stiffness: 200, damping: 15 });
  const y = useSpring(useMotionValue(0), { stiffness: 200, damping: 15 });

  const onMove = (e) => {
    if (reduced || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.span
      ref={ref}
      className={`magnetic ${className}`}
      onMouseMove={onMove}
      onMouseLeave={reset}
      style={{ x, y }}
    >
      {children}
    </motion.span>
  );
}

/* Theme switch ------------------------------------------------------------- */
export function ThemeSwitch({ theme, setTheme, mobile = false }) {
  return (
    <div
      className={`theme-switch${mobile ? " theme-switch-mobile" : ""}`}
      role="group"
      aria-label="Colour theme"
      data-testid={mobile ? "theme-switch-mobile" : "theme-switch"}
    >
      {THEMES.map((t) => (
        <button
          type="button"
          key={t.id}
          className="theme-dot"
          data-theme-value={t.id}
          aria-pressed={theme === t.id}
          onClick={() => setTheme(t.id)}
          data-testid={`theme-${t.id}-button`}
        >
          <span className="theme-swatch" aria-hidden="true" />
          <span className="theme-name">{t.label}</span>
        </button>
      ))}
    </div>
  );
}

/* Preloader moved to components/site/Preloader.jsx — bouncing letters. */