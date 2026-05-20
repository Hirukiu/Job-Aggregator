
// NLP classifier entraîné dans ml/train_classifier.ipynb.

const path = require('path');
const fs   = require('fs');

const MODEL_PATH = path.resolve(__dirname, '../../..', 'ml', 'classifier.json');

// Singleton – modèle chargé une seule fois
let _model = null;

function getModel() {
  if (_model) return _model;
  const raw = fs.readFileSync(MODEL_PATH, 'utf8');
  _model = JSON.parse(raw);
  return _model;
}

/**
 * Tokenise un texte.
 */
function tokenize(text, ngramRange = [1, 2]) {
  const tokens = text.toLowerCase().match(/\b\w[\w'-]*\b/g) || [];
  const ngrams = [];

  for (let n = ngramRange[0]; n <= ngramRange[1]; n++) {
    for (let i = 0; i <= tokens.length - n; i++) {
      ngrams.push(tokens.slice(i, i + n).join(' '));
    }
  }

  return ngrams;
}

/**
 * Repasse le modéle en JSON en un model utilisable.
 */
function tfidfVector(text, model) {
  const { vocabulary, idf, ngram_range, sublinear_tf } = model;
  const ngrams = tokenize(text, ngram_range);
  const size = idf.length;
  const tf = new Float64Array(size);

  // Compte des occurrences de chaque n-gramme
  for (const ng of ngrams) {
    const idx = vocabulary[ng];
    if (idx !== undefined) tf[idx]++;
  }

  // TF-IDF : tf * idf (avec log(tf)+1 si sublinear_tf)
  const vec = new Float64Array(size);
  for (let i = 0; i < size; i++) {
    if (tf[i] === 0) continue;
    const tfVal = sublinear_tf ? Math.log(tf[i]) + 1 : tf[i];
    vec[i] = tfVal * idf[i];
  }

  // Normalisation L2
  let norm = 0;
  for (let i = 0; i < size; i++) norm += vec[i] * vec[i];
  norm = Math.sqrt(norm);
  if (norm > 0) for (let i = 0; i < size; i++) vec[i] /= norm;

  return vec;
}

/**
 * Classify a job offer into a domain category using the trained NLP model.
 * @param {string} title
 * @param {string} description
 * @returns {string} Category name
 */
function classifyOffer(title = '', description = '') {
  const model = getModel();

  const cleanDesc = description.replace(/<[^>]+>/g, ' ').substring(0, 512);
  const text      = `${title} ${title} ${cleanDesc}`.trim();

  const vec = tfidfVector(text, model);

  // Logistic regression : score = coef · vec + intercept → argmax
  const { coef, intercept, classes } = model;
  let bestClass = classes[0];
  let bestScore = -Infinity;

  for (let c = 0; c < classes.length; c++) {
    let score = intercept[c];
    for (let i = 0; i < vec.length; i++) {
      if (vec[i] !== 0) score += coef[c][i] * vec[i];
    }
    if (score > bestScore) {
      bestScore = score;
      bestClass = classes[c];
    }
  }

  return bestClass;
}

module.exports = { classifyOffer };
