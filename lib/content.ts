export type Lang = "fr" | "en";

export type ScaleDef = {
  id: string;
  label: Record<Lang, string>;
  score: number; // 1..5
};

export type Question =
  | {
      kind: "scale";
      id: string;
      section: string;
      label: Record<Lang, string>;
      optional?: boolean;
    }
  | {
      kind: "nps";
      id: string;
      section: string;
      label: Record<Lang, string>;
      optional?: boolean;
    }
  | {
      kind: "yn";
      id: string;
      section: string;
      label: Record<Lang, string>;
      optional?: boolean;
    }
  | {
      kind: "text";
      id: string;
      section: string;
      label: Record<Lang, string>;
      optional?: boolean;
      long?: boolean;
      placeholder: Record<Lang, string>;
    }
  | {
      kind: "slider";
      id: string;
      section: string;
      label: Record<Lang, string>;
      min: number;
      max: number;
      step: number;
      unit: Record<Lang, string>;
      init: number;
      optional?: boolean;
    }
  | {
      kind: "multi";
      id: string;
      section: string;
      label: Record<Lang, string>;
      optional?: boolean;
      options: { id: string; label: Record<Lang, string> }[];
    };

export type Step = {
  id: string;
  tag: Record<Lang, string>;
  title: Record<Lang, string>;
  help: Record<Lang, string>;
  questions: Question[];
};

const L = (fr: string, en: string): Record<Lang, string> => ({ fr, en });

export const SCALES: Record<string, ScaleDef> = {
  s5: {
    id: "s5",
    score: 5,
    label: L("Excellent", "Excellent"),
  },
  s4: { id: "s4", score: 4, label: L("Bon", "Good") },
  s3: { id: "s3", score: 3, label: L("Moyen", "Average") },
  s2: { id: "s2", score: 2, label: L("Faible", "Weak") },
  s1: { id: "s1", score: 1, label: L("Critique", "Critical") },
};

export const SCALE_CHIPS = ["s5", "s4", "s3", "s2", "s1"];

export const YESNO = [
  { id: "yes", label: L("Oui", "Yes") },
  { id: "no", label: L("Non", "No") },
];

export const SECTIONS: Record<
  string,
  { title: Record<Lang, string>; color: "red" | "navy" | "yellow" }
> = {
  ops: { title: L("Opérations", "Operations"), color: "red" },
  produits: { title: L("Produits & Fournisseurs", "Products & Suppliers"), color: "navy" },
  marketing: { title: L("Marketing & Publicité", "Marketing & Advertising"), color: "yellow" },
  formation: { title: L("Formation & Support", "Training & Support"), color: "red" },
  finance: { title: L("Finance & Rentabilité", "Finance & Profitability"), color: "navy" },
};

