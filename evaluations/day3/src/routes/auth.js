const express = require('express');
const { register, login, refresh, logout, me } = require('../controllers/authController');
const authenticate = require('../middlewares/authenticate');
const validate = require('../middlewares/validate');
const { registerSchema, loginSchema } = require('../validators/authValidator');

const router = express.Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Inscription d'un nouvel utilisateur
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nom
 *               - email
 *               - password
 *             properties:
 *               nom:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès
 *       400:
 *         description: Erreur de validation
 *       409:
 *         description: Email déjà utilisé
 */
router.post('/register', validate(registerSchema), register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Connexion utilisateur
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Authentification réussie
 *       401:
 *         description: Email ou mot de passe incorrect
 */
router.post('/login', validate(loginSchema), login);

router.post('/refresh', refresh);
router.post('/logout', logout);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Afficher les informations de l'utilisateur connecté
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Informations utilisateur récupérées
 *       401:
 *         description: Non autorisé (token manquant ou invalide)
 *       404:
 *         description: Utilisateur introuvable
 */
router.get('/me', authenticate, me);

module.exports = router;
