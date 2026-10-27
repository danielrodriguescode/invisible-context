/* =====================================================================
   (In)Visible Health: shared content model
   Source of truth: "EFMI LEAD - The Grand Challenge" (draft 2026-10-21),
   the shared document of the three LEAD sub-groups. Lab-specific content
   lives in data-ifal.js, data-bvdl.js and data-etl.js, which extend
   window.LEAD. Reference numbers [1] to [73] follow the document's list.
   ===================================================================== */

window.LEAD = (function () {

  const META = {
    title: "(In)Visible Health",
    subtitle: "Tracing the unseen layers of health ecosystems",
    challenge: "Invisible Context",
    cohort: "EFMI LEAD cohort · yEFMI",
    question:
      "When health decisions fail, how much of the relevant context was never digitally or cognitively visible in the first place?"
  };

  /* ------------------------------------------------------------------
     The cohort and its three labs (document front matter and the
     "Tasks" and "Connections" boxes at the start of each section)
     ------------------------------------------------------------------ */
  const LABS = [
    {
      id: "ifal", n: 1, short: "IFAL", verb: "Diagnose",
      name: "Invisible Failure Analysis Lab",
      role: "Diagnostic engine",
      question: "Which contextual determinants are most systematically invisible, and to whom?",
      output: "Context Invisibility Map",
      route: "#/ifal",
      members: ["Alessandra Introvaia", "Daniel Alexandre Relvas Rodrigues", "Kirubel Biruk Shiferaw"],
      tasks: [
        "Diagnose the contextual determinants of human, animal and environmental health that are most systematically invisible to BMHI systems",
        "Diagnose the actors to whom they are invisible",
        "Diagnose the mechanisms by which they remain unseen"
      ]
    },
    {
      id: "bvdl", n: 2, short: "BVDL", verb: "Design",
      name: "BMHI Visibility Design Lab",
      role: "Technical conversion engine",
      question: "What forms of BMHI visibility could capture them?",
      output: "BMHI Visibility Hypothesis Board",
      route: "#/bvdl",
      members: ["Matthieu Bonjour", "Ivan Cerovečki", "Eliana Mendonça Almeida e Silva", "Simon Luca Lewerenz"],
      tasks: [
        "Define the technical, operational and semantic possibilities within BMHI systems to turn hidden determinants of human, animal and environmental health into visible, actionable contextual intelligence",
        "Identify methods of data acquisition for relevant hidden contextual determinants",
        "Describe actionable data-acquisition models, with particular regard to ODHness and architecture logic"
      ]
    },
    {
      id: "etl", n: 3, short: "ETL", verb: "Translate",
      name: "European Translation Lab",
      role: "Strategic proposal engine",
      question: "Why is this strategically European?",
      output: "European Opportunity",
      route: "#/etl",
      members: ["Konstantinos Karitis", "Janne Kommusaar", "Maria Parra Rodriguez-Armijo"],
      thanks: ["Josefin Hagström"],
      tasks: [
        "Identify the ways in which European collaboration and common action can address invisible health context",
        "Define how the ODH dimensions can be put into operation, with particular regard to the ODH framework layers",
        "Identify the European added value of the intellectual capital the cohort has built"
      ]
    }
  ];

  // Hand-offs between labs, as stated in the document's "Connections" boxes
  const CONNECTIONS = [
    { from: "ifal", to: "bvdl", label: "Layers and archetypes of invisibility",
      text: "IFAL passes on the five layers and five archetypes; BVDL gives each one a technical grounding." },
    { from: "bvdl", to: "etl", label: "An implementable visibility infrastructure",
      text: "BVDL passes on the data sources, mechanisms and standards; ETL tests whether they fit implementable European digital infrastructures." },
    { from: "etl", to: "ifal", label: "Which invisibilities matter for Europe?",
      text: "ETL returns prioritisation criteria so that IFAL's next iteration can confirm, reframe or deprioritise each invisibility." }
  ];

  const ACKNOWLEDGEMENTS = {
    text: "The cohort thanks Lars Lindsköld for generous support, and Oscar Tamburis and Mihaela Crişan-Vida for guidance and mentorship.",
    people: ["Lars Lindsköld", "Oscar Tamburis", "Mihaela Crişan-Vida"]
  };

  /* ------------------------------------------------------------------
     Home: where to start, by time available or by background
     (same paths as the PDF guide, MAP/guide/guide.html, page 3).
     A step has href (a page), scroll (an id on the home page) or neither.
     ------------------------------------------------------------------ */
  const START = {
    paths: [
      { time: "2 min", title: "The big picture", steps: [
        { scroll: "record", text: "Click each field of the patient record, or Show all" },
        { scroll: "labs", text: "Scroll to Three labs" } ] },
      { time: "10 min", title: "Follow one invisibility", steps: [
        { href: "#/archetype/1", text: "Open one of the five archetypes" },
        { text: "Use the Diagnose · Design · Translate buttons under its title" },
        { text: "End with the shared problem statement, filled in" } ] },
      { time: "30 min", title: "Go deep in one lab", labs: true, steps: [
        { text: "Pick a lab" },
        { text: "Work through the tabs in its coloured strip, left to right" } ] }
    ],
    profiles: [
      { id: "clinician", name: "Clinician", go: [
        { scroll: "record", title: "The patient record", text: "The discharge that looks safe until you reveal what is missing." },
        { href: "#/archetype/4", title: "Patient Narrative Absence", text: "Preferences and caregivers that never reach the chart." },
        { href: "#/people", title: "Stakeholders", text: "Who carries the burden." } ] },
      { id: "clinres", name: "Clinical researcher", go: [
        { href: "#/challenge", title: "The Challenge", text: "The evidence in brief." },
        { href: "#/layers", title: "Five layers", text: "The diagnostic lens and its self-reinforcing cycle." },
        { href: "#/etl/gates", title: "Two gates", text: "When a gap becomes a European priority." } ] },
      { id: "engineer", name: "Engineer or developer", go: [
        { href: "#/bvdl/infrastructure", title: "Data infrastructure", text: "Sources, capture instruments, analysis." },
        { href: "#/bvdl/responses", title: "Visibility responses", text: "One design answer per layer and per archetype." },
        { href: "#/bvdl", title: "Design overview", text: "Semantic, technical and governance interoperability." } ] },
      { id: "infres", name: "Informatics researcher", go: [
        { href: "#/bvdl/issues", title: "Issues and research", text: "Four study designs, with data and partners." },
        { href: "#/bvdl/odhness", title: "ODHness", text: "A proposed metric for visibility maturity." },
        { href: "#/map", title: "The Map", text: "The One Digital Health wheel, interactive." } ] }
    ]
  };

  /* ------------------------------------------------------------------
     The Grand Challenge (Foreword and Background)
     ------------------------------------------------------------------ */
  const CHALLENGE = {
    timeline: [
      { when: "October 2025", where: "Osnabrück, Germany",
        text: "EFMI establishes the LEAD cohort at its Special Topic Conference: young professionals in Biomedical and Health Informatics from several European countries, learning together in a cohort with peers and experts." },
      { when: "May 2026", where: "Genova, Italy",
        text: "At the annual EFMI conference (MIE 2026) the cohort receives its Grand Challenge: design a way to detect, structure, integrate and act on health-relevant information that remains invisible to health systems, within One Digital Health." },
      { when: "October 2026", where: "Shared document",
        text: "The three sub-groups assemble their outputs into one document, The Grand Challenge." }
    ],
    examples: [
      { text: "A patient is judged medically fit for discharge while their housing instability remains unrecorded.", a: 1 },
      { text: "A follow-up interval is set without knowing whether the patient can reach the clinic.", a: 1 },
      { text: "An oxygen-saturation reading looks reassuring, but the device was never calibrated for the patient's skin pigmentation.", a: 3 }
    ],
    absences: [
      { layer: "informational", text: "a determinant that is never recorded" },
      { layer: "semantic", text: "a determinant recorded in a form other systems cannot interpret" },
      { layer: "experiential", text: "a determinant for which no structured field of suitable shape exists" },
      { layer: "governance", text: "a determinant held in another sector's well-governed database" },
      { layer: "evaluative", text: "a determinant that no outcome indicator measures" }
    ],
    domains: [
      { name: "Human health", text: "Electronic health records and wearables" },
      { name: "Animal health", text: "Veterinary records and agricultural data" },
      { name: "Environment", text: "Remote sensing and sensor networks" }
    ]
  };

  // LEAD as a cybernetic learning loop (from the bootcamp design)
  const LEAD_PHASES = [
    { name: "Problem framing", text: "Name the problem precisely: which context is missing, for whom, and why." },
    { name: "Informational capitalisation", text: "Turn scattered evidence into shared, structured knowledge the cohort can build on." },
    { name: "Systemic negotiation", text: "Confront the diagnosis with what information systems, standards and organisations can actually do." },
    { name: "Translational solution building", text: "Turn the result into a proposal that can travel: European collaboration, funding and education." }
  ];

  /* ------------------------------------------------------------------
     ODH Steering Wheel, as drawn in Benis et al. 2021, Fig. 1 [2]
     Angles in degrees, counter-clockwise from 3 o'clock.
     ------------------------------------------------------------------ */
  const CORE = {
    name: "One Digital Health",
    text: "A unified framework that brings the One Health and Digital Health communities together, so that human, animal and environmental data can inform health decisions."
  };

  const KEYS = [
    { id: "onehealth", name: "One Health", angle: 180,
      text: "Human, animal and environmental health are treated as one interconnected system." },
    { id: "digitalhealth", name: "Digital Health", angle: 0,
      text: "Data, devices, software and networks used to understand and support health." }
  ];

  const PERSPECTIVES = [
    { id: "individual", name: "Individual", full: "Individual Health and Wellbeing", angle: 90,
      text: "The individual person: their health, circumstances and choices." },
    { id: "population", name: "Population", full: "Population and Society", angle: -30,
      text: "Groups and communities: patterns that become visible only when data from many people are combined." },
    { id: "ecosystem", name: "Ecosystem", full: "Ecosystem", angle: 210,
      text: "The wider system of people, animals, environments and institutions in which health is produced." }
  ];

  const DIMENSIONS = [
    { id: "education", name: "Education", angle: 54,
      text: "Education and citizen science: health and digital literacy for the general population as well as for professionals." },
    { id: "citizens", name: "Citizens' engagement", angle: 126,
      text: "Citizens taking part in their own health and in the use of their health data." },
    { id: "industry", name: "Healthcare Industry (4.0)", angle: 198,
      text: "Automation, devices, sensors, algorithms and artificial intelligence in health care." },
    { id: "humanvet", name: "Human and Veterinary Healthcare", angle: 270,
      text: "Human and animal health care working together, from the clinical encounter to diseases shared between species." },
    { id: "environment", name: "Environment", angle: 342,
      text: "Air, water, soil, climate and biodiversity, increasingly monitored through sensors and smart environments." }
  ];

  const TECH_RING = {
    name: "Technology ring",
    text: "The dotted ring between perspectives and dimensions represents the digital technologies that connect the parts of the wheel. In this map, the five archetypes are placed on this ring because each one describes a connection that does not work."
  };

  // "Learn the wheel" walkthrough, built up ring by ring
  const LEARN = [
    { step: 0, title: "One Digital Health", text: "The centre of the wheel is One Digital Health: a framework for future health ecosystems that joins two communities which have rarely shared data.", ref: 2 },
    { step: 1, title: "Two keys", text: "The yellow ring holds the two enabling keys. One Health treats human, animal and environmental health as one system. Digital Health contributes data, devices and software. ODH requires both.", ref: 2 },
    { step: 2, title: "Three perspectives", text: "The blue ring shows three perspectives on health: the individual and their wellbeing, the population and society, and the wider ecosystem.", ref: 2 },
    { step: 3, title: "Five dimensions", text: "The green ring shows five dimensions: citizens' engagement, education, environment, human and veterinary healthcare, and Healthcare Industry 4.0.", ref: 2 },
    { step: 4, title: "The technology ring", text: "The red dotted line is the technology ring: the digital connections that link perspectives and dimensions. When these connections work, relevant context reaches the point of decision.", ref: 2 },
    { step: 5, title: "The five archetypes", text: "This map places the five archetypes of invisible context on the technology ring. Each describes a connection that does not work, so that relevant context does not reach the decision. Select an archetype to see the perspectives and dimensions it involves.", ref: 1 }
  ];

  const GLOSSARY = {
    EHR: "Electronic Health Record: the digital record in which clinicians document patient information.",
    SDOH: "Social Determinants of Health: the conditions in which people are born, live and work (housing, food, income, transport) that influence their health.",
    BMHI: "Biomedical and Health Informatics: the science and practice of health data, information systems and digital tools.",
    ODH: "One Digital Health: a framework that combines Digital Health with One Health (human, animal and environmental health as one system).",
    "One Health": "An approach that treats human, animal and environmental health as interconnected and manages them together.",
    "digital determinants": "Digital determinants of health: factors such as data poverty, algorithmic bias, digital literacy and access to technology that influence health outcomes.",
    ODHness: "The degree to which a digital ecosystem integrates human, animal and environmental data into one coherent framework for health intelligence. BVDL proposes it as a measure of visibility maturity.",
    FAIR: "Findable, Accessible, Interoperable and Reusable: four principles for managing data so that people and machines can find and reuse it.",
    FHIR: "HL7 Fast Healthcare Interoperability Resources: an open standard for exchanging health data between systems through web APIs.",
    "SNOMED CT": "A large clinical terminology that gives each clinical concept (findings, procedures, social circumstances) a unique code that computers can interpret.",
    LOINC: "Logical Observation Identifiers Names and Codes: a standard set of codes for laboratory tests and clinical observations.",
    EHDS: "European Health Data Space: the EU regulation (2025/327) that sets common rules for using and exchanging electronic health data across member states.",
    PROM: "Patient-Reported Outcome Measure: a questionnaire in which patients report their own health status, symptoms or function.",
    PREM: "Patient-Reported Experience Measure: a questionnaire in which patients report their experience of care.",
    NLP: "Natural Language Processing: computational methods that extract structured information from free text.",
    LLM: "Large Language Model: an AI model trained on large amounts of text that can read, summarise and generate language.",
    API: "Application Programming Interface: a defined way for one software system to request data or services from another.",
    "AI Act": "The EU Artificial Intelligence Act (Regulation 2024/1689). It classifies most medical AI as high-risk and requires high-quality, representative data and human oversight.",
    GDPR: "The EU General Data Protection Regulation (2016/679), which governs the processing of personal data.",
    "COST Action": "A four-year European research network funded by COST. It pays for networking (meetings, training schools, short research visits), not for research itself.",
    "Erasmus+": "The EU programme for education, training, youth and sport. Its Cooperation Partnerships fund organisations from several countries to develop and share educational practice.",
    "federated learning": "A way to train a model across several data holders without moving the data. Each site trains locally and only model updates are shared.",
    LEAD: "EducationaL EFMI Assembly Designed for BMHI: a cohort of young BMHI professionals set up by yEFMI as a cybernetic learning framework for future leaders.",
    IFAL: "Invisible Failure Analysis Lab: LEAD sub-group 1, which diagnoses which health context stays invisible, to whom and why.",
    BVDL: "BMHI Visibility Design Lab: LEAD sub-group 2, which designs how health informatics could make that context visible.",
    ETL: "European Translation Lab: LEAD sub-group 3, which makes the case for European action and maps how to fund it.",
    EFMI: "European Federation for Medical Informatics: the umbrella organisation of national health-informatics societies in Europe.",
    yEFMI: "Young EFMI Workgroup: EFMI's working group for early-career health-informatics professionals, which set up LEAD.",
    MIE: "Medical Informatics Europe: EFMI's annual conference. MIE 2026 was held in Genova, Italy.",
    EFSA: "European Food Safety Authority: the EU agency that assesses risks in the food chain, including diseases passed from animals to people.",
    ECDC: "European Centre for Disease Prevention and Control: the EU agency that monitors and assesses infectious-disease threats.",
    "MyHealth@EU": "The EU service that lets patient summaries and e-prescriptions be exchanged between member states for care abroad.",
    "HealthData@EU": "The EU infrastructure, set up under the EHDS, for accessing health data for research and policy across member states.",
    WHO: "World Health Organization: the United Nations agency for international public health.",
    UN: "United Nations: the international organisation whose 2030 Agenda sets the Sustainable Development Goals.",
    EU: "European Union: the political and economic union of 27 European member states.",
    AI: "Artificial Intelligence: computer systems that recognise patterns, make predictions or generate text.",
    HL7: "Health Level Seven International: the organisation that develops health data-exchange standards, including FHIR.",
    IoT: "Internet of Things: everyday devices and sensors connected to the internet that send data automatically.",
    OAuth: "An open standard that lets one system access another on a user's behalf without sharing their password.",
    RESTful: "A common style of web API in which data are requested and sent through standard web addresses.",
    "SMART Guidelines": "WHO's approach to turning guidelines into digital, machine-readable formats. SMART stands for Standards-based, Machine-readable, Adaptive, Requirements-based and Testable.",
    IS: "Information System: software that collects, stores and provides data for an organisation, such as a hospital or a social-security agency."
  };

  // Topic groups for the Glossary page (every GLOSSARY term appears once)
  const GLOSSARY_GROUPS = [
    { name: "The cohort", terms: ["LEAD", "IFAL", "BVDL", "ETL", "EFMI", "yEFMI", "MIE"] },
    { name: "Concepts", terms: ["BMHI", "ODH", "One Health", "ODHness", "SDOH", "digital determinants", "EHR", "PROM", "PREM"] },
    { name: "Standards and technology", terms: ["FAIR", "HL7", "FHIR", "SNOMED CT", "LOINC", "API", "RESTful", "OAuth", "IoT", "IS", "AI", "NLP", "LLM", "federated learning", "SMART Guidelines"] },
    { name: "European and international bodies and rules", terms: ["EU", "UN", "WHO", "EFSA", "ECDC", "EHDS", "MyHealth@EU", "HealthData@EU", "AI Act", "GDPR", "COST Action", "Erasmus+"] }
  ];

  const REFERENCES = [
    {"n": 1, "short": "Alizadeh et al., 2025", "text": "Alizadeh M, Azizi N, Mahdavi S, Baghlani F. Unveiling the shadows: obstacles, consequences, and challenges of information opacity in healthcare systems. Philos Ethics Humanit Med. 2025;20:6.", "url": "https://doi.org/10.1186/s13010-025-00170-6"},
    {"n": 2, "short": "Benis et al., 2021", "text": "Benis A, Tamburis O, Chronaki C, Moen A. One Digital Health: A Unified Framework for Future Health Ecosystems. J Med Internet Res. 2021;23(2):e22189.", "url": "https://doi.org/10.2196/22189"},
    {"n": 3, "short": "Champion et al., 2019", "text": "Champion C, Kuziemsky C, Affleck E, Alvarez GG. A systems approach for modeling health information complexity. Int J Inf Manage. 2019;49:343–354.", "url": "https://doi.org/10.1016/j.ijinfomgt.2019.07.002"},
    {"n": 4, "short": "Sood et al., 2024", "text": "Sood N, Stetter C, Kunselman A, Jasani S. The relationship between perceptions of electronic health record usability and clinical importance of social and environmental determinants of health on provider documentation. PLOS Digit Health. 2024;3(1):e0000428.", "url": "https://doi.org/10.1371/journal.pdig.0000428"},
    {"n": 5, "short": "Chidambaram et al., 2024", "text": "Chidambaram S, Jain B, Jain U, Mwavu R, Baru R, Thomas B, et al. An introduction to digital determinants of health. PLOS Digit Health. 2024;3(1):e0000346.", "url": "https://doi.org/10.1371/journal.pdig.0000346"},
    {"n": 6, "short": "Fraser et al., 2023", "text": "Fraser HS, Marcelo A, Kalla M, Kalua K, Celi LA, Ziegler J. Digital determinants of health: Editorial. PLOS Digit Health. 2023;2(11):e0000373.", "url": "https://doi.org/10.1371/journal.pdig.0000373"},
    {"n": 7, "short": "Denecke et al., 2023", "text": "Denecke K, Romero OR, Merolli M, Miron-Shatz T, Gabarron E, Petersen C. How Participatory Health Informatics Catalyzes One Digital Health. Yearb Med Inform. 2023;32(1):48-54.", "url": "https://doi.org/10.1055/s-0043-1768727"},
    {"n": 8, "short": "Benis et al., 2023", "text": "Benis A, Haghi M, Deserno TM, Tamburis O. One Digital Health Intervention for Monitoring Human and Animal Welfare in Smart Cities: Viewpoint and Use Case. JMIR Med Inform. 2023;11:e43871.", "url": "https://doi.org/10.2196/43871"},
    {"n": 9, "short": "Kirtchuk & Wylie, 2021", "text": "Kirtchuk L, Wylie A. Social and environmental determinants of health. In: Short E. A prescription for healthy living: a guide to lifestyle medicine. London, United Kingdom; San Diego, Ca, United States: Academic Press, An Imprint Of Elsevier; 2021.", "url": null},
    {"n": 10, "short": "Kelly & Fussell, 2015", "text": "Kelly FJ, Fussell JC. Air pollution and public health: emerging hazards and improved understanding of risk. Environ Geochem Health. 2015 Aug;37(4):631-49.", "url": "https://doi.org/10.1007/s10653-015-9720-1"},
    {"n": 11, "short": "Harrison & Dean, 2011", "text": "Harrison KM, Dean HD. Use of data systems to address social determinants of health: a need to do more. Public Health Rep. 2011 Sep-Oct;126 Suppl 3(Suppl 3):1-5.", "url": "https://doi.org/10.1177/00333549111260S301"},
    {"n": 12, "short": "WHO, Global strategy on digital health", "text": "World Health Organization. Global strategy on digital health 2020–2025. Geneva: World Health Organization; 2024.", "url": null},
    {"n": 13, "short": "Mac-Seing et al., 2019", "text": "Mac-Seing M, Le Nogue D, Bagayoko CO, Sy A, Dumas J, Dunbar W, et al. Make visible the invisible: innovative strategies for the future of global health. BMJ Global Health. 2019;4:e001693.", "url": "https://doi.org/10.1136/bmjgh-2019-001693"},
    {"n": 14, "short": "Ott, 2025", "text": "Ott T. Invisibility and Exposure: Challenges of Using AI in Healthcare [Unsichtbarkeit und Exponiertheit: Herausforderungen der Nutzung von KI im Gesundheitssystem]. Zeitschrift für medizinische Ethik, 2025;71(4):488-499.", "url": "https://doi.org/10.30965/29498570-20250143"},
    {"n": 15, "short": "WHO-FIC Interoperability Hub", "text": "World Health Organization. WHO-FIC Interoperability Hub [Internet]. Geneva: World Health Organization; 2019 [cited 2026 Sep 9].", "url": "https://www.who.int/standards/classifications/who-fic-interoperability-hub"},
    {"n": 16, "short": "WHO and HL7, 2023", "text": "World Health Organization. WHO and HL7 collaborate to support adoption of open interoperability standards [Internet]. Geneva: World Health Organization; 2023 [cited 2026 Sep 9].", "url": "https://www.who.int/news/item/03-07-2023-who-and-hl7-collaborate-to-support-adoption-of-open-interoperability-standards"},
    {"n": 17, "short": "Bodenreider et al., 2018", "text": "Bodenreider O, Cornet R, Vreeman DJ. Recent Developments in Clinical Terminologies - SNOMED CT, LOINC, and RxNorm. Yearb Med Inform. 2018 Aug;27(1):129-139.", "url": "https://doi.org/10.1055/s-0038-1667077"},
    {"n": 18, "short": "Vorisek et al., 2022", "text": "Vorisek CN, Lehne M, Klopfenstein SAI, Mayer PJ, Bartschke A, Haese T, Thun S. Fast Healthcare Interoperability Resources (FHIR) for Interoperability in Health Research: Systematic Review. JMIR Med Inform. 2022 Jul 19;10(7):e35724.", "url": "https://doi.org/10.2196/35724"},
    {"n": 19, "short": "Kwong et al., 2019", "text": "Kwong M, Gardner HL, Dieterle N, Rentko V. Optimization of Electronic Medical Records for Data Mining Using a Common Data Model. Top Companion Anim Med. 2019 Dec;37:100364.", "url": "https://doi.org/10.1016/j.tcam.2019.100364"},
    {"n": 20, "short": "WHO, Digital Transformation Handbook", "text": "World Health Organization. Digital Transformation Handbook for Primary Health Care: Optimizing Person-centred Point of Service Systems. Geneva: World Health Organization; 2024.", "url": null},
    {"n": 21, "short": "WHO SMART Guidelines", "text": "World Health Organization. SMART Guidelines [Internet]. Geneva: World Health Organization; [cited 2026 Sep 9].", "url": "https://www.who.int/teams/digital-health-and-innovation/smart-guidelines"},
    {"n": 22, "short": "Tumulak et al., 2024", "text": "Tumulak A, Tin J, Keshavjee K. Towards a Unified Framework for Information and Interoperability Governance. Stud Health Technol Inform. 2024 Feb 19;312:49-53.", "url": "https://doi.org/10.3233/SHTI231310"},
    {"n": 23, "short": "Marmot et al., 2012", "text": "Marmot M, Allen J, Bell R, Bloomer E, Goldblatt P. WHO European review of social determinants of health and the health divide. Lancet. 2012;380(9846):1011-29.", "url": "https://doi.org/10.1016/S0140-6736(12)61228-8"},
    {"n": 24, "short": "Anastasiadou et al., 2025", "text": "Anastasiadou O, Mpogiatzidis P, Tzimourta KD, Angelidis P. Digital Divide: Contrasting Provider and User Insights on Healthcare Services During the COVID-19 Pandemic. Healthcare (Basel). 2025 Jul 25;13(15):1803.", "url": "https://doi.org/10.3390/healthcare13151803"},
    {"n": 25, "short": "Mackenzie & Jeggo, 2019", "text": "Mackenzie JS, Jeggo M. The One Health Approach-Why Is It So Important? Trop Med Infect Dis. 2019 May 31;4(2):88.", "url": "https://doi.org/10.3390/tropicalmed4020088"},
    {"n": 26, "short": "Destoumieux-Garzón et al., 2018", "text": "Destoumieux-Garzón D, Mavingui P, Boetsch G, Boissier J, Darriet F, Duboz P, et al. The One Health concept: 10 years old and a long road ahead. Front Vet Sci. 2018;5:14.", "url": "https://doi.org/10.3389/fvets.2018.00014"},
    {"n": 27, "short": "Jones et al., 2008", "text": "Jones KE, Patel NG, Levy MA, Storeygard A, Balk D, Gittleman JL, Daszak P. Global trends in emerging infectious diseases. Nature. 2008;451(7181):990-3.", "url": "https://doi.org/10.1038/nature06536"},
    {"n": 28, "short": "Landrigan et al., 2018", "text": "Landrigan PJ, Fuller R, Acosta NJR, Adeyi O, Arnold R, Baldé AB, et al. The Lancet Commission on pollution and health. Lancet. 2018;391(10119):462-512.", "url": "https://doi.org/10.1016/S0140-6736(17)32345-0"},
    {"n": 29, "short": "Whitmee et al., 2015", "text": "Whitmee S, Haines A, Beyrer C, Boltz F, Capon AG, Dias BF, et al. Safeguarding human health in the Anthropocene epoch: Report of the Rockefeller Foundation-Lancet Commission on planetary health. Lancet. 2015;386(10007):1973-2028.  2015 Nov 14;386(10007):1944.", "url": "https://doi.org/10.1016/S0140-6736(15)60901-1"},
    {"n": 30, "short": "Romanello et al., 2023", "text": "Romanello M, McGushin A, Di Napoli C, Drummond P, Hughes N, Jamart L, et al. The 2023 report of the Lancet Countdown on health and climate change. Lancet. 2023;402(10419):2346-94.", "url": "https://doi.org/10.1016/S0140-6736(23)01859-7"},
    {"n": 31, "short": "Coravos et al., 2019", "text": "Coravos A, Khozin S, Mandl KD. Developing and adopting safe and effective digital biomarkers to improve patient outcomes. NPJ Digit Med. 2019;2:14.  2019 May 10;2:40.", "url": "https://doi.org/10.1038/s41746-019-0090-4"},
    {"n": 32, "short": "Fuller et al., 2020", "text": "Fuller A, Fan Z, Day C, Barlow C. Digital twin: Enabling technologies, challenges and open research. IEEE Access. 2020;8:108952-71.", "url": "https://doi.org/10.1109/ACCESS.2020.2998358"},
    {"n": 33, "short": "Solar & Irwin, 2010", "text": "Solar O, Irwin A. A Conceptual Framework for Action on the Social Determinants of Health. Geneva: World Health Organization; 2010.", "url": null},
    {"n": 34, "short": "Jordan et al., 2022", "text": "Jordan S, Fontaine C, Hendricks-Sturrup R. Selecting Privacy-Enhancing Technologies for Managing Health Data Use. Front. Public Health 2022 Mar 16;10:814163.", "url": "https://doi.org/10.3389/fpubh.2022.814163"},
    {"n": 35, "short": "Pentland, 2014", "text": "Pentland A. Social Physics: How Social Networks Can Make Us Smarter. New York: Penguin Press; 2014.", "url": null},
    {"n": 36, "short": "Rocher et al., 2019", "text": "Rocher L, Hendrickx JM, de Montjoye YA. Estimating the success of re-identifications in incomplete datasets using generative models. Nat Commun. 2019;10:3069.", "url": "https://doi.org/10.1038/s41467-019-10933-3"},
    {"n": 37, "short": "Kalkman et al., 2022", "text": "Kalkman S, van Delden J, Banerjee A, Tyl B, Mostert M, van Thiel G. Patients’ and public views and attitudes towards the sharing of health data for research: a narrative review of the empirical evidence. J Med Ethics. 2022;48(1):3-13.", "url": "https://doi.org/10.1136/medethics-2019-105651"},
    {"n": 38, "short": "Vayena et al., 2018", "text": "Vayena E, Blasimme A, Cohen IG. Machine learning in medicine: Addressing ethical challenges. PLoS Med. 2018;15(11):e1002689.", "url": "https://doi.org/10.1371/journal.pmed.1002689"},
    {"n": 39, "short": "Rieke et al., 2020", "text": "Rieke N, Hancox J, Li W, Milletari F, Roth HR, Albarqouni S, et al. The future of digital health with federated learning. NPJ Digit Med. 2020;3:119.", "url": "https://doi.org/10.1038/s41746-020-00323-1"},
    {"n": 40, "short": "Floridi, 2016", "text": "Floridi L. Faultless responsibility: on the nature and allocation of moral responsibility for distributed moral actions. Philos Trans A Math Phys Eng Sci. 2016 Dec 28;374(2083):20160112.", "url": "https://doi.org/10.1098/rsta.2016.0112"},
    {"n": 41, "short": "Kitchin, 2014", "text": "Kitchin R. The Data Revolution: Big Data, Open Data, Data Infrastructures and Their Consequences. London: SAGE Publications; 2014.", "url": null},
    {"n": 42, "short": "Wang & Strong, 1996", "text": "Wang RY, Strong DM. Beyond Accuracy: What Data Quality Means to Data Consumers. J Manag Inf Syst. 1996;12(4):5-33.", "url": "https://doi.org/10.1080/07421222.1996.11518099"},
    {"n": 43, "short": "Stilgoe et al., 2013", "text": "Stilgoe J, Owen R, Macnaghten P. Developing a Framework for Responsible Innovation. Res Policy. 2013;42(9):1568-1580.", "url": "https://doi.org/10.1016/j.respol.2013.05.008"},
    {"n": 44, "short": "Jirotka et al., 2017", "text": "Jirotka M, Grimpe B, Stahl BC, Eden G, Hartswood M. Responsible Research and Innovation in the Digital Age. Commun ACM. 2017;60(5):62-68.", "url": "https://doi.org/10.1145/3064940"},
    {"n": 45, "short": "O'Neill, 2013", "text": "O'Neill O. Intelligent Accountability in Education. Oxf Rev Educ. 2013;39(1):4-16.", "url": "https://doi.org/10.1080/03054985.2013.764761"},
    {"n": 46, "short": "van Kessel et al., 2022", "text": "van Kessel R, Hrzic R, O'Nuallain E, Weir E, Wong BLH, Anderson M, Baron-Cohen S, Mossialos E. Digital Health Paradox: International Policy Perspectives to Address Increased Health Inequalities for People Living With Disabilities. J Med Internet Res. 2022 Feb 22;24(2):e33819.", "url": "https://doi.org/10.2196/33819"},
    {"n": 47, "short": "Chakraborty & Elzarka, 2019", "text": "Chakraborty D, Elzarka H. Advanced Internet of Things for Smart Homes: A Review. Wiley Interdiscip Rev Data Min Knowl Discov. 2019;9(2):e1280.", "url": "https://doi.org/10.1002/widm.1280"},
    {"n": 48, "short": "Zuboff, 2019", "text": "Zuboff S. The Age of Surveillance Capitalism: The Fight for a Human Future at the New Frontier of Power. New York: PublicAffairs; 2019.", "url": null},
    {"n": 49, "short": "Floridi & Taddeo, 2016", "text": "Floridi L, Taddeo M. What is data ethics? Philos Trans A Math Phys Eng Sci. 2016 Dec 28;374(2083):20160360.", "url": "https://doi.org/10.1098/rsta.2016.0360"},
    {"n": 50, "short": "Greenhalgh et al., 2004", "text": "Greenhalgh T, Robert G, Macfarlane F, Bate P, Kyriakidou O. Diffusion of innovations in service organizations: systematic review and recommendations. Milbank Q. 2004;82(4):581-629.", "url": "https://doi.org/10.1111/j.0887-378X.2004.00325.x"},
    {"n": 51, "short": "Destoumieux-Garzón et al., 2018", "text": "Destoumieux-Garzón D, Mavingui P, Boetsch G, Boissier J, Darriet F, Duboz P, Fritsch C, Giraudoux P, Le Roux F, Morand S, Paillard C, Pontier D, Sueur C, Voituron Y. The One Health Concept: 10 Years Old and a Long Road Ahead. Front Vet Sci. 2018 Feb 12;5:14.", "url": "https://doi.org/10.3389/fvets.2018.00014"},
    {"n": 52, "short": "Cresswell & Sheikh, 2013", "text": "Cresswell K, Sheikh A. Organizational issues in the implementation and adoption of health information technology innovations: an interpretative review. Int J Med Inform. 2013 May;82(5):e73-86.", "url": "https://doi.org/10.1016/j.ijmedinf.2012.10.007"},
    {"n": 53, "short": "Rogers, 2003", "text": "Rogers EM. Diffusion of Innovations. 5th ed. New York: Free Press; 2003.", "url": null},
    {"n": 54, "short": "Kotter, 1995", "text": "Kotter JP. Leading Change: Why Transformation Efforts Fail. Harv Bus Rev. 1995;73(2):59-67.", "url": null},
    {"n": 55, "short": "Perreault et al., 2020", "text": "Perreault T, Leigh R, Vrana M. Environmental Sensor Networks: A Revolution in the Earth System Science? Earth Sci Rev. 2020;203:103091.", "url": "https://doi.org/10.1016/j.earscirev.2020.103091"},
    {"n": 56, "short": "Beam & Kohane, 2018", "text": "Beam AL, Kohane IS. Big Data and Machine Learning in Health Care. JAMA. 2018 Apr 3;319(13):1317-1318.", "url": "https://doi.org/10.1001/jama.2017.18391"},
    {"n": 57, "short": "European Commission, 2017", "text": "European Commission. European Interoperability Framework: Promoting Seamless Services and Data Flows for European Public Administrations. Luxembourg: Publications Office of the European Union; 2017.", "url": null},
    {"n": 58, "short": "Guo et al., 2020", "text": "Guo Y, Chen Z, Xu K, George TJ, Wu Y, Hogan W, et al. International Classification of Diseases, Tenth Revision, Clinical Modification social determinants of health codes are poorly used in electronic health records. Medicine (Baltimore). 2020;99(52):e23818.", "url": "https://doi.org/10.1097/MD.0000000000023818"},
    {"n": 59, "short": "Wild, 2005", "text": "Wild CP. Complementing the genome with an \"exposome\": the outstanding challenge of environmental exposure measurement in molecular epidemiology. Cancer Epidemiol Biomarkers Prev. 2005;14(8):1847-1850.", "url": "https://doi.org/10.1158/1055-9965.EPI-05-0456"},
    {"n": 60, "short": "Sjoding et al., 2020", "text": "Sjoding MW, Dickson RP, Iwashyna TJ, Gay SE, Valley TS. Racial bias in pulse oximetry measurement. N Engl J Med. 2020;383(25):2477-2478.", "url": "https://doi.org/10.1056/NEJMc2029240"},
    {"n": 61, "short": "Obermeyer et al., 2019", "text": "Obermeyer Z, Powers B, Vogeli C, Mullainathan S. Dissecting racial bias in an algorithm used to manage the health of populations. Science. 2019;366(6464):447-453.", "url": "https://doi.org/10.1126/science.aax2342"},
    {"n": 62, "short": "OECD/EU, 2024", "text": "OECD, European Union. Health at a glance: Europe 2024 — state of health in the EU cycle. Paris: OECD Publishing; 2024.", "url": "https://doi.org/10.1787/b3704e14-en"},
    {"n": 63, "short": "Regulation (EU) 2022/2371", "text": "Regulation (EU) 2022/2371 of the European Parliament and of the Council of 23 November 2022 on serious cross-border threats to health and repealing Decision No 1082/2013/EU. Official Journal of the European Union. 2022.", "url": null},
    {"n": 64, "short": "WHO Europe, 2022", "text": "World Health Organization Regional Office for Europe. Health and care workforce in Europe: time to act. Copenhagen: World Health Organization; 2022.", "url": null},
    {"n": 65, "short": "WHO Europe, 2019", "text": "World Health Organization Regional Office for Europe. Healthy, prosperous lives for all: the European Health Equity Status Report. Copenhagen: World Health Organization; 2019.", "url": null},
    {"n": 66, "short": "United Nations, 2015", "text": "United Nations. Transforming our world: the 2030 Agenda for Sustainable Development. New York: UN; 2015.", "url": null},
    {"n": 67, "short": "AI Act, Regulation (EU) 2024/1689", "text": "Regulation (EU) 2024/1689 of the European Parliament and of the Council of 13 June 2024 laying down harmonised rules on artificial intelligence (Artificial Intelligence Act). Official Journal of the European Union. 2024.", "url": null},
    {"n": 68, "short": "CSDH, 2008", "text": "Commission on Social Determinants of Health. Closing the gap in a generation: health equity through action on the social determinants of health. Geneva: World Health Organization; 2008.", "url": null},
    {"n": 69, "short": "EHDS, Regulation (EU) 2025/327", "text": "Regulation (EU) 2025/327 of the European Parliament and of the Council of 11 February 2025 on the European Health Data Space and amending Directive 2011/24/EU and Regulation (EU) 2024/2847. Official Journal of the European Union. 2025 Mar 5;L(2025/327).", "url": null},
    {"n": 70, "short": "EFSA & ECDC, 2025", "text": "European Food Safety Authority, European Centre for Disease Prevention and Control. The European Union One Health 2024 zoonoses report. EFSA J. 2025;23(12):e9759.", "url": "https://doi.org/10.2903/j.efsa.2025.9759"},
    {"n": 71, "short": "Erasmus+ programme guide", "text": "European Commission. Erasmus+ programme guide, part B, key action 2 — cooperation partnerships [Internet]. Brussels: European Commission.", "url": "https://erasmus-plus.ec.europa.eu/programme-guide/part-b/key-action-2/cooperation-partnerships"},
    {"n": 72, "short": "GDPR, Regulation (EU) 2016/679", "text": "Regulation (EU) 2016/679 of the European Parliament and of the Council of 27 April 2016 on the protection of natural persons with regard to the processing of personal data (General Data Protection Regulation). Official Journal of the European Union. 2016 May 4;L119.", "url": null},
    {"n": 73, "short": "COST Association", "text": "COST Association. Open Call for COST Actions — proposers’ guidelines [Internet]. Brussels: COST Association; [cited 2026 Oct 19].", "url": "https://www.cost.eu/funding/how-to-get-funding/open-call"}
  ];

  return { META, LABS, CONNECTIONS, ACKNOWLEDGEMENTS, START, CHALLENGE, LEAD_PHASES,
           CORE, LEARN, KEYS, PERSPECTIVES, DIMENSIONS, TECH_RING, GLOSSARY, GLOSSARY_GROUPS, REFERENCES };
})();
