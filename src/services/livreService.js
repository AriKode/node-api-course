const prisma = require('../db/prisma');

class LivreService {
  async getAllLivres() {
    return await prisma.livre.findMany();
  }

  async getLivreById(id) {
    const livre = await prisma.livre.findUnique({
      where: { id: parseInt(id) }
    });

    if (!livre) {
      const error = new Error('Livre non trouvé');
      error.statusCode = 404;
      throw error;
    }

    return livre;
  }

  async createLivre(data) {
    const { titre, auteur, annee, genre } = data;
    return await prisma.livre.create({
      data: { titre, auteur, annee, genre }
    });
  }

  async updateLivre(id, updateData) {
    const { titre, auteur, annee, genre, disponible } = updateData;
    return await prisma.livre.update({
      where: { id: parseInt(id) },
      data: { titre, auteur, annee, genre, disponible }
    });
  }

  async deleteLivre(id) {
    await prisma.livre.delete({
      where: { id: parseInt(id) }
    });
  }

  async emprunterLivre(id, userId) {
    return await prisma.$transaction(async (tx) => {
      const livre = await tx.livre.findUnique({
        where: { id: parseInt(id) }
      });

      if (!livre) {
        const error = new Error('Livre non trouvé');
        error.statusCode = 404;
        throw error;
      }

      if (!livre.disponible) {
        const error = new Error('Livre non disponible');
        error.statusCode = 409;
        throw error;
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
  }

  async retournerLivre(id, userId) {
    return await prisma.$transaction(async (tx) => {
      const livre = await tx.livre.findUnique({
        where: { id: parseInt(id) }
      });

      if (!livre) {
        const error = new Error('Livre non trouvé');
        error.statusCode = 404;
        throw error;
      }

      if (livre.disponible) {
        const error = new Error('Livre déjà retourné');
        error.statusCode = 400;
        throw error;
      }

      const emprunt = await tx.emprunt.findFirst({
        where: { livreId: parseInt(id), userId, dateRetour: null },
        orderBy: { dateEmprunt: 'desc' }
      });

      if (!emprunt) {
        const error = new Error('Aucun emprunt actif trouvé pour ce livre et cet utilisateur');
        error.statusCode = 404;
        throw error;
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
  }
}

module.exports = new LivreService();
