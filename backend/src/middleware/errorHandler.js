// Middleware de gestion centralisée des erreurs.

function errorHandler(err, req, res, next) {

  // Erreur token invalide ou expiré : 401 Unauthorized
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid or expired token.',
    });
  }

  // Erreur avec un statusCode
  
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  }

  // Erreur interne inattendue on renvoie un 500
  console.error(err);
  return res.status(500).json({
    status: 'error',
    message: 'Internal server error.',
  });
}

module.exports = errorHandler;
