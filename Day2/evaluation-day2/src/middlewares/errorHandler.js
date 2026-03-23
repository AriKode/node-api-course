const errorHandler = (err, req, res, next) => {
  console.error(err);
  if (err.name === 'ZodError') {
    return res.status(400).json({ error: 'Données invalides', details: err.errors });
  }
  return res.status(500).json({ error: 'Erreur serveur interne' });
};

module.exports = errorHandler;
