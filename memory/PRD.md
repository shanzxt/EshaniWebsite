# Eshani Somwanshi Portfolio

## Original problem statement
Redesign the portfolio to be simple, clear, aesthetic, and catchy, taking inspiration from an attached editorial designer portfolio (sticky rails, theme switcher, chaptered case study). Fix blurry imagery: use the user's uploaded images only where they are sharp, in neat fixed-ratio frames. Improve animations, sticky behavior, and overall craft to an award-worthy level.

## User choices (2026-07)
- Keep all three themes with a switcher, exactly like the inspiration: Paper (warm light), Carbon (dark), Petrol (deep teal).
- Review every uploaded image and use only the sharp ones, neatly cropped in fixed-ratio frames.

## Architecture decisions
- React frontend, plain CSS design system in App.css with per-theme CSS custom properties (`data-theme` on `<html>`, persisted to localStorage).
- framer-motion for masked line reveals, clip-path image wipes, count-ups, accordions, scroll progress; lenis for momentum scrolling.
- User's own images only (no stock): eyeai-cover, eyeai-dashboard (clean crop from uploaded full-screen screenshot), myocircle-cover, travelogue-cover, travelogue-phones. Served from /public/images at native resolution to avoid blur.
- Rejected uploads: VS Code screenshot, inspiration-site screenshots, Pittsburgh skyline photo (not the designer's work).

## Implemented
- 2026-07: Three-theme switcher (Paper/Carbon/Petrol) with swatch previews, persisted, desktop + mobile menu.
- 2026-07: Compressing fixed header with blur and scroll-progress hairline.
- 2026-07: Kinetic hero — masked line-by-line headline reveal, three layered image fragments with scroll + mouse parallax.
- 2026-07: Proof strip with count-up metrics (tabular numerals).
- 2026-07: 01 lead project panel (Rebecca Everlene, typographic, no public screens).
- 2026-07: 02 chaptered Eye-AI case study with sticky rail, scroll-aware chapter nav, and wipe-revealed dashboard/product images.
- 2026-07: 03 wide project (OptraHealth + MyoCircle image), 04 compact text-only project (DAB of India).
- 2026-07: Impact index grid (12 outcomes), capabilities columns, expandable experience rows with full detail bullets.
- 2026-07: About section with framed Travelogue personal-project image; inverted contact section with slow marquee; footer.
- 2026-07: Lenis smooth scrolling with anchor scrolling, reduced-motion fallbacks, full data-testid coverage.

## Implemented (2026-07, round 2)
- Case-study deep-dive pages at /work/:slug for all five projects: masked-reveal hero, metrics band, numbered process chapters with wipe-revealed artifacts, NDA note for confidential work, next-project footer. Routed via react-router.
- Travelogue added as featured project in the work section plus a full case page using the five new uploaded artifacts (research quotes board, home feed, trip hub, second feed, compass field shot).
- Contact form posting to FastAPI /api/messages (stored in MongoDB; Resend email notification to CONTACT_INBOX auto-activates when RESEND_API_KEY is set in backend/.env).
- Resume card section with one-click PDF download (live: /public/resume/Eshani_Somwanshi_Resume.pdf).

## Implemented (2026-07, round 3)
- Fixed Eye-AI dashboard blur: re-rendered at 1.3x with contrast + unsharp-mask sharpening.
- Fixed white mats around cover artwork: image frames (.wipe/.frag/.about-photo) now have transparent backgrounds so rounded artwork corners blend with the theme.
- Added portrait photo to the About section (profile.png, 4:5 crop).
- Giant typographic name band (ESHANI / SOMWANSHI, outlined second line) with masked reveal + scroll-drift parallax between Resume and Contact.
- Custom cursor (dot + trailing ring, difference blend, hover-grow) on fine-pointer devices.
- Magnetic hover on primary CTAs.
- Tool logo marquee (Figma, Framer, Miro, Adobe, HTML5, JS, Perplexity, Claude, Cursor, ChatGPT) under Capabilities, theme-aware monochrome via simple-icons CDN.
- Supporting projects restyled as sticky stacking cards.
- 2026-07 (round 3.5): Portrait woven into the hero as a fourth parallax fragment (tilted, front layer, own scroll/mouse depth, bottom-up reveal).
- 2026-07 (round 4): Reverted hero portrait per user; removed blurry Eye-AI dashboard image from home case section and case-study page (kept only the sharp product-site image); moved the giant ESHANI/SOMWANSHI name band to the top of the page as the opening moment.

## Prioritized backlog
- P1: Add RESEND_API_KEY to backend/.env so contact enquiries also land in the email inbox.
- P2: Admin view for stored contact messages.

## Next tasks
- User review of the five case-study pages and the Travelogue feature slot.
