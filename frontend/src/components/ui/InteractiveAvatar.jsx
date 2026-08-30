import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, useSpring, useMotionValue, useTransform } from "framer-motion";

/**
 * InteractiveAvatar
 * Stylized 2D animated vector character of Eshani
 * Features:
 * - Real-time eye pupil & iris cursor tracking with clamped radius and smooth physics
 * - Natural lifelike blinking every 3.5-5.5s + occasional double-blink
 * - Head & hair parallax depth (subtle 3D perspective tilt towards cursor)
 * - Jhumka earrings with physics-based reactive swing
 * - Interactive expressions (smile, wink on click/hover)
 * - Mobile touch & gyro / ambient auto-look fallback
 */
export default function InteractiveAvatar({
  className = "",
  size = 480,
  interactive = true,
  theme = "paper"
}) {
  const containerRef = useRef(null);
  const leftEyeRef = useRef(null);
  const rightEyeRef = useRef(null);

  // Blinking & expressions
  const [isBlinking, setIsBlinking] = useState(false);
  const [isWinking, setIsWinking] = useState(false);
  const [isHappy, setIsHappy] = useState(false);
  const [speechBubble, setSpeechBubble] = useState("");

  // Raw mouse coordinates relative to center (-1 to 1)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for head tilt & parallax
  const springConfig = { stiffness: 120, damping: 18, mass: 0.6 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Head 3D tilt & shift
  const headRotateY = useTransform(smoothX, [-1, 1], [-8, 8]);
  const headRotateX = useTransform(smoothY, [-1, 1], [6, -6]);
  const headTranslateX = useTransform(smoothX, [-1, 1], [-10, 10]);
  const headTranslateY = useTransform(smoothY, [-1, 1], [-6, 6]);

  // Hair parallax
  const backHairX = useTransform(smoothX, [-1, 1], [6, -6]);
  const frontHairX = useTransform(smoothX, [-1, 1], [-14, 14]);

  // Earrings swing
  const earringLeftRotate = useTransform(smoothX, [-1, 1], [-12, 16]);
  const earringRightRotate = useTransform(smoothX, [-1, 1], [-16, 12]);

  // Eyebrow lift
  const eyebrowY = useTransform(smoothY, [-1, 1], [-3, 2]);

  // Pupil offsets
  const [leftPupil, setLeftPupil] = useState({ x: 0, y: 0 });
  const [rightPupil, setRightPupil] = useState({ x: 0, y: 0 });

  // Calculate eye pupil positions towards target point
  const updatePupils = useCallback((clientX, clientY) => {
    if (!leftEyeRef.current || !rightEyeRef.current) return;

    const leftRect = leftEyeRef.current.getBoundingClientRect();
    const rightRect = rightEyeRef.current.getBoundingClientRect();

    const calcEye = (rect, maxRadius = 13) => {
      const eyeCenterX = rect.left + rect.width / 2;
      const eyeCenterY = rect.top + rect.height / 2;

      const dx = clientX - eyeCenterX;
      const dy = clientY - eyeCenterY;
      const angle = Math.atan2(dy, dx);
      const distance = Math.hypot(dx, dy);

      const radius = Math.min(maxRadius, distance / 24);
      return {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius * 0.85
      };
    };

    setLeftPupil(calcEye(leftRect, 13));
    setRightPupil(calcEye(rightRect, 13));
  }, []);

  // Global mouse move listener
  useEffect(() => {
    if (!interactive) return;

    let rafId = null;
    const handleMouseMove = (e) => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        const normX = Math.max(-1, Math.min(1, (e.clientX - cx) / cx));
        const normY = Math.max(-1, Math.min(1, (e.clientY - cy) / cy));

        mouseX.set(normX);
        mouseY.set(normY);
        updatePupils(e.clientX, e.clientY);
      });
    };

    let idleInterval;
    let lastMoveTime = Date.now();

    const onActive = (e) => {
      lastMoveTime = Date.now();
      handleMouseMove(e);
    };

    idleInterval = setInterval(() => {
      if (Date.now() - lastMoveTime > 4000) {
        const t = Date.now() / 1500;
        const autoX = Math.sin(t) * 0.4;
        const autoY = Math.cos(t * 0.7) * 0.25;
        mouseX.set(autoX);
        mouseY.set(autoY);

        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          const fakeTargetX = rect.left + rect.width / 2 + autoX * 300;
          const fakeTargetY = rect.top + rect.height / 2 + autoY * 200;
          updatePupils(fakeTargetX, fakeTargetY);
        }
      }
    }, 100);

    window.addEventListener("mousemove", onActive, { passive: true });
    window.addEventListener("touchmove", (e) => {
      if (e.touches && e.touches[0]) onActive(e.touches[0]);
    }, { passive: true });

    return () => {
      window.removeEventListener("mousemove", onActive);
      if (rafId) cancelAnimationFrame(rafId);
      clearInterval(idleInterval);
    };
  }, [interactive, mouseX, mouseY, updatePupils]);

  // Natural blinking cycle
  useEffect(() => {
    let blinkTimeout;
    const triggerBlink = () => {
      setIsBlinking(true);
      setTimeout(() => {
        setIsBlinking(false);
        if (Math.random() < 0.25) {
          setTimeout(() => {
            setIsBlinking(true);
            setTimeout(() => setIsBlinking(false), 140);
          }, 180);
        }
      }, 160);

      const nextBlink = 3000 + Math.random() * 3500;
      blinkTimeout = setTimeout(triggerBlink, nextBlink);
    };

    blinkTimeout = setTimeout(triggerBlink, 3000);
    return () => clearTimeout(blinkTimeout);
  }, []);

  // Avatar click micro-interaction
  const handleClick = () => {
    setIsWinking(true);
    setIsHappy(true);
    const greetings = [
      "Hi there! 👋",
      "Welcome to my portfolio! ✨",
      "Designing with clarity & craft! 💡",
      "Let's build something great! 🚀"
    ];
    setSpeechBubble(greetings[Math.floor(Math.random() * greetings.length)]);

    setTimeout(() => {
      setIsWinking(false);
      setTimeout(() => setSpeechBubble(""), 2600);
    }, 600);
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
        aspectRatio: "420 / 520",
        margin: "0 auto",
        cursor: "pointer",
        userSelect: "none",
        perspective: "1000px"
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
            top: "-35px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "var(--card, #FFFFFF)",
            color: "var(--ink, #14130F)",
            padding: "8px 16px",
            borderRadius: "20px",
            fontFamily: "var(--font-mono, monospace)",
            fontSize: "0.78rem",
            fontWeight: "600",
            boxShadow: "0 12px 30px rgba(0,0,0,0.18)",
            border: "1px solid var(--line, #E5E7EB)",
            zIndex: 30,
            whiteSpace: "nowrap",
            pointerEvents: "none"
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
              borderBottom: "1px solid var(--line, #E5E7EB)"
            }}
          />
        </motion.div>
      )}

      <svg
        viewBox="0 0 420 520"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          width: "100%",
          height: "100%",
          overflow: "visible",
          filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.15))"
        }}
      >
        <defs>
          <linearGradient id="eshaniSkin" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E5A876" />
            <stop offset="60%" stopColor="#D99763" />
            <stop offset="100%" stopColor="#C4804D" />
          </linearGradient>
          <linearGradient id="eshaniNeck" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#B87342" />
            <stop offset="100%" stopColor="#D99763" />
          </linearGradient>
          <radialGradient id="cheekBlush" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#E2654A" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#E2654A" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="sunGlow" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#FFD494" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#D99763" stopOpacity="0" />
          </radialGradient>

          <linearGradient id="hairGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2A2C33" />
            <stop offset="50%" stopColor="#1E1F24" />
            <stop offset="100%" stopColor="#131418" />
          </linearGradient>
          <linearGradient id="hairHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4B4E59" />
            <stop offset="100%" stopColor="#25272F" />
          </linearGradient>

          <radialGradient id="irisGrad" cx="45%" cy="40%" r="55%">
            <stop offset="0%" stopColor="#5E3618" />
            <stop offset="65%" stopColor="#381D09" />
            <stop offset="100%" stopColor="#1C0E05" />
          </radialGradient>
          <linearGradient id="eyeShadow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#000000" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="silverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="35%" stopColor="#DDE1E8" />
            <stop offset="70%" stopColor="#9BA2B0" />
            <stop offset="100%" stopColor="#6C7280" />
          </linearGradient>
          <radialGradient id="bindiGrad" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#FFE066" />
            <stop offset="60%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#B45309" />
          </radialGradient>

          <linearGradient id="kurtaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="85%" stopColor="#F3F4F6" />
            <stop offset="100%" stopColor="#E5E7EB" />
          </linearGradient>
          <linearGradient id="kurtaShade" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E2E5EA" />
            <stop offset="100%" stopColor="#CACFD8" />
          </linearGradient>

          <clipPath id="leftEyeClip">
            <path d="M 125 240 C 135 210, 180 210, 195 240 C 180 262, 138 262, 125 240 Z" />
          </clipPath>
          <clipPath id="rightEyeClip">
            <path d="M 225 240 C 240 210, 285 210, 295 240 C 282 262, 240 262, 225 240 Z" />
          </clipPath>
        </defs>

        {/* Back Hair Mass */}
        <motion.g style={{ x: backHairX }}>
          <path
            d="M 130 180 C 80 180, 40 240, 50 310 C 35 340, 40 390, 65 430 C 50 455, 60 485, 90 500 C 120 515, 140 480, 150 440 C 120 370, 120 280, 130 180 Z"
            fill="url(#hairGrad)"
          />
          <path
            d="M 65 260 C 45 285, 45 325, 60 350 C 45 375, 55 415, 75 435 C 90 450, 115 440, 120 410"
            stroke="url(#hairHighlight)"
            strokeWidth="8"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 290 180 C 340 180, 380 240, 370 310 C 385 340, 380 390, 355 430 C 370 455, 360 485, 330 500 C 300 515, 280 480, 270 440 C 300 370, 300 280, 290 180 Z"
            fill="url(#hairGrad)"
          />
          <path
            d="M 355 260 C 375 285, 375 325, 360 350 C 375 375, 365 415, 345 435 C 330 450, 305 440, 300 410"
            stroke="url(#hairHighlight)"
            strokeWidth="8"
            strokeLinecap="round"
            fill="none"
          />
        </motion.g>

        {/* Body & White Kurta */}
        <g id="bodyGroup">
          <path
            d="M 70 520 C 75 430, 145 385, 210 385 C 275 385, 345 430, 350 520 Z"
            fill="url(#kurtaGrad)"
          />
          <path
            d="M 70 520 C 78 440, 130 400, 170 395 C 150 435, 140 480, 135 520 Z"
            fill="url(#kurtaShade)"
            opacity="0.35"
          />
          <path
            d="M 350 520 C 342 440, 290 400, 250 395 C 270 435, 280 480, 285 520 Z"
            fill="url(#kurtaShade)"
            opacity="0.35"
          />

          <path
            d="M 175 300 L 175 390 C 185 405, 235 405, 245 390 L 245 300 Z"
            fill="url(#eshaniNeck)"
          />
          <path
            d="M 175 300 C 190 325, 230 325, 245 300 C 235 340, 185 340, 175 300 Z"
            fill="#9C5A2B"
            opacity="0.6"
          />

          <path
            d="M 170 390 L 210 465 L 250 390 C 235 405, 185 405, 170 390 Z"
            fill="url(#eshaniSkin)"
          />

          <path
            d="M 185 375 Q 210 425 235 375"
            stroke="url(#silverGrad)"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="210" cy="425" r="4.5" fill="#2563EB" stroke="#FFFFFF" strokeWidth="1.5" />

          <path
            d="M 166 385 L 210 472 L 254 385"
            stroke="#FFFFFF"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <path
            d="M 162 383 L 210 478 L 258 383"
            stroke="#E5E7EB"
            strokeWidth="1.8"
            strokeDasharray="4 3"
            fill="none"
          />

          <g stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.9">
            <path d="M 188 410 Q 175 410 178 402" />
            <path d="M 196 425 Q 183 425 186 417" />
            <path d="M 203 442 Q 192 445 194 436" />
            <path d="M 232 410 Q 245 410 242 402" />
            <path d="M 224 425 Q 237 425 234 417" />
            <path d="M 217 442 Q 228 445 226 436" />
          </g>
        </g>

        {/* Head & Face Group (3D Parallax Tilt) */}
        <motion.g
          id="headGroup"
          style={{
            rotateY: headRotateY,
            rotateX: headRotateX,
            x: headTranslateX,
            y: headTranslateY,
            transformOrigin: "210px 280px"
          }}
        >
          {/* Ears */}
          <g id="ears">
            <path
              d="M 135 240 C 115 240, 110 275, 125 295 C 132 305, 140 305, 142 290 Z"
              fill="url(#eshaniSkin)"
            />
            <path
              d="M 130 252 C 122 255, 120 275, 130 282"
              stroke="#B87342"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 285 240 C 305 240, 310 275, 295 295 C 288 305, 280 305, 278 290 Z"
              fill="url(#eshaniSkin)"
            />
            <path
              d="M 290 252 C 298 255, 300 275, 290 282"
              stroke="#B87342"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
          </g>

          {/* Silver Jhumka Earrings with Reactive Swing */}
          <g id="earrings">
            <motion.g
              style={{
                rotate: earringLeftRotate,
                transformOrigin: "126px 295px"
              }}
            >
              <circle cx="126" cy="295" r="4.5" fill="url(#silverGrad)" stroke="#6C7280" strokeWidth="1" />
              <line x1="126" y1="299" x2="126" y2="305" stroke="#9BA2B0" strokeWidth="2" />
              <path
                d="M 115 316 C 115 305, 137 305, 137 316 Z"
                fill="url(#silverGrad)"
                stroke="#6C7280"
                strokeWidth="1.2"
              />
              <line x1="114" y1="316" x2="138" y2="316" stroke="#4B5563" strokeWidth="2" />
              <circle cx="117" cy="321" r="1.8" fill="#FFFFFF" stroke="#9BA2B0" strokeWidth="0.8" />
              <circle cx="122" cy="322" r="1.8" fill="#FFFFFF" stroke="#9BA2B0" strokeWidth="0.8" />
              <circle cx="126" cy="322.5" r="1.8" fill="#FFFFFF" stroke="#9BA2B0" strokeWidth="0.8" />
              <circle cx="130" cy="322" r="1.8" fill="#FFFFFF" stroke="#9BA2B0" strokeWidth="0.8" />
              <circle cx="135" cy="321" r="1.8" fill="#FFFFFF" stroke="#9BA2B0" strokeWidth="0.8" />
            </motion.g>

            <motion.g
              style={{
                rotate: earringRightRotate,
                transformOrigin: "294px 295px"
              }}
            >
              <circle cx="294" cy="295" r="4.5" fill="url(#silverGrad)" stroke="#6C7280" strokeWidth="1" />
              <line x1="294" y1="299" x2="294" y2="305" stroke="#9BA2B0" strokeWidth="2" />
              <path
                d="M 283 316 C 283 305, 305 305, 305 316 Z"
                fill="url(#silverGrad)"
                stroke="#6C7280"
                strokeWidth="1.2"
              />
              <line x1="282" y1="316" x2="306" y2="316" stroke="#4B5563" strokeWidth="2" />
              <circle cx="285" cy="321" r="1.8" fill="#FFFFFF" stroke="#9BA2B0" strokeWidth="0.8" />
              <circle cx="289" cy="322" r="1.8" fill="#FFFFFF" stroke="#9BA2B0" strokeWidth="0.8" />
              <circle cx="294" cy="322.5" r="1.8" fill="#FFFFFF" stroke="#9BA2B0" strokeWidth="0.8" />
              <circle cx="299" cy="322" r="1.8" fill="#FFFFFF" stroke="#9BA2B0" strokeWidth="0.8" />
              <circle cx="304" cy="321" r="1.8" fill="#FFFFFF" stroke="#9BA2B0" strokeWidth="0.8" />
            </motion.g>
          </g>

          {/* Face Base */}
          <path
            d="M 136 215 C 136 140, 284 140, 284 215 C 284 275, 252 325, 210 325 C 168 325, 136 275, 136 215 Z"
            fill="url(#eshaniSkin)"
          />

          <ellipse cx="210" cy="195" rx="60" ry="40" fill="url(#sunGlow)" />
          <ellipse cx="150" cy="275" rx="26" ry="18" fill="url(#cheekBlush)" />
          <ellipse cx="270" cy="275" rx="26" ry="18" fill="url(#cheekBlush)" />

          {/* Golden Bindi */}
          <circle cx="210" cy="188" r="5" fill="url(#bindiGrad)" stroke="#D97706" strokeWidth="1" />
          <circle cx="208.5" cy="186.5" r="1.5" fill="#FEF3C7" opacity="0.9" />

          {/* Eyebrows */}
          <motion.g style={{ y: eyebrowY }}>
            <path
              d="M 132 208 C 145 194, 175 194, 192 205"
              stroke="#1F2128"
              strokeWidth="5.5"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 228 205 C 245 194, 275 194, 288 208"
              stroke="#1F2128"
              strokeWidth="5.5"
              strokeLinecap="round"
              fill="none"
            />
          </motion.g>

          {/* Nose */}
          <g id="nose">
            <path
              d="M 207 205 L 207 254"
              stroke="#F6C396"
              strokeWidth="2.5"
              strokeLinecap="round"
              opacity="0.7"
            />
            <path
              d="M 199 258 C 203 263, 217 263, 221 258"
              stroke="#B36636"
              strokeWidth="3.2"
              strokeLinecap="round"
              fill="none"
            />
            <circle cx="210" cy="254" r="5.5" fill="#E29562" opacity="0.4" />
          </g>

          {/* Mouth / Smile */}
          <g id="mouth">
            {isHappy ? (
              <>
                <path
                  d="M 184 285 C 192 306, 228 306, 236 285 Z"
                  fill="#991B1B"
                  stroke="#7F1D1D"
                  strokeWidth="2"
                />
                <path
                  d="M 188 286 C 196 295, 224 295, 232 286 Z"
                  fill="#FFFFFF"
                />
                <path
                  d="M 182 284 C 196 288, 224 288, 238 284"
                  stroke="#A8432B"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  fill="none"
                />
              </>
            ) : (
              <>
                <path
                  d="M 184 285 C 196 298, 224 298, 236 285"
                  stroke="#9E3B20"
                  strokeWidth="3.8"
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  d="M 194 295 C 202 299, 218 299, 226 295"
                  stroke="#E2785D"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  opacity="0.85"
                  fill="none"
                />
              </>
            )}
          </g>

          {/* Eyes & Tracking Pupils */}
          <g id="eyes">
            {/* Left Eye */}
            <g id="leftEyeGroup" ref={leftEyeRef}>
              <path
                d="M 125 240 C 135 210, 180 210, 195 240 C 180 262, 138 262, 125 240 Z"
                fill="#FFFFFF"
              />
              <path
                d="M 125 240 C 135 210, 180 210, 195 240 C 180 225, 138 225, 125 240 Z"
                fill="url(#eyeShadow)"
              />

              <g clipPath="url(#leftEyeClip)">
                <g transform={`translate(${leftPupil.x}, ${leftPupil.y})`}>
                  <circle cx="160" cy="238" r="16.5" fill="url(#irisGrad)" />
                  <circle cx="160" cy="238" r="16.5" stroke="#180C04" strokeWidth="2.2" fill="none" />
                  <circle cx="160" cy="238" r="9.5" fill="#0D0703" />
                  <circle cx="155" cy="233" r="4.2" fill="#FFFFFF" opacity="0.95" />
                  <circle cx="165" cy="243" r="2.2" fill="#FFFFFF" opacity="0.75" />
                </g>
              </g>

              <path
                d="M 122 241 C 134 207, 182 207, 198 241"
                stroke="#16171B"
                strokeWidth="4.8"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M 124 240 Q 117 236 116 230"
                stroke="#16171B"
                strokeWidth="3.2"
                strokeLinecap="round"
                fill="none"
              />

              {(isBlinking || isWinking) && (
                <path
                  d="M 122 241 C 135 258, 182 258, 198 241 C 182 216, 135 216, 122 241 Z"
                  fill="url(#eshaniSkin)"
                  stroke="#16171B"
                  strokeWidth="3.5"
                />
              )}
            </g>

            {/* Right Eye */}
            <g id="rightEyeGroup" ref={rightEyeRef}>
              <path
                d="M 225 240 C 240 210, 285 210, 295 240 C 282 262, 240 262, 225 240 Z"
                fill="#FFFFFF"
              />
              <path
                d="M 225 240 C 240 210, 285 210, 295 240 C 282 225, 240 225, 225 240 Z"
                fill="url(#eyeShadow)"
              />

              <g clipPath="url(#rightEyeClip)">
                <g transform={`translate(${rightPupil.x}, ${rightPupil.y})`}>
                  <circle cx="260" cy="238" r="16.5" fill="url(#irisGrad)" />
                  <circle cx="260" cy="238" r="16.5" stroke="#180C04" strokeWidth="2.2" fill="none" />
                  <circle cx="260" cy="238" r="9.5" fill="#0D0703" />
                  <circle cx="255" cy="233" r="4.2" fill="#FFFFFF" opacity="0.95" />
                  <circle cx="265" cy="243" r="2.2" fill="#FFFFFF" opacity="0.75" />
                </g>
              </g>

              <path
                d="M 222 241 C 238 207, 286 207, 298 241"
                stroke="#16171B"
                strokeWidth="4.8"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M 296 240 Q 303 236 304 230"
                stroke="#16171B"
                strokeWidth="3.2"
                strokeLinecap="round"
                fill="none"
              />

              {(isBlinking && !isWinking) && (
                <path
                  d="M 222 241 C 238 258, 286 258, 298 241 C 286 216, 238 216, 222 241 Z"
                  fill="url(#eshaniSkin)"
                  stroke="#16171B"
                  strokeWidth="3.5"
                />
              )}
            </g>
          </g>
        </motion.g>

        {/* Foreground Hair Volume & Curls */}
        <motion.g style={{ x: frontHairX }}>
          <path
            d="M 125 190 C 115 110, 180 85, 210 85 C 240 85, 305 110, 295 190 C 280 155, 240 145, 210 145 C 180 145, 140 155, 125 190 Z"
            fill="url(#hairGrad)"
          />

          <path
            d="M 138 165 C 115 170, 95 210, 105 260 C 95 285, 90 330, 110 370 C 85 320, 95 250, 120 200 C 130 180, 135 170, 138 165 Z"
            fill="url(#hairGrad)"
          />
          <path
            d="M 108 210 C 90 240, 88 280, 102 320 C 110 340, 122 360, 135 375"
            stroke="url(#hairHighlight)"
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
          />

          <path
            d="M 282 165 C 305 170, 325 210, 315 260 C 325 285, 330 330, 310 370 C 335 320, 325 250, 300 200 C 290 180, 285 170, 282 165 Z"
            fill="url(#hairGrad)"
          />
          <path
            d="M 312 210 C 330 240, 332 280, 318 320 C 310 340, 298 360, 285 375"
            stroke="url(#hairHighlight)"
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
          />

          <path
            d="M 160 145 C 175 130, 195 130, 205 142"
            stroke="url(#hairHighlight)"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 215 142 C 225 130, 245 130, 260 145"
            stroke="url(#hairHighlight)"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />
        </motion.g>
      </svg>
    </div>
  );
}