# Sondage Franchisés — Bellepro's / Groupe LBP

Boucle de rétroaction (feedback loop survey) pour les franchisés Bellepro's / La Belle Province.
Franchisee feedback-loop survey, bilingual FR/EN.

**Stack:** Next.js 15 (App Router) + React 19, TypeScript, CSS pur (aucune dépendance UI).

## Ce que ça fait / What it does

- **6 étapes, 36 questions** : profil du restaurant, opérations, produits, marketing, relation avec le groupe, finance.
- **Bilingue FR/EN** — bascule instantanée, français par défaut (Québec).
- **Indice de satisfaction en direct** (jauge sticky) pendant que le franchisé répond.
- **Bilan instantané** : score global (anneau), scores par volet (barres), verdict (tampon).
- **Plan d'action personnalisé** : moteur de règles (~20 conseils P1/P2/P3, bilingues) déclenché par les réponses — inclut les idées de produits/promos écrites par le franchisé.
- **Export** : téléchargement JSON + copie du résumé.
- **Brouillon auto** : sauvegarde localStorage, ne quitte jamais le navigateur.
- **Démos** : `/?demo=1` (restaurant en santé, EN) · `/?demo=2` (restaurant en difficulté) — saute au bilan.
- **Paramètres URL** : `?phase=quiz&step=2&lang=en` pour partage/liens profonds.

## Design

Rétro « diner québécois » : damier, carte ticket à rayures, ombres dures, chips sticker.
Couleurs de marque tirées de bellepros.com : rouge `#D7232B`, bleu `#014D98`, crème `#F7F0E1`.
Logos officiels (assets publics du site) dans `public/assets/`.

## Lancer / Run

```bash
npm install
npm run dev        # http://localhost:3000
```

## Déployer sur Vercel / Deploy

```bash
npm i -g vercel && vercel login
vercel --prod
```

Ou via GitHub : push ce repo, puis « Import Project » sur vercel.com (le starter Next.js est détecté automatiquement).

---

*Prototype non affilié — les réponses ne quittent pas le navigateur. / Unaffiliated prototype — answers never leave the browser.*
