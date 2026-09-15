# Handoff de migration : SAAS-KIT-CONVEX -> ASTRO-KIT-CONVEX

## Mission

Migrer le monorepo actuel vers `ASTRO-KIT-CONVEX` en remplaçant la couche frontend TanStack par Astro, tout en conservant Convex comme backend natif et autorité métier.

Le repo existant est la source de vérité. La migration doit rester conservatrice : on simplifie surtout le frontend, on ne réécrit pas Convex derrière Astro et on ne crée pas une nouvelle architecture backend.

## Objectif produit

Le starter cible sert principalement à créer :

- des sites vitrines multi-pages ;
- des landing pages ;
- des pages SEO/GEO ;
- des formulaires ;
- quelques zones authentifiées ;
- du realtime ponctuel ;
- des paiements Polar ;
- des widgets ou agents IA/WhatsApp si besoin.

Le site marketing doit être statique/pré-rendu par défaut. Les fonctions applicatives restent possibles sans faire de toute l'application une SPA ou un SSR React permanent.

## Décision d'architecture centrale

Convex reste le backend principal.

Ne pas transformer :

```text
Browser -> Convex query/mutation/action
```

en :

```text
Browser -> Astro Action -> Convex
```

par défaut.

Le chemin cible est :

```text
Pages marketing
    -> Astro statique

Interactivité UI
    -> React island

Données/realtime/mutations
    -> convex/react
    -> Convex query / mutation / action

Auth
    -> Better Auth + @convex-dev/better-auth
    -> Convex

Paiements
    -> @convex-dev/polar
    -> Convex action/query + webhook Convex

Webhooks / callbacks externes
    -> Convex HTTP Actions

Jobs différés / récurrents
    -> Convex scheduler / crons quand un vrai besoin existe
```

Astro Actions ne sont admises que lorsqu'elles apportent un bénéfice réel de transport, par exemple formulaire HTML sans JS ou progressive enhancement. La validation métier et la persistance restent alors dans Convex.

## Architecture actuelle observée

```text
SAAS-KIT-CONVEX/
├── apps/
│   └── user-application/
│       ├── TanStack Start
│       ├── TanStack Router
│       ├── TanStack Query
│       ├── @convex-dev/react-query
│       ├── React 19
│       ├── Better Auth
│       ├── Convex client
│       ├── Polar UI
│       ├── PostHog
│       ├── Tailwind v4
│       ├── shadcn / Radix
│       └── Cloudflare Worker
│
└── packages/
    └── backend/
        └── convex/
            ├── auth.ts
            ├── auth.config.ts
            ├── billing.ts
            ├── demo.ts
            ├── http.ts
            ├── schema.ts
            └── convex.config.ts
```

### Backend Convex actuel

Le backend est déjà propre et doit rester proche de son état actuel :

- `demo.listNotes` est une `query` authentifiée et indexée ;
- `demo.addNote` est une `mutation` authentifiée ;
- `billing.generateCheckoutLink` et `billing.generateCustomerPortalUrl` sont des `action` Convex ;
- `billing.getCurrentSubscription` et les helpers Polar sont des queries ;
- `http.ts` enregistre Better Auth et le webhook Polar ;
- Better Auth stocke ses données via le composant Convex ;
- Polar vit dans Convex via `@convex-dev/polar` ;
- le frontend importe les API générées via `@repo/backend/convex/_generated/api` et `dataModel`.

Cette séparation frontend/backend est à préserver.

## Problème principal à supprimer

Le frontend empile actuellement :

```text
Convex
-> @convex-dev/react-query
-> ConvexQueryClient
-> TanStack Query
-> TanStack Router loaders
-> TanStack SSR Query
-> React
```

Pour `ASTRO-KIT-CONVEX`, la cible est :

```text
Convex
-> ConvexReactClient / ConvexBetterAuthProvider
-> useQuery / useMutation / useAction depuis convex/react
-> React island
```

Le realtime Convex ne dépend pas de TanStack Query. Cette couche doit disparaître.

## Changements de marque obligatoires

Remplacer partout les références au projet actuel par le nouveau nom.

Conversions minimales :

```text
saas-kit-convex   -> astro-kit-convex
SAAS-KIT-CONVEX   -> ASTRO-KIT-CONVEX
SaaS Kit Convex   -> Astro Kit Convex
jd-saas-kit-convex -> jd-astro-kit-convex
```

