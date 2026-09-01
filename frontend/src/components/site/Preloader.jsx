import React, { useCallback, useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import "./preloader.css";

/* ---------------------------------------------------------------------------
   Preloader — letters drop in and bounce, then the curtain lifts.

   Drop-in replacement for the CountUp curtain in primitives.js.
   Keeps the same contract: runs once per tab session, skipped entirely for
   reduced-motion users, self-heals via a timeout so a stuck animation can
   never leave the curtain up.

   Total run: ~1.5s. Click or any keypress skips it immediately.
--------------------------------------------------------------------------- */

const NAME = "ESHANI";
const SUB = "PRODUCT / UX DESIGNER";

const LETTER_STAGGER = 0.055;
const HOLD_AFTER_LETTERS = 0.35; // beat before the curtain lifts

export function Preloader({ onDone }) {
  const reduced = useReducedMotion();
  const [lifting, setLifting] = useState(false);
  const [gone, setGone] = useState(() => {
    if (typeof window === "undefined") return true;
    try {
      return sessionStorage.getItem("intro-played") === "1";
    } catch {
      return false;
    }
  });

  const finish = useCallback(() => {
    try {
      sessionStorage.setItem("intro-played", "1");
    } catch {
      /* private mode — ignore */
    }
    document.documentElement.classList.remove("intro-lock");
    setGone(true);
    onDone?.();
  }, [onDone]);

  /* Lock the page while the curtain is up */
  useEffect(() => {
    if (gone || reduced) {
      if (reduced) finish();
      return;
    }
    document.documentElement.classList.add("intro-lock");
  }, [gone, reduced, finish]);

  /* Kick off the lift once the letters have landed */
  useEffect(() => {
    if (gone || reduced) return;
    const settleAt =
      (NAME.length * LETTER_STAGGER + 0.75 + HOLD_AFTER_LETTERS) * 1000;
    const t = setTimeout(() => setLifting(true), settleAt);
    return () => clearTimeout(t);
  }, [gone, reduced]);

  /* Let people skip it */
  useEffect(() => {
    if (gone || reduced) return;
    const skip = () => setLifting(true);
    window.addEventListener("keydown", skip);
    window.addEventListener("pointerdown", skip);
    return () => {
      window.removeEventListener("keydown", skip);
      window.removeEventListener("pointerdown", skip);
    };
  }, [gone, reduced]);

  /* Safety net */
  useEffect(() => {
    if (gone || reduced) return;
    const t = setTimeout(finish, 4000);
    return () => clearTimeout(t);
  }, [gone, reduced, finish]);

  useEffect(
    () => () => document.documentElement.classList.remove("intro-lock"),
    [],
  );

  if (gone || reduced) return null;

  return (
    <motion.div
      className="intro"
      data-testid="intro-preloader"
      initial={{ y: 0 }}
      animate={{ y: lifting ? "-101%" : 0 }}
      transition={{ duration: 0.85, ease: [0.76, 0, 0.24, 1] }}
      onAnimationComplete={() => {
        if (lifting) finish();
      }}
      aria-hidden="true"
    >
      <div className="intro-stack">
        <div className="intro-letters">
          {NAME.split("").map((char, i) => (
            <motion.span
              className="intro-letter"
              key={`${char}-${i}`}
              initial={{ y: "-120%", opacity: 0, rotate: -6 }}
              animate={{ y: "0%", opacity: 1, rotate: 0 }}
              transition={{
                delay: i * LETTER_STAGGER,
                type: "spring",
                stiffness: 420,
                damping: 12,   // low damping = the bounce
                mass: 0.9,
              }}
            >
              {char}
            </motion.span>
          ))}
        </div>

        <motion.span
          className="intro-rule"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{
            delay: NAME.length * LETTER_STAGGER + 0.1,
            duration: 0.55,
            ease: [0.22, 0.61, 0.36, 1],
          }}
        />

        <motion.span
          className="intro-sub"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: NAME.length * LETTER_STAGGER + 0.2,
            duration: 0.5,
            ease: [0.22, 0.61, 0.36, 1],
          }}
        >
          {SUB}
        </motion.span>
      </div>
    </motion.div>
  );
}

export default Preloader;