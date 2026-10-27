# (In)Visible Health: website

Interactive, educational site for **The Grand Challenge** of the EFMI LEAD cohort (yEFMI): how three labs diagnose, design for and translate into European action the health context that information systems do not capture.
Static, no build step, no dependencies (Google Fonts optional; falls back to system fonts offline).

## The three labs on the site
| Lab | Section | Routes |
|---|---|---|
| IFAL · Invisible Failure Analysis Lab | Diagnose | `#/ifal`, `#/map`, `#/archetype/1`…`5`, `#/layers`, `#/people` |
| BVDL · BMHI Visibility Design Lab | Design | `#/bvdl`, `#/bvdl/infrastructure`, `#/bvdl/responses`, `#/bvdl/odhness`, `#/bvdl/issues` |
| ETL · European Translation Lab | Translate | `#/etl`, `#/etl/opportunity`, `#/etl/gates`, `#/etl/pathways` |

Shared pages: `#/` (home), `#/challenge`, `#/glossary`, `#/about`. Each archetype page also follows its invisibility through BVDL and ETL ("the thread") and assembles the cohort's shared problem statement.

## Files
| File | Purpose |
|---|---|
| `index.html` | Page shell and navigation |
| `styles.css` | All styling (light/dark, responsive; lab colours are the `--ifal`, `--bvdl`, `--etl` tokens) |
| `data.js` | Shared content: cohort and labs, the challenge, ODH wheel, glossary, all 73 references |
| `data-ifal.js` | IFAL content: layers, archetypes, stakeholders, mechanisms, home example record |
| `data-bvdl.js` | BVDL content: Figure 1 and Tables 3 to 6, interoperability, ODHness, issues and research |
| `data-etl.js` | ETL content: rationale, Tables 7 to 11, Figure 2, the two gates, shared problem statement |
| `app.js` | Router, views, the interactive ODH Steering Wheel and the two redrawn figures |
| `favicon.svg` | Tab icon |

**To change text, edit the data file of the lab it belongs to.** Citations are numbers `[n]` into `REFERENCES` in `data.js`, which follows the shared document's reference list.

Content source: `EFMI_LEAD_-_The_Grand_Challenge_(draft_-_2026-10-21.).docx` (authority), with extra per-archetype detail from `MAP/02-matrix.md`.

## Run locally
Open `index.html` directly in a browser, or:

```bash
python3 -m http.server 8080 --directory MAP/website
```

## Publish at its own URL
- **Vercel** (configured via `vercel.json`): `vercel --prod` from this folder, or import the GitHub repo at https://vercel.com/new (no build command, output directory = root).
Scripts and styles are served with `max-age=0, must-revalidate`, so a new deploy shows on the next visit. The `?v=` numbers in `index.html` only need changing if that caching rule is ever relaxed again.

The site uses hash routes (`#/map`, `#/archetype/3`…), so it works on any static host without server configuration.

- **Netlify**: drag the `website` folder onto https://app.netlify.com/drop, then set a custom domain.
- **GitHub Pages**: push the folder contents to a repository, Settings → Pages → deploy from branch (root).
- **Any web server**: upload the files to the web root.
