# Caitlin McCollom — Coastal Garden Portfolio

A standalone, responsive GitHub Pages portfolio. **This is a new site and does not replace or modify the existing `cait-portfolio` repository.**

## What's inside

- `index.html`: home, coastal illustration, interactive falling cherry-blossom petals, career highlights, featured work, interactive implementation steps
- `work.html`: Supply Mover and Schedulicity implementation case studies, Technical Difference / People-Trak client education experience, clearly labeled graduate technical projects, and interactive simulations
- `about.html`: career story and personal interests
- `contact.html`: email, GitHub, LinkedIn, and resume links
- `css/style.css`: design system, responsive layouts, animations, reduced-motion support
- `js/site.js`: petal system, motion preference, menu, stepper, checklist, email-copy control
- `assets/`: original SVG coastal illustrations, favicon, portrait, and current resume PDF
- `.nojekyll`: allows GitHub Pages to serve the site as-is

## Design notes

The reference mood board inspired warm ivory, sea glass, sage, pale sky blue, peach-pink florals, and understated golden sand. The petal layer is *behind* the solid ivory hero text panel. A **Pause petals** control is provided; reduced-motion system preferences are respected.

## Preview locally

You can open `index.html` directly, but local web server preview is recommended to mimic GitHub Pages:

```bash
python -m http.server 8000
```

Then open http://localhost:8000/ in your browser.

There is no framework, Node build step, API key, or hosting fee required for GitHub Pages. The only third-party runtime request is Google Fonts; fallback system fonts are defined.

## Publish as a separate GitHub Pages site

See [DEPLOY.md](DEPLOY.md) for step-by-step instructions. Current repository: `cmccollom-cg-portfolio`.

## Customize

1. **Writing and content:** edit the copy inside `index.html`, `work.html`, `about.html`, and `contact.html`.
2. **Colors and spacing:** edit the CSS custom properties at the top of `css/style.css`.
3. **Photo:** replace `assets/caitlin-portrait.png` with another image of the same name, or update the image references in HTML.
4. **Resume:** replace `assets/Caitlin_McCollom_Resume.pdf` with the latest approved version.
5. **Links:** currently point to GitHub `caitmcc165`, LinkedIn `mccollomcaitlin`, and `caitmccollom@gmail.com`. Confirm they still reflect your preferred public profile details.
6. **Petals:** adjust their count in `js/site.js`; turn them off by default using the browser's reduced-motion setting.

## Content integrity

Professional project descriptions are drawn from the provided background and do not claim custom development of third-party software. No invented ROI, delivery times, or budget figures are used. The tech practice is expressly labeled as academic work.

## Notes before sharing with employers

- Double-check the resume PDF and the displayed education status before publishing. The site lists the M.S. in DevOps as **completed in 2026**. Ensure the downloadable resume PDF also reflects the latest education and experience information.
- The displayed portrait is based on a previously generated professional headshot. Replace it with a photograph you prefer if needed.
- This is a **static** portfolio; contact uses email, not a server-side form. There is no visitor tracking.