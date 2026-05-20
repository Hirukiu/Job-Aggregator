# Décisions d'Architecture et de Produit

Ce document regroupe les décisions majeures du projet (produit, architecture, data, IA, sécurité, CI).
Chaque décision suit le format : **Pourquoi / Comment / Trade-off**.
Les alternatives rejetées sont documentées explicitement.

---

## Produit : cibles, problèmes prioritaires, valeur attendue

### Contexte

WeLoveDevs (plateforme de recrutement tech, groupe Insitoo) nous a mandatés pour concevoir et développer leur interface de consultation d'offres d'emploi. L'objectif est de construire une expérience utilisateur moderne par-dessus leur API officielle (`epi-api.welovedevs.com`), en ajoutant des fonctionnalités absentes de leur plateforme actuelle.

### Décision

**Utilisateur cible** : développeur ou étudiant tech en recherche active d'emploi, de stage ou d'alternance, qui utilise déjà WeLoveDevs pour trouver des offres.

**Pain points identifiés côté WeLoveDevs :**

| Priorité | Problème | Source |
|---|---|---|
| 1 | L'API WeLoveDevs expose les données brutes mais il n'existe pas d'interface dédiée permettant de les explorer avec des filtres avancés | Brief partenariat WeLoveDevs |
| 2 | Les offres ne sont pas catégorisées par domaine métier : Backend, DevOps, Data, etc. apparaissent mélangés sans moyen de filtrer | Exploration des données WeLoveDevs |
| 3 | Pas d'outil d'administration pour modérer ou gérer les offres côté opérateur | Besoin exprimé dans le cahier des charges |

**Valeur proposée :**

> Une interface web construite sur l'API WeLoveDevs qui enrichit les données brutes avec une classification IA par domaine métier, expose des statistiques de marché en temps réel, et offre un espace d'administration pour la modération des offres et la gestion des utilisateurs.

### Pourquoi

- WeLoveDevs fournit des données réelles sur le marché tech français — construire par-dessus leur API garantit la pertinence des offres sans avoir à scraper ou négocier d'autres sources.
- La classification IA répond directement au pain point n°2 en ajoutant une couche sémantique absente de l'API brute.

### Trade-off

La plateforme dépend entièrement de l'API WeLoveDevs : une indisponibilité de leur côté bloque les imports. Le rate limit (1 req/s/étudiant) impose un import manuel par lots plutôt qu'une synchronisation automatique.

---

## Architecture : stack technique et frontières de services

### Contexte

Choisir le stack technique du backend et de la base de données.

### Décision

Backend : **Node.js avec Express.js**.

Base de données : **MySQL** via le driver `mysql2/promise`.

Frontend : **React + Vite + Tailwind CSS**.

Déploiement : **Docker Compose** avec 3 services (frontend, backend, database).

### Pourquoi

- Node.js est déjà maîtrisé par le groupe, ce qui réduit le temps d'apprentissage sur un projet court.
- Express est minimaliste : il permet d'organiser le code comme on le souhaite (controllers, services, middleware).
- MySQL est une base relationnelle éprouvée. Les offres ont une structure stable (titre, entreprise, localisation, contrat) qui se prête bien à un schéma fixe avec contraintes d'intégrité.
- React est le framework frontend le plus utilisé dans les offres WeLoveDevs elles-mêmes — cohérent avec la cible.

### Comment

- Le pool de connexions est configuré dans `backend/src/config/db.js`.
- Le schéma est déclaré dans `backend/sql/init.sql` et monté automatiquement au démarrage du conteneur MySQL.
- Toutes les requêtes utilisent des paramètres `?` pour prévenir les injections SQL.
- Le frontend est buildé en multi-stage Docker (node → nginx) pour produire des fichiers statiques servis par Nginx.

### Alternative rejetée

**NestJS** (framework Node.js structuré) a été envisagé à la place d'Express.
Rejeté car : courbe d'apprentissage plus longue (décorateurs TypeScript, modules), et la structure imposée par NestJS apporte peu de valeur sur un projet de cette taille où l'équipe connaît déjà Express.

