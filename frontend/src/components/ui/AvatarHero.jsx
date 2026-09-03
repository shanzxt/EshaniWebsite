import React, { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import InteractiveAvatar from "./InteractiveAvatar";
import { Magnetic } from "../../primitives";

/**
 * AvatarHero
 * Inspired by uxdularia.com:
 * - Bold typographic backdrop ("ESHANI")
 * - Interactive mouse-tracking stylized avatar with lifelike eyes
 * - Two drifting parallax cloud layers (bubble cluster removed: too much
 *   competing motion above the headline)
 * - Clean call-to-action buttons
 */
export default function AvatarHero({ go, theme = "paper" }) {
  const reduced = useReducedMotion();
  const heroRef = useRef(null);

  // Mouse motion values for stage parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { stiffness: 45, damping: 20 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Parallax offsets for different depth layers
  const textParallaxX = useTransform(smoothX, [-1, 1], [-25, 25]);
  const textParallaxY = useTransform(smoothY, [-1, 1], [-12, 12]);

  const cloudBackX = useTransform(smoothX, [-1, 1], [30, -30]);
  const cloudBackY = useTransform(smoothY, [-1, 1], [15, -15]);

  const cloudFrontX = useTransform(smoothX, [-1, 1], [-40, 40]);
  const cloudFrontY = useTransform(smoothY, [-1, 1], [-20, 20]);

  const handleMouseMove = (e) => {
    if (reduced) return;
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    mouseX.set((e.clientX - cx) / cx);
    mouseY.set((e.clientY - cy) / cy);
  };

  return (
    <section
      ref={heroRef}
      className="avatar-hero-section"
      onMouseMove={handleMouseMove}
      data-testid="avatar-hero-section"
      aria-label="Hero introduction"
    >
      {/* ================= HERO STAGE ================= */}
      <div className="avatar-hero-stage">
        {/* Layer 1: Giant Background Typography */}
        <motion.div
          className="hero-backdrop-text"
          style={reduced ? {} : { x: textParallaxX, y: textParallaxY }}
          aria-hidden="true"
        >
          <span className="backdrop-name">ESHANI</span>
          <span className="backdrop-sub">
            <span className="backdrop-sub-line">Product Designer</span>
            <span className="backdrop-sub-line">User Experience Designer</span>
          </span>
        </motion.div>

        {/* Layer 2: Background Clouds */}
        <motion.div
          className="hero-cloud-layer hero-cloud-back"
          style={reduced ? {} : { x: cloudBackX, y: cloudBackY }}
          aria-hidden="true"
        >
          <svg viewBox="0 0 1440 600" fill="none" className="cloud-svg-back" preserveAspectRatio="none">
            <path
              d="M-80 0 C 120 100, 180 280, 40 380 C -60 450, -120 300, -120 0 Z"
              className="cloud-fill-warm"
            />
            <path
              d="M1520 0 C 1320 100, 1260 280, 1400 380 C 1500 450, 1560 300, 1560 0 Z"
              className="cloud-fill-warm"
            />
            <path
              d="M 100 0 C 350 80, 600 -40, 850 60 C 1100 140, 1300 30, 1440 0 L 1440 0 L 0 0 Z"
              className="cloud-fill-faint"
            />
          </svg>
        </motion.div>

        {/* Layer 3: Interactive Character Avatar (Eshani) */}
        <div className="hero-avatar-container">
          <InteractiveAvatar size={400} theme={theme} />
        </div>

        {/* Layer 4: Foreground Cloud Silhouette Bed */}
        <motion.div
          className="hero-cloud-layer hero-cloud-front"
          style={reduced ? {} : { x: cloudFrontX, y: cloudFrontY }}
          aria-hidden="true"
        >
          <svg viewBox="0 0 1440 320" fill="none" className="cloud-svg-front" preserveAspectRatio="none">
            <path
              d="M-50 320 C 150 200, 300 240, 520 270 C 720 295, 920 220, 1140 260 C 1300 290, 1400 210, 1500 320 Z"
              className="cloud-fill-warm"
            />
            <path
              d="M-40 320 C 80 180, 260 170, 430 250 C 580 320, 860 320, 1010 250 C 1180 170, 1360 180, 1480 320 Z"
              className="cloud-fill-dark"
            />
          </svg>
        </motion.div>
      </div>

      {/* ================= HERO COPY & ACTIONS ================= */}
      <div className="container hero-content-bottom">
        <div className="hero-badge-row">
          <span className="avail-badge">
            <span className="avail-pulse" />
            Available for product design roles
          </span>
          <span className="hero-location-pill">San Francisco, CA · Healthcare · AI · Systems</span>
        </div>

        <h1 className="hero-main-title">
          Four minutes is how long a{" "}
          <span className="hero-serif-accent">clinician has.</span>
        </h1>

        <p className="hero-lede-text">
          Designing clarity into complex systems. I work across healthcare, AI, and
          enterprise products, using research, systems thinking, and interactive craft
          to make complex experiences easier to understand and navigate.
        </p>

        <div className="hero-btn-group">
          <Magnetic>
            <a
              href="#work"
              className="btn btn-primary"
              data-testid="hero-work-btn"
              onClick={(e) => {
                e.preventDefault();
                go("work");
              }}
            >
              Explore selected work <ArrowUpRight size={16} />
            </a>
          </Magnetic>
          <Magnetic>
            <a
              href="#contact"
              className="btn btn-secondary"
              data-testid="hero-contact-btn"
              onClick={(e) => {
                e.preventDefault();
                go("contact");
              }}
            >
              Get in touch
            </a>
          </Magnetic>
        </div>
      </div>
    </section>
  );
}