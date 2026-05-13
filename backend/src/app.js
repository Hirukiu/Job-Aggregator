const express   = require('express');
const helmet    = require('helmet');
const cors      = require('cors');
require('dotenv').config();

const errorHandler = require('./middleware/errorHandler');

const app = express();


// helmet() ajoute automatiquement des headers HTTP de sécurité
app.use(helmet());

// autorisation des requêtes venant du frontend
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true, // autorise l'envoi de headers d'auth
}));

// Permet à Express de lire le JSON envoyé dans le body des requêtes POST/PUT
app.use(express.json());


// Route de santé : vérifie rapidement que le serveur tourne
app.get('/ping', (req, res) => {
  res.json({ status: 'ok' });
});

// Routes auth : register et login
app.use('/api/auth', require('./routes/auth'));
app.use('/api/offers', require('./routes/offers'));
app.use('/api/ingestion', require('./routes/ingestion'));
app.use('/api/admin', require('./routes/admin'));

app.use(errorHandler);

module.exports = app;

// Démarrage du serveur uniquement si ce fichier est exécuté directement
if (require.main === module) {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT);
}
