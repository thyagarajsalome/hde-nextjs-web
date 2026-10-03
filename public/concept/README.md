# Home Design English — landing page concept

A portable, responsive landing page using HDE's original logo and existing gold/navy visual identity. Built with plain HTML, CSS, and JavaScript. No build step or framework is required. Local GSAP 3.13.0 and ScrollTrigger scripts provide the enhanced motion; no Framer dependency is required.

## Preview and implement

Open `dist/index.html` in a browser, or serve `dist` with any static web server. Deploy the contents of `dist` together; keep the assets folder beside the HTML file. To implement in an existing Next.js or other application, translate the semantic sections into components and copy the styles, interactive logic, and assets.

## Files

- `dist/index.html`: page content and links
- `dist/styles.css`: responsive layout, theme and interaction states
- `dist/script.js`: mobile navigation, category filters, indicative budget, regional tabs
- `dist/assets/hde-logo.png`: original logo from HDE's public website
- `dist/assets/courtyard-house.jpg`: original AI-generated daylight architectural image
- `dist/assets/home-blue-hour.jpg`: original AI-generated cinematic exterior
- `dist/assets/living-kitchen.jpg`: original AI-generated editorial interior
- `dist/vendor/`: local GSAP 3.13.0 and ScrollTrigger, including their embedded license notices

All architectural imagery is illustrative, not a photograph of an HDE project.

## Integration details

All external navigation targets the current `https://www.homedesignenglish.com` site. The homepage hosts the calculators under its `#tools` section; separate tool routes were not exposed, so tool links open that hub rather than inventing destinations. Plot-size chips open the plan library; they do not preapply filters. Regional tabs describe available modes; users choose their region on HDE itself. Pro comparison opens `/upgrade#compare`. Replace these links with verified deep links if the owner's application supports them.

The local budget preview multiplies built-up area by published India city/quality benchmarks. It is explicitly illustrative and does not recreate HDE's proprietary calculation model. It excludes land, professional fees, permits and furnishing. Rates and plan pricing were inspected on 3 October 2026; the owner should review and maintain them. The live homepage and Pro page have conflicting calculator access descriptions, so this landing page avoids blanket promises about every tool.

Roboto is loaded from Google Fonts with a system fallback. No analytics, forms, payments, sign-in backend, or project storage are added; the associated actions lead to HDE's existing pages. The floor-plan study is illustrative, not to scale, and is not a construction drawing. This preview is a redesign proposal and does not change the existing website.

## Verification

Desktop and mobile layout and overflow checks; logo and image loading; category filter; budget changes and invalid input; region tabs; FAQ disclosures; mobile menu. JavaScript syntax checked with `node --check dist/script.js`.

## Motion design (updated concept)

Full-screen architectural hero with staggered masked typography, subtle image parallax, magnetic pointer interactions, scroll progress, word-by-word scroll reveal, a three-chapter pinned architectural story with image wipes, animated miniature budget charts, a drifting floor-plan sheet, section reveals and a Pro orbit treatment.

At phone widths the story becomes ordinary vertical content. `prefers-reduced-motion` skips the animated story, parallax, entrances and hover motion. If the animation library cannot load, the complete story remains visible as normal vertical content. The site uses native page scrolling; there is no smooth-scroll hijacking. Local animation files are included in the owner ZIP.

Reference research: Arkitect by Pawel Gola (https://www.framer.com/marketplace/templates/arkitect/) and Archline by designbydeke (https://www.framer.com/marketplace/templates/archline/). They informed immersive architectural imagery, editorial scale and scroll storytelling. Their code, images and templates were not copied. GSAP documentation: https://gsap.com/docs/v3/Plugins/ScrollTrigger/.
