/* =====================================================================
   The Invisible Context: app (hash router + views + Steering Wheel)
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
        <span class="eyebrow">EFMI LEAD 2026 · Sub-Group 1 · Context Invisibility Map</span>
        <h1>Health context that information systems do not capture</h1>
        <p class="lede">${gloss("When health decisions fail, how much of the relevant context was never digitally or cognitively visible in the first place? This map, produced by Sub-Group 1 of the EFMI LEAD 2026 Bootcamp, describes which contextual determinants of health are systematically missing from BMHI systems, why they remain missing, and who is affected.")}</p>
        <p class="lede" style="font-size:1rem">The example record on the right shows a discharge decision. Select each field to see the relevant information that the record does not contain.</p>
        <div class="btn-row">
          <a class="btn" href="#/map">Explore the map →</a>
          <a class="btn ghost" href="#/layers">The five layers of invisibility</a>
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
        <p class="illustrative">Illustrative example combining decision failures described in the Context Invisibility Map v0.2. It does not describe a real patient.</p>
      </div>
    </div></section>

    <section class="section"><div class="wrap">
      <span class="eyebrow">Five archetypes</span>
      <h2>Five recurring patterns of missing context</h2>
      <p class="lede">The map distinguishes five mechanisms: a determinant that is not recorded; one recorded in a form other systems cannot interpret; one for which no suitable structured field exists; one held in another sector's system; and one that no outcome indicator measures. Each requires a different response, usually from a different actor.${cite([1, 3])}</p>
      <div class="arch-grid" style="margin-top:28px">${cards}</div>
    </div></section>

    <section class="section"><div class="wrap">
      <span class="eyebrow">Documentation evidence</span>
      <h2>How often social and environmental determinants are documented</h2>
      <p class="lede">In a survey of 201 providers, consistent documentation was low even among providers who considered these determinants clinically vital.${cite(6)}</p>
      <div class="numbers" style="margin-top:24px">
        ${[["18.2%", "document housing instability consistently"], ["16.4%", "document food insecurity consistently"], ["22.7%", "document transport access consistently"], ["<5%", "document any environmental determinant consistently (excluding outbreaks)"]]
          .map(([v, l]) => `<div class="card stat"><div class="v">${v}</div><div class="l">${l}</div></div>`).join("")}
      </div>
      <p class="muted small" style="margin-top:14px">Smoking status, the only social determinant with a long-established structured EHR field, is documented consistently by a substantial majority of providers. This suggests that the gap reflects the structure of the record more than clinical awareness.${cite(6)}</p>
    </div></section>

    <section class="section"><div class="wrap split">
      <div>
        <span class="eyebrow">One Digital Health</span>
        <h2>Invisibility as a connection problem</h2>
        <p class="lede">${gloss("In the One Digital Health (ODH) framework, missing context is understood as a failure of connection between parts of the health ecosystem (people, communities, animals, environments and institutions) rather than as a gap in a single system. Relevant information often exists elsewhere but does not reach the point where the decision is made.")}${cite(2)}</p>
        <div class="btn-row"><a class="btn" href="#/map">View the ODH Steering Wheel →</a></div>
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
      <p class="lede">${gloss("The One Digital Health (ODH) Steering Wheel has two enabling keys (yellow), three perspectives (blue) and five dimensions (green), connected by the technology ring (red dots). In this map the five archetypes of invisible context are placed on the technology ring, because each describes a connection that does not work. Select an archetype to see the perspectives and dimensions it involves, or select a part of the wheel to see the related archetypes.")}${cite(2)}</p>
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
      <p>${gloss(esc(s.text))}${cite(s.ref)}</p>
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
      </div>
    </div>

    <div class="wrap a-body">
      <div class="a-main">
        <section>
          <p style="font-size:1.08rem">${gloss(esc(a.summary))}${cite(a.refs)}</p>
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
          ${a.layers.map((lid) => { const l = layer(lid); return `<div class="card mech" style="border-left:4px solid ${l.color}">${layerBadge(lid)}<div class="q">${esc(l.question)}</div><p>${gloss(esc(a.mechanism[lid]))}${cite(a.refs)}</p></div>`; }).join("")}
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
            <ol>${a.refs.map((r) => { const ref = D.REFERENCES[r - 1]; return `<li value="${r}">${esc(ref.text)} <a href="https://doi.org/${ref.doi}" target="_blank" rel="noopener">doi</a></li>`; }).join("")}</ol>
          </details>
        </div>
      </aside>
    </div>

    <div class="wrap"><nav class="pager" aria-label="Archetype navigation">
      ${prev ? `<a href="#/archetype/${prev.n}"><span class="dir">← Previous</span><span class="t">${prev.n}. ${esc(prev.name)}</span></a>` : `<a href="#/map"><span class="dir">← Back to</span><span class="t">The Map</span></a>`}
      ${next ? `<a class="next" href="#/archetype/${next.n}"><span class="dir">Next →</span><span class="t">${next.n}. ${esc(next.name)}</span></a>` : `<a class="next" href="#/layers"><span class="dir">Next →</span><span class="t">Five layers of invisibility</span></a>`}
    </nav></div>`;
  }

  function bindArchetype(n) {
    const a = byN(n);
    if (!a) return;
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
      <p class="lede">Missing context is not evenly distributed. Identifying who bears its consequences is part of the diagnosis.${cite([2, 4, 6])} Select a group, and optionally an archetype, to see who is affected.</p>
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
      <h1>About this map</h1>
    </div>
    <div class="wrap" style="padding-bottom:56px">
      <div class="prose">
        <p class="lede">${gloss("This site presents the Context Invisibility Map (v0.2) produced by Sub-Group 1 of the EFMI LEAD 2026 Bootcamp, held at MIE 2026. The bootcamp's Grand Challenge is Invisible Context: a One Digital Health exploration of the hidden determinants that remain unseen, unshared or unusable in BMHI systems.")}</p>
        <p>Sub-Group 1, the <strong>Invisible Failure Analysis Lab (IFAL)</strong>, is the diagnostic component of a three-lab design. Its task is to identify which contextual determinants of human, animal and environmental health are most systematically invisible, to whom, and through which mechanisms. It does not propose solutions; its diagnosis is passed on to the other two labs.</p>
      </div>
      <div class="labs">
        <div class="card me"><span class="eyebrow" style="margin-bottom:4px">Sub-Group 1 · this map</span><h4>Invisible Failure Analysis Lab</h4><p class="small muted" style="margin:0">Which determinants are most systematically invisible, and to whom?</p></div>
        <div class="card"><span class="eyebrow" style="margin-bottom:4px">Sub-Group 2</span><h4>BMHI Visibility Design Lab</h4><p class="small muted" style="margin:0">What forms of BMHI visibility could capture them?</p></div>
        <div class="card"><span class="eyebrow" style="margin-bottom:4px">Sub-Group 3</span><h4>European Translation Lab</h4><p class="small muted" style="margin:0">Why is this strategically European?</p></div>
      </div>
      <div class="prose">
        <h2>Method in brief</h2>
        <p>The map is anchored on <strong>decisions</strong>: a determinant counts as invisible only in relation to a decision it should have informed. Five <strong>archetypes</strong> (recurring classes of decision failure) were selected so that together they span all five layers of invisibility and all three ODH perspectives. Each is placed on the layers and on the ODH Steering Wheel, and grounded in the six seed publications below.</p>
        <p class="small muted">The patient record on the home page is an illustrative example that combines decision failures described in the map; it is not a real case. Figures are reported as given in the cited sources; the provider-documentation figures come from a single-centre survey of 201 providers.${cite(6)}</p>
        <h2>Team</h2>
        <p>${D.META.authors.map(esc).join(" · ")}</p>
        <h2 id="refs">References</h2>
        <ol class="refs">${D.REFERENCES.map((r) => `<li id="ref-${r.n}">${esc(r.text)} <a href="https://doi.org/${r.doi}" target="_blank" rel="noopener">https://doi.org/${r.doi}</a></li>`).join("")}</ol>
      </div>
    </div>`;
  }

  function viewNotFound() {
    return `<div class="wrap page-head" style="padding-bottom:80px"><h1>Page not found</h1><p class="lede">This address does not correspond to any page.</p><a class="btn" href="#/">Back to the home page</a></div>`;
  }

  /* ================================================================
     Router
     ================================================================ */
  const routes = [
    { re: /^\/?$/, name: "home", view: viewHome, bind: bindHome, title: "" },
    { re: /^\/map$/, name: "map", view: viewMap, bind: bindMap, title: "The Map" },
    { re: /^\/archetype\/(\d)$/, name: "archetype", view: (m) => viewArchetype(m[1]), bind: (m) => bindArchetype(m[1]), title: (m) => (byN(m[1]) || {}).name },
    { re: /^\/layers$/, name: "layers", view: viewLayers, bind: null, title: "Five layers of invisibility" },
    { re: /^\/people$/, name: "people", view: viewPeople, bind: bindPeople, title: "Affected stakeholders" },
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
  window.addEventListener("scroll", hideTip, { passive: true });

  window.addEventListener("hashchange", router);
  router();
})();
