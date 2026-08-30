import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, animate, motion, useInView, useMotionValue, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import Lenis from "lenis";
import { ArrowUpRight, Menu, Minus, Plus, X } from "lucide-react";
import "./App.css";

const IMG = (name) => `${process.env.PUBLIC_URL}/images/${name}`;
const EASE = [0.22, 0.61, 0.36, 1];
const THEMES = [
  { id: "paper", label: "Paper" },
  { id: "carbon", label: "Carbon" },
  { id: "petrol", label: "Petrol" },
];

const proof = [
  [25, "%", "Higher task completion", "Rebecca Everlene Trust Co."],
  [40, "%", "Lower early-stage drop-off", "Rebecca Everlene Trust Co."],
  [30, "%", "Higher weekly engagement", "OptraHealth"],
  [20, "%", "Faster clinician diagnostic tasks", "Onward Technologies"],
];

const impacts = [
  ["25%", "Task completion increase", "Rebecca Everlene"], ["40%", "Early drop-off reduction", "Rebecca Everlene"],
  ["50%", "Faster time-to-prototype", "Rebecca Everlene"], ["100+", "Component Figma library", "OptraHealth"],
  ["30%", "Weekly engagement increase", "OptraHealth"], ["28%", "Tutorial completion increase", "OptraHealth"],
  ["20%", "Parent onboarding drop-off ↓", "OptraHealth"], ["20%", "Faster diagnostic tasks", "Onward Technologies"],
  ["10→7 wks", "MVP delivery timeline", "Onward Technologies"], ["15+", "Stakeholder workshops", "Onward Technologies"],
  ["25+", "Clients served", "DAB of India"], ["1,000+", "Brand assets maintained", "DAB of India"],
];

const capabilities = [
  ["Product thinking", ["Product strategy", "Information architecture", "Journey mapping", "Competitive analysis", "A/B testing"]],
  ["Research & validation", ["User research", "Usability testing", "Heuristic evaluation", "UserTesting", "Perplexity, Claude"]],
  ["Complex product design", ["Design for AI", "Design systems", "Accessibility (WCAG 2.2)", "Regulated / healthcare workflows"]],
  ["Prototyping & craft", ["Figma, Figma Make", "Framer, Lovable, Cursor AI", "HTML5/CSS, JavaScript", "Illustrator, Photoshop, Miro"]],
];

const experience = [
  ["UX/UI Designer", "Rebecca Everlene Trust Company", "Oct 2025 – Present · Chicago, IL",
    "Leading 0→1 design for a B2C web platform, restructuring dense content into gamified learning modules and integrating AI-automated workflows across 10+ features.",
    ["Led 0→1 user-centered design from discovery through wireframing, prototyping, and high-fidelity execution.",
      "Structured complex content into gamified learning modules, increasing task completion by 25% and reducing early-stage drop-off by 40%.",
      "Partnered with Product and Engineering on AI-driven solutions, flagging technical constraints early and avoiding 2 late-stage redesigns.",
      "Compressed time-to-prototype by 50% by integrating AI-automated design workflows across 10+ features."]],
  ["Product Designer", "OptraHealth", "Dec 2024 – Mar 2025 · San Jose, CA",
    "Primary designer for Zoe, an AI companion, plus onboarding, patient management, and provider monitoring for a health-tech SaaS platform.",
    ["Shipped mobile onboarding flows, a patient management dashboard, and provider monitoring — lifting weekly engagement by 30%.",
      "Designed Zoe's interaction layer from the ground up, increasing exercise tutorial completion by 28%.",
      "Built a 100+ component Figma library adopted by PMs and engineers for independent prototyping.",
      "Ran 20+ usability and heuristic evaluation sessions, cutting onboarding drop-off among parents by 20%."]],
  ["UX Designer", "Onward Technologies", "Jul 2024 – Aug 2024 · Chicago, IL",
    "Designed diagnostic workflows and automated reporting for a regulated B2B health-tech MVP, from journey mapping through high-fidelity delivery.",
    ["Enabled clinicians to complete diagnostic tasks 20% faster while maintaining compliance in a regulated environment.",
      "Compressed the MVP timeline from 10 to 7 weeks, eliminating 5 high-severity interaction issues before engineering commitment.",
      "Set design direction across 3 product pivots through heuristic evaluation and 15+ stakeholder workshops."]],
  ["Visual Designer", "DAB of India", "Jan 2023 – Aug 2023 · Pune, India",
    "Built an AI-assisted design workflow across copy, mockups, and social/print assets for 25+ clients.",
    ["Maintained brand standards across 1,000+ assets with an AI-assisted production workflow.",
      "Designed brand pitch decks used in client acquisition, contributing to 5+ new client wins."]],
];

