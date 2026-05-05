const jwt = require('jsonwebtoken');

// Middleware d'authentification JWT.


function authenticate(req, res, next) {
  
  // récupère le header authorization envoyé par le client
  
  const authHeader = req.headers.authorization;

  // verifie si le header est absent ou invalide
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      status: 'error',
      message: 'Missing or invalid authorization header.',
    });
  }

  // Récupere seulement le token 
  const token = authHeader.split(' ')[1];

  try {
    // récupere les données qu'on avait mis dans le token si il est valide
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // On ajoute les infos du token à la requête
  
    req.user = payload;
    next();
  } catch (err) {
    next(err);
  }
}

// Middleware de vérification du rôle.

function requireRole(...roles) {
  return (req, res, next) => {
    // Si l'utilisateur n'a pas le rôle néccecaire : 403 Forbidden
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'Forbidden: insufficient permissions.',
      });
    }
    next();
  };
}

module.exports = { authenticate, requireRole };