Inspecter aussi les variantes de casse et les références projet génériques à `saas-kit` lorsqu'elles désignent clairement ce repo.

Cela couvre :

- code ;
- package names ;
- scripts ;
- noms de fichiers ;
- dossiers ;
- docs ;
- README ;
- AGENTS/CLAUDE/CONTEXT ;
- configs ;
- fixtures de skills ;
- scripts de validation ;
- chemins documentés ;
- tests ;
- noms affichés dans la landing.

Si le dossier racine réel s'appelle encore `SAAS-KIT-CONVEX`, le renommer en `ASTRO-KIT-CONVEX` si l'environnement Codex permet de renommer proprement le workspace sans casser `.git`. Sinon réaliser tous les renommages internes et signaler explicitement le renommage racine comme unique action externe restante.

Ne jamais modifier le contenu interne de `.git` pour faire ce renommage.

## Renommages structurels recommandés

```text
apps/user-application -> apps/website
jd-convex-start-app    -> jd-astro-convex-site

dev:user-application    -> dev:website
deploy:user-application -> deploy:website
```

Root `package.json` :

```text
jd-saas-kit-convex -> jd-astro-kit-convex
```

`@repo/backend` reste inchangé. Le nom reflète correctement sa fonction et évite un renommage backend sans valeur.

## Stack à conserver

Conserver :

- Convex `1.45.0` sauf incompatibilité bloquante ;
- `packages/backend` ;
- `@repo/backend` ;
- `@convex-dev/better-auth` ;
- Better Auth `1.6.29` ;
- `@convex-dev/polar` ;
- `@polar-sh/sdk` et `@polar-sh/checkout` car ils satisfont le contrat/peer dependencies Polar ;
- React 19 ;
- Tailwind CSS v4 ;
- `@tailwindcss/vite` ;
- shadcn / Radix ;
- Lucide ;
- Zod ;
- PostHog ;
- Cloudflare Workers ;
- Wrangler ;
- pnpm workspace ;
- TypeScript 5.9.3 pendant la migration ;
- les scripts de validation d'environnement et de build de production ;
- les API Convex générées ;
- la démo realtime Convex ;
- les capacités auth et Polar actuelles.

Ne pas faire de broad dependency upgrade pendant la migration.

Particulièrement, ne pas passer Better Auth à une version incompatible avec `@convex-dev/better-auth` pendant ce chantier.

## Stack à supprimer

Supprimer du frontend :

- `@tanstack/react-start` ;
- `@tanstack/react-router` ;
- `@tanstack/react-query` ;
- `@tanstack/react-query-devtools` ;
- `@tanstack/react-router-devtools` ;
- `@tanstack/react-router-ssr-query` ;
- `@convex-dev/react-query` ;
- `@vitejs/plugin-react` ;
- `@cloudflare/vite-plugin` ;
- `vite-tsconfig-paths` si Astro/tsconfig rendent son usage inutile ;
- le custom server TanStack ;
- les route loaders TanStack ;
- le QueryClient global ;
- la déshydratation SSR TanStack/Convex ;
- la démo de middleware TanStack.

Fichiers à supprimer/remplacer :

```text
apps/user-application/src/start.tsx
apps/user-application/src/router.tsx
apps/user-application/src/routeTree.gen.ts
apps/user-application/src/server.ts
apps/user-application/src/integrations/tanstack-query/
apps/user-application/src/core/functions/example-functions.ts
apps/user-application/src/core/middleware/example-middleware.ts
apps/user-application/src/components/demo/middleware-demo.tsx
apps/user-application/vite.config.ts
```

Supprimer les anciens artefacts `dist/` puis les régénérer avec Astro. Ne jamais éditer `dist` à la main.

## Stack à ajouter

Ajouter au frontend :

- `astro` ;
- `@astrojs/react` ;
- `@astrojs/cloudflare` ;
- `@astrojs/check` ;
- `astro.config.mjs` ;
- `src/pages/` ;
- `src/layouts/` ;
- `src/islands/` ou un emplacement équivalent clair pour les roots React interactifs ;
- `src/lib/convex-client.ts` ou équivalent si utile ;
- le bridge auth Astro nécessaire pour conserver `/api/auth/*`.

