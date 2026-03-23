const { z } = require('zod');
const prisma = require('../db/prisma');

const livreSchema = z.object({
  titre: z.string().min(1, "Le titre est obligatoire"),
  auteur: z.string().min(1, "L'auteur est obligatoire"),
  annee: z.number().int().optional(),
  genre: z.string().optional()
});

const getAllLivres = async (req, res, next) => {
  try {
    const livres = await prisma.livre.findMany();
    res.status(200).json(livres);
  } catch (err) {
    next(err);
  }
};

const getLivreById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const livre = await prisma.livre.findUnique({
      where: { id: parseInt(id) }
    });

    if (!livre) {
      return res.status(404).json({ error: 'Livre non trouvé' });
    }

    res.status(200).json(livre);
  } catch (err) {
    next(err);
  }
};

const createLivre = async (req, res, next) => {
  try {
    const data = livreSchema.parse(req.body);
    const livre = await prisma.livre.create({
      data
    });
    res.status(201).json(livre);
  } catch (err) {
    next(err);
  }
};

const updateLivre = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const livre = await prisma.livre.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    res.status(200).json(livre);
  } catch (err) {
    next(err);
  }
};

const deleteLivre = async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.livre.delete({
      where: { id: parseInt(id) }
    });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

const emprunterLivre = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // We use a transaction to ensure atomic operations
    const result = await prisma.$transaction(async (tx) => {
      const livre = await tx.livre.findUnique({
        where: { id: parseInt(id) }
      });

      if (!livre) {
        throw new Error('NOT_FOUND');
      }

      if (!livre.disponible) {
        throw new Error('UNAVAILABLE');
      }

      const updatedLivre = await tx.livre.update({
        where: { id: parseInt(id) },
        data: { disponible: false }
      });

      const emprunt = await tx.emprunt.create({
        data: {
          livreId: parseInt(id),
          userId: userId
        }
      });

      return { livre: updatedLivre, emprunt };
    });

    res.status(200).json(result);
  } catch (err) {
    if (err.message === 'NOT_FOUND') {
      return res.status(404).json({ error: 'Livre non trouvé' });
    }
    if (err.message === 'UNAVAILABLE') {
      return res.status(409).json({ error: 'Livre non disponible' });
    }
    next(err);
  }
};

const retournerLivre = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await prisma.$transaction(async (tx) => {
      const livre = await tx.livre.findUnique({
        where: { id: parseInt(id) }
      });

      if (!livre) {
        throw new Error('NOT_FOUND');
      }

      if (livre.disponible) {
        throw new Error('ALREADY_RETURNED');
      }

      const emprunt = await tx.emprunt.findFirst({
        where: { livreId: parseInt(id), userId, dateRetour: null },
        orderBy: { dateEmprunt: 'desc' }
      });

      if (!emprunt) {
        throw new Error('NO_EMPRUNT');
      }

      const updatedLivre = await tx.livre.update({
        where: { id: parseInt(id) },
        data: { disponible: true }
      });

      const updatedEmprunt = await tx.emprunt.update({
        where: { id: emprunt.id },
        data: { dateRetour: new Date() }
      });

      return { livre: updatedLivre, emprunt: updatedEmprunt };
    });

    res.status(200).json(result);
  } catch (err) {
    if (err.message === 'NOT_FOUND') {
      return res.status(404).json({ error: 'Livre non trouvé' });
    }
    if (err.message === 'ALREADY_RETURNED') {
      return res.status(400).json({ error: 'Livre déjà retourné' });
    }
    if (err.message === 'NO_EMPRUNT') {
      return res.status(404).json({ error: 'Aucun emprunt actif trouvé pour ce livre et cet utilisateur' });
    }
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
