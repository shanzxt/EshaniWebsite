import React, { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { toast } from "sonner";

const EMAIL = "eshani.swdesign@gmail.com";
const LINKEDIN = "https://www.linkedin.com/in/eshanisomwanshi/";

/* ContactDevice ------------------------------------------------------------
   A pager with a green LCD. The address types itself out the first time the
   card is seen, the clock is live, and the screen is a button that copies the
   address. Falls back to plain static text for reduced-motion users.
*/
export default function ContactDevice({ email = EMAIL, linkedin = LINKEDIN }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const reduced = useReducedMotion();
  const [typed, setTyped] = useState(reduced ? email : "");
  const [clock, setClock] = useState(() => stamp());

  useEffect(() => {
    const t = setInterval(() => setClock(stamp()), 30000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (reduced || !inView) return;
    let i = 0;
    const t = setInterval(() => {
      i += 1;
      setTyped(email.slice(0, i));
      if (i >= email.length) clearInterval(t);
    }, 45);
    return () => clearInterval(t);
  }, [inView, reduced, email]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      toast.success("Email copied");
    } catch {
      window.location.href = `mailto:${email}`;
    }
  };

  return (
    <motion.div
      className="pager"
      ref={ref}
      data-testid="contact-pager"
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 40, rotate: -3 }}
      whileInView={{ opacity: 1, y: 0, rotate: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8, ease: [0.22, 0.61, 0.36, 1] }}
      whileHover={reduced ? undefined : { rotate: -1.2, y: -6 }}
    >
      <div className="pager-shell">
        <button
          type="button"
          className="pager-lcd"
          onClick={copy}
          data-testid="contact-pager-copy"
          aria-label={`Copy email address ${email}`}
        >
          <span className="pager-lcd-top">
            <span>2G</span>
            <span>{clock}</span>
          </span>
          <span className="pager-lcd-line">Contact me via email</span>
          <span className="pager-lcd-mail">
            {typed}
            {typed.length < email.length ? (
              <i className="pager-caret" aria-hidden="true" />
            ) : null}
          </span>
          <span className="pager-lcd-hint">tap to copy</span>
        </button>

        <span className="pager-brand">ES COMMUNICATIONS</span>

        <div className="pager-keys">
          <span className="pager-grille" aria-hidden="true" />
          <a
            className="pager-key"
            href={linkedin}
            target="_blank"
            rel="noreferrer noopener"
            data-testid="contact-pager-linkedin"
          >
            LinkedIn
          </a>
          <a
            className="pager-key"
            href={`https://www.behance.net/`}
            target="_blank"
            rel="noreferrer noopener"
            data-testid="contact-pager-behance"
          >
            Behance
          </a>
          <a
            className="pager-key pager-key-primary"
            href={`mailto:${email}`}
            data-testid="contact-pager-email"
          >
            Contact Me
          </a>
        </div>
      </div>
    </motion.div>
  );
}

function stamp() {
  return new Date()
    .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    .toLowerCase();
}