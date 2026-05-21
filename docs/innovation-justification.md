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

Classificateur **TF-IDF + Logistic Regression** entraîné sur 500 vraies offres WeLoveDevs, exporté en JSON et exécuté nativement dans Node.js.

- Entraînement : `ml/train_classifier.ipynb` (Python / scikit-learn)
- Poids exportés : `ml/classifier.json` (~200 KB)
- Inférence : `backend/src/utils/classifier.js` (aucune dépendance ML externe)

**Fonctionnement :**
1. Concatène le titre et la description de l'offre.
2. Tokenise le texte en unigrammes et bigrammes.
3. Calcule le vecteur TF-IDF normalisé (L2).
4. Applique la régression logistique : produit scalaire du vecteur avec les coefficients de chaque classe.
5. Retourne la classe avec le score le plus élevé.
6. Fallback : catégorie "Autre" si tous les scores sont inférieurs au seuil.

**10 catégories couvertes :**
Autre, Backend, Cybersécurité, Data & AI, DevOps & Cloud, Embedded & Hardware, Frontend, Fullstack, Gestion de projet, Mobile.

**Exemple de classification :**

| Titre de l'offre | Catégorie assignée |
|---|---|
| "Développeur React.js - CDI Paris" | Frontend |
| "Ingénieur DevOps AWS" | DevOps & Cloud |
| "Data Scientist - Machine Learning" | Data & AI |
| "Pentesteur / Ethical Hacker" | Cybersécurité |

### Contraintes techniques respectées

| Contrainte (cahier des charges) | Valeur réelle |
|---|---|
| Taille sur disque < 500 MB | **~200 KB** (`ml/classifier.json`) |
| Résultat en < 5 secondes par offre | **< 1 ms** par offre (inférence pure JavaScript) |
| Pas de fine-tuning au démarrage | **Aucun entraînement** — modèle chargé une fois en mémoire |
| Pas d'API externe | **Aucune dépendance réseau** |

### Pourquoi cette approche est pertinente

- **Entraîné sur de vraies données** : 500 offres WeLoveDevs réelles — meilleure généralisation qu'un dictionnaire fixe de mots-clés.
- **Robuste aux variations** : gère les synonymes, abréviations et intitulés ambigus grâce aux bigrammes TF-IDF.
- **Aucune dépendance runtime** : l'inférence est 100 % JavaScript, aucune bibliothèque ML à installer dans le conteneur.
- **Output visible dans le dashboard** : les catégories alimentent le widget "Offres par domaine" sur la page d'accueil (`Home.jsx`), permettant un filtre cliquable par domaine.

### Alternative rejetée

**Classificateur par dictionnaire de mots-clés** a été implémenté dans une version antérieure.
Remplacé car :
- Sensible aux variations de vocabulaire (synonymes, abréviations, fautes de frappe).
- Nécessite une maintenance manuelle de la liste de mots-clés à chaque nouveau domaine.
- Précision limitée sur les intitulés ambigus (ex: "Tech Lead Full Stack Cybersécurité").
- Accuracy mesurée : ~60 % contre 82 % pour TF-IDF + LR sur le même jeu de test.

### Mesure du succès

| Indicateur | Cible | Résultat observé |
|---|---|---|
| Accuracy sur jeu de test (100 offres) | > 80 % | **82 %** |
| Validation croisée 5-fold | > 65 % | **71 % ± 10 %** |
| Taux de "Autre" après import | < 20 % | Vérifiable via `GET /api/analytics` (`byCategory`) |
| Temps de traitement par offre | < 5 ms | **< 1 ms** |
| Présence de `category` non null | 100 % des offres | Vérifié par `SELECT COUNT(*) FROM offers WHERE category IS NULL` |

La matrice de confusion est disponible dans `ml/confusion_matrix.png`.

### Résultat observé

Après import depuis WeLoveDevs, le endpoint `GET /api/analytics` retourne la répartition réelle par catégorie dans le champ `byCategory`.
La distribution est cohérente avec le marché tech français (majorité Backend/Fullstack, présence significative de DevOps et Frontend).
Le widget "Offres par domaine" sur la page d'accueil affiche ces catégories comme filtres cliquables, rendant l'output IA directement visible sans navigation supplémentaire.
