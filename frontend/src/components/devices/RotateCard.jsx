import React, { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";

/* RotateCard ---------------------------------------------------------------
   A screenshot that swings in from an angle and locks flat as it reaches the
   middle of the viewport. Scroll-linked rather than fire-once, so it replays
   every time you pass it — including on the way back up.

   from   "left" | "right"  — which side it swings in from
   depth  how far back it starts (px of Z). Bigger = more dramatic.
*/
export default function RotateCard({
  src,
  alt,
  caption,
  from = "left",
  depth = 260,
  className = "",
  cursor,
  testId,
}) {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const dir = from === "right" ? 1 : -1;

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.95", "center 0.62"],
  });
  const p = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 22,
    mass: 0.5,
  });

  const rotateY = useTransform(p, [0, 1], [dir * 38, 0]);
  const rotateZ = useTransform(p, [0, 1], [dir * -7, 0]);
  const z = useTransform(p, [0, 1], [-depth, 0]);
  const x = useTransform(p, [0, 1], [dir * 90, 0]);
  const opacity = useTransform(p, [0, 0.45], [0, 1]);
  const shadow = useTransform(p, [0, 1], [0.05, 0.34]);

  if (reduced) {
    return (
      <figure className={`rcard ${className}`} data-testid={testId}>
        <div className="rcard-inner">
          <img src={src} alt={alt} loading="lazy" decoding="async" />
        </div>
        {caption ? <figcaption>{caption}</figcaption> : null}
      </figure>
    );
  }

  return (
    <figure
      className={`rcard ${className}`}
      ref={ref}
      data-cursor={cursor}
      data-testid={testId}
    >
      <motion.div
        className="rcard-inner"
        style={{ rotateY, rotateZ, z, x, opacity }}
      >
        <img src={src} alt={alt} loading="lazy" decoding="async" />
        <motion.span
          className="rcard-shadow"
          style={{ opacity: shadow }}
          aria-hidden="true"
        />
      </motion.div>
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}