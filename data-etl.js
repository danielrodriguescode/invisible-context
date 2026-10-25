/* =====================================================================
   (In)Visible Health: Sub-Group 3, European Translation Lab (ETL)
   European Opportunity. Source of truth: "EFMI LEAD - The Grand
   Challenge" (draft 2026-10-21), section 3 (Tables 7 to 11, Figure 2).
   Reference numbers follow data.js. Where the draft cites a reference
   that does not match the claim (EHDS cited as [68] and [13]), the EHDS
   regulation [69] is cited instead.
   ===================================================================== */

Object.assign(window.LEAD, (function () {

  /* ------------------------------------------------------------------
     Section 3.1: why now, why Europe
     ------------------------------------------------------------------ */
  const MEASURES = [
    { value: "1 to 2%", label: "of encounters have social determinants coded", ref: [58] },
    { value: "Almost none", label: "of health records contain environmental exposures", ref: [59] },
    { value: "Built in", label: "bias against under-represented groups in widely used devices and algorithms", ref: [60, 61] }
  ];

  const WHY_EUROPE = [
    { title: "Structural, not local", ref: [62],
      text: "The gap recurs in every European health system, whatever its funding model, language or geography, and income-related health inequalities persist across all 27 member states." },
    { title: "Determinants cross borders", ref: [63],
      text: "People migrate, pollution spreads and diseases pass between animals and people. The missing information is exactly what requires data sharing between countries, as EU cross-border health-threats legislation recognises." },
    { title: "Workforce beyond national capacity", ref: [64],
      text: "WHO warns of a growing health-worker shortage alongside a widening digital-skills gap, which calls for coordinated European investment in health informatics expertise." }
  ];

  const WHY_NOW = [
    { title: "Fairer health", ref: [65, 66],
      text: "Neither EU health-equity objectives nor the UN Sustainable Development Goals can be met while social and environmental context stays invisible." },
    { title: "Health AI governance", ref: [67],
      text: "The AI Act classifies most medical AI as high-risk and requires high-quality, representative data with human oversight. A common approach is needed before context-blind systems become entrenched." },
    { title: "The European Health Data Space", ref: [69],
      text: "The EHDS sets a common framework for electronic health records: a one-time opportunity to include standardised social and environmental context in routine health data across member states." }
  ];

  /* ------------------------------------------------------------------
     Section 3.2 and Table 7: LEAD keywords in ETL's argument
     ------------------------------------------------------------------ */
  const CAPITALS = [
    { name: "Structural capital", deficit: "Missing data fields and codes" },
    { name: "Relational capital", deficit: "Siloed governance across sectors and borders" },
    { name: "Human capital", deficit: "A workforce not trained to see context" }
  ];

  const KEYWORDS = [
    { step: "Data → information", capital: "Structural capital",
      where: "National and institutional systems capture different contextual information; missing fields and codes are a structural deficit.",
      europe: "Common European models for representing and acquiring contextual determinants, aligned with the EHDS exchange format.", ref: [69] },
    { step: "Information → knowledge", capital: "Relational capital",
      where: "Information exists but is siloed across sectors and borders, so collective learning does not accumulate.",
      europe: "Governed cross-border and cross-sector exchange (HealthData@EU, health data access bodies), with precedents such as EFSA and ECDC One Health reporting.", ref: [69, 70] },
    { step: "Knowledge → wisdom", capital: null,
      where: "What is not measured is not asked for, so decisions lack the judgement that context provides.",
      europe: "Shared European indicators and evaluation approaches." },
    { step: "Language", capital: null,
      where: "Lived experience, preferences and informal care are expressed in local language and culture.",
      europe: "Representations that keep local meaning while remaining interoperable across languages." },
    { step: "Human capital, education, leadership", capital: "Human capital",
      where: "The workforce is not trained to recognise or capture socio-environmental context; ODH literacy is not a core competence.",
      europe: "ODH literacy as a core competence, LEAD-style capacity building and continuity for young professionals (an Erasmus+ pathway)." }
  ];

  /* ------------------------------------------------------------------
     Figure 2 / Table 8: the European Opportunity Matrix
     dim: id of the ODH dimension (data.js DIMENSIONS)
     layers: invisibility layers engaged (data-ifal.js LAYERS)
     ------------------------------------------------------------------ */
  const OPPORTUNITY = [
    { dim: "citizens", layers: ["informational", "experiential"],
      invisible: "Lived experience, informal care and social circumstances stay outside structured records; citizen-generated data rarely enter the health loop.",
      value: "Experience depends on language and culture, so models must keep local meaning while staying interoperable.",
      anchor: "The EHDS gives individuals the right to insert information and request rectification. Participatory informatics can catalyse ODH, but inaccessible technology can widen inequities.", ref: [69, 7] },
    { dim: "education", layers: ["informational", "experiential"],
      invisible: "Clinicians and informaticians are not trained to recognise or capture socio-environmental context.",
      value: "The workforce and digital-skills gap exceeds what any one country can address.",
      anchor: "European cooperation programmes such as Erasmus+ Cooperation Partnerships or COST Actions.", ref: [64, 71] },
    { dim: "environment", layers: ["informational", "governance"],
      invisible: "Exposures sit in environmental systems and do not reach clinical decisions; exposure is hard to measure.",
      value: "Pollution and exposures cross borders, so shared spatial and temporal linkage and common exposure vocabularies are needed.",
      anchor: "The EU framework on serious cross-border threats to health.", ref: [59, 63] },
    { dim: "humanvet", layers: ["semantic", "governance"],
      invisible: "Human, animal and environmental data are held by separate systems and authorities.",
      value: "Zoonotic and cross-species risks ignore borders.",
      anchor: "EFSA and ECDC One Health zoonoses reporting under Directive 2003/99/EC, a precedent limited to listed agents.", ref: [70] },
    { dim: "industry", layers: ["informational", "semantic", "evaluative"],
      invisible: "EHR systems lack fields for contextual data; models trained on context-poor data replicate invisibility; outcome indicators ignore the determinant.",
      value: "Common requirements are needed before context-blind AI becomes entrenched; shared indicators allow comparison across systems.",
      anchor: "The EHDS (exchange format, MyHealth@EU, HealthData@EU), AI Act Articles 10 and 14, and the GDPR.", ref: [60, 61, 67, 69, 72] }
  ];

  // The seven columns of Figure 2, read left to right
  const MATRIX_FLOW = [
    { title: "The Grand Challenge", items: ["Hidden determinants remain unseen, unshared or unusable in BMHI systems, leading to repeated and preventable decision failures."] },
    { title: "Five layers of invisibility", items: ["Informational: data not entering the knowledge loop", "Semantic: data not interoperable across systems", "Experiential: patient narratives and burdens not captured", "Governance: institutions failing to share knowledge", "Evaluative: outcomes not measurable by current indicators"] },
    { title: "One Digital Health dimensions", items: ["Citizens' engagement", "Education", "Environment", "Human and veterinary healthcare", "Healthcare Industry 4.0"] },
    { title: "Why this is a European opportunity", items: ["Systemic scale across European health systems", "Cross-border determinants and governance needs", "Interoperability gaps for contextual data", "Need for fair and equitable healthcare", "AI governance risks from context-poor datasets", "Workforce gap in ODH and contextual reasoning"] },
    { title: "Translational European value", items: ["Public health: fewer preventable decision failures, more contextual awareness, fewer health inequalities", "Education: ODH literacy and BMHI leadership, professionals trained in contextual reasoning, interdisciplinary collaboration"] },
    { title: "Possible European pathways", items: ["COST Action: European networking and a collaborative framework", "Erasmus+: educational innovation and capacity building", "Related initiatives: future collaborative and translational opportunities"] },
    { title: "Final message", items: ["The matrix is not a final solution. It is a first exploratory framework to identify where European collaboration may be needed to address Invisible Context in health systems."] }
  ];

  /* ------------------------------------------------------------------
     Section 3.4: ETL's two gates
     ------------------------------------------------------------------ */
  const GATE_IN = {
    question: "Is the strategic relevance compatible with implementable digital infrastructures?",
    from: "bvdl",
    rows: [
      { q: "What digital infrastructure would have to exist?", etl: "Identify which required elements already exist at European level, such as the EHDS exchange format and cross-border infrastructures.", bvdl: "The mechanisms and infrastructure for each priority invisibility.", ref: [69] },
      { q: "Does the information cross institutional, sectoral or national boundaries?", etl: "Test, for each ODH dimension, whether the data cross sectors (health, environment, veterinary, social) or borders.", bvdl: "Which data sources and systems are involved." },
      { q: "Are interoperability and semantic alignment necessary?", etl: "Describe the shared terminologies and models a European initiative could develop.", bvdl: "Which terminologies and standards are proposed." },
      { q: "Does the problem require common European approaches to governance or standards?", etl: "Largely yes: the EHDS already provides a common framework. The open question is whether contextual determinants are represented in it.", bvdl: "The governance and access mechanisms assumed.", ref: [69] },
      { q: "Can existing infrastructures be connected, or are new ones required?", etl: "Assess what is fundable: network and standards work (COST) versus infrastructure and pilots (other schemes).", bvdl: "Which mechanisms reuse existing infrastructure and which need new components." },
      { q: "What workforce and competencies are required?", etl: "ODH literacy, health-data semantics and governance skills, and oversight of AI tools.", bvdl: "The skills implied by each mechanism.", ref: [64, 67] }
    ]
  };

  const GATE_OUT = {
    question: "Which invisibilities are large enough to justify European collaboration?",
    to: "ifal",
    intro: "Not every invisibility becomes a European Grand Challenge. ETL proposes six criteria for IFAL's next iteration; IFAL then returns each invisibility as confirmed, reframed or deprioritised.",
    criteria: [
      { name: "Health impact", q: "Does the invisibility lead to consequential, preventable decision failures?", evidence: "Outcome and inequality evidence.", ref: [62, 65] },
      { name: "Persistence across systems", q: "Does it recur across different health systems, not only in one setting?", evidence: "Studies from more than one European country. The absence of such evidence is itself a finding." },
      { name: "Cross-sector or cross-border character", q: "Do the data or determinants cross sectors or borders?", evidence: "The European Opportunity Matrix.", ref: [63, 70] },
      { name: "BMHI tractability", q: "Can BMHI plausibly make it visible?", evidence: "BVDL's mechanisms." },
      { name: "ODH relevance", q: "Does it engage several dimensions and perspectives?", evidence: "The matrix and IFAL's perspective mapping." },
      { name: "European added value", q: "Would collective action create value beyond isolated national action?", evidence: "Common models, shared terminologies, governance conditions, shared indicators and transferable solutions." }
    ]
  };

  const OPEN_QUESTIONS = {
    ifal: [
      "What European evidence exists for each priority invisibility, and where is there none?",
      "Which actor can resolve each invisibility in Europe?"
    ],
    bvdl: [
      "How far can the proposed BMHI mechanisms integrate health and non-health context across European countries, and what technical, semantic, organisational and governance barriers could block them within existing European frameworks?",
      "How can NLP and LLM approaches reliably identify and keep contextual health information across European languages, clinical practices and cultures, with transparency, representativeness and human oversight?",
      "What makes a mechanism ODH, and not only digital health?",
      "What is the smallest pilot that could be tested in two or three countries?"
    ]
  };

  /* ------------------------------------------------------------------
     Section 3.5 and Table 11: COST Action and Erasmus+ compared
     ------------------------------------------------------------------ */
  const FUNDING = {
    intro: "A COST Action builds interdisciplinary research networks that design data-collection methods and conceptual frameworks. An Erasmus+ Cooperation Partnership connects that research with educational institutions and communities, through training programmes, digital tools and workshops. Together, hidden disparities can be measured through collaborative science and addressed through awareness and capacity building.",
    rows: [
      { k: "Type of instrument", erasmus: "Education, training and cooperation instrument for organisations.", cost: "Networking and capacity-building instrument; it does not fund research itself." },
      { k: "Goal", erasmus: "Improve the quality and relevance of organisations' activities and develop, transfer or implement innovative practice with reusable, transferable results.", cost: "Build interdisciplinary research networks that develop shared knowledge and coordinate a research agenda. Shared standards and indicators would be outputs of such a network." },
      { k: "Activities", erasmus: "Work packages, transnational project meetings, learning and training activities, peer learning, educational resources and digital tools, virtual and blended cooperation.", cost: "Management Committee and Working Group meetings, workshops and conferences, Short-Term Scientific Missions, Training Schools, conference and virtual mobility grants." },
      { k: "Dissemination", erasmus: "Results shared locally to transnationally, with open licences where relevant. Typical outputs: training materials, toolkits and guidelines.", cost: "Dissemination grants and products such as open-access publications. Possible outputs: position papers and policy briefs." },
      { k: "Duration", erasmus: "12 to 36 months.", cost: "Four years." },
      { k: "Minimum consortium", erasmus: "At least three organisations from three EU member states or associated countries; higher-education institutions need an Erasmus Charter.", cost: "At least seven COST member or cooperating countries, at least half of them Inclusiveness Target Countries (2024 to 2025 calls)." },
      { k: "Funding model", erasmus: "Lump sum of EUR 120,000, 250,000 or 400,000, chosen at application.", cost: "Reimbursement of networking activities under COST rules." },
      { k: "Potential for LEAD and ODH", erasmus: "Scale and validate LEAD and ODH outputs through European training, ODH literacy, educational resources and pilots. Fits the Education dimension and the experiential layer.", cost: "Build the ODH network around the dimensions, map the European evidence, and develop shared models, terminologies, governance and indicators (layers 1, 2, 4 and 5). Training Schools and research visits suit early-career participants." },
      { k: "Best for", erasmus: "Turning existing knowledge into educational solutions and scaling them across institutions.", cost: "Building a European network, developing shared knowledge and coordinating a research agenda." },
      { k: "Limits", erasmus: "Not a vehicle for developing data infrastructure or standards.", cost: "Does not fund infrastructure development or pilots." }
    ],
    ref: [71, 73]
  };

  /* ------------------------------------------------------------------
     Section 3.5.2: the shared problem statement of the three labs
     ------------------------------------------------------------------ */
  const STATEMENT = {
    template: [
      { t: "We have identified a European Invisible Context problem that BMHI currently underserves, defined by " },
      { slot: "determinant", lab: "ifal+bvdl", label: "the validated determinant or context" },
      { t: ", whose invisibility results from " },
      { slot: "mechanism", lab: "ifal+bvdl", label: "the relevant invisibility mechanisms" },
      { t: ", affects " },
      { slot: "decisions", lab: "ifal+bvdl", label: "the relevant health or ecosystem decisions" },
      { t: ", and requires " },
      { slot: "response", lab: "etl", label: "the validated European and BMHI response" },
      { t: " to become visible and actionable." }
    ],
    response: "A European ODH approach combining common contextual data models and terminologies aligned with the EHDS, governed cross-sector and cross-border linkage, context-aware requirements for health AI, shared indicators and evaluation approaches, and an ODH-literate workforce.",
    pillars: ["Common contextual data models and terminologies aligned with the EHDS", "Governed cross-sector and cross-border linkage", "Context-aware requirements for health AI", "Shared indicators and evaluation approaches", "An ODH-literate workforce"]
  };

  return { MEASURES, WHY_EUROPE, WHY_NOW, CAPITALS, KEYWORDS, OPPORTUNITY, MATRIX_FLOW, GATE_IN, GATE_OUT,
           OPEN_QUESTIONS, FUNDING, STATEMENT };
})());
