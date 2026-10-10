/* =====================================================================
   The Invisible Context — app (hash router + views + Steering Wheel)
   ===================================================================== */
(function () {
  "use strict";

  const D = window.IFAL;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const main = $("#main");

  const byN = (n) => D.ARCHETYPES.find((a) => a.n === Number(n));
  const layer = (id) => D.LAYERS.find((l) => l.id === id);
  const persp = (id) => D.PERSPECTIVES.find((p) => p.id === id);
  const dim = (id) => D.DIMENSIONS.find((d) => d.id === id);
  const cluster = (id) => D.CLUSTERS.find((c) => c.id === id);

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

  // wrap glossary terms (first occurrence) in a span with tooltip
  const gloss = (html) => {
    let out = html;
    Object.keys(D.GLOSSARY).forEach((term) => {
      const re = new RegExp(`(^|[^\\w-])(${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})(?![\\w-])`);
      out = out.replace(re, `$1<span class="gloss" tabindex="0" data-gloss="${esc(term)}">$2</span>`);
    });
    return out;
  };

  /* ================================================================
     ODH Steering Wheel (SVG)
     Geometry follows MAP/assets/make_figs.py (fig. 1 of IFAL v0.2):
     perspective rings inside, five 72° dimension sectors, outer
     Technology Ring; markers on ring boundaries span two perspectives.
     ================================================================ */
  const R = { hub: 40, ind: 115, pop: 190, eco: 265, dim: 345, tech: 380 };
  const rad = (deg) => (deg * Math.PI) / 180;
  const pt = (deg, r) => [r * Math.cos(rad(deg)), -r * Math.sin(rad(deg))];
  const f = (n) => n.toFixed(2);

  function annulusPath(r0, r1) {
    // full ring (even-odd)
    return `M ${r1} 0 A ${r1} ${r1} 0 1 0 ${-r1} 0 A ${r1} ${r1} 0 1 0 ${r1} 0 Z ` +
           `M ${r0} 0 A ${r0} ${r0} 0 1 1 ${-r0} 0 A ${r0} ${r0} 0 1 1 ${r0} 0 Z`;
  }
  function wedgePath(a0, a1, r0, r1) {
    // a0 < a1, degrees CCW. SVG y is flipped, so CCW in math = sweep 0
    const [x0, y0] = pt(a0, r1), [x1, y1] = pt(a1, r1);
    const [x2, y2] = pt(a1, r0), [x3, y3] = pt(a0, r0);
    const large = a1 - a0 > 180 ? 1 : 0;
    return `M ${f(x0)} ${f(y0)} A ${r1} ${r1} 0 ${large} 0 ${f(x1)} ${f(y1)} L ${f(x2)} ${f(y2)} A ${r0} ${r0} 0 ${large} 1 ${f(x3)} ${f(y3)} Z`;
  }
  function arcPath(a0, a1, r, reverse) {
    const [x0, y0] = pt(a0, r), [x1, y1] = pt(a1, r);
    return reverse
      ? `M ${f(x1)} ${f(y1)} A ${r} ${r} 0 0 1 ${f(x0)} ${f(y0)}`
      : `M ${f(x0)} ${f(y0)} A ${r} ${r} 0 0 0 ${f(x1)} ${f(y1)}`;
  }
  const isDark = () => {
    const t = document.documentElement.getAttribute("data-theme");
    if (t) return t === "dark";
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  };

  function wheelSVG(opts = {}) {
    const mini = !!opts.mini;
    const uid = mini ? "m" : "w";
    const dark = isDark();
    let s = `<svg class="wheel${mini ? " mini" : ""}" viewBox="-430 -430 860 860" role="img" aria-label="ODH Steering Wheel with the five invisibility archetypes">`;
    s += `<defs>`;
    D.DIMENSIONS.forEach((d) => {
      const lower = Math.sin(rad(d.angle)) < -0.1;
      s += `<path id="${uid}-dl-${d.id}" d="${arcPath(d.angle - 34, d.angle + 34, lower ? 314 : 299, !lower)}"/>`;
    });
    s += `<path id="${uid}-tl-a" d="${arcPath(54 + 4, 126 - 4, 358, true)}"/>`;
    s += `<path id="${uid}-tl-b" d="${arcPath(-126 + 4, -54 - 4, 367, false)}"/>`;
    s += `</defs>`;

    // technology ring
    s += `<path class="tech hit" data-kind="tech" data-id="tech" d="${annulusPath(R.dim, R.tech)}" fill-rule="evenodd"><title>${esc(D.TECH_RING.name)}</title></path>`;
    s += `<text class="tech-label"><textPath href="#${uid}-tl-a" startOffset="50%" text-anchor="middle">Technology ring · interoperability &amp; standards</textPath></text>`;
    s += `<text class="tech-label"><textPath href="#${uid}-tl-b" startOffset="50%" text-anchor="middle">Technology ring · infrastructure</textPath></text>`;

    // dimension sectors
    D.DIMENSIONS.forEach((d) => {
      s += `<path class="sector hit" data-kind="dimension" data-id="${d.id}" fill="${dark ? d.fillDark : d.fill}" d="${wedgePath(d.angle - 36, d.angle + 36, R.eco, R.dim)}" tabindex="${mini ? -1 : 0}" role="button" aria-label="Dimension: ${esc(d.name)}"><title>${esc(d.name)}</title></path>`;
      s += `<text class="dim-label"><textPath href="#${uid}-dl-${d.id}" startOffset="50%" text-anchor="middle">${esc(d.name)}</textPath></text>`;
    });

    // perspective rings
    s += `<path class="ring hit" data-kind="perspective" data-id="ecosystem" d="${annulusPath(R.pop, R.eco)}" fill-rule="evenodd" tabindex="${mini ? -1 : 0}" role="button" aria-label="Perspective: Ecosystem"><title>Ecosystem perspective</title></path>`;
    s += `<path class="ring alt hit" data-kind="perspective" data-id="population" d="${annulusPath(R.ind, R.pop)}" fill-rule="evenodd" tabindex="${mini ? -1 : 0}" role="button" aria-label="Perspective: Population"><title>Population perspective</title></path>`;
    s += `<path class="ring hit" data-kind="perspective" data-id="individual" d="${annulusPath(R.hub, R.ind)}" fill-rule="evenodd" tabindex="${mini ? -1 : 0}" role="button" aria-label="Perspective: Individual"><title>Individual perspective</title></path>`;

    // sector guides
    D.DIMENSIONS.forEach((d) => {
      const [x0, y0] = pt(d.angle + 36, R.hub), [x1, y1] = pt(d.angle + 36, R.eco);
      s += `<line class="guide" x1="${f(x0)}" y1="${f(y0)}" x2="${f(x1)}" y2="${f(y1)}"/>`;
    });

    // ring labels (bottom)
    s += `<text class="ring-label" style="stroke:var(--wheel-ring)" x="0" y="${R.ind - 16}" text-anchor="middle">Individual</text>`;
    s += `<text class="ring-label" style="stroke:var(--wheel-ring-alt)" x="0" y="${R.pop - 22}" text-anchor="middle">Population</text>`;
    s += `<text class="ring-label" style="stroke:var(--wheel-ring)" x="0" y="${R.eco - 24}" text-anchor="middle">Ecosystem</text>`;

    // hub: the two enabling keys
    s += `<path class="hub-half hit" data-kind="key" data-id="onehealth" fill="${dark ? "#1F3D2C" : "#E3F1E6"}" d="M 0 ${-R.hub} A ${R.hub} ${R.hub} 0 0 0 0 ${R.hub} Z" tabindex="${mini ? -1 : 0}" role="button" aria-label="Enabling key: One Health"><title>One Health key</title></path>`;
    s += `<path class="hub-half hit" data-kind="key" data-id="digitalhealth" fill="${dark ? "#24344F" : "#E1EAF8"}" d="M 0 ${-R.hub} A ${R.hub} ${R.hub} 0 0 1 0 ${R.hub} Z" tabindex="${mini ? -1 : 0}" role="button" aria-label="Enabling key: Digital Health"><title>Digital Health key</title></path>`;
    s += `<text class="hub-label" x="-20" y="-2" text-anchor="middle">One</text><text class="hub-label" x="-20" y="10" text-anchor="middle">Health</text>`;
    s += `<text class="hub-label" x="20" y="-2" text-anchor="middle">Digital</text><text class="hub-label" x="20" y="10" text-anchor="middle">Health</text>`;

    // connection layer
    s += `<g class="links"></g>`;

    // markers
    D.ARCHETYPES.forEach((a) => {
      const [x, y] = pt(a.wheel.angle, a.wheel.r);
      const sel = opts.selected === a.n;
      const fade = opts.selected && !sel && mini;
      s += `<g class="marker${sel ? " sel" : ""}${fade ? " fade" : ""}" data-n="${a.n}" transform="translate(${f(x)} ${f(y)})" tabindex="${mini ? -1 : 0}" role="button" aria-label="Archetype ${a.n}: ${esc(a.name)}">`;
      if (a.spillover.length) s += `<circle class="spill" r="38" stroke="${a.color}"/>`;
      s += `<circle class="halo" r="33" stroke="${a.color}"/>`;
      s += `<circle class="m" r="25" fill="${a.color}"/>`;
      s += `<text text-anchor="middle" dy="7.5">${a.n}</text>`;
      s += `<title>${a.n}. ${esc(a.name)}</title></g>`;
    });

    s += `</svg>`;
    return s;
  }

  // highlight state on an existing wheel svg
  function paintWheel(svg, state) {
    const { kind, id, selected } = state;
    const matches = matchArchetypes(kind, id);
    $$(".marker", svg).forEach((m) => {
      const n = Number(m.dataset.n);
      m.classList.toggle("sel", selected === n);
      let fade = false;
      if (selected) fade = selected !== n;
      else if (kind) fade = !matches.includes(n);
      m.classList.toggle("fade", fade);
    });
    // sectors / rings
    const selA = selected ? byN(selected) : null;
    $$(".sector", svg).forEach((p) => {
      const on = (kind === "dimension" && p.dataset.id === id) || (selA && selA.dimensions.includes(p.dataset.id));
      p.classList.toggle("on", !!on);
      p.classList.toggle("dim-off", !!((kind === "dimension" || selA) && !on));
    });
    $$(".ring", svg).forEach((p) => {
      const on = (kind === "perspective" && p.dataset.id === id) ||
        (selA && (selA.perspectives.includes(p.dataset.id)));
      p.classList.toggle("on", !!on);
    });
    $(".tech", svg).classList.toggle("on", kind === "tech");
    // links from selected marker to its dimensions
    const g = $(".links", svg);
    g.innerHTML = "";
    if (selA) {
      const [mx, my] = pt(selA.wheel.angle, selA.wheel.r);
      selA.dimensions.forEach((did) => {
        const d = dim(did);
        const [tx, ty] = pt(d.angle, (R.eco + R.dim) / 2);
        const [cx, cy] = pt((selA.wheel.angle + d.angle) / 2, (selA.wheel.r + R.eco) / 2 + 20);
        g.insertAdjacentHTML("beforeend", `<path class="link" stroke="${selA.color}" d="M ${f(mx)} ${f(my)} Q ${f(cx)} ${f(cy)} ${f(tx)} ${f(ty)}"/><circle cx="${f(tx)}" cy="${f(ty)}" r="6" fill="${selA.color}"/>`);
      });
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
      if (kind === "tech") return [1, 3, 5].includes(a.n);
      return true;
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
          <span class="peek" aria-hidden="true">${eyeIcon()}<span class="peek-t">What's missing?</span></span>
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
        <span class="eyebrow">EFMI LEAD 2026 · Sub-Group 1 · Context Invisibility Map</span>
        <h1>The decision was right.<br><em>The picture was not.</em></h1>
        <p class="lede">${gloss("When health decisions fail, how much of the relevant context was never digitally or cognitively visible in the first place? This map shows the kinds of context that health information systems systematically fail to see — and who pays for it.")}</p>
        <p class="lede" style="font-size:1rem">Open the patient record on the right. Every field looks fine. Tap each one to see what the system never knew.</p>
        <div class="btn-row">
          <a class="btn" href="#/map">Explore the map →</a>
          <a class="btn ghost" href="#/layers">Why does it stay hidden?</a>
        </div>
      </div>
      <div class="card record" id="record">
        <div class="record-head"><span class="who">${esc(st.patient)}</span><span class="tag">Electronic health record</span></div>
        <div class="record-decision"><span class="ok" aria-hidden="true">✓</span>${esc(st.decision)}</div>
        ${rows}
        <div class="record-foot">
          <span class="small muted" id="revealCount">0 of ${st.rows.length} hidden contexts revealed</span>
          <button class="btn ghost" id="revealAll" style="padding:8px 16px">Reveal all</button>
        </div>
        <div class="moral fog" id="moral">${esc(st.moral)}</div>
        <p class="illustrative">Illustrative composite built from the decision failures described in the Context Invisibility Map v0.2. Not a real patient.</p>
      </div>
    </div></section>

    <section class="section"><div class="wrap">
      <span class="eyebrow">Not one problem, but five</span>
      <h2>Five ways context disappears</h2>
      <p class="lede">A determinant that was never recorded, one recorded in a form no other system can read, one with no field of the right shape, one locked inside another sector's database, and one that no indicator measures — these are five different failures. Lumping them together is part of why they persist.${cite([1, 3])}</p>
      <div class="arch-grid" style="margin-top:28px">${cards}</div>
    </div></section>

    <section class="section"><div class="wrap">
      <span class="eyebrow">Clinicians know. The record doesn't.</span>
      <h2>It is not a lack of awareness</h2>
      <p class="lede">In a survey of 201 providers, even those who considered these factors <em>clinically vital</em> rarely documented them consistently.${cite(6)}</p>
      <div class="numbers" style="margin-top:24px">
        ${[["18.2%", "document housing instability"], ["16.4%", "document food insecurity"], ["22.7%", "document transport access"], ["<5%", "document any environmental exposure (except outbreaks)"]]
          .map(([v, l]) => `<div class="card stat"><div class="v">${v}</div><div class="l">${l}</div></div>`).join("")}
      </div>
      <p class="muted small" style="margin-top:14px">The one social determinant with a long-established structured field — smoking status — is documented consistently by a substantial majority. The gap comes from the shape of the record, not from the people using it.${cite(6)}</p>
    </div></section>

    <section class="section"><div class="wrap split">
      <div>
        <span class="eyebrow">One Digital Health</span>
        <h2>An interface problem</h2>
        <p class="lede">${gloss("Through the lens of ODH, invisible context is a failure of connection across a health ecosystem — between people, communities, animals and environments — not just a gap in one hospital system. The information often exists somewhere. It just never becomes visible where the decision is made.")}${cite(2)}</p>
        <div class="btn-row"><a class="btn" href="#/map">See it on the Steering Wheel →</a></div>
      </div>
      <a href="#/map" aria-label="Open the interactive map" style="display:block">${wheelSVG({ mini: true })}</a>
    </div></section>`;
  }

  function eyeIcon() {
    return `<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="3" fill="currentColor"/></svg>`;
  }

  function bindHome() {
    const total = D.STORY.rows.length;
    const update = () => {
      const n = $$(".rrow.open").length;
      $("#revealCount").textContent = `${n} of ${total} hidden contexts revealed`;
      if (n === total) { $("#moral").classList.add("clear"); $("#revealAll").textContent = "Hide again"; }
      else { $("#moral").classList.remove("clear"); $("#revealAll").textContent = "Reveal all"; }
    };
    const setRow = (row, open) => {
      row.classList.toggle("open", open);
      $(".rrow-btn", row).setAttribute("aria-expanded", String(open));
      $(".peek-t", row).textContent = open ? "Revealed" : "What's missing?";
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

  /* ---------------------------------------------------------------- MAP */
  const mapState = { kind: null, id: null, selected: null };

  function viewMap() {
    const chipGroup = (label, kind, items) => `
      <div><div class="lab">${label}</div><div class="chips">
        ${items.map((it) => `<button class="chip" data-kind="${kind}" data-id="${it.id}" aria-pressed="false">${it.color ? dot(it.color) : ""}${esc(it.name)}</button>`).join("")}
      </div></div>`;

    return `
    <div class="wrap page-head">
      <span class="eyebrow">The Context Invisibility Map on the ODH Steering Wheel</span>
      <h1>Where does context go missing?</h1>
      <p class="lede">${gloss("The One Digital Health (ODH) Steering Wheel joins two enabling keys — One Health and Digital Health — across three perspectives (rings) and five dimensions (outer sectors). Each numbered marker is one archetype of invisible context. Tap a ring, a sector, a marker or a filter to see what lights up — and what fades from view.")}${cite(2)}</p>
    </div>
    <div class="wrap map-layout">
      <div class="card wheel-box">
        <div id="wheelHost">${wheelSVG()}</div>
        <div class="wheel-legend">
          <span>Rings = ODH perspectives</span>
          <span>Outer sectors = ODH dimensions</span>
          <span>A marker on a ring boundary spans both perspectives</span>
          <span><i></i> dashed halo = spillover</span>
        </div>
      </div>
      <div class="card panel">
        <div class="filters">
          ${chipGroup("Layer of invisibility — why it's hidden", "layer", D.LAYERS)}
          ${chipGroup("ODH perspective", "perspective", D.PERSPECTIVES)}
          ${chipGroup("ODH dimension", "dimension", D.DIMENSIONS)}
          ${chipGroup("Cluster", "cluster", D.CLUSTERS)}
        </div>
        <div class="inspector" id="inspector" aria-live="polite"></div>
      </div>
    </div>
    <div class="wrap" style="padding-bottom:56px">
      <div class="interface">
        <h3>Invisibility is an interface problem</h3>
        <p style="margin:0">The archetypes sit at different interfaces of the ODH ecosystem. The SDOH gap and patient narrative concentrate at the individual and population levels; environmental blindness links population and ecosystem; algorithmic data poverty sits between individuals, populations and Healthcare Industry 4.0; governance silos sit in the exchange between human, veterinary and environmental systems. Relevant information may exist in one part of the ecosystem and never become visible in another — and no single fix resolves every archetype.${cite(2)}</p>
      </div>
    </div>`;
  }

  function inspectorHTML() {
    const { kind, id, selected } = mapState;
    if (selected) {
      const a = byN(selected);
      return `
        <div style="display:flex;gap:10px;align-items:center;margin-bottom:8px">${num(a)}<span class="muted small">${esc(a.plain)}</span></div>
        <h3>${esc(a.name)}</h3>
        <p>${esc(a.tagline)}</p>
        <dl class="kv">
          <dt>Why hidden</dt><dd>${a.layers.map(layerBadge).join("")}</dd>
          <dt>Perspective</dt><dd>${a.perspectives.map((p) => `<span class="chip">${esc(persp(p).name)}</span>`).join("")}${a.spillover.map((p) => `<span class="chip">${esc(persp(p).name)} (spillover)</span>`).join("")}</dd>
          <dt>Dimension</dt><dd>${a.dimensions.map((d) => `<span class="chip">${esc(dim(d).name)}</span>`).join("")}</dd>
          <dt>Cluster</dt><dd><span class="chip">${esc(cluster(a.cluster).name)}</span></dd>
        </dl>
        <p class="small muted">${esc(cluster(a.cluster).text)}</p>
        <div class="btn-row" style="margin-top:12px"><a class="btn" href="#/archetype/${a.n}">Explore this archetype →</a><button class="clear-btn" data-clear>Clear</button></div>`;
    }
    if (kind) {
      let title = "", text = "", sub = "";
      if (kind === "layer") { const l = layer(id); title = `${l.name} invisibility`; sub = l.question; text = `<strong>What's missing:</strong> ${esc(l.missing)}<br><strong>Consequence:</strong> ${esc(l.consequence)}${cite(l.refs)}`; }
      if (kind === "perspective") { const p = persp(id); title = `${p.full}`; sub = "ODH perspective"; text = esc(p.text); }
      if (kind === "dimension") { const d = dim(id); title = d.name; sub = "ODH dimension"; text = esc(d.text); }
      if (kind === "cluster") { const c = cluster(id); title = `${c.name} invisibilities`; sub = "Cluster"; text = esc(c.text) + " A way of making context visible that works for one cluster will not, on its own, address the other."; }
      if (kind === "key") { const k = D.KEYS.find((x) => x.id === id); title = `${k.name} key`; sub = "Enabling key"; text = esc(k.text) + (id === "onehealth" ? " The archetypes that most directly involve animal and environmental health are highlighted." : " The archetypes rooted in records, devices and algorithms are highlighted."); }
      if (kind === "tech") { title = D.TECH_RING.name; sub = "Outer ring"; text = esc(D.TECH_RING.text) + " Highlighted: archetypes where data exists but cannot be exchanged or interpreted across systems (semantic or governance barriers)."; }
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
      <h3>Five archetypes, one ecosystem</h3>
      <p>Each archetype is a recurring way that health decisions fail because context was absent. Together they were chosen to cover all five layers of invisibility and all three ODH perspectives.</p>
      <div class="list">${D.ARCHETYPES.map((a) => `<button class="alink" data-pick="${a.n}">${num(a)}<span><span class="t">${esc(a.name)}</span><br><span class="s">${esc(a.plain)}</span></span></button>`).join("")}</div>`;
  }

  function bindMap() {
    const svg = $("#wheelHost svg");
    const insp = $("#inspector");
    const render = () => {
      paintWheel(svg, mapState);
      insp.innerHTML = inspectorHTML();
      $$(".chip[data-kind]").forEach((c) => c.setAttribute("aria-pressed", String(!mapState.selected && c.dataset.kind === mapState.kind && c.dataset.id === mapState.id)));
    };
    const setFocus = (kind, id) => {
      if (mapState.kind === kind && mapState.id === id && !mapState.selected) { mapState.kind = mapState.id = null; }
      else { mapState.kind = kind; mapState.id = id; }
      mapState.selected = null;
      render();
    };
    const select = (n) => {
      mapState.selected = mapState.selected === n ? null : n;
      render();
      if (window.innerWidth < 980) insp.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    svg.addEventListener("click", (e) => {
      const m = e.target.closest(".marker");
      if (m) return select(Number(m.dataset.n));
      const h = e.target.closest(".hit");
      if (h) setFocus(h.dataset.kind, h.dataset.id);
    });
    svg.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      e.preventDefault();
      e.target.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    $$(".chip[data-kind]").forEach((c) => c.addEventListener("click", () => setFocus(c.dataset.kind, c.dataset.id)));
    insp.addEventListener("click", (e) => {
      const p = e.target.closest("[data-pick]");
      if (p) { mapState.selected = Number(p.dataset.pick); render(); return; }
      if (e.target.closest("[data-clear]")) { mapState.kind = mapState.id = mapState.selected = null; render(); }
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
      </div>
    </div>

    <div class="wrap a-body">
      <div class="a-main">
        <section>
          <p style="font-size:1.08rem">${gloss(esc(a.summary))}${cite(a.refs)}</p>
        </section>

        <section>
          <span class="eyebrow">Decisions that fail</span>
          <h2>What goes wrong</h2>
          ${a.failures.map((x) => `<div class="card story" style="border-left-color:${a.color}"><h3>${esc(x.title)}</h3><p>${esc(x.text)}${cite(x.ref)}</p></div>`).join("")}
          ${a.closing ? `<p class="closing">${esc(a.closing)}</p>` : ""}
        </section>

        <section>
          <span class="eyebrow">Priority hidden determinants</span>
          <h2>What the system doesn't see</h2>
          <p class="muted small">Tap to bring each one into view.</p>
          <div class="det-grid" id="dets">${a.determinants.map((d) => `<button class="det fog" style="border-color:${a.color}">${esc(d)}</button>`).join("")}</div>
          <div style="margin-top:12px"><button class="clear-btn" id="detAll">Reveal all</button></div>
        </section>

        <section>
          <span class="eyebrow">Mechanism</span>
          <h2>Why it stays invisible</h2>
          ${a.layers.map((lid) => { const l = layer(lid); return `<div class="card mech" style="border-left:4px solid ${l.color}">${layerBadge(lid)}<div class="q">${esc(l.question)}</div><p>${gloss(esc(a.mechanism[lid]))}${cite(a.refs)}</p></div>`; }).join("")}
          <p class="small muted"><a href="#/layers">Learn about all five layers →</a></p>
        </section>

        <section>
          <span class="eyebrow">Affected stakeholders</span>
          <h2>Who carries the burden</h2>
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
          ${a.stats.map((s) => `<div class="card stat"><div class="v" style="color:${a.color}">${esc(s.value)}</div><div class="l">${esc(s.label)}${cite(s.ref)}</div>${s.note ? `<div class="n">${esc(s.note)}</div>` : ""}</div>`).join("")}
        </div>
        <div class="card side-card">
          <details class="evidence">
            <summary>Evidence</summary>
            <ol>${a.refs.map((r) => { const ref = D.REFERENCES[r - 1]; return `<li value="${r}">${esc(ref.text)} <a href="https://doi.org/${ref.doi}" target="_blank" rel="noopener">doi</a></li>`; }).join("")}</ol>
          </details>
        </div>
      </aside>
    </div>

    <div class="wrap"><nav class="pager" aria-label="Archetype navigation">
      ${prev ? `<a href="#/archetype/${prev.n}"><span class="dir">← Previous</span><span class="t">${prev.n}. ${esc(prev.name)}</span></a>` : `<a href="#/map"><span class="dir">← Back to</span><span class="t">The Map</span></a>`}
      ${next ? `<a class="next" href="#/archetype/${next.n}"><span class="dir">Next →</span><span class="t">${next.n}. ${esc(next.name)}</span></a>` : `<a class="next" href="#/layers"><span class="dir">Next →</span><span class="t">Why it stays hidden</span></a>`}
    </nav></div>`;
  }

  function bindArchetype(n) {
    const a = byN(n);
    if (!a) return;
    paintWheel($("#miniHost svg"), { selected: a.n });
    $$("#dets .det").forEach((d) => d.addEventListener("click", () => d.classList.toggle("clear")));
    $("#detAll").addEventListener("click", () => $$("#dets .det").forEach((d, i) => setTimeout(() => d.classList.add("clear"), i * 110)));
    const link = $("[data-select]");
    if (link) link.addEventListener("click", () => { mapState.kind = mapState.id = null; mapState.selected = a.n; });
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
    loop += `<text class="centre" text-anchor="middle" y="-6">invisibility</text><text class="centre" text-anchor="middle" y="16">reproduces itself</text></svg>`;

    // coverage grid
    const head = `<tr><th></th>${D.ARCHETYPES.map((a) => `<th><a href="#/archetype/${a.n}" style="text-decoration:none">${num(a)}</a></th>`).join("")}</tr>`;
    const lrows = D.LAYERS.map((l) => `<tr><th>${esc(l.name)}<span class="sub">${esc(l.question)}</span></th>${D.ARCHETYPES.map((a) => {
      const on = a.layers.includes(l.id);
      return on ? `<td class="on" style="background:${l.color}"><a href="#/archetype/${a.n}" aria-label="${esc(a.name)} — ${esc(l.name)}">●</a></td>` : `<td></td>`;
    }).join("")}</tr>`).join("");
    const prows = D.PERSPECTIVES.map((p) => `<tr><th>${esc(p.name)}</th>${D.ARCHETYPES.map((a) => {
      if (a.perspectives.includes(p.id)) return `<td class="on" style="background:${a.color}"><a href="#/archetype/${a.n}" aria-label="${esc(a.name)} — ${esc(p.name)}">●</a></td>`;
      if (a.spillover.includes(p.id)) return `<td class="spill"><a href="#/archetype/${a.n}" aria-label="${esc(a.name)} — ${esc(p.name)} spillover">◌</a></td>`;
      return `<td></td>`;
    }).join("")}</tr>`).join("");

    return `
    <div class="wrap page-head">
      <span class="eyebrow">The five layers of invisibility</span>
      <h1>Why does context stay hidden?</h1>
      <p class="lede">Each layer is a different reason something goes unseen — and the layer tells us <em>who</em> would be in a position to fix it. The layers can overlap, and the most stubborn cases combine several.</p>
    </div>
    <section class="section" style="padding-top:24px"><div class="wrap layer-list">${layers}</div></section>

    <section class="section"><div class="wrap loop-wrap">
      ${loop}
      <div>
        <span class="eyebrow">A self-reinforcing system</span>
        <h2>What isn't seen, isn't asked for</h2>
        <p class="lede">What is not captured cannot be standardised; what is not standardised cannot be reliably linked; what is not linked is hard to evaluate; and what is not evaluated is unlikely to become a priority. Invisible context is a property of the whole information ecosystem — not a list of isolated missing data points.</p>
      </div>
    </div></section>

    <section class="section"><div class="wrap">
      <span class="eyebrow">Mechanisms across the information lifecycle</span>
      <h2>Four ways invisibility persists</h2>
      <div class="mech-grid" style="margin-top:20px">
        ${D.MECHANISMS.map((m) => `<div class="card"><h3>${esc(m.name)}</h3><p>${esc(m.text)}${cite(m.ref)}</p><div class="chips">${m.layers.map(layerBadge).join("")}</div></div>`).join("")}
      </div>
    </div></section>

    <section class="section"><div class="wrap">
      <span class="eyebrow">Coverage</span>
      <h2>Every layer, every perspective</h2>
      <p class="lede">The five archetypes were selected so that, together, no layer and no ODH perspective is left out. Tap a cell to open that archetype.</p>
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
      <h1>Who is affected?</h1>
      <p class="lede">Invisible context is not evenly distributed. Identifying who carries its consequences is part of the diagnosis.${cite([2, 4, 6])} Do you recognise yourself, or someone you know?</p>
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

  /* ---------------------------------------------------------------- ABOUT */
  function viewAbout() {
    return `
    <div class="wrap page-head">
      <span class="eyebrow">About this map</span>
      <h1>A diagnosis, not a prescription</h1>
    </div>
    <div class="wrap" style="padding-bottom:56px">
      <div class="prose">
        <p class="lede">${gloss("This site presents the Context Invisibility Map (v0.2) produced by Sub-Group 1 of the EFMI LEAD 2026 Bootcamp, held at MIE 2026. The bootcamp's Grand Challenge is Invisible Context: a One Digital Health exploration of the hidden determinants that remain unseen, unshared or unusable in BMHI systems.")}</p>
        <p>Sub-Group 1 — the <strong>Invisible Failure Analysis Lab (IFAL)</strong> — is the diagnostic engine of a three-lab design. Its job is to identify which contextual determinants of human, animal and environmental health are most systematically invisible, to whom, and through which mechanisms. It deliberately does not propose solutions: that diagnosis is handed on to the other two labs.</p>
      </div>
      <div class="labs">
        <div class="card me"><span class="eyebrow" style="margin-bottom:4px">Sub-Group 1 · this map</span><h4>Invisible Failure Analysis Lab</h4><p class="small muted" style="margin:0">Which determinants are most systematically invisible, and to whom?</p></div>
        <div class="card"><span class="eyebrow" style="margin-bottom:4px">Sub-Group 2</span><h4>BMHI Visibility Design Lab</h4><p class="small muted" style="margin:0">What forms of BMHI visibility could capture them?</p></div>
        <div class="card"><span class="eyebrow" style="margin-bottom:4px">Sub-Group 3</span><h4>European Translation Lab</h4><p class="small muted" style="margin:0">Why is this strategically European?</p></div>
      </div>
      <div class="prose">
        <h2>Method in brief</h2>
        <p>The map is anchored on <strong>decisions</strong>: a determinant counts as invisible only in relation to a decision it should have informed. Five <strong>archetypes</strong> — recurring classes of decision failure — were selected so that together they span all five layers of invisibility and all three ODH perspectives. Each is placed on the layers and on the ODH Steering Wheel, and grounded in the six seed publications below.</p>
        <p class="small muted">The patient record on the home page is an illustrative composite of the decision failures described in the map, not a real case. Figures are reported as given in the cited sources; the provider-documentation figures come from a single-centre survey of 201 providers.${cite(6)}</p>
        <h2>Team</h2>
        <p>${D.META.authors.map(esc).join(" · ")}</p>
        <h2 id="refs">References</h2>
        <ol class="refs">${D.REFERENCES.map((r) => `<li id="ref-${r.n}">${esc(r.text)} <a href="https://doi.org/${r.doi}" target="_blank" rel="noopener">https://doi.org/${r.doi}</a></li>`).join("")}</ol>
      </div>
    </div>`;
  }

  function viewNotFound() {
    return `<div class="wrap page-head" style="padding-bottom:80px"><h1>This page is invisible.</h1><p class="lede">Fittingly, nothing was recorded here.</p><a class="btn" href="#/">Back to the story</a></div>`;
  }

  /* ================================================================
     Router
     ================================================================ */
  const routes = [
    { re: /^\/?$/, name: "home", view: viewHome, bind: bindHome, title: "" },
    { re: /^\/map$/, name: "map", view: viewMap, bind: bindMap, title: "The Map" },
    { re: /^\/archetype\/(\d)$/, name: "archetype", view: (m) => viewArchetype(m[1]), bind: (m) => bindArchetype(m[1]), title: (m) => (byN(m[1]) || {}).name },
    { re: /^\/layers$/, name: "layers", view: viewLayers, bind: null, title: "Why it stays hidden" },
    { re: /^\/people$/, name: "people", view: viewPeople, bind: bindPeople, title: "Who is affected" },
    { re: /^\/about$/, name: "about", view: viewAbout, bind: null, title: "About" }
  ];

  function router() {
    const path = (location.hash || "#/").slice(1);
    let route = null, m = null;
    for (const r of routes) { m = path.match(r.re); if (m) { route = r; break; } }
    if (!route) { main.innerHTML = viewNotFound(); setActive(""); return; }
    main.innerHTML = `<div class="view-enter">${route.view(m)}</div>`;
    if (route.bind) route.bind(m);
    setActive(route.name);
    const t = typeof route.title === "function" ? route.title(m) : route.title;
    document.title = t ? `${t} · The Invisible Context` : "The Invisible Context";
    window.scrollTo(0, 0);
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
  window.addEventListener("scroll", hideTip, { passive: true });

  window.addEventListener("hashchange", router);
  router();
})();
