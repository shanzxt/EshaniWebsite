import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, useSpring, useMotionValue, useTransform } from "framer-motion";

/**
 * InteractiveAvatar (Harmonious Front-Facing Disney/Pixar Stylized Character)
 * - Corrected proportions: Natural tapered neck, balanced face proportions
 * - Beautiful organic wavy curly hair clumps (not a solid helmet shape)
 * - Expressive sparkling eyes with sleek eyeliner & smooth real-time cursor tracking
 * - Perfectly placed golden bindi, soft button nose, warm smile, and swinging silver jhumkas
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

  // Blinking & interaction states
  const [isBlinking, setIsBlinking] = useState(false);
  const [isWinking, setIsWinking] = useState(false);
  const [isHappy, setIsHappy] = useState(false);
  const [speechBubble, setSpeechBubble] = useState("");

  // Normalized mouse coordinates (-1 to 1)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for gentle head tilt and hair parallax
  const springConfig = { stiffness: 110, damping: 18, mass: 0.5 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // 3D Parallax Tilt
  const headRotateY = useTransform(smoothX, [-1, 1], [-6, 6]);
  const headRotateX = useTransform(smoothY, [-1, 1], [4, -4]);
  const headTranslateX = useTransform(smoothX, [-1, 1], [-6, 6]);
  const headTranslateY = useTransform(smoothY, [-1, 1], [-4, 4]);

  // Subtle Hair Parallax
  const backHairX = useTransform(smoothX, [-1, 1], [3, -3]);
  const frontHairX = useTransform(smoothX, [-1, 1], [-7, 7]);

  // Jhumka Earring Reactive Swing
  const earringLeftRotate = useTransform(smoothX, [-1, 1], [-8, 12]);
  const earringRightRotate = useTransform(smoothX, [-1, 1], [-12, 8]);

  // Eyebrow Reactive Lift
  const eyebrowY = useTransform(smoothY, [-1, 1], [-2.5, 1.5]);

  // Pupil offsets (clamped for natural tracking)
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

      {/* Main Vector SVG */}
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
          {/* Skin Gradients */}
          <linearGradient id="eshaniSkin" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F9D7BD" />
            <stop offset="60%" stopColor="#F1C2A0" />
            <stop offset="100%" stopColor="#E2A985" />
          </linearGradient>
          <linearGradient id="eshaniNeck" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D5956E" />
            <stop offset="50%" stopColor="#E8B28D" />
            <stop offset="100%" stopColor="#F1C2A0" />
          </linearGradient>
          <radialGradient id="cheekBlush" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#F27A55" stopOpacity="0.38" />
            <stop offset="100%" stopColor="#F27A55" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="sunGlow" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#FFE0AA" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#F1C2A0" stopOpacity="0" />
          </radialGradient>

          {/* Voluminous Dark Curly Hair Gradients */}
          <linearGradient id="hairGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2A2C36" />
            <stop offset="50%" stopColor="#1E1F26" />
            <stop offset="100%" stopColor="#121317" />
          </linearGradient>
          <linearGradient id="hairHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4D5263" />
            <stop offset="100%" stopColor="#252732" />
          </linearGradient>
          <linearGradient id="hairShadow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0E0F12" />
            <stop offset="100%" stopColor="#1A1B22" />
          </linearGradient>

          {/* Iris Gradient */}
          <radialGradient id="irisGrad" cx="40%" cy="38%" r="60%">
            <stop offset="0%" stopColor="#7E421D" />
            <stop offset="60%" stopColor="#482209" />
            <stop offset="100%" stopColor="#1F0E04" />
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

          {/* Eye ClipPaths */}
          <clipPath id="leftEyeClip">
            <path d="M 152 210 C 162 192, 190 192, 200 210 C 190 225, 162 225, 152 210 Z" />
          </clipPath>
          <clipPath id="rightEyeClip">
            <path d="M 240 210 C 250 192, 278 192, 288 210 C 278 225, 250 225, 240 210 Z" />
          </clipPath>
        </defs>

        {/* ===================================================
            LAYER 1: SCULPTED ORGANIC WAVY CURLS (BACK HAIR)
            =================================================== */}
        <motion.g style={{ x: backHairX }}>
          <path
            d="M 220 50
               C 150 48, 95 85, 75 140
               C 55 185, 45 235, 60 280
               C 42 320, 48 375, 70 420
               C 85 455, 115 485, 155 490
               C 175 492, 185 470, 185 430
               L 185 350
               L 255 350
               L 255 430
               C 255 470, 265 492, 285 490
               C 325 485, 355 455, 370 420
               C 392 375, 398 320, 380 280
               C 395 235, 385 185, 365 140
               C 345 85, 290 48, 220 50 Z"
            fill="url(#hairGrad)"
          />

          {/* Left Wavy Highlights */}
          <path
            d="M 85 150 C 60 190, 55 240, 72 280 C 56 315, 62 365, 84 405 C 102 435, 130 460, 160 465"
            stroke="url(#hairHighlight)"
            strokeWidth="7"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 68 230 C 50 270, 52 320, 70 360 C 58 395, 72 435, 96 460"
            stroke="url(#hairShadow)"
            strokeWidth="8"
            strokeLinecap="round"
            fill="none"
            opacity="0.5"
          />

          {/* Right Wavy Highlights */}
          <path
            d="M 355 150 C 380 190, 385 240, 368 280 C 384 315, 378 365, 356 405 C 338 435, 310 460, 280 465"
            stroke="url(#hairHighlight)"
            strokeWidth="7"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 372 230 C 390 270, 388 320, 370 360 C 382 395, 368 435, 344 460"
            stroke="url(#hairShadow)"
            strokeWidth="8"
            strokeLinecap="round"
            fill="none"
            opacity="0.5"
          />
        </motion.g>

        {/* ===================================================
            LAYER 2: BODY, SHOULDERS & WHITE EMBROIDERED KURTA
            =================================================== */}
        <g id="bodyGroup">
          <path
            d="M 70 520 C 80 435, 145 370, 220 370 C 295 370, 360 435, 370 520 Z"
            fill="url(#kurtaGrad)"
          />
          <path
            d="M 70 520 C 80 445, 130 395, 172 385 C 148 440, 138 480, 135 520 Z"
            fill="url(#kurtaShadow)"
            opacity="0.25"
          />
          <path
            d="M 370 520 C 360 445, 310 395, 268 385 C 292 440, 302 480, 305 520 Z"
            fill="url(#kurtaShadow)"
            opacity="0.25"
          />

          {/* Natural Proportion Neck */}
          <path
            d="M 194 265 L 186 360 C 196 375, 244 375, 254 360 L 246 265 Z"
            fill="url(#eshaniNeck)"
          />
          <path
            d="M 194 265 C 205 288, 235 288, 246 265 C 238 296, 202 296, 194 265 Z"
            fill="#A8623A"
            opacity="0.45"
          />

          {/* Kurta V-Neck Opening */}
          <path
            d="M 184 365 L 220 445 L 256 365 C 240 378, 200 378, 184 365 Z"
            fill="url(#eshaniSkin)"
          />

          {/* Silver Chain & Blue Pendant */}
          <path
            d="M 198 350 Q 220 398 242 350"
            stroke="url(#silverGrad)"
            strokeWidth="2.2"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="220" cy="398" r="4.2" fill="#2563EB" stroke="#FFFFFF" strokeWidth="1.5" />

          {/* Chikankari Embroidery Borders */}
          <path
            d="M 180 360 L 220 450 L 260 360"
            stroke="#FFFFFF"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <path
            d="M 176 358 L 220 456 L 264 358"
            stroke="#DCE1EA"
            strokeWidth="1.8"
            strokeDasharray="4 3"
            fill="none"
          />

          {/* Leaf Embroidery Motifs */}
          <g stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.9">
            <path d="M 198 385 Q 186 385 188 378" />
            <path d="M 205 405 Q 193 405 196 398" />
            <path d="M 212 424 Q 202 428 204 419" />
            <path d="M 242 385 Q 254 385 252 378" />
            <path d="M 235 405 Q 247 405 244 398" />
            <path d="M 228 424 Q 238 428 236 419" />
          </g>
        </g>

        {/* ===================================================
            LAYER 3: HEAD, EARS, REFINED EYES, NOSE & SMILE
            =================================================== */}
        <motion.g
          id="headGroup"
          style={{
            rotateY: headRotateY,
            rotateX: headRotateX,
            x: headTranslateX,
            y: headTranslateY,
            transformOrigin: "220px 240px"
          }}
        >
          {/* Ears */}
          <g id="ears">
            <path
              d="M 148 195 C 132 195, 126 220, 138 235 C 144 242, 150 240, 152 230 Z"
              fill="url(#eshaniSkin)"
            />
            <path
              d="M 142 206 C 136 208, 134 224, 142 228"
              stroke="#D48660"
              strokeWidth="2.4"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 292 195 C 308 195, 314 220, 302 235 C 296 242, 290 240, 288 230 Z"
              fill="url(#eshaniSkin)"
            />
            <path
              d="M 298 206 C 304 208, 306 224, 298 228"
              stroke="#D48660"
              strokeWidth="2.4"
              strokeLinecap="round"
              fill="none"
            />
          </g>

          {/* Silver Jhumka Drop Earrings */}
          <g id="jhumkas">
            {/* Left Jhumka */}
            <motion.g
              style={{
                rotate: earringLeftRotate,
                transformOrigin: "138px 238px"
              }}
            >
              <circle cx="138" cy="238" r="3.8" fill="url(#silverGrad)" stroke="#5A6070" strokeWidth="0.8" />
              <line x1="138" y1="242" x2="138" y2="248" stroke="#8C93A3" strokeWidth="1.8" />
              <path
                d="M 128 258 C 128 249, 148 249, 148 258 Z"
                fill="url(#silverGrad)"
                stroke="#5A6070"
                strokeWidth="1"
              />
              <line x1="127" y1="258" x2="149" y2="258" stroke="#374151" strokeWidth="1.8" />
              <circle cx="130" cy="262" r="1.5" fill="#FFFFFF" stroke="#8C93A3" strokeWidth="0.6" />
              <circle cx="134" cy="263" r="1.5" fill="#FFFFFF" stroke="#8C93A3" strokeWidth="0.6" />
              <circle cx="138" cy="263.5" r="1.5" fill="#FFFFFF" stroke="#8C93A3" strokeWidth="0.6" />
              <circle cx="142" cy="263" r="1.5" fill="#FFFFFF" stroke="#8C93A3" strokeWidth="0.6" />
              <circle cx="146" cy="262" r="1.5" fill="#FFFFFF" stroke="#8C93A3" strokeWidth="0.6" />
            </motion.g>

            {/* Right Jhumka */}
            <motion.g
              style={{
                rotate: earringRightRotate,
                transformOrigin: "302px 238px"
              }}
            >
              <circle cx="302" cy="238" r="3.8" fill="url(#silverGrad)" stroke="#5A6070" strokeWidth="0.8" />
              <line x1="302" y1="242" x2="302" y2="248" stroke="#8C93A3" strokeWidth="1.8" />
              <path
                d="M 292 258 C 292 249, 312 249, 312 258 Z"
                fill="url(#silverGrad)"
                stroke="#5A6070"
                strokeWidth="1"
              />
              <line x1="291" y1="258" x2="313" y2="258" stroke="#374151" strokeWidth="1.8" />
              <circle cx="294" cy="262" r="1.5" fill="#FFFFFF" stroke="#8C93A3" strokeWidth="0.6" />
              <circle cx="298" cy="263" r="1.5" fill="#FFFFFF" stroke="#8C93A3" strokeWidth="0.6" />
              <circle cx="302" cy="263.5" r="1.5" fill="#FFFFFF" stroke="#8C93A3" strokeWidth="0.6" />
              <circle cx="306" cy="263" r="1.5" fill="#FFFFFF" stroke="#8C93A3" strokeWidth="0.6" />
              <circle cx="310" cy="262" r="1.5" fill="#FFFFFF" stroke="#8C93A3" strokeWidth="0.6" />
            </motion.g>
          </g>

          {/* Feminine Face Shape */}
          <path
            d="M 148 175 
               C 148 108, 292 108, 292 175 
               C 292 230, 260 278, 220 278 
               C 180 278, 148 230, 148 175 Z"
            fill="url(#eshaniSkin)"
          />

          {/* Forehead Glow & Cheek Blush */}
          <ellipse cx="220" cy="158" rx="42" ry="28" fill="url(#sunGlow)" />
          <ellipse cx="166" cy="236" rx="20" ry="13" fill="url(#cheekBlush)" />
          <ellipse cx="274" cy="236" rx="20" ry="13" fill="url(#cheekBlush)" />

          {/* Golden Bindi */}
          <circle cx="220" cy="168" r="4.2" fill="url(#bindiGrad)" stroke="#D97706" strokeWidth="0.8" />
          <circle cx="218.8" cy="166.8" r="1.3" fill="#FEF3C7" opacity="0.95" />

          {/* Symmetrical Tapered Eyebrows */}
          <motion.g style={{ y: eyebrowY }}>
            <path
              d="M 152 186 C 166 174, 190 174, 202 184"
              stroke="#181920"
              strokeWidth="4.4"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 238 184 C 250 174, 274 174, 288 186"
              stroke="#181920"
              strokeWidth="4.4"
              strokeLinecap="round"
              fill="none"
            />
          </motion.g>

          {/* Button Nose */}
          <g id="nose">
            <line x1="220" y1="188" x2="220" y2="224" stroke="#F6C396" strokeWidth="2.2" strokeLinecap="round" opacity="0.6" />
            <ellipse cx="220" cy="226" rx="9" ry="6.5" fill="#F48A66" opacity="0.4" />
            <path
              d="M 213 227 C 216 231, 224 231, 227 227"
              stroke="#A85B30"
              strokeWidth="2.6"
              strokeLinecap="round"
              fill="none"
            />
          </g>

          {/* Smile */}
          <g id="mouth">
            {isHappy ? (
              <>
                <path
                  d="M 198 250 C 206 266, 234 266, 242 250 Z"
                  fill="#991B1B"
                  stroke="#7F1D1D"
                  strokeWidth="1.6"
                />
                <path
                  d="M 201 251 C 208 258, 232 258, 239 251 Z"
                  fill="#FFFFFF"
                />
                <path
                  d="M 196 249 C 208 253, 232 253, 244 249"
                  stroke="#A03B22"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                  fill="none"
                />
              </>
            ) : (
              <>
                <path
                  d="M 200 252 C 210 262, 230 262, 240 252"
                  stroke="#9C351E"
                  strokeWidth="3.4"
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  d="M 208 258 C 213 262, 227 262, 232 258"
                  stroke="#E8745A"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  opacity="0.85"
                  fill="none"
                />
              </>
            )}
          </g>

          {/* ===================================================
              LARGE EXPRESSIVE SPARKLING EYES (CURSOR TRACKING)
              =================================================== */}
          <g id="eyes">
            {/* Left Eye */}
            <g id="leftEye" ref={leftEyeRef}>
              <path
                d="M 152 210 C 162 192, 190 192, 200 210 C 190 225, 162 225, 152 210 Z"
                fill="#FFFFFF"
              />
              <path
                d="M 152 210 C 162 192, 190 192, 200 210 C 190 198, 162 198, 152 210 Z"
                fill="url(#eyeShadow)"
              />

              <g clipPath="url(#leftEyeClip)">
                <g transform={`translate(${leftPupil.x}, ${leftPupil.y})`}>
                  <circle cx="176" cy="208" r="12.5" fill="url(#irisGrad)" />
                  <circle cx="176" cy="208" r="12.5" stroke="#160B04" strokeWidth="1.8" fill="none" />
                  <circle cx="176" cy="208" r="7" fill="#0C0602" />
                  <circle cx="173" cy="204" r="3.4" fill="#FFFFFF" opacity="0.95" />
                  <circle cx="179" cy="211" r="1.7" fill="#FFFFFF" opacity="0.75" />
                </g>
              </g>

              <path
                d="M 150 211 C 162 190, 190 190, 202 211"
                stroke="#14151C"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M 151 210 Q 145 207 144 202"
                stroke="#14151C"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />

              {(isBlinking || isWinking) && (
                <path
                  d="M 150 211 C 162 226, 190 226, 202 211 C 190 194, 162 194, 150 211 Z"
                  fill="url(#eshaniSkin)"
                  stroke="#14151C"
                  strokeWidth="3"
                />
              )}
            </g>

            {/* Right Eye */}
            <g id="rightEye" ref={rightEyeRef}>
              <path
                d="M 240 210 C 250 192, 278 192, 288 210 C 278 225, 250 225, 240 210 Z"
                fill="#FFFFFF"
              />
              <path
                d="M 240 210 C 250 192, 278 192, 288 210 C 278 198, 250 198, 240 210 Z"
                fill="url(#eyeShadow)"
              />

              <g clipPath="url(#rightEyeClip)">
                <g transform={`translate(${rightPupil.x}, ${rightPupil.y})`}>
                  <circle cx="264" cy="208" r="12.5" fill="url(#irisGrad)" />
                  <circle cx="264" cy="208" r="12.5" stroke="#160B04" strokeWidth="1.8" fill="none" />
                  <circle cx="264" cy="208" r="7" fill="#0C0602" />
                  <circle cx="261" cy="204" r="3.4" fill="#FFFFFF" opacity="0.95" />
                  <circle cx="267" cy="211" r="1.7" fill="#FFFFFF" opacity="0.75" />
                </g>
              </g>

              <path
                d="M 238 211 C 250 190, 278 190, 290 211"
                stroke="#14151C"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M 289 210 Q 295 207 296 202"
                stroke="#14151C"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />

              {(isBlinking && !isWinking) && (
                <path
                  d="M 238 211 C 250 226, 278 226, 290 211 C 278 194, 250 194, 238 211 Z"
                  fill="url(#eshaniSkin)"
                  stroke="#14151C"
                  strokeWidth="3"
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
               C 130 85, 180 55, 220 55 
               C 260 55, 310 85, 298 165 
               C 280 125, 250 115, 220 115 
               C 190 115, 160 125, 142 165 Z"
            fill="url(#hairGrad)"
          />

          {/* Symmetrical Left Framing Wave & Curls */}
          <path
            d="M 152 135 
               C 132 140, 108 178, 118 225 
               C 108 255, 102 300, 122 345 
               C 102 295, 110 230, 132 180 
               C 142 160, 148 145, 152 135 Z"
            fill="url(#hairGrad)"
          />
          <path
            d="M 118 180 C 98 215, 96 258, 110 300 C 118 322, 130 345, 144 360"
            stroke="url(#hairHighlight)"
            strokeWidth="5.5"
            strokeLinecap="round"
            fill="none"
          />

          {/* Symmetrical Right Framing Wave & Curls */}
          <path
            d="M 288 135 
               C 308 140, 332 178, 322 225 
               C 332 255, 338 300, 318 345 
               C 338 295, 330 230, 308 180 
               C 298 160, 292 145, 288 135 Z"
            fill="url(#hairGrad)"
          />
          <path
            d="M 322 180 C 342 215, 344 258, 330 300 C 322 322, 310 345, 296 360"
            stroke="url(#hairHighlight)"
            strokeWidth="5.5"
            strokeLinecap="round"
            fill="none"
          />

          {/* Soft Forehead Hairline Parting Curves */}
          <path
            d="M 150 142 C 172 124, 202 124, 216 138"
            stroke="url(#hairHighlight)"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 224 138 C 238 124, 268 124, 290 142"
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