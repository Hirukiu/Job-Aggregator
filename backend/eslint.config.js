const js      = require('@eslint/js');
const globals = require('globals');

// Tableau de couches : chaque objet s'applique dans l'ordre, les suivants complètent les précédents
module.exports = [

  // Couche 1 : règles recommandées par ESLint (pas de variable non déclarée, pas de == au lieu de ===, etc.)
  js.configs.recommended,

  // Couche 2 : config perso appliquée à tous les fichiers
  {
    ignores: ['node_modules/**'],
    languageOptions: {
      ecmaVersion: 2022,      // syntaxe JS moderne
      sourceType: 'commonjs', // on utilise require/module.exports
      globals: globals.node,
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-console':     'off',
      'semi':           ['error', 'always'],
      'quotes':         ['error', 'single'],
    },
  },

  // Couche 3 : ajoute les globals Jest uniquement pour les fichiers de test
  {
    files: ['src/__tests__/**/*.js'],
    languageOptions: {
      globals: { ...globals.node, ...globals.jest },
    },
  },

];
