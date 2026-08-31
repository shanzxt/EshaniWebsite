import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, useSpring, useMotionValue, useTransform } from "framer-motion";

/**
 * InteractiveAvatar
 * Refined 2D stylized vector character of Eshani
 * - Fixed: Full contiguous wavy hair mass (no background gaps behind head/ears)
 * - Fixed: Elegant, natural almond-shaped eye proportions with smooth cursor tracking
 * - Features: 3D head tilt parallax, reactive swinging jhumkas, natural blinking, click speech bubble
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

  // Blinking & expressions
  const [isBlinking, setIsBlinking] = useState(false);
  const [isWinking, setIsWinking] = useState(false);
  const [isHappy, setIsHappy] = useState(false);
  const [speechBubble, setSpeechBubble] = useState("");

  // Raw normalized mouse coordinates (-1 to 1)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for head tilt & parallax
  const springConfig = { stiffness: 120, damping: 18, mass: 0.6 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Head 3D tilt & shift
  const headRotateY = useTransform(smoothX, [-1, 1], [-7, 7]);
  const headRotateX = useTransform(smoothY, [-1, 1], [5, -5]);
  const headTranslateX = useTransform(smoothX, [-1, 1], [-8, 8]);
  const headTranslateY = useTransform(smoothY, [-1, 1], [-5, 5]);

  // Subtle hair parallax depth
  const backHairX = useTransform(smoothX, [-1, 1], [4, -4]);
  const frontHairX = useTransform(smoothX, [-1, 1], [-10, 10]);

  // Earrings reactive physics swing
  const earringLeftRotate = useTransform(smoothX, [-1, 1], [-10, 14]);
  const earringRightRotate = useTransform(smoothX, [-1, 1], [-14, 10]);

  // Eyebrow reactive lift
  const eyebrowY = useTransform(smoothY, [-1, 1], [-2.5, 1.5]);

  // Pupil offsets (clamped)
  const [leftPupil, setLeftPupil] = useState({ x: 0, y: 0 });
  const [rightPupil, setRightPupil] = useState({ x: 0, y: 0 });

  // Calculate eye pupil positions towards cursor
  const updatePupils = useCallback((clientX, clientY) => {
    if (!leftEyeRef.current || !rightEyeRef.current) return;

    const leftRect = leftEyeRef.current.getBoundingClientRect();
    const rightRect = rightEyeRef.current.getBoundingClientRect();

    const calcEye = (rect, maxRadius = 7.5) => {
      const eyeCenterX = rect.left + rect.width / 2;
      const eyeCenterY = rect.top + rect.height / 2;

      const dx = clientX - eyeCenterX;
      const dy = clientY - eyeCenterY;
      const angle = Math.atan2(dy, dx);
      const distance = Math.hypot(dx, dy);

      const radius = Math.min(maxRadius, distance / 28);
      return {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius * 0.8
      };
    };

    setLeftPupil(calcEye(leftRect, 7.5));
    setRightPupil(calcEye(rightRect, 7.5));
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
        const autoX = Math.sin(t) * 0.35;
        const autoY = Math.cos(t * 0.7) * 0.2;
        mouseX.set(autoX);
        mouseY.set(autoY);

        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          const fakeTargetX = rect.left + rect.width / 2 + autoX * 250;
          const fakeTargetY = rect.top + rect.height / 2 + autoY * 180;
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

      const nextBlink = 3200 + Math.random() * 3500;
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
      {/* Speech bubble popup */}
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

      {/* Main SVG Vector Character */}
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
          {/* Skin & Warm Blush Gradients */}
          <linearGradient id="eshaniSkin" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E8AA79" />
            <stop offset="60%" stopColor="#DC9965" />
            <stop offset="100%" stopColor="#C6814E" />
          </linearGradient>
          <linearGradient id="eshaniNeck" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#BA7443" />
            <stop offset="100%" stopColor="#DC9965" />
          </linearGradient>
          <radialGradient id="cheekBlush" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#E2654A" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#E2654A" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="sunGlow" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#FFD89C" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#DC9965" stopOpacity="0" />
          </radialGradient>

          {/* Voluminous Dark Wavy Hair Gradients */}
          <linearGradient id="hairGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#25272F" />
            <stop offset="50%" stopColor="#1B1C22" />
            <stop offset="100%" stopColor="#111216" />
          </linearGradient>
          <linearGradient id="hairHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4A4E5C" />
            <stop offset="100%" stopColor="#22242C" />
          </linearGradient>
          <linearGradient id="hairShadow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0B0C0E" />
            <stop offset="100%" stopColor="#18191E" />
          </linearGradient>

          {/* Eye & Iris Gradients */}
          <radialGradient id="irisGrad" cx="45%" cy="40%" r="55%">
            <stop offset="0%" stopColor="#633A19" />
            <stop offset="65%" stopColor="#3B1F0A" />
            <stop offset="100%" stopColor="#1E0F05" />
          </radialGradient>
          <linearGradient id="eyeShadow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#000000" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </linearGradient>

          {/* Jewelry Gradients */}
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

          {/* Kurta & Cloth Gradients */}
          <linearGradient id="kurtaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="85%" stopColor="#F3F4F6" />
            <stop offset="100%" stopColor="#E5E7EB" />
          </linearGradient>
          <linearGradient id="kurtaShade" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E2E5EA" />
            <stop offset="100%" stopColor="#CACFD8" />
          </linearGradient>

          {/* Refined Clamped Eye Clip Paths */}
          <clipPath id="leftEyeClip">
            <path d="M 142 230 C 150 214, 178 214, 186 230 C 178 244, 150 244, 142 230 Z" />
          </clipPath>
          <clipPath id="rightEyeClip">
            <path d="M 234 230 C 242 214, 270 214, 278 230 C 270 244, 242 244, 234 230 Z" />
          </clipPath>
        </defs>

        {/* ===================================================
            LAYER 1: SOLID BACK HAIR MASS (Zero Background Gaps)
            =================================================== */}
        <motion.g style={{ x: backHairX }}>
          {/* Main Full Hair Mass Silhouette */}
          <path
            d="M 210 55 
               C 130 55, 60 100, 48 180 
               C 35 240, 40 310, 52 370 
               C 62 420, 85 470, 130 500 
               C 155 515, 180 500, 185 460 
               L 185 360 
               L 235 360 
               L 235 460 
               C 240 500, 265 515, 290 500 
               C 335 470, 358 420, 368 370 
               C 380 310, 385 240, 372 180 
               C 360 100, 290 55, 210 55 Z"
            fill="url(#hairGrad)"
          />

          {/* Wavy Outer Curls & Volume Depth */}
          <path
            d="M 65 190 C 45 225, 42 275, 58 315 C 44 345, 52 390, 72 425 C 88 450, 115 465, 140 460"
            stroke="url(#hairHighlight)"
            strokeWidth="7"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 355 190 C 375 225, 378 275, 362 315 C 376 345, 368 390, 348 425 C 332 450, 305 465, 280 460"
            stroke="url(#hairHighlight)"
            strokeWidth="7"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 85 250 C 68 285, 70 330, 88 365 C 78 395, 92 430, 115 450"
            stroke="url(#hairShadow)"
            strokeWidth="10"
            strokeLinecap="round"
            fill="none"
            opacity="0.6"
          />
          <path
            d="M 335 250 C 352 285, 350 330, 332 365 C 342 395, 328 430, 305 450"
            stroke="url(#hairShadow)"
            strokeWidth="10"
            strokeLinecap="round"
            fill="none"
            opacity="0.6"
          />
        </motion.g>

        {/* ===================================================
            LAYER 2: BODY, SHOULDERS & WHITE EMBROIDERED KURTA
            =================================================== */}
        <g id="bodyGroup">
          <path
            d="M 70 520 C 75 425, 145 375, 210 375 C 275 375, 345 425, 350 520 Z"
            fill="url(#kurtaGrad)"
          />
          <path
            d="M 70 520 C 78 435, 130 390, 170 385 C 150 430, 140 475, 135 520 Z"
            fill="url(#kurtaShade)"
            opacity="0.35"
          />
          <path
            d="M 350 520 C 342 435, 290 390, 250 385 C 270 430, 280 475, 285 520 Z"
            fill="url(#kurtaShade)"
            opacity="0.35"
          />

          {/* Balanced Neck */}
          <path
            d="M 180 270 L 180 375 C 190 388, 230 388, 240 375 L 240 270 Z"
            fill="url(#eshaniNeck)"
          />
          <path
            d="M 178 270 C 190 300, 230 300, 242 270 C 235 310, 185 310, 178 270 Z"
            fill="#9C5A2B"
            opacity="0.55"
          />

          {/* Kurta V-Neck */}
          <path
            d="M 172 375 L 210 455 L 248 375 C 235 388, 185 388, 172 375 Z"
            fill="url(#eshaniSkin)"
          />

          {/* Silver Chain & Pendant */}
          <path
            d="M 186 360 Q 210 415 234 360"
            stroke="url(#silverGrad)"
            strokeWidth="2.2"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="210" cy="415" r="4.2" fill="#2563EB" stroke="#FFFFFF" strokeWidth="1.5" />

          {/* Chikankari Embroidery Borders */}
          <path
            d="M 168 370 L 210 460 L 252 370"
            stroke="#FFFFFF"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <path
            d="M 164 368 L 210 466 L 256 368"
            stroke="#E5E7EB"
            strokeWidth="1.8"
            strokeDasharray="4 3"
            fill="none"
          />

          <g stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.9">
            <path d="M 188 395 Q 176 395 178 388" />
            <path d="M 195 412 Q 183 412 186 405" />
            <path d="M 202 430 Q 192 434 194 425" />
            <path d="M 232 395 Q 244 395 242 388" />
            <path d="M 225 412 Q 237 412 234 405" />
            <path d="M 218 430 Q 228 434 226 425" />
          </g>
        </g>

        {/* ===================================================
            LAYER 3: HEAD, EARS, REFINED EYES & FACE
            =================================================== */}
        <motion.g
          id="headGroup"
          style={{
            rotateY: headRotateY,
            rotateX: headRotateX,
            x: headTranslateX,
            y: headTranslateY,
            transformOrigin: "210px 260px"
          }}
        >
          {/* Head & Skull Fill */}
          <ellipse cx="210" cy="190" rx="72" ry="85" fill="url(#eshaniSkin)" />

          {/* Stylized Ears */}
          <g id="ears">
            <path
              d="M 142 215 C 128 215, 122 242, 134 258 C 140 266, 146 264, 148 252 Z"
              fill="url(#eshaniSkin)"
            />
            <path
              d="M 136 226 C 130 228, 128 244, 136 250"
              stroke="#B87342"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 278 215 C 292 215, 298 242, 286 258 C 280 266, 274 264, 272 252 Z"
              fill="url(#eshaniSkin)"
            />
            <path
              d="M 284 226 C 290 228, 292 244, 284 250"
              stroke="#B87342"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
          </g>

          {/* Silver Jhumka Drop Earrings */}
          <g id="earrings">
            <motion.g
              style={{
                rotate: earringLeftRotate,
                transformOrigin: "134px 258px"
              }}
            >
              <circle cx="134" cy="258" r="3.8" fill="url(#silverGrad)" stroke="#6C7280" strokeWidth="1" />
              <line x1="134" y1="262" x2="134" y2="267" stroke="#9BA2B0" strokeWidth="1.8" />
              <path
                d="M 125 277 C 125 268, 143 268, 143 277 Z"
                fill="url(#silverGrad)"
                stroke="#6C7280"
                strokeWidth="1"
              />
              <line x1="124" y1="277" x2="144" y2="277" stroke="#4B5563" strokeWidth="1.8" />
              <circle cx="126" cy="281" r="1.5" fill="#FFFFFF" stroke="#9BA2B0" strokeWidth="0.6" />
              <circle cx="130" cy="282" r="1.5" fill="#FFFFFF" stroke="#9BA2B0" strokeWidth="0.6" />
              <circle cx="134" cy="282.5" r="1.5" fill="#FFFFFF" stroke="#9BA2B0" strokeWidth="0.6" />
              <circle cx="138" cy="282" r="1.5" fill="#FFFFFF" stroke="#9BA2B0" strokeWidth="0.6" />
              <circle cx="142" cy="281" r="1.5" fill="#FFFFFF" stroke="#9BA2B0" strokeWidth="0.6" />
            </motion.g>

            <motion.g
              style={{
                rotate: earringRightRotate,
                transformOrigin: "286px 258px"
              }}
            >
              <circle cx="286" cy="258" r="3.8" fill="url(#silverGrad)" stroke="#6C7280" strokeWidth="1" />
              <line x1="286" y1="262" x2="286" y2="267" stroke="#9BA2B0" strokeWidth="1.8" />
              <path
                d="M 277 277 C 277 268, 295 268, 295 277 Z"
                fill="url(#silverGrad)"
                stroke="#6C7280"
                strokeWidth="1"
              />
              <line x1="276" y1="277" x2="296" y2="277" stroke="#4B5563" strokeWidth="1.8" />
              <circle cx="278" cy="281" r="1.5" fill="#FFFFFF" stroke="#9BA2B0" strokeWidth="0.6" />
              <circle cx="282" cy="282" r="1.5" fill="#FFFFFF" stroke="#9BA2B0" strokeWidth="0.6" />
              <circle cx="286" cy="282.5" r="1.5" fill="#FFFFFF" stroke="#9BA2B0" strokeWidth="0.6" />
              <circle cx="290" cy="282" r="1.5" fill="#FFFFFF" stroke="#9BA2B0" strokeWidth="0.6" />
              <circle cx="294" cy="281" r="1.5" fill="#FFFFFF" stroke="#9BA2B0" strokeWidth="0.6" />
            </motion.g>
          </g>

          {/* Smooth Face Shape */}
          <path
            d="M 142 175 
               C 142 110, 278 110, 278 175 
               C 278 232, 248 285, 210 285 
               C 172 285, 142 232, 142 175 Z"
            fill="url(#eshaniSkin)"
          />

          {/* Glow & Blush */}
          <ellipse cx="210" cy="165" rx="50" ry="32" fill="url(#sunGlow)" />
          <ellipse cx="156" cy="248" rx="20" ry="14" fill="url(#cheekBlush)" />
          <ellipse cx="264" cy="248" rx="20" ry="14" fill="url(#cheekBlush)" />

          {/* Golden Bindi */}
          <circle cx="210" cy="188" r="4.2" fill="url(#bindiGrad)" stroke="#D97706" strokeWidth="0.8" />
          <circle cx="208.8" cy="186.8" r="1.2" fill="#FEF3C7" opacity="0.9" />

          {/* Eyebrows */}
          <motion.g style={{ y: eyebrowY }}>
            <path
              d="M 142 205 C 152 195, 174 195, 185 204"
              stroke="#1C1E24"
              strokeWidth="4.2"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 235 204 C 246 195, 268 195, 278 205"
              stroke="#1C1E24"
              strokeWidth="4.2"
              strokeLinecap="round"
              fill="none"
            />
          </motion.g>

          {/* Nose */}
          <g id="nose">
            <path
              d="M 208 198 L 208 240"
              stroke="#F6C396"
              strokeWidth="2.2"
              strokeLinecap="round"
              opacity="0.65"
            />
            <path
              d="M 201 243 C 204 247, 216 247, 219 243"
              stroke="#B36636"
              strokeWidth="2.8"
              strokeLinecap="round"
              fill="none"
            />
            <circle cx="210" cy="239" r="4.5" fill="#E29562" opacity="0.35" />
          </g>

          {/* Mouth */}
          <g id="mouth">
            {isHappy ? (
              <>
                <path
                  d="M 188 260 C 195 276, 225 276, 232 260 Z"
                  fill="#991B1B"
                  stroke="#7F1D1D"
                  strokeWidth="1.8"
                />
                <path
                  d="M 191 261 C 198 268, 222 268, 229 261 Z"
                  fill="#FFFFFF"
                />
                <path
                  d="M 186 259 C 198 263, 222 263, 234 259"
                  stroke="#A8432B"
                  strokeWidth="3"
                  strokeLinecap="round"
                  fill="none"
                />
              </>
            ) : (
              <>
                <path
                  d="M 188 260 C 198 270, 222 270, 232 260"
                  stroke="#9E3B20"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  d="M 196 268 C 202 271, 218 271, 224 268"
                  stroke="#E2785D"
                  strokeWidth="2"
                  strokeLinecap="round"
                  opacity="0.85"
                  fill="none"
                />
              </>
            )}
          </g>

          {/* ===================================================
              REFINED EYES & CURSOR-TRACKING PUPILS
              =================================================== */}
          <g id="eyes">
            {/* Left Eye */}
            <g id="leftEyeGroup" ref={leftEyeRef}>
              <path
                d="M 142 230 C 150 214, 178 214, 186 230 C 178 244, 150 244, 142 230 Z"
                fill="#FFFFFF"
              />
              <path
                d="M 142 230 C 150 214, 178 214, 186 230 C 178 220, 150 220, 142 230 Z"
                fill="url(#eyeShadow)"
              />

              <g clipPath="url(#leftEyeClip)">
                <g transform={`translate(${leftPupil.x}, ${leftPupil.y})`}>
                  <circle cx="164" cy="229" r="11.5" fill="url(#irisGrad)" />
                  <circle cx="164" cy="229" r="11.5" stroke="#180C04" strokeWidth="1.8" fill="none" />
                  <circle cx="164" cy="229" r="6.5" fill="#0D0703" />
                  <circle cx="161" cy="225" r="3" fill="#FFFFFF" opacity="0.95" />
                  <circle cx="167" cy="232" r="1.5" fill="#FFFFFF" opacity="0.75" />
                </g>
              </g>

              <path
                d="M 140 231 C 150 212, 178 212, 188 231"
                stroke="#16171B"
                strokeWidth="3.6"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M 141 230 Q 136 227 135 222"
                stroke="#16171B"
                strokeWidth="2.4"
                strokeLinecap="round"
                fill="none"
              />

              {(isBlinking || isWinking) && (
                <path
                  d="M 140 231 C 150 245, 178 245, 188 231 C 178 215, 150 215, 140 231 Z"
                  fill="url(#eshaniSkin)"
                  stroke="#16171B"
                  strokeWidth="2.8"
                />
              )}
            </g>

            {/* Right Eye */}
            <g id="rightEyeGroup" ref={rightEyeRef}>
              <path
                d="M 234 230 C 242 214, 270 214, 278 230 C 270 244, 242 244, 234 230 Z"
                fill="#FFFFFF"
              />
              <path
                d="M 234 230 C 242 214, 270 214, 278 230 C 270 220, 242 220, 234 230 Z"
                fill="url(#eyeShadow)"
              />

              <g clipPath="url(#rightEyeClip)">
                <g transform={`translate(${rightPupil.x}, ${rightPupil.y})`}>
                  <circle cx="256" cy="229" r="11.5" fill="url(#irisGrad)" />
                  <circle cx="256" cy="229" r="11.5" stroke="#180C04" strokeWidth="1.8" fill="none" />
                  <circle cx="256" cy="229" r="6.5" fill="#0D0703" />
                  <circle cx="253" cy="225" r="3" fill="#FFFFFF" opacity="0.95" />
                  <circle cx="259" cy="232" r="1.5" fill="#FFFFFF" opacity="0.75" />
                </g>
              </g>

              <path
                d="M 232 231 C 242 212, 270 212, 280 231"
                stroke="#16171B"
                strokeWidth="3.6"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M 279 230 Q 284 227 285 222"
                stroke="#16171B"
                strokeWidth="2.4"
                strokeLinecap="round"
                fill="none"
              />

              {(isBlinking && !isWinking) && (
                <path
                  d="M 232 231 C 242 245, 270 245, 280 231 C 270 215, 242 215, 232 231 Z"
                  fill="url(#eshaniSkin)"
                  stroke="#16171B"
                  strokeWidth="2.8"
                />
              )}
            </g>
          </g>
        </motion.g>

        {/* ===================================================
            LAYER 4: FOREGROUND HAIR (Wavy Curls Framing Face)
            =================================================== */}
        <motion.g style={{ x: frontHairX }}>
          {/* Top Crown */}
          <path
            d="M 132 170 
               C 120 95, 175 65, 210 65 
               C 245 65, 300 95, 288 170 
               C 272 135, 245 130, 210 130 
               C 175 130, 148 135, 132 170 Z"
            fill="url(#hairGrad)"
          />

          {/* Left Wavy Framing Lock */}
          <path
            d="M 152 140 
               C 130 145, 110 180, 118 225 
               C 110 250, 105 295, 122 335 
               C 105 290, 112 230, 132 185 
               C 142 165, 148 150, 152 140 Z"
            fill="url(#hairGrad)"
          />
          <path
            d="M 120 185 C 104 215, 102 255, 115 295 C 122 315, 132 335, 142 350"
            stroke="url(#hairHighlight)"
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
          />

          {/* Right Wavy Framing Lock */}
          <path
            d="M 268 140 
               C 290 145, 310 180, 302 225 
               C 310 250, 315 295, 298 335 
               C 315 290, 308 230, 288 185 
               C 278 165, 272 150, 268 140 Z"
            fill="url(#hairGrad)"
          />
          <path
            d="M 300 185 C 316 215, 318 255, 305 295 C 298 315, 288 335, 278 350"
            stroke="url(#hairHighlight)"
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
          />

          {/* Forehead Hairline Curls & Waves */}
          <path
            d="M 148 145 C 168 128, 192 128, 204 140"
            stroke="url(#hairHighlight)"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 216 140 C 228 128, 252 128, 272 145"
            stroke="url(#hairHighlight)"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 175 125 C 190 115, 230 115, 245 125"
            stroke="url(#hairHighlight)"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
            opacity="0.8"
          />
        </motion.g>
      </svg>
    </div>
  );
}