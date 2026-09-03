import React, { useEffect, useRef, useState } from "react";
import { motion, useSpring, useMotionValue, useTransform, useReducedMotion } from "framer-motion";
import { IMG } from "../../primitives";

/**
 * InteractiveAvatar — a real portrait, not an illustration.
 *
 * The hand-drawn cartoon this used to render read as amateur next to the
 * rest of the site's editorial photography (about section, case studies).
 * This swaps it for the same portrait used in About, framed as a duotone
 * arch cut-out that echoes the hero's organic cloud shapes, with a light
 * mouse-tilt parallax and a click-triggered speech bubble kept for
 * personality.
 */
export default function InteractiveAvatar({
  className = "",
  size = 460,
  interactive = true,
  theme = "paper",
}) {
  const containerRef = useRef(null);
  const reduced = useReducedMotion();

  const [isHappy, setIsHappy] = useState(false);
  const [speechBubble, setSpeechBubble] = useState("");

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const spring = { stiffness: 90, damping: 18, mass: 0.5 };
  const smoothX = useSpring(mouseX, spring);
  const smoothY = useSpring(mouseY, spring);

  const rotateY = useTransform(smoothX, [-1, 1], [-6, 6]);
  const rotateX = useTransform(smoothY, [-1, 1], [4, -4]);
  const shiftX = useTransform(smoothX, [-1, 1], [-6, 6]);
  const shiftY = useTransform(smoothY, [-1, 1], [-4, 4]);

  useEffect(() => {
    if (!interactive || reduced) return;

    let rafId = null;
    let lastMove = Date.now();

    const track = (e) => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        mouseX.set(Math.max(-1, Math.min(1, (e.clientX - cx) / cx)));
        mouseY.set(Math.max(-1, Math.min(1, (e.clientY - cy) / cy)));
      });
    };

    const onMove = (e) => {
      lastMove = Date.now();
      track(e);
    };
    const onTouch = (e) => {
      if (e.touches && e.touches[0]) onMove(e.touches[0]);
    };

    const idle = setInterval(() => {
      if (Date.now() - lastMove < 4000) return;
      const t = Date.now() / 1600;
      mouseX.set(Math.sin(t) * 0.3);
      mouseY.set(Math.cos(t * 0.7) * 0.18);
    }, 120);

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("touchmove", onTouch, { passive: true });

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onTouch);
      if (rafId) cancelAnimationFrame(rafId);
      clearInterval(idle);
    };
  }, [interactive, reduced, mouseX, mouseY]);

  const handleClick = () => {
    setIsHappy(true);
    const lines = [
      "Hi there! 👋",
      "Welcome to my portfolio! ✨",
      "Designing with clarity & craft 💡",
      "Let's build something great 🚀",
    ];
    setSpeechBubble(lines[Math.floor(Math.random() * lines.length)]);
    setTimeout(() => {
      setIsHappy(false);
      setTimeout(() => setSpeechBubble(""), 2600);
    }, 900);
  };

  return (
    <div
      ref={containerRef}
      className={`interactive-avatar-wrap ${className}`}
      onClick={handleClick}
      onMouseEnter={() => setIsHappy(true)}
      onMouseLeave={() => setIsHappy(false)}
      style={{
        position: "relative",
        width: "100%",
        maxWidth: `${size}px`,
        margin: "0 auto",
        cursor: "pointer",
        userSelect: "none",
        perspective: "1100px",
      }}
      title="Click me!"
      data-testid="interactive-avatar"
    >
      {speechBubble && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.95 }}
          className="avatar-speech-bubble"
          style={{
            position: "absolute",
            top: "-34px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "var(--card, #FFFFFF)",
            color: "var(--ink, #14130F)",
            padding: "8px 16px",
            borderRadius: "20px",
            fontFamily: "var(--font-mono, monospace)",
            fontSize: "0.78rem",
            fontWeight: 600,
            boxShadow: "0 12px 30px rgba(0,0,0,0.16)",
            border: "1px solid var(--line, #E5E7EB)",
            zIndex: 30,
            whiteSpace: "nowrap",
            pointerEvents: "none",
          }}
        >
          {speechBubble}
          <div
            style={{
              position: "absolute",
              bottom: "-6px",
              left: "50%",
              transform: "translateX(-50%) rotate(45deg)",
              width: "12px",
              height: "12px",
              background: "var(--card, #FFFFFF)",
              borderRight: "1px solid var(--line, #E5E7EB)",
              borderBottom: "1px solid var(--line, #E5E7EB)",
            }}
          />
        </motion.div>
      )}

      <motion.div
        className="avatar-arch-frame"
        animate={reduced ? undefined : { y: [0, -6, 0] }}
        transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformStyle: "preserve-3d" }}
      >
        <motion.div
          className={`avatar-arch-tilt${isHappy ? " is-happy" : ""}`}
          style={
            reduced
              ? {}
              : {
                  rotateX,
                  rotateY,
                  x: shiftX,
                  y: shiftY,
                }
          }
        >
          <img
            src={IMG("profile.png")}
            alt="Eshani Somwanshi, product and UX designer"
            className="avatar-photo"
            loading="eager"
            decoding="async"
          />
          <span className="avatar-arch-duotone" aria-hidden="true" />
          <span className="avatar-arch-sheen" aria-hidden="true" />
        </motion.div>
      </motion.div>
    </div>
  );
}
