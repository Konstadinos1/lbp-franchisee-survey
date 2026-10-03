import { STEPS, SECTIONS, type Lang } from "./content";

export type Answers = Record<string, unknown>;

export type SectionScore = {
  id: string;
  title: Record<Lang, string>;
  pct: number;
  color: "red" | "navy" | "yellow";
};

export type Tip = {
  id: string;
  prio: 1 | 2 | 3;
  title: Record<Lang, string>;
  body: Record<Lang, string>;
};

const t = (
  id: string,
  prio: 1 | 2 | 3,
  frT: string,
  enT: string,
  frB: string,
  enB: string
): Tip => ({
  id,
  prio,
  title: { fr: frT, en: enT },
  body: { fr: frB, en: enB },
});

const num = (ans: Answers, id: string): number | null =>
  typeof ans[id] === "number" ? (ans[id] as number) : null;

const yn = (ans: Answers, id: string): boolean | null =>
  ans[id] === "yes" ? true : ans[id] === "no" ? false : null;

export function computeSectionScores(ans: Answers): SectionScore[] {
  return Object.keys(SECTIONS).map((secId) => {
    const vals: number[] = [];
    STEPS.forEach((st) =>
      st.questions.forEach((q) => {
        if (q.section !== secId) return;
        if (q.kind !== "scale" && q.kind !== "nps") return;
        const v = ans[q.id];
        if (typeof v !== "number") return;
        vals.push(q.kind === "nps" ? v / 10 : v / 5); // -> 0..1
      })
    );
    const pct = vals.length
      ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 100)
      : 0;
    return { id: secId, title: SECTIONS[secId].title, pct, color: SECTIONS[secId].color };
  });
}

export function globalScore(sections: SectionScore[]): number {
  const vals = sections.map((x) => x.pct).filter((v) => v > 0);
  if (!vals.length) return 0;
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
}

export function npsVerdict(v: number | null): Record<Lang, string> | null {
  if (v === null) return null;
  if (v >= 9) return { fr: "Promoteur — merci !", en: "Promoter — thank you!" };
  if (v >= 7) return { fr: "Passif — sur la bonne voie", en: "Passive — on the right track" };
  return { fr: "Détracteur — à réparer", en: "Detractor — needs work" };
}

