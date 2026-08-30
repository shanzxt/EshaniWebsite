import React, { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { EASE, IMG, Reveal, ThemeSwitch, Wipe, useTheme } from "./primitives";
import { caseStudies } from "./caseStudies";

export default function CaseStudyPage() {
  const { slug } = useParams();
  const [theme, setTheme] = useTheme();
  const reduced = useReducedMotion();
  const study = caseStudies.find((s) => s.slug === slug);

  useEffect(() => { window.scrollTo(0, 0); }, [slug]);

  if (!study) {
    return (
      <div className="container" style={{ paddingTop: "8rem", minHeight: "70vh" }}>
        <p className="section-label">Case study not found</p>
        <Link to="/" className="read-case" data-testid="case-notfound-home">Back to all work <ArrowUpRight size={14} /></Link>
      </div>
    );
  }

  const idx = caseStudies.indexOf(study);
  const next = caseStudies[(idx + 1) % caseStudies.length];

  return (
    <div data-testid={`case-page-${study.slug}`}>
      <header className="cs-header">
        <div className="container cs-header-inner">
          <Link to="/" className="cs-back" data-testid="case-back-link"><ArrowLeft size={15} /> Selected work</Link>
          <span className="wordmark"><b>ES/</b>ESHANI SOMWANSHI</span>
          <ThemeSwitch theme={theme} setTheme={setTheme} />
        </div>
      </header>
      <main>
        <section className="cs-hero container">
          <motion.p className="eyebrow" initial={reduced ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.62, ease: EASE }} data-testid="case-eyebrow">
            {study.company} · {study.period}
          </motion.p>
          <h1 className="cs-title" data-testid="case-title">
            {study.titleLines.map((line, i) => (
              <span className="line" key={line}>
                <motion.span initial={reduced ? false : { y: "105%" }} animate={{ y: 0 }} transition={{ duration: 0.9, delay: 0.1 + i * 0.1, ease: EASE }}>{line}</motion.span>
              </span>
            ))}
          </h1>
          <motion.div className="cs-meta" initial={reduced ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.62, delay: 0.45, ease: EASE }}>
            <span className="lead-role" style={{ margin: 0 }}>{study.role}</span>
            <div className="tag-row">{study.tags.map((t) => <span className="tag" key={t}>{t}</span>)}</div>
          </motion.div>
        </section>

        <section className="cs-metrics-band" aria-label="Outcomes">
          <div className="container cs-metrics-row">
            {study.metrics.map(([v, l]) => (
              <div key={l} data-testid={`case-metric-${l.toLowerCase().replace(/[^a-z]+/g, "-")}`}>
                <div className="m-value num">{v}</div>
                <div className="m-label">{l}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="cs-overview container">
          <Reveal><p className="lede">{study.overview}</p></Reveal>
          {study.confidential && (
            <Reveal delay={0.1}>
              <p className="note-strip" data-testid="case-nda-note">This engagement is under NDA — screens aren't public yet. The process below is shareable; the pixels aren't. Happy to walk through the work live.</p>
            </Reveal>
          )}
        </section>

        {study.chapters.map((ch, i) => (
          <section className="cs-chapter container" key={ch.label} data-testid={`case-chapter-${i + 1}`}>
            <Reveal>
              <p className="section-label">{String(i + 1).padStart(2, "0")} — {ch.label}</p>
              <h2>{ch.title}</h2>
              <p className="cs-body">{ch.body}</p>
            </Reveal>
            {ch.images && (
              <div className={ch.phone ? "phone-row" : "cs-art"}>
                {ch.images.map(([src, alt, cap], j) => (
                  <div className={ch.phone ? "phone" : undefined} key={src}>
                    <Wipe src={IMG(src)} alt={alt} delay={j * 0.1} testId={`case-image-${study.slug}-${j}`} />
                    <figcaption>{cap}</figcaption>
                  </div>
                ))}
              </div>
            )}
          </section>
        ))}

        <section className="cs-next">
          <div className="container">
            <Reveal>
              <p className="section-label">Next project</p>
              <Link to={`/work/${next.slug}`} className="cs-next-link" data-testid="case-next-link">
                {next.titleLines.join(" ")} <ArrowUpRight size={30} />
              </Link>
            </Reveal>
          </div>
        </section>
      </main>
      <footer className="site-footer">
        <div className="container footer-row">
          <span>© 2026 Eshani Somwanshi</span>
          <Link to="/" data-testid="case-footer-home">Back to all work ↑</Link>
        </div>
      </footer>
    </div>
  );
}
