const livreService = require('../services/livreService');

const getAllLivres = async (req, res, next) => {
  try {
    const livres = await livreService.getAllLivres();
    res.status(200).json(livres);
  } catch (err) {
    next(err);
  }
};

const getLivreById = async (req, res, next) => {
  try {
    const livre = await livreService.getLivreById(req.params.id);
    res.status(200).json(livre);
  } catch (err) {
    next(err);
  }
};

const createLivre = async (req, res, next) => {
  try {
    const livre = await livreService.createLivre(req.body);
    res.status(201).json(livre);
  } catch (err) {
    next(err);
  }
};

const updateLivre = async (req, res, next) => {
  try {
    const livre = await livreService.updateLivre(req.params.id, req.body);
    res.status(200).json(livre);
  } catch (err) {
    next(err);
  }
};

const deleteLivre = async (req, res, next) => {
  try {
    await livreService.deleteLivre(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

const emprunterLivre = async (req, res, next) => {
  try {
    const result = await livreService.emprunterLivre(req.params.id, req.user.id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

const retournerLivre = async (req, res, next) => {
  try {
    const result = await livreService.retournerLivre(req.params.id, req.user.id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllLivres,
  getLivreById,
  createLivre,
  updateLivre,
  deleteLivre,
  emprunterLivre,
  retournerLivre
};
