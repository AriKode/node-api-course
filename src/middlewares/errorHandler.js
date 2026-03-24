const errorHandler = (err, req, res, next) => {
  // Aucune donnée sensible dans les logs applicatifs
  console.error({
    message: err.message,
    name: err.name,
    stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined,
    path: req.path,
    method: req.method
  });

  const statusCode = err.statusCode || 500;

  if (process.env.NODE_ENV === 'production' && statusCode >= 500) {
    return res.status(500).json({ error: 'Erreur interne' });
  }

  const message = err.message || 'Erreur interne au serveur';
  res.status(statusCode).json({ error: message, ...err.data });
};

module.exports = errorHandler;
