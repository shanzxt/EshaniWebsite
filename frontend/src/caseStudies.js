export const caseStudies = [
  {
    slug: "rebecca-everlene",
    company: "Rebecca Everlene Trust Company",
    period: "Oct 2025 – Present · Chicago, IL",
    role: "UX/UI Designer",
    titleLines: ["A gamified 0→1 platform", "for a B2C financial product."],
    tags: ["0→1 product", "Gamified learning", "AI workflows", "B2C"],
    metrics: [["25%", "Task completion increase"], ["40%", "Early drop-off reduction"], ["50%", "Faster time-to-prototype"], ["10+", "AI-automated features"]],
    overview: "Leading design end to end: discovery, wireframing, prototyping, and high-fidelity execution, for a B2C web platform that turns dense financial education into a gamified learning journey people actually finish.",
    confidential: true,
    chapters: [
      { label: "Discovery", title: "Dense content, rewritten as a journey.", skim: "Audited the whole content library and rebuilt it as progressive modules with a visible beginning, middle, and end.", body: "The product's knowledge base was accurate but exhausting: long pages, no sense of progress, no reason to return. The first move was structural, auditing the full content library and rebuilding it as progressive learning modules with a clear beginning, middle, and end, so users always know where they are and what's next." },
      { label: "System", title: "Gamification that serves comprehension.", skim: "Progress mechanics designed around learning outcomes, not decoration: task completion up 25%, early drop-off down 40%.", body: "Progress mechanics, staged challenges, and completion states were designed around learning outcomes rather than decoration. The restructured modules lifted task completion by 25% and cut early-stage drop-off by 40%; the game layer works because the information architecture underneath it is sound." },
      { label: "Craft", title: "AI-accelerated, design-led.", skim: "AI-automated workflows across 10+ features halved time-to-prototype without losing system coherence.", body: "AI-automated design workflows across 10+ features compressed time-to-prototype by 50% without giving up fidelity or system coherence. Technical constraints were flagged with engineering during early wireframing, avoiding two late-stage redesigns before anything shipped." },
    ],
  },
  {
    slug: "eye-ai",
    company: "Onward Technologies · EYE AI",
    period: "Jul 2024 – Aug 2024 · Chicago, IL",
    role: "UX Designer",
    titleLines: ["Retinal Diagnostic Platform"],
    tags: ["Healthcare", "Research", "Prototyping", "Reporting"],
    metrics: [["20%", "Faster diagnostic tasks"], ["10→7", "Week MVP timeline"], ["5", "Severity issues eliminated"], ["15+", "Stakeholder workshops"]],
    overview: "Streamlining complex diagnostics into one unified, actionable experience for clinicians: a regulated B2B health-tech MVP followed end to end, from heuristic evaluation and stakeholder research through journey mapping, iterative prototyping, and high-fidelity delivery of a diagnostic tool clinicians could trust.",
    chapters: [
      { label: "Research", title: "Where clinicians lose time.", skim: "Heuristic evaluation plus 15+ stakeholder workshops set direction through three product pivots.", body: "Heuristic evaluation and competitive analysis across 15+ stakeholder workshops set the design direction through three product pivots. Findings were fed directly into sprint priorities and roadmap sequencing; research shaped what got built, not just how it looked." },
      { label: "Method", title: "A defined path from research to handoff.", skim: "Early usability validation cut the MVP from 10 weeks to 7 and killed 5 high-severity issues before engineering.", body: "Journey mapping through wireframing, iterative prototyping, and high-fidelity delivery. User-centered prototyping and early usability validation compressed the MVP timeline from 10 to 7 weeks and eliminated 5 high-severity interaction issues before engineering commitment." },
      /* Add a before/after once you have a screenshot of the legacy workflow:
         beforeAfter: ["eyeai-before.png", "eyeai-dashboard.png",
                       "Legacy workflow", "Redesigned",
                       "Patient queue: six steps down to two"], */
      { label: "Interface", title: "The clinician's four minutes.", skim: "Patient queue to signed diagnostic report in minutes: 20% faster, still compliant.", body: "The final workflow lets clinicians move from patient queue to diagnostic report in minutes: a clear patient table with status at a glance, guided upload and analysis, and automated reporting that holds up in a regulated environment, enabling diagnostic tasks to be completed 20% faster.", images: [
        ["eyeai-cover.png", "Eye AI clinician dashboard listing patients with diagnostic status and images analyzed.", "Patient dashboard: status and diagnostic queue at a glance"],
      ] },
    ],
  },
  {
    slug: "optrahealth",
    company: "OptraHealth",
    period: "Dec 2024 – Mar 2025 · San Jose, CA",
    role: "Product Designer",
    // TODO(Eshani): titleLines below reflect your new "Pediatric Therapy App" /
    // "Companion-Guided App Connecting Patients, Parents & Providers" naming;
    // the 3 checklist bullets you sent were duplicates of the Onward ones, so
    // this overview still runs on the original Zoe-focused copy until you send
    // OptraHealth-specific highlights.
    titleLines: ["Pediatric Therapy App", "for patients, parents, and providers."],
    tags: ["AI companion", "Healthcare SaaS", "Design system"],
    metrics: [["30%", "Weekly engagement increase"], ["28%", "Tutorial completion increase"], ["100+", "Component Figma library"], ["20+", "Usability sessions"]],
    overview: "A companion-guided app connecting patients, parents, and providers. Primary designer for Zoe, an AI companion inside the MyoCircle health-tech SaaS platform, plus mobile onboarding, a patient management dashboard, and provider monitoring, validated across 20+ sessions with patients, parents, and providers.",
    chapters: [
      { label: "Interaction", title: "Designing an AI companion from the ground up.", skim: "Mapped Zoe's interaction model to real care touch-points so encouragement landed as timely, not noisy.", body: "Zoe's interaction layer was built from zero: mapping interaction models to user inputs and care touch-points so encouragement felt timely rather than noisy. The work lifted exercise tutorial completion by 28% and weekly engagement by 30%.", images: [
        ["myocircle-day1.png", "MyoCircle Day 1 exercise screen with a guided video, sets and reps tracking, and a Start Exercise button.", "Where a session starts: guided video, sets, and reps"],
        ["myocircle-interaction.png", "MyoCircle exercise screen with Zoe's congratulations card after a completed exercise, awarding points.", "Where it ends: Zoe's encouragement moment"],
      ] },
      { label: "System", title: "A library the whole team could build with.", skim: "A 100+ component Figma library PMs and engineers prototyped with on their own.", body: "A 100+ component Figma library became the shared language of the product team, adopted by product managers and engineers for independent prototyping, which kept design quality consistent even when design wasn't in the room. Profile, badges, and progress components are one small slice of it.", images: [
        ["myocircle-profile.png", "MyoCircle profile screen with streak, daily score, league, XP, and a monthly badges and achievements grid.", "Componentized: profile, badges, and progress states"],
      ] },
      { label: "Validation", title: "Tested with patients, parents, and providers.", skim: "20+ sessions across three user groups; parent onboarding drop-off fell 20%.", body: "Twenty-plus usability testing and heuristic evaluation sessions across all three user groups surfaced where onboarding lost people, cutting drop-off among parents by 20% and grounding every major flow in observed behaviour.", images: [
        ["myocircle-level13.png", "MyoCircle workout progress screen showing Level 13, 25% progress, and the Day 1 exercise video queue.", "What sessions validated: level progress and the exercise queue"],
      ] },
    ],
  },
  {
    slug: "travelogue",
    company: "Travelogue · personal case study",
    period: "Personal project · 2025",
    role: "Product Designer",
    // TODO(Eshani): your notes marked this project's title, subtitle, and 3
    // checklist bullets as "I will input info here" — replace titleLines and
    // overview below once you've written that copy.
    titleLines: ["One home", "for every trip."],
    tags: ["Personal project", "Mobile UX", "Research-led"],
    metrics: [["08", "Traveler interviews"], ["05", "Unmet needs mapped"]],
    overview: "Trip planning lives scattered across notes, maps, documents, and group chats. Travelogue is a self-initiated concept that consolidates it all, upcoming trips, itineraries, documents, and the people coming along, into one calm mobile home.",
    cover: ["travelogue-cover.png", "Travelogue home feed and a group trip hub shown side by side on two phones."],
    chapters: [
      { label: "Research", title: "What travelers actually ask for.", skim: "Eight interviews produced five unmet needs, every feature in the concept traces back to one of them.", body: "Informal interviews with travelers surfaced a consistent set of unmet needs: offline access for places without internet, one-stop consolidation of bookings and plans, easier group coordination, expense tracking, and a way to document trips as they happen. Every feature in the concept traces back to one of these quotes.", images: [
        ["travelogue-research.png", "Research board of eight traveler quotes covering offline maps, one-stop planning, group coordination and expense tracking.", "Research synthesis: eight traveler interviews"],
      ] },
      { label: "Concept", title: "A trip hub, not another list app.", skim: "Each trip becomes one hub: people, route, itinerary, documents, gallery.", body: "Each trip becomes a hub: the people coming, the locations on a map, an itinerary nexus with dates and details, documents one tap away, and a shared gallery. Group trips stop living in chat threads; everyone sees the same plan.", images: [
        ["travelogue-login.png", "Travelogue sign-in screen with the compass mark and social sign-in options.", "Entry point: sign up, log in, or connect socials"],
        ["travelogue-tripdetail.png", "Travelogue trip detail screen showing people, a locations map, itinerary hub, documents, trip planner, and gallery.", "Trip hub: people, route, itinerary, documents, gallery"],
      ], phone: true },
      { label: "Interface", title: "Calm, glanceable, travel-ready.", skim: "Home opens on a countdown and contextual nudges rather than an empty search field.", body: "The home feed opens with a countdown to the next trip, upcoming trip cards with ratings and reviews, and contextual nudges: nearby cafés in the morning, wishlist check-offs in the afternoon. A deep-green palette and large imagery keep it feeling like travel, not admin.", images: [
        ["travelogue-home.png", "Travelogue home feed with greeting, solo trip countdown, upcoming trips carousel and nearby cafés.", "Home: countdown, upcoming trips, nearby"],
        ["travelogue-feed.png", "Travelogue home feed variant with trip countdown, weather, and wishlist suggestions.", "Feed: contextual suggestions and wishlist"],
      ], phone: true },
      { label: "Field note", title: "Designed for the road.", skim: "Outdoors, one-handed, bad light: contrast and touch targets were constraints, not polish.", body: "The compass states it plainly: travel tools are used outdoors, one-handed, in bad light. Contrast, large touch targets, and glanceable typography were non-negotiable constraints, not polish.", images: [
        ["travelogue-compass.png", "A phone compass app held in hand inside a dim car, reading 186 degrees south.", "Field constraint: used one-handed, in motion"],
      ] },
    ],
  },
  {
    slug: "dab-of-india",
    company: "DAB of India",
    period: "Jan 2023 – Aug 2023 · Pune, India",
    role: "Visual Designer",
    titleLines: ["Brand at scale", "across a client roster."],
    tags: ["Brand design", "AI-assisted workflow", "Client work"],
    metrics: [["25+", "Clients served"], ["1,000+", "Assets maintained"], ["5+", "New client wins"]],
    overview: "A production design practice built around consistency: an AI-assisted workflow spanning copy, mockups, and social and print assets across 25+ clients, without letting brand standards slip on any of them.",
    chapters: [
      { label: "Workflow", title: "An AI-assisted production pipeline.", skim: "A repeatable copy → mockup → asset pipeline with AI between human checkpoints.", body: "Built a repeatable workflow that moved from copy to mockups to finished social and print assets with AI tooling doing the heavy lifting between checkpoints, freeing time for the judgement calls that actually separate good brand work from generated noise." },
      { label: "Consistency", title: "1,000+ assets, one standard.", skim: "Templates, tokens, and review gates are what made volume and consistency compatible.", body: "Maintained brand standards across more than a thousand assets and twenty-five concurrent clients. The system (templates, tokens, and review gates) is what made volume and consistency compatible." },
      { label: "Growth", title: "Design that won business.", skim: "Pitch decks that contributed directly to five or more new client wins.", body: "Designed the brand pitch decks used directly in client acquisition, contributing to five or more new client wins: proof that production craft and business outcomes are the same conversation." },
    ],
  },
];
