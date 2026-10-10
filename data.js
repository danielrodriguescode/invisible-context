/* =====================================================================
   The Invisible Context: content model
   Source of truth: IFAL Context Invisibility Map v0.2
   (MAP/Updated document/IFAL_(v0.2).docx). Where v0.2 is silent, detail
   comes from the SG1 evidence matrix (MAP/02-matrix.md). On conflict,
   v0.2 wins. Reference numbers [1] to [6] follow the v0.2 reference list.
   ===================================================================== */

window.IFAL = (function () {

  const META = {
    title: "The Invisible Context",
    subtitle: "A map of health context that information systems do not capture",
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
      question: "Is it recorded at all?",
      short: "No practical way exists to record it.",
      missing: "The determinant does not enter the record because there is no low-effort way to capture it.",
      consequence: "The system cannot use information it never received, and the absence of data is read as absence of relevance.",
      refs: [6, 2]
    },
    {
      id: "semantic", n: 2, name: "Semantic", color: "#8A5CE0",
      question: "Can other systems interpret it?",
      short: "It is recorded, but not in a standard, computable form.",
      missing: "The determinant is recorded as free text or a local checkbox, without a standard code.",
      consequence: "The information cannot be exchanged across institutions or countries, used by decision support, or aggregated across patients.",
      refs: [6, 4]
    },
    {
      id: "experiential", n: 3, name: "Experiential", color: "#E0921F",
      question: "Is there a suitable field for it?",
      short: "Lived experience does not fit structured fields.",
      missing: "Lived experience, preferences and informal care arrangements: information that no existing structured field can hold.",
      consequence: "Factors that influence adherence and outcomes are missing from the decision, even when the clinician would want them.",
      refs: [1, 3]
    },
    {
      id: "governance", n: 4, name: "Governance", color: "#2FA866",
      question: "Can it cross the sector boundary?",
      short: "The data exist, but in another sector's system.",
      missing: "A legal, organisational and interoperable route that would allow existing data to cross a sector boundary.",
      consequence: "Knowledge remains in separate, well-maintained systems, and shared learning across sectors and species does not take place.",
      refs: [2, 6, 1]
    },
    {
      id: "evaluative", n: 5, name: "Evaluative", color: "#D94C7C",
      question: "Is it measured?",
      short: "No outcome indicator includes it.",
      missing: "An indicator that includes the determinant in the metrics that guide institutional behaviour.",
      consequence: "Determinants that are not measured are not requested, so the gap persists.",
      refs: [4, 5]
    }
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

  const CLUSTERS = [
    { id: "capture", name: "Capture-surface", archetypes: [1, 2, 4],
      text: "The information is not entered in the record." },
    { id: "boundary", name: "System-boundary", archetypes: [3, 5],
      text: "The data exist in structured form but do not cross a boundary: the training data of an algorithm, or the governance arrangements of another sector." }
  ];

  /* ------------------------------------------------------------------
     The five archetypes (v0.2 Table 2 + decision failures)
     wheel: angle (deg) of the marker on the technology ring
     stats: value null = qualitative finding (no figure reported)
     ------------------------------------------------------------------ */
  const ARCHETYPES = [
    {
      n: 1, id: "sdoh",
      name: "SDOH Documentation Gap",
      plain: "Social circumstances not recorded",
      tagline: "Housing, food security and transport affect outcomes, but are rarely documented in a structured way in the EHR.",
      color: "#1F5FBF",
      layers: ["informational", "semantic"],
      perspectives: ["individual", "population"],
      spillover: [],
      dimensions: ["citizens", "humanvet"],
      cluster: "capture",
      wheel: { angle: 30 },
      summary:
        "Social determinants that clinicians consider clinically important (housing, food security, transport, financial stability, childcare) are not routinely captured, mainly because the EHR offers no simple structured way to record them. Survey data indicate that the gap reflects the structure of the record more than a lack of clinical awareness.",
      stats: [
        { value: "18.2%", label: "consistently document housing instability", note: "among providers who consider it clinically vital", ref: 6 },
        { value: "16.4%", label: "consistently document food insecurity", note: "among providers who consider it clinically vital", ref: 6 },
        { value: "22.7%", label: "consistently document transport access", note: "among providers who consider it clinically vital", ref: 6 },
        { value: "14.8×", label: "higher odds of consistently documenting any social determinant than any environmental determinant", ref: 6 }
      ],
      failures: [
        { title: "Discharge planning without housing information",
          text: "A patient assessed as medically stable is discharged. Housing insecurity, which predicts the subsequent readmission, is not in the chart.",
          ref: [6] },
        { title: "Insulin regimen without food-security information",
          text: "An insulin regimen is designed on the assumption of regular meal times, for a patient who is food-insecure.",
          ref: [6] },
        { title: "Follow-up scheduling without transport information",
          text: "A follow-up interval is set on the assumption that the patient can travel to the clinic. Missed appointments are then recorded as non-compliance rather than as a problem of access.",
          ref: [6] }
      ],
      determinants: ["Housing stability", "Food security", "Transportation access", "Financial stability", "Childcare availability", "Personal safety", "Refugee status", "Access to firearms"],
      mechanism: {
        informational: "Many social determinants have no structured field, or the field sits outside the usual workflow. Ease of charting is associated with whether a determinant is captured.",
        semantic: "When social context is recorded, it is often in free text or local checkboxes without standard codes. It then cannot be aggregated across institutions, used by decision support, or exchanged between systems. Smoking status, the one social determinant with a long-established structured field, is documented consistently by a substantial majority of providers."
      },
      refs: [6]
    },
    {
      n: 2, id: "environment",
      name: "Environmental Determinant Blindness",
      plain: "Environmental exposures not recorded",
      tagline: "Exposure to air pollution, water contamination, household toxins and extreme weather is seldom documented in clinical records or reflected in institutional indicators.",
      color: "#2E8B4A",
      layers: ["informational", "evaluative"],
      perspectives: ["population", "ecosystem"],
      spillover: [],
      dimensions: ["environment", "industry"],
      cluster: "capture",
      wheel: { angle: -40 },
      summary:
        "Environmental exposures are relevant to clinical and public-health decisions, but they are largely absent from clinical records and from the indicators by which health institutions are assessed. Documentation of environmental determinants is considerably lower than that of social determinants.",
      stats: [
        { value: "<5%", label: "of providers consistently document any environmental determinant", note: "excluding infectious-disease outbreaks", ref: 6 },
        { value: "31%", label: "consistently document infectious-disease outbreaks, the only exception", ref: 6 },
        { value: "18.4%", label: "consider any environmental determinant easy to chart", note: "compared with 68.2% for social determinants", ref: 6 }
      ],
      failures: [
        { title: "Paediatric asthma triage without air-quality data",
          text: "A paediatric asthma exacerbation is triaged on clinical signs alone; air quality at the patient's place of residence is not part of the record.",
          ref: [6] },
        { title: "Perinatal counselling without exposure history",
          text: "Perinatal counselling takes place without any history of water contamination or household toxin exposure.",
          ref: [6] }
      ],
      determinants: ["Ambient air quality", "Drinking-water quality", "Household toxins", "Extreme-weather exposure", "Infectious-disease outbreaks (partly)", "Heat and cold events", "Antimicrobial resistance in the local environment", "Disease vectors", "Biodiversity and ecosystem indicators"],
      mechanism: {
        informational: "Environmental data are held in environmental-monitoring systems, not in health records, and there is no routine route by which they enter the clinical record. Providers also report that environmental determinants are difficult to chart.",
        evaluative: "The outcomes used to assess hospitals (readmissions, mortality, length of stay) are not adjusted for environmental exposure. Even if exposure data were captured, they would not appear in the metrics that guide institutional behaviour, so there is little demand for them."
      },
      refs: [6, 2]
    },
    {
      n: 3, id: "algorithmic",
      name: "Algorithmic Data Poverty",
      plain: "Groups under-represented in device and algorithm data",
      tagline: "Devices and algorithms developed on some populations perform less accurately for others, and this is rarely measured after deployment.",
      color: "#7A4FC0",
      layers: ["semantic", "evaluative"],
      perspectives: ["individual", "population"],
      spillover: [],
      dimensions: ["industry"],
      cluster: "boundary",
      wheel: { angle: 168 },
      summary:
        "Devices and algorithms are developed and validated on particular populations. Patients outside those populations are present in the clinical encounter but misrepresented in the computational model. These digital determinants of health, including data poverty, algorithmic bias and accessibility, tend to reinforce existing inequities.",
      stats: [
        { value: "11 to 19%", label: "lower accuracy of recognition systems for Black women", ref: 4 },
        { value: null, label: "Pulse oximetry overestimates oxygen saturation in patients with darker skin pigmentation.", ref: 4 }
      ],
      failures: [
        { title: "Delayed escalation due to pulse-oximetry overestimation",
          text: "Escalation of COVID-19 treatment is delayed because pulse oximetry overestimates oxygen saturation in a patient with darker skin pigmentation.",
          ref: [4] },
        { title: "Lower performance of AI-assisted imaging",
          text: "AI-assisted imaging performs less well for populations that were under-represented in the training data.",
          ref: [4, 5] },
        { title: "Telemedicine triage that excludes sensory impairment",
          text: "A video-first telemedicine triage pathway excludes patients with hearing or visual impairment.",
          ref: [4, 5] }
      ],
      closing: "In these cases the issue is not clinical judgement: the patient is misrepresented in the data on which the system was developed.",
      determinants: ["Algorithmic bias", "Data poverty", "Information asymmetry", "Accessibility (visual, hearing, motor, cognitive)", "Digital literacy", "Affordability of devices and connectivity", "Digital availability", "Technology personalisation"],
      mechanism: {
        semantic: "The patient is represented incorrectly in the model, either because they are absent from the training data or because they are treated as an outlier. Pulse oximetry, for example, does not calibrate for skin pigmentation.",
        evaluative: "Performance for specific population groups is rarely reported alongside overall accuracy, and post-deployment evaluation is uncommon. Bias therefore goes undetected because it is not measured."
      },
      refs: [4, 5]
    },
    {
      n: 4, id: "narrative",
      name: "Patient Narrative Absence",
      plain: "Patient preferences and care context not captured",
      tagline: "Treatment preferences, lived experience and informal care arrangements have no suitable structured field and are often unavailable when decisions are made.",
      color: "#D98014",
      layers: ["experiential"],
      perspectives: ["individual"],
      spillover: ["population"],
      dimensions: ["citizens", "education"],
      cluster: "capture",
      wheel: { angle: 118 },
      summary:
        "Preferences, lived experience and informal care arrangements are difficult to represent in structured fields. Free text may exist, but it is not reliably retrievable at the time of decision, so this information is often lost at handovers between care settings.",
      stats: [
        { value: null, label: "The evidence for this archetype is qualitative: loss of patient narrative is identified as a driver of unsafe and inequitable decisions.", ref: 1 },
        { value: null, label: "Systems modelling describes the pattern as an unlinked decision within the continuity-of-care process.", ref: 3 }
      ],
      failures: [
        { title: "Escalation contrary to an unrecorded preference",
          text: "An intensive-care team escalates ventilation for a patient who had expressed a preference for comfort-only care months earlier, in an outpatient consultation. The preference was not recorded in structured form.",
          ref: [1, 3] },
        { title: "Care plan that omits the informal caregiver",
          text: "A heart-failure management plan assumes a self-managing patient who in fact depends on a daughter with two jobs. The caregiver is not documented in any information system.",
          ref: [1, 3] }
      ],
      determinants: ["Treatment preferences and goals of care", "Lived-experience symptom narrative", "Informal caregiver presence, capacity and limits", "Personal meaning of the illness", "Health literacy and the patient's own explanation of the illness", "Cultural and spiritual context", "Economic constraints described by the patient"],
      mechanism: {
        experiential: "Structured fields reduce narrative to predefined categories. Unlike the SDOH gap, the issue is not the absence of a field but the absence of a field of suitable form. Free text exists, but it cannot be retrieved reliably at decision time, so in practice it is unavailable. Systems modelling describes this as an unlinked decision in the continuity of care."
      },
      refs: [1, 3]
    },
    {
      n: 5, id: "silos",
      name: "Cross-Sector Governance Silos",
      plain: "Data held in other sectors",
      tagline: "Veterinary, environmental, public-health and cross-border data exist and are maintained, but there is no established route for them to reach clinical decisions.",
      color: "#C23A6B",
      layers: ["governance"],
      perspectives: ["ecosystem", "population"],
      spillover: [],
      dimensions: ["humanvet", "environment"],
      cluster: "boundary",
      wheel: { angle: -100 },
      summary:
        "In this archetype the data are not missing. They exist, are structured and are maintained in a veterinary, agricultural, environmental or foreign health system. What is missing is the legal, organisational and technical route that would allow them to reach the clinical decision.",
      stats: [
        { value: null, label: "During the COVID-19 pandemic, fragmented surveillance data meant that public-health decisions were based on partial information.", ref: 1 },
        { value: null, label: "Ecosystem-scale signals remain outside the current clinical data-capture surface.", ref: 2 }
      ],
      failures: [
        { title: "Animal-health signals not reaching public health",
          text: "Livestock mortality and wildlife die-offs are recorded in veterinary and agricultural information systems that do not reach human public-health decision-makers.",
          ref: [2] },
        { title: "Immunisation history held in another member state",
          text: "The immunisation history of a migrant patient is held in the health system of another member state and is not available to the treating clinician.",
          ref: [1, 2] },
        { title: "Environmental alert not reaching primary care",
          text: "A regional water-contamination event known to the environmental authority does not generate an alert in local primary care.",
          ref: [1, 2] }
      ],
      closing: "In each case the data exist and are maintained; what is missing is a route to the clinical decision.",
      determinants: ["Veterinary surveillance signals", "Zoonotic disease indicators", "Environmental-agency exposure alerts", "Cross-border patient records", "Social-services information held by municipalities", "Public-health intelligence held outside clinical systems"],
      mechanism: {
        governance: "The data themselves are complete and maintained. The barrier is the absence of a legal, organisational and interoperability route across sector boundaries."
      },
      refs: [2, 1]
    }
  ];

  /* ------------------------------------------------------------------
     Affected stakeholders (v0.2 "Distribution of the burden" + matrix)
     ------------------------------------------------------------------ */
  const STAKEHOLDERS = [
    {
      id: "patients", name: "Patients and families",
      intro: "The burden of missing context is concentrated among groups that are already disadvantaged.",
      items: [
        { name: "Low-income and food-insecure households", a: [1, 3] },
        { name: "People in rural or transport-poor areas", a: [1, 3, 5] },
        { name: "Recent immigrants and refugees", a: [1, 3, 5] },
        { name: "Residents of polluted and climate-vulnerable areas", a: [2, 5] },
        { name: "Children with respiratory disease", a: [2] },
        { name: "Outdoor workers and communities near industrial sites", a: [2] },
        { name: "People with sensory, motor or cognitive impairment", a: [3] },
        { name: "Older adults with limited digital literacy", a: [3] },
        { name: "Patients outside the populations on which devices and algorithms were validated", a: [3] },
        { name: "Patients whose care depends on an informal caregiver", a: [4] },
        { name: "Family caregivers", a: [4] },
        { name: "People with complex chronic, mental-health or palliative-care needs", a: [4] },
        { name: "People who work with livestock or live near wildlife", a: [5] }
      ]
    },
    {
      id: "clinicians", name: "Clinicians",
      intro: "For health professionals, missing context means making decisions with information they know to be incomplete.",
      items: [
        { name: "Primary-care providers", a: [1, 4, 5] },
        { name: "Discharge planners and case managers", a: [1, 4] },
        { name: "Pulmonologists, paediatricians and occupational-medicine specialists, who obtain environmental data through informal channels", a: [2] },
        { name: "Clinicians using AI-assisted tools and devices, without means to detect their biases", a: [3] },
        { name: "Palliative-care, psychiatry and paediatric teams, for whom loss of narrative is most evident at handover", a: [4] },
        { name: "Social workers and community health workers", a: [4] },
        { name: "Public-health and infectious-disease practitioners, and veterinarians working in One Health", a: [2, 5] }
      ]
    },
    {
      id: "institutions", name: "Institutions",
      intro: "Institutions absorb the consequences as costs that are not attributed to missing context.",
      items: [
        { name: "Safety-net hospitals, which absorb the readmissions", a: [1] },
        { name: "Payers under value-based contracts, which absorb the variance", a: [1] },
        { name: "Public-health agencies, which hold data whose clinical value they cannot deliver", a: [2, 5] },
        { name: "Environmental-monitoring agencies", a: [2, 5] },
        { name: "Device and AI manufacturers, regulators and accreditation bodies", a: [3] },
        { name: "Veterinary surveillance bodies and social-services departments", a: [5] },
        { name: "Cross-border health-information exchanges", a: [5] }
      ]
    },
    {
      id: "ecosystem", name: "Ecosystem",
      intro: "At ecosystem level, environmental, veterinary and public-health knowledge is maintained in parallel to clinical care, with few connections to it.",
      items: [
        { name: "The One Health community", a: [2, 5] },
        { name: "Environmental epidemiologists and climate-health researchers", a: [2] },
        { name: "Communities whose social data are not aggregated into population-level knowledge", a: [1] },
        { name: "Patient-reported experience that could inform population-level decisions but is not captured", a: [4] }
      ]
    }
  ];

  /* ------------------------------------------------------------------
     Mechanisms of persistence (v0.2 "Mechanisms")
     ------------------------------------------------------------------ */
  const MECHANISMS = [
    { name: "Capture friction", layers: ["informational"], ref: [6],
      text: "A determinant may be clinically relevant but remain unrecorded because there is no suitable structured field, screening routine or low-effort documentation pathway. Perceived importance does not automatically lead to consistent documentation." },
    { name: "Semantic fragmentation", layers: ["semantic"], ref: [3],
      text: "Information is recorded as free text, local categories or heterogeneous formats that cannot be reliably interpreted, exchanged or reused across time and care settings." },
    { name: "Representational exclusion", layers: ["semantic", "evaluative"], ref: [4, 5],
      text: "Devices and algorithms are developed and validated on populations that differ from those in which they are used. Data poverty and algorithmic design can reinforce existing inequities." },
    { name: "Boundary and incentive failures", layers: ["experiential", "governance", "evaluative"], ref: [1, 2],
      text: "Patient experience remains in conversation or informal communication; environmental, public-health and veterinary data remain in separate institutional systems. Governance restrictions, organisational separation and missing outcome indicators keep this knowledge out of the decision process." }
  ];

  const CHAIN = [
    "Not captured",
    "Not standardised",
    "Not linked",
    "Not evaluated",
    "Not prioritised"
  ];

  /* ------------------------------------------------------------------
     Home: an illustrative composite decision (labelled as such)
     ------------------------------------------------------------------ */
  const STORY = {
    patient: "Illustrative example · patient aged 71 · heart failure · recovering from COVID-19",
    decision: "Decision: discharge home",
    rows: [
      { field: "Clinical status", shown: "Medically stable", a: 1,
        hidden: "Housing is insecure, but this is not recorded. Among providers who consider housing clinically vital, 18.2% document it consistently." },
      { field: "Oxygen saturation", shown: "94%", a: 3,
        hidden: "Pulse oximetry overestimates oxygen saturation in patients with darker skin pigmentation, so the true value may be lower." },
      { field: "Care at home", shown: "Self-manages medication", a: 4,
        hidden: "The patient depends on a daughter who works two jobs, and had previously expressed a preference for comfort-focused care. Neither is recorded in structured form." },
      { field: "Exposure history", shown: "Not recorded", a: 2,
        hidden: "The patient lives in an area with poor air quality. Fewer than 5% of providers consistently document any environmental determinant other than outbreaks." },
      { field: "Active alerts", shown: "None", a: 5,
        hidden: "The environmental authority is aware of a regional water-contamination event, but no alert reaches primary care." }
    ],
    moral: "In this example the clinical reasoning is sound, but information that determines the outcome is not available at the point of decision. The Context Invisibility Map describes five recurring patterns of this kind."
  };

  const GLOSSARY = {
    EHR: "Electronic Health Record: the digital record in which clinicians document patient information.",
    SDOH: "Social Determinants of Health: the conditions in which people are born, live and work (housing, food, income, transport) that influence their health.",
    BMHI: "Biomedical and Health Informatics: the science and practice of health data, information systems and digital tools.",
    ODH: "One Digital Health: a framework that combines Digital Health with One Health (human, animal and environmental health as one system).",
    "One Health": "An approach that treats human, animal and environmental health as interconnected and manages them together.",
    "digital determinants": "Digital determinants of health: factors such as data poverty, algorithmic bias, digital literacy and access to technology that influence health outcomes."
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

  return { META, LAYERS, CORE, LEARN, KEYS, PERSPECTIVES, DIMENSIONS, TECH_RING, CLUSTERS, ARCHETYPES,
           STAKEHOLDERS, MECHANISMS, CHAIN, STORY, GLOSSARY, REFERENCES };
})();
