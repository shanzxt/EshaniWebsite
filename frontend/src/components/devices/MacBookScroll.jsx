import React, { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";

/* MacBookScroll ------------------------------------------------------------
   A laptop whose lid opens as the section scrolls into view. The lid is a
   3D-rotated plane hinged at its bottom edge; the screen fades in as the
   angle approaches flat, and the screenshot pans slowly for the whole time
   the device is on screen.

   Props
     src        image URL (use IMG("eyeai-dashboard.png"))
     alt        alt text — required, this is real content
     caption    optional line under the device
     pan        false to hold the screenshot still
*/
export default function MacBookScroll({
  src,
  alt,
  caption,
  pan = true,
  className = "",
  testId,
}) {
  const ref = useRef(null);
  const reduced = useReducedMotion();

  // Drives the lid. Starts opening when the device enters the lower third of
  // the viewport and is fully open by the time it reaches the middle.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.9", "center 0.58"],
  });
  const p = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 24,
    mass: 0.5,
  });

  const rotateX = useTransform(p, [0, 1], [-88, 0]);
  const screenOn = useTransform(p, [0.55, 0.95], [0, 1]);
  const glow = useTransform(p, [0.6, 1], [0, 1]);
  const lift = useTransform(p, [0, 1], [34, 0]);
  const scale = useTransform(p, [0, 1], [0.93, 1]);

  // Independent, slower progress for the screenshot pan.
  const { scrollYProgress: through } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const imgY = useTransform(through, [0, 1], ["0%", "-26%"]);

  if (reduced) {
    return (
      <figure className={`mb ${className}`} data-testid={testId}>
        <div className="mb-stage">
          <div className="mb-lid mb-lid-static">
            <div className="mb-screen">
              <img src={src} alt={alt} loading="lazy" decoding="async" />
            </div>
          </div>
          <div className="mb-base">
            <span className="mb-notch-bar" />
          </div>
        </div>
        {caption ? <figcaption className="mb-cap">{caption}</figcaption> : null}
      </figure>
    );
  }

  return (
    <figure className={`mb ${className}`} ref={ref} data-testid={testId}>
      <motion.div className="mb-stage" style={{ y: lift, scale }}>
        <motion.div className="mb-lid" style={{ rotateX }}>
          <div className="mb-lid-face">
            <div className="mb-camera" aria-hidden="true" />
            <div className="mb-screen">
              <motion.img
                src={src}
                alt={alt}
                loading="lazy"
                decoding="async"
                style={{ opacity: screenOn, y: pan ? imgY : 0 }}
              />
              <motion.span
                className="mb-sheen"
                style={{ opacity: glow }}
                aria-hidden="true"
              />
            </div>
          </div>
          <div className="mb-lid-back" aria-hidden="true" />
        </motion.div>

        <div className="mb-base">
          <span className="mb-notch-bar" aria-hidden="true" />
          <span className="mb-keys" aria-hidden="true" />
          <span className="mb-pad" aria-hidden="true" />
        </div>
        <motion.span
          className="mb-castshadow"
          style={{ opacity: glow }}
          aria-hidden="true"
        />
      </motion.div>
      {caption ? <figcaption className="mb-cap">{caption}</figcaption> : null}
    </figure>
  );
}