**PostgreSQL** a été envisagé à la place de MySQL.
Rejeté car : les deux bases sont équivalentes pour ce cas d'usage. MySQL est plus familier à l'équipe et l'image Docker officielle est bien documentée pour l'initialisation via scripts SQL montés en volume.

### Trade-off

Express sans framework structuré demande plus de discipline pour organiser le code (on a choisi controllers/services/middleware manuellement).

# Documentation des choix (ADRs)
---

## Data : Intégration WeLoveDevs + gestion du rate limit

### Contexte

Intégrer une source de données d'offres d'emploi réelles et gérer la contrainte de rate limit imposée par WeLoveDevs (1 requête/seconde/étudiant).

### Décision

- Source principale : **API WeLoveDevs** (obligatoire).
- L'import est déclenché **manuellement** via `POST /api/ingestion/welovedevs` (réservé aux admins).
- Les données sont **normalisées** avant stockage via `backend/src/utils/normalize.js`.
- Les doublons sont évités par un **upsert** sur le champ `external_id` (clé unique = ID WeLoveDevs).

### Pourquoi

- L'import manuel permet de contrôler précisément quand et combien d'offres sont importées, ce qui évite de dépasser le rate limit.
- La normalisation garantit que toutes les offres stockées ont le même format, quelle que soit la source future.
- L'upsert (`ON DUPLICATE KEY UPDATE`) permet de relancer un import sans créer de doublons ni perdre de données.

### Comment

Le pipeline complet est dans `backend/src/services/offerIngestionService.js` :

```
POST /api/ingestion/welovedevs
  → welovedevsClient.js   (appel HTTP à l'API WeLoveDevs)
  → normalize.js          (conversion au format interne)
  → classifyOffer()       (catégorie IA assignée)
  → upsertOffer()         (sauvegarde MySQL avec ON DUPLICATE KEY UPDATE)
```

La clé API est lue depuis la variable d'environnement `WELOVEDEVS_API_KEY` — jamais codée en dur.

### Gestion du rate limit 

L'import se fait par appel unique paginé (`page`, `size`) plutôt que par boucle automatique. L'administrateur choisit la taille du lot. Cela délègue le contrôle du débit à l'humain plutôt qu'à un scheduler qui pourrait dépasser la limite.

### Alternative rejetée

Un **import automatique planifié** a été envisagé. Écarté car :
- Risque de dépasser le rate limit si plusieurs étudiants demande un import en même temps.


### Trade-off

L'import manuel demande une action humaine. Les données ne sont pas mises à jour automatiquement.

---

## IA : Classificateur NLP (TF-IDF + Logistic Regression)

### Contexte

Implémenter une feature IA qui assigne automatiquement une catégorie métier à chaque offre (Frontend, Backend, DevOps, Data & AI, etc.) sans dépendre d'une API externe ni d'un modèle lourd.

### Décision

Modèle **TF-IDF + Logistic Regression** entraîné sur 500 vraies offres WeLoveDevs, exporté en JSON et exécuté nativement dans Node.js.

- Entraînement : `ml/train_classifier.ipynb` (Python / scikit-learn)
- Poids exportés : `ml/classifier.json` (~200 KB)
- Inférence : `backend/src/utils/classifier.js` (aucune dépendance ML)

### Pourquoi

Le cahier des charges interdit les modèles API externes et impose :
- Taille sur disque < 500 MB
- Résultat en < 5 secondes par offre
- Pas de fine-tuning au démarrage du conteneur

Le modèle TF-IDF + LR respecte toutes ces contraintes :
- **~200 KB** sur disque
- **< 1 ms** par offre (inférence pure JavaScript)
- **Entraîné sur de vraies données** WeLoveDevs — meilleure généralisation qu'un dictionnaire fixe

### Comment

