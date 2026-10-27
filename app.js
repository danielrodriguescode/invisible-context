/* =====================================================================
   (In)Visible Health: app (hash router + views + Steering Wheel)
   Sections: shared helpers, ODH wheel, home and challenge, IFAL views,
   BVDL views, ETL views, glossary and about, router.
   ===================================================================== */
(function () {
  "use strict";

  const D = window.LEAD;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const main = $("#main");

  const byN = (n) => D.ARCHETYPES.find((a) => a.n === Number(n));
  const layer = (id) => D.LAYERS.find((l) => l.id === id);
  const persp = (id) => D.PERSPECTIVES.find((p) => p.id === id);
  const dim = (id) => D.DIMENSIONS.find((d) => d.id === id);
  const cluster = (id) => D.CLUSTERS.find((c) => c.id === id);
  const lab = (id) => D.LABS.find((l) => l.id === id);

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ---------------------------------------------------------------- small render helpers */
  const cite = (refs) => {
    const list = [].concat(refs || []);
    if (!list.length) return "";
    return `<span class="cite">[${list.map((r) => `<a href="#/about" data-ref="${r}" title="${esc(D.REFERENCES[r - 1].short)}">${r}</a>`).join(",")}]</span>`;
  };
  const num = (a, cls = "") => `<span class="num ${cls}" style="background:${a.color}" aria-hidden="true">${a.n}</span>`;
  const layerBadge = (id) => { const l = layer(id); return `<span class="badge" style="background:${l.color}">${esc(l.name)}</span>`; };
  const archBadge = (n) => { const a = byN(n); return `<a class="badge" style="background:${a.color}" href="#/archetype/${a.n}">${a.n} · ${esc(a.name)}</a>`; };
  const dot = (color) => `<span class="dot" style="background:${color}"></span>`;
  const refLink = (r) => r.url ? ` <a href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.url.replace(/^https?:\/\//, ""))}</a>` : "";
  const labTag = (id) => { const l = lab(id); return `<a class="lab-tag lab-${l.id}" href="${l.route}"><span class="nav-dot" aria-hidden="true"></span>${esc(l.verb)} · ${esc(l.short)}</a>`; };
  const list = (items, cls = "") => `<ul class="${cls}">${items.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>`;
  const chipList = (items) => `<div class="chips">${items.map((x) => `<span class="chip">${esc(x)}</span>`).join("")}</div>`;
  // "a, b and c"
  const joinAnd = (xs) => xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`;

  // Section strip shown at the top of every page that belongs to a lab
  const SUBNAV = {
    ifal: [["ifal", "Overview", "#/ifal"], ["map", "The Map", "#/map"], ["archetype", "Archetypes", "#/archetype/1"], ["layers", "Five layers", "#/layers"], ["people", "Stakeholders", "#/people"]],
    bvdl: [["bvdl", "Overview", "#/bvdl"], ["infrastructure", "Data infrastructure", "#/bvdl/infrastructure"], ["responses", "Visibility responses", "#/bvdl/responses"], ["odhness", "ODHness", "#/bvdl/odhness"], ["issues", "Issues and research", "#/bvdl/issues"]],
    etl: [["etl", "Why Europe", "#/etl"], ["opportunity", "Opportunity Matrix", "#/etl/opportunity"], ["gates", "Two gates", "#/etl/gates"], ["pathways", "European pathways", "#/etl/pathways"]]
  };
  const labStrip = (id, active) => {
    const l = lab(id);
    return `<div class="lab-strip lab-${l.id}"><div class="wrap lab-strip-inner">
      <a class="lab-id" href="${l.route}"><span class="lab-num">${l.n}</span><span><strong>${esc(l.verb)}</strong><span class="lab-name"> · ${esc(l.name)} (${esc(l.short)})</span></span></a>
      <nav class="subnav" aria-label="${esc(l.name)}">${SUBNAV[id].map(([key, name, href]) => `<a href="${href}" ${key === active ? 'aria-current="page"' : ""}>${esc(name)}</a>`).join("")}</nav>
    </div></div>`;
  };

  // Glossary tooltips: the first occurrence of each term on the page becomes a
  // .gloss span. Runs after every render and whenever a panel redraws, so new
  // text needs no markup. Links, buttons, headings and labels are skipped.
  const GLOSS_SKIP = "a, button, h1, h2, h3, h4, .gloss, .cite, .eyebrow, .chip, .badge, .lab-tag, .tabs, .subnav, .refs, svg, script, style";
  const reEsc = (x) => x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const glossTerms = Object.keys(D.GLOSSARY).sort((a, b) => b.length - a.length).map((term, _, all) => {
    const t = reEsc(term);
    const first = /^[a-z]/.test(term) ? `[${term[0]}${term[0].toUpperCase()}]${t.slice(1)}` : t;
    // "AI" must not match the start of "AI Act"
    const longer = all.filter((x) => x.startsWith(term + " ")).map((x) => `(?!${reEsc(x.slice(term.length))})`).join("");
    return { term, re: new RegExp(`(^|[^\\w@-])(${first}s?)(?![\\w@])${longer}`) };
  });
  function autoGloss(root) {
    if (location.hash === "#/glossary") return;
    const done = new Set($$(".gloss", root).map((g) => g.dataset.gloss));
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => n.nodeValue.trim() && !n.parentElement.closest(GLOSS_SKIP) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => glossNode(node, done));
  }
  // wrap the earliest untipped term in a text node, then continue on the rest of it
  function glossNode(node, done) {
    const text = node.nodeValue;
    let hit = null;
    glossTerms.forEach(({ term, re }) => {
      if (done.has(term)) return;
      const m = re.exec(text);
      if (m && (!hit || m.index + m[1].length < hit.at)) hit = { term, at: m.index + m[1].length, len: m[2].length };
    });
    if (!hit) return;
    done.add(hit.term);
    const word = node.splitText(hit.at);
    const rest = word.splitText(hit.len);
    const span = document.createElement("span");
    span.className = "gloss"; span.tabIndex = 0; span.dataset.gloss = hit.term;
    span.textContent = word.nodeValue;
    word.replaceWith(span);
    if (rest.nodeValue) glossNode(rest, done);
  }


  /* ================================================================
     ODH Steering Wheel (SVG), redrawn after Benis et al. 2021, Fig. 1:
     red core, yellow keys ring, blue perspectives ring (3 sectors),
     red dotted technology ring, green dimensions ring (5 sectors).
     The archetype markers sit on the technology ring.
     ================================================================ */
  const R = { core: 92, key: [104, 166], persp: [182, 236], tech: 258, dim: [280, 342] };
  const COL = {
    core: "#FF7C80", coreLine: "#E0575C",
    key: "#FFD966", keyLine: "#D9AE1A",
    persp: "#9DC3E6", perspLine: "#5E95C9",
    dim: "#A9D18E", dimLine: "#6FA64A",
    tech: "#E0201B", heat: "#C8102E"
  };
  const SPAN = { key: 180, perspective: 120, dimension: 72 };
  const GAP = { key: 3, perspective: 2.2, dimension: 2.6 };
  const TECH_LABEL = { mid: 72, span: 34 };

  const rad = (deg) => (deg * Math.PI) / 180;
  const pt = (deg, r) => [r * Math.cos(rad(deg)), -r * Math.sin(rad(deg))];
  const f = (n) => n.toFixed(2);
  const sdiff = (from, to) => ((((to - from) % 360) + 540) % 360) - 180; // signed shortest angle
  const upper = (a) => Math.sin(rad(a)) > -0.05;

  const isDark = () => {
    const t = document.documentElement.getAttribute("data-theme");
    if (t) return t === "dark";
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  };

  function wedgePath(a0, a1, r0, r1) {
    // a0 < a1 in degrees CCW; SVG y is flipped, so CCW on screen = sweep 0
    const [x0, y0] = pt(a0, r1), [x1, y1] = pt(a1, r1);
    const [x2, y2] = pt(a1, r0), [x3, y3] = pt(a0, r0);
    const large = a1 - a0 > 180 ? 1 : 0;
    return `M ${f(x0)} ${f(y0)} A ${r1} ${r1} 0 ${large} 0 ${f(x1)} ${f(y1)} L ${f(x2)} ${f(y2)} A ${r0} ${r0} 0 ${large} 1 ${f(x3)} ${f(y3)} Z`;
  }
  function annulusPath(r0, r1) {
    return `M ${r1} 0 A ${r1} ${r1} 0 1 0 ${-r1} 0 A ${r1} ${r1} 0 1 0 ${r1} 0 Z ` +
           `M ${r0} 0 A ${r0} ${r0} 0 1 1 ${-r0} 0 A ${r0} ${r0} 0 1 1 ${r0} 0 Z`;
  }
  // arc for text: cw = clockwise (glyph tops face outward), else counter-clockwise (tops face the centre)
  function textArcPath(mid, span, r, cw) {
    const a0 = mid + span / 2, a1 = mid - span / 2;
    const large = span > 180 ? 1 : 0;
    if (cw) { const [x0, y0] = pt(a0, r), [x1, y1] = pt(a1, r); return `M ${f(x0)} ${f(y0)} A ${r} ${r} 0 ${large} 1 ${f(x1)} ${f(y1)}`; }
    const [x0, y0] = pt(a1, r), [x1, y1] = pt(a0, r);
    return `M ${f(x0)} ${f(y0)} A ${r} ${r} 0 ${large} 0 ${f(x1)} ${f(y1)}`;
  }

  function segments() {
    const out = [];
    D.KEYS.forEach((k) => out.push({ kind: "key", id: k.id, name: k.name, mid: k.angle, r: R.key, fill: COL.key, line: COL.keyLine, fs: 27, step: 1 }));
    D.PERSPECTIVES.forEach((p) => out.push({ kind: "perspective", id: p.id, name: p.full, mid: p.angle, r: R.persp, fill: COL.persp, line: COL.perspLine, fs: 18, step: 2 }));
    D.DIMENSIONS.forEach((d) => out.push({ kind: "dimension", id: d.id, name: d.name, mid: d.angle, r: R.dim, fill: COL.dim, line: COL.dimLine, fs: d.name.length > 26 ? 17 : 19, step: 3 }));
    return out.map((g) => Object.assign(g, { span: SPAN[g.kind], gap: GAP[g.kind] }));
  }
  const segDef = (kind, id) => segments().find((g) => g.kind === kind && g.id === id);

  let uidSeq = 0;
  function wheelSVG(opts = {}) {
    const mini = !!opts.mini;
    const uid = "wh" + (++uidSeq);
    const ti = mini ? -1 : 0;
    const segs = segments();
    let s = `<svg class="wheel${mini ? " mini" : ""}" viewBox="-390 -390 780 780" role="img" aria-label="One Digital Health Steering Wheel, with the five archetypes of invisible context on the technology ring">`;

    s += `<defs>`;
    segs.forEach((g) => {
      const cw = upper(g.mid), rm = (g.r[0] + g.r[1]) / 2;
      const rr = cw ? rm - g.fs * 0.34 : rm + g.fs * 0.34;
      s += `<path id="${uid}-t-${g.id}" d="${textArcPath(g.mid, g.span - 2 * g.gap, rr, cw)}"/>`;
    });
    s += `<path id="${uid}-t-tech" d="${textArcPath(TECH_LABEL.mid, TECH_LABEL.span + 10, R.tech - 5, true)}"/>`;
    s += `<radialGradient id="${uid}-core" cx="50%" cy="42%" r="62%"><stop offset="0%" stop-color="#FFA3A6"/><stop offset="100%" stop-color="${COL.core}"/></radialGradient>`;
    s += `<filter id="${uid}-glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5"/></filter>`;
    s += `</defs>`;

    const segG = (g) => {
      const d = wedgePath(g.mid - g.span / 2 + g.gap, g.mid + g.span / 2 - g.gap, g.r[0], g.r[1]);
      const heat = g.kind === "key" ? 0 : matchArchetypes(g.kind, g.id).length;
      return `<g class="seg" data-kind="${g.kind}" data-id="${g.id}" data-mid="${g.mid}" tabindex="${ti}" role="button" aria-label="${esc(kindLabel(g.kind))}: ${esc(g.name)}">
        <path class="seg-shape" d="${d}" fill="${g.fill}" stroke="${g.line}"/>
        <path class="seg-heat" d="${d}" style="--heat:${(heat / 4) * 0.62}"/>
        <text class="seg-label" font-size="${g.fs}" ${g.kind === "key" ? 'font-weight="800"' : ""}><textPath href="#${uid}-t-${g.id}" startOffset="50%" text-anchor="middle">${esc(g.name)}</textPath></text>
      </g>`;
    };

    // dimensions (outer, green)
    s += `<g class="stepped g-dims" data-step="3">${segs.filter((g) => g.kind === "dimension").map(segG).join("")}</g>`;

    // technology ring (red dotted)
    const dotsPath = textArcPath(TECH_LABEL.mid + 180, 360 - TECH_LABEL.span - 4, R.tech, true);
    s += `<g class="stepped g-tech tech" data-step="4" data-kind="tech" data-id="tech" tabindex="${ti}" role="button" aria-label="Technology ring">
      <path class="tech-hit" d="${annulusPath(R.persp[1] + 2, R.dim[0] - 2)}" fill-rule="evenodd"/>
      <path class="tech-dots" d="${dotsPath}"/>
      <text class="tech-label"><textPath href="#${uid}-t-tech" startOffset="50%" text-anchor="middle">Technology ring</textPath></text>
    </g>`;

    // perspectives (blue)
    s += `<g class="stepped g-persp" data-step="2">${segs.filter((g) => g.kind === "perspective").map(segG).join("")}</g>`;
    // keys (yellow)
    s += `<g class="stepped g-keys" data-step="1">${segs.filter((g) => g.kind === "key").map(segG).join("")}</g>`;

    // core
    s += `<g class="seg core" data-kind="core" data-id="core" data-mid="90" tabindex="${ti}" role="button" aria-label="One Digital Health">
      <circle r="${R.core}" fill="url(#${uid}-core)" stroke="${COL.coreLine}" stroke-width="1.5"/>
      <text class="core-label" text-anchor="middle" y="-22">One</text>
      <text class="core-label" text-anchor="middle" y="8">Digital</text>
      <text class="core-label" text-anchor="middle" y="38">Health</text>
    </g>`;

    // hotspot badges
    s += `<g class="g-badges" aria-hidden="true">`;
    segs.filter((g) => g.kind !== "key").forEach((g) => {
      const n = matchArchetypes(g.kind, g.id).length;
      // dimensions: just outside the green ring; perspectives: on the blue ring's outer edge, clear of the markers
      const PB = { individual: 140, population: -70, ecosystem: 212 };
      const [x, y] = g.kind === "dimension" ? pt(g.mid, R.dim[1] + 20) : pt(PB[g.id], R.persp[1] + 1);
      s += `<g transform="translate(${f(x)} ${f(y)})"><circle r="13"/><text text-anchor="middle" dy="5">${n}</text></g>`;
    });
    s += `</g>`;

    // threads + markers
    s += `<g class="g-threads" aria-hidden="true"></g>`;
    s += `<g class="stepped g-markers" data-step="5">`;
    D.ARCHETYPES.forEach((a) => {
      const [x, y] = pt(a.wheel.angle, R.tech);
      s += `<g class="marker" data-n="${a.n}" transform="translate(${f(x)} ${f(y)})" tabindex="${ti}" role="button" aria-label="Archetype ${a.n}: ${esc(a.name)}">`;
      s += `<circle class="glow" r="26" fill="${a.color}" filter="url(#${uid}-glow)"/>`;
      if (a.spillover.length) s += `<circle class="spill" r="34" stroke="${a.color}"/>`;
      s += `<circle class="halo" r="30" stroke="${a.color}"/>`;
      s += `<circle class="m" r="22" fill="${a.color}"/>`;
      s += `<text text-anchor="middle" dy="7.5">${a.n}</text>`;
      s += `</g>`;
    });
    s += `</g></svg>`;
    return s;
  }

  function kindLabel(kind) {
    return { key: "Enabling key", perspective: "Perspective", dimension: "Dimension", tech: "Technology ring", core: "Core" }[kind] || kind;
  }

  // state = { kind, id, selected, heat, step }
  function paintWheel(svg, state = {}) {
    const { kind, id, selected, heat } = state;
    const step = state.step == null ? 5 : state.step;
    const selA = selected ? byN(selected) : null;
    const matches = kind ? matchArchetypes(kind, id) : null;
    svg.classList.toggle("heat", !!heat);

    // learn-mode build-up
    $$(".stepped", svg).forEach((g) => {
      const s = Number(g.dataset.step);
      g.classList.toggle("off", s > step);
      g.classList.toggle("now", state.step != null && s === step);
    });
    const core = $(".core", svg);
    core.classList.toggle("now", state.step === 0);

    $$(".seg", svg).forEach((g) => {
      const k = g.dataset.kind, i = g.dataset.id;
      let lit = false, ghost = false, pop = false;
      if (selA) {
        lit = (k === "perspective" && (selA.perspectives.includes(i) || selA.spillover.includes(i))) ||
              (k === "dimension" && selA.dimensions.includes(i));
        ghost = !lit && k !== "core";
      } else if (kind && kind !== "core" && kind !== "tech" && kind !== "layer" && kind !== "cluster") {
        pop = k === kind && i === id;
        ghost = !pop && k !== "core";
      }
      g.classList.toggle("lit", lit);
      g.classList.toggle("ghost", ghost);
      g.classList.toggle("pop", pop);
      if (selA) g.style.setProperty("--lit", selA.color); else g.style.removeProperty("--lit");
      if (pop) { const [dx, dy] = pt(Number(g.dataset.mid), 12); g.style.transform = `translate(${f(dx)}px, ${f(dy)}px)`; }
      else g.style.transform = "";
    });
    $(".tech", svg).classList.toggle("on", kind === "tech" || !!selA);
    $(".tech", svg).classList.toggle("ghost", !!kind && kind !== "tech" && kind !== "core" && !selA && (kind === "perspective" || kind === "dimension" || kind === "key"));

    $$(".marker", svg).forEach((m) => {
      const n = Number(m.dataset.n);
      m.classList.toggle("sel", selected === n);
      m.classList.toggle("fade", selA ? selected !== n : (matches ? !matches.includes(n) : false));
    });

    // threads: archetype → its perspectives (inward) and dimensions (outward)
    const tg = $(".g-threads", svg);
    tg.innerHTML = "";
    const thread = (a, sk, sid, spill) => {
      const g = segDef(sk, sid);
      const lim = g.span / 2 - 9;
      const d = Math.max(-lim, Math.min(lim, sdiff(g.mid, a.wheel.angle)));
      const ta = g.mid + d;
      const rm = (g.r[0] + g.r[1]) / 2;
      let [tx, ty] = pt(ta, rm);
      if (!selA && kind === sk && id === sid) { const [dx, dy] = pt(g.mid, 12); tx += dx; ty += dy; }
      const [mx, my] = pt(a.wheel.angle, R.tech);
      const ca = a.wheel.angle + sdiff(a.wheel.angle, ta) / 2;
      const cr = sk === "dimension" ? R.dim[1] + 10 : R.persp[0] - 10;
      const [cx, cy] = pt(ca, Math.abs(sdiff(a.wheel.angle, ta)) < 25 ? (R.tech + rm) / 2 : cr);
      tg.insertAdjacentHTML("beforeend",
        `<path class="thread${spill ? " spill" : ""}" stroke="${a.color}" d="M ${f(mx)} ${f(my)} Q ${f(cx)} ${f(cy)} ${f(tx)} ${f(ty)}"/>` +
        `<circle class="thread-end" cx="${f(tx)}" cy="${f(ty)}" r="${spill ? 5 : 7}" fill="${a.color}"/>`);
    };
    if (selA) {
      selA.perspectives.forEach((p) => thread(selA, "perspective", p, false));
      selA.spillover.forEach((p) => thread(selA, "perspective", p, true));
      selA.dimensions.forEach((dd) => thread(selA, "dimension", dd, false));
    } else if (kind === "perspective" || kind === "dimension") {
      matches.forEach((n) => { const a = byN(n); thread(a, kind, id, a.spillover.includes(id)); });
    }
  }

  function matchArchetypes(kind, id) {
    if (!kind) return D.ARCHETYPES.map((a) => a.n);
    return D.ARCHETYPES.filter((a) => {
      if (kind === "layer") return a.layers.includes(id);
      if (kind === "perspective") return a.perspectives.includes(id) || a.spillover.includes(id);
      if (kind === "dimension") return a.dimensions.includes(id);
      if (kind === "cluster") return a.cluster === id;
      if (kind === "key") return id === "onehealth" ? [2, 5].includes(a.n) : [1, 3, 4].includes(a.n);
      return true; // core, tech
    }).map((a) => a.n);
  }

  /* ================================================================
     Views
     ================================================================ */

  /* ---------------------------------------------------------------- HOME */
  function viewHome() {
    const st = D.STORY;
    const rows = st.rows.map((r, i) => {
      const a = byN(r.a);
      return `<div class="rrow" data-i="${i}">
        <button class="rrow-btn" aria-expanded="false" aria-controls="hid-${i}">
          <span class="field">${esc(r.field)}</span>
          <span class="peek" aria-hidden="true">${eyeIcon()}<span class="peek-t">Show missing context</span></span>
          <span class="shown">${esc(r.shown)}</span>
        </button>
        <div class="hidden" id="hid-${i}"><div>
          <div class="hidden-inner fog" style="border-color:${a.color}">
            ${esc(r.hidden)}<br>
            <a href="#/archetype/${a.n}" style="color:${a.color}">Archetype ${a.n} · ${esc(a.name)} →</a>
          </div>
        </div></div>
      </div>`;
    }).join("");

    const cards = D.ARCHETYPES.map((a) => `
      <a class="card arch-card" href="#/archetype/${a.n}" style="border-top-color:${a.color}">
        <div style="display:flex;gap:10px;align-items:center">${num(a)}<span class="plain">${esc(a.plain)}</span></div>
        <h3>${esc(a.name)}</h3>
        <p>${esc(a.tagline)}</p>
        <div class="chips">${a.layers.map((l) => `<span class="chip">${dot(layer(l).color)}${esc(layer(l).name)}</span>`).join("")}</div>
      </a>`).join("");

    return `
    <section class="hero"><div class="wrap hero-grid">
      <div>
        <span class="eyebrow">EFMI LEAD cohort · The Grand Challenge</span>
        <h1><span class="in">(In)</span>Visible Health</h1>
        <p class="hero-sub">Tracing the unseen layers of health ecosystems</p>
        <p class="lede">${"When health decisions fail, how much of the relevant context was never digitally or cognitively visible in the first place? Three labs of the EFMI LEAD cohort took on this question within One Digital Health (ODH): one diagnoses what stays invisible, one designs how BMHI could make it visible, and one translates the result into European action."}</p>
        <p class="lede" style="font-size:1rem">The example record on the right shows a discharge decision. Select each field to see the relevant information that the record does not contain.</p>
        <div class="btn-row">
          <a class="btn" href="#/challenge">Start with the challenge →</a>
          <button class="btn ghost" data-scroll="labs">Meet the three labs</button>
        </div>
      </div>
      <div class="card record" id="record">
        <div class="record-head"><span class="who">${esc(st.patient)}</span><span class="tag">Electronic health record</span></div>
        <div class="record-decision"><span class="ok" aria-hidden="true">✓</span>${esc(st.decision)}</div>
        ${rows}
        <div class="record-foot">
          <span class="small muted" id="revealCount">0 of ${st.rows.length} items shown</span>
          <button class="btn ghost" id="revealAll" style="padding:8px 16px">Show all</button>
        </div>
        <div class="moral fog" id="moral">${esc(st.moral)}</div>
        <p class="illustrative">Illustrative example combining decision failures described in the Context Invisibility Map (IFAL). It does not describe a real patient.</p>
      </div>
    </div></section>

    ${startHTML()}

    <section class="section" id="labs"><div class="wrap">
      <span class="eyebrow">How the cohort worked</span>
      <h2>Three labs, one loop</h2>
      <p class="lede">The Grand Challenge was split across three sub-groups. Each lab hands its output to the next, and the last one sends questions back to the first, so the work can be refined in further iterations.</p>
      ${labsLoop()}
    </div></section>

    <section class="section"><div class="wrap">
      <span class="eyebrow">Five archetypes · followed through all three labs</span>
      <h2>Five recurring patterns of missing context</h2>
      <p class="lede">IFAL distinguishes five mechanisms: a determinant that is not recorded; one recorded in a form other systems cannot interpret; one for which no suitable structured field exists; one held in another sector's system; and one that no outcome indicator measures. Each requires a different response, usually from a different actor. Each archetype page follows its invisibility from diagnosis to design to European action.${cite([1, 3])}</p>
      <div class="arch-grid" style="margin-top:28px">${cards}</div>
    </div></section>

    <section class="section"><div class="wrap">
      <span class="eyebrow">Documentation evidence</span>
      <h2>How often social and environmental determinants are documented</h2>
      <p class="lede">In a survey of 201 providers, consistent documentation was low even among providers who considered these determinants clinically vital.${cite(4)}</p>
      <div class="numbers" style="margin-top:24px">
        ${[["18.2%", "document housing instability consistently"], ["16.4%", "document food insecurity consistently"], ["22.7%", "document transport access consistently"], ["<5%", "document any environmental determinant consistently (excluding outbreaks)"]]
          .map(([v, l]) => `<div class="card stat"><div class="v">${v}</div><div class="l">${l}</div></div>`).join("")}
      </div>
      <p class="muted small" style="margin-top:14px">Smoking status, the only social determinant with a long-established structured EHR field, is documented consistently by a substantial majority of providers. This suggests that the gap reflects the structure of the record more than clinical awareness.${cite(4)} Across health systems, social determinants are coded in only 1 to 2% of encounters.${cite(58)}</p>
    </div></section>

    <section class="section"><div class="wrap split">
      <div>
        <span class="eyebrow">One Digital Health</span>
        <h2>Invisibility as a connection problem</h2>
        <p class="lede">${"In the One Digital Health (ODH) framework, missing context is understood as a failure of connection between parts of the health ecosystem (people, communities, animals, environments and institutions) rather than as a gap in a single system. Relevant information often exists elsewhere but does not reach the point where the decision is made."}${cite(2)}</p>
        <div class="btn-row"><a class="btn" href="#/map">View the ODH Steering Wheel →</a></div>
      </div>
      <a href="#/map" aria-label="Open the interactive map" style="display:block">${wheelSVG({ mini: true })}</a>
    </div></section>

    <section class="section"><div class="wrap">
      <span class="eyebrow">Where the three labs converge</span>
      <h2>One shared problem statement</h2>
      <p class="lede">The labs work towards a single sentence. The first three slots come from the diagnosis and the design; the last is ETL's proposed European response.${cite(69)}</p>
      ${statementHTML()}
      <div class="btn-row"><a class="btn ghost" href="#/archetype/1">See it filled in for an archetype →</a></div>
    </div></section>`;
  }

  // Where to start: reading paths by time, and starting points by background
  const startState = { profile: "clinician" };
  const startStep = (x, cls = "") => x.href ? `<a class="${cls}" href="${x.href}">${esc(x.text)}</a>`
    : x.scroll ? `<button class="link-btn ${cls}" data-scroll="${x.scroll}">${esc(x.text)}</button>` : esc(x.text);
  function startHTML() {
    const S = D.START;
    return `<section class="section" id="start"><div class="wrap">
      <span class="eyebrow">Where to start</span>
      <h2>Pick your time, or your background</h2>
      <p class="lede">You do not need to read everything. Choose a path by the time you have.</p>
      <div class="paths">
        ${S.paths.map((p) => `<div class="card path"><span class="path-time">${esc(p.time)}</span><h3>${esc(p.title)}</h3>
          <ol>${p.steps.map((x, i) => `<li>${startStep(x)}${p.labs && i === 0 ? `<span class="path-labs">${D.LABS.map((l) => labTag(l.id)).join("")}</span>` : ""}</li>`).join("")}</ol>
        </div>`).join("")}
      </div>
      <h3 class="start-sub">Or start from your background</h3>
      <div class="tabs" role="tablist" aria-label="Your background">${S.profiles.map((p) => `<button role="tab" data-profile="${p.id}" aria-selected="${p.id === startState.profile}">${esc(p.name)}</button>`).join("")}</div>
      <div id="profilePanel" role="tabpanel" aria-live="polite"></div>
    </div></section>`;
  }
  function bindStart() {
    const render = () => {
      const p = D.START.profiles.find((x) => x.id === startState.profile);
      $$("[data-profile]").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.profile === p.id)));
      $("#profilePanel").innerHTML = `<p class="profile-hook">${esc(p.hook)}</p>
        <div class="profile-go">${p.go.map((g, i) => {
          const inner = `<span class="ph-n">${i + 1}</span><span><strong>${esc(g.title)} →</strong><span class="small muted">${esc(g.text)}</span></span>`;
          return g.href ? `<a class="card go" href="${g.href}">${inner}</a>` : `<button class="card go" data-scroll="${g.scroll}">${inner}</button>`;
        }).join("")}</div>`;
    };
    $$("[data-profile]").forEach((b) => b.addEventListener("click", () => { startState.profile = b.dataset.profile; render(); }));
    render();
  }

  // IFAL → BVDL → ETL → back to IFAL
  function labsLoop() {
    const card = (l) => `<a class="card lab-card lab-${l.id}" href="${l.route}">
        <span class="lab-num">${l.n}</span>
        <span class="eyebrow" style="margin:0">${esc(l.verb)} · ${esc(l.role)}</span>
        <h3>${esc(l.name)}</h3>
        <p class="lab-q">${esc(l.question)}</p>
        <p class="small muted" style="margin:0">Output: <strong>${esc(l.output)}</strong></p>
        <p class="small muted" style="margin:0">${l.members.map(esc).join(" · ")}</p>
      </a>`;
    const arrow = (c) => `<div class="hand-off" aria-hidden="false"><span class="arr" aria-hidden="true"></span><span class="hand-label">${esc(c.label)}</span></div>`;
    const c = (from) => D.CONNECTIONS.find((x) => x.from === from);
    return `<div class="loop3">
        ${card(lab("ifal"))}${arrow(c("ifal"))}${card(lab("bvdl"))}${arrow(c("bvdl"))}${card(lab("etl"))}
      </div>
      <div class="loop-back"><span class="arr-back" aria-hidden="true"></span><span><strong>ETL → IFAL:</strong> ${esc(c("etl").label)} ${esc(c("etl").text)}</span></div>`;
  }

  // The shared problem statement (section 3.5.2); fill = { slot: html } for a filled-in version
  function statementHTML(fill) {
    const S = D.STATEMENT;
    const who = { "ifal+bvdl": "IFAL and BVDL", etl: "ETL" };
    const body = S.template.map((p) => {
      if (p.t) return esc(p.t);
      const v = fill && fill[p.slot];
      return `<span class="slot slot-${p.lab === "etl" ? "etl" : "ifal"}${v ? " filled" : ""}" title="Slot filled by ${who[p.lab]}">${v || `[${esc(p.label)}]`}</span>`;
    }).join("");
    return `<blockquote class="statement card">${body}</blockquote>
      <div class="statement-key small muted"><span><i class="slot-ifal"></i>Filled by IFAL and BVDL</span><span><i class="slot-etl"></i>Filled by ETL</span></div>`;
  }

  function eyeIcon() {
    return `<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="3" fill="currentColor"/></svg>`;
  }

  function bindHome() {
    $(".view-enter").addEventListener("click", (e) => {
      const s = e.target.closest("[data-scroll]");
      if (s) $("#" + s.dataset.scroll).scrollIntoView({ behavior: "smooth", block: "start" });
    });
    bindStart();
    const total = D.STORY.rows.length;
    const update = () => {
      const n = $$(".rrow.open").length;
      $("#revealCount").textContent = `${n} of ${total} items shown`;
      if (n === total) { $("#moral").classList.add("clear"); $("#revealAll").textContent = "Hide all"; }
      else { $("#moral").classList.remove("clear"); $("#revealAll").textContent = "Show all"; }
    };
    const setRow = (row, open) => {
      row.classList.toggle("open", open);
      $(".rrow-btn", row).setAttribute("aria-expanded", String(open));
      $(".peek-t", row).textContent = open ? "Shown" : "Show missing context";
      const fog = $(".hidden-inner", row);
      if (open) setTimeout(() => fog.classList.add("clear"), 120); else fog.classList.remove("clear");
    };
    $$(".rrow").forEach((row) => {
      $(".rrow-btn", row).addEventListener("click", () => { setRow(row, !row.classList.contains("open")); update(); });
    });
    $("#revealAll").addEventListener("click", () => {
      const all = $$(".rrow.open").length === total;
      $$(".rrow").forEach((row, i) => setTimeout(() => { setRow(row, !all); update(); }, all ? 0 : i * 260));
    });
  }

  /* ---------------------------------------------------------------- CHALLENGE */
  function viewChallenge() {
    const C = D.CHALLENGE;
    return `
    <div class="wrap page-head">
      <span class="eyebrow">The Grand Challenge · Invisible Context</span>
      <h1>Context that never reaches the decision</h1>
      <p class="lede">${"Health decisions are routinely made without contextual information that largely determines their outcome. The question is not whether context matters, which is well established, but how much relevant context was never made visible, and what kind of absence each gap is."}${cite([1, 2, 3])}</p>
    </div>

    <section class="section" style="padding-top:24px"><div class="wrap">
      <div class="examples">
        ${C.examples.map((x) => `<a class="card example" href="#/archetype/${x.a}" style="border-left-color:${byN(x.a).color}"><p>${esc(x.text)}</p><span class="small muted">Archetype ${x.a} · ${esc(byN(x.a).name)} →</span></a>`).join("")}
      </div>
      <p class="closing" style="max-width:62ch">In each case the clinical reasoning is sound. The decision still fails, because the determining context was neither digitally available nor cognitively present when it was made.</p>
    </div></section>

    <section class="section"><div class="wrap split" style="align-items:start">
      <div>
        <span class="eyebrow">Not one phenomenon, but five</span>
        <h2>Five different kinds of absence</h2>
        <p class="lede">Treating every gap as "missing data" keeps the problem in place, because each kind needs a different remedy and a different institutional actor.</p>
        <a class="btn ghost" href="#/layers">The five layers of invisibility →</a>
      </div>
      <ol class="absences">
        ${C.absences.map((x) => { const l = layer(x.layer); return `<li style="--c:${l.color}"><span class="ln-s" style="background:${l.color}">${l.n}</span><span><strong>${esc(l.name)}</strong>: ${esc(x.text)}</span></li>`; }).join("")}
      </ol>
    </div></section>

    <section class="section"><div class="wrap">
      <span class="eyebrow">The evidence in brief</span>
      <h2>The determinants that matter most are the least visible</h2>
      <div class="numbers" style="margin-top:20px">
        <div class="card stat"><div class="v">1 to 2%</div><div class="l">of encounters have social determinants coded${cite(58)}</div></div>
        <div class="card stat"><div class="v">&lt;5%</div><div class="l">of providers consistently document any environmental determinant other than outbreaks${cite(4)}</div></div>
        <div class="card stat"><div class="v">Built in</div><div class="l">pulse oximetry overestimates oxygen saturation in darker skin; recognition systems are less accurate for Black women${cite(5)}</div></div>
      </div>
      <p class="lede" style="margin-top:24px">${"Information opacity is a systemic property of health care: the loss of patient narrative and fragmented surveillance data drove inequitable decisions during COVID-19. Digital determinants such as data poverty and algorithmic bias add another layer of inequity. In ODH, human, animal and environmental determinants belong to one ecosystem, yet their signals sit outside clinical data capture."}${cite([1, 5, 6, 2])}</p>
    </div></section>

    <section class="section"><div class="wrap">
      <span class="eyebrow">Why it is hard</span>
      <h2>Separate data streams hide the feedback loops</h2>
      <p class="lede">Real-life drivers such as micro-climate changes, local socio-economic stress, wildlife behaviour and hidden exposures often stay below digital surveillance thresholds. Each domain uses its own data sources, so a chemical run-off can change wildlife physiology long before human symptoms appear, without any system connecting the two.${cite([2, 7])}</p>
      <div class="domains">
        ${C.domains.map((d) => `<div class="card domain"><h3>${esc(d.name)}</h3><p class="muted" style="margin:0">${esc(d.text)}</p></div>`).join('<span class="domain-gap" aria-hidden="true">≠</span>')}
      </div>
    </div></section>

    <section class="section"><div class="wrap">
      <span class="eyebrow">About LEAD</span>
      <h2>A cohort learning by doing</h2>
      <p class="lede">${"LEAD (EducationaL EFMI Assembly Designed for BMHI) is a cohort of young Biomedical and Health Informatics professionals from several European countries, set up by the Young EFMI Workgroup. It aims to be a cybernetic educational framework for future BMHI leadership: the cohort frames a problem, builds shared knowledge, negotiates it against real systems, and turns it into a proposal."}</p>
      <ol class="timeline">
        ${C.timeline.map((t) => `<li><span class="when">${esc(t.when)}</span><span class="where">${esc(t.where)}</span><p>${esc(t.text)}</p></li>`).join("")}
      </ol>
      <div class="phases">
        ${D.LEAD_PHASES.map((ph, i) => `<div class="card phase"><span class="ph-n">${i + 1}</span><h3>${esc(ph.name)}</h3><p>${esc(ph.text)}</p></div>`).join("")}
      </div>
      <p class="small muted" style="margin-top:12px">IFAL's diagnosis belongs to the first two phases; BVDL's design work and ETL's European proposal take the challenge further along the loop.</p>
    </div></section>

    <section class="section"><div class="wrap">
      <span class="eyebrow">How the cohort split the work</span>
      <h2>Three labs, one loop</h2>
      ${labsLoop()}
    </div></section>`;
  }

  /* ---------------------------------------------------------------- IFAL OVERVIEW */
  function viewIfal() {
    const L = lab("ifal");
    const conn = (from) => D.CONNECTIONS.find((c) => c.from === from);
    return `
    <div class="wrap page-head">
      <span class="eyebrow">Sub-group 1 · ${esc(L.role)}</span>
      <h1>${esc(L.name)}</h1>
      <p class="lede">${esc(L.question)} IFAL's output is the <strong>Context Invisibility Map</strong>: five layers of invisibility, five archetypes of decision failure, the people who carry the burden, and where each archetype sits on the ODH Steering Wheel.</p>
    </div>
    <section class="section" style="padding-top:24px"><div class="wrap split" style="align-items:start">
      <div>
        <h3>Tasks</h3>
        ${list(L.tasks, "tasks")}
        <h3 style="margin-top:24px">Method</h3>
        <p>The map is anchored on <strong>decisions</strong>: a determinant counts as invisible only in relation to a decision it should have informed. The five archetypes were chosen so that together they cover all five layers and all three ODH perspectives, so that no form of invisibility is left out of the work of the other two labs.${cite(2)}</p>
      </div>
      <div class="handoffs">
        <div class="card handoff lab-bvdl"><span class="eyebrow" style="margin:0">Hands on to BVDL</span><h3>${esc(conn("ifal").label)}</h3><p>${esc(conn("ifal").text)}</p><a class="small" href="#/bvdl/responses">How BVDL responds →</a></div>
        <div class="card handoff lab-etl"><span class="eyebrow" style="margin:0">Receives from ETL</span><h3>${esc(conn("etl").label)}</h3><p>${esc(conn("etl").text)}</p><a class="small" href="#/etl/gates">ETL's prioritisation criteria →</a></div>
      </div>
    </div></section>

    <section class="section"><div class="wrap">
      <span class="eyebrow">Two clusters</span>
      <h2>Not in the record, or stuck behind a boundary</h2>
      <div class="mech-grid" style="margin-top:20px">
        ${D.CLUSTERS.map((c) => `<div class="card"><h3>${esc(c.name)} invisibilities</h3><p>${esc(c.text)}</p><div class="chips">${c.archetypes.map(archBadge).join("")}</div></div>`).join("")}
      </div>
      <p class="small muted" style="margin-top:12px">A way of making context visible that is designed for one cluster will not, on its own, address the other.</p>
    </div></section>

    <section class="section"><div class="wrap">
      <span class="eyebrow">Explore the map</span>
      <h2>Four ways into the diagnosis</h2>
      <div class="arch-grid" style="margin-top:20px">
        ${[["#/map", "The Map", "The five archetypes placed on the interactive ODH Steering Wheel."],
           ["#/archetype/1", "The archetypes", "Each archetype: failing decisions, hidden determinants, mechanisms, and the thread through the other two labs."],
           ["#/layers", "Five layers", "Informational, semantic, experiential, governance and evaluative invisibility, and how they reinforce each other."],
           ["#/people", "Stakeholders", "Who carries the burden: patients, clinicians, institutions and the wider ecosystem."]]
          .map(([h, t, d]) => `<a class="card arch-card lab-card-mini" href="${h}"><h3>${esc(t)} →</h3><p>${esc(d)}</p></a>`).join("")}
      </div>
    </div></section>`;
  }

  /* ---------------------------------------------------------------- MAP */
  const mapState = { kind: null, id: null, selected: null, heat: false, mode: "explore", step: 0 };
  let tourTimer = null;

  function viewMap() {
    const chipGroup = (label, kind, items) => `
      <div><div class="lab">${label}</div><div class="chips">
        ${items.map((it) => `<button class="chip" data-kind="${kind}" data-id="${it.id}" aria-pressed="false">${it.color ? dot(it.color) : ""}${esc(it.name)}</button>`).join("")}
      </div></div>`;

    return `
    <div class="wrap page-head">
      <span class="eyebrow">The Context Invisibility Map on the ODH Steering Wheel</span>
      <h1>The archetypes on the ODH Steering Wheel</h1>
      <p class="lede">${"The One Digital Health (ODH) Steering Wheel has two enabling keys (yellow), three perspectives (blue) and five dimensions (green), connected by the technology ring (red dots). In this map the five archetypes of invisible context are placed on the technology ring, because each describes a connection that does not work. Select an archetype to see the perspectives and dimensions it involves, or select a part of the wheel to see the related archetypes."}${cite(2)}</p>
    </div>
    <div class="wrap map-layout">
      <div class="card wheel-box">
        <div class="wheel-toolbar">
          <div class="seg-ctrl" role="tablist" aria-label="Map mode">
            <button role="tab" data-mode="explore" aria-selected="true">Explore</button>
            <button role="tab" data-mode="learn" aria-selected="false">Learn the wheel</button>
          </div>
          <div class="tools">
            <button class="tool" id="heatBtn" aria-pressed="false" title="Show how many archetypes touch each part of the wheel">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2c1 4 5 6 5 11a5 5 0 0 1-10 0c0-2 1-3.5 2-4.5 0 2 1 3 2 3 0-3-1-6 1-9.5z" fill="currentColor"/></svg>Hotspots</button>
            <button class="tool" id="tourBtn" aria-pressed="false">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path class="play" d="M8 5v14l11-7z" fill="currentColor"/></svg><span>Tour</span></button>
          </div>
        </div>
        <div id="wheelHost">${wheelSVG()}</div>
        <div class="odh-legend" aria-hidden="true">
          <span><i style="background:${COL.key}"></i>Keys</span>
          <span><i style="background:${COL.persp}"></i>Perspectives</span>
          <span><i style="background:${COL.dim}"></i>Dimensions</span>
          <span><i class="dots"></i>Technology ring</span>
          <span><i style="background:var(--ink);border-radius:50%"></i>Archetype</span>
        </div>
        <div class="arch-dock" id="dock">
          ${D.ARCHETYPES.map((a) => `<button data-pick="${a.n}" style="--c:${a.color}" aria-pressed="false" title="${esc(a.name)}">${num(a)}<span>${esc(a.plain)}</span></button>`).join("")}
        </div>
        <p class="hint small muted">Hover over or select any segment for a description. Use the ← → keys to move between archetypes.</p>
      </div>
      <div class="card panel">
        <div id="explorePanel">
          <div class="filters">
            ${chipGroup("Filter by layer of invisibility", "layer", D.LAYERS)}
            ${chipGroup("Filter by cluster", "cluster", D.CLUSTERS)}
          </div>
          <div class="inspector" id="inspector" aria-live="polite"></div>
        </div>
        <div id="learnPanel" hidden aria-live="polite"></div>
      </div>
    </div>
    <div class="wrap" style="padding-bottom:56px">
      <div class="interface">
        <h3>Where the archetypes sit in the ecosystem</h3>
        <p style="margin:0">The archetypes sit at different interfaces of the ODH ecosystem. The SDOH gap and patient narrative concentrate at the individual and population levels; environmental blindness links population and ecosystem; algorithmic data poverty sits between individuals, populations and Healthcare Industry 4.0; governance silos sit in the exchange between human, veterinary and environmental systems. Relevant information may exist in one part of the ecosystem without becoming available in another, and no single intervention addresses every archetype.${cite(2)}</p>
      </div>
      <p class="small muted" style="margin-top:14px">Wheel redrawn after Benis et al. 2021, Fig. 1.${cite(2)} The placement of archetypes on the technology ring, and the links between archetypes and the two keys, are this map's interpretation.</p>
    </div>`;
  }

  function inspectorHTML() {
    const { kind, id, selected } = mapState;
    const pills = (list, fn) => list.map(fn).join("");
    if (selected) {
      const a = byN(selected);
      return `
        <div style="display:flex;gap:10px;align-items:center;margin-bottom:8px">${num(a)}<span class="muted small">${esc(a.plain)}</span></div>
        <h3>${esc(a.name)}</h3>
        <p>${esc(a.tagline)}</p>
        <dl class="kv">
          <dt>Why hidden</dt><dd>${pills(a.layers, layerBadge)}</dd>
          <dt>Perspective</dt><dd>${pills(a.perspectives, (p) => `<button class="chip mini-chip" data-go="perspective:${p}">${esc(persp(p).full)}</button>`)}${pills(a.spillover, (p) => `<button class="chip mini-chip" data-go="perspective:${p}">${esc(persp(p).full)} (spillover)</button>`)}</dd>
          <dt>Dimension</dt><dd>${pills(a.dimensions, (d) => `<button class="chip mini-chip" data-go="dimension:${d}">${esc(dim(d).name)}</button>`)}</dd>
          <dt>Cluster</dt><dd><span class="chip">${esc(cluster(a.cluster).name)}</span></dd>
        </dl>
        <div class="story card" style="border-left-color:${a.color};box-shadow:none"><h3>${esc(a.failures[0].title)}</h3><p>${esc(a.failures[0].text)}${cite(a.failures[0].ref)}</p></div>
        <div class="btn-row" style="margin-top:12px"><a class="btn" href="#/archetype/${a.n}">Explore this archetype →</a><button class="clear-btn" data-clear>Clear</button></div>`;
    }
    if (kind) {
      let title = "", text = "", sub = "";
      if (kind === "layer") { const l = layer(id); title = `${l.name} invisibility`; sub = l.question; text = `<strong>What's missing:</strong> ${esc(l.missing)}<br><strong>Consequence:</strong> ${esc(l.consequence)}${cite(l.refs)}`; }
      if (kind === "perspective") { const p = persp(id); title = p.full; sub = "ODH perspective · blue ring"; text = esc(p.text); }
      if (kind === "dimension") { const d = dim(id); title = d.name; sub = "ODH dimension · green ring"; text = esc(d.text); }
      if (kind === "cluster") { const c = cluster(id); title = `${c.name} invisibilities`; sub = "Cluster"; text = esc(c.text) + " A way of making context visible that works for one cluster will not, on its own, address the other."; }
      if (kind === "key") { const k = D.KEYS.find((x) => x.id === id); title = `${k.name}`; sub = "Enabling key · yellow ring"; text = esc(k.text) + (id === "onehealth" ? " <em>In this map's reading</em>, the archetypes that most directly involve animal and environmental health are highlighted." : " <em>In this map's reading</em>, the archetypes rooted in records, devices and algorithms are highlighted."); }
      if (kind === "tech") { title = D.TECH_RING.name; sub = "Red dotted ring"; text = esc(D.TECH_RING.text); }
      if (kind === "core") { title = D.CORE.name; sub = "Centre of the wheel"; text = esc(D.CORE.text) + cite(2); }
      const list = matchArchetypes(kind, id);
      return `
        <span class="eyebrow" style="margin-bottom:4px">${esc(sub)}</span>
        <h3>${esc(title)}</h3>
        <p>${text}</p>
        <div class="small muted">${list.length} archetype${list.length === 1 ? "" : "s"} here:</div>
        <div class="list">${list.map((n) => { const a = byN(n); const sp = kind === "perspective" && a.spillover.includes(id); return `<button class="alink" data-pick="${n}">${num(a)}<span><span class="t">${esc(a.name)}${sp ? " <span class='muted'>(spillover)</span>" : ""}</span><br><span class="s">${esc(a.plain)}</span></span></button>`; }).join("")}</div>
        <div style="margin-top:12px"><button class="clear-btn" data-clear>Clear selection</button></div>`;
    }
    return `
      <span class="eyebrow" style="margin-bottom:4px">How to read the wheel</span>
      <h3>The five archetypes</h3>
      <p>Each numbered marker represents a recurring type of decision failure caused by missing context. Select one to show the lines connecting it to its perspectives and dimensions. Together the five archetypes cover all five layers of invisibility and all three ODH perspectives.</p>
      <div class="list">${D.ARCHETYPES.map((a) => `<button class="alink" data-pick="${a.n}">${num(a)}<span><span class="t">${esc(a.name)}</span><br><span class="s">${esc(a.plain)}</span></span></button>`).join("")}</div>`;
  }

  function learnHTML() {
    const L = D.LEARN, s = L[mapState.step];
    return `
      <span class="eyebrow" style="margin-bottom:4px">Learn the wheel · step ${s.step + 1} of ${L.length}</span>
      <h3>${esc(s.title)}</h3>
      <p>${esc(s.text)}${cite(s.ref)}</p>
      <div class="steps" role="tablist" aria-label="Steps">${L.map((x) => `<button data-step="${x.step}" aria-selected="${x.step === s.step}" aria-label="Step ${x.step + 1}: ${esc(x.title)}"></button>`).join("")}</div>
      <div class="btn-row">
        <button class="btn ghost" data-learn="-1" ${s.step === 0 ? "disabled" : ""}>← Back</button>
        ${s.step < L.length - 1 ? `<button class="btn" data-learn="1">Next →</button>` : `<button class="btn" data-mode-go="explore">Start exploring →</button>`}
      </div>`;
  }

  function bindMap() {
    const svg = $("#wheelHost svg");
    const insp = $("#inspector");
    const learnPanel = $("#learnPanel");
    const learn = () => mapState.mode === "learn";

    const render = () => {
      paintWheel(svg, learn() ? { step: mapState.step, heat: mapState.heat } : Object.assign({}, mapState, { step: null }));
      $("#explorePanel").hidden = learn();
      learnPanel.hidden = !learn();
      if (learn()) learnPanel.innerHTML = learnHTML(); else insp.innerHTML = inspectorHTML();
      $$(".seg-ctrl [data-mode]").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.mode === mapState.mode)));
      $$(".chip[data-kind]").forEach((c) => c.setAttribute("aria-pressed", String(!mapState.selected && c.dataset.kind === mapState.kind && c.dataset.id === mapState.id)));
      $$("#dock [data-pick]").forEach((b) => b.setAttribute("aria-pressed", String(Number(b.dataset.pick) === mapState.selected)));
      $("#heatBtn").setAttribute("aria-pressed", String(mapState.heat));
      $("#tourBtn").setAttribute("aria-pressed", String(!!tourTimer));
      $("#tourBtn span").textContent = tourTimer ? "Pause tour" : "Tour";
      $("#tourBtn path").setAttribute("d", tourTimer ? "M7 5h4v14H7zM13 5h4v14h-4z" : "M8 5v14l11-7z");
    };
    const stopTour = () => { if (tourTimer) { clearInterval(tourTimer); tourTimer = null; } };
    const setMode = (m) => { stopTour(); mapState.mode = m; if (m === "learn") { mapState.step = 0; mapState.kind = mapState.id = mapState.selected = null; } render(); };
    const setFocus = (kind, id) => {
      if (learn()) setMode("explore");
      if (mapState.kind === kind && mapState.id === id && !mapState.selected) mapState.kind = mapState.id = null;
      else { mapState.kind = kind; mapState.id = id; }
      mapState.selected = null;
      render();
    };
    const select = (n, toggle = true) => {
      if (learn()) mapState.mode = "explore";
      mapState.selected = toggle && mapState.selected === n ? null : n;
      mapState.kind = mapState.id = null;
      render();
    };
    const userSelect = (n) => { stopTour(); select(n); if (window.innerWidth < 980 && mapState.selected) insp.scrollIntoView({ behavior: "smooth", block: "start" }); };

    // clicks on the wheel
    svg.addEventListener("click", (e) => {
      const m = e.target.closest(".marker");
      if (m) return userSelect(Number(m.dataset.n));
      const h = e.target.closest("[data-kind]");
      if (h) { stopTour(); setFocus(h.dataset.kind, h.dataset.id); }
    });
    // keyboard: Enter/Space activate, arrows step through archetypes
    svg.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.target.dispatchEvent(new MouseEvent("click", { bubbles: true })); }
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault(); stopTour();
        const cur = mapState.selected || (e.key === "ArrowRight" ? 0 : 1);
        const next = ((cur - 1 + (e.key === "ArrowRight" ? 1 : -1) + 5) % 5) + 1;
        select(next, false);
      }
    });
    // hover tooltips
    const tipFor = (el) => {
      const m = el.closest(".marker");
      if (m) { const a = byN(m.dataset.n); return `<strong>${a.n}. ${esc(a.name)}</strong><br>${esc(a.tagline)}`; }
      const h = el.closest("[data-kind]");
      if (!h) return null;
      const k = h.dataset.kind, i = h.dataset.id;
      const n = matchArchetypes(k, i).length;
      const count = k === "key" ? "" : `<br><span style="opacity:.75">Related archetypes: ${n}</span>`;
      if (k === "core") return `<strong>${esc(D.CORE.name)}</strong><br>${esc(D.CORE.text)}`;
      if (k === "tech") return `<strong>${esc(D.TECH_RING.name)}</strong><br>Where perspectives and dimensions connect.${count}`;
      if (k === "key") { const x = D.KEYS.find((q) => q.id === i); return `<strong>Key · ${esc(x.name)}</strong><br>${esc(x.text)}`; }
      if (k === "perspective") { const x = persp(i); return `<strong>Perspective · ${esc(x.full)}</strong><br>${esc(x.text)}${count}`; }
      if (k === "dimension") { const x = dim(i); return `<strong>Dimension · ${esc(x.name)}</strong><br>${esc(x.text)}${count}`; }
      return null;
    };
    svg.addEventListener("mousemove", (e) => {
      const html = tipFor(e.target);
      if (!html) { hideTip(); return; }
      showTipAt(e.clientX, e.clientY, html);
    });
    svg.addEventListener("mouseleave", hideTip);

    $$(".seg-ctrl [data-mode]").forEach((b) => b.addEventListener("click", () => setMode(b.dataset.mode)));
    $$(".chip[data-kind]").forEach((c) => c.addEventListener("click", () => { stopTour(); setFocus(c.dataset.kind, c.dataset.id); }));
    $("#dock").addEventListener("click", (e) => { const b = e.target.closest("[data-pick]"); if (b) userSelect(Number(b.dataset.pick)); });
    $("#heatBtn").addEventListener("click", () => { mapState.heat = !mapState.heat; render(); });
    $("#tourBtn").addEventListener("click", () => {
      if (tourTimer) { stopTour(); render(); return; }
      if (learn()) mapState.mode = "explore";
      let n = mapState.selected || 0;
      const tick = () => { n = (n % 5) + 1; select(n, false); };
      tick();
      tourTimer = setInterval(() => { if (!document.body.contains(svg)) { stopTour(); return; } tick(); }, 5200);
      render();
    });
    insp.addEventListener("click", (e) => {
      const p = e.target.closest("[data-pick]");
      if (p) { stopTour(); select(Number(p.dataset.pick), false); return; }
      const g = e.target.closest("[data-go]");
      if (g) { stopTour(); const [k, i] = g.dataset.go.split(":"); setFocus(k, i); return; }
      if (e.target.closest("[data-clear]")) { stopTour(); mapState.kind = mapState.id = mapState.selected = null; render(); }
    });
    learnPanel.addEventListener("click", (e) => {
      const b = e.target.closest("[data-learn]");
      if (b) { mapState.step = Math.max(0, Math.min(D.LEARN.length - 1, mapState.step + Number(b.dataset.learn))); render(); return; }
      const s = e.target.closest("[data-step]");
      if (s) { mapState.step = Number(s.dataset.step); render(); return; }
      if (e.target.closest("[data-mode-go]")) setMode("explore");
    });
    render();
  }

  /* ---------------------------------------------------------------- ARCHETYPE */
  function viewArchetype(n) {
    const a = byN(n);
    if (!a) return viewNotFound();
    const prev = byN(a.n - 1), next = byN(a.n + 1);
    const groups = D.STAKEHOLDERS.map((g) => ({ g, items: g.items.filter((it) => it.a.includes(a.n)) })).filter((x) => x.items.length);

    return `
    <div class="a-hero" style="background:linear-gradient(180deg, color-mix(in srgb, ${a.color} 10%, transparent), transparent)">
      <div class="wrap">
        <nav class="a-tabs" aria-label="Archetypes" style="margin:0 0 28px">
          ${D.ARCHETYPES.map((x) => `<a href="#/archetype/${x.n}" ${x.n === a.n ? 'aria-current="page"' : ""}>${num(x)}<span>${esc(x.name)}</span></a>`).join("")}
        </nav>
        <div class="top">${num(a, "big")}<span class="eyebrow" style="margin:0">Archetype ${a.n} of 5 · ${esc(a.plain)}</span></div>
        <h1>${esc(a.name)}</h1>
        <p class="lede">${esc(a.tagline)}</p>
        <div class="chips" style="margin-top:14px">${a.layers.map(layerBadge).join("")}<span class="chip">${esc(cluster(a.cluster).name)} invisibility</span></div>
        <div class="thread-jump">
          <span class="small muted">Follow it through the labs:</span>
          ${["ifal", "bvdl", "etl"].map((id) => `<a class="lab-tag lab-${id}" href="#/archetype/${a.n}" data-jump="thread-${id}"><span class="nav-dot" aria-hidden="true"></span>${esc(lab(id).verb)}</a>`).join("")}
        </div>
      </div>
    </div>

    <div class="wrap a-body">
      <div class="a-main">
        <section id="thread-ifal">
          <div class="stage-head">${labTag("ifal")}<span class="small muted">Step 1 of the thread: what is missing, and why</span></div>
          <p style="font-size:1.08rem">${esc(a.summary)}${cite(a.refs)}</p>
        </section>

        <section>
          <span class="eyebrow">Failing decisions</span>
          <h2>Decisions affected</h2>
          ${a.failures.map((x) => `<div class="card story" style="border-left-color:${a.color}"><h3>${esc(x.title)}</h3><p>${esc(x.text)}${cite(x.ref)}</p></div>`).join("")}
          ${a.closing ? `<p class="closing">${esc(a.closing)}</p>` : ""}
        </section>

        <section>
          <span class="eyebrow">Priority hidden determinants</span>
          <h2>Determinants not captured</h2>
          <div class="det-grid" id="dets">${a.determinants.map((d) => `<span class="det" style="border-color:${a.color}">${esc(d)}</span>`).join("")}</div>
        </section>

        <section>
          <span class="eyebrow">Mechanism</span>
          <h2>Why it is not captured</h2>
          ${a.layers.map((lid) => { const l = layer(lid); return `<div class="card mech" style="border-left:4px solid ${l.color}">${layerBadge(lid)}<div class="q">${esc(l.question)}</div><p>${esc(a.mechanism[lid])}${cite(a.refs)}</p></div>`; }).join("")}
          <p class="small muted"><a href="#/layers">Learn about all five layers →</a></p>
        </section>

        <section>
          <span class="eyebrow">Affected stakeholders</span>
          <h2>Who is affected</h2>
          <div class="burden">
            ${groups.map(({ g, items }) => `<div class="card"><h4>${esc(g.name)}</h4><ul>${items.map((it) => `<li>${esc(it.name)}</li>`).join("")}</ul></div>`).join("")}
          </div>
        </section>
      </div>

      <aside class="a-side">
        <div class="card side-card">
          <h4>On the ODH Steering Wheel</h4>
          <div id="miniHost">${wheelSVG({ mini: true, selected: a.n })}</div>
          <dl class="kv">
            <dt>Perspective</dt><dd>${a.perspectives.map((p) => `<span class="chip">${esc(persp(p).name)}</span>`).join("")}${a.spillover.map((p) => `<span class="chip">${esc(persp(p).name)} (spillover)</span>`).join("")}</dd>
            <dt>Dimension</dt><dd>${a.dimensions.map((d) => `<span class="chip">${esc(dim(d).name)}</span>`).join("")}</dd>
          </dl>
          <a class="small" href="#/map" data-select="${a.n}">Open in the full map →</a>
        </div>
        <div class="numbers" style="grid-template-columns:1fr">
          ${a.stats.map((s) => s.value == null
            ? `<div class="card stat finding" style="border-left:4px solid ${a.color}"><div class="n" style="margin:0 0 4px">Finding</div><div class="l">${esc(s.label)}${cite(s.ref)}</div></div>`
            : `<div class="card stat"><div class="v" style="color:${a.color}">${esc(s.value)}</div><div class="l">${esc(s.label)}${cite(s.ref)}</div>${s.note ? `<div class="n">${esc(s.note)}</div>` : ""}</div>`).join("")}
        </div>
        <div class="card side-card">
          <details class="evidence">
            <summary>Evidence</summary>
            <ol>${a.refs.map((r) => { const ref = D.REFERENCES[r - 1]; return `<li value="${r}">${esc(ref.text)}${refLink(ref)}</li>`; }).join("")}</ol>
          </details>
        </div>
      </aside>
    </div>

    ${threadHTML(a)}

    <div class="wrap"><nav class="pager" aria-label="Archetype navigation">
      ${prev ? `<a href="#/archetype/${prev.n}"><span class="dir">← Previous</span><span class="t">${prev.n}. ${esc(prev.name)}</span></a>` : `<a href="#/map"><span class="dir">← Back to</span><span class="t">The Map</span></a>`}
      ${next ? `<a class="next" href="#/archetype/${next.n}"><span class="dir">Next →</span><span class="t">${next.n}. ${esc(next.name)}</span></a>` : `<a class="next" href="#/layers"><span class="dir">Next →</span><span class="t">Five layers of invisibility</span></a>`}
    </nav></div>`;
  }

  // Steps 2 to 4 of the archetype thread: BVDL design, ETL translation, shared statement
  function threadHTML(a) {
    const iv = D.INTERVENTIONS[a.n];
    const rows = D.OPPORTUNITY.filter((o) => a.dimensions.includes(o.dim));
    const lower = (s) => s.charAt(0).toLowerCase() + s.slice(1);
    const fill = {
      determinant: esc(joinAnd(a.determinants.slice(0, 3).map(lower))),
      mechanism: esc(`${joinAnd(a.layers.map((l) => lower(layer(l).name)))} invisibility`),
      decisions: esc(D.DECISIONS[a.n]),
      response: esc(`${lower(iv.what)}, within a European ODH approach`)
    };
    return `<section class="thread-sec"><div class="wrap">
      <span class="eyebrow">The thread</span>
      <h2>From diagnosis to European action</h2>
      <p class="lede">What the other two labs propose for this archetype.</p>

      <div class="stage card lab-bvdl" id="thread-bvdl">
        <div class="stage-head">${labTag("bvdl")}<span class="small muted">Step 2: how BMHI could make it visible</span></div>
        <div class="stage-grid">
          <div><h4>Proposed visibility intervention</h4><p class="big-p">${esc(iv.what)}</p></div>
          <div><h4>Expected outcome</h4><p>${esc(iv.outcome)}</p></div>
        </div>
        <h4>Response to each layer involved</h4>
        ${a.layers.map((l) => `<div class="resp-row">${layerBadge(l)}<p>${esc(D.LAYER_RESPONSES[l])}</p></div>`).join("")}
        <a class="small" href="#/bvdl/responses">All BMHI visibility responses →</a>
      </div>

      <div class="stage card lab-etl" id="thread-etl">
        <div class="stage-head">${labTag("etl")}<span class="small muted">Step 3: why it is a European matter</span></div>
        <p>This archetype sits on ${rows.length === 1 ? "one ODH dimension" : `${rows.length} ODH dimensions`}. For each, ETL states what stays invisible and what European action would add.</p>
        ${rows.map((o) => `<div class="eu-row">
          <h4>${esc(dim(o.dim).name)}</h4>
          <dl class="kv eu-kv"><dt>Stays invisible</dt><dd>${esc(o.invisible)}</dd><dt>European added value</dt><dd>${esc(o.value)}</dd><dt>European anchor</dt><dd>${esc(o.anchor)}${cite(o.ref)}</dd></dl>
        </div>`).join("")}
        <a class="small" href="#/etl/opportunity">Open the European Opportunity Matrix →</a>
      </div>

      <div class="stage card" id="thread-statement">
        <div class="stage-head"><span class="eyebrow" style="margin:0">Step 4: the shared problem statement</span></div>
        ${statementHTML(fill)}
        <p class="small muted" style="margin-top:10px">Assembled on this site from the three labs' tables for this archetype. It has not yet been validated by the labs, and ETL's prioritisation criteria have not yet been applied to it.</p>
      </div>
    </div></section>`;
  }

  function bindArchetype(n) {
    const a = byN(n);
    if (!a) return;
    $$("[data-jump]").forEach((j) => j.addEventListener("click", (e) => { e.preventDefault(); $("#" + j.dataset.jump).scrollIntoView({ behavior: "smooth", block: "start" }); }));
    paintWheel($("#miniHost svg"), { selected: a.n });
    const link = $("[data-select]");
    if (link) link.addEventListener("click", () => { mapState.kind = mapState.id = null; mapState.mode = "explore"; mapState.selected = a.n; });
  }

  /* ---------------------------------------------------------------- LAYERS */
  function viewLayers() {
    const layers = D.LAYERS.map((l) => {
      const arch = D.ARCHETYPES.filter((a) => a.layers.includes(l.id));
      return `<div class="card layer">
        <div class="ln" style="background:${l.color}">${l.n}</div>
        <div>
          <h3>${esc(l.name)}</h3>
          <div class="qq">${esc(l.question)}</div>
          <dl><dt>What's missing</dt><dd>${esc(l.missing)}</dd><dt>Consequence at the moment of decision</dt><dd>${esc(l.consequence)}${cite(l.refs)}</dd></dl>
          <div class="chips">${arch.map((a) => archBadge(a.n)).join("")}</div>
        </div>
      </div>`;
    }).join("");

    // the self-reinforcing loop
    const N = D.CHAIN.length, RR = 150;
    let loop = `<svg class="loop" viewBox="-210 -210 420 420" role="img" aria-label="Self-reinforcing cycle: ${D.CHAIN.join(", ")}, and back again">`;
    loop += `<circle class="track" r="${RR}"/><circle class="flow" r="${RR}" transform="rotate(-90)"/>`;
    D.CHAIN.forEach((c, i) => {
      const ang = -90 + (360 / N) * i;
      const x = RR * Math.cos(rad(ang)), y = RR * Math.sin(rad(ang));
      const w = c.length * 7.6 + 24;
      loop += `<g class="node" transform="translate(${f(x)} ${f(y)})"><rect x="${-w / 2}" y="-17" width="${w}" height="34" rx="17"/><text text-anchor="middle" dy="5">${esc(c)}</text></g>`;
    });
    loop += `<text class="centre" text-anchor="middle" y="-6">self-reinforcing</text><text class="centre" text-anchor="middle" y="16">cycle</text></svg>`;

    // coverage grid
    const head = `<tr><th></th>${D.ARCHETYPES.map((a) => `<th><a href="#/archetype/${a.n}" style="text-decoration:none">${num(a)}</a></th>`).join("")}</tr>`;
    const lrows = D.LAYERS.map((l) => `<tr><th>${esc(l.name)}<span class="sub">${esc(l.question)}</span></th>${D.ARCHETYPES.map((a) => {
      const on = a.layers.includes(l.id);
      return on ? `<td class="on" style="background:${l.color}"><a href="#/archetype/${a.n}" aria-label="${esc(a.name)}: ${esc(l.name)}">●</a></td>` : `<td></td>`;
    }).join("")}</tr>`).join("");
    const prows = D.PERSPECTIVES.map((p) => `<tr><th>${esc(p.name)}</th>${D.ARCHETYPES.map((a) => {
      if (a.perspectives.includes(p.id)) return `<td class="on" style="background:${a.color}"><a href="#/archetype/${a.n}" aria-label="${esc(a.name)}: ${esc(p.name)}">●</a></td>`;
      if (a.spillover.includes(p.id)) return `<td class="spill"><a href="#/archetype/${a.n}" aria-label="${esc(a.name)}: ${esc(p.name)} (spillover)">◌</a></td>`;
      return `<td></td>`;
    }).join("")}</tr>`).join("");

    return `
    <div class="wrap page-head">
      <span class="eyebrow">The five layers of invisibility</span>
      <h1>Five layers of invisibility</h1>
      <p class="lede">Each layer describes a different reason why a determinant is not available at the point of decision, and indicates which actor would be in a position to address it. Layers can overlap; the most persistent cases involve more than one.</p>
    </div>
    <section class="section" style="padding-top:24px"><div class="wrap layer-list">${layers}</div></section>

    <section class="section"><div class="wrap loop-wrap">
      ${loop}
      <div>
        <span class="eyebrow">A self-reinforcing cycle</span>
        <h2>How the layers reinforce each other</h2>
        <p class="lede">What is not captured cannot be standardised; what is not standardised cannot be reliably linked; what is not linked is hard to evaluate; and what is not evaluated is unlikely to become a priority. Invisible context is therefore a property of the information ecosystem as a whole, not a collection of isolated missing data points.</p>
      </div>
    </div></section>

    <section class="section"><div class="wrap">
      <span class="eyebrow">Mechanisms across the information lifecycle</span>
      <h2>Four mechanisms of persistence</h2>
      <div class="mech-grid" style="margin-top:20px">
        ${D.MECHANISMS.map((m) => `<div class="card"><h3>${esc(m.name)}</h3><p>${esc(m.text)}${cite(m.ref)}</p><div class="chips">${m.layers.map(layerBadge).join("")}</div></div>`).join("")}
      </div>
    </div></section>

    <section class="section"><div class="wrap">
      <span class="eyebrow">Coverage</span>
      <h2>Coverage of layers and perspectives</h2>
      <p class="lede">The five archetypes were selected so that together they cover all five layers and all three ODH perspectives. Select a cell to open the corresponding archetype.</p>
      <div class="card" style="padding:16px;margin-top:20px">
        <div class="grid-scroll"><table class="cov">
          <thead>${head}</thead>
          <tbody><tr><th colspan="6" class="muted small" style="padding-top:4px">Layer of invisibility</th></tr>${lrows}
          <tr><th colspan="6" class="muted small" style="padding-top:16px">ODH perspective</th></tr>${prows}</tbody>
        </table></div>
        <p class="small muted" style="margin:10px 4px 0">Hatched cell = spillover (Patient Narrative Absence is individual first, with a population spillover).</p>
      </div>
    </div></section>`;
  }

  /* ---------------------------------------------------------------- PEOPLE */
  const peopleState = { group: "patients", arch: null };
  function viewPeople() {
    return `
    <div class="wrap page-head">
      <span class="eyebrow">Distribution of the burden</span>
      <h1>Affected stakeholders</h1>
      <p class="lede">Missing context is not evenly distributed. Identifying who bears its consequences is part of the diagnosis.${cite([2, 4, 5])} Select a group, and optionally an archetype, to see who is affected.</p>
    </div>
    <div class="wrap" style="padding-bottom:56px">
      <div class="tabs" role="tablist">
        ${D.STAKEHOLDERS.map((g) => `<button role="tab" data-g="${g.id}" aria-selected="${g.id === peopleState.group}">${esc(g.name)}</button>`).join("")}
      </div>
      <div class="people-filter">
        <div class="small muted" style="margin-bottom:8px">Highlight by archetype:</div>
        <div class="chips" id="pfilter">${D.ARCHETYPES.map((a) => `<button class="chip" data-a="${a.n}" aria-pressed="false">${dot(a.color)}${a.n}. ${esc(a.name)}</button>`).join("")}</div>
      </div>
      <p class="lede" id="pIntro"></p>
      <div class="people-list" id="plist" role="tabpanel"></div>
    </div>`;
  }
  function bindPeople() {
    const render = () => {
      const g = D.STAKEHOLDERS.find((x) => x.id === peopleState.group);
      $("#pIntro").textContent = g.intro;
      $("#plist").innerHTML = g.items.map((it) => {
        const fade = peopleState.arch && !it.a.includes(peopleState.arch);
        return `<div class="card person${fade ? " fade" : ""}"><div class="pn">${esc(it.name)}</div><div class="badges">${it.a.map(archBadge).join("")}</div></div>`;
      }).join("");
      $$(".tabs [data-g]").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.g === peopleState.group)));
      $$("#pfilter .chip").forEach((c) => c.setAttribute("aria-pressed", String(Number(c.dataset.a) === peopleState.arch)));
    };
    $$(".tabs [data-g]").forEach((b) => b.addEventListener("click", () => { peopleState.group = b.dataset.g; render(); }));
    $$("#pfilter .chip").forEach((c) => c.addEventListener("click", () => { const n = Number(c.dataset.a); peopleState.arch = peopleState.arch === n ? null : n; render(); }));
    render();
  }

  /* ================================================================
     BVDL: BMHI Visibility Design Lab
     ================================================================ */
  function viewBvdl() {
    const L = lab("bvdl");
    return `
    <div class="wrap page-head">
      <span class="eyebrow">Sub-group 2 · ${esc(L.role)}</span>
      <h1>${esc(L.name)}</h1>
      <p class="lede">${esc(L.question)} BVDL turns IFAL's diagnosis into design hypotheses: which data sources, standards and architectures could make hidden determinants visible, and what could go wrong when they do. Its output is the <strong>BMHI Visibility Hypothesis Board</strong>.</p>
    </div>
    <section class="section" style="padding-top:24px"><div class="wrap">
      <span class="eyebrow">What "visible" means</span>
      <h2>Available is not the same as visible</h2>
      <p class="lede">A determinant becomes visible only when it passes through every step below. Visibility therefore needs an end-to-end infrastructure, from data acquisition to action.</p>
      <ol class="vchain">${D.VISIBILITY_CHAIN.map((s, i) => `<li><span class="vc-n">${i + 1}</span><strong>${esc(s.name)}</strong><span class="small muted">${esc(s.text)}</span></li>`).join("")}</ol>
      <p class="closing">The challenge is not the absence of data, but the absence of architectures that turn scattered contextual signals into actionable intelligence.</p>
    </div></section>

    <section class="section"><div class="wrap">
      <span class="eyebrow">Two families of hidden determinants</span>
      <h2>Upstream of the clinical encounter</h2>
      <div class="mech-grid" style="margin-top:20px">
        ${D.DETERMINANT_FAMILIES.map((d) => `<div class="card"><h3>${esc(d.name)}</h3><p>${esc(d.text)}${cite(d.ref)}</p></div>`).join("")}
      </div>
      <p class="lede" style="margin-top:20px">Health institutions, environmental agencies, social services, schools and public-order authorities all hold part of the picture, but traditional health systems rarely integrate their data.${cite([7, 10, 11])}</p>
      <div class="btn-row"><a class="btn" href="#/bvdl/infrastructure">Explore the data infrastructure →</a></div>
    </div></section>

    <section class="section"><div class="wrap">
      <span class="eyebrow">Technical implementation of ODH</span>
      <h2>Three kinds of interoperability</h2>
      <p class="lede">If any one of them fails, invisibility returns, even when data capture works.</p>
      <div class="mech-grid" style="margin-top:20px">
        ${D.INTEROPERABILITY.map((x) => `<div class="card"><span class="eyebrow" style="margin-bottom:4px">${esc(x.gist)}</span><h3>${esc(x.name)}</h3><p>${esc(x.text)}${cite(x.ref)}</p></div>`).join("")}
      </div>
      <h3 style="margin-top:32px">Prerequisites for a system-wide implementation</h3>
      <div class="mech-grid">
        ${D.PREREQUISITES.map((x, i) => `<div class="card prereq"><span class="ph-n">${i + 1}</span><h3>${esc(x.name)}</h3><p>${esc(x.text)}</p></div>`).join("")}
      </div>
      <div class="callout lab-bvdl" style="margin-top:24px"><p>${esc(D.IMPLEMENTATION_KEY)}</p></div>
      <p class="small muted" style="margin-top:12px">Reusable, machine-readable specifications such as the WHO SMART Guidelines can help implementation across heterogeneous systems.${cite([21, 22])}</p>
    </div></section>`;
  }

  // Figure 1: determinant families → data sources → capture instruments → analysis
  const infraState = { det: null, src: null };
  function viewInfrastructure() {
    const A = D.ARCHITECTURE;
    return `
    <div class="wrap page-head">
      <span class="eyebrow">BVDL · Figure 1 and Table 3</span>
      <h1>The data infrastructure matrix</h1>
      <p class="lede">${"Where could hidden determinants be captured? The Hypothesis Board links the two families of determinants to the actors that hold data about them, the instruments that capture it, and the analytical processes that turn it into intelligence, all following the FAIR principles."}${cite(2)} Select a determinant family or a data source to see how they connect.</p>
    </div>
    <div class="wrap" style="padding-bottom:56px">
      <div class="board card">
        <div class="board-col">
          <h4>1 · Hidden determinants</h4>
          ${D.DETERMINANT_FAMILIES.map((d) => `<button class="node det-node" data-det="${d.id}" aria-pressed="false"><strong>${esc(d.name)}</strong></button>`).join("")}
          <p class="small muted" id="infraNote" aria-live="polite">Each source holds data on one or both families.</p>
        </div>
        <div class="board-col">
          <h4>2 · Possible data sources</h4>
          ${D.SOURCES.map((s) => `<button class="node src-node" data-src="${s.id}" aria-pressed="false"><strong>${esc(s.name)}</strong><span class="node-items">${s.items.map(esc).join(" · ")}</span></button>`).join("")}
        </div>
        <div class="board-col">
          <h4>3 · Data capture instruments</h4>
          ${D.INSTRUMENTS.map((x) => `<div class="node inst-node"><strong>${esc(x.name)}</strong><span class="node-items">${x.items.map(esc).join(" · ")}</span></div>`).join("")}
        </div>
      </div>
      <div class="board-flow" aria-hidden="true"><span>↓</span></div>
      <div class="board card board-bottom">
        <div><h4>Prerequisites</h4>${list(A.prerequisites)}</div>
        <div><h4>Human-led analysis</h4>${list(A.human)}</div>
        <div><h4>AI processes</h4>${list(A.ai)}</div>
        <div class="board-out"><h4>Result</h4><p>Visible, actionable contextual intelligence for individual, population and ecosystem health</p></div>
      </div>
      <p class="small muted" style="margin-top:12px">Redrawn from the BMHI Visibility Hypothesis Board (v1.0), Figure 1 of the shared document. Links between determinant families and sources follow the figure; IS = information system.</p>

      <div class="callout lab-bvdl" style="margin-top:28px">
        <h3>The trade-off in capture</h3>
        <p>${esc(D.LAYER_NOTES[0].text)}</p>
      </div>
    </div>`;
  }
  function bindInfrastructure() {
    const render = () => {
      const { det, src } = infraState;
      const srcDef = src && D.SOURCES.find((s) => s.id === src);
      $$(".det-node").forEach((b) => {
        const on = det === b.dataset.det || (srcDef && srcDef.det.includes(b.dataset.det));
        b.setAttribute("aria-pressed", String(det === b.dataset.det));
        b.classList.toggle("lit", !!on);
        b.classList.toggle("dim", !!(det || src) && !on);
      });
      $$(".src-node").forEach((b) => {
        const s = D.SOURCES.find((x) => x.id === b.dataset.src);
        const on = src === s.id || (det && s.det.includes(det));
        b.setAttribute("aria-pressed", String(src === s.id));
        b.classList.toggle("lit", !!on);
        b.classList.toggle("dim", !!(det || src) && !on);
      });
      const note = $("#infraNote");
      if (det) { const n = D.SOURCES.filter((s) => s.det.includes(det)).length; note.textContent = `${n} of ${D.SOURCES.length} source groups hold data on ${D.DETERMINANT_FAMILIES.find((d) => d.id === det).name.toLowerCase()}.`; }
      else if (srcDef) note.textContent = `${srcDef.name} relate to ${joinAnd(srcDef.det.map((d) => D.DETERMINANT_FAMILIES.find((x) => x.id === d).name.toLowerCase()))}.`;
      else note.textContent = "Each source holds data on one or both families.";
    };
    $$(".det-node").forEach((b) => b.addEventListener("click", () => { infraState.det = infraState.det === b.dataset.det ? null : b.dataset.det; infraState.src = null; render(); }));
    $$(".src-node").forEach((b) => b.addEventListener("click", () => { infraState.src = infraState.src === b.dataset.src ? null : b.dataset.src; infraState.det = null; render(); }));
    render();
  }

  function viewResponses() {
    return `
    <div class="wrap page-head">
      <span class="eyebrow">BVDL · Tables 4 and 5</span>
      <h1>From diagnosis to visibility design</h1>
      <p class="lede">Each layer of invisibility names a different failure, so each needs a different BMHI response. The archetypes then need more specific, implementable interventions.</p>
    </div>
    <section class="section" style="padding-top:24px"><div class="wrap">
      <span class="eyebrow">Table 4 · one response per layer</span>
      <h2>What is missing, and what BMHI could do</h2>
      <div class="resp-list">
        ${D.LAYERS.map((l) => `<div class="card resp" style="--c:${l.color}">
          <div class="resp-side"><span class="ln-s" style="background:${l.color}">${l.n}</span><div><h3>${esc(l.name)}</h3><p class="small muted" style="margin:0">${esc(l.question)}</p></div></div>
          <div class="resp-from"><span class="lab-mini lab-ifal">IFAL · missing</span><p>${esc(l.missing)}</p></div>
          <div class="resp-arrow" aria-hidden="true">→</div>
          <div class="resp-to"><span class="lab-mini lab-bvdl">BVDL · response</span><p>${esc(D.LAYER_RESPONSES[l.id])}</p></div>
        </div>`).join("")}
      </div>
      <div class="callout lab-bvdl" style="margin-top:24px">
        <h3>${esc(D.LAYER_NOTES[1].title)}</h3>
        <p>${esc(D.LAYER_NOTES[1].text)}${cite(D.LAYER_NOTES[1].ref)}</p>
      </div>
    </div></section>

    <section class="section"><div class="wrap">
      <span class="eyebrow">Table 5 · one intervention per archetype</span>
      <h2>Visibility interventions for the five archetypes</h2>
      <div class="arch-grid" style="margin-top:20px">
        ${D.ARCHETYPES.map((a) => { const iv = D.INTERVENTIONS[a.n]; return `<a class="card arch-card" href="#/archetype/${a.n}" style="border-top-color:${a.color}">
          <div style="display:flex;gap:10px;align-items:center">${num(a)}<span class="plain">${esc(a.name)}</span></div>
          <h3 style="font-size:1.05rem">${esc(iv.what)}</h3>
          <p><strong>Expected outcome:</strong> ${esc(iv.outcome)}</p>
          <span class="small" style="margin-top:auto">Follow the thread →</span>
        </a>`; }).join("")}
      </div>
      <p class="small muted" style="margin-top:14px">These interventions depend on interoperable architectures that keep meaning, provenance, quality and trust across organisational and sector boundaries.</p>
    </div></section>`;
  }

  // ODHness: three digitalities as overlapping circles
  const odhState = { pick: null };
  function viewOdhness() {
    const O = D.ODHNESS;
    const C = [["humanities", 0, -52, "#C2410C"], ["animalities", -58, 44, "#0F766E"], ["environmentalities", 58, 44, "#4D7C0F"]];
    const venn = `<svg class="venn" viewBox="-190 -170 380 330" role="group" aria-label="Three digitalities overlapping in ODHness">
      ${C.map(([id, x, y, col]) => { const d = O.digitalities.find((q) => q.id === id); return `<g class="vc" data-pick="${id}" tabindex="0" role="button" aria-label="${esc(d.name)}"><circle cx="${x}" cy="${y}" r="98" fill="${col}"/><text x="${x * 1.55}" y="${y * 1.6 + 5}" text-anchor="middle">${esc(d.domain)}</text></g>`; }).join("")}
      <text class="venn-core" x="0" y="10" text-anchor="middle">ODHness</text>
    </svg>`;
    return `
    <div class="wrap page-head">
      <span class="eyebrow">BVDL · section 2.1.4</span>
      <h1>ODHness as a visibility metric</h1>
      <p class="lede">${esc(O.definition)}</p>
    </div>
    <div class="wrap split" style="padding-bottom:40px;align-items:start">
      <div class="card venn-box">${venn}<p class="hint small muted">Select a circle.</p></div>
      <div id="odhPanel" aria-live="polite"></div>
    </div>
    <section class="section"><div class="wrap">
      <div class="mech-grid">${O.digitalities.map((d) => `<div class="card"><span class="eyebrow" style="margin-bottom:4px">${esc(d.domain)}</span><h3>${esc(d.name)}</h3><p>${esc(d.text)}${cite(d.ref)}</p></div>`).join("")}</div>
      <div class="callout lab-bvdl" style="margin-top:24px"><p>${esc(O.governance)}${cite([31, 32])}</p></div>
    </div></section>`;
  }
  function bindOdhness() {
    const O = D.ODHNESS;
    const render = () => {
      const d = O.digitalities.find((x) => x.id === odhState.pick);
      $$(".venn .vc").forEach((g) => { g.classList.toggle("on", g.dataset.pick === odhState.pick); g.classList.toggle("off", !!odhState.pick && g.dataset.pick !== odhState.pick); });
      $("#odhPanel").innerHTML = d
        ? `<span class="eyebrow">${esc(d.domain)} domain</span><h2>${esc(d.name)}</h2><p class="lede">${esc(d.text)}${cite(d.ref)}</p><button class="clear-btn" data-clear>Show all three</button>`
        : `<span class="eyebrow">The idea</span><h2>Three digitalities, one ecosystem</h2><p class="lede">Together, digital humanities, animalities and environmentalities put the One Health principle into practice in a connected world: human, animal and environmental health are parts of one socio-ecological system. The more an ecosystem integrates all three through interoperable data, technology and governance, the higher its ODHness.${cite([2, 8])}</p>`;
    };
    const pick = (id) => { odhState.pick = odhState.pick === id ? null : id; render(); };
    $$(".venn .vc").forEach((g) => {
      g.addEventListener("click", () => pick(g.dataset.pick));
      g.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(g.dataset.pick); } });
    });
    $("#odhPanel").addEventListener("click", (e) => { if (e.target.closest("[data-clear]")) { odhState.pick = null; render(); } });
    render();
  }

  const issueState = { id: "privacy" };
  function viewIssues() {
    return `
    <div class="wrap page-head">
      <span class="eyebrow">BVDL · sections 2.2 and 2.3</span>
      <h1>Implementation issues, turned into research</h1>
      <p class="lede">Making context visible creates its own problems. BVDL treats each one as a researchable question, with a study design and the partners it would need.</p>
      <div class="callout lab-bvdl"><p><strong>Working hypothesis.</strong> ${esc(D.HYPOTHESIS)}</p></div>
    </div>
    <div class="wrap" style="padding-top:24px;padding-bottom:56px">
      <div class="tabs" role="tablist">${D.ISSUES.map((x) => `<button role="tab" data-issue="${x.id}" aria-selected="${x.id === issueState.id}">${esc(x.name)}</button>`).join("")}</div>
      <div id="issuePanel" role="tabpanel" aria-live="polite"></div>
    </div>`;
  }
  function bindIssues() {
    const render = () => {
      const x = D.ISSUES.find((i) => i.id === issueState.id), r = x.research;
      $$("[data-issue]").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.issue === x.id)));
      $("#issuePanel").innerHTML = `
        <div class="issue-grid">
          <div class="card issue-card">
            <span class="eyebrow">The issue</span>
            <h2>${esc(x.name)}</h2>
            <p>${esc(x.issue)}${cite(x.ref)}</p>
            ${x.safeguards ? `<h4>Possible safeguards</h4>${chipList(x.safeguards)}` : ""}
            ${x.table ? `<h4>Who is responsible for what (Table 6)</h4><dl class="resp-table">${x.table.map((t) => `<dt>${esc(t.who)}</dt><dd>${esc(t.what)}</dd>`).join("")}</dl><p class="small muted">Distributed responsibility should not become fragmented accountability.</p>` : ""}
          </div>
          <div class="card issue-card research lab-bvdl">
            <span class="eyebrow">Turned into research</span>
            <h2>${esc(r.title)}</h2>
            <p><strong>Problem.</strong> ${esc(r.problem)}</p>
            <p class="rq">${esc(r.question)}</p>
            <p><strong>Study concept.</strong> ${esc(r.design)}</p>
            <h4>Invisible determinants it would look at</h4>${chipList(r.determinants)}
            <h4>Partners and data sources</h4>${chipList(r.partners)}
          </div>
        </div>`;
    };
    $$("[data-issue]").forEach((b) => b.addEventListener("click", () => { issueState.id = b.dataset.issue; render(); }));
    render();
  }

  /* ================================================================
     ETL: European Translation Lab
     ================================================================ */
  function viewEtl() {
    const L = lab("etl");
    return `
    <div class="wrap page-head">
      <span class="eyebrow">Sub-group 3 · ${esc(L.role)}</span>
      <h1>${esc(L.name)}</h1>
      <p class="lede">${esc(L.question)} ETL argues that Invisible Context is not a local shortfall but a structural feature of European health systems, measurable, shared and cross-border, and it maps the European routes to act on it.</p>
    </div>
    <section class="section" style="padding-top:24px"><div class="wrap">
      <span class="eyebrow">It is measurable</span>
      <h2>A structural gap, reproduced across Europe</h2>
      <div class="numbers" style="margin-top:20px">${D.MEASURES.map((m) => `<div class="card stat"><div class="v">${esc(m.value)}</div><div class="l">${esc(m.label)}${cite(m.ref)}</div></div>`).join("")}</div>
    </div></section>

    <section class="section"><div class="wrap split" style="align-items:start">
      <div>
        <span class="eyebrow">Why Europe</span>
        <h2>European by nature</h2>
        ${D.WHY_EUROPE.map((w) => `<div class="card why"><h3>${esc(w.title)}</h3><p>${esc(w.text)}${cite(w.ref)}</p></div>`).join("")}
      </div>
      <div>
        <span class="eyebrow">Why now</span>
        <h2>A window that is open now</h2>
        ${D.WHY_NOW.map((w) => `<div class="card why"><h3>${esc(w.title)}</h3><p>${esc(w.text)}${cite(w.ref)}</p></div>`).join("")}
      </div>
    </div></section>

    <section class="section"><div class="wrap">
      <span class="eyebrow">The LEAD lens · Table 7</span>
      <h2>From data to wisdom: where the capital is missing</h2>
      <p class="lede">The LEAD framework reads informatics as turning data into knowledge and, ultimately, wisdom, sustained by information intellectual capital and mediated by language, education and leadership. Invisible Context is a deficit in each form of capital.</p>
      <div class="capitals">${D.CAPITALS.map((c) => `<div class="card"><h3>${esc(c.name)}</h3><p class="muted" style="margin:0">${esc(c.deficit)}</p></div>`).join("")}</div>
      <ol class="ladder">
        ${D.KEYWORDS.map((k) => `<li class="card">
          <div class="rung"><h3>${esc(k.step)}</h3>${k.capital ? `<span class="chip">${esc(k.capital)}</span>` : ""}</div>
          <div><h4>In ETL's argument</h4><p>${esc(k.where)}</p></div>
          <div><h4>European contribution</h4><p>${esc(k.europe)}${cite(k.ref)}</p></div>
        </li>`).join("")}
      </ol>
    </div></section>`;
  }

  // Figure 2 / Table 8: European Opportunity Matrix
  const oppState = { dim: "environment" };
  function viewOpportunity() {
    const cols = D.LAYERS;
    const rows = D.OPPORTUNITY.map((o) => `<tr data-dim="${o.dim}" tabindex="0" aria-selected="false">
      <th>${esc(dim(o.dim).name)}</th>
      ${cols.map((l) => o.layers.includes(l.id) ? `<td class="on" style="background:${l.color}" title="${esc(l.name)}">${l.n}</td>` : `<td></td>`).join("")}
    </tr>`).join("");
    return `
    <div class="wrap page-head">
      <span class="eyebrow">ETL · Figure 2 and Table 8</span>
      <h1>The European Opportunity Matrix</h1>
      <p class="lede">The matrix reads from left to right: from the Grand Challenge, through the layers of invisibility and the ODH dimensions, to why Europe should act, what it would gain, and how. It is a first exploratory framework, not a final solution.</p>
    </div>
    <div class="wrap">
      <ol class="flow7">${D.MATRIX_FLOW.map((c, i) => `<li class="card"><span class="ph-n">${i + 1}</span><h3>${esc(c.title)}</h3>${list(c.items)}</li>`).join("")}</ol>
    </div>
    <section class="section"><div class="wrap">
      <span class="eyebrow">Dimensions × layers</span>
      <h2>Where each ODH dimension is invisible</h2>
      <p class="lede">Select a dimension to see what stays invisible, why European action adds value, and which European instrument it can build on.</p>
      <div class="opp-layout">
        <div class="card" style="padding:16px">
          <div class="grid-scroll"><table class="cov opp">
            <thead><tr><th></th>${cols.map((l) => `<th title="${esc(l.name)}"><span class="ln-s" style="background:${l.color}">${l.n}</span><span class="sub">${esc(l.name)}</span></th>`).join("")}</tr></thead>
            <tbody>${rows}</tbody>
          </table></div>
          <div id="oppWheel" class="opp-wheel">${wheelSVG({ mini: true })}</div>
          <p class="small muted" style="margin:6px 4px 0">The wheel highlights the dimension and the IFAL archetypes that sit on it.</p>
        </div>
        <div class="card panel" id="oppPanel" aria-live="polite"></div>
      </div>
    </div></section>`;
  }
  function bindOpportunity() {
    const render = () => {
      const o = D.OPPORTUNITY.find((x) => x.dim === oppState.dim);
      $$("table.opp tr[data-dim]").forEach((tr) => tr.setAttribute("aria-selected", String(tr.dataset.dim === o.dim)));
      paintWheel($("#oppWheel svg"), { kind: "dimension", id: o.dim });
      const arch = matchArchetypes("dimension", o.dim);
      $("#oppPanel").innerHTML = `
        <span class="eyebrow">ODH dimension</span>
        <h2>${esc(dim(o.dim).name)}</h2>
        <div class="chips" style="margin-bottom:14px">${o.layers.map(layerBadge).join("")}</div>
        <dl class="opp-dl"><dt>What stays invisible</dt><dd>${esc(o.invisible)}</dd>
        <dt>European added value</dt><dd>${esc(o.value)}</dd>
        <dt>European anchor</dt><dd>${esc(o.anchor)}${cite(o.ref)}</dd></dl>
        <h4 class="small muted" style="margin:16px 0 8px">IFAL archetypes on this dimension</h4>
        <div class="chips">${arch.length ? arch.map(archBadge).join("") : '<span class="small muted">None</span>'}</div>`;
    };
    const pick = (d) => { oppState.dim = d; render(); };
    $$("table.opp tr[data-dim]").forEach((tr) => {
      tr.addEventListener("click", () => pick(tr.dataset.dim));
      tr.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(tr.dataset.dim); } });
    });
    render();
  }

  function viewGates() {
    const GI = D.GATE_IN, GO = D.GATE_OUT;
    return `
    <div class="wrap page-head">
      <span class="eyebrow">ETL · section 3.4</span>
      <h1>ETL's two gates</h1>
      <p class="lede">ETL connects the cohort's loop: it receives one question from BVDL and passes another to IFAL.</p>
    </div>
    <section class="section" style="padding-top:24px"><div class="wrap">
      <div class="gate-head">${labTag("bvdl")}<span class="gate-arrow" aria-hidden="true">→</span>${labTag("etl")}</div>
      <h2>"${esc(GI.question)}"</h2>
      <p class="lede">ETL asks itself six questions from the European side, and names what it needs from BVDL for each.</p>
      <div class="gate-list">
        ${GI.rows.map((r, i) => `<details class="card gate"${i === 0 ? " open" : ""}><summary><span class="ph-n">${i + 1}</span>${esc(r.q)}</summary>
          <div class="gate-body"><div><h4>ETL's European reading</h4><p>${esc(r.etl)}${cite(r.ref)}</p></div><div><h4>Input from BVDL</h4><p>${esc(r.bvdl)}</p></div></div></details>`).join("")}
      </div>
    </div></section>
    <section class="section"><div class="wrap">
      <div class="gate-head">${labTag("etl")}<span class="gate-arrow" aria-hidden="true">→</span>${labTag("ifal")}</div>
      <h2>"${esc(GO.question)}"</h2>
      <p class="lede">${esc(GO.intro)}</p>
      <div class="crit-grid">
        ${GO.criteria.map((c) => `<div class="card crit"><h3>${esc(c.name)}</h3><p class="rq">${esc(c.q)}</p><p class="small muted" style="margin:0"><strong>Evidence:</strong> ${esc(c.evidence)}${cite(c.ref)}</p></div>`).join("")}
      </div>
      <p class="small muted" style="margin-top:12px">These criteria have not yet been applied to the five archetypes; that is the task of IFAL's next iteration.</p>
    </div></section>
    <section class="section"><div class="wrap split" style="align-items:start">
      <div><span class="eyebrow">Open questions</span><h3>ETL asks IFAL</h3>${list(D.OPEN_QUESTIONS.ifal, "qlist")}</div>
      <div><span class="eyebrow">&nbsp;</span><h3>ETL asks BVDL</h3>${list(D.OPEN_QUESTIONS.bvdl, "qlist")}</div>
    </div></section>`;
  }

  const pathState = { focus: "both" };
  function viewPathways() {
    const F = D.FUNDING;
    return `
    <div class="wrap page-head">
      <span class="eyebrow">ETL · section 3.5 and Table 11</span>
      <h1>European pathways</h1>
      <p class="lede">${esc(F.intro)}${cite(F.ref)}</p>
    </div>
    <div class="wrap" style="padding-bottom:24px">
      <div class="seg-ctrl" role="tablist" aria-label="Compare instruments">
        <button role="tab" data-focus="both" aria-selected="true">Compare both</button>
        <button role="tab" data-focus="cost" aria-selected="false">COST Action</button>
        <button role="tab" data-focus="erasmus" aria-selected="false">Erasmus+</button>
      </div>
      <div class="card compare" id="compare" data-focus="both">
        <div class="cmp-row cmp-head"><div></div><div class="c-cost">COST Action</div><div class="c-erasmus">Erasmus+ Cooperation Partnership</div></div>
        ${F.rows.map((r) => `<div class="cmp-row"><div class="cmp-k">${esc(r.k)}</div><div class="c-cost">${esc(r.cost)}</div><div class="c-erasmus">${esc(r.erasmus)}</div></div>`).join("")}
      </div>
    </div>
    <section class="section"><div class="wrap">
      <span class="eyebrow">ETL's slot in the shared problem statement</span>
      <h2>A European ODH approach</h2>
      <p class="lede">ETL provisionally proposes the last slot of the cohort's shared statement: five pillars that a European initiative would combine.</p>
      <ol class="pillars">${D.STATEMENT.pillars.map((p, i) => `<li class="card"><span class="ph-n">${i + 1}</span>${esc(p)}</li>`).join("")}</ol>
      ${statementHTML({ response: esc(D.STATEMENT.response.charAt(0).toLowerCase() + D.STATEMENT.response.slice(1)) })}
    </div></section>`;
  }
  function bindPathways() {
    $$("[data-focus]").forEach((b) => b.addEventListener("click", () => {
      pathState.focus = b.dataset.focus;
      $("#compare").dataset.focus = pathState.focus;
      $$("[data-focus]").forEach((x) => x.setAttribute("aria-selected", String(x.dataset.focus === pathState.focus)));
    }));
    $("#compare").dataset.focus = pathState.focus;
    $$("button[data-focus]").forEach((x) => x.setAttribute("aria-selected", String(x.dataset.focus === pathState.focus)));
  }

  /* ---------------------------------------------------------------- GLOSSARY */
  function viewGlossary() {
    // "Full name: definition" entries show the full name next to the term
    const item = (t) => {
      const [head, ...rest] = D.GLOSSARY[t].split(": ");
      const full = rest.length && head !== t ? head : "";
      return `<div class="card g-item"><dt>${esc(t)}${full ? `<span class="muted"> · ${esc(full)}</span>` : ""}</dt><dd>${esc(rest.length ? rest.join(": ") : D.GLOSSARY[t])}</dd></div>`;
    };
    return `
    <div class="wrap page-head">
      <span class="eyebrow">Glossary</span>
      <h1>Terms used across the three labs</h1>
      <p class="lede">The cohort comes from engineering and clinical backgrounds, in practice and in academia. These are the terms that most often need translating between them. Elsewhere on the site, the first time a term appears on a page it is dotted: hover or tap it to see its definition.</p>
      <nav class="g-jump" aria-label="Glossary topics">${D.GLOSSARY_GROUPS.map((g, i) => `<button class="chip" data-gjump="g-${i}">${esc(g.name)} <span class="muted">${g.terms.length}</span></button>`).join("")}</nav>
    </div>
    <div class="wrap" style="padding-bottom:56px">
      ${D.GLOSSARY_GROUPS.map((g, i) => `<section class="g-group" id="g-${i}"><h2>${esc(g.name)}</h2><dl class="glossary">${g.terms.map(item).join("")}</dl></section>`).join("")}
    </div>`;
  }
  function bindGlossary() {
    $$("[data-gjump]").forEach((b) => b.addEventListener("click", () => $("#" + b.dataset.gjump).scrollIntoView({ behavior: "smooth", block: "start" })));
  }


  /* ---------------------------------------------------------------- ABOUT */
  function viewAbout() {
    return `
    <div class="wrap page-head">
      <span class="eyebrow">About this site</span>
      <h1>The cohort, sources and method</h1>
    </div>
    <div class="wrap" style="padding-bottom:56px">
      <div class="prose">
        <p class="lede">${"This site presents The Grand Challenge, the shared work of the EFMI LEAD cohort: an exploration, within One Digital Health, of the hidden determinants that remain unseen, unshared or unusable in BMHI systems. It is an educational companion to the cohort's document, written so that engineers and clinicians, practitioners and academics can follow it."}</p>
      </div>
      <h2 style="margin-top:32px">The cohort</h2>
      <div class="labs">
        ${D.LABS.map((l) => `<div class="card lab-${l.id} lab-about"><span class="eyebrow" style="margin-bottom:4px">Sub-group ${l.n} · ${esc(l.verb)}</span><h4>${esc(l.name)} (${esc(l.short)})</h4><p class="small muted">${esc(l.question)}</p>${list(l.members, "members")}${l.thanks ? `<p class="small muted" style="margin:0">With special thanks to ${l.thanks.map(esc).join(", ")}</p>` : ""}</div>`).join("")}
      </div>
      <div class="prose">
        <p>${esc(D.ACKNOWLEDGEMENTS.text)}</p>
        <p>${"LEAD (EducationaL EFMI Assembly Designed for BMHI) was established by the Young EFMI Workgroup (yEFMI) of the European Federation for Medical Informatics in October 2025, at the EFMI Special Topic Conference in Osnabrück. The Grand Challenge was set at MIE 2026 in Genova."}</p>
        <h2>Method in brief</h2>
        <p><strong>IFAL</strong> anchors the map on decisions: a determinant counts as invisible only in relation to a decision it should have informed. Five archetypes were selected so that together they span all five layers and all three ODH perspectives, grounded in six seed publications.${cite([1, 2, 3, 4, 5, 6])}</p>
        <p><strong>BVDL</strong> translates each layer and archetype into BMHI responses, maps data sources and capture instruments, and turns implementation issues into research questions.</p>
        <p><strong>ETL</strong> tests the European relevance of the problem against the ODH dimensions, European legislation and funding instruments, and proposes prioritisation criteria for the next iteration.</p>
        <p class="small muted">The patient record on the home page is an illustrative example that combines decision failures described in the map; it is not a real case. Figures are reported as given in the cited sources; the provider-documentation figures come from a single-centre survey of 201 providers.${cite(4)} The problem statements on the archetype pages are assembled on this site from the labs' tables and have not been validated by the labs. Text has been condensed from the document into a plain register.</p>
        <h2 id="refs">References</h2>
        <ol class="refs">${D.REFERENCES.map((r) => `<li id="ref-${r.n}">${esc(r.text)}${refLink(r)}</li>`).join("")}</ol>
      </div>
    </div>`;
  }

  function viewNotFound() {
    return `<div class="wrap page-head" style="padding-bottom:80px"><h1>Page not found</h1><p class="lede">This address does not correspond to any page.</p><a class="btn" href="#/">Back to the home page</a></div>`;
  }

  /* ================================================================
     Router
     ================================================================ */
  // lab: the lab section a page belongs to (adds its strip and highlights its nav item)
  const routes = [
    { re: /^\/?$/, name: "home", view: viewHome, bind: bindHome, title: "" },
    { re: /^\/challenge$/, name: "challenge", view: viewChallenge, bind: null, title: "The Grand Challenge" },
    { re: /^\/ifal$/, name: "ifal", lab: "ifal", view: viewIfal, bind: null, title: "Invisible Failure Analysis Lab" },
    { re: /^\/map$/, name: "map", lab: "ifal", view: viewMap, bind: bindMap, title: "The Map" },
    { re: /^\/archetype\/(\d)$/, name: "archetype", lab: "ifal", view: (m) => viewArchetype(m[1]), bind: (m) => bindArchetype(m[1]), title: (m) => (byN(m[1]) || {}).name },
    { re: /^\/layers$/, name: "layers", lab: "ifal", view: viewLayers, bind: null, title: "Five layers of invisibility" },
    { re: /^\/people$/, name: "people", lab: "ifal", view: viewPeople, bind: bindPeople, title: "Affected stakeholders" },
    { re: /^\/bvdl$/, name: "bvdl", lab: "bvdl", view: viewBvdl, bind: null, title: "BMHI Visibility Design Lab" },
    { re: /^\/bvdl\/infrastructure$/, name: "infrastructure", lab: "bvdl", view: viewInfrastructure, bind: bindInfrastructure, title: "Data infrastructure" },
    { re: /^\/bvdl\/responses$/, name: "responses", lab: "bvdl", view: viewResponses, bind: null, title: "Visibility responses" },
    { re: /^\/bvdl\/odhness$/, name: "odhness", lab: "bvdl", view: viewOdhness, bind: bindOdhness, title: "ODHness" },
    { re: /^\/bvdl\/issues$/, name: "issues", lab: "bvdl", view: viewIssues, bind: bindIssues, title: "Issues and research" },
    { re: /^\/etl$/, name: "etl", lab: "etl", view: viewEtl, bind: null, title: "European Translation Lab" },
    { re: /^\/etl\/opportunity$/, name: "opportunity", lab: "etl", view: viewOpportunity, bind: bindOpportunity, title: "European Opportunity Matrix" },
    { re: /^\/etl\/gates$/, name: "gates", lab: "etl", view: viewGates, bind: null, title: "Two gates" },
    { re: /^\/etl\/pathways$/, name: "pathways", lab: "etl", view: viewPathways, bind: bindPathways, title: "European pathways" },
    { re: /^\/glossary$/, name: "glossary", view: viewGlossary, bind: bindGlossary, title: "Glossary" },
    { re: /^\/about$/, name: "about", view: viewAbout, bind: null, title: "About" }
  ];

  // Pages visited in this session, so Back can name the previous page and
  // return to where the reader was on it: [{ hash, title, y }]
  const trail = [];
  function track(hash) {
    const top = trail[trail.length - 1], prev = trail[trail.length - 2];
    if (top && top.hash === hash) return window.scrollY;          // re-render (e.g. theme toggle)
    if (prev && prev.hash === hash) { trail.pop(); return prev.y; } // went back
    if (top) top.y = window.scrollY;
    trail.push({ hash, title: "", y: 0 });
    return 0;
  }
  function updateBack() {
    const prev = trail[trail.length - 2], btn = $("#backBtn");
    btn.hidden = !prev;
    if (prev) { btn.title = `Back to ${prev.title}`; btn.setAttribute("aria-label", `Back to ${prev.title}`); }
  }

  function router() {
    const path = (location.hash || "#/").slice(1);
    const y = track("#" + path);
    let route = null, m = null;
    for (const r of routes) { m = path.match(r.re); if (m) { route = r; break; } }
    if (!route) { main.innerHTML = viewNotFound(); setActive(""); trail[trail.length - 1].title = "Page not found"; updateBack(); return; }
    const body = route.view(m);
    main.innerHTML = `<div class="view-enter${route.lab ? ` in-lab lab-${route.lab}` : ""}">${route.lab ? labStrip(route.lab, route.name) : ""}${body}</div>`;
    if (route.bind) route.bind(m);
    setActive(route.lab || route.name);
    const t = typeof route.title === "function" ? route.title(m) : route.title;
    document.title = t ? `${t} · (In)Visible Health` : "(In)Visible Health";
    trail[trail.length - 1].title = t || "Home";
    updateBack();
    window.scrollTo({ top: y, behavior: "instant" });
    $("#nav").classList.remove("open");
    $("#menuBtn").setAttribute("aria-expanded", "false");
  }
  function setActive(name) {
    $$(".nav a").forEach((a) => a.classList.toggle("active", a.dataset.route === name));
  }

  /* ================================================================
     Global UI: menu, theme, glossary tooltips, citation links
     ================================================================ */
  $("#menuBtn").addEventListener("click", () => {
    const open = $("#nav").classList.toggle("open");
    $("#menuBtn").setAttribute("aria-expanded", String(open));
  });

  $("#themeBtn").addEventListener("click", () => {
    const next = isDark() ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try { localStorage.setItem("ifal-theme", next); } catch (e) {}
    router(); // re-render so SVG fills pick up the theme
  });
  if (window.matchMedia) {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => { if (!document.documentElement.getAttribute("data-theme")) router(); };
    if (mq.addEventListener) mq.addEventListener("change", onChange);
  }

  const tip = $("#tip");
  const showTip = (el) => {
    tip.textContent = D.GLOSSARY[el.dataset.gloss];
    tip.hidden = false;
    const r = el.getBoundingClientRect();
    const w = Math.min(280, window.innerWidth - 32);
    tip.style.maxWidth = w + "px";
    let left = Math.max(16, Math.min(r.left, window.innerWidth - w - 16));
    tip.style.left = left + "px";
    const below = r.bottom + 8;
    tip.style.top = below + "px";
    const th = tip.offsetHeight;
    if (below + th > window.innerHeight - 8) tip.style.top = (r.top - th - 8) + "px";
  };
  const hideTip = () => { tip.hidden = true; };
  const showTipAt = (x, y, html) => {
    tip.innerHTML = html;
    tip.hidden = false;
    const w = Math.min(300, window.innerWidth - 32);
    tip.style.maxWidth = w + "px";
    const th = tip.offsetHeight, tw = tip.offsetWidth;
    let left = x + 16, top = y + 18;
    if (left + tw > window.innerWidth - 12) left = Math.max(12, x - tw - 16);
    if (top + th > window.innerHeight - 12) top = Math.max(12, y - th - 14);
    tip.style.left = left + "px";
    tip.style.top = top + "px";
  };
  document.addEventListener("mouseover", (e) => { const g = e.target.closest(".gloss"); if (g) showTip(g); });
  document.addEventListener("mouseout", (e) => { if (e.target.closest(".gloss")) hideTip(); });
  document.addEventListener("focusin", (e) => { const g = e.target.closest(".gloss"); if (g) showTip(g); });
  document.addEventListener("focusout", (e) => { if (e.target.closest(".gloss")) hideTip(); });
  document.addEventListener("click", (e) => {
    const g = e.target.closest(".gloss");
    if (g) { showTip(g); return; }
    hideTip();
    const c = e.target.closest("[data-ref]");
    if (c) {
      e.preventDefault();
      const id = "ref-" + c.dataset.ref;
      const go = () => { const el = document.getElementById(id); if (el) { el.scrollIntoView({ behavior: "smooth", block: "center" }); el.style.background = "var(--ghost)"; } };
      if (location.hash !== "#/about") { location.hash = "#/about"; setTimeout(go, 80); } else go();
    }
  });
  $("#backBtn").addEventListener("click", () => history.back());

  // tooltips for text added by renders and by panels that redraw (tabs, inspectors);
  // the pass's own changes trigger one more call, which finds nothing left to do
  new MutationObserver(() => autoGloss(main)).observe(main, { childList: true, subtree: true });

  // keyboard skip link: move focus without changing the hash route
  $(".skip").addEventListener("click", (e) => { e.preventDefault(); main.focus(); });
  window.addEventListener("scroll", hideTip, { passive: true });

  window.addEventListener("hashchange", router);
  router();
})();