function CountUp({ value, suffix = "", comma = false }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-8% 0px" });
  const reduced = useReducedMotion();
  const final = (comma ? value.toLocaleString("en-US") : value) + suffix;
  const [display, setDisplay] = useState(reduced ? final : "0" + suffix);
  useEffect(() => {
    if (!inView || reduced) { if (reduced) setDisplay(final); return; }
    const controls = animate(0, value, {
      duration: 0.9, ease: EASE,
      onUpdate: (v) => setDisplay((comma ? Math.round(v).toLocaleString("en-US") : Math.round(v)) + suffix),
    });
    return () => controls.stop();
  }, [inView, reduced, value, suffix, comma, final]);
  return <span ref={ref} className="num" data-testid={`countup-${value}${suffix}`}>{display}</span>;
}

export function Reveal({ children, delay = 0, className = "", testId }) {
  const reduced = useReducedMotion();
  return (
    <motion.div className={className} data-testid={testId}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.62, delay, ease: EASE }}>
      {children}
    </motion.div>
  );
}

function Wipe({ src, alt, delay = 0, className = "", testId }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.25 });
  const reduced = useReducedMotion();
  return (
    <figure ref={ref} className={`wipe ${className}`}>
      <motion.img src={src} alt={alt} loading="lazy" decoding="async" data-testid={testId}
        initial={reduced ? { opacity: 0 } : { opacity: 1, clipPath: "inset(0 100% 0 0)", scale: 1.04 }}
        animate={inView ? { opacity: 1, clipPath: "inset(0 0% 0 0)", scale: 1 } : undefined}
        transition={{ duration: 0.9, delay, ease: EASE }} />
    </figure>
  );
}

function ThemeSwitch({ theme, setTheme, mobile = false }) {
  return (
    <div className={`theme-switch${mobile ? " theme-switch-mobile" : ""}`} role="group" aria-label="Colour theme" data-testid={mobile ? "theme-switch-mobile" : "theme-switch"}>
      {THEMES.map((t) => (
        <button type="button" key={t.id} className="theme-dot" data-theme-value={t.id}
          aria-pressed={theme === t.id} onClick={() => setTheme(t.id)} data-testid={`theme-${t.id}-button`}>
          <span className="theme-swatch" aria-hidden="true"></span><span className="theme-name">{t.label}</span>
        </button>
      ))}
    </div>
  );
}