Tailwind v4 reste branché via `@tailwindcss/vite` dans la configuration Astro.

Le site marketing doit être pré-rendu par défaut. Les endpoints auth et les zones nécessitant le runtime Cloudflare restent dynamiques.

## Structure cible

```text
ASTRO-KIT-CONVEX/
├── apps/
│   └── website/
│       ├── public/
│       │   ├── brand/
│       │   ├── docs/
│       │   └── ...
│       │
│       ├── src/
│       │   ├── pages/
│       │   │   ├── index.astro
│       │   │   ├── docs/
│       │   │   │   ├── index.astro
│       │   │   │   └── [name].astro
│       │   │   ├── app/
│       │   │   │   ├── index.astro
│       │   │   │   └── polar/
│       │   │   │       ├── subscriptions.astro
│       │   │   │       ├── checkout/
│       │   │   │       │   └── success.astro
│       │   │   │       └── portal.ts
│       │   │   └── api/
│       │   │       └── auth/
│       │   │           └── [...all].ts
│       │   │
│       │   ├── layouts/
│       │   │   ├── BaseLayout.astro
│       │   │   ├── DocsLayout.astro
│       │   │   └── AppLayout.astro
│       │   │
│       │   ├── components/
│       │   │   ├── auth/
│       │   │   ├── docs/
│       │   │   ├── landing/
│       │   │   ├── layout/
│       │   │   ├── navigation/
│       │   │   ├── payments/
│       │   │   ├── theme/
│       │   │   └── ui/
│       │   │
│       │   ├── islands/
│       │   │   ├── AppShell.tsx
│       │   │   ├── ConvexRealtimeDemo.tsx
│       │   │   └── autres islands uniquement si nécessaire
│       │   │
│       │   ├── lib/
│       │   │   ├── auth-client.ts
│       │   │   ├── auth-server.ts
│       │   │   ├── posthog.ts
│       │   │   └── utils.ts
│       │   │
│       │   └── styles.css
│       │
│       ├── astro.config.mjs
│       ├── components.json
│       ├── package.json
│       ├── tsconfig.json
│       └── wrangler.jsonc
│
└── packages/
    └── backend/
        ├── convex/
        │   ├── auth.config.ts
        │   ├── auth.ts
        │   ├── billing.ts
        │   ├── demo.ts
        │   ├── http.ts
        │   ├── schema.ts
        │   ├── convex.config.ts
        │   └── _generated/
        ├── scripts/
        └── package.json
```

Ne pas ajouter `data-service`, Hono, Drizzle, Neon, repository layer, service layer générique ou `packages/ui` par défaut.

## Mapping des routes

Porter les routes comme suit :

```text
src/routes/__root.tsx
-> src/layouts/BaseLayout.astro

src/routes/index.tsx
-> src/pages/index.astro

src/routes/_static/route.tsx
-> src/layouts/DocsLayout.astro

src/routes/_static/docs/index.tsx
-> src/pages/docs/index.astro

src/routes/_static/docs/$name.tsx
-> src/pages/docs/[name].astro

src/routes/_auth/route.tsx
-> src/layouts/AppLayout.astro + AppShell React

src/routes/_auth/app/index.tsx
-> src/pages/app/index.astro

src/routes/_auth/app/polar/subscriptions.tsx
-> src/pages/app/polar/subscriptions.astro

src/routes/_auth/app/polar/checkout.success.tsx
-> src/pages/app/polar/checkout/success.astro

src/routes/_auth/app/polar/portal.tsx
-> src/pages/app/polar/portal.ts

src/routes/api/auth.$.tsx
-> src/pages/api/auth/[...all].ts
```

Remplacer les `Link` TanStack par des `<a>` ou navigation standard Astro/DOM.

Remplacer `Route.useNavigate()` par `window.location`, `location.href` ou liens standards selon le cas.

Remplacer les loaders TanStack par frontmatter Astro ou appels Convex dans l'island React selon la nature de la donnée.

## Règle pour les pages marketing

La landing doit rester visuellement intacte.

Conserver :

