
const CATEGORIES = [
  {
    name: 'Data & AI',
    priority: 10,
    keywords: [
      'machine learning', 'deep learning', 'data scientist', 'data science',
      'data engineer', 'data analyst', 'mlops', 'nlp', 'computer vision',
      'tensorflow', 'pytorch', 'scikit', 'pandas', 'spark', 'hadoop',
      'airflow', 'kafka', 'big data', 'business intelligence',
      'tableau', 'power bi', 'looker', 'dbt', 'etl',
      'modèle prédictif', 'intelligence artificielle',
    ],
  },
  {
    name: 'Mobile',
    priority: 9,
    keywords: [
      'ios', 'android', 'react native', 'flutter', 'swift', 'kotlin',
      'mobile developer', 'développeur mobile', 'xamarin', 'ionic',
      'app store', 'play store', 'xcode',
    ],
  },
  {
    name: 'DevOps & Cloud',
    priority: 8,
    keywords: [
      'devops', 'sre', 'site reliability', 'cloud engineer', 'platform engineer',
      'infrastructure', 'kubernetes', 'k8s', 'docker', 'terraform', 'ansible',
      'aws', 'gcp', 'azure', 'ci/cd', 'gitlab ci', 'github actions', 'jenkins',
      'sysadmin', 'réseau', 'network',
    ],
  },
  {
    name: 'Cybersécurité',
    priority: 7,
    keywords: [
      'cybersécurité', 'cybersecurity', 'sécurité informatique', 'pentest',
      'penetration testing', 'soc analyst', 'siem', 'vulnerability', 'ethical hacking',
      'red team', 'blue team', 'cryptography', 'firewall', 'sécurité applicative',
    ],
  },
  {
    name: 'Frontend',
    priority: 6,
    keywords: [
      'frontend', 'front-end', 'front end', 'développeur front',
      'react', 'vue', 'angular', 'svelte', 'next.js', 'nuxt',
      'html', 'css', 'sass', 'webpack', 'vite', 'ui developer',
      'intégrateur', 'intégration web',
    ],
  },
  {
    name: 'Embedded & Hardware',
    priority: 5,
    keywords: [
      'embarqué', 'embedded', 'firmware', 'fpga', 'iot', 'arduino',
      'raspberry', 'rtos', 'système temps réel', 'électronique', 'hardware',
    ],
  },
  {
    name: 'Backend',
    priority: 4,
    keywords: [
      'backend', 'back-end', 'back end', 'développeur back',
      'api rest', 'restful', 'microservices', 'node.js', 'express',
      'django', 'fastapi', 'flask', 'spring', 'laravel', 'rails',
      'nestjs', 'graphql', 'database', 'sql',
    ],
  },
  {
    name: 'Fullstack',
    priority: 3,
    keywords: [
      'fullstack', 'full-stack', 'full stack', 'développeur fullstack',
      'frontend et backend', 'front et back',
    ],
  },
  {
    name: 'Gestion de projet',
    priority: 2,
    keywords: [
      'chef de projet', 'project manager', 'scrum master', 'product owner',
      'product manager', 'agile coach', 'delivery manager',
    ],
  },
  {
    name: 'Autre',
    priority: 1,
    keywords: [],
  },
];

// trier les categories par leurs priorité

const SORTED_CATEGORIES = [...CATEGORIES].sort((a, b) => b.priority - a.priority);

/**
 * Classify a job offer into a domain category.
 * @param {string} title       - Offer title
 * @param {string} description - Offer description
 * @returns {string} Category name 
 */
function classifyOffer(title = '', description = '') {
  // Title is weighted more heavily by repeating it.
  const text = `${title} ${title} ${title} ${description}`.toLowerCase();

  for (const category of SORTED_CATEGORIES) {
    if (category.keywords.length === 0) continue;

    const matched = category.keywords.some((kw) => text.includes(kw));
    if (matched) return category.name;
  }

  return 'Autre';
}

module.exports = { classifyOffer };
