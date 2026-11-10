# Ananta at Dream Gurukul: landing page

A static landing page for Ananta at Dream Gurukul by Jain Group. No build step: open `index.html`, or serve the folder with any static server.

## Files that run the site
- `index.html`: the landing page. `thank-you.html`: shown after an enquiry.
- `assets/css/`: `ananta.css` (base), `ananta-luxe.css` (premium layer), `ananta-flow.css` (section flow), `ananta-desktop.css` (fluid desktop layout and Details explorer).
- `assets/js/`: `lead-config.js` (lead destination), `leads.js` (forms, validation, brochure and plan unlock), `refined.js` (menu, plan tabs, image viewer), `revision.js` (progress beam, carousels, floor-level menu, header and bar behaviour), `reveal.js` (scroll reveals, Legacy counters), `specs.js` (Details photo explorer), `smooth.js` (smooth anchor scrolling).
- `assets/images/web/`: right-sized images the page uses; `assets/images/curated/`: the floor-plan sheets and previews and the horizon backdrop. Every file in `assets/` is used by the pages; unused originals were removed before launch.
- `assets/icons/` and `site.webmanifest`: favicon (light and dark) and home-screen icons.
- `assets/brochures/ananta-lifestyle.pdf`: the brochure visitors download.

## Design
Palette from the brochure: midnight navy, rose-amber horizon glow, golden-hour gold, cream and warm brown. Headlines in Cormorant Garamond, text in Jost.

## Enquiries
- One enquiry (site visit or brochure popup) unlocks both the brochure and the floor plans on that browser for a year. Until then the plans are shown hazy behind a View plans button.
- Phone numbers are accepted from any country. A bare 10-digit number is saved as +91.
- **Leads are not sent anywhere yet.** `endpoint` in `assets/js/lead-config.js` is empty, so the form only completes the visitor's journey (unlock and thank-you page). To capture leads, set `endpoint` to a URL that accepts a JSON POST (`name, mobile, email, configuration, consent, intent, project, source, page_url`) and replies `{ "success": true }`. Cross-origin endpoints must allow the site's origin (CORS). Once set, the thank-you page also tells visitors an advisor will call.
- The brochure and plan images are public files; the unlock is a lead-generation flow, not secure access.

## Tracking
Google Tag Manager `GTM-K7TTFSDN` loads on both pages. Events pushed: `generate_lead`, `thank_you_view`, `brochure_download`, `image_view`.

## Not in this repository
`ananta-floor-plans.pdf` (167 MB, over GitHub's file limit and not used by the page) and local working folders (`output/`, `tmp/`) are excluded via `.gitignore`.
