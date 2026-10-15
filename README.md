# Job Aggregator — WeLoveDevs

Application web de recherche d'offres d'emploi tech, construite par-dessus l'API de [WeLoveDevs](https://welovedevs.com) dans le cadre d'un projet partenaire d'Epitech (B-YEP-200).

Les offres brutes de l'API sont importées, normalisées, stockées en base, puis classées automatiquement par domaine métier (Backend, DevOps, Data & AI, Cybersécurité…) grâce à un modèle de machine learning. Un espace d'administration permet de modérer les offres et de gérer les utilisateurs.

## Fonctionnalités

- **Import des offres** depuis l'API WeLoveDevs : récupération, normalisation, upsert MySQL (pas de doublons)
- **Recherche et filtres** sur les offres, page de détail
- **Classification automatique** des offres en 10 domaines métier (TF-IDF + régression logistique, 82 % d'accuracy sur un jeu de test de 100 offres réelles), exportée en ONNX
- **Comptes utilisateurs** : inscription, connexion, profil
- **Administration** : gestion des offres et des utilisateurs, contrôle d'accès par rôle
- **Accessibilité** : score Lighthouse de 96/100 sur les pages principales

## Stack technique

| Couche | Technologies |
| --- | --- |
| Front-end | React 18, React Router, Vite, Tailwind CSS |
| Back-end | Node.js, Express 5, API REST |
| Base de données | MySQL 8 |
| Sécurité | JWT, bcrypt, Helmet, CORS, rate limiting |
| Machine learning | Python, scikit-learn, ONNX |
| Qualité | ESLint, Jest, CI GitHub Actions (syntaxe, chargement de l'app, lint, tests) |
| Déploiement | Docker, Docker Compose |

## Structure

```
backend/     API Express (routes, contrôleurs, services d'ingestion, classifieur)
Frontend/    Application React
ml/          Entraînement du classifieur (notebook) et modèle exporté
docs/        Documentation : architecture, décisions, pipeline de données, routes, audit d'accessibilité
buisness/    Rapport et maquettes
```

## Lancer le projet

```bash
cp .env.example .env    # puis renseigner les valeurs (clé API WeLoveDevs, secret JWT…)
docker compose up --build
```

- Front-end : http://localhost:3000
- API : http://localhost:4000/api
- MySQL : port 3306

Le détail de l'import des données est dans [docs/data-pipeline.md](docs/data-pipeline.md), et les routes de l'API dans [docs/routes_doc.md](docs/routes_doc.md).

## Documentation

- [Décisions d'architecture et de produit](docs/decisions.md)
- [Back-end](docs/backend.md)
- [Justification de l'innovation (classifieur)](docs/innovation-justification.md)
- [Audit d'accessibilité](docs/accessibility-audit.md)
- [Gestion de projet](docs/project-management.md)

## Équipe

Projet réalisé en équipe de 4 à Epitech (2026) : Alex, Leon, Mattis Philippe et Mathieu Jin.