- `NavigationBar` ;
- `HeroSection` ;
- `ClaudeCodeSection` ;
- `FeaturesSection` ;
- `CoursePromoSection` ;
- `Footer` ;
- tous les composants UI shadcn ;
- `styles.css` ;
- responsive ;
- dark mode ;
- branding existant sauf références TanStack/ancien nom.

Supprimer uniquement `MiddlewareDemo` de la landing.

Adapter la copy :

- TanStack Start -> Astro ;
- TanStack Router/Query -> Astro + Convex selon le message ;
- `SaaS Kit Convex` -> `Astro Kit Convex` ;
- remplacer les assets TanStack par un asset Astro si le starter affiche les technologies.

Ne pas redesign la landing.

## React dans Astro

Ne pas convertir tous les `.tsx` en `.astro` par principe.

Les composants React existants peuvent rester React et être rendus par Astro sans hydratation lorsqu'ils sont statiques.

Hydrater seulement les éléments qui en ont besoin :

- navigation mobile ;
- theme toggle ;
- auth ;
- realtime Convex ;
- pricing/checkout ;
- compte utilisateur ;
- widgets interactifs.

Pour les zones Convex authentifiées, ne pas créer plusieurs islands qui doivent partager le même contexte React.

Utiliser un root unique :

```text
AppShell.tsx
└── ConvexBetterAuthProvider
    ├── Sidebar
    ├── Header
    ├── Authenticated / Unauthenticated / AuthLoading
    └── contenu de l'app
```

Cela évite les problèmes de contexte entre islands Astro.

## Convex client cible

Supprimer `@convex-dev/react-query` et TanStack Query.

Réécrire la démo realtime avec les hooks natifs :

```ts
import { useQuery, useMutation, useAction } from "convex/react";
```

Exemple conceptuel :

```ts
const notes = useQuery(api.demo.listNotes);
const addNote = useMutation(api.demo.addNote);
```

Conserver le comportement realtime multi-onglets.

Réécrire `use-checkout.ts` avec `useAction(api.billing.generateCheckoutLink)` et état React local. Aucun `useMutation` TanStack.

## Auth : décision et gate technique obligatoire

Le setup actuel dépend de :

```text
@convex-dev/better-auth/react-start
convexBetterAuthReactStart()
```

Cette intégration TanStack doit disparaître.

Conserver le contrat de domaine actuel :

```text
Browser -> /api/auth/* sur le domaine Astro -> Better Auth / Convex
```

Ne pas basculer silencieusement les utilisateurs vers une URL Convex cross-domain si ce n'est pas nécessaire.

### Implémentation attendue

Avant de migrer toutes les pages privées :

1. inspecter les exports de la version installée de `@convex-dev/better-auth` ;
2. utiliser un helper Astro officiel s'il existe dans cette version ;
3. sinon construire un petit bridge Astro avec les utilitaires framework-agnostic de la lib et/ou un forwarding HTTP vers les routes Better Auth enregistrées dans Convex ;
4. conserver `authClient` avec `baseURL` same-origin ;
5. vérifier GET/POST `/api/auth/*` ;
6. vérifier sign-in Google, session, sign-out et token Convex ;
7. ne continuer la migration de `/app` qu'une fois ce bridge validé.

Ne jamais continuer à utiliser `convexBetterAuthReactStart()` après migration.

Les vérifications d'autorisation métier restent côté Convex via `authComponent.getAuthUser(ctx)`.

Pour l'UI privée, préférer les primitives `Authenticated`, `Unauthenticated`, `AuthLoading` ou `useConvexAuth` natifs plutôt que deux états manuels complexes.

## `/app`

La zone `/app` n'a pas besoin de SSR de données privées pour le SEO.

Supprimer :

- `getAuthToken` TanStack server function ;
- `beforeLoad` TanStack ;
- `serverHttpClient.setAuth(token)` dans le route context ;
- préfetch TanStack Query ;
- dehydration SSR Query.

Cible :

```text
Astro /app page
-> AppShell client:load
-> ConvexBetterAuthProvider
-> auth state
-> useQuery / useMutation / useAction
```

Conserver la protection réelle côté Convex. Une redirection UI non authentifiée est un confort, pas l'autorité de sécurité.

## Polar

Conserver `packages/backend/convex/billing.ts` comme autorité de billing.

Ne pas déplacer Polar vers Astro Actions.

Conserver :

