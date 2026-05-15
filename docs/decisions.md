# Décisions d'Architecture

Ce document regroupe les décisions techniques majeures prises durant le projet.
Chaque décision suit le format : **Pourquoi / Comment / Trade-off**.

---

## Architecture

### Contexte

Choisir le stack technique du backend et de la base de données.

### Décision

Backend : **Node.js avec Express.js 5**.
Base de données : **MySQL 8** via le driver `mysql2/promise`.

### Pourquoi

- Node.js est déja maîtrisé par le groupe, ce qui réduit le risque d'erreurs de débutant sur un projet court.
- Express est minimaliste : il ne force aucune structure et permet d'organiser le code comme on le souhaite (controllers, services, middleware).
- MySQL est une base relationnelle éprouvée. Les offres ont une structure stable (titre, entreprise, localisation, contrat) qui se prête bien à un schéma fixe avec contraintes d'intégrité.

### Comment

- Le pool de connexions est configuré dans `backend/src/config/db.js`.
- Le schéma est déclaré dans `backend/sql/init.sql` et monté automatiquement au démarrage du conteneur MySQL.
- Toutes les requêtes utilisent des paramètres `?` pour prévenir les injections SQL.

---

## ADR-02 — Data : Intégration WeLoveDevs + gestion du rate limit

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

Un **import automatique planifié** (cron toutes les heures) a été envisagé. Écarté car :
- Risque de dépasser le rate limit si plusieurs étudiants de l'équipe partagent la même clé.
- Complexité supplémentaire (gestion des erreurs de planification, relances) pour un bénéfice limité en démonstration.

### Trade-off

L'import manuel demande une action humaine. Les données ne sont pas mises à jour automatiquement. Acceptable pour un projet de démonstration ; une version production ajouterait un scheduler avec backoff exponentiel.

---

## ADR-03 — IA : Classificateur par dictionnaire de mots-clés

### Contexte

Implémenter une feature IA qui assigne automatiquement une catégorie métier à chaque offre (Frontend, Backend, DevOps, Data & AI, etc.) sans dépendre d'une API externe ni d'un modèle lourd.

### Décision

Classificateur **basé sur un dictionnaire de mots-clés** avec système de priorité, implémenté dans `backend/src/utils/classifier.js`.

### Pourquoi

Le cahier des charges interdit les modèles API externes et impose :
- Taille sur disque < 500 MB
- Résultat en < 5 secondes par offre
- Pas de fine-tuning au démarrage du conteneur

Un classificateur par mots-clés répond à toutes ces contraintes :
- **0 MB** supplémentaire (code pur, pas de fichier modèle)
- **< 1 ms** par offre
- **Aucune dépendance** externe

### Comment

Le fichier `classifier.js` définit 9 catégories (Data & AI, Mobile, DevOps & Cloud, Cybersécurité, Frontend, Embedded, Backend, Fullstack, Gestion de projet) + une catégorie par défaut "Autre".

Chaque catégorie a une liste de mots-clés et une priorité. L'algorithme :

1. Concatène `titre + titre + titre + description` (le titre est pondéré 3×).
2. Passe en minuscules.
3. Parcourt les catégories par priorité décroissante.
4. Retourne la première catégorie dont un mot-clé est trouvé dans le texte.

La catégorie est stockée dans le champ `category` de chaque offre et utilisée pour le filtre et les analytics du dashboard.

### Alternative rejetée

**Un modèle de classification NLP léger** (ex: `fasttext`, modèle `transformers` distillé) aurait offert une meilleure précision sur des intitulés ambigus. Écarté car :
- Taille du modèle proche de la limite de 500 MB.
- Temps de chargement au démarrage non garanti sous 5 secondes selon l'environnement.
- Complexité d'intégration disproportionnée par rapport au gain de précision sur ce volume de données.

### Mesure du succès

- Vérification manuelle sur un échantillon de 20 offres importées : taux de classification correcte attendu > 80 %.
- Le champ `category` est exposé dans `/api/analytics` pour visualiser la répartition et détecter des anomalies (ex: 90 % "Autre" signalerait un problème de dictionnaire).

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
