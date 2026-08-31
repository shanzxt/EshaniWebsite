import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, useSpring, useMotionValue, useTransform } from "framer-motion";

/**
 * InteractiveAvatar (Ankit / uxdularia 3/4 Pixar Style)
 * - 3/4 perspective turned slightly to the left
 * - Cute stylized rounded head & slender angled neck
 * - Signature warm cream eye-socket patches & large expressive tracking eyes
 * - Gorgeous voluminous dark wavy curls with clean bold vector flow
 * - Golden bindi, silver jhumka earring, cute blushed button nose, and white embroidered kurta
 */
export default function InteractiveAvatar({
  className = "",
  size = 460,
  interactive = true,
  theme = "paper"
}) {
  const containerRef = useRef(null);
  const leftEyeRef = useRef(null);
  const rightEyeRef = useRef(null);

  // Blinking & interactions
  const [isBlinking, setIsBlinking] = useState(false);
  const [isWinking, setIsWinking] = useState(false);
  const [isHappy, setIsHappy] = useState(false);
  const [speechBubble, setSpeechBubble] = useState("");

  // Normalized mouse coordinates (-1 to 1)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Springs for smooth head tilt and parallax
  const springConfig = { stiffness: 100, damping: 16, mass: 0.55 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // 3D Parallax Tilt
  const headRotateY = useTransform(smoothX, [-1, 1], [-8, 8]);
  const headRotateX = useTransform(smoothY, [-1, 1], [6, -6]);
  const headTranslateX = useTransform(smoothX, [-1, 1], [-10, 10]);
  const headTranslateY = useTransform(smoothY, [-1, 1], [-6, 6]);

  // Hair parallax
  const backHairX = useTransform(smoothX, [-1, 1], [5, -5]);
  const frontHairX = useTransform(smoothX, [-1, 1], [-12, 12]);

  // Jhumka earring swing
  const earringRotate = useTransform(smoothX, [-1, 1], [-14, 18]);

  // Eyebrow lift
  const eyebrowY = useTransform(smoothY, [-1, 1], [-3, 2]);

  // Pupil offsets (clamped)
  const [leftPupil, setLeftPupil] = useState({ x: 0, y: 0 });
  const [rightPupil, setRightPupil] = useState({ x: 0, y: 0 });

  // Calculate eye pupil positions towards cursor
  const updatePupils = useCallback((clientX, clientY) => {
    if (!leftEyeRef.current || !rightEyeRef.current) return;

    const leftRect = leftEyeRef.current.getBoundingClientRect();
    const rightRect = rightEyeRef.current.getBoundingClientRect();

    const calcEye = (rect, maxRadius = 8.5) => {
      const eyeCenterX = rect.left + rect.width / 2;
      const eyeCenterY = rect.top + rect.height / 2;

      const dx = clientX - eyeCenterX;
      const dy = clientY - eyeCenterY;
      const angle = Math.atan2(dy, dx);
      const distance = Math.hypot(dx, dy);

      const radius = Math.min(maxRadius, distance / 22);
      return {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius * 0.85
      };
    };

    setLeftPupil(calcEye(leftRect, 8));
    setRightPupil(calcEye(rightRect, 9));
  }, []);

  // Global mouse move tracking
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
          const fakeTargetX = rect.left + rect.width / 2 + autoX * 280;
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

  // Natural blinking
  useEffect(() => {
    let blinkTimeout;
    const triggerBlink = () => {
      setIsBlinking(true);
      setTimeout(() => {
        setIsBlinking(false);
        if (Math.random() < 0.25) {
          setTimeout(() => {
            setIsBlinking(true);
            setTimeout(() => setIsBlinking(false), 130);
          }, 170);
        }
      }, 150);

      const nextBlink = 3000 + Math.random() * 3500;
      blinkTimeout = setTimeout(triggerBlink, nextBlink);
    };

    blinkTimeout = setTimeout(triggerBlink, 3000);
    return () => clearTimeout(blinkTimeout);
  }, []);

  // Avatar click interaction
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
        aspectRatio: "440 / 520",
        margin: "0 auto",
        cursor: "pointer",
        userSelect: "none",
        perspective: "1000px"
      }}
      title="Click me!"
      data-testid="interactive-avatar"
    >
      {/* Speech bubble */}
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

      {/* Main SVG Graphic */}
      <svg
        viewBox="0 0 440 520"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          width: "100%",
          height: "100%",
          overflow: "visible",
          filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.16))"
        }}
      >
        <defs>
          {/* Skin & Blush Gradients (Matches Ankit warm stylized palette) */}
          <linearGradient id="eshaniSkin" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F9D7BC" />
            <stop offset="55%" stopColor="#F1C2A0" />
            <stop offset="100%" stopColor="#E0A783" />
          </linearGradient>
          <linearGradient id="eshaniNeck" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D4946D" />
            <stop offset="45%" stopColor="#E9B28D" />
            <stop offset="100%" stopColor="#F1C2A0" />
          </linearGradient>
          <radialGradient id="noseBlush" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#F97046" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#F97046" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="earBlush" cx="40%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#F48A66" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#F1C2A0" stopOpacity="0" />
          </radialGradient>

          {/* Hair Gradients (Bold, Clean, Dark Graphic Curls) */}
          <linearGradient id="hairGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#282A33" />
            <stop offset="60%" stopColor="#1C1D24" />
            <stop offset="100%" stopColor="#121318" />
          </linearGradient>
          <linearGradient id="hairHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4A4E5E" />
            <stop offset="100%" stopColor="#23252E" />
          </linearGradient>

          {/* Iris Gradient */}
          <radialGradient id="irisGrad" cx="40%" cy="38%" r="60%">
            <stop offset="0%" stopColor="#783D1A" />
            <stop offset="60%" stopColor="#452009" />
            <stop offset="100%" stopColor="#1F0E04" />
          </radialGradient>

          {/* Jewelry & Kurta Gradients */}
          <linearGradient id="silverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="40%" stopColor="#DCE1EA" />
            <stop offset="100%" stopColor="#8C93A3" />
          </linearGradient>
          <radialGradient id="bindiGrad" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#FFE066" />
            <stop offset="60%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#B45309" />
          </radialGradient>

          <linearGradient id="kurtaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="85%" stopColor="#F2F4F7" />
            <stop offset="100%" stopColor="#E2E5EB" />
          </linearGradient>
          <linearGradient id="kurtaShadow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#CBD0DC" />
            <stop offset="100%" stopColor="#A8B0C0" />
          </linearGradient>

          {/* Eye ClipPaths for 3/4 Perspective */}
          <clipPath id="eyeFarClip">
            <path d="M 132 230 C 138 206, 164 206, 170 230 C 164 246, 138 246, 132 230 Z" />
          </clipPath>
          <clipPath id="eyeNearClip">
            <path d="M 200 206 C 212 174, 252 174, 258 206 C 252 230, 212 230, 200 206 Z" />
          </clipPath>
        </defs>

        {/* ===================================================
            LAYER 1: FULL BACK HAIR MASS (Wavy, Luscious Curls)
            =================================================== */}
        <motion.g style={{ x: backHairX }}>
          {/* Main Solid Hair Silhouette */}
          <path
            d="M 210 40 
               C 130 40, 45 90, 38 180 
               C 30 250, 42 320, 58 380 
               C 70 430, 95 480, 145 510 
               C 175 525, 200 500, 205 450 
               L 205 380 
               L 275 380 
               L 275 450 
               C 280 500, 305 525, 335 510 
               C 385 480, 410 430, 422 380 
               C 438 320, 450 250, 442 180 
               C 435 90, 350 40, 210 40 Z"
            fill="url(#hairGrad)"
          />

          {/* Organic Wave Rhythms on Outer Hair */}
          <path
            d="M 58 190 C 36 230, 35 285, 52 330 C 38 365, 48 415, 72 455 C 90 480, 120 495, 150 490"
            stroke="url(#hairHighlight)"
            strokeWidth="8"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 422 190 C 444 230, 445 285, 428 330 C 442 365, 432 415, 408 455 C 390 480, 360 495, 330 490"
            stroke="url(#hairHighlight)"
            strokeWidth="8"
            strokeLinecap="round"
            fill="none"
          />
        </motion.g>

        {/* ===================================================
            LAYER 2: BODY, SHOULDERS & WHITE EMBROIDERED KURTA
            =================================================== */}
        <g id="bodyGroup">
          {/* Angled Torso & Shoulders */}
          <path
            d="M 80 520 C 90 430, 160 380, 230 375 C 300 375, 385 425, 395 520 Z"
            fill="url(#kurtaGrad)"
          />
          {/* Left/Right Shading */}
          <path
            d="M 80 520 C 90 440, 140 395, 185 390 C 160 440, 150 480, 145 520 Z"
            fill="url(#kurtaShadow)"
            opacity="0.25"
          />
          <path
            d="M 395 520 C 385 440, 335 395, 290 390 C 315 440, 325 480, 330 520 Z"
            fill="url(#kurtaShadow)"
            opacity="0.25"
          />

          {/* Graceful Angled Neck */}
          <path
            d="M 195 280 L 195 385 C 205 398, 255 398, 265 385 L 270 270 Z"
            fill="url(#eshaniNeck)"
          />
          {/* Neck Drop Shadow under Jaw */}
          <path
            d="M 195 280 C 205 305, 245 305, 270 270 C 255 315, 205 315, 195 280 Z"
            fill="#B26C45"
            opacity="0.55"
          />

          {/* V-Neck Opening */}
          <path
            d="M 190 380 L 230 460 L 270 380 C 255 395, 205 395, 190 380 Z"
            fill="url(#eshaniSkin)"
          />

          {/* Silver Chain & Blue Pendant */}
          <path
            d="M 205 365 Q 230 420 255 365"
            stroke="url(#silverGrad)"
            strokeWidth="2.4"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="230" cy="420" r="4.2" fill="#2563EB" stroke="#FFFFFF" strokeWidth="1.5" />

          {/* Chikankari Kurta Embroidery */}
          <path
            d="M 186 375 L 230 465 L 274 375"
            stroke="#FFFFFF"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <path
            d="M 182 373 L 230 471 L 278 373"
            stroke="#DCE1EA"
            strokeWidth="1.8"
            strokeDasharray="4 3"
            fill="none"
          />

          <g stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.9">
            <path d="M 206 400 Q 194 400 196 392" />
            <path d="M 214 420 Q 202 420 205 412" />
            <path d="M 222 438 Q 212 442 214 433" />
            <path d="M 252 400 Q 264 400 262 392" />
            <path d="M 244 420 Q 256 420 253 412" />
            <path d="M 236 438 Q 246 442 244 433" />
          </g>
        </g>

        {/* ===================================================
            LAYER 3: 3/4 ANGLED HEAD, EARS, NOSE & EYES
            (Exact Ankit / Pixar Style Geometry)
            =================================================== */}
        <motion.g
          id="headGroup"
          style={{
            rotateY: headRotateY,
            rotateX: headRotateX,
            x: headTranslateX,
            y: headTranslateY,
            transformOrigin: "220px 260px"
          }}
        >
          {/* Stylized Pixar 3/4 Head Shape */}
          <path
            d="M 135 240 
               C 115 190, 150 110, 230 110 
               C 300 110, 335 170, 320 240 
               C 310 280, 275 315, 220 315 
               C 175 315, 145 285, 135 240 Z"
            fill="url(#eshaniSkin)"
          />

          {/* Far Ear (Left profile) */}
          <path
            d="M 135 235 C 118 240, 115 270, 130 285 C 138 292, 145 285, 142 270 Z"
            fill="url(#eshaniSkin)"
          />
          <ellipse cx="128" cy="265" rx="8" ry="14" fill="url(#earBlush)" />

          {/* Near Ear (Cute Pixar Ear on Right) */}
          <g id="nearEar">
            <path
              d="M 315 235 C 345 220, 385 240, 388 268 C 390 295, 350 318, 315 295 Z"
              fill="url(#eshaniSkin)"
            />
            <ellipse cx="350" cy="270" rx="20" ry="15" fill="url(#earBlush)" />
            <path
              d="M 335 252 C 355 250, 365 265, 352 278"
              stroke="#D48660"
              strokeWidth="3.2"
              strokeLinecap="round"
              fill="none"
            />
          </g>

          {/* Silver Jhumka on Near Ear */}
          <g id="jhumka">
            <motion.g
              style={{
                rotate: earringRotate,
                transformOrigin: "348px 292px"
              }}
            >
              <circle cx="348" cy="292" r="4.2" fill="url(#silverGrad)" stroke="#5A6070" strokeWidth="1" />
              <line x1="348" y1="296" x2="348" y2="304" stroke="#8C93A3" strokeWidth="2.2" />
              <path
                d="M 336 318 C 336 304, 360 304, 360 318 Z"
                fill="url(#silverGrad)"
                stroke="#5A6070"
                strokeWidth="1.2"
              />
              <line x1="335" y1="318" x2="361" y2="318" stroke="#374151" strokeWidth="2.2" />
              <circle cx="338" cy="323" r="1.8" fill="#FFFFFF" stroke="#8C93A3" strokeWidth="0.8" />
              <circle cx="343" cy="324" r="1.8" fill="#FFFFFF" stroke="#8C93A3" strokeWidth="0.8" />
              <circle cx="348" cy="324.5" r="1.8" fill="#FFFFFF" stroke="#8C93A3" strokeWidth="0.8" />
              <circle cx="353" cy="324" r="1.8" fill="#FFFFFF" stroke="#8C93A3" strokeWidth="0.8" />
              <circle cx="358" cy="323" r="1.8" fill="#FFFFFF" stroke="#8C93A3" strokeWidth="0.8" />
            </motion.g>
          </g>

          {/* SIGNATURE WARM CREAM EYE-SOCKET CIRCLES */}
          <ellipse cx="150" cy="232" rx="24" ry="28" fill="#FCF0E2" />
          <ellipse cx="230" cy="206" rx="30" ry="35" fill="#FCF0E2" />

          {/* Golden Bindi */}
          <circle cx="188" cy="168" r="4.6" fill="url(#bindiGrad)" stroke="#D97706" strokeWidth="1" />
          <circle cx="186.8" cy="166.8" r="1.4" fill="#FEF3C7" opacity="0.95" />

          {/* Dynamic Arched Eyebrows */}
          <motion.g style={{ y: eyebrowY }}>
            <path
              d="M 135 195 C 145 186, 165 186, 174 194"
              stroke="#181920"
              strokeWidth="5"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 205 168 C 218 156, 252 156, 266 170"
              stroke="#181920"
              strokeWidth="6"
              strokeLinecap="round"
              fill="none"
            />
          </motion.g>

          {/* Button Nose with Orange Blush & Nostril Dots */}
          <g id="nose">
            <ellipse cx="185" cy="245" rx="16" ry="12" fill="url(#noseBlush)" />
            <circle cx="180" cy="246" r="2.2" fill="#8C3A18" />
            <circle cx="190" cy="247" r="2.2" fill="#8C3A18" />
          </g>

          {/* Sweet Minimalist Mouth */}
          <g id="mouth">
            {isHappy ? (
              <path
                d="M 188 274 C 196 288, 218 288, 226 274"
                stroke="#9E3015"
                strokeWidth="3.6"
                strokeLinecap="round"
                fill="none"
              />
            ) : (
              <path
                d="M 190 276 C 196 281, 210 281, 216 276"
                stroke="#9E3015"
                strokeWidth="3.4"
                strokeLinecap="round"
                fill="none"
              />
            )}
          </g>

          {/* INTERACTIVE TRACKING EYES */}
          <g id="eyes">
            {/* --- FAR EYE (LEFT) --- */}
            <g id="farEye" ref={leftEyeRef}>
              <path
                d="M 132 230 C 138 206, 164 206, 170 230 C 164 246, 138 246, 132 230 Z"
                fill="#FFFFFF"
              />
              <g clipPath="url(#eyeFarClip)">
                <g transform={`translate(${leftPupil.x}, ${leftPupil.y})`}>
                  <circle cx="151" cy="226" r="14" fill="url(#irisGrad)" />
                  <circle cx="151" cy="226" r="14" stroke="#160B04" strokeWidth="2" fill="none" />
                  <circle cx="151" cy="226" r="7.5" fill="#0C0602" />
                  <circle cx="147" cy="221" r="3.6" fill="#FFFFFF" opacity="0.95" />
                  <circle cx="155" cy="229" r="1.8" fill="#FFFFFF" opacity="0.8" />
                </g>
              </g>

              <path
                d="M 130 231 C 138 204, 166 204, 174 231"
                stroke="#14151C"
                strokeWidth="4.6"
                strokeLinecap="round"
                fill="none"
              />
              {(isBlinking || isWinking) && (
                <path
                  d="M 130 231 C 138 246, 166 246, 174 231 C 166 210, 138 210, 130 231 Z"
                  fill="url(#eshaniSkin)"
                  stroke="#14151C"
                  strokeWidth="3.4"
                />
              )}
            </g>

            {/* --- NEAR EYE (RIGHT) --- */}
            <g id="nearEye" ref={rightEyeRef}>
              <path
                d="M 200 206 C 212 174, 252 174, 258 206 C 252 230, 212 230, 200 206 Z"
                fill="#FFFFFF"
              />
              <g clipPath="url(#eyeNearClip)">
                <g transform={`translate(${rightPupil.x}, ${rightPupil.y})`}>
                  <circle cx="230" cy="202" r="18" fill="url(#irisGrad)" />
                  <circle cx="230" cy="202" r="18" stroke="#160B04" strokeWidth="2.2" fill="none" />
                  <circle cx="230" cy="202" r="9.5" fill="#0C0602" />
                  <circle cx="225" cy="196" r="4.8" fill="#FFFFFF" opacity="0.95" />
                  <circle cx="235" cy="206" r="2.4" fill="#FFFFFF" opacity="0.8" />
                </g>
              </g>

              <path
                d="M 197 207 C 212 172, 254 172, 264 207"
                stroke="#14151C"
                strokeWidth="5.6"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M 262 206 Q 272 200 274 192"
                stroke="#14151C"
                strokeWidth="3.6"
                strokeLinecap="round"
                fill="none"
              />
              {(isBlinking && !isWinking) && (
                <path
                  d="M 197 207 C 212 230, 254 230, 264 207 C 254 180, 212 180, 197 207 Z"
                  fill="url(#eshaniSkin)"
                  stroke="#14151C"
                  strokeWidth="4"
                />
              )}
            </g>
          </g>
        </motion.g>

        {/* ===================================================
            LAYER 4: FOREGROUND HAIR (Wavy Curls Framing Head)
            =================================================== */}
        <motion.g style={{ x: frontHairX }}>
          {/* Top Hair Crown Volume */}
          <path
            d="M 140 180 
               C 125 90, 185 55, 240 55 
               C 310 55, 345 110, 335 200 
               C 315 145, 275 130, 230 130 
               C 185 130, 155 145, 140 180 Z"
            fill="url(#hairGrad)"
          />

          {/* Left Wavy Side Lock */}
          <path
            d="M 155 150 
               C 125 155, 95 195, 105 245 
               C 95 275, 90 325, 112 375 
               C 90 320, 100 250, 125 195 
               C 138 170, 148 158, 155 150 Z"
            fill="url(#hairGrad)"
          />
          <path
            d="M 108 205 C 88 238, 86 280, 102 325 C 112 350, 125 375, 140 395"
            stroke="url(#hairHighlight)"
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
          />

          {/* Right Wavy Side Lock */}
          <path
            d="M 305 145 
               C 335 155, 360 200, 350 255 
               C 362 285, 365 335, 342 385 
               C 368 330, 355 255, 330 195 
               C 318 170, 310 155, 305 145 Z"
            fill="url(#hairGrad)"
          />
          <path
            d="M 342 205 C 362 238, 364 280, 348 325 C 338 350, 325 375, 310 395"
            stroke="url(#hairHighlight)"
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
          />

          {/* Forehead Parting Waves */}
          <path
            d="M 155 150 C 180 132, 210 132, 225 148"
            stroke="url(#hairHighlight)"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 235 148 C 250 132, 280 132, 305 150"
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