- `@convex-dev/polar` ;
- `@polar-sh/sdk` ;
- `@polar-sh/checkout` ;
- `generateCheckoutLink` ;
- `generateCustomerPortalUrl` ;
- `getCurrentSubscription` ;
- `listAllProducts` / helpers générés Polar ;
- webhook Polar dans `packages/backend/convex/http.ts` ;
- ownership via `authComponent.getAuthUser(ctx)` ;
- success URL actuelle adaptée au nouveau frontend ;
- portail client ;
- tracking PostHog existant.

Amélioration demandée : remplacer `returns: v.any()` dans `getCurrentSubscription` par un validator précis si l'API/typing du composant Polar permet de le faire proprement sans duplication fragile. Si le composant ne fournit pas de validator stable, documenter la raison de conserver `v.any()` plutôt que d'inventer un schéma incorrect.

### Checkout success

Conserver les états :

```text
processing
success
error
```

Mais utiliser une query Convex native dans un island React plutôt que `useSuspenseQuery(convexQuery(...))`.

Le `checkout_id` reste validé avec Zod ou validation équivalente côté Astro avant affichage.

### Portal

`/app/polar/portal` reste un endpoint serveur qui déclenche l'action Convex et redirige vers l'URL Polar.

Préserver l'événement PostHog `customer_portal_opened` et la capture des exceptions.

## Queries, mutations, actions et fonctions internes

Conserver les conventions Convex :

- `query` pour lecture réactive/déterministe ;
- `mutation` pour transaction DB ;
- `action` pour réseau / API externe ;
- HTTP Actions pour webhooks/callbacks ;
- scheduler/crons uniquement lorsqu'un besoin concret existe.

Ajouter dans `AGENTS.md` une règle : toute fonction utilisée uniquement par le backend doit préférer `internalQuery`, `internalMutation` ou `internalAction` plutôt qu'une fonction publique.

Ne pas convertir les fonctions publiques actuelles en `internal*` si le frontend les consomme.

## Backend à conserver presque intact

Conserver :

```text
packages/backend/convex/auth.config.ts
packages/backend/convex/auth.ts
packages/backend/convex/billing.ts
packages/backend/convex/demo.ts
packages/backend/convex/http.ts
packages/backend/convex/schema.ts
packages/backend/convex/convex.config.ts
packages/backend/convex/_generated/*
```

Ne modifier le backend que pour :

- compatibilité auth Astro si nécessaire ;
- validator Polar précis si possible ;
- tests ;
- éventuelles petites améliorations de séparation HTTP si nécessaires.

Ne pas réorganiser le backend en couches artificielles.

## Tests backend à ajouter

Le repo a des tests frontend auth mais quasiment pas de tests Convex métier.

Ajouter une couverture minimale et ciblée avec l'outillage Convex compatible avec la version installée, sans broad upgrade.

Priorité :

- appel non authentifié de `demo.listNotes` refusé ;
- appel non authentifié de `demo.addNote` refusé ;
- un utilisateur ne voit que ses propres notes ;
- `addNote` rejette chaîne vide et >160 caractères ;
- les fonctions billing protégées rejettent un utilisateur non authentifié, dans la mesure où le composant Polar peut être testé sans mocks fragiles.

Si les composants Better Auth/Polar rendent un test d'intégration local trop coûteux, tester au minimum les fonctions Convex indépendantes et documenter précisément ce qui reste couvert par smoke test.

## Documentation

Mettre à jour :

- root `README.md` ;
- `AGENTS.md` ;
- `CLAUDE.md` ;
- `CONTEXT.md` ;
- `docs/architecture/monorepo.md` ;
- `docs/architecture/analytics.md` si nécessaire ;
- `apps/website/README.md` ;
- `apps/website/public/docs/getting-started.md` ;
- `authentication.md` ;
- `convex.md` ;
- `cloudflare.md` ;
- `deployment.md` ;
- `environments.md` ;
- docs Polar s'il y en a ailleurs ;
- skills project-specific dans `.agents/skills` ;
- miroir `.claude/skills` via le script de sync, pas par divergence manuelle.

La documentation doit expliquer la nouvelle frontière :

```text
Astro = pages, layouts, static marketing, Cloudflare adapter
React = islands interactifs
Convex = DB, realtime, queries, mutations, actions, auth persistence, billing backend
Better Auth = auth
Polar = billing dans Convex
```