function Hero({ go }) {
  const reduced = useReducedMotion();
  const stageRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: stageRef, offset: ["start start", "end start"] });
  const yBack = useTransform(scrollYProgress, [0, 1], [0, -46]);
  const yMid = useTransform(scrollYProgress, [0, 1], [0, -90]);
  const yFront = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const mx = useSpring(useMotionValue(0), { stiffness: 60, damping: 18 });
  const xBack = useTransform(mx, (v) => v * 8);
  const xMid = useTransform(mx, (v) => v * 18);
  const xFront = useTransform(mx, (v) => v * 30);
  const onMouse = (e) => { if (!reduced) mx.set((e.clientX / window.innerWidth - 0.5) * 2); };
  const line = (text, delay, key) => (
    <span className="line" key={key}>
      <motion.span initial={reduced ? false : { y: "105%" }} animate={{ y: 0 }} transition={{ duration: 0.9, delay, ease: EASE }}>{text}</motion.span>
    </span>
  );
  return (
    <section className="hero" id="top">
      <div className="container hero-grid">
        <div className="hero-copy">
          <motion.p className="eyebrow" initial={reduced ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.62, ease: EASE }} data-testid="hero-eyebrow">Product / UX Designer</motion.p>
          <h1 data-testid="hero-heading">
            {line("Designing clarity", 0.1, "l1")}
            <span className="line"><motion.span initial={reduced ? false : { y: "105%" }} animate={{ y: 0 }} transition={{ duration: 0.9, delay: 0.2, ease: EASE }}>into <em>complex systems.</em></motion.span></span>
          </h1>
          <motion.p className="lede" initial={reduced ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.62, delay: 0.4, ease: EASE }} data-testid="hero-lede">
            I work across healthcare, AI, and enterprise products — using research, systems thinking, and prototyping to make complex experiences easier to understand and use.
          </motion.p>
          <motion.div className="hero-actions" initial={reduced ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.55, ease: EASE }}>
            <a href="#work" className="btn btn-primary" data-testid="hero-work-button" onClick={(e) => { e.preventDefault(); go("work"); }}>Explore selected work <ArrowUpRight size={15} /></a>
            <a href="#contact" className="btn btn-secondary" data-testid="hero-email-button" onClick={(e) => { e.preventDefault(); go("contact"); }}>Get in touch</a>
          </motion.div>
        </div>
        <div className="hero-stage" ref={stageRef} onMouseMove={onMouse} aria-hidden="true">
          <motion.div className="frag frag-eyeai" style={reduced ? {} : { y: yBack, x: xBack }}
            initial={reduced ? false : { clipPath: "inset(0 100% 0 0)" }} animate={{ clipPath: "inset(0 0% 0 0)" }} transition={{ duration: 0.9, delay: 0.25, ease: EASE }}>
            <img src={IMG("eyeai-cover.png")} alt="" data-testid="hero-frag-eyeai" />
          </motion.div>
          <motion.div className="frag frag-myo" style={reduced ? {} : { y: yMid, x: xMid }}
            initial={reduced ? false : { clipPath: "inset(0 100% 0 0)" }} animate={{ clipPath: "inset(0 0% 0 0)" }} transition={{ duration: 0.9, delay: 0.4, ease: EASE }}>
            <img src={IMG("myocircle-cover.png")} alt="" data-testid="hero-frag-myocircle" />
          </motion.div>
          <motion.div className="frag frag-tvl" style={reduced ? {} : { y: yFront, x: xFront }}
            initial={reduced ? false : { clipPath: "inset(0 100% 0 0)" }} animate={{ clipPath: "inset(0 0% 0 0)" }} transition={{ duration: 0.9, delay: 0.55, ease: EASE }}>
            <img src={IMG("travelogue-cover.png")} alt="" data-testid="hero-frag-travelogue" />
          </motion.div>
          <motion.span className="hero-stage-note" initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.62, delay: 0.85 }}>Selected interface work</motion.span>
        </div>
      </div>
    </section>
  );
}

