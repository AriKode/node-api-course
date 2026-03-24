require('dotenv').config();

const requiredEnvVars = [
  'PORT',
  'DATABASE_URL',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'ALLOWED_ORIGINS'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.warn(`Attention : la variable d'environnement ${envVar} est manquante.`);
  }
}

module.exports = {
  PORT: process.env.PORT || 3000,
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS || '*'
};