Supprimer les instructions projet qui présentent TanStack Router, Start, Query ou `@convex-dev/react-query` comme architecture active.

Les mentions génériques de TanStack dans une documentation tierce peuvent rester si elles ne décrivent pas ce projet.

## Skills et fixtures

`.agents/skills` reste canonique.

Après modifications :

```bash
pnpm skills:sync
```

Le repo contient actuellement des fixtures project-specific comme :

```text
.agents/skills/create-prd/evals/fixtures/saas-kit-snapshot.json
.claude/skills/create-prd/evals/fixtures/saas-kit-snapshot.json
```

Si elles décrivent ce starter, les renommer vers une variante `astro-kit-convex` claire, mettre à jour les références, puis laisser `skills:sync` synchroniser le miroir Claude lorsque le script le prévoit.

Même règle pour tout fichier ou référence project-specific portant l'ancien branding.

## Scripts et validation de production

Conserver et adapter :

```text
scripts/validate-production-env.mjs
scripts/validate-deployment-env.mjs
scripts/validate-production-build.mjs
packages/backend/scripts/sync-app-env.mjs
```

Mettre à jour les chemins :

```text
apps/user-application -> apps/website
```

et les nouveaux chemins de build Astro.

Le garde-fou doit continuer à vérifier qu'aucune URL locale Convex, secret ou configuration de développement ne fuit dans le build de production.

Ne pas affaiblir ces validations.

## Variables d'environnement et secrets

Ne jamais imprimer de secret.

Ne pas modifier les valeurs réelles des `.env` sauf si un nom de variable doit absolument changer pour la compatibilité Astro. Préférer conserver les noms existants.

Préserver au minimum les contrats Convex/Better Auth/Polar actuels.

Adapter uniquement l'accès frontend aux variables `VITE_*` si Astro exige une forme `PUBLIC_*` ou un mapping explicite. Ne renommer qu'après audit des scripts `sync-app-env.mjs` et de validation, puis mettre tous les scripts/docs/tests en cohérence.

Ne jamais faire de `convex deploy`, `wrangler deploy` ou action destructive pendant la migration.

## Cloudflare

Le frontend reste déployable sur Cloudflare avec `@astrojs/cloudflare`.

Conserver le port local `3000`.

Adapter `wrangler.jsonc` au build Astro et au nouveau nom d'app/Worker si le nom actuel contient l'ancienne marque ou `start`.

Ne pas garder `src/server.ts` TanStack.

## Dépendances

Pendant la migration :

1. conserver les versions backend actuelles autant que possible ;
2. ajouter les packages Astro nécessaires ;
3. supprimer TanStack et `@convex-dev/react-query` ;
4. ne pas mettre à jour TypeScript, Better Auth, Convex, Polar, PostHog ou Wrangler sauf incompatibilité bloquante prouvée ;
5. régénérer `pnpm-lock.yaml` via `pnpm install`, jamais à la main.

## Points de validation obligatoires

### Avant modification

- `git status --short` ;
- relever les fichiers déjà modifiés par l'utilisateur ;
- ne jamais écraser des changements utilisateur non liés ;
- inventorier les `.env` sans afficher leur contenu sensible ;
- relever les occurrences de l'ancien branding et de TanStack.

### Validation technique

Exécuter autant que l'environnement le permet :

```bash
pnpm install
pnpm skills:sync
pnpm --filter @repo/backend run build
pnpm typecheck
pnpm test
pnpm build
pnpm validate:production-build
```

Si l'ajout/modification de fonctions Convex exige une régénération :

```bash
pnpm --filter @repo/backend run codegen
```

mais ne pas lancer de déploiement.

### Smoke tests

Tester au minimum :

```text
/
/docs
/docs/getting-started
/docs/authentication
/app
/app/polar/subscriptions
/app/polar/checkout/success?checkout_id=<valeur-test>
/api/auth/*
```

Vérifier :

