const authService = require('../services/authService');

const register = async (req, res, next) => {
  try {
    const user = await authService.register(req.body);
    res.status(201).json({ user });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { user, accessToken, refreshToken } = await authService.login(email, password);

    // Set HTTP Only cookie for refresh token
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 jours
    };

    res.cookie('refreshToken', refreshToken, cookieOptions);

    res.status(200).json({ user, token: accessToken });
  } catch (err) {
    next(err);
  }
};

const refresh = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    const newAccessToken = await authService.refresh(token);

    res.status(200).json({ token: newAccessToken });
  } catch (err) {
    next(err);
  }
};

const logout = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    await authService.logout(token);

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

const me = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user.id);
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  refresh,
  logout,
  me
};