export const STEPS: Step[] = [
  {
    id: "profil",
    tag: L("Étape 1", "Step 1"),
    title: L("Votre restaurant", "Your restaurant"),
    help: L(
      "Quelques questions rapides pour contextualiser vos réponses.",
      "A few quick questions to put your answers in context."
    ),
    questions: [
      {
        kind: "text",
        id: "restaurant",
        section: "profil",
        label: L("Nom / ville du restaurant", "Restaurant name / city"),
        placeholder: L("Ex. : LaSalle — boul. Newman", "e.g. LaSalle — Newman Blvd."),
        long: false,
      },
      {
        kind: "slider",
        id: "annees",
        section: "profil",
        label: L("Années comme franchisé Bellepro's", "Years as a Bellepro's franchisee"),
        min: 0,
        max: 30,
        step: 1,
        init: 5,
        unit: L("ans", "yrs"),
      },
      {
        kind: "multi",
        id: "role",
        section: "profil",
        label: L("Votre implication sur place", "Your day-to-day involvement"),
        optional: true,
        options: [
          { id: "quotidien", label: L("Sur place chaque jour", "On site every day") },
          { id: "hebdo", label: L("Plusieurs fois par semaine", "Several times a week") },
          { id: "distant", label: L("Surtout à distance", "Mostly hands-off") },
        ],
      },
      {
        kind: "slider",
        id: "employes",
        section: "profil",
        label: L("Nombre d'employés", "Number of employees"),
        min: 3,
        max: 60,
        step: 1,
        init: 15,
        unit: L("pers.", "ppl"),
      },
    ],
  },
  {
    id: "ops",
    tag: L("Étape 2", "Step 2"),
    title: L("Opérations & Formation", "Operations & Training"),
    help: L(
      "Le quotidien : équipement, normes, heures, main-d'œuvre.",
      "The daily grind: equipment, standards, hours, staffing."
    ),
    questions: [
      {
        kind: "scale",
        id: "ops_equipement",
        section: "ops",
        label: L(
          "Fiabilité de l'équipement de cuisine (friteuses, hottes, etc.)",
          "Kitchen equipment reliability (fryers, hoods, etc.)"
        ),
      },
      {
        kind: "scale",
        id: "ops_normes",
        section: "ops",
        label: L(
          "Clarté des normes et procédures du groupe",
          "Clarity of group standards and procedures"
        ),
      },
      {
        kind: "scale",
        id: "ops_livraison",
        section: "ops",
        label: L(
          "Intégration des apps de livraison (Uber, DoorDash, etc.)",
          "Delivery apps integration (Uber, DoorDash, etc.)"
        ),
      },
      {
        kind: "scale",
        id: "ops_maindoeuvre",
        section: "ops",
        label: L(
          "Votre capacité à recruter et retenir du personnel",
          "Your ability to recruit and retain staff"
        ),
      },
      {
        kind: "scale",
        id: "ops_penurie",
        section: "ops",
        label: L(
          "Gestion des ruptures d'approvisionnement",
          "Handling of supply shortages"
        ),
      },
      {
        kind: "yn",
        id: "ops_breakdown",
        section: "ops",
        label: L(
          "Une panne d'équipement majeure cette année ?",
          "A major equipment breakdown this year?"
        ),
      },
      {
        kind: "slider",
        id: "ops_heures",
        section: "ops",
        label: L("Heures travaillées par semaine (vous)", "Hours you work per week (yourself)"),
        min: 20,
        max: 90,
        step: 1,
        init: 55,
        unit: L("h/sem", "h/wk"),
      },
      {
        kind: "text",
        id: "ops_comment",
        section: "ops",
        label: L("Détails ou anecdotes sur les opérations", "Details or stories about operations"),
        optional: true,
        long: true,
        placeholder: L(
          "Ex. : la friteuse du coin casse 2 fois par année…",
          "e.g. the corner fryer breaks down twice a year…"
        ),
      },
    ],
  },
  {
    id: "produits",
    tag: L("Étape 3", "Step 3"),
    title: L("Produits & Fournisseurs", "Products & Suppliers"),
    help: L(
      "Menu, qualité, marges et distribution.",
      "Menu, quality, margins and distribution."
    ),
    questions: [
      {
        kind: "scale",
        id: "prod_qualite",
        section: "produits",
        label: L(
          "Qualité / constance des produits du fournisseur",
          "Product quality / consistency from the supplier"
        ),
      },
      {
        kind: "scale",
        id: "prod_marges",
        section: "produits",
        label: L("Marges sur le menu actuel", "Margins on the current menu"),
      },
      {
        kind: "scale",
        id: "prod_nouveautes",
        section: "produits",
        label: L("Soutien pour les nouveautés de menu", "Support for new menu items"),
      },
      {
        kind: "scale",
        id: "prod_distribution",
        section: "produits",
        label: L(
          "Coûts et fiabilité de la distribution",
          "Distribution costs and reliability"
        ),
      },
      {
        kind: "scale",
        id: "prod_veg",
        section: "produits",
        label: L(
          "Offre pour les régimes particuliers (végé, halal, sans gluten)",
          "Options for special diets (veg, halal, gluten-free)"
        ),
      },
      {
        kind: "text",
        id: "prod_souhait",
        section: "produits",
        label: L(
          "Un produit que vous aimeriez au menu ?",
          "A product you'd like to see on the menu?"
        ),
        optional: true,
        long: false,
        placeholder: L(
          "Ex. : poutine déjeuner, sauce plus forte…",
          "e.g. breakfast poutine, spicier sauce…"
        ),
      },
    ],
  },
  {
    id: "marketing",
    tag: L("Étape 4", "Step 4"),
    title: L("Marketing & Publicité", "Marketing & Advertising"),
    help: L(
      "Fonds publicitaire, promotions, réseaux sociaux et Image de marque.",
      "Ad fund, promotions, social media and brand image."
    ),
    questions: [
      {
        kind: "scale",
        id: "mkt_fonds",
        section: "marketing",
        label: L(
          "Valeur perçue du fonds de publicité national",
          "Perceived value of the national ad fund"
        ),
      },
      {
        kind: "scale",
        id: "mkt_local",
        section: "marketing",
        label: L(
          "Soutien pour le marketing local de votre restaurant",
          "Support for your restaurant's local marketing"
        ),
      },
      {
        kind: "scale",
        id: "mkt_promos",
        section: "marketing",
        label: L(
          "Efficacité des promotions et des coupons",
          "Effectiveness of promotions and coupons"
        ),
      },
      {
        kind: "scale",
        id: "mkt_numerique",
        section: "marketing",
        label: L(
          "Présence numérique (site web, apps, Google)",
          "Digital presence (website, apps, Google)"
        ),
      },
      {
        kind: "yn",
        id: "mkt_comite",
        section: "marketing",
        label: L(
          "Aimeriez-vous siéger au comité marketing (franchisés + franchiseur) ?",
          "Would you like to sit on the marketing committee (franchisees + franchisor)?"
        ),
      },
      {
        kind: "text",
        id: "mkt_idee",
        section: "marketing",
        label: L("Une idée promo pour le réseau ?", "A promo idea for the network?"),
        optional: true,
        long: true,
        placeholder: L(
          "Ex. : 2 pour 1 poutine les mardis pluvieux…",
          "e.g. 2-for-1 poutine on rainy Tuesdays…"
        ),
      },
    ],
  },
  {
    id: "support",
    tag: L("Étape 5", "Step 5"),
    title: L("Relation avec le groupe", "Relationship with the group"),
    help: L(
      "Communication, écoute, support terrain, valeur des redevances.",
      "Communication, being heard, field support, value of royalties."
    ),
    questions: [
      {
        kind: "scale",
        id: "supp_ecoute",
        section: "formation",
        label: L(
          "Sentiment d'être écouté par le groupe",
          "Feeling heard by the group"
        ),
      },
      {
        kind: "scale",
        id: "supp_formation",
        section: "formation",
        label: L(
          "Qualité de la formation initiale et continue",
          "Quality of initial and ongoing training"
        ),
      },
      {
        kind: "scale",
        id: "supp_visites",
        section: "formation",
        label: L(
          "Utilité des visites et suivis de territoire",
          "Usefulness of territory visits and follow-ups"
        ),
      },
      {
        kind: "scale",
        id: "supp_redevances",
        section: "formation",
        label: L(
          "Valeur reçue pour les redevances payées",
          "Value received for the royalties paid"
        ),
      },
      {
        kind: "nps",
        id: "supp_nps",
        section: "formation",
        label: L(
          "Recommanderiez-vous Bellepro's comme bannière à un autre restaurateur ?",
          "Would you recommend Bellepro's as a banner to another restaurateur?"
        ),
      },
      {
        kind: "text",
        id: "supp_comment",
        section: "formation",
        label: L(
          "Qu'est-ce qui ferait la plus grande différence pour vous ?",
          "What single change would make the biggest difference for you?"
        ),
        long: true,
        placeholder: L(
          "Ex. : un chiffrier de comparaison entre succursales…",
          "e.g. a benchmarking spreadsheet across locations…"
        ),
      },
    ],
  },
  {
    id: "finance",
    tag: L("Étape 6", "Step 6"),
    title: L("Finance & Vision", "Finance & Vision"),
    help: L(
      "Rentabilité, coûts et votre regard sur l'avenir.",
      "Profitability, costs and your view of the future."
    ),
    questions: [
      {
        kind: "scale",
        id: "fin_rentabilite",
        section: "finance",
        label: L("Rentabilité globale de votre restaurant", "Overall profitability of your restaurant"),
      },
      {
        kind: "scale",
        id: "fin_couts",
        section: "finance",
        label: L(
          "Maîtrise des coûts (denrées, énergie, main-d'œuvre)",
          "Cost control (food, energy, labour)"
        ),
      },
      {
        kind: "scale",
        id: "fin_outils",
        section: "finance",
        label: L(
          "Qualité des rapports et outils comptables du groupe",
          "Quality of the group's reporting and accounting tools"
        ),
      },
      {
        kind: "yn",
        id: "fin_objectifs",
        section: "finance",
        label: L(
          "Avez-vous atteint vos objectifs d'affaires cette année ?",
          "Did you meet your business objectives this year?"
        ),
      },
      {
        kind: "slider",
        id: "fin_croissance",
        section: "finance",
        label: L("Votre appétit de croissance (ouverture, rénovation, 2e resto)", "Your appetite for growth (opening, renovating, a 2nd location)"),
        min: 0,
        max: 10,
        step: 1,
        init: 5,
        unit: L("/10", "/10"),
      },
      {
        kind: "multi",
        id: "fin_priorites",
        section: "finance",
        label: L(
          "Vos priorités pour les 12 prochains mois",
          "Your priorities for the next 12 months"
        ),
        optional: true,
        options: [
          { id: "maindoeuvre", label: L("Main-d'œuvre", "Workforce") },
          { id: "couts", label: L("Réduction des coûts", "Cost reduction") },
          { id: "digital", label: L("Commande en ligne / numérique", "Online ordering / digital") },
          { id: "renov", label: L("Rénovation du restaurant", "Restaurant renovation") },
          { id: "menu", label: L("Nouveautés de menu", "New menu items") },
        ],
      },
    ],
  },
];

