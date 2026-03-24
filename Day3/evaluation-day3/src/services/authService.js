const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../db/prisma');

class AuthService {
  async register(data) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      const error = new Error('Email déjà utilisé');
      error.statusCode = 409;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        nom: data.nom,
        email: data.email,
        password: hashedPassword
      }
    });

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async login(email, password) {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      const error = new Error('Email ou mot de passe incorrect');
      error.statusCode = 401;
      throw error;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      const error = new Error('Email ou mot de passe incorrect');
      error.statusCode = 401;
      throw error;
    }

    // Access token court (15 min)
    const accessToken = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    // Refresh token long (7 jours)
    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Sauvegarder en base de données
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt
      }
    });

    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken
    };
  }

  async refresh(token) {
    try {
      if (!token) {
        throw new Error('Refresh token manquant');
      }

      jwt.verify(token, process.env.JWT_REFRESH_SECRET);

      const savedToken = await prisma.refreshToken.findUnique({
        where: { token },
        include: { user: true }
      });

      if (!savedToken) {
        throw new Error('Refresh token invalide ou révoqué');
      }

      if (savedToken.expiresAt < new Date()) {
        throw new Error('Refresh token expiré');
      }

      // Generate new access token
      const newAccessToken = jwt.sign(
        { id: savedToken.user.id, role: savedToken.user.role },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
      );

      return newAccessToken;
    } catch (err) {
      const error = new Error(err.message || 'Token invalide');
      error.statusCode = 401;
      throw error;
    }
  }

  async logout(token) {
    if (token) {
      await prisma.refreshToken.deleteMany({
        where: { token }
      });
    }
  }

  async getMe(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      const error = new Error('Utilisateur non trouvé');
      error.statusCode = 404;
      throw error;
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

module.exports = new AuthService();
