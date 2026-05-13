# Backend Documentation

## Stack technique

- **Runtime:** Node.js + Express.js 5
- **Base de données:** MySQL 8 (mysql2/promise)
- **Auth:** JWT (jsonwebtoken)
- **Sécurité:** Helmet, CORS, rate limiting, bcryptjs
- **Port:** 4000 (configurable via `PORT`)
- **Base URL:** `/api`

---

## Structure des fichiers

```
backend/src/
├── app.js                        # Setup Express, enregistrement des routes
├── config/
│   └── db.js                     # Pool de connexions MySQL
├── middleware/
│   ├── auth.js                   # Authentification JWT + vérification des rôles
│   └── errorHandler.js           # Gestionnaire d'erreurs centralisé
├── routes/
│   ├── auth.js                   # register, login
│   ├── offers.js                 # liste et détail des offres
│   ├── ingestion.js              # import WeLoveDevs
│   └── admin.js                  # gestion utilisateurs et offres
├── controllers/
│   ├── authController.js
│   ├── offersController.js
│   ├── ingestionController.js
│   └── adminController.js
├── services/
│   ├── offerIngestionService.js  # Pipeline : fetch → normalize → upsert
│   └── welovedevsClient.js       # Client HTTP WeLoveDevs
└── utils/
    └── normalize.js              # Normalisation des données
```

---

## Variables d'environnement

```env
# Serveur
PORT=4000
FRONTEND_URL=http://localhost:3000

# Base de données
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=job_aggregator

# JWT
JWT_SECRET=change_this_secret
JWT_EXPIRES_IN=7d

# APIs externes
WELOVEDEVS_API_KEY=change_this_api_key
WELOVEDEVS_API_URL=https://epi-api.welovedevs.com
```

---

## Schéma de base de données

### Table `users`

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | INT, AUTO_INCREMENT | Clé primaire |
| `email` | VARCHAR(255), UNIQUE | Email de l'utilisateur |
| `password` | VARCHAR(255) | Mot de passe hashé (bcrypt) |
| `name` | VARCHAR(100) | Nom affiché |
| `role` | ENUM('USER', 'ADMIN') | Rôle, défaut : USER |
| `created_at` | DATETIME | Date de création |

### Table `offers`

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | INT, AUTO_INCREMENT | Clé primaire |
| `external_id` | VARCHAR(255), UNIQUE | ID source (évite les doublons) |
| `source` | VARCHAR(100) | Origine (ex: 'welovedevs') |
| `title` | VARCHAR(255) | Intitulé du poste |
| `description` | TEXT | Description complète |
| `company` | VARCHAR(255) | Nom de l'entreprise |
| `location` | VARCHAR(255) | Localisation |
| `contract_type` | ENUM | CDI, CDD, INTERNSHIP, APPRENTICESHIP, FREELANCE, OTHER |
| `salary` | VARCHAR(100) | Ex: "40000-50000 EUR/year" |
| `remote` | TINYINT(1) | 1 = télétravail possible |
| `apply_url` | VARCHAR(500) | Lien pour postuler |
| `is_active` | TINYINT(1) | 1 = visible, 0 = masquée (soft-delete) |
| `published_at` | DATETIME | Date de publication originale |
| `created_at` | DATETIME | Date d'import |
| `updated_at` | DATETIME | Dernière mise à jour |

---

## Endpoints API

### Format des réponses

**Succès :**
```json
{ "status": "success", "data": {...} }
{ "status": "success", "message": "..." }
```

**Erreur :**
```json
{ "status": "error", "message": "..." }
```

---

### Authentification — `/api/auth`

#### `POST /api/auth/register`

Crée un nouvel utilisateur.

**Body :**
```json
{ "name": "string", "email": "string", "password": "string (min 8 chars)" }
```

**Réponses :**
- `201` — compte créé
- `400` — champ manquant ou mot de passe trop court
- `409` — email déjà utilisé

---

#### `POST /api/auth/login`

Authentifie un utilisateur et retourne un JWT.

> Rate limit : 5 requêtes par 5 minutes.