export const UI: Record<string, Record<Lang, string>> = {
  kicker: L("Groupe LBP · Bellepro's · Voix des franchisés", "Groupe LBP · Bellepro's · Franchisee Voice"),
  titleA: L("Votre resto,", "Your restaurant,"),
  titleB: L("votre mot à dire.", "your say."),
  lead: L(
    "Le sondage officiel des franchisés Bellepro's / La Belle Province. 10 minutes, confidentiel, et à la clé : votre taux de satisfaction et des pistes concrètes pour votre restaurant.",
    "The official Bellepro's / La Belle Province franchisee survey. 10 minutes, confidential — and you get your satisfaction score plus concrete pointers for your restaurant."
  ),
  sub: L(
    "Vos réponses alimentent le comité de franchise et le plan d'action annuel du groupe.",
    "Your answers feed the franchise committee and the group's annual action plan."
  ),
  badgeTime: L("± 10 minutes", "± 10 minutes"),
  badgeConf: L("Confidentiel", "Confidential"),
  badgeLoop: L("Résultats instantanés", "Instant results"),
  start: L("Commencer le sondage", "Start the survey"),
  back: L("Retour", "Back"),
  next: L("Continuer", "Continue"),
  submit: L("Voir mon bilan", "See my results"),
  restart: L("Recommencer", "Start over"),
  progress: L("Étape", "Step"),
  of: L("sur", "of"),
  meterTitle: L("Indice de satisfaction", "Satisfaction index"),
  meterHintLow: L("Répondez pour affiner votre indice…", "Answer to sharpen your index…"),
  meterHintHigh: L("Bel élan ! Continuez…", "Great momentum! Keep going…"),
  requiredMsg: L("Répondez aux questions obligatoires pour continuer.", "Please answer the required questions to continue."),
  requiredList: L("Questions en attente :", "Pending questions:"),
  disclaimer: L(
    "Prototype de boucle de rétroaction — non affilié au Groupe LBP. Les réponses ne quittent pas votre navigateur.",
    "Feedback-loop prototype — not affiliated with Groupe LBP. Answers never leave your browser."
  ),
  thanks: L("Merci !", "Thank you!"),
  resultsTitle: L("Votre bilan de satisfaction", "Your satisfaction report"),
  resultsSub: L(
    "Voici comment vos réponses se traduisent en pistes d'action.",
    "Here's how your answers translate into action items."
  ),
  globalScore: L("Score global", "Overall score"),
  byCategory: L("Par volet", "By category"),
  yourStrengths: L("Vos forces", "Your strengths"),
  yourActions: L("Vos pistes d'action", "Your action plan"),
  npsLabel: L("Indice de recommandation", "Recommendation score"),
  download: L("Télécharger (.json)", "Download (.json)"),
  copy: L("Copier le résumé", "Copy summary"),
  copied: L("Copié !", "Copied!"),
};

export const NPS_SIDE: Record<Lang, { low: string; high: string }> = {
  fr: { low: "Peu probable", "high": "Très probable" },
  en: { low: "Not likely", high: "Very likely" },
};

export const THANKS_BODY: Record<Lang, string> = {
  fr: "Votre rétroaction est enregistrée localement. Dans un déploiement réel, elle serait transmise de façon anonymisée au comité de franchise du Groupe LBP.",
  en: "Your feedback is stored locally. In a real deployment it would be sent anonymously to the Groupe LBP franchise committee.",
};
