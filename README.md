# New portfolio site

This folder is a standalone redesign. It does not modify the existing portfolio or any resume file.

## Files

- `index.html` — all portfolio content and semantic markup
- `styles.css` — compact original-style card layout and project-specific flowchart thumbnails
- `script.js` — mobile navigation and project-image lightbox
- `assets/` — local copies of the project architecture images used by the cards
- `robots.txt` — requests that all compliant search crawlers avoid the entire site
- `validate-site.cjs` — local browser validation and preview screenshot generator
- `preview-desktop.png`, `preview-mobile.png` and `preview-research-card.png` — generated visual checks

## Preview locally

Open `index.html` directly, or serve this directory with any static web server.

## Validate

From the Resume repository root:

```powershell
node "ahmad-farhat-portfolio\new site\validate-site.cjs"
```

The validator checks all eight cards and thumbnails, compact heading sizes, internal anchors, expandable evidence, image lightbox, mobile navigation, the Oxford and Research Analytics images, no-index controls and JavaScript errors. It also regenerates the desktop/mobile previews.

## Content decisions

- The HTR case study replaces the old eScriptorium framing with the current model-evidence pipeline.
- The site presents both the private all-local ensemble and the documented hybrid API-escalation profile.
- GIS diagrams use concrete data types, libraries, coordinate controls and outputs instead of generic architecture imagery.
- OxCOVID19 is presented as a verified open-source contribution, not as sole ownership of the full Oxford platform.
- The outreach access-control language is deliberately limited to what the current implementation can support.

## Search visibility

The page includes `noindex`, `nofollow`, `noarchive`, `nosnippet` and `noimageindex` directives for general, Google and Bing crawlers. `robots.txt` also disallows the entire site. These are crawler requests, not authentication: a public GitHub Pages URL remains accessible to anyone who knows or receives the URL.
