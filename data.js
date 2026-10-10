/* =====================================================================
   The Invisible Context — content model
   Source of truth: IFAL Context Invisibility Map v0.2
   (MAP/Updated document/IFAL_(v0.2).docx). Where v0.2 is silent, detail
   comes from the SG1 evidence matrix (MAP/02-matrix.md). On conflict,
   v0.2 wins. Reference numbers [1]–[6] follow the v0.2 reference list.
   ===================================================================== */

window.IFAL = (function () {

  const META = {
    title: "The Invisible Context",
    subtitle: "A map of the health context that information systems never see",
    group: "EFMI LEAD 2026 · Sub-Group 1 · Invisible Failure Analysis Lab (IFAL)",
    version: "Context Invisibility Map v0.2",
    authors: ["Alessandra Introvaia", "Daniel Rodrigues", "Kirubel Biruk Shiferaw"],
    question:
      "When health decisions fail, how much of the relevant context was never digitally or cognitively visible in the first place?"
  };

  /* ------------------------------------------------------------------
     The five layers of invisibility (v0.2, Table 1)
     ------------------------------------------------------------------ */
  const LAYERS = [
    {
      id: "informational", n: 1, name: "Informational", color: "#3D7FE6",
      question: "Was it ever recorded?",
      short: "There is no easy way to record it.",
      missing: "The determinant never enters the record; no low-friction capture path exists.",
      consequence: "The system cannot reason about what it never received — and absence gets read as absence of relevance.",
      refs: [6, 2]
    },
    {
      id: "semantic", n: 2, name: "Semantic", color: "#8A5CE0",
      question: "Can other systems understand it?",
      short: "It is written down, but no machine can read or share it.",
      missing: "The determinant is recorded as free text or a local checkbox, without a standard code.",
      consequence: "The context cannot cross institutional or national borders, feed decision support, or be added up across patients.",
      refs: [6, 4]
    },
    {
      id: "experiential", n: 3, name: "Experiential", color: "#E0921F",
      question: "Is there a box shaped for it?",
      short: "Lived experience doesn't fit in a form field.",
      missing: "Lived experience, preferences, informal-care arrangements — information whose shape no structured field can hold.",
      consequence: "The reality that drives adherence and outcome is absent from the decision, even when the clinician wants it.",
      refs: [1, 3]
    },
    {
      id: "governance", n: 4, name: "Governance", color: "#2FA866",
      question: "Is it allowed to cross the boundary?",
      short: "The data exists — in another sector's system.",
      missing: "A legal, organisational and interoperable route that would let existing data cross a sector boundary.",
      consequence: "Knowledge stays siloed while being well maintained; collective and cross-species learning does not happen.",
      refs: [2, 6, 1]
    },
    {
      id: "evaluative", n: 5, name: "Evaluative", color: "#D94C7C",
      question: "Does anyone measure it?",
      short: "No indicator counts it, so no one asks for it.",
      missing: "An indicator that registers the determinant in the metrics that drive institutional behaviour.",
      consequence: "What is not measured is not asked for — the invisibility reproduces itself.",
      refs: [4, 5]
    }
  ];

  /* ------------------------------------------------------------------
     ODH Steering Wheel (Benis et al. 2021 [2])
     ------------------------------------------------------------------ */
  const KEYS = [
    { id: "onehealth", name: "One Health", text: "Human, animal and environmental health are one system — what happens to animals and the environment shapes human health, and vice versa." },
    { id: "digitalhealth", name: "Digital Health", text: "Data, devices, software and networks used to understand and support health." }
  ];

  const PERSPECTIVES = [
    { id: "individual", name: "Individual", full: "Individual health & well-being",
      text: "The single person in front of the clinician — their body, their life, their choices." },
    { id: "population", name: "Population", full: "Population & society",
      text: "Groups and communities — what becomes visible (or not) only when many people's data is added up." },
    { id: "ecosystem", name: "Ecosystem", full: "Ecosystem",
      text: "The wider web of people, animals, environments and institutions in which health is produced." }
  ];

  // angle = centre of the 72° sector, in degrees, counter-clockwise from 3 o'clock
  const DIMENSIONS = [
    { id: "citizens", name: "Citizens' Engagement & Education", angle: 90, fill: "#DCE7F7", fillDark: "#24344F",
      text: "People taking part in their own health: what citizens know, share and contribute." },
    { id: "healthcare", name: "Healthcare", angle: 18, fill: "#D6EBDC", fillDark: "#1F3D2C",
      text: "The clinical encounter and the systems that support it — where most decisions are taken." },
    { id: "industry", name: "Healthcare Industry 4.0", angle: -54, fill: "#EEE1F7", fillDark: "#38284B",
      text: "Sensors, devices, algorithms and AI: the automated and data-driven side of health." },
    { id: "humanvet", name: "Human & Veterinary Healthcare", angle: -126, fill: "#FAE5D4", fillDark: "#4A3220",
      text: "Human and animal medicine working together — especially for diseases that jump between species." },
    { id: "environment", name: "Environment", angle: 162, fill: "#D6EFF1", fillDark: "#1C4045",
      text: "Air, water, soil, climate and biodiversity — the conditions we all live in." }
  ];

  const TECH_RING = {
    name: "Technology Ring",
    text: "The outer ring of the Steering Wheel: interoperability, standards and infrastructure that let data move between all the parts."
  };

  const CLUSTERS = [
    { id: "capture", name: "Capture-surface", archetypes: [1, 2, 4],
      text: "The context never enters the record at all." },
    { id: "boundary", name: "System-boundary", archetypes: [3, 5],
      text: "The data exists in structured form — but it does not cross a boundary: an algorithm's training data, or another sector's rules." }
  ];

  /* ------------------------------------------------------------------
     The five archetypes (v0.2 Table 2 + decision failures)
     wheel: angle (deg) + radius on the 0–380 wheel scale
     ------------------------------------------------------------------ */
  const ARCHETYPES = [
    {
      n: 1, id: "sdoh",
      name: "SDOH Documentation Gap",
      plain: "The life around the patient",
      tagline: "Housing, food and transport shape health — yet they rarely make it into the medical record.",
      color: "#1F5FBF",
      layers: ["informational", "semantic"],
      perspectives: ["individual", "population"],
      spillover: [],
      dimensions: ["healthcare", "citizens"],
      cluster: "capture",
      wheel: { angle: 54, r: 115 },
      summary:
        "Social determinants that clinicians themselves consider vital — housing, food security, transport, money, childcare — are not routinely captured because there is no easy, structured way to record them. The problem is not that clinicians don't care: it's the shape of the record.",
      stats: [
        { value: "18.2%", label: "document housing instability consistently", note: "among providers who consider it clinically vital", ref: 6 },
        { value: "16.4%", label: "document food insecurity consistently", note: "among providers who consider it clinically vital", ref: 6 },
        { value: "22.7%", label: "document transport access consistently", note: "among providers who consider it clinically vital", ref: 6 },
        { value: "14.8×", label: "higher odds of documenting any social vs. any environmental determinant", ref: 6 }
      ],
      failures: [
        { title: "Discharged into instability",
          text: "A patient judged medically stable is sent home. Their housing insecurity — which predicts the readmission that follows — never entered the chart.",
          ref: [6] },
        { title: "Insulin without meals",
          text: "An insulin regimen is designed assuming regular mealtimes, for a patient who is food-insecure.",
          ref: [6] },
        { title: "A follow-up no one can reach",
          text: "A follow-up interval is set assuming the patient can get to the clinic. When they can't, the missed visit is recorded as 'non-compliance' rather than as a system that was out of reach.",
          ref: [6] }
      ],
      determinants: ["Housing stability", "Food security", "Transportation access", "Financial stability", "Childcare availability", "Personal safety", "Refugee status", "Access to firearms"],
      mechanism: {
        informational: "Many social determinants have no structured field, or the field is buried outside the normal workflow. Clinicians know — but the record gives them no low-friction way to say it. Ease of charting shapes what gets captured.",
        semantic: "Where social context is recorded, it often lives in free text or local checkboxes without standard codes — so it can't be added up across hospitals, fed to decision support, or exchanged between systems. Notably, the one social determinant with a long-established structured field, smoking status, is the one documented consistently by a substantial majority."
      },
      refs: [6]
    },
    {
      n: 2, id: "environment",
      name: "Environmental Determinant Blindness",
      plain: "The air, water and climate around the patient",
      tagline: "What people breathe, drink and live through is almost entirely absent from clinical decisions.",
      color: "#2E8B4A",
      layers: ["informational", "evaluative"],
      perspectives: ["population", "ecosystem"],
      spillover: [],
      dimensions: ["environment", "industry"],
      cluster: "capture",
      wheel: { angle: 162, r: 190 },
      summary:
        "Environmental exposures — air pollution, water quality, household toxins, extreme weather — matter for clinical and public-health decisions, yet they are missing from clinical records and from most of the indicators that health institutions are judged by. Even where social context gains some ground, environmental context does not.",
      stats: [
        { value: "<5%", label: "of providers consistently document any environmental determinant", note: "other than infectious-disease outbreaks (31%)", ref: 6 },
        { value: "18.4%", label: "find any environmental determinant easy to chart", note: "compared with 68.2% for social determinants", ref: 6 },
        { value: "31%", label: "document infectious-disease outbreaks consistently — the only environmental exception", ref: 6 }
      ],
      failures: [
        { title: "Asthma triaged without the air",
          text: "A child's asthma attack is triaged on clinical signs alone, while the air quality where the child lives stays outside the record.",
          ref: [6] },
        { title: "Pregnancy advice without exposure history",
          text: "Perinatal counselling goes ahead with no history of water contamination or household toxin exposure.",
          ref: [6] }
      ],
      determinants: ["Ambient air quality", "Drinking-water quality", "Household toxins", "Extreme-weather exposure", "Infectious-disease outbreaks (partly)", "Heat and cold events", "Antimicrobial resistance in the local environment", "Disease-carrying vectors", "Biodiversity & ecosystem signals"],
      mechanism: {
        informational: "Environmental data exists — in environmental-monitoring systems, not in health records. There is no routine path for it to enter the clinical picture, and charting it is hard.",
        evaluative: "The outcomes hospitals are measured on (readmissions, mortality, length of stay) don't account for exposure. Even if environmental data were captured, it would not register in the metrics that drive institutional behaviour — so nobody asks for it."
      },
      refs: [6, 2]
    },
    {
      n: 3, id: "algorithmic",
      name: "Algorithmic Data Poverty",
      plain: "Patients the machine was never trained to see",
      tagline: "The patient is in the room — but misrepresented in the data the device or algorithm was built on.",
      color: "#7A4FC0",
      layers: ["semantic", "evaluative"],
      perspectives: ["individual", "population"],
      spillover: [],
      dimensions: ["industry"],
      cluster: "boundary",
      wheel: { angle: -54, r: 115 },
      summary:
        "Devices and algorithms are built and tested on particular groups of people. Patients outside those groups are present in the physical world yet misrepresented inside the computational model. These 'digital determinants of health' — data poverty, algorithmic bias, accessibility — amplify inequities that already exist.",
      stats: [
        { value: "11–19%", label: "lower accuracy of recognition systems for Black women", ref: 4 },
        { value: "SpO₂ ↑", label: "pulse oximetry overestimates oxygen saturation in patients with darker skin", ref: 4 }
      ],
      failures: [
        { title: "A reassuring number that isn't",
          text: "Escalation of COVID-19 treatment is delayed because the pulse oximeter overestimates oxygen saturation in a patient with darker skin.",
          ref: [4] },
        { title: "AI that sees some patients less well",
          text: "AI-assisted imaging underperforms for groups that were under-represented in its training data.",
          ref: [4, 5] },
        { title: "Triage that assumes you can see and hear",
          text: "A video-first telemedicine triage pathway shuts out patients with hearing or visual impairment.",
          ref: [4, 5] }
      ],
      closing: "In none of these cases did clinical judgement overlook the patient. The patient was misrepresented in the cohort on which the system was built.",
      determinants: ["Algorithmic bias", "Data poverty", "Information asymmetry", "Accessibility (visual, hearing, motor, cognitive)", "Digital literacy", "Affordability of devices & connectivity", "Digital availability", "Technology personalisation"],
      mechanism: {
        semantic: "The patient exists, but is wrongly represented in the model — missing from the training data, or treated as an outlier. It isn't a missing field; it is a mis-mapped person. Pulse oximetry treats skin pigmentation as noise rather than as something to calibrate for.",
        evaluative: "Bias stays hidden because it isn't measured: performance for specific groups is rarely reported next to overall accuracy, and post-deployment evaluation is uncommon. The invisibility is what the evaluation does not look at."
      },
      refs: [4, 5]
    },
    {
      n: 4, id: "narrative",
      name: "Patient Narrative Absence",
      plain: "The patient's own voice",
      tagline: "Wishes, lived experience and the people who care at home have no box to go in.",
      color: "#D98014",
      layers: ["experiential"],
      perspectives: ["individual"],
      spillover: ["population"],
      dimensions: ["citizens"],
      cluster: "capture",
      wheel: { angle: 90, r: 78 },
      summary:
        "Preferences, lived experience and informal care arrangements are information whose shape no structured field can hold. Free text may exist somewhere, but it is not findable at the moment a decision is made — so the patient's voice is lost at every handover.",
      stats: [
        { value: "0", label: "information systems in which the informal caregiver is documented", note: "in the heart-failure example", ref: 1 },
        { value: "Unlinked", label: "decisions: the patient's earlier conversation never connects to the later decision", ref: 3 }
      ],
      failures: [
        { title: "A wish spoken, never recorded",
          text: "An intensive-care team escalates ventilation for a patient who, months earlier in an outpatient visit, said they wanted comfort-only care. It was never recorded in structured form.",
          ref: [1, 3] },
        { title: "The invisible caregiver",
          text: "A heart-failure plan assumes a patient who manages alone. In fact they depend on a daughter who holds down two jobs — and who appears in no information system.",
          ref: [1, 3] }
      ],
      determinants: ["Treatment preferences & goals of care", "Lived-experience symptom narrative", "Informal caregiver presence, capacity and limits", "What the illness means to the person", "Health literacy & the patient's own explanation of their illness", "Cultural and spiritual context", "Economic constraints, in the patient's own words"],
      mechanism: {
        experiential: "Structured fields flatten narrative. The problem is not 'no field' (as in the SDOH gap) but 'no field of the right shape'. Free text exists, but it is not retrievable at decision time at scale — so it is operationally invisible. Systems modelling describes this as an unlinked decision in the continuity of care."
      },
      refs: [1, 3]
    },
    {
      n: 5, id: "silos",
      name: "Cross-Sector Governance Silos",
      plain: "Knowledge held by someone else",
      tagline: "Vets, environmental agencies and other countries hold the signal — but there is no route to the clinic.",
      color: "#C23A6B",
      layers: ["governance"],
      perspectives: ["ecosystem", "population"],
      spillover: [],
      dimensions: ["humanvet", "environment"],
      cluster: "boundary",
      wheel: { angle: -162, r: 190 },
      summary:
        "Here the data is not missing. It exists, is structured and is well maintained — in a veterinary, agricultural, environmental or foreign health system. What is missing is the legal, organisational and technical route that would let it reach the clinical decision.",
      stats: [
        { value: "Exists", label: "the data is structured and maintained in its home agency", ref: 2 },
        { value: "No route", label: "from that agency to the clinical decision", ref: 1 }
      ],
      failures: [
        { title: "The early warning that stays on the farm",
          text: "Livestock deaths and wildlife die-offs are recorded in veterinary and agricultural systems that never reach human public-health decision-makers.",
          ref: [2] },
        { title: "A history held in another country",
          text: "A migrant patient's immunisation history sits in the health system of another EU member state, out of reach of the clinician in front of them.",
          ref: [1, 2] },
        { title: "An alert that never arrives",
          text: "A regional water-contamination event is known to the environmental authority — but triggers no alert in local primary care.",
          ref: [1, 2] }
      ],
      closing: "In each case the data exists and is maintained. The route by which it could reach the clinical decision does not.",
      determinants: ["Veterinary surveillance signals", "Zoonotic disease indicators", "Environmental-agency exposure alerts", "Cross-border patient-record fragments", "Social-services context held by municipalities", "Public-health intelligence held outside clinical systems"],
      mechanism: {
        governance: "Nothing is wrong with the data itself. What is missing is the legal, organisational and interoperability route across sector boundaries. During COVID-19, fragmented surveillance data meant public-health decisions were made on partial pictures."
      },
      refs: [2, 1]
    }
  ];

  /* ------------------------------------------------------------------
     Who carries the burden (v0.2 "Distribution of the burden" + matrix)
     ------------------------------------------------------------------ */
  const STAKEHOLDERS = [
    {
      id: "patients", name: "Patients & families", icon: "person",
      intro: "Invisibility is not evenly spread. It concentrates on people who are already disadvantaged.",
      items: [
        { name: "Low-income and food-insecure households", a: [1, 3] },
        { name: "People in rural or transport-poor areas", a: [1, 3, 5] },
        { name: "Recent immigrants and refugees", a: [1, 3, 5] },
        { name: "Residents of polluted and climate-vulnerable places", a: [2, 5] },
        { name: "Children with respiratory disease", a: [2] },
        { name: "Outdoor workers and communities next to industrial sites", a: [2] },
        { name: "People with sensory, motor or cognitive impairment", a: [3] },
        { name: "Older adults with limited digital literacy", a: [3] },
        { name: "Patients outside the groups devices and algorithms were validated on", a: [3] },
        { name: "Patients whose care depends on an informal caregiver", a: [4] },
        { name: "Family caregivers themselves", a: [4] },
        { name: "People with complex chronic, mental-health or palliative-care needs", a: [4] },
        { name: "People who work with livestock or live near wildlife", a: [5] }
      ]
    },
    {
      id: "clinicians", name: "Clinicians", icon: "steth",
      intro: "For health professionals, invisibility is a working condition: acting on information they know is incomplete.",
      items: [
        { name: "Primary-care providers", a: [1, 4, 5] },
        { name: "Discharge planners and case managers", a: [1, 4] },
        { name: "Lung specialists, paediatricians and occupational-medicine doctors — getting environmental data through informal channels", a: [2] },
        { name: "Clinicians using AI tools and devices — inheriting bias with no way to detect it", a: [3] },
        { name: "Palliative-care, psychiatry and paediatric teams — losing the narrative at handover", a: [4] },
        { name: "Social workers and community health workers", a: [4] },
        { name: "Public-health and infectious-disease practitioners, and One Health-minded vets", a: [2, 5] }
      ]
    },
    {
      id: "institutions", name: "Institutions", icon: "building",
      intro: "Organisations carry invisibility as cost nobody attributes to it.",
      items: [
        { name: "Safety-net hospitals — absorbing the readmissions", a: [1] },
        { name: "Payers under value-based contracts — absorbing the variance", a: [1] },
        { name: "Public-health agencies — holding data whose clinical value they can't deliver", a: [2, 5] },
        { name: "Environmental-monitoring agencies", a: [2, 5] },
        { name: "Device and AI makers, regulators and accreditation bodies", a: [3] },
        { name: "Veterinary surveillance bodies and social-services departments", a: [5] },
        { name: "Cross-border health-information exchanges", a: [5] }
      ]
    },
    {
      id: "ecosystem", name: "Ecosystem", icon: "leaf",
      intro: "At the widest scale, whole communities of knowledge run in parallel to clinical care and never meet it.",
      items: [
        { name: "The One Health community", a: [2, 5] },
        { name: "Environmental epidemiologists and climate-health researchers", a: [2] },
        { name: "Communities whose social data never adds up into population knowledge", a: [1] },
        { name: "Patient-reported experience that could inform population decisions but is never captured", a: [4] }
      ]
    }
  ];

  /* ------------------------------------------------------------------
     Why invisibility persists (v0.2 "Mechanisms")
     ------------------------------------------------------------------ */
  const MECHANISMS = [
    { name: "Capture friction", layers: ["informational"], ref: [6],
      text: "Relevant context stays out because there is no fitting field, screening routine or low-effort way to record it. Knowing something matters does not automatically mean it gets documented." },
    { name: "Semantic fragmentation", layers: ["semantic"], ref: [3],
      text: "Information is present but scattered as free text, local categories and inconsistent formats that can't be reliably read, exchanged or reused across time and care settings." },
    { name: "Representational exclusion", layers: ["semantic", "evaluative"], ref: [4, 5],
      text: "Devices and algorithms developed on some populations are deployed on others. Data poverty and algorithmic design quietly reinforce existing inequities." },
    { name: "Boundary & incentive failures", layers: ["experiential", "governance", "evaluative"], ref: [1, 2],
      text: "Patient experience stays in conversation; environmental, public-health and veterinary data stay in separate institutions. Governance rules, organisational separation and missing indicators keep existing knowledge out of the decision loop." }
  ];

  const CHAIN = [
    "Not captured",
    "Not standardised",
    "Not linked",
    "Not evaluated",
    "Not a priority"
  ];

  /* ------------------------------------------------------------------
     Home: an illustrative composite decision (labelled as such)
     ------------------------------------------------------------------ */
  const STORY = {
    patient: "Patient, 71 · heart failure · recovering from COVID-19",
    decision: "Decision: discharge home",
    rows: [
      { field: "Clinical status", shown: "Medically stable", a: 1,
        hidden: "Housing is insecure — and was never charted. Among providers who call housing vital, only 18.2% document it consistently." },
      { field: "Oxygen saturation", shown: "94% — reassuring", a: 3,
        hidden: "The pulse oximeter overestimates saturation on darker skin. The reassuring number may not be true for this patient." },
      { field: "Care at home", shown: "Self-manages medication", a: 4,
        hidden: "Depends on a daughter who works two jobs, and once said they wanted comfort-focused care. Neither is in any system." },
      { field: "Exposure history", shown: "—", a: 2,
        hidden: "Lives where air quality is poor. Fewer than 5% of providers consistently document any environmental exposure." },
      { field: "Active alerts", shown: "None", a: 5,
        hidden: "The environmental authority knows about a regional water-contamination event. No route brings that alert into primary care." }
    ],
    moral: "Every field was filled. The clinical reasoning was sound. The decision still failed — because the context that determined the outcome was never visible."
  };

  const GLOSSARY = {
    EHR: "Electronic Health Record — the digital chart where clinicians record information about a patient.",
    SDOH: "Social Determinants of Health — the conditions people are born, live and work in (housing, food, income, transport…) that shape their health.",
    BMHI: "Biomedical and Health Informatics — the science and practice of health data, information systems and digital tools.",
    ODH: "One Digital Health — a framework that joins Digital Health with One Health (human, animal and environmental health as one system).",
    "One Health": "The idea that human, animal and environmental health are interconnected and must be managed together.",
    "digital determinants": "Digital determinants of health — factors such as data poverty, algorithmic bias, digital literacy and access to technology that shape health outcomes."
  };

  const REFERENCES = [
    { n: 1, short: "Alizadeh et al., 2025",
      text: "Alizadeh M, Azizi N, Mahdavi S, Baghlani F. Unveiling the shadows: obstacles, consequences, and challenges of information opacity in healthcare systems. Philos Ethics Humanit Med. 2025;20:6.",
      doi: "10.1186/s13010-025-00170-6" },
    { n: 2, short: "Benis et al., 2021",
      text: "Benis A, Tamburis O, Chronaki C, Moen A. One Digital Health: A Unified Framework for Future Health Ecosystems. J Med Internet Res. 2021;23(2):e22189.",
      doi: "10.2196/22189" },
    { n: 3, short: "Champion et al., 2019",
      text: "Champion C, Kuziemsky C, Affleck E, Alvarez GG. A systems approach for modeling health information complexity. Int J Inf Manage. 2019;49:343–354.",
      doi: "10.1016/j.ijinfomgt.2019.07.002" },
    { n: 4, short: "Chidambaram et al., 2024",
      text: "Chidambaram S, Jain B, Jain U, Mwavu R, Baru R, Thomas B, et al. An introduction to digital determinants of health. PLOS Digit Health. 2024;3(1):e0000346.",
      doi: "10.1371/journal.pdig.0000346" },
    { n: 5, short: "Fraser et al., 2023",
      text: "Fraser HS, Marcelo A, Kalla M, Kalua K, Celi LA, Ziegler J. Digital determinants of health: Editorial. PLOS Digit Health. 2023;2(11):e0000373.",
      doi: "10.1371/journal.pdig.0000373" },
    { n: 6, short: "Sood et al., 2024",
      text: "Sood N, Stetter C, Kunselman A, Jasani S. The relationship between perceptions of electronic health record usability and clinical importance of social and environmental determinants of health on provider documentation. PLOS Digit Health. 2024;3(1):e0000428.",
      doi: "10.1371/journal.pdig.0000428" }
  ];

  return { META, LAYERS, KEYS, PERSPECTIVES, DIMENSIONS, TECH_RING, CLUSTERS, ARCHETYPES,
           STAKEHOLDERS, MECHANISMS, CHAIN, STORY, GLOSSARY, REFERENCES };
})();
