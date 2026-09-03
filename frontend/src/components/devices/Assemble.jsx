import React, { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";

/* Assemble -----------------------------------------------------------------
   Wraps a group of elements. Each child starts flung out in its own direction
   — offset, rotated, scaled down — and is pulled into its true position as
   the block scrolls through. Because it is scroll-linked rather than a
   fire-once entrance, it re-assembles every single pass, in both directions.

   Drop it around any existing markup:
     <Assemble><div/><div/><div/></Assemble>

   spread     px of scatter. 120 is lively, 300 is chaos.
   swirl      max degrees of rotation at rest.
   stagger    0–0.5. How much later the last child locks in vs the first.
*/
export default function Assemble({
  children,
  spread = 170,
  swirl = 14,
  stagger = 0.22,
  className = "",
  testId,
}) {
  const ref = useRef(null);
  const reduced = useReducedMotion();

  // Resolved against the block's own top, not its center — a tall multi-row
  // grid used to need its vertical center to reach mid-viewport before the
  // last child cleared, which meant the top rows sat blurred long after they
  // scrolled into view. Finishing off the top edge instead means everything
  // is settled and sharp shortly after the block appears, regardless of how
  // tall it is.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.95", "start 0.4"],
  });
  const p = useSpring(scrollYProgress, {
    stiffness: 68,
    damping: 20,
    mass: 0.6,
  });

  const items = React.Children.toArray(children);
  const count = Math.max(items.length, 1);

  if (reduced) {
    return (
      <div className={`assemble ${className}`} data-testid={testId}>
        {items}
      </div>
    );
  }

  return (
    <div className={`assemble ${className}`} ref={ref} data-testid={testId}>
      {items.map((child, i) => (
        <AssembleItem
          key={child.key ?? i}
          progress={p}
          index={i}
          count={count}
          spread={spread}
          swirl={swirl}
          stagger={stagger}
        >
          {child}
        </AssembleItem>
      ))}
    </div>
  );
}

function AssembleItem({
  children,
  progress,
  index,
  count,
  spread,
  swirl,
  stagger,
}) {
  // Deterministic scatter — same layout on every render and every reload,
  // but varied enough between siblings that it never looks mechanical.
  const seed = Math.sin((index + 1) * 12.9898) * 43758.5453;
  const rand = seed - Math.floor(seed); // 0–1
  const angle = rand * Math.PI * 2;

  const dx = Math.cos(angle) * spread;
  const dy = Math.sin(angle) * spread * 0.75 - 40; // bias upward, so it falls
  const rot = (rand - 0.5) * 2 * swirl;

  // Later children finish later — the group knits together front to back.
  const start = (index / count) * stagger;
  const range = [start, 1];

  const x = useTransform(progress, range, [dx, 0]);
  const y = useTransform(progress, range, [dy, 0]);
  const rotate = useTransform(progress, range, [rot, 0]);
  const scale = useTransform(progress, range, [0.82, 1]);
  const opacity = useTransform(progress, [start, start + 0.25], [0, 1]);
  const blur = useTransform(progress, range, [6, 0]);
  const filter = useTransform(blur, (b) => `blur(${b}px)`);

  return (
    <motion.div
      className="assemble-item"
      style={{ x, y, rotate, scale, opacity, filter }}
    >
      {children}
    </motion.div>
  );
}