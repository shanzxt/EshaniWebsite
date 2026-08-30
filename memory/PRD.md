# Eshani Somwanshi Portfolio

## Original problem statement
Redesign the portfolio to be simple, clear, aesthetic, and catchy, taking inspiration from the attached Aastha Gupta portfolio. Remove blurry or unclear visuals, improve animations, and make projects, skills, and related content stick neatly while scrolling until the next section.

## Architecture decisions
- Kept the existing React frontend and removed reliance on low-resolution project image fragments.
- Used text-led editorial project cards, outcome metrics, responsive CSS sticky rails, and Framer Motion for restrained entrance/modal motion.
- Kept the backend untouched because this portfolio flow is static and has no data API requirement.

## Implemented
- Black editorial visual system with lime accent, grain texture, strong typography, responsive layout, and light/paper theme toggle.
- Hero, selected work, capabilities, experience, about, contact, and footer sections using the supplied portfolio facts and metrics.
- Sticky left rails for work, capabilities, and experience on desktop; clean stacked layout on mobile.
- Case-study modal, experience accordions, mobile navigation, contact links, anchor navigation, reduced-motion support, and unique test IDs.
- Removed all blurry visual/image dependencies from the main portfolio experience.

## Prioritized backlog
- P0: None.
- P1: Add verified high-resolution case-study visuals only when final assets are available.
- P1: Replace contact mail links with a real submission endpoint if inbound form handling is needed.
- P2: Add individual case-study routes with richer research artifacts.

## Next tasks
- Review final copy and metrics for accuracy.
- Supply approved sharp project images for optional case-study detail pages.