export function buildTips(ans: Answers): Tip[] {
  const tips: Tip[] = [];

  // ---------- Opérations ----------
  const equip = num(ans, "ops_equipement");
  if (equip !== null && equip <= 2) {
    tips.push(
      t("equip", 1,
        "Plan d'entretien préventif de l'équipement",
        "Preventive maintenance plan for equipment",
        "Une friteuse qui tombe en panne un vendredi soir coûte plus cher qu'un contrat d'entretien. Consignez l'âge et le dernier entretien de chaque appareil, puis demandez au groupe la liste des fournisseurs approuvés et un calendrier préventif commun.",
        "A fryer dying on a Friday night costs more than a service contract. Log each appliance's age and last service, then ask the group for its approved-vendor list and a shared preventive-maintenance calendar."
      )
    );
  }
  if (yn(ans, "ops_breakdown") === true) {
    tips.push(
      t("breakdown", 2,
        "Rétroaction sur les pannes majeures",
        "Feed back on major breakdowns",
        "Notez dates, coûts et temps d'arrêt de la panne subie cette année, puis partagez-les avec votre responsable de territoire. Des pannes récurrentes dans plusieurs succursales justifient un programme d'entretien groupé à tarifs négociés.",
        "Log dates, costs and downtime from this year's breakdown, then share with your territory manager. Recurring breakdowns across locations justify a group maintenance program with negotiated rates."
      )
    );
  }
  const staff = num(ans, "ops_maindoeuvre");
  if (staff !== null && staff <= 2) {
    tips.push(
      t("staff", 1,
        "Main-d'œuvre : construisez un vivier de candidats",
        "Staffing: build a candidate pipeline",
        "Partenariats avec les écoles d'hôtellerie locales, programme de référencement d'employés (prime versée après 90 jours) et blocs de shifts flexibles pour les étudiants. Le groupe peut fournir des modèles RH prêts à l'emploi — demandez-les.",
        "Partner with local hospitality schools, run an employee referral program (bonus after 90 days) and offer flexible student shift blocks. The group can supply ready-made HR templates — ask for them."
      )
    );
  }
  const normes = num(ans, "ops_normes");
  if (normes !== null && normes <= 2) {
    tips.push(
      t("normes", 2,
        "Clarifiez les normes avec votre conseiller",
        "Clarify standards with your advisor",
        "Documentez 3 à 5 procédures floues (ex. : rotation des denrées, fermeture) et soumettez-les au groupe : chaque clarification profite aux 125+ succursales. Demandez l'accès au répertoire des procédures à jour.",
        "Document 3–5 unclear procedures (e.g. stock rotation, closing routine) and submit them to the group: every clarification benefits all 125+ locations. Ask for access to the up-to-date procedures repository."
      )
    );
  }
  const livraison = num(ans, "ops_livraison");
  if (livraison !== null && livraison <= 2) {
    tips.push(
      t("livraison", 2,
        "Optimisez le canal livraison",
        "Optimize the delivery channel",
        "Vérifiez vos heures d'ouverture sur les apps (erreurs fréquentes), activez les signaux d'heures de pointe et comparez vos commissions avec d'autres franchisés. Un groupe de travail « livraison » du comité peut mutualiser les négociations.",
        "Check your opening hours on the apps (frequent errors), enable peak-hours flags and compare commissions with other franchisees. A committee 'delivery' working group can pool negotiations."
      )
    );
  }
  const heures = num(ans, "ops_heures");
  if (heures !== null && heures >= 65) {
    tips.push(
      t("heures", 1,
        "Votre charge de travail est à la limite",
        "Your workload is at the limit",
        "À 65 h et plus par semaine, le risque d'épuisement et d'erreurs coûteuses grimpe vite. Objectif : déléguer une responsabilité complète (inventaire, planification) à un assistant-gérant désigné — comparez le coût au temps récupéré.",
        "At 65+ hours a week, burnout and costly mistakes stack up fast. Goal: delegate one full responsibility (inventory, scheduling) to a designated assistant manager — weigh the cost against the time reclaimed."
      )
    );
  }

  // ---------- Produits ----------
  const marges = num(ans, "prod_marges");
  if (marges !== null && marges <= 2) {
    tips.push(
      t("marges", 1,
        "Revoyez vos marges avec la comptabilité du groupe",
        "Review margins with the group's accounting team",
        "Le groupe produit déjà des rapports pour comparer vos performances. Demandez une analyse de mix : plats à forte marge sous-promus, garnitures qui grugent la marge, et un test de prix sur 2–3 items clés.",
        "The group already produces reports to benchmark your performance. Ask for a mix analysis: high-margin items under-promoted, garnishes eating margin, and a price test on 2–3 key items."
      )
    );
  }
  const qualite = num(ans, "prod_qualite");
  if (qualite !== null && qualite <= 2) {
    tips.push(
      t("qualite", 2,
        "Documentez les écarts de qualité fournisseur",
        "Document supplier quality gaps",
        "Photos, numéros de lot, dates de réception : trois semaines de notes suffisent pour une demande ferme au fournisseur via le groupe. Le volume d'achat du réseau est votre meilleur levier.",
        "Photos, lot numbers, receiving dates: three weeks of notes make a firm supplier case through the group. The network's buying volume is your best lever."
      )
    );
  }
  const veg = num(ans, "prod_veg");
  if (veg !== null && veg <= 2) {
    tips.push(
      t("veg", 3,
        "Élargissez l'offre régimes particuliers",
        "Widen special-diet options",
        "Végé, halal et sans gluten : une capsule de menu testée dans quelques succursales pilotes peut ouvrir une clientèle entière sans compliquer la cuisine. Proposez votre succursale comme pilote.",
        "Veg, halal and gluten-free: a small pilot menu capsule in a few test locations can open a whole new clientele without complicating the kitchen. Volunteer your location as a pilot."
      )
    );
  }
  const souhait = ans["prod_souhait"];
  if (typeof souhait === "string" && souhait.trim().length > 2) {
    tips.push(
      t("souhait", 3,
        "Votre idée produit : faites-la monter",
        "Your product idea: send it up",
        "Vous avez proposé : « " + souhait.trim() + " ». Le comité produits évalue les idées des franchisés — soumettez-la via votre représentant avec une estimation du coût des ingrédients et le prix de vente visé.",
        "You suggested: \"" + souhait.trim() + ".\" The product committee reviews franchisee ideas — submit it through your representative with an ingredient cost estimate and target price."
      )
    );
  }

  // ---------- Marketing ----------
  const fonds = num(ans, "mkt_fonds");
  if (fonds !== null && fonds <= 2) {
    tips.push(
      t("fonds", 1,
        "Fonds publicitaire : demandez les résultats",
        "Ad fund: ask for the results",
        "Le fonds est géré par un comité mixte franchisés/franchiseur. Demandez le rapport des dernières campagnes (investissement par média, résultats par région) et soumettez une idée concrète pour votre territoire.",
        "The fund is run by a joint franchisee/franchisor committee. Ask for the latest campaign report (spend by medium, results by region) and submit one concrete idea for your territory."
      )
    );
  }
  const local = num(ans, "mkt_local");
  if (local !== null && local <= 2) {
    tips.push(
      t("local", 2,
        "Marketing local : le kit de base",
        "Local marketing: the starter kit",
        "Google Business Profile à jour (photos mensuelles, réponses aux avis), une offre d'ouverture de quartier et un partenariat local (école, aréna, club sportif). Le groupe peut fournir gabarits et approbation rapide.",
        "Keep your Google Business Profile fresh (monthly photos, review replies), run a neighbourhood offer and one local partnership (school, arena, sports club). The group can supply templates and fast approval."
      )
    );
  }
  if (yn(ans, "mkt_comite") === true) {
    tips.push(
      t("comite", 3,
        "Comité marketing : posez votre candidature",
        "Marketing committee: apply",
        "Vous avez manifesté l'intérêt de siéger au comité marketing. Contactez la direction du groupe : les sièges de franchisés se renouvellent chaque année et votre voix y porte le poids de tout votre secteur.",
        "You expressed interest in the marketing committee. Contact group leadership: franchisee seats renew yearly and your voice there carries your whole sector's weight."
      )
    );
  }
  const idee = ans["mkt_idee"];
  if (typeof idee === "string" && idee.trim().length > 2) {
    tips.push(
      t("idee", 3,
        "Votre idée promo : dans la pile du comité",
        "Your promo idea: in the committee's pile",
        "Idée consignée : « " + idee.trim() + " ». Testez-la d'abord une fin de semaine dans votre succursale : des chiffres réels (ventes, réponse des clients) doubleront ses chances d'adoption réseau.",
        "Logged idea: \"" + idee.trim() + ".\" Test it one weekend in your own location first: real numbers (sales, customer uptake) double its odds of network adoption."
      )
    );
  }

  // ---------- Relation / support ----------
  const ecoute = num(ans, "supp_ecoute");
  if (ecoute !== null && ecoute <= 2) {
    tips.push(
      t("ecoute", 1,
        "Le sentiment d'être écouté : au comité, pas dans la rue",
        "Feeling heard: take it to the committee",
        "Votre score suggère une relation à réparer. Préparez trois demandes précises et chiffrées pour la prochaine rencontre de territoire. Ce sondage lui-même est un canal : vos commentaires écrits y sont transmis.",
        "Your score suggests a relationship to repair. Bring three precise, costed requests to the next territory meeting. This survey itself is a channel: your written comments are passed on."
      )
    );
  }
  const formation = num(ans, "supp_formation");
  if (formation !== null && formation <= 2) {
    tips.push(
      t("formation", 2,
        "Formation : demandez un plan sur mesure",
        "Training: request a tailored plan",
        "Listez les lacunes précises (gestion des coûts, service, hygiène) et demandez un module ciblé — en ligne ou en succursale-école. Vos gestionnaires de quart ont-ils tous suivi la formation complète ?",
        "List the specific gaps (cost control, service, hygiene) and request a targeted module — online or at a training location. Have all your shift managers completed the full training?"
      )
    );
  }
  const redevances = num(ans, "supp_redevances");
  if (redevances !== null && redevances <= 2) {
    tips.push(
      t("redevances", 1,
        "Redevances : exigez la contrepartie",
        "Royalties: demand the counterpart",
        "Classez ce que vous recevez pour vos redevances (marque, formation, achats groupés, marketing) et identifiez ce qui manque. Une liste claire, partagée avec le groupe, transforme une frustration en programme.",
        "List what your royalties buy (brand, training, group purchasing, marketing) and what's missing. A clear list, shared with the group, turns frustration into a program."
      )
    );
  }
  const nps = num(ans, "supp_nps");
  if (nps !== null && nps <= 6) {
    tips.push(
      t("nps", 2,
        "Votre indice de recommandation est bas",
        "Your recommendation score is low",
        "Un score sous 7/10 est un signal sérieux pour le réseau. Les commentaires écrits de ce sondage seront transmis anonymement au comité — détaillez-y le principal irritant : c'est l'information la plus précieuse du sondage.",
        "A score under 7/10 is a serious signal for the network. This survey's written comments go anonymously to the committee — detail the main irritant there; it's the most valuable information in the survey."
      )
    );
  }

  // ---------- Finance ----------
  const rentabilite = num(ans, "fin_rentabilite");
  if (rentabilite !== null && rentabilite <= 2) {
    tips.push(
      t("rentabilite", 1,
        "Rentabilité : plan de redressement en 90 jours",
        "Profitability: a 90-day recovery plan",
        "Choisissez trois leviers : un coût (la plus grosse facture), un prix (test sur l'item vedette) et une heure creuse à rentabiliser (fermeture plus tôt ou promo ciblée). Les rapports comparatifs du groupe sont votre point de départ.",
        "Pick three levers: one cost (your biggest invoice), one price (test on the hero item) and one dead hour to monetize (earlier close or a targeted promo). The group's benchmark reports are your baseline."
      )
    );
  }
  const couts = num(ans, "fin_couts");
  if (couts !== null && couts <= 2) {
    tips.push(
      t("couts", 2,
        "Coûts : le trio denrées-énergie-main-d'œuvre",
        "Costs: the food-energy-labour trio",
        "Inventaire hebdomadaire à date fixe, suivi du gaspillage pendant 2 semaines, et une vérification des contrats d'énergie (les prix fluctuent). Chaque point de pourcentage récupéré va droit au résultat.",
        "Weekly inventory on a fixed day, two weeks of waste tracking, and an energy-contract check (prices swing). Every percentage point recovered drops straight to the bottom line."
      )
    );
  }
  if (yn(ans, "fin_objectifs") === false) {
    tips.push(
      t("objectifs", 2,
        "Objectifs manqués : redéfinissez les 12 prochains mois",
        "Missed objectives: reset the next 12 months",
        "Un objectif manqué se transforme en plan : trois objectifs SMART maximum, revus chaque trimestre avec votre conseiller. Les franchisés qui comparent leurs rapports au groupe corrigent la tir plus vite.",
        "A missed objective becomes a plan: three SMART objectives max, reviewed quarterly with your advisor. Franchisees who benchmark against the group's reports correct course faster."
      )
    );
  }
  const croissance = num(ans, "fin_croissance");
  if (croissance !== null && croissance >= 7) {
    tips.push(
      t("croissance", 3,
        "Ambitieux : parlez expansion au groupe",
        "Ambitious: talk expansion with the group",
        "Votre appétit de croissance est élevé. Le groupe accompagne les ouvertures et rénovations (plan d'affaires, financement, choix de site). Une rencontre « croissance » est la suite logique de ce sondage.",
        "Your growth appetite is high. The group supports openings and renovations (business plan, financing, site selection). A 'growth' meeting is the logical next step after this survey."
      )
    );
  }
  const annees = num(ans, "annees");
  if (annees !== null && annees >= 15) {
    tips.push(
      t("veteran", 3,
        "Vétéran : votre expérience est une ressource réseau",
        "Veteran: your experience is a network asset",
        "15 ans et plus dans le réseau : votre geste le plus rentable pourrait être de parrainer un nouveau franchisé. Le groupe valorise les mentors de territoire — manifestez-vous.",
        "15+ years in the network: your most profitable move might be mentoring a new franchisee. The group values territory mentors — raise your hand."
      )
    );
  }

  return tips.sort((a, b) => a.prio - b.prio);
}