function CaseStudy({ go }) {
  const [active, setActive] = useState("ch-1");
  useEffect(() => {
    const chapters = document.querySelectorAll(".chapter");
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) setActive(en.target.id); });
    }, { rootMargin: "-30% 0px -55% 0px" });
    chapters.forEach((c) => obs.observe(c));
    return () => obs.disconnect();
  }, []);
  const chapters = [["ch-1", "01", "Research"], ["ch-2", "02", "Method"], ["ch-3", "03", "Interface"]];
  return (
    <div className="case">
      <div className="case-rail">
        <Reveal>
          <p className="lead-index">Onward Technologies — EYE AI</p>
          <h3 data-testid="case-study-heading">Diagnostic workflows and automated reporting for clinicians.</h3>
          <p className="lead-role">UX Designer · Jul 2024 – Aug 2024 · Chicago, IL</p>
          <div className="case-metrics">
            <div><div className="m-value"><CountUp value={20} suffix="%" /></div><div className="m-label">Faster diagnostic tasks</div></div>
            <div><div className="m-value">10→7</div><div className="m-label">Week MVP timeline</div></div>
            <div><div className="m-value"><CountUp value={5} /></div><div className="m-label">Severity issues eliminated</div></div>
          </div>
          <nav className="chapter-nav" aria-label="Case study chapters">
            <ul>{chapters.map(([id, n, label]) => (
              <li key={id}><a href={`#${id}`} aria-current={active === id} data-testid={`chapter-nav-${id}`}
                onClick={(e) => { e.preventDefault(); go(id); }}><span className="n">{n}</span> {label}</a></li>
            ))}</ul>
          </nav>
        </Reveal>
      </div>
      <div className="chapter-flow">
        <article className="chapter" id="ch-1">
          <Reveal><p className="section-label">01 — Research</p><h4>Where clinicians lose time.</h4>
            <p>Applied heuristic evaluation and competitive analysis across 15+ stakeholder workshops to set design direction through 3 product pivots, directly reshaping sprint priorities and roadmap sequencing.</p></Reveal>
        </article>
        <article className="chapter" id="ch-2">
          <Reveal><p className="section-label">02 — Method</p><h4>A defined path from research to handoff.</h4>
            <p>Journey mapping through wireframing, iterative prototyping, and high-fidelity delivery. Compressed the MVP timeline from 10 to 7 weeks through user-centered prototyping and early usability validation, eliminating 5 high-severity interaction issues before engineering commitment.</p></Reveal>
        </article>
        <article className="chapter" id="ch-3">
          <Reveal><p className="section-label">03 — Interface</p><h4>The clinician's four minutes.</h4>
            <p>Diagnostic workflows and automated reporting for a B2B health-tech platform MVP, enabling clinicians to complete diagnostic tasks 20% faster while maintaining compliance in a regulated environment.</p></Reveal>
          <div className="chapter-art">
            <div className="native">
              <Wipe src={IMG("eyeai-dashboard.png")} alt="Eye AI clinician dashboard listing patients, clinical details and report status in a sortable table." testId="case-image-dashboard" />
              <figcaption>Patient and report management for the clinician</figcaption>
            </div>
            <div className="native">
              <Wipe src={IMG("eyeai-cover.png")} alt="Eye AI product site introducing AI-assisted diagnostic technology for clinicians." delay={0.1} testId="case-image-cover" />
              <figcaption>Product site — onboarding clinicians to the platform</figcaption>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}

