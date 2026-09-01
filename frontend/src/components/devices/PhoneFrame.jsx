import React, { useRef } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";

/* PhoneFrame ---------------------------------------------------------------
   A titanium-ish handset with a Dynamic Island. Tilts toward the pointer on
   hover and drifts gently at rest. Use `float={false}` inside a group where
   several phones already have their own offsets.
*/
export default function PhoneFrame({
  src,
  alt,
  className = "",
  float = true,
  tilt = true,
  delay = 0,
  testId,
}) {
  const ref = useRef(null);
  const reduced = useReducedMotion();

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const spring = { stiffness: 150, damping: 18, mass: 0.4 };
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-14, 14]), spring);
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [12, -12]), spring);

  const onMove = (e) => {
    if (!tilt || reduced || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const reset = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={`ph ${className}`}
      data-testid={testId}
      onMouseMove={onMove}
      onMouseLeave={reset}
      style={reduced ? undefined : { rotateX, rotateY }}
      animate={
        reduced || !float
          ? undefined
          : { y: [0, -14, 0] }
      }
      transition={
        reduced || !float
          ? undefined
          : { duration: 6, repeat: Infinity, ease: "easeInOut", delay }
      }
    >
      <div className="ph-body">
        <span className="ph-island" aria-hidden="true" />
        <span className="ph-btn ph-btn-vol" aria-hidden="true" />
        <span className="ph-btn ph-btn-vol2" aria-hidden="true" />
        <span className="ph-btn ph-btn-pwr" aria-hidden="true" />
        <div className="ph-screen">
          <img src={src} alt={alt} loading="lazy" decoding="async" />
        </div>
        <span className="ph-gloss" aria-hidden="true" />
      </div>
    </motion.div>
  );
}