- landing visuellement conservée ;
- dark mode ;
- navigation mobile ;
- zéro erreur d'hydratation ;
- auth login/session/logout ;
- token Convex valide après auth ;
- `ConvexRealtimeDemo` fonctionne et se met à jour entre deux onglets ;
- création de note ;
- isolation des notes par utilisateur ;
- produits Polar chargés ;
- checkout action retourne une URL ;
- portal endpoint redirige ;
- checkout success conserve processing/success/error ;
- webhook Polar reste enregistré dans Convex ;
- build Cloudflare passe ;
- validations anti-secret/local URL passent.

Ne pas effectuer de vrai paiement ni de déploiement de production.

### Recherche finale de branding

Hors `.git`, caches, `node_modules` et artefacts externes qui ne doivent pas être modifiés, rechercher case-insensitive :

```text
saas-kit-convex
SAAS-KIT-CONVEX
SaaS Kit Convex
jd-saas-kit-convex
jd-convex-start-app
user-application
```

Il doit rester zéro occurrence project-specific obsolète.

Faire aussi une recherche des noms de fichiers contenant `saas-kit`, `saas-kit-convex`, `user-application` ou autres anciens noms project-specific et les renommer si nécessaire.

### Recherche finale TanStack

Dans le code actif du projet, il doit rester zéro dépendance à :

```text
@tanstack/react-start
@tanstack/react-router
@tanstack/react-query
@tanstack/react-router-ssr-query
@convex-dev/react-query
convexBetterAuthReactStart
createFileRoute
createServerFn
```

Les mentions historiques/génériques dans docs tierces peuvent rester uniquement si elles ne décrivent pas l'architecture active du starter.

## Définition de done

La migration est terminée lorsque :

1. le projet est rebaptisé `ASTRO-KIT-CONVEX` / `astro-kit-convex` partout où il s'agit du projet ;
2. `apps/website` remplace `apps/user-application` ;
3. Astro remplace TanStack Start/Router ;
4. TanStack Query et `@convex-dev/react-query` ne sont plus nécessaires ;
5. Convex reste le backend natif ;
6. Better Auth fonctionne sous le même domaine via `/api/auth/*` ;
7. `/app` utilise un root React Convex/Auth cohérent ;
8. Polar reste dans Convex ;
9. la démo realtime Convex fonctionne avec `convex/react` ;
10. la landing garde son design ;
11. MiddlewareDemo a disparu ;
12. docs, agents, fixtures et scripts sont mis à jour ;
13. les validations de production restent actives ;
14. typecheck, tests et build passent ;
15. aucun ancien branding ou import TanStack actif ne subsiste.

## Hors scope

Ne pas :

- ajouter Neon ou Drizzle ;
- ajouter Hono/data-service par défaut ;
- déplacer le backend Convex dans Astro ;
- transformer toutes les mutations en Astro Actions ;
- ajouter Turborepo/Nx sans nécessité ;
- créer `packages/ui` ;
- redesign la landing ;
- mettre à jour toutes les dépendances ;
- réécrire Better Auth ou Polar ;
- ajouter des crons ou workflows de démonstration sans besoin réel ;
- déployer.

## Suggested skills

Pour reprendre ce chantier dans un nouvel agent/session :

- `karpathy-guidelines` : à utiliser avant les modifications pour garder une migration chirurgicale et éviter les abstractions inutiles ;
- `tdd` : recommandé pour le bridge Better Auth Astro, les routes auth et les tests Convex ciblés ;
- `implement` : adapté une fois ce handoff accepté comme spec d'exécution ;
- `code-structure` : uniquement si des duplications réelles apparaissent pendant le portage, pas pour inventer des couches supplémentaires.

## Priorité d'exécution recommandée

1. Audit git + occurrences branding/TanStack.
2. Renommages projet et app.
3. Installer/configurer Astro sans toucher au backend.
4. Valider le bridge Better Auth Astro `/api/auth/*`.
5. Porter BaseLayout + landing + docs.
6. Créer `AppShell` et migrer `/app` vers `convex/react` natif.
7. Migrer Polar UI et routes.
8. Supprimer TanStack Query et `@convex-dev/react-query`.
9. Nettoyer fichiers/deps TanStack.
10. Mettre à jour docs, skills, scripts, branding.
11. Ajouter tests backend ciblés.
12. Exécuter toutes les validations et recherches finales.

Le point 4 est le gate technique principal. Si le bridge auth same-origin ne fonctionne pas, diagnostiquer ce point avant de modifier massivement la zone `/app`.