**Entraînement (Python) :**
1. Récupération de 500 offres via l'API WeLoveDevs
2. Étiquetage automatique par mots-clés pour générer les labels
3. Pipeline scikit-learn : `TfidfVectorizer(ngram_range=(1,2)) + LogisticRegression(class_weight="balanced")`
4. Export des poids (vocabulaire, IDF, coefficients LR) en JSON

**Inférence (Node.js) :**
```
titre + description  →  tokenisation n-grammes  →  TF-IDF  →  régression logistique  →  catégorie
```

La catégorie est stockée dans le champ `category` de chaque offre et utilisée pour le filtre et les analytics du dashboard.

### Alternative rejetée

**Un classificateur par dictionnaire de mots-clés** a été utilisé dans une version antérieure. Remplacé car :
- Sensible aux variations de vocabulaire (synonymes, abréviations, fautes de frappe).
- Nécessite une maintenance manuelle de la liste de mots-clés.
- Précision limitée sur les intitulés ambigus (ex: "Tech Lead Full Stack Cybersécurité").

### Mesure du succès

- Accuracy 82 % sur le jeu de test (100 offres réelles).
- Validation croisée 5-fold : 71 % ± 10 %.
- Matrice de confusion disponible dans `ml/confusion_matrix.png`.
- Le champ `category` est exposé dans `/api/analytics` pour détecter des anomalies (ex: 90 % "Autre" signalerait un problème de modèle).

---

## Sécurité : contrôles implémentés

### Contexte

Sécuriser l'application contre les menaces les plus courantes identifiées sur un backend REST public.

### Décision

Combinaison de six contrôles couvrant les menaces principales.

### Pourquoi / Comment / Trade-off par contrôle

| Menace | Contrôle | Fichier | Trade-off |
|---|---|---|---|
| Vol de session / accès non autorisé | JWT signé (`jsonwebtoken`) avec expiration 7j | `middleware/auth.js` | Token non révocable avant expiration|
| Mots de passe en clair | Hachage bcrypt 10 rounds | `controllers/authController.js` | 10 rounds = ~100ms/hash, ralentit volontairement le brute-force |
| Injection SQL | Requêtes 100 % paramétrées (`?`) | Tous les controllers | Aucun |
| Brute-force sur le login | Rate limit 5 req / 5 min sur `/api/auth/login` | `routes/auth.js` (express-rate-limit) | Peut bloquer un utilisateur légitime qui oublie son mot de passe |
| Headers HTTP dangereux | `helmet()` appliqué globalement | `app.js` | Aucun |
| Accès non autorisé aux routes admin | RBAC server-side (`requireRole('ADMIN')`) | `middleware/auth.js` | Le rôle est dans le token JWT — si un token ADMIN est volé, l'accès est total jusqu'à expiration |

### Gestion des secrets

Aucune clé ou mot de passe n'est codé en dur. Toutes les valeurs sensibles sont lues depuis des variables d'environnement via `dotenv` :
- `JWT_SECRET` — clé de signature des tokens
- `WELOVEDEVS_API_KEY` — clé API externe
- `DB_PASSWORD` — mot de passe MySQL

Le fichier `.env` est listé dans `.gitignore` et n'est jamais commité.

---

## Dashboard : choix des widgets et décisions utilisateur supportées

### Contexte

Le sujet exige que le dashboard affiche au moins un output de la feature data et un output de la feature IA, visibles sans navigation supplémentaire. Il faut justifier pourquoi chaque widget existe et quelle décision utilisateur il supporte.

### Décision

