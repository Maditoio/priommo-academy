export type McqSeed = {
  promptFr: string;
  promptEn: string;
  choices: { fr: string; en: string; correct?: boolean }[];
};

type TopicBank = {
  slug: string;
  nameFr: string;
  nameEn: string;
  facts: { fr: string; en: string }[];
  distractors: { fr: string; en: string }[];
};

const COURSE1_BANKS: TopicBank[] = [
  {
    slug: "juridique",
    nameFr: "Cadre juridique",
    nameEn: "Legal framework",
    facts: [
      { fr: "Le titre foncier atteste la propriété d'un immeuble", en: "Land title certifies property ownership" },
      { fr: "L'enregistrement au conservateur confère l'opposabilité du titre", en: "Registration at the land registry gives title enforceability" },
      { fr: "Le compromis de vente engage les parties avant l'acte authentique", en: "A preliminary sale agreement binds parties before the notarized deed" },
      { fr: "Le permis de bâtir est requis avant certaines constructions", en: "A building permit is required before certain construction" },
      { fr: "La servitude de passage limite l'usage exclusif d'une parcelle", en: "A right-of-way easement limits exclusive use of a parcel" },
      { fr: "La prescription acquisitive peut conférer un droit après occupation prolongée", en: "Adverse possession may confer rights after prolonged occupation" },
      { fr: "Le bail écrit réduit les litiges entre bailleur et locataire", en: "A written lease reduces disputes between landlord and tenant" },
      { fr: "La copropriété distingue parties privatives et communes", en: "Condominium distinguishes private and common areas" },
      { fr: "Le notaire authentifie les actes de mutation immobilière", en: "The notary authenticates property transfer deeds" },
      { fr: "La publicité foncière informe les tiers sur les droits réels", en: "Land publicity informs third parties about real rights" },
      { fr: "Un hypothèque garantit le remboursement d'un prêt immobilier", en: "A mortgage secures repayment of a real estate loan" },
      { fr: "Le zonage urbain détermine les usages autorisés d'un terrain", en: "Urban zoning determines permitted land uses" },
    ],
    distractors: [
      { fr: "Le titre foncier est facultatif pour toute vente", en: "Land title is optional for any sale" },
      { fr: "Un mandat oral vaut toujours mutation définitive", en: "An oral mandate always equals final transfer" },
      { fr: "Le permis de bâtir remplace le titre foncier", en: "A building permit replaces land title" },
      { fr: "La copropriété supprime les charges communes", en: "Condominium eliminates common charges" },
    ],
  },
  {
    slug: "transactions",
    nameFr: "Transactions",
    nameEn: "Transactions",
    facts: [
      { fr: "La due diligence vérifie titre, charges et conformité", en: "Due diligence verifies title, liens and compliance" },
      { fr: "Le mandat exclusif confie la vente à une seule agence", en: "An exclusive mandate entrusts sale to one agency" },
      { fr: "L'offre d'achat formalise l'intention et le prix proposé", en: "A purchase offer formalizes intent and proposed price" },
      { fr: "La commission d'agence est négociée dans le mandat", en: "Agency commission is negotiated in the mandate" },
      { fr: "L'estimation comparative utilise des ventes similaires", en: "Comparative appraisal uses similar sales" },
      { fr: "Le dépôt de garantie sécurise l'engagement de l'acheteur", en: "Earnest money secures the buyer's commitment" },
      { fr: "La promesse synallagmatique lie les deux parties", en: "A bilateral promise binds both parties" },
      { fr: "La visite doit être documentée pour limiter les contestations", en: "Viewings should be documented to limit disputes" },
      { fr: "Le prix peut être ajusté selon l'état réel du bien", en: "Price may be adjusted based on actual property condition" },
      { fr: "La clause suspensive protège l'acheteur sur le financement", en: "A financing contingency protects the buyer" },
      { fr: "La remise des clés suit généralement le paiement du solde", en: "Key handover generally follows balance payment" },
      { fr: "Le procès-verbal de vente consigne la transaction", en: "The sale report records the transaction" },
    ],
    distractors: [
      { fr: "La commission est toujours fixée par la loi à 10 %", en: "Commission is always legally fixed at 10%" },
      { fr: "Une offre verbale est toujours exécutoire", en: "A verbal offer is always enforceable" },
      { fr: "La due diligence remplace la visite", en: "Due diligence replaces the viewing" },
      { fr: "Le mandat simple interdit toute autre agence", en: "A simple mandate forbids any other agency" },
    ],
  },
  {
    slug: "gestion",
    nameFr: "Gestion locative",
    nameEn: "Property management",
    facts: [
      { fr: "L'état des lieux documente l'état du logement", en: "An inventory report documents the unit condition" },
      { fr: "Le dépôt de garantie couvre d'éventuels manquements", en: "Security deposit covers potential breaches" },
      { fr: "L'indexation du loyer suit souvent un indice convenu", en: "Rent indexation often follows an agreed index" },
      { fr: "La quittance atteste le paiement du loyer", en: "A rent receipt attests rent payment" },
      { fr: "Le taux d'occupation mesure les unités louées", en: "Occupancy rate measures rented units" },
      { fr: "La vacance locative réduit le rendement du portefeuille", en: "Vacancy reduces portfolio yield" },
      { fr: "Le plan de maintenance prévient les dégradations coûteuses", en: "A maintenance plan prevents costly deterioration" },
      { fr: "Le recouvrement suit une procédure progressive", en: "Collection follows a progressive procedure" },
      { fr: "Le rendement brut compare loyers et prix d'acquisition", en: "Gross yield compares rent to acquisition price" },
      { fr: "Les charges récupérables doivent être justifiées", en: "Recoverable charges must be justified" },
      { fr: "Le bail précise durée, loyer et obligations", en: "The lease specifies term, rent and obligations" },
      { fr: "Le reporting locataire améliore la relation client", en: "Tenant reporting improves client relations" },
    ],
    distractors: [
      { fr: "Le dépôt de garantie n'est jamais restitué", en: "Security deposit is never returned" },
      { fr: "La quittance est optionnelle pour les professionnels", en: "Rent receipt is optional for professionals" },
      { fr: "La vacance augmente mécaniquement le rendement", en: "Vacancy mechanically increases yield" },
      { fr: "L'état des lieux n'a aucune valeur juridique", en: "Inventory report has no legal value" },
    ],
  },
];

