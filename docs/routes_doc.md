# Documentation des routes API

## POST /api/auth/register

Crée un nouveau compte utilisateur.
```
Body JSON requis :
{
  "name": "Nom",
  "email": "nom@example.com",
  "password": "motdepasse123"
}

Réponses :
Code    Cas
201     Compte créé
        { "status": "success", "message": "User created successfully." }
400     Champ manquant ou mot de passe < 8 caractères
        { "status": "error", "message": "name, email and password are required." }
409     Email déjà utilisé
        { "status": "error", "message": "Email already in use." }
```

---

## POST /api/auth/login

Authentifie un utilisateur et retourne un token JWT.
```
Body JSON requis :
{
  "email": "nom@example.com",
  "password": "motdepasse123"
}

Réponses :
Code    Cas
200     Authentification réussie
        {
          "status": "success",
          "token": "<JWT>",
          "user": { "id": 1, "name": "Nom", "email": "nom@example.com", "role": "USER" }
        }
400     Champ manquant
        { "status": "error", "message": "email and password are required." }
401     Email ou mot de passe incorrect
        { "status": "error", "message": "Invalid credentials." }
429     Too Many Requests
        { "status": "error", "message": "Too many requests." }
```

---

## GET /api/offers

Liste les offres actives avec filtres et pagination.
```
Query params (optionnels) :
{
  "q": "react",
  "location": "Paris",
  "contract_type": "CDI",
  "source": "welovedevs",
  "limit": 20,
  "offset": 0
}

Réponses :
Code    Cas
200     Retourne la liste des offres
        {
          "status": "success",
          "data": [
            {
              "id": 1,
              "external_id": "abc123",
              "source": "welovedevs",
              "title": "Développeur React",
              "description": "...",
              "company": "Acme",
              "location": "Paris",
              "contract_type": "CDI",
              "salary": "40000-50000 EUR/year",
              "remote": 1,
              "apply_url": "https://...",
              "published_at": "2026-01-15 10:00:00"
            }
          ]
        }
```

---

## GET /api/offers/:id

Retourne le détail d'une offre.
```
Params :
  id    Identifiant de l'offre

Réponses :
Code    Cas
200     Retourne l'offre
        { "status": "success", "data": { ...offre } }
404     Offre introuvable
        { "status": "error", "message": "Offer not found." }
```

---

## POST /api/ingestion/welovedevs

Importe des offres depuis l'API WeLoveDevs. Requiert un token JWT avec rôle ADMIN.
```
Header requis :
  Authorization: Bearer <token>

Body JSON (optionnel) :
{
  "page": 0,
  "q": "javascript",
  "size": 20
}

Réponses :
Code    Cas
201     Import réussi
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
401     Token manquant ou invalide
        { "status": "error", "message": "Missing or invalid authorization header." }
403     Rôle insuffisant
        { "status": "error", "message": "Forbidden: insufficient permissions." }
429     Too Many Requests
        { "status": "error", "message": "Too many requests." }
500     WELOVEDEVS_API_KEY manquante
        { "status": "error", "message": "Missing WELOVEDEVS_API_KEY." }
502     Erreur de l'API WeLoveDevs
        { "status": "error", "message": "WeLoveDevs API error." }
```

---

## GET /api/analytics

Retourne des statistiques agrégées sur les offres actives. Route publique.
```
Réponses :
Code    Cas
200     Statistiques calculées
        {
          "status": "success",
          "data": {
            "totalOffers": 142,
            "byCategory": [
              { "category": "Backend", "count": 45 },
              { "category": "Frontend", "count": 30 }
            ],
            "byContractType": [
              { "contract_type": "CDI", "count": 80 },
              { "contract_type": "INTERNSHIP", "count": 25 }
            ],
            "topCompanies": [
              { "company": "Acme", "count": 8 }
            ],
            "topLocations": [
              { "location": "Paris", "count": 50 }
            ],
            "remoteRatio": {
              "remote": 60,
              "onsite": 82,
              "total": 142
            },
            "byMonth": [
              { "month": "2026-01", "count": 20 },
              { "month": "2026-02", "count": 35 }
            ]
          }
        }
500     Erreur serveur
        { "status": "error", "message": "Internal server error." }
```

