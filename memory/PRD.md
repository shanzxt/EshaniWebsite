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

## Prioritized backlog
- P1: Individual case-study routes/modals with deeper research and process artifacts per project.
- P2: Real contact form wired to the FastAPI backend instead of mailto links.
- P2: Resume PDF download once the file is supplied.

## Next tasks
- User review of image selection and theme palettes.
- Optional: add Travelogue as a full fifth project if more artifacts are provided.
