const express = require('express');
const { 
  getAllLivres, 
  getLivreById, 
  createLivre, 
  updateLivre, 
  deleteLivre, 
  emprunterLivre, 
  retournerLivre 
} = require('../controllers/livres.controller');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');

const router = express.Router();

router.get('/', getAllLivres);
router.get('/:id', getLivreById);

router.post('/', authenticate, authorize(['user', 'admin']), createLivre);
router.put('/:id', authenticate, authorize(['user', 'admin']), updateLivre);
router.delete('/:id', authenticate, authorize(['admin']), deleteLivre);

router.post('/:id/emprunter', authenticate, authorize(['user', 'admin']), emprunterLivre);
router.post('/:id/retourner', authenticate, authorize(['user', 'admin']), retournerLivre);

module.exports = router;