---

## GET /api/admin/users

Liste tous les utilisateurs. Requiert un token JWT avec rôle ADMIN.
```
Header requis :
  Authorization: Bearer <token>

Réponses :
Code    Cas
200     Retourne la liste des utilisateurs
        {
          "status": "success",
          "data": [
            { "id": 1, "name": "Nom", "email": "nom@example.com", "role": "USER", "created_at": "2026-01-01 00:00:00" }
          ]
        }
401     Token manquant ou invalide
        { "status": "error", "message": "Unauthorized." }
403     Rôle insuffisant
        { "status": "error", "message": "Forbidden." }
```

---

## PATCH /api/admin/users/:id/role

Modifie le rôle d'un utilisateur. Requiert un token JWT avec rôle ADMIN.
```
Header requis :
  Authorization: Bearer <token>

Body JSON requis :
{
  "role": "ADMIN"
}

Réponses :
Code    Cas
200     Rôle mis à jour
        { "status": "success", "message": "User role updated." }
400     Rôle invalide
        { "status": "error", "message": "Invalid role." }
401     Token manquant ou invalide
        { "status": "error", "message": "Unauthorized." }
403     Rôle insuffisant ou modification de son propre compte
        { "status": "error", "message": "Forbidden." }
404     Utilisateur introuvable
        { "status": "error", "message": "User not found." }
```

---

## DELETE /api/admin/users/:id

Supprime un utilisateur. Requiert un token JWT avec rôle ADMIN.
```
Header requis :
  Authorization: Bearer <token>

Réponses :
Code    Cas
200     Utilisateur supprimé
        { "status": "success", "message": "User deleted." }
401     Token manquant ou invalide
        { "status": "error", "message": "Unauthorized." }
403     Rôle insuffisant ou suppression de son propre compte
        { "status": "error", "message": "Forbidden." }
404     Utilisateur introuvable
        { "status": "error", "message": "User not found." }
```

---

## GET /api/admin/offers

Liste toutes les offres (actives et inactives). Requiert un token JWT avec rôle ADMIN.
```
Header requis :
  Authorization: Bearer <token>

Query params (optionnels) :
  limit     Défaut 20
  offset    Défaut 0

Réponses :
Code    Cas
200     Retourne la liste des offres
        { "status": "success", "data": [ ...offres ] }
401     Token manquant ou invalide
        { "status": "error", "message": "Unauthorized." }
403     Rôle insuffisant
        { "status": "error", "message": "Forbidden." }
```

---

## PATCH /api/admin/offers/:id/status

Active ou désactive une offre. Requiert un token JWT avec rôle ADMIN.
```
Header requis :
  Authorization: Bearer <token>

Body JSON requis :
{
  "is_active": true
}

Réponses :
Code    Cas
200     Statut mis à jour
        { "status": "success", "message": "Offer status updated." }
401     Token manquant ou invalide
        { "status": "error", "message": "Unauthorized." }
403     Rôle insuffisant
        { "status": "error", "message": "Forbidden." }
404     Offre introuvable
        { "status": "error", "message": "Offer not found." }
```

---

## DELETE /api/admin/offers/:id

Supprime définitivement une offre. Requiert un token JWT avec rôle ADMIN.
```
Header requis :
  Authorization: Bearer <token>

Réponses :
Code    Cas
200     Offre supprimée
        { "status": "success", "message": "Offer deleted." }
401     Token manquant ou invalide
        { "status": "error", "message": "Unauthorized." }
403     Rôle insuffisant
        { "status": "error", "message": "Forbidden." }
404     Offre introuvable
        { "status": "error", "message": "Offer not found." }
```

---

## GET /ping

Vérifie que le serveur est en ligne.
```
Réponses :
Code    Cas
200     Serveur opérationnel
        { "status": "ok" }
```
