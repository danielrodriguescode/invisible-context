# The Invisible Context: website

Interactive awareness site for the **Context Invisibility Map v0.2** (EFMI LEAD 2026 · Sub-Group 1 · IFAL).
Static, no build step, no dependencies (Google Fonts optional; falls back to system fonts offline).

## Files
| File | Purpose |
|---|---|
| `index.html` | Page shell and navigation |
| `styles.css` | All styling (light/dark, responsive) |
| `data.js` | **All content**: layers, ODH wheel, archetypes, stakeholders, references. Edit text here. |
| `app.js` | Router, views and the interactive ODH Steering Wheel |
| `favicon.svg` | Tab icon |

Content source: `MAP/Updated document/IFAL_(v0.2).docx` (authority), with extra per-archetype detail from `MAP/02-matrix.md`.

## Run locally
Open `index.html` directly in a browser, or:

```bash
python3 -m http.server 8080 --directory MAP/website
```

## Publish at its own URL
- **Vercel** (configured via `vercel.json`): `vercel --prod` from this folder, or import the GitHub repo at https://vercel.com/new (no build command, output directory = root).
The site uses hash routes (`#/map`, `#/archetype/3`…), so it works on any static host without server configuration.

- **Netlify**: drag the `website` folder onto https://app.netlify.com/drop, then set a custom domain.
- **GitHub Pages**: push the folder contents to a repository, Settings → Pages → deploy from branch (root).
- **Any web server**: upload the five files to the web root.