export default function App() {
  const reduced = useReducedMotion();
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem("portfolio-theme") || "paper"; } catch { return "paper"; }
  });
  const [menu, setMenu] = useState(false);
  const [openExp, setOpenExp] = useState(null);
  const headerRef = useRef(null);
  const lenisRef = useRef(null);
  const { scrollY, scrollYProgress } = useScroll();

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem("portfolio-theme", theme); } catch { }
  }, [theme]);

  useEffect(() => {
    if (reduced) return;
    const lenis = new Lenis({ lerp: 0.1 });
    lenisRef.current = lenis;
    let raf;
    const loop = (t) => { lenis.raf(t); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); lenis.destroy(); lenisRef.current = null; };
  }, [reduced]);

  useMotionValueEvent(scrollY, "change", (y) => {
    headerRef.current?.style.setProperty("--p", Math.min(1, y / 120).toFixed(3));
  });

  const go = (id) => {
    setMenu(false);
    const el = document.getElementById(id);
    if (!el) return;
    if (lenisRef.current) lenisRef.current.scrollTo(el, { offset: -90, duration: 1.2 });
    else el.scrollIntoView({ behavior: "smooth" });
  };

  const navItems = [["work", "Work"], ["impact", "Impact"], ["experience", "Experience"], ["about", "About"]];

  return (
    <div className="portfolio-shell">
      <header className="site-header" ref={headerRef} data-testid="portfolio-header">
        <div className="container nav-inner">
          <a href="#top" className="wordmark" data-testid="logo-link" onClick={(e) => { e.preventDefault(); go("top"); }}><b>ES/</b>ESHANI SOMWANSHI</a>
          <nav className="nav-links" aria-label="Primary">
            {navItems.map(([id, label]) => (
              <a href={`#${id}`} key={id} data-testid={`nav-${id}`} onClick={(e) => { e.preventDefault(); go(id); }}>{label}</a>
            ))}
            <a href="#contact" className="nav-cta" data-testid="nav-contact" onClick={(e) => { e.preventDefault(); go("contact"); }}>Contact</a>
          </nav>
          <div className="header-right">
            <ThemeSwitch theme={theme} setTheme={setTheme} />
            <button className="nav-toggle" onClick={() => setMenu(true)} aria-expanded={menu} aria-label="Open menu" data-testid="mobile-menu-button"><Menu size={20} /></button>
          </div>
        </div>
        <motion.div className="scroll-progress" style={{ scaleX: scrollYProgress }} aria-hidden="true" />
      </header>

      <div className={`mobile-menu${menu ? " open" : ""}`} data-testid="mobile-menu">
        <button className="mobile-menu-close" onClick={() => setMenu(false)} data-testid="mobile-menu-close">Close</button>
        <ul>
          {[...navItems, ["contact", "Contact"]].map(([id, label]) => (
            <li key={id}><a href={`#${id}`} data-testid={`mobile-nav-${id}`} onClick={(e) => { e.preventDefault(); go(id); }}>{label}<ArrowUpRight size={20} /></a></li>
          ))}
        </ul>
        <ThemeSwitch theme={theme} setTheme={setTheme} mobile />
      </div>

      <main id="main">
        <Hero go={go} />

        <section className="proof-strip" aria-label="Selected outcomes">
          <div className="container proof-grid">
            {proof.map(([v, s, label, ctx]) => (
              <div className="proof-item" key={label}>
                <div className="proof-value"><CountUp value={v} suffix={s} /></div>
                <div className="proof-label">{label}</div>
                <div className="proof-context">{ctx}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="section" id="work">
          <div className="container">
            <Reveal className="section-head">
              <div><p className="section-label">Selected work</p><h2 data-testid="work-heading">Current role, current problem.</h2></div>
              <p className="desc">A hierarchy, not a grid — the strongest and most current work leads, everything else supports it.</p>
            </Reveal>
            <Reveal>
              <article className="lead-panel" data-testid="project-card-rebecca">
                <div className="lead-top">
                  <span className="lead-index">01 — Rebecca Everlene Trust Company</span>
                  <span className="status-pill">Case study in progress</span>
                </div>
                <p className="lead-role" style={{ marginTop: "1.6rem" }}>UX/UI Designer · Oct 2025 – Present · Chicago, IL</p>
                <h3>A gamified 0→1 platform <span className="quiet">for a B2C financial product.</span></h3>
                <div className="lead-body">
                  <div><p>Leading design from discovery through wireframing, prototyping, and high-fidelity execution for a B2C web platform — restructuring dense content into gamified learning modules, and partnering closely with product and engineering to keep AI-driven features shippable. Screens are not public yet.</p></div>
                  <div className="lead-metrics">
                    <div><div className="m-value"><CountUp value={25} suffix="%" /></div><div className="m-label">Task completion ↑</div></div>
                    <div><div className="m-value"><CountUp value={40} suffix="%" /></div><div className="m-label">Early drop-off ↓</div></div>
                    <div><div className="m-value"><CountUp value="50" suffix="%" /></div><div className="m-label">Time-to-prototype ↓</div></div>
                  </div>
                </div>
                <div className="lead-tags tag-row">
                  <span className="tag">0→1 product</span><span className="tag">Gamified learning</span><span className="tag">AI workflows</span><span className="tag">B2C</span>
                </div>
              </article>
            </Reveal>
          </div>
        </section>

        <section className="section section-bright" id="case-onward">
          <div className="container">
            <Reveal className="section-head">
              <div><p className="section-label">Case study — 02</p><h2>From clinician pain points to a shippable diagnostic tool.</h2></div>
              <p className="desc">A regulated B2B health-tech MVP, followed end to end: research, method, and the interface they produced.</p>
            </Reveal>
            <CaseStudy go={go} />
          </div>
        </section>

        <section className="section">
          <div className="container">
            <Reveal className="section-head">
              <div><p className="section-label">Selected work — 03 &amp; 04</p><h2>Consumer health, and brand at scale.</h2></div>
              <p className="desc">An AI companion inside a health-tech SaaS platform, and production design across a client roster.</p>
            </Reveal>

            <Reveal>
              <article className="proj proj-wide" data-testid="project-card-optra">
                <div className="proj-media">
                  <Wipe src={IMG("myocircle-cover.png")} alt="MyoCircle mobile app across three phones — an AI-companion health app with a gamified breathe, sleep and grow theme." testId="project-image-myocircle" />
                </div>
                <div className="proj-body">
                  <div><h3>OptraHealth</h3><p className="lead-role">Product Designer · Dec 2024 – Mar 2025 · San Jose, CA</p></div>
                  <p className="summary">Primary designer for Zoe, an AI companion, building the interaction layer from the ground up alongside mobile onboarding, a patient management dashboard, and provider monitoring features. Validated across 20+ usability and heuristic evaluation sessions with patients, parents, and providers.</p>
                  <div className="tag-row"><span className="tag">AI companion</span><span className="tag">Healthcare SaaS</span><span className="tag">Design system</span></div>
                  <div className="proj-metrics">
                    <div><div className="m-value"><CountUp value={30} suffix="%" /></div><div className="m-label">Weekly engagement ↑</div></div>
                    <div><div className="m-value"><CountUp value={28} suffix="%" /></div><div className="m-label">Tutorial completion ↑</div></div>
                    <div><div className="m-value"><CountUp value={100} suffix="+" /></div><div className="m-label">Component library</div></div>
                  </div>
                </div>
              </article>
            </Reveal>

            <Reveal>
              <article className="proj proj-compact" data-testid="project-card-dab">
                <div className="proj-body">
                  <div><h3>DAB of India</h3><p className="lead-role">Visual Designer · Jan 2023 – Aug 2023 · Pune, India</p></div>
                  <div>
                    <p className="summary">Built an AI-assisted design workflow spanning copy, mockups, and social and print assets across 25+ clients — maintaining brand standards over 1,000+ assets, and designing brand pitch decks used directly in client acquisition.</p>
                    <div className="tag-row"><span className="tag">Brand design</span><span className="tag">AI-assisted workflow</span><span className="tag">Client work</span></div>
                  </div>
                  <div className="proj-metrics">
                    <div><div className="m-value"><CountUp value={25} suffix="+" /></div><div className="m-label">Clients served</div></div>
                    <div><div className="m-value"><CountUp value={1000} suffix="+" comma /></div><div className="m-label">Assets maintained</div></div>
                    <div><div className="m-value"><CountUp value={5} suffix="+" /></div><div className="m-label">New client wins</div></div>
                  </div>
                </div>
              </article>
            </Reveal>
          </div>
        </section>

        <section className="section section-bright" id="impact">
          <div className="container">
            <Reveal className="section-head">
              <div><p className="section-label">Impact index</p><h2 data-testid="impact-heading">Outcomes, by project.</h2></div>
              <p className="desc">Metrics aren't comparable across companies or products — each reflects a different team, timeline, and baseline.</p>
            </Reveal>
            <Reveal>
              <div className="impact-grid">
                {impacts.map(([v, label, ctx]) => (
                  <div className="impact-cell" key={`${v}-${label}`} data-testid={`impact-${ctx.toLowerCase().replace(/[^a-z]+/g, "-")}-${label.toLowerCase().replace(/[^a-z]+/g, "-")}`}>
                    <div className="impact-value num">{v}</div>
                    <div className="impact-label">{label}</div>
                    <div className="impact-context">{ctx}</div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        <section className="section" id="capabilities">
          <div className="container">
            <Reveal className="section-head">
              <div><p className="section-label">Capabilities</p><h2 data-testid="capabilities-heading">Research, structure, and craft.</h2></div>
              <p className="desc">The verified tools and methods behind the work above — grouped by what they're for.</p>
            </Reveal>
            <div className="capabilities-grid">
              {capabilities.map(([title, items], i) => (
                <Reveal key={title} delay={i * 0.07} className="cap-card" testId={`capability-${i + 1}`}>
                  <h3>{title}</h3>
                  <ul>{items.map((it) => <li key={it}>{it}</li>)}</ul>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="section section-bright" id="experience">
          <div className="container">
            <Reveal className="section-head">
              <div><p className="section-label">Experience</p><h2 data-testid="experience-heading">Four roles, one throughline.</h2></div>
              <p className="desc">Expand any role for the full, verified detail from the résumé.</p>
            </Reveal>
            <div>
              {experience.map(([role, company, dates, summary, detail], idx) => {
                const isOpen = openExp === idx;
                return (
                  <div className="exp-item" key={company} data-testid={`experience-${idx}`}>
                    <div><div className="exp-role">{role}</div><div className="exp-company">{company}</div></div>
                    <div>
                      <p className="exp-summary">{summary}</p>
                      <button className="exp-toggle" onClick={() => setOpenExp(isOpen ? null : idx)} aria-expanded={isOpen} data-testid={`experience-toggle-${idx}`}>
                        {isOpen ? <><Minus size={13} /> Hide detail</> : <><Plus size={13} /> Show detail</>}
                      </button>
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div className="exp-detail" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.34, ease: EASE }}>
                            <ul>{detail.map((d) => <li key={d.slice(0, 32)}>{d}</li>)}</ul>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <div className="exp-dates">{dates}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="section" id="about">
          <div className="container about-grid">
            <Reveal>
              <figure className="about-photo">
                <Wipe src={IMG("travelogue-phones.png")} alt="Travelogue, a personal trip-planning app concept shown on two phones with upcoming trips and a photo feed." testId="about-image-travelogue" />
                <figcaption>Personal project — Travelogue, trip-planning concept</figcaption>
              </figure>
            </Reveal>
            <Reveal className="about-copy" testId="about-copy">
              <p className="section-label" style={{ marginBottom: "1rem" }}>About</p>
              <p>Eshani Somwanshi is a product and UX designer working at the intersection of research, systems thinking, and visual craft. Her work spans healthcare, AI interaction design, and enterprise workflows — grounded in usability testing, heuristic evaluation, and close collaboration with product and engineering teams.</p>
              <p className="muted">She holds a Master of Science in Human-Computer Interaction from DePaul University and a Bachelor of Design in Industrial Design from Symbiosis Institute of Design. Her roles have taken her through Chicago, San Jose, and Pune — from AI-companion interaction design to regulated diagnostic tooling to 0→1 gamified product experiences.</p>
              <dl className="about-facts">
                <div><dt>Education</dt><dd>MS, HCI — DePaul University, 2025</dd></div>
                <div><dt>Education</dt><dd>B.Des, Industrial Design — Symbiosis, 2022</dd></div>
                <div><dt>Based in</dt><dd>Chicago, IL</dd></div>
                <div><dt>Focus</dt><dd>Healthcare · AI · Enterprise</dd></div>
              </dl>
            </Reveal>
          </div>
        </section>

        <section className="section contact" id="contact" style={{ paddingTop: 0 }}>
          <div className="marquee" aria-hidden="true">
            <div className="marquee-track">
              <span>Healthcare <em>·</em> AI <em>·</em> Enterprise <em>·</em>&nbsp;</span>
              <span>Healthcare <em>·</em> AI <em>·</em> Enterprise <em>·</em>&nbsp;</span>
            </div>
          </div>
          <div className="container contact-grid">
            <Reveal>
              <p className="eyebrow contact-eyebrow">Get in touch</p>
              <h2 data-testid="contact-heading">Have a complex product problem?</h2>
              <p className="lede">I'm interested in thoughtful product work across healthcare, AI, and systems that help people make better decisions.</p>
              <div className="contact-actions">
                <a href="mailto:eshani.swdesign@gmail.com" className="btn btn-primary" data-testid="contact-email-link">Email Eshani <ArrowUpRight size={15} /></a>
                <a href="https://www.linkedin.com/in/eshani-somwanshi/" target="_blank" rel="noopener noreferrer" className="btn btn-secondary" data-testid="contact-linkedin-link">View LinkedIn</a>
              </div>
            </Reveal>
            <Reveal className="contact-links" testId="contact-links">
              <a href="mailto:eshani.swdesign@gmail.com" data-testid="contact-links-email"><span>Email</span><span>eshani.swdesign@gmail.com</span></a>
              <a href="https://www.linkedin.com/in/eshani-somwanshi/" target="_blank" rel="noopener noreferrer" data-testid="contact-links-linkedin"><span>LinkedIn</span><span>/in/eshani-somwanshi</span></a>
            </Reveal>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container footer-row">
          <span>© 2026 Eshani Somwanshi</span>
          <a href="#top" data-testid="back-to-top-link" onClick={(e) => { e.preventDefault(); go("top"); }}>Back to top ↑</a>
        </div>
      </footer>
    </div>
  );
}
