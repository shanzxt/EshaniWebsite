import React, { useCallback, useEffect, useRef, useState } from "react";
import "./beforeafter.css";

/* ---------------------------------------------------------------------------
   BeforeAfter — draggable divider between two states of the same screen.

   Usage:
     <BeforeAfter
       before={IMG("eyeai-before.png")}  beforeLabel="Legacy workflow"
       after={IMG("eyeai-dashboard.png")} afterLabel="Redesigned"
       caption="Patient queue — 6 steps down to 2"
     />

   Keyboard accessible: focus the handle and use ← / → (shift for big steps).
--------------------------------------------------------------------------- */

export default function BeforeAfter({
  before,
  beforeAlt = "Before",
  beforeLabel = "Before",
  after,
  afterAlt = "After",
  afterLabel = "After",
  caption,
  start = 50,
  testId,
}) {
  const wrapRef = useRef(null);
  const [pct, setPct] = useState(start);
  const [dragging, setDragging] = useState(false);

  const setFromClientX = useCallback((clientX) => {
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const next = ((clientX - r.left) / r.width) * 100;
    setPct(Math.max(0, Math.min(100, next)));
  }, []);

  useEffect(() => {
    if (!dragging) return;
    const move = (e) => {
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      setFromClientX(x);
    };
    const up = () => setDragging(false);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("touchmove", move, { passive: true });
    window.addEventListener("touchend", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("touchmove", move);
      window.removeEventListener("touchend", up);
    };
  }, [dragging, setFromClientX]);

  const onKey = (e) => {
    const step = e.shiftKey ? 10 : 2;
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      setPct((p) => Math.max(0, p - step));
    }
    if (e.key === "ArrowRight") {
      e.preventDefault();
      setPct((p) => Math.min(100, p + step));
    }
  };

  if (!before || !after) return null;

  return (
    <figure className="ba" data-testid={testId}>
      <div
        className={`ba-stage${dragging ? " is-dragging" : ""}`}
        ref={wrapRef}
        onPointerDown={(e) => {
          setDragging(true);
          setFromClientX(e.clientX);
        }}
      >
        {/* AFTER sits underneath, full width */}
        <img className="ba-img" src={after} alt={afterAlt} draggable="false" />

        {/* BEFORE is clipped from the right by the divider */}
        <div className="ba-clip" style={{ width: `${pct}%` }}>
          <img className="ba-img ba-img-clipped" src={before} alt={beforeAlt} draggable="false" />
        </div>

        <span className="ba-tag ba-tag-before" style={{ opacity: pct > 12 ? 1 : 0 }}>
          {beforeLabel}
        </span>
        <span className="ba-tag ba-tag-after" style={{ opacity: pct < 88 ? 1 : 0 }}>
          {afterLabel}
        </span>

        <div className="ba-divider" style={{ left: `${pct}%` }} aria-hidden="true" />

        <button
          type="button"
          className="ba-handle"
          style={{ left: `${pct}%` }}
          onKeyDown={onKey}
          aria-label={`Comparison slider, ${Math.round(pct)}% ${beforeLabel}`}
          aria-valuenow={Math.round(pct)}
          aria-valuemin={0}
          aria-valuemax={100}
          role="slider"
        >
          <span className="ba-handle-arrow">‹</span>
          <span className="ba-handle-arrow">›</span>
        </button>
      </div>
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}