# Innovation Justification — Features Data & IA

Ce document répond aux exigences du cahier des charges :
> *"For your dashboard and advanced features, you must justify: the user problem addressed; your feature hypothesis; why this approach is relevant; how success will be measured."*

---

## Feature 1 — Dashboard Analytics (Feature Data)

### Problème utilisateur

Un étudiant qui cherche un stage ou une alternance fait face à des centaines d'offres sans contexte.
Il ne sait pas :
- quels secteurs recrutent le plus en ce moment,
- si les offres en télétravail sont rares ou courantes,
- quelle est la tendance du marché sur les derniers mois (est-ce que les recrutements augmentent ?),
- quelles entreprises publient le plus d'offres.

Résultat : il perd du temps à parcourir manuellement des listes, sans vue d'ensemble.

### Hypothèse

> En affichant des statistiques agrégées directement visibles sur la page d'accueil (sans navigation supplémentaire), l'utilisateur peut orienter sa recherche plus vite et cibler les offres les plus pertinentes pour lui.

### Approche retenue

Le endpoint `GET /api/analytics` (voir `backend/src/controllers/analyticsController.js`) calcule en temps réel 7 agrégations parallèles sur la table `offers` :

| Widget | Donnée | Décision utilisateur supportée |
|---|---|---|
| Nombre total d'offres | `COUNT(*)` | "Est-ce que le marché est actif ?" |
| Répartition par catégorie | `GROUP BY category` | "Dans quel domaine y a-t-il le plus d'offres ?" |
| Répartition par type de contrat | `GROUP BY contract_type` | "Y a-t-il des offres pour mon type de contrat ?" |
| Top 10 entreprises | `GROUP BY company ORDER BY count DESC` | "Quelles entreprises recrutent le plus ?" |
| Top 10 localisations | `GROUP BY location ORDER BY count DESC` | "Où se concentrent les opportunités ?" |
| Ratio télétravail / présentiel | `SUM(remote=1)` vs `SUM(remote=0)` | "Est-ce que je peux travailler à distance ?" |
| Tendance sur 6 mois | `GROUP BY DATE_FORMAT(published_at, '%Y-%m')` | "Le marché est-il en croissance ou en déclin ?" |

Toutes les requêtes s'exécutent en parallèle (`Promise.all`) pour limiter la latence.

### Pourquoi cette approche est pertinente

- **Zéro surcoût de stockage** : les agrégations sont calculées à la volée sur la table `offers` déjà existante.
- **Données réelles** : les stats reflètent exactement les offres importées depuis WeLoveDevs, pas des données fictives.
- **Accessible sans authentification** : un visiteur non connecté peut déjà évaluer le marché avant de s'inscrire.
- **Intégré dans le dashboard** : visible sur la page d'accueil sans navigation supplémentaire (exigence du cahier des charges).

### Alternative rejetée

Une solution de type **Business Intelligence externe** (Grafana, Metabase) aurait offert des visualisations plus riches.
Rejetée car : ajout d'un service supplémentaire, complexité de déploiement disproportionnée, et données identiques — le gain utilisateur ne justifie pas le coût d'intégration pour ce projet.

### Mesure du succès

| Indicateur | Cible | Comment vérifier |
|---|---|---|
| Temps de réponse du endpoint `/api/analytics` | < 500 ms | Mesurable avec `curl -o /dev/null -s -w "%{time_total}"` |
| Toutes les catégories présentes dans `byCategory` | > 3 catégories distinctes après import de 50+ offres | Vérification manuelle via l'API |
| Ratio télétravail cohérent | Entre 10 % et 80 % selon le marché réel | Comparaison avec les données WeLoveDevs brutes |
| Tendance sur 6 mois retourne des données | Au moins 1 mois présent dans `byMonth` | Test automatisé dans `analytics.test.js` |

---

## Feature 2 — Classification automatique des offres (Feature IA)

### Problème utilisateur

Les offres importées depuis WeLoveDevs couvrent des métiers très différents : DevOps, Frontend, Data Science, Cybersécurité, etc.
Sans catégorisation, l'utilisateur ne peut pas filtrer par domaine métier — il doit lire chaque intitulé un par un.

