import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, useSpring, useMotionValue, useTransform } from "framer-motion";

/**
 * InteractiveAvatar (Clean, Symmetrical, Front-Facing Pixar Character)
 * - Front-facing centered view with balanced, normal proportions
 * - Symmetrical features (almond eyes, golden bindi, cute smile, silver jhumkas)
 * - Voluminous natural wavy dark curls framing both sides of the face
 * - Real-time smooth eye pupil cursor tracking & lifelike natural blinking
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

  // Normalized mouse coordinates (-1 to 1)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for gentle head parallax
  const springConfig = { stiffness: 100, damping: 18, mass: 0.5 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Subtle 3D Head Tilt
  const headRotateY = useTransform(smoothX, [-1, 1], [-6, 6]);
  const headRotateX = useTransform(smoothY, [-1, 1], [4, -4]);
  const headTranslateX = useTransform(smoothX, [-1, 1], [-6, 6]);
  const headTranslateY = useTransform(smoothY, [-1, 1], [-4, 4]);

  // Subtle Hair Parallax
  const backHairX = useTransform(smoothX, [-1, 1], [3, -3]);
  const frontHairX = useTransform(smoothX, [-1, 1], [-8, 8]);

  // Symmetrical Jhumka Earring Swing
  const earringLeftRotate = useTransform(smoothX, [-1, 1], [-8, 12]);
  const earringRightRotate = useTransform(smoothX, [-1, 1], [-12, 8]);

  // Eyebrow lift
  const eyebrowY = useTransform(smoothY, [-1, 1], [-2.5, 1.5]);

  // Pupil offsets (clamped for natural movement)
  const [leftPupil, setLeftPupil] = useState({ x: 0, y: 0 });
  const [rightPupil, setRightPupil] = useState({ x: 0, y: 0 });

  // Calculate eye pupil positions towards cursor
  const updatePupils = useCallback((clientX, clientY) => {
    if (!leftEyeRef.current || !rightEyeRef.current) return;

    const leftRect = leftEyeRef.current.getBoundingClientRect();
    const rightRect = rightEyeRef.current.getBoundingClientRect();

    const calcEye = (rect, maxRadius = 7) => {
      const eyeCenterX = rect.left + rect.width / 2;
      const eyeCenterY = rect.top + rect.height / 2;

      const dx = clientX - eyeCenterX;
      const dy = clientY - eyeCenterY;
      const angle = Math.atan2(dy, dx);
      const distance = Math.hypot(dx, dy);

      const radius = Math.min(maxRadius, distance / 26);
      return {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius * 0.8
      };
    };

    setLeftPupil(calcEye(leftRect, 7));
    setRightPupil(calcEye(rightRect, 7));
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

      const nextBlink = 3200 + Math.random() * 3500;
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

      {/* Main SVG Vector Graphic */}
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
          {/* Skin & Warm Blush Gradients */}
          <linearGradient id="eshaniSkin" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F9D7BC" />
            <stop offset="55%" stopColor="#F1C2A0" />
            <stop offset="100%" stopColor="#E2A985" />
          </linearGradient>
          <linearGradient id="eshaniNeck" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#D5956E" />
            <stop offset="50%" stopColor="#E8B28D" />
            <stop offset="100%" stopColor="#F1C2A0" />
          </linearGradient>
          <radialGradient id="cheekBlush" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#F27A55" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#F27A55" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="sunGlow" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#FFE0AA" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#F1C2A0" stopOpacity="0" />
          </radialGradient>

          {/* Hair Gradients (Rich Dark Voluminous Curls) */}
          <linearGradient id="hairGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#252730" />
            <stop offset="55%" stopColor="#1B1C22" />
            <stop offset="100%" stopColor="#111216" />
          </linearGradient>
          <linearGradient id="hairHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4A4E5E" />
            <stop offset="100%" stopColor="#242630" />
          </linearGradient>

          {/* Iris Gradient */}
          <radialGradient id="irisGrad" cx="40%" cy="38%" r="60%">
            <stop offset="0%" stopColor="#753B18" />
            <stop offset="60%" stopColor="#441F08" />
            <stop offset="100%" stopColor="#1D0D03" />
          </radialGradient>
          <linearGradient id="eyeShadow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#000000" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </linearGradient>

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

          {/* Symmetrical Eye ClipPaths */}
          <clipPath id="leftEyeClip">
            <path d="M 154 216 C 164 198, 190 198, 200 216 C 190 230, 164 230, 154 216 Z" />
          </clipPath>
          <clipPath id="rightEyeClip">
            <path d="M 240 216 C 250 198, 276 198, 286 216 C 276 230, 250 230, 240 216 Z" />
          </clipPath>
        </defs>

        {/* ===================================================
            LAYER 1: FULL SYMMETRICAL BACK HAIR MASS
            =================================================== */}
        <motion.g style={{ x: backHairX }}>
          <path
            d="M 220 45 
               C 140 45, 60 90, 50 170 
               C 40 230, 45 290, 55 350 
               C 65 400, 85 450, 125 480 
               C 150 495, 175 480, 180 440 
               L 180 350 
               L 260 350 
               L 260 440 
               C 265 480, 290 495, 315 480 
               C 355 450, 375 400, 385 350 
               C 395 290, 400 230, 390 170 
               C 380 90, 300 45, 220 45 Z"
            fill="url(#hairGrad)"
          />

          <path
            d="M 68 185 C 48 225, 46 280, 62 325 C 48 360, 56 410, 78 450 C 96 475, 125 490, 155 485"
            stroke="url(#hairHighlight)"
            strokeWidth="7.5"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 372 185 C 392 225, 394 280, 378 325 C 392 360, 384 410, 362 450 C 344 475, 315 490, 285 485"
            stroke="url(#hairHighlight)"
            strokeWidth="7.5"
            strokeLinecap="round"
            fill="none"
          />
        </motion.g>

        {/* ===================================================
            LAYER 2: BODY, TORSO & WHITE EMBROIDERED KURTA
            =================================================== */}
        <g id="bodyGroup">
          <path
            d="M 75 520 C 85 430, 150 375, 220 375 C 290 375, 355 430, 365 520 Z"
            fill="url(#kurtaGrad)"
          />
          <path
            d="M 75 520 C 85 440, 135 395, 175 390 C 150 440, 140 480, 135 520 Z"
            fill="url(#kurtaShadow)"
            opacity="0.25"
          />
          <path
            d="M 365 520 C 355 440, 305 395, 265 390 C 290 440, 300 480, 305 520 Z"
            fill="url(#kurtaShadow)"
            opacity="0.25"
          />

          <path
            d="M 194 265 L 194 375 C 202 388, 238 388, 246 375 L 246 265 Z"
            fill="url(#eshaniNeck)"
          />
          <path
            d="M 194 265 C 205 290, 235 290, 246 265 C 238 300, 202 300, 194 265 Z"
            fill="#A8623A"
            opacity="0.45"
          />

          <path
            d="M 185 375 L 220 455 L 255 375 C 240 388, 200 388, 185 375 Z"
            fill="url(#eshaniSkin)"
          />

          <path
            d="M 200 360 Q 220 410 240 360"
            stroke="url(#silverGrad)"
            strokeWidth="2.2"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="220" cy="410" r="4" fill="#2563EB" stroke="#FFFFFF" strokeWidth="1.4" />

          <path
            d="M 180 370 L 220 460 L 260 370"
            stroke="#FFFFFF"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <path
            d="M 176 368 L 220 466 L 264 368"
            stroke="#DCE1EA"
            strokeWidth="1.8"
            strokeDasharray="4 3"
            fill="none"
          />

          <g stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.9">
            <path d="M 198 395 Q 186 395 188 388" />
            <path d="M 205 415 Q 193 415 196 408" />
            <path d="M 212 434 Q 202 438 204 429" />
            <path d="M 242 395 Q 254 395 252 388" />
            <path d="M 235 415 Q 247 415 244 408" />
            <path d="M 228 434 Q 238 438 236 429" />
          </g>
        </g>

        {/* ===================================================
            LAYER 3: FRONT-FACING HEAD, EYES, NOSE & MOUTH
            =================================================== */}
        <motion.g
          id="headGroup"
          style={{
            rotateY: headRotateY,
            rotateX: headRotateX,
            x: headTranslateX,
            y: headTranslateY,
            transformOrigin: "220px 250px"
          }}
        >
          {/* Symmetrical Ears */}
          <g id="ears">
            <path
              d="M 148 205 C 132 205, 126 230, 138 245 C 144 252, 150 250, 152 240 Z"
              fill="url(#eshaniSkin)"
            />
            <path
              d="M 142 216 C 136 218, 134 234, 142 238"
              stroke="#D48660"
              strokeWidth="2.4"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 292 205 C 308 205, 314 230, 302 245 C 296 252, 290 250, 288 240 Z"
              fill="url(#eshaniSkin)"
            />
            <path
              d="M 298 216 C 304 218, 306 234, 298 238"
              stroke="#D48660"
              strokeWidth="2.4"
              strokeLinecap="round"
              fill="none"
            />
          </g>

          {/* Symmetrical Silver Jhumka Drop Earrings */}
          <g id="jhumkas">
            {/* Left Jhumka */}
            <motion.g
              style={{
                rotate: earringLeftRotate,
                transformOrigin: "138px 248px"
              }}
            >
              <circle cx="138" cy="248" r="3.6" fill="url(#silverGrad)" stroke="#5A6070" strokeWidth="0.8" />
              <line x1="138" y1="252" x2="138" y2="258" stroke="#8C93A3" strokeWidth="1.8" />
              <path
                d="M 128 268 C 128 259, 148 259, 148 268 Z"
                fill="url(#silverGrad)"
                stroke="#5A6070"
                strokeWidth="1"
              />
              <line x1="127" y1="268" x2="149" y2="268" stroke="#374151" strokeWidth="1.8" />
              <circle cx="130" cy="272" r="1.4" fill="#FFFFFF" stroke="#8C93A3" strokeWidth="0.6" />
              <circle cx="134" cy="273" r="1.4" fill="#FFFFFF" stroke="#8C93A3" strokeWidth="0.6" />
              <circle cx="138" cy="273.5" r="1.4" fill="#FFFFFF" stroke="#8C93A3" strokeWidth="0.6" />
              <circle cx="142" cy="273" r="1.4" fill="#FFFFFF" stroke="#8C93A3" strokeWidth="0.6" />
              <circle cx="146" cy="272" r="1.4" fill="#FFFFFF" stroke="#8C93A3" strokeWidth="0.6" />
            </motion.g>

            {/* Right Jhumka */}
            <motion.g
              style={{
                rotate: earringRightRotate,
                transformOrigin: "302px 248px"
              }}
            >
              <circle cx="302" cy="248" r="3.6" fill="url(#silverGrad)" stroke="#5A6070" strokeWidth="0.8" />
              <line x1="302" y1="252" x2="302" y2="258" stroke="#8C93A3" strokeWidth="1.8" />
              <path
                d="M 292 268 C 292 259, 312 259, 312 268 Z"
                fill="url(#silverGrad)"
                stroke="#5A6070"
                strokeWidth="1"
              />
              <line x1="291" y1="268" x2="313" y2="268" stroke="#374151" strokeWidth="1.8" />
              <circle cx="294" cy="272" r="1.4" fill="#FFFFFF" stroke="#8C93A3" strokeWidth="0.6" />
              <circle cx="298" cy="273" r="1.4" fill="#FFFFFF" stroke="#8C93A3" strokeWidth="0.6" />
              <circle cx="302" cy="273.5" r="1.4" fill="#FFFFFF" stroke="#8C93A3" strokeWidth="0.6" />
              <circle cx="306" cy="273" r="1.4" fill="#FFFFFF" stroke="#8C93A3" strokeWidth="0.6" />
              <circle cx="310" cy="272" r="1.4" fill="#FFFFFF" stroke="#8C93A3" strokeWidth="0.6" />
            </motion.g>
          </g>

          {/* Symmetrical Face Oval */}
          <path
            d="M 148 180 
               C 148 115, 292 115, 292 180 
               C 292 235, 260 282, 220 282 
               C 180 282, 148 235, 148 180 Z"
            fill="url(#eshaniSkin)"
          />

          {/* Forehead Sun Glow & Soft Cheek Blush */}
          <ellipse cx="220" cy="165" rx="45" ry="30" fill="url(#sunGlow)" />
          <ellipse cx="168" cy="242" rx="22" ry="14" fill="url(#cheekBlush)" />
          <ellipse cx="272" cy="242" rx="22" ry="14" fill="url(#cheekBlush)" />

          {/* Golden Bindi */}
          <circle cx="220" cy="172" r="4.2" fill="url(#bindiGrad)" stroke="#D97706" strokeWidth="0.8" />
          <circle cx="218.8" cy="170.8" r="1.2" fill="#FEF3C7" opacity="0.95" />

          {/* Symmetrical Arched Eyebrows */}
          <motion.g style={{ y: eyebrowY }}>
            <path
              d="M 152 192 C 164 182, 186 182, 198 191"
              stroke="#181920"
              strokeWidth="4.2"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 242 191 C 254 182, 276 182, 288 192"
              stroke="#181920"
              strokeWidth="4.2"
              strokeLinecap="round"
              fill="none"
            />
          </motion.g>

          {/* Cute Symmetrical Button Nose */}
          <g id="nose">
            <line x1="220" y1="195" x2="220" y2="232" stroke="#F6C396" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
            <ellipse cx="220" cy="233" rx="9" ry="6.5" fill="#F48A66" opacity="0.4" />
            <path
              d="M 213 234 C 216 238, 224 238, 227 234"
              stroke="#A85B30"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
          </g>

          {/* Sweet Symmetrical Smile */}
          <g id="mouth">
            {isHappy ? (
              <>
                <path
                  d="M 198 256 C 206 272, 234 272, 242 256 Z"
                  fill="#991B1B"
                  stroke="#7F1D1D"
                  strokeWidth="1.6"
                />
                <path
                  d="M 201 257 C 208 264, 232 264, 239 257 Z"
                  fill="#FFFFFF"
                />
                <path
                  d="M 196 255 C 208 259, 232 259, 244 255"
                  stroke="#A03B22"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                  fill="none"
                />
              </>
            ) : (
              <>
                <path
                  d="M 202 258 C 210 266, 230 266, 238 258"
                  stroke="#A03B22"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  d="M 208 264 C 213 268, 227 268, 232 264"
                  stroke="#E57A60"
                  strokeWidth="2"
                  strokeLinecap="round"
                  opacity="0.85"
                  fill="none"
                />
              </>
            )}
          </g>

          {/* ===================================================
              SYMMETRICAL INTERACTIVE EYES & TRACKING PUPILS
              =================================================== */}
          <g id="eyes">
            {/* --- LEFT EYE --- */}
            <g id="leftEye" ref={leftEyeRef}>
              <path
                d="M 154 216 C 164 198, 190 198, 200 216 C 190 230, 164 230, 154 216 Z"
                fill="#FFFFFF"
              />
              <path
                d="M 154 216 C 164 198, 190 198, 200 216 C 190 204, 164 204, 154 216 Z"
                fill="url(#eyeShadow)"
              />

              <g clipPath="url(#leftEyeClip)">
                <g transform={`translate(${leftPupil.x}, ${leftPupil.y})`}>
                  <circle cx="177" cy="214" r="12" fill="url(#irisGrad)" />
                  <circle cx="177" cy="214" r="12" stroke="#160B04" strokeWidth="1.6" fill="none" />
                  <circle cx="177" cy="214" r="6.8" fill="#0C0602" />
                  <circle cx="174" cy="210" r="3.2" fill="#FFFFFF" opacity="0.95" />
                  <circle cx="180" cy="217" r="1.6" fill="#FFFFFF" opacity="0.75" />
                </g>
              </g>

              <path
                d="M 152 217 C 164 196, 190 196, 202 217"
                stroke="#14151C"
                strokeWidth="3.8"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M 153 216 Q 147 213 146 208"
                stroke="#14151C"
                strokeWidth="2.4"
                strokeLinecap="round"
                fill="none"
              />

              {(isBlinking || isWinking) && (
                <path
                  d="M 152 217 C 164 231, 190 231, 202 217 C 190 200, 164 200, 152 217 Z"
                  fill="url(#eshaniSkin)"
                  stroke="#14151C"
                  strokeWidth="2.8"
                />
              )}
            </g>

            {/* --- RIGHT EYE --- */}
            <g id="rightEye" ref={rightEyeRef}>
              <path
                d="M 240 216 C 250 198, 276 198, 286 216 C 276 230, 250 230, 240 216 Z"
                fill="#FFFFFF"
              />
              <path
                d="M 240 216 C 250 198, 276 198, 286 216 C 276 204, 250 204, 240 216 Z"
                fill="url(#eyeShadow)"
              />

              <g clipPath="url(#rightEyeClip)">
                <g transform={`translate(${rightPupil.x}, ${rightPupil.y})`}>
                  <circle cx="263" cy="214" r="12" fill="url(#irisGrad)" />
                  <circle cx="263" cy="214" r="12" stroke="#160B04" strokeWidth="1.6" fill="none" />
                  <circle cx="263" cy="214" r="6.8" fill="#0C0602" />
                  <circle cx="260" cy="210" r="3.2" fill="#FFFFFF" opacity="0.95" />
                  <circle cx="266" cy="217" r="1.6" fill="#FFFFFF" opacity="0.75" />
                </g>
              </g>

              <path
                d="M 238 217 C 250 196, 276 196, 288 217"
                stroke="#14151C"
                strokeWidth="3.8"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M 287 216 Q 293 213 294 208"
                stroke="#14151C"
                strokeWidth="2.4"
                strokeLinecap="round"
                fill="none"
              />

              {(isBlinking && !isWinking) && (
                <path
                  d="M 238 217 C 250 231, 276 231, 288 217 C 276 200, 250 200, 238 217 Z"
                  fill="url(#eshaniSkin)"
                  stroke="#14151C"
                  strokeWidth="2.8"
                />
              )}
            </g>
          </g>
        </motion.g>

        {/* ===================================================
            LAYER 4: FOREGROUND HAIR (Natural Framing Curls)
            =================================================== */}
        <motion.g style={{ x: frontHairX }}>
          {/* Top Hair Crown */}
          <path
            d="M 142 165 
               C 130 90, 180 60, 220 60 
               C 260 60, 310 90, 298 165 
               C 280 128, 250 120, 220 120 
               C 190 120, 160 128, 142 165 Z"
            fill="url(#hairGrad)"
          />

          {/* Symmetrical Left Framing Wave */}
          <path
            d="M 152 140 
               C 132 145, 112 185, 120 230 
               C 112 260, 108 305, 128 350 
               C 108 300, 114 235, 136 185 
               C 144 165, 148 150, 152 140 Z"
            fill="url(#hairGrad)"
          />
          <path
            d="M 120 185 C 102 218, 100 260, 114 300 C 122 322, 132 342, 144 358"
            stroke="url(#hairHighlight)"
            strokeWidth="5.5"
            strokeLinecap="round"
            fill="none"
          />

          {/* Symmetrical Right Framing Wave */}
          <path
            d="M 288 140 
               C 308 145, 328 185, 320 230 
               C 328 260, 332 305, 312 350 
               C 332 300, 326 235, 304 185 C 296 165, 292 150, 288 140 Z"
            fill="url(#hairGrad)"
          />
          <path
            d="M 320 185 C 338 218, 340 260, 326 300 C 318 322, 308 342, 296 358"
            stroke="url(#hairHighlight)"
            strokeWidth="5.5"
            strokeLinecap="round"
            fill="none"
          />

          {/* Soft Forehead Hairline Parting Curves */}
          <path
            d="M 150 148 C 172 130, 202 130, 216 145"
            stroke="url(#hairHighlight)"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 224 145 C 238 130, 268 130, 290 148"
            stroke="url(#hairHighlight)"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />
        </motion.g>
      </svg>
    </div>
  );
}