**Body :**
```json
{ "email": "string", "password": "string" }
```

**Réponse `200` :**
```json
{
  "status": "success",
  "token": "<JWT>",
  "user": { "id": 1, "name": "...", "email": "...", "role": "USER" }
}
```

**Réponses d'erreur :**
- `400` — champ manquant
- `401` — identifiants invalides

---

### Offres — `/api/offers`

#### `GET /api/offers`

Liste les offres actives avec filtres et pagination.

**Query params :**

| Paramètre | Type | Description |
|-----------|------|-------------|
| `q` | string | Recherche dans titre, entreprise, description |
| `location` | string | Filtre sur la localisation (partiel) |
| `contract_type` | string | Filtre exact : CDI, CDD, INTERNSHIP... |
| `source` | string | Filtre exact sur la source |
| `limit` | number | Résultats par page (1-100, défaut 20) |
| `offset` | number | Décalage pour la pagination (défaut 0) |

**Exemple :**
```bash
curl "http://localhost:4000/api/offers?q=react&contract_type=CDI&limit=10"
```

---

#### `GET /api/offers/:id`

Retourne le détail d'une offre.

- `200` — offre trouvée
- `404` — offre introuvable

---

### Ingestion — `/api/ingestion`

#### `POST /api/ingestion/welovedevs`

Importe des offres depuis l'API WeLoveDevs vers la base de données.

**Body (optionnel) :**
```json
{ "page": 0, "q": "react", "size": 20 }
```

**Réponse `201` :**
```json
{
  "status": "success",
  "data": {
    "source": "welovedevs",
    "totalCount": 150,
    "imported": 18,
    "page": 0,
    "size": 20
  }
}
```

**Réponses d'erreur :**
- `500` — `WELOVEDEVS_API_KEY` manquante
- `502` — erreur de l'API WeLoveDevs
- `429` — rate limit WeLoveDevs

---

### Admin — `/api/admin`

> Tous les endpoints nécessitent : `Authorization: Bearer <JWT>` avec le rôle `ADMIN`.

#### Utilisateurs

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/admin/users` | Liste tous les utilisateurs |
| `PATCH` | `/api/admin/users/:id/role` | Change le rôle (`{ "role": "ADMIN" \| "USER" }`) |
| `DELETE` | `/api/admin/users/:id` | Supprime un utilisateur |

> Un admin ne peut pas modifier ou supprimer son propre compte.

#### Offres

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/admin/offers` | Liste toutes les offres (actives et inactives) |
| `PATCH` | `/api/admin/offers/:id/status` | Active/désactive (`{ "is_active": true \| false }`) |
| `DELETE` | `/api/admin/offers/:id` | Supprime définitivement une offre |

---

### Health check

#### `GET /ping`

```json
{ "status": "ok" }
```

---

## Authentification JWT

- Le token est retourné à la connexion via `/api/auth/login`
- À inclure dans toutes les requêtes protégées : `Authorization: Bearer <token>`
- Durée de validité : 7 jours (configurable via `JWT_EXPIRES_IN`)
- Payload : `{ id, role }`

---

## Sécurité

| Mesure | Détail |
|--------|--------|
| Hachage des mots de passe | bcrypt, 10 rounds |
| Prévention SQL injection | Requêtes paramétrées |
| CORS | Restreint à `FRONTEND_URL` |
| Rate limiting | 5 tentatives de login / 5 min |
| En-têtes HTTP | Helmet.js |
| RBAC | Rôle ADMIN requis pour les routes admin |

---

## Exemples curl

```bash
# Register
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Alice", "email": "alice@example.com", "password": "motdepasse123"}'

# Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "alice@example.com", "password": "motdepasse123"}'

# Lister les offres
curl "http://localhost:4000/api/offers?q=react&limit=5"

# Importer depuis WeLoveDevs
curl -X POST http://localhost:4000/api/ingestion/welovedevs \
  -H "Content-Type: application/json" \
  -d '{"q": "javascript", "size": 50}'

# Lister les utilisateurs (admin)
curl http://localhost:4000/api/admin/users \
  -H "Authorization: Bearer <TOKEN>"
```
