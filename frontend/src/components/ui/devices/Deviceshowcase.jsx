import React, { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import MacBookScroll from "./MacBookScroll";
import PhoneFrame from "./PhoneFrame";

/* RotatingBadge -----------------------------------------------------------
   Circular text that spins slowly — the "view case study" seal that sits on
   the corner of a showcase. Purely decorative; the real link is elsewhere in
   the card, so it is hidden from assistive tech.
*/
export function RotatingBadge({ text = "VIEW CASE STUDY · ", arrow = true }) {
  const reduced = useReducedMotion();
  const id = React.useId().replace(/:/g, "");
  const ring = text.repeat(3);

  return (
    <div className="seal" aria-hidden="true">
      <motion.svg
        viewBox="0 0 120 120"
        className="seal-svg"
        animate={reduced ? undefined : { rotate: 360 }}
        transition={
          reduced
            ? undefined
            : { duration: 18, repeat: Infinity, ease: "linear" }
        }
      >
        <defs>
          <path
            id={`sealpath-${id}`}
            d="M60,60 m-42,0 a42,42 0 1,1 84,0 a42,42 0 1,1 -84,0"
          />
        </defs>
        <text className="seal-text">
          <textPath href={`#sealpath-${id}`} startOffset="0%">
            {ring}
          </textPath>
        </text>
      </motion.svg>
      {arrow ? <span className="seal-arrow">↗</span> : null}
    </div>
  );
}

/* ParallaxGroup ------------------------------------------------------------
   Moves the phone a little faster than the laptop as the block scrolls, which
   is what sells the depth in the Ankit Dularia / Emmi Wu style hero shots.
*/
export default function DeviceShowcase({
  laptop, // { src, alt }
  phone, // { src, alt } — optional
  caption,
  badge = "VIEW CASE STUDY · ",
  className = "",
  testId,
}) {
  const ref = useRef(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const p = useSpring(scrollYProgress, {
    stiffness: 70,
    damping: 26,
    mass: 0.6,
  });
  const phoneY = useTransform(p, [0, 1], [70, -70]);
  const phoneR = useTransform(p, [0, 1], [-9, 5]);

  return (
    <div className={`showcase ${className}`} ref={ref} data-testid={testId}>
      <div className="showcase-glow" aria-hidden="true" />

      <MacBookScroll
        src={laptop.src}
        alt={laptop.alt}
        testId={testId ? `${testId}-laptop` : undefined}
      />

      {phone ? (
        <motion.div
          className="showcase-phone"
          style={reduced ? undefined : { y: phoneY, rotate: phoneR }}
        >
          <PhoneFrame
            src={phone.src}
            alt={phone.alt}
            float={false}
            testId={testId ? `${testId}-phone` : undefined}
          />
        </motion.div>
      ) : null}

      {badge ? <RotatingBadge text={badge} /> : null}

      {caption ? <p className="showcase-cap">{caption}</p> : null}
    </div>
  );
}