const COURSE2_BANKS: TopicBank[] = [
  {
    slug: "analyse",
    nameFr: "Analyse de portefeuille",
    nameEn: "Portfolio analysis",
    facts: [
      { fr: "Le TRI mesure la rentabilité globale d'un investissement", en: "IRR measures overall investment profitability" },
      { fr: "La VAN actualise les flux futurs au coût du capital", en: "NPV discounts future flows at cost of capital" },
      { fr: "La diversification réduit le risque concentré", en: "Diversification reduces concentrated risk" },
      { fr: "Le cap rate rapporte le NOI à la valeur du bien", en: "Cap rate relates NOI to property value" },
      { fr: "Le benchmarking compare la performance à des pairs", en: "Benchmarking compares performance to peers" },
      { fr: "L'analyse de sensibilité teste les variations de loyers", en: "Sensitivity analysis tests rent variations" },
      { fr: "Le cash-flow opérationnel exclut les charges de financement", en: "Operating cash flow excludes financing charges" },
      { fr: "La matrice risque-rendement guide l'allocation", en: "Risk-return matrix guides allocation" },
      { fr: "Le taux de capitalisation reflète le marché local", en: "Capitalization rate reflects the local market" },
      { fr: "La durée moyenne de bail influence la stabilité", en: "Average lease term influences stability" },
      { fr: "Le mix d'actifs doit correspondre aux objectifs", en: "Asset mix must match objectives" },
      { fr: "Le reporting trimestriel suit KPI du portefeuille", en: "Quarterly reporting tracks portfolio KPIs" },
    ],
    distractors: [
      { fr: "Le TRI ignore totalement les flux futurs", en: "IRR totally ignores future flows" },
      { fr: "La VAN n'utilise aucun taux d'actualisation", en: "NPV uses no discount rate" },
      { fr: "La diversification augmente toujours le risque", en: "Diversification always increases risk" },
      { fr: "Le cap rate mesure uniquement les charges", en: "Cap rate measures only expenses" },
    ],
  },
  {
    slug: "finance",
    nameFr: "Finance immobilière",
    nameEn: "Real estate finance",
    facts: [
      { fr: "Le levier financier amplifie gains et pertes", en: "Financial leverage amplifies gains and losses" },
      { fr: "Le DSCR vérifie la capacité de remboursement", en: "DSCR verifies repayment capacity" },
      { fr: "Le refinancement peut optimiser le coût de la dette", en: "Refinancing can optimize debt cost" },
      { fr: "L'amortissement réduit progressivement le principal", en: "Amortization progressively reduces principal" },
      { fr: "La trésorerie prévisionnelle anticipe les écarts", en: "Cash flow forecasting anticipates gaps" },
      { fr: "Le covenant bancaire impose des ratios minimums", en: "Bank covenant imposes minimum ratios" },
      { fr: "Le fonds de roulement couvre les besoins court terme", en: "Working capital covers short-term needs" },
      { fr: "La structure de capital équilibre dette et fonds propres", en: "Capital structure balances debt and equity" },
      { fr: "Le coût marginal du financement guide les acquisitions", en: "Marginal financing cost guides acquisitions" },
      { fr: "La provision pour impayés protège le cash-flow", en: "Bad debt provision protects cash flow" },
      { fr: "Le tableau d'amortissement détaille capital et intérêts", en: "Amortization schedule details principal and interest" },
      { fr: "Le ratio LTV limite l'endettement par rapport à la valeur", en: "LTV ratio limits debt relative to value" },
    ],
    distractors: [
      { fr: "Le levier supprime tout risque financier", en: "Leverage eliminates all financial risk" },
      { fr: "Le DSCR mesure la surface locative", en: "DSCR measures rental area" },
      { fr: "Les covenants sont toujours facultatifs", en: "Covenants are always optional" },
      { fr: "L'amortissement augmente le principal dû", en: "Amortization increases principal owed" },
    ],
  },
  {
    slug: "operations",
    nameFr: "Opérations et risques",
    nameEn: "Operations and risk",
    facts: [
      { fr: "Le plan de continuité sécurise les opérations critiques", en: "Business continuity plan secures critical operations" },
      { fr: "L'audit technique identifie les pathologies du bâti", en: "Technical audit identifies building pathologies" },
      { fr: "La gestion des sinistres limite l'impact financier", en: "Claims management limits financial impact" },
      { fr: "Le SLA encadre les prestataires de services", en: "SLA frames service providers" },
      { fr: "Le registre des risques priorise les actions", en: "Risk register prioritizes actions" },
      { fr: "La maintenance préventive réduit les pannes majeures", en: "Preventive maintenance reduces major failures" },
      { fr: "Le contrôle qualité standardise les interventions", en: "Quality control standardizes interventions" },
      { fr: "La traçabilité documente chaque intervention", en: "Traceability documents each intervention" },
      { fr: "Les inspections périodiques vérifient la conformité", en: "Periodic inspections verify compliance" },
      { fr: "Le plan d'urgence couvre incendie et sinistre", en: "Emergency plan covers fire and disaster" },
      { fr: "Le tableau de bord opérationnel suit les tickets", en: "Operations dashboard tracks tickets" },
      { fr: "La gestion fournisseurs négocie contrats et délais", en: "Vendor management negotiates contracts and deadlines" },
    ],
    distractors: [
      { fr: "La maintenance curative est toujours préférable", en: "Corrective maintenance is always preferable" },
      { fr: "Les SLA n'ont aucun effet contractuel", en: "SLAs have no contractual effect" },
      { fr: "Le registre des risques supprime les incidents", en: "Risk register eliminates incidents" },
      { fr: "L'audit technique remplace l'assurance", en: "Technical audit replaces insurance" },
    ],
  },
  {
    slug: "strategie",
    nameFr: "Stratégie patrimoniale",
    nameEn: "Asset strategy",
    facts: [
      { fr: "La stratégie core vise des actifs stabilisés", en: "Core strategy targets stabilized assets" },
      { fr: "La stratégie value-add améliore la valeur par travaux", en: "Value-add strategy improves value through works" },
      { fr: "Le cycle de vie guide achat, détention et cession", en: "Lifecycle guides buy, hold and sell" },
      { fr: "La politique de sortie définit les critères de vente", en: "Exit policy defines sale criteria" },
      { fr: "L'alignement ESG peut réduire le risque réglementaire", en: "ESG alignment can reduce regulatory risk" },
      { fr: "Le repositionnement change l'usage ou le standing", en: "Repositioning changes use or grade" },
      { fr: "La feuille de route pluriannuelle fixe les investissements", en: "Multi-year roadmap sets investments" },
      { fr: "Le scoring d'actifs priorise les arbitrages", en: "Asset scoring prioritizes arbitrage" },
      { fr: "La veille marché informe les décisions d'allocation", en: "Market intelligence informs allocation decisions" },
      { fr: "La politique d'acquisition fixe rendement et zones cibles", en: "Acquisition policy sets yield and target zones" },
      { fr: "Le comité d'investissement valide les opérations majeures", en: "Investment committee approves major deals" },
      { fr: "La stratégie de désinvestissement libère du capital", en: "Divestment strategy frees capital" },
    ],
    distractors: [
      { fr: "La stratégie opportuniste évite tout risque", en: "Opportunistic strategy avoids all risk" },
      { fr: "Le cycle de vie concerne uniquement le marketing", en: "Lifecycle concerns only marketing" },
      { fr: "L'ESG est sans impact sur la valeur", en: "ESG has no impact on value" },
      { fr: "La politique de sortie est toujours identique pour tous les actifs", en: "Exit policy is always identical for all assets" },
    ],
  },
];

function buildQuestion(
  bank: TopicBank,
  factIndex: number,
  variant: number,
  courseLabel: string
): McqSeed {
  const fact = bank.facts[factIndex % bank.facts.length];
  const correctIdx = variant % 4;
  const prompts = [
    {
      fr: `[${courseLabel} · ${bank.nameFr}] Quelle affirmation est correcte concernant : ${fact.fr} ?`,
      en: `[${courseLabel} · ${bank.nameEn}] Which statement is correct regarding: ${fact.en}?`,
    },
    {
      fr: `[${courseLabel} · ${bank.nameFr}] Parmi les propositions suivantes, laquelle est vraie (thème ${factIndex + 1}) ?`,
      en: `[${courseLabel} · ${bank.nameEn}] Which of the following is true (topic ${factIndex + 1})?`,
    },
    {
      fr: `[${courseLabel} · ${bank.nameFr}] Question ${variant + 1} : sélectionnez la bonne réponse.`,
      en: `[${courseLabel} · ${bank.nameEn}] Question ${variant + 1}: select the correct answer.`,
    },
  ];
  const prompt = prompts[variant % prompts.length];

  const correct = { fr: fact.fr, en: fact.en };
  const wrongPool = [
    ...bank.distractors,
    ...bank.facts.filter((_, i) => i !== factIndex % bank.facts.length).slice(0, 3),
  ];

  const choices: McqSeed["choices"] = [];
  for (let i = 0; i < 4; i++) {
    if (i === correctIdx) {
      choices.push({ fr: correct.fr, en: correct.en, correct: true });
    } else {
      const d = wrongPool[(variant + i) % wrongPool.length];
      choices.push({ fr: d.fr, en: d.en });
    }
  }

  return {
    promptFr: prompt.fr,
    promptEn: prompt.en,
    choices,
  };
}

export function generateQuestionsForCourse(
  courseLabel: string,
  banks: TopicBank[],
  totalPerExam: number
): Map<string, McqSeed[]> {
  const perCategory = Math.floor(totalPerExam / banks.length);
  const remainder = totalPerExam % banks.length;
  const result = new Map<string, McqSeed[]>();

  banks.forEach((bank, bankIndex) => {
    const count = perCategory + (bankIndex < remainder ? 1 : 0);
    const questions: McqSeed[] = [];
    for (let i = 0; i < count; i++) {
      questions.push(buildQuestion(bank, i, i + bankIndex * count, courseLabel));
    }
    result.set(bank.slug, questions);
  });

  return result;
}

export { COURSE1_BANKS, COURSE2_BANKS };