Un étudiant en cybersécurité ne veut pas voir des offres de chef de projet ou de développeur mobile. Sans classification, le filtre par mots-clés dans la barre de recherche est la seule solution, ce qui suppose de connaître à l'avance les bons termes à chercher.

### Hypothèse

> En assignant automatiquement une catégorie métier à chaque offre au moment de l'import, on permet à l'utilisateur de filtrer par domaine sans effort, et on enrichit les analytics du dashboard avec une dimension métier réelle.

### Approche retenue

Classificateur **basé sur un dictionnaire de mots-clés avec système de priorité**, implémenté dans `backend/src/utils/classifier.js`.

**Fonctionnement :**
1. Concatène le titre de l'offre (pondéré ×3) et la description.
2. Passe le texte en minuscules.
3. Parcourt 9 catégories triées par priorité décroissante.
4. Retourne la première catégorie dont un mot-clé est trouvé dans le texte.
5. Fallback : catégorie "Autre" si aucun mot-clé ne correspond.

**9 catégories couvertes :**
Data & AI, Mobile, DevOps & Cloud, Cybersécurité, Frontend, Embedded & Hardware, Backend, Fullstack, Gestion de projet.

**Exemple de classification :**

| Titre de l'offre | Mots-clés déclencheurs | Catégorie assignée |
|---|---|---|
| "Développeur React.js - CDI Paris" | `react` | Frontend |
| "Ingénieur DevOps AWS" | `devops`, `aws` | DevOps & Cloud |
| "Data Scientist - Machine Learning" | `data scientist`, `machine learning` | Data & AI |
| "Pentesteur / Ethical Hacker" | `pentest`, `ethical hacking` | Cybersécurité |

### Contraintes techniques respectées

| Contrainte (cahier des charges) | Valeur réelle |
|---|---|
| Taille sur disque < 500 MB | **0 MB** supplémentaire (code pur, pas de fichier modèle) |
| Résultat en < 5 secondes par offre | **< 1 ms** par offre (pure manipulation de chaîne) |
| Pas de fine-tuning au démarrage | **Non applicable** (aucun modèle à charger) |
| Pas d'API externe | **Aucune dépendance réseau** |

### Pourquoi cette approche est pertinente

- **Déterministe** : le même intitulé produit toujours la même catégorie — pas de variance aléatoire.
- **Transparent et maintenable** : ajouter une catégorie ou un mot-clé ne demande que d'éditer un tableau dans `classifier.js`.
- **Adapté au domaine** : les mots-clés sont spécifiques au secteur tech, ce qui réduit les faux positifs.
- **Pondération du titre** : le titre est répété 3× dans le texte analysé car il porte plus de signal sémantique que la description.

### Alternative rejetée

**Modèle NLP léger** (`fasttext` pré-entraîné sur des données tech) aurait offert une meilleure précision sur des intitulés ambigus (ex: "Développeur" sans spécialité).
Rejeté car :
- Taille du modèle (~200-300 MB) proche de la limite autorisée.
- Temps de chargement au démarrage du conteneur non garanti < 5 secondes sur tous les environnements.
- Complexité d'intégration (installation de binaires, wrapper Node.js) disproportionnée par rapport au gain de précision sur ce volume de données.

### Mesure du succès

| Indicateur | Cible | Comment vérifier |
|---|---|---|
| Taux de classification correcte | > 80 % | Vérification manuelle sur 20 offres importées : comparer `category` en base avec la catégorie attendue au vu de l'intitulé |
| Taux de "Autre" | < 20 % | `SELECT category, COUNT(*) FROM offers GROUP BY category` — si "Autre" dépasse 20 %, le dictionnaire est insuffisant |
| Temps de traitement par offre | < 5 ms | Mesurable dans les logs d'ingestion |
| Présence de `category` dans les analytics | Toutes les imports doivent avoir un `category` non null | Vérifié par `SELECT COUNT(*) FROM offers WHERE category IS NULL` |

### Résultat observé

Après import de 50 offres depuis WeLoveDevs, le endpoint `GET /api/analytics` retourne la répartition réelle par catégorie dans le champ `byCategory`.
La distribution observée est cohérente avec le marché tech français (majorité Backend/Fullstack, présence significative de DevOps et Frontend).
