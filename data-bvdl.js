/* =====================================================================
   (In)Visible Health: Sub-Group 2, BMHI Visibility Design Lab (BVDL)
   BMHI Visibility Hypothesis Board. Source of truth: "EFMI LEAD - The
   Grand Challenge" (draft 2026-10-21), section 2 (Tables 3 to 6,
   Figure 1, sections 2.1 to 2.3). Reference numbers follow data.js.
   ===================================================================== */

Object.assign(window.LEAD, (function () {

  // Section 2.1: what "visible" means for BMHI
  const VISIBILITY_CHAIN = [
    { name: "Captured", text: "The determinant enters a digital system." },
    { name: "Represented", text: "It is recorded in a defined, computable form." },
    { name: "Exchanged", text: "It can travel between systems and sectors." },
    { name: "Interpreted", text: "The receiving system understands what it means." },
    { name: "Acted on", text: "It reaches the decision it should inform." }
  ];

  const DETERMINANT_FAMILIES = [
    { id: "environmental", name: "Environmental determinants", ref: [9],
      text: "The physical, chemical and biological context of daily life: air and water quality, hazardous sites, climate. Chronic low-level exposures very rarely link back to individual patient records." },
    { id: "social", name: "Social determinants", ref: [9],
      text: "The conditions in which people are born, grow, live, work and age: housing, income, education, safety. In routine clinical workflows they mostly remain background noise." }
  ];

  /* ------------------------------------------------------------------
     Figure 1: BMHI Visibility Architecture (Hypothesis Board v1.0)
     sources: actors holding data, linked to determinant families
     instruments: Table 3, data capture instruments
     ------------------------------------------------------------------ */
  const SOURCES = [
    { id: "health", name: "Health institutions", det: ["environmental", "social"],
      items: ["Public health services", "Patient care providers", "Health insurance funds"] },
    { id: "envauth", name: "Environmental authorities", det: ["environmental"],
      items: ["Meteorological agencies", "Environmental protection agencies", "Phytosanitary authorities", "Veterinary authorities", "Forestry authorities", "Agricultural authorities"] },
    { id: "order", name: "Public order authorities", det: ["environmental", "social"],
      items: ["Police", "Judicial system"] },
    { id: "social", name: "Social services authorities", det: ["social"],
      items: ["Welfare authorities", "Child protection agencies", "Employment agencies", "Pension insurance funds", "Immigration authorities"] },
    { id: "ngo", name: "Non-governmental associations", det: ["environmental", "social"],
      items: ["Professional associations", "Patient and family associations"] },
    { id: "industry", name: "Industry", det: ["environmental", "social"],
      items: ["Agricultural industry", "Biochemical industry", "Pharmaceutical industry", "Medical devices industry", "Patient apps and services", "Non-medical apps and services"] }
  ];

  const INSTRUMENTS = [
    { id: "sensors", name: "Sensors",
      items: ["Medical devices", "Personal devices", "Home appliances", "Public devices"] },
    { id: "device", name: "Device-associated systems",
      items: ["Home appliances", "Personal devices", "Medical devices", "Social networking apps", "Health and wellbeing apps"] },
    { id: "his", name: "Health information systems",
      items: ["Primary health care IS", "Hospital IS", "Laboratory IS", "Health accounting systems", "Veterinary IS"] },
    { id: "pis", name: "Public information systems",
      items: ["Social security IS", "Public security IS", "Judicial IS", "Educational IS"] }
  ];

  const ARCHITECTURE = {
    prerequisites: ["Data infrastructure", "Data acquisition following the FAIR principles", "Ethical and professional governance and guidelines"],
    human: ["Routine analytical algorithms", "Ad hoc analytical algorithms"],
    ai: ["Natural language processing (NLP)", "Large language models (LLM)", "Computer vision models", "Machine learning and deep learning", "Reasoning models"]
  };

  /* ------------------------------------------------------------------
     Table 4: a BMHI response for each layer of invisibility
     ------------------------------------------------------------------ */
  const LAYER_RESPONSES = {
    informational: "Open new data-acquisition channels: sensors, citizen-generated data, environmental monitoring, public information systems and structured collection instruments.",
    semantic: "Apply common terminologies, ontologies and interoperability standards such as SNOMED CT, LOINC and FHIR.",
    experiential: "Turn narratives, patient-reported outcomes and social context into computable information, using structured forms and AI-assisted extraction.",
    governance: "Establish the legal, organisational and technical mechanisms that allow data to be exchanged across sectors.",
    evaluative: "Create indicators that measure contextual determinants and include them in routine monitoring frameworks."
  };

  // Section 2.1.2 commentary on the layers
  const LAYER_NOTES = [
    { layers: ["informational", "experiential"], title: "The hardest layers to build for",
      text: "Informational and experiential invisibility usually require new data items in health information systems, and therefore new input mechanisms. These can add administrative work for health professionals or other public-service staff. AI tools such as NLP and LLMs could reduce that burden, but their reliability requires continuous professional oversight so that erroneous data do not lead to harm or wasted resources." },
    { layers: ["semantic", "governance", "evaluative"], title: "Ontologies as a cross-cutting answer", ref: [13, 14, 15],
      text: "Using health data ontologies systematically, in every system that may hold data on human, animal or environmental determinants, would also resolve semantic invisibility. SNOMED CT has already added concepts for social determinants, but many environmental and social concepts are still missing. Ontology work has to be inclusive and transparent so that it does not create new governance invisibility, and determinant mapping can help with evaluative invisibility." }
  ];

  /* ------------------------------------------------------------------
     Table 5: a BMHI visibility intervention for each archetype
     ------------------------------------------------------------------ */
  const INTERVENTIONS = {
    1: { what: "Structured SDOH fields, citizen-reported data, and linkage with social-service information systems",
         outcome: "Social determinants become available for care planning, population monitoring and service coordination." },
    2: { what: "Environmental sensor networks, monitoring platforms and geospatial linkage",
         outcome: "Environmental exposures can be connected to individual, population, animal and ecosystem health signals." },
    3: { what: "Representative datasets, bias audits, performance stratification and model-transparency mechanisms",
         outcome: "Under-representation and unequal model performance become identifiable and can be monitored." },
    4: { what: "PROMs, PREMs, structured narrative capture and NLP-assisted extraction",
         outcome: "Lived experience, preferences, burdens and care circumstances become computable without losing their narrative context." },
    5: { what: "Federated architectures, standardised APIs, FHIR-enabled exchange and cross-sector data-sharing agreements",
         outcome: "Relevant information can cross organisational boundaries while keeping its provenance, permissions and accountability." }
  };

  /* ------------------------------------------------------------------
     Section 2.1.3: technical implementation of the ODH paradigm
     ------------------------------------------------------------------ */
  const INTEROPERABILITY = [
    { id: "semantic", name: "Semantic interoperability", gist: "Shared meaning", ref: [17],
      text: "Controlled terminologies and ontologies (SNOMED CT for clinical findings, LOINC for laboratory observations, environmental vocabularies) ensure that a hospital, a veterinary clinic and an environmental agency read the same indicator in the same way." },
    { id: "technical", name: "Technical interoperability", gist: "Data exchange", ref: [15, 18],
      text: "Protocols such as HL7 FHIR and RESTful APIs, with secure authorisation (for example OAuth 2.0), let legacy health systems and IoT environmental sensors exchange data without custom point-to-point interfaces." },
    { id: "governance", name: "Governance interoperability", gist: "Trusted use", ref: [12, 19, 20],
      text: "Process standards define how organisations collaborate, govern access and trigger coordinated responses, such as a joint alert from veterinary livestock monitoring to public-health officials. Identity, consent, cybersecurity and clear responsibilities build trust within and between systems." }
  ];

  const PREREQUISITES = [
    { name: "A common digital architecture", text: "Interoperable APIs, standardised data models, shared identifiers, metadata and terminology services." },
    { name: "Provenance and quality", text: "Data provenance, quality assessment and assurance, entity resolution and linkage for data generated for different purposes." },
    { name: "Scalable infrastructure", text: "Real-time or near-real-time ingestion, distributed processing and analytics, including AI where appropriate." }
  ];

  const IMPLEMENTATION_KEY =
    "ODH implementation succeeds when invisible determinants can move across organisational boundaries without losing meaning, provenance, quality or trustworthiness. Visibility then becomes a property of the whole ecosystem rather than of any single information system.";

  /* ------------------------------------------------------------------
     Section 2.1.4: ODHness as a visibility metric
     ------------------------------------------------------------------ */
  const ODHNESS = {
    definition: "ODHness is the degree to which a digital ecosystem integrates human, animal and environmental data into a coherent framework for health intelligence. The greater a system's ability to identify, connect and act on invisible determinants across domains, the higher its ODHness.",
    digitalities: [
      { id: "humanities", name: "Digital humanities", domain: "Human", ref: [23, 24],
        text: "How digital technologies, data and computation reshape human health, culture, society and knowledge. ODHness brings cultural, behavioural, educational and social data alongside clinical information, so that the social context of health trajectories becomes visible." },
      { id: "animalities", name: "Digital animalities", domain: "Animal", ref: [25, 26, 27],
        text: "Sensors, tracking, AI, genomic databases and veterinary platforms used to understand and improve animal health and welfare. Integration helps detect zoonotic transmission, antimicrobial resistance and changing human-animal interactions, where many emerging infections begin." },
      { id: "environmentalities", name: "Digital environmentalities", domain: "Environment", ref: [28, 29, 30],
        text: "Digital observation, modelling and management of environmental conditions that affect humans and animals alike. Integrating environmental intelligence into decision support reveals links between environmental stressors and health, increasingly relevant with climate change." }
    ],
    governance: "ODHness also reflects governance: interoperability standards, ethical data sharing and cross-sector collaboration. A higher ODHness signals greater institutional readiness to turn fragmented observations into knowledge for prevention, preparedness and resilience."
  };

  /* ------------------------------------------------------------------
     Sections 2.2 and 2.3: four implementation issues, each turned into
     a research challenge
     ------------------------------------------------------------------ */
  const ISSUES = [
    {
      id: "privacy", name: "Privacy and data protection", ref: [2, 34, 36, 37, 38, 39],
      issue: "Finding invisible determinants increasingly depends on non-health data: school records, social services, environmental platforms, phones, wearables and smart homes. Many determinants are inferred rather than observed, so people can disclose sensitive health information without ever sharing health data. Linking datasets raises re-identification risk, strains purpose limitation and consent, and can lead to profiling of groups that already have the most contact with public services.",
      safeguards: ["Privacy-preserving data linkage", "Federated learning", "Differential privacy", "Secure multiparty computation", "Privacy by design, with transparency, proportionality and public engagement"],
      research: {
        title: "Invisible health inference without awareness",
        problem: "Health determinants may become visible to institutions before they become visible to the people they describe.",
        question: "To what extent can integrated non-health datasets predict clinically relevant health risks, and at what point do such predictions exceed citizens' expectations of data use?",
        design: "A retrospective multi-source data-linkage study comparing models built on health data alone with models that add non-health determinants, for outcomes such as depression, social isolation and cardiovascular risk. It would also measure public acceptability and the threshold at which participants find health inference intrusive.",
        determinants: ["Smartphone mobility patterns", "Public transport use", "Weather exposure", "Household energy consumption", "Educational participation", "Social-welfare interactions", "Indoor environmental sensor data"],
        partners: ["Hospitals and primary care", "Municipalities", "Social service agencies", "Educational institutions", "Meteorological agencies", "Utility companies", "Telecommunications providers", "Citizen volunteers with personal devices"]
      }
    },
    {
      id: "responsibility", name: "Responsibility", ref: [38, 40, 41, 42, 43, 46, 47, 48, 49],
      issue: "In ODH ecosystems no single actor controls the knowledge produced from interconnected data flows, so responsibility is distributed across public and private actors. Those who design infrastructures decide which aspects of human, animal and environmental wellbeing are represented. Algorithmic inferences spread responsibility across the whole socio-technical system. Shifting too much responsibility to individuals is unfair when digital literacy and access are unequal.",
      table: [
        { who: "Public authorities and regulators", what: "Governance, regulation, accountability and protection of fundamental rights" },
        { who: "Health and service providers", what: "Data quality, contextual documentation and responsible use" },
        { who: "Technology and industry partners", what: "Secure infrastructure, interoperability, transparency and technical maintenance" },
        { who: "Researchers and evaluators", what: "Validation, bias assessment, effectiveness evaluation and transparent reporting" },
        { who: "Citizens and communities", what: "Informed and voluntary participation, co-design and contribution to governance" }
      ],
      research: {
        title: "Invisible accountability gaps",
        problem: "When a health-relevant conclusion comes from several connected systems, responsibility for an error can become invisible because no single actor controls the whole pathway.",
        question: "Where do accountability gaps emerge in multi-sector ODH data ecosystems, and which governance models best keep responsibility for health decisions traceable?",
        design: "A comparative governance case study of real decision pathways. For example, an AI model flags higher community health risk from combined environmental, social, educational and health data; researchers map who collected, transformed, modelled, interpreted and acted on the data, using process tracing and stakeholder interviews.",
        determinants: ["Undocumented algorithmic decisions", "Data-quality assumptions", "Informal data transfers between organisations", "Missing governance procedures", "Undocumented local practices"],
        partners: ["Health authorities", "Municipalities", "Environmental agencies", "Schools and universities", "Social welfare organisations", "Technology vendors", "AI developers", "Ethics and legal experts"]
      }
    },
    {
      id: "resistance", name: "Resistance to change", ref: [37, 38, 50, 51, 52, 53, 54],
      issue: "Resistance can arise at individual, organisational, institutional and societal levels: fear of extra workload or lost autonomy, different professional cultures and terminologies, the cost of transforming established systems, concerns about surveillance, fears of stigma, and uncertain evidence of benefit. Resistance is not always an obstacle; it can be a legitimate expression of concerns about justice and rights. Participation in design, clear rationale, visible benefits and transparent governance reduce it.",
      research: {
        title: "Invisible determinants of organisational adoption",
        problem: "Resistance is often explained as a technology-acceptance issue, while deeper causes stay hidden in organisational culture, informal workflows, professional identity and perceived threats to autonomy.",
        question: "Which invisible organisational determinants most strongly influence the adoption or rejection of ODH-oriented data integration?",
        design: "A mixed-methods implementation study during an ODH pilot, comparing the barriers expected in formal planning with those actually observed: formal versus informal workflows, hidden workload, trust in data sharing, perceived surveillance, professional territoriality and cross-sector dynamics. Methods include ethnographic observation, meeting records, system logs, interviews and organisational network analysis.",
        determinants: ["Informal communication networks", "Organisational silos", "Undocumented workarounds", "Staff trust levels", "Perceived professional risk", "Local leadership dynamics"],
        partners: ["Hospitals", "Public health agencies", "Social services", "Environmental monitoring organisations", "Professional associations", "Unions", "Implementation project teams"]
      }
    },
    {
      id: "redundancy", name: "System redundancy", ref: [33, 37, 41, 42, 55, 56, 57],
      issue: "In a multi-sector ecosystem the same variable may be collected many times: physical activity, for instance, by questionnaires, schools, apps, wearables and insurers. Redundancy costs money, creates conflicting versions of the truth and tires the people asked repeatedly. It also brings resilience: overlapping sources allow cross-validation, fill gaps and keep monitoring going when one system fails. The aim is purposeful, transparent redundancy, guided by the principle of collecting once and using many times.",
      research: {
        title: "Useful versus harmful redundancy",
        problem: "ODH encourages comprehensive data collection, but it is unclear when overlapping datasets improve performance and when they only add complexity, cost and burden.",
        question: "Which forms of data redundancy improve resilience and predictive performance in ODH ecosystems, and which add little or no value?",
        design: "A comparative modelling study that adds and removes overlapping data sources for selected public-health use cases and measures predictive accuracy, resilience, operational cost, explainability and user burden, leading to an evidence-based redundancy framework.",
        determinants: ["Healthcare encounters", "School attendance patterns", "Mobility traces", "Smart-home technologies", "Environmental sensors", "Veterinary surveillance", "Municipal reporting systems"],
        partners: ["Health information systems", "Educational information systems", "Veterinary surveillance systems", "Meteorological services", "Environmental sensor networks", "Mobile app providers", "Smart-home vendors", "Municipalities and public administrations"]
      }
    }
  ];

  const HYPOTHESIS =
    "The greatest barriers to implementing ODH may not be visible technical limits but invisible interactions between data, institutions, technologies, governance structures and human behaviour.";

  return { VISIBILITY_CHAIN, DETERMINANT_FAMILIES, SOURCES, INSTRUMENTS, ARCHITECTURE, LAYER_RESPONSES, LAYER_NOTES,
           INTERVENTIONS, INTEROPERABILITY, PREREQUISITES, IMPLEMENTATION_KEY, ODHNESS, ISSUES, HYPOTHESIS };
})());