Le dashboard (page d'accueil, `Frontend/src/Home.jsx`) affiche 3 compteurs statistiques en haut de page et les données proviennent du endpoint `GET /api/analytics` (`backend/src/controllers/analyticsController.js`).

**Widgets implémentés et leur justification :**

| Widget | Donnée affichée | Décision utilisateur supportée | ADR lié |
|---|---|---|---|
| Compteur "Offres actives" | `totalOffers` — nombre total d'offres actives | "Le marché est-il actif en ce moment ? Vaut-il la peine de chercher ?" | Feature Data |
| Compteur "En Télétravail" | `remoteRatio.remote` — offres avec `remote = 1` | "Puis-je trouver un poste sans déménager ?" | Feature Data |
| Compteur "Postes en CDI" | `byContractType` filtré sur CDI | "Y a-t-il des offres pour mon type de contrat ?" | Feature Data |
| Filtre par catégorie métier | Champ `category` assigné par le classificateur | "Je veux voir uniquement les offres Backend/DevOps/etc." | Feature IA |

**Les 3 compteurs sont visibles immédiatement** sans scroll ni navigation — ils s'affichent dans la section `.stats-container` au-dessus de la barre de recherche.

### Pourquoi ces widgets et pas d'autres

- **Nombre total** : indicateur de santé de la plateforme. Un chiffre à 0 signale un problème d'import avant même que l'utilisateur cherche.
- **Télétravail** : critère numéro 1 pour les étudiants qui ne veulent pas (ou ne peuvent pas) se déplacer.
- **CDI** : différencie la plateforme d'un simple agrégateur de stages — montre que des postes permanents sont disponibles.
- **Catégorie IA** : c'est l'output visible de la feature IA. Sans ce filtre, la classification serait invisible pour l'utilisateur.

### Comment

Le frontend appelle `GET /api/analytics` au chargement de la page (`useEffect` initial dans `Home.jsx`). Les données sont stockées dans l'état React `analytics` et affichées conditionnellement si `analytics !== null`.

### Trade-off

Les 3 compteurs sont statiques (pas de graphiques interactifs). Des visualisations type camembert ou courbe de tendance (disponibles dans `analytics.byMonth`, `analytics.byCategory`) auraient rendu les données plus lisibles mais auraient nécessité une bibliothèque de charts (Chart.js, Recharts) et du temps d'intégration frontend. Acceptable pour la version actuelle — les données sont exposées par l'API et peuvent être visualisées dans une version suivante.

---

## GitHub Actions sur runner self-hosted

### Contexte

Mettre en place un pipeline d'intégration continue qui vérifie automatiquement la qualité du code à chaque push et pull request.

### Décision

**GitHub Actions** avec `runs-on: self-hosted`.

### Pourquoi

- GitHub Actions est natif au dépôt GitHub — pas de service tiers à configurer.
- `self-hosted` est requis : les runners GitHub-hosted ne sont pas évalués.
- Le pipeline couvre les trois niveaux de vérification recommandés : build, qualité, tests.

### Comment

Le fichier `.github/workflows/ci.yml` déclenche le pipeline sur chaque push et PR vers `main`.

**Étapes du pipeline :**

| Étape | Commande | Ce qu'elle vérifie |
|---|---|---|
| Build 1 | `node --check src/app.js ...` | Syntaxe JS valide sur les fichiers clés |
| Build 2 | `node -e "require('./src/app')"` | L'application Express charge sans erreur |
| Build 3 | Vérification `package.json` | Toutes les dépendances requises sont déclarées |
| Lint 1 | `npm run lint` (ESLint) | Respect des règles de style et qualité |
| Lint 2 | `npm run lint:nodbg` | Aucun `console.log` en code de production |
| Lint 3 | `npm run lint:audit` | Aucune dépendance npm avec vulnérabilité haute |
| Tests | `npm test` (Jest) | 15 tests couvrant auth, offres, ingestion, normalisation, analytics |

### Couverture des tests

- **2 routes API** : `GET /api/offers` et `POST /api/ingestion/welovedevs` (avec token ADMIN)
- **1 fonction de normalisation** : `normalizeWeLoveDevsJob()` dans `utils/normalize.js`
- **1 route analytics** : `GET /api/analytics`
- **Routes auth** : register et login (8 cas testés)

### Trade-off

Le pipeline ne fait pas de tests d'intégration avec une vraie base de données (MySQL mocké). Un test end-to-end avec un conteneur MySQL en CI aurait détecté des bugs de requête SQL mais aurait complexifié la configuration du runner self-hosted.
