import React, { createContext, useContext, useState } from "react";
import "./readmode.css";

/* ---------------------------------------------------------------------------
   ReadMode — "Skim it" / "Read it" toggle for case study pages.

   Skim shows only the one-line takeaway per chapter (the `skim` field in
   caseStudies.js). Read shows the full body. The choice persists across case
   studies for the session, so a recruiter sets it once.
--------------------------------------------------------------------------- */

const ReadModeContext = createContext(["skim", () => {}]);

export function ReadModeProvider({ children }) {
  const value = useState(() => {
    try {
      return sessionStorage.getItem("read-mode") || "skim";
    } catch {
      return "skim";
    }
  });
  return (
    <ReadModeContext.Provider value={value}>{children}</ReadModeContext.Provider>
  );
}

export function useReadMode() {
  const [mode, setMode] = useContext(ReadModeContext);
  const set = (next) => {
    try {
      sessionStorage.setItem("read-mode", next);
    } catch {
      /* private mode — ignore */
    }
    setMode(next);
  };
  return [mode, set];
}

export function ReadModeToggle({ minutes = 4 }) {
  const [mode, setMode] = useReadMode();
  return (
    <div className="readmode" data-testid="read-mode-toggle">
      <p className="readmode-note">
        You&rsquo;re probably reading eight of these today. Pick a depth.
      </p>
      <div className="readmode-switch" role="group" aria-label="Reading depth">
        <button
          type="button"
          className="readmode-btn"
          aria-pressed={mode === "skim"}
          onClick={() => setMode("skim")}
          data-testid="read-mode-skim"
        >
          Skim it <span>90 sec</span>
        </button>
        <button
          type="button"
          className="readmode-btn"
          aria-pressed={mode === "full"}
          onClick={() => setMode("full")}
          data-testid="read-mode-full"
        >
          Read it <span>{minutes} min</span>
        </button>
      </div>
    </div>
  );
}

export default ReadModeToggle;