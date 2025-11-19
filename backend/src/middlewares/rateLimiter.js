// backend/src/middlewares/rateLimiter.js
const rateLimit = require("express-rate-limit");

/**
 * Limitador general para todas las peticiones
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Máximo 100 peticiones por ventana
  message: {
    success: false,
    message: "Demasiadas peticiones desde esta IP, por favor intenta más tarde",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Limitador estricto para login (previene fuerza bruta)
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // Máximo 5 intentos de login por ventana
  skipSuccessfulRequests: true, // No contar intentos exitosos
  message: {
    success: false,
    message:
      "Demasiados intentos de inicio de sesión. Por favor intenta en 15 minutos",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Limitador para registro de usuarios
 */
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // Máximo 3 registros por hora
  message: {
    success: false,
    message: "Demasiados registros desde esta IP, por favor intenta más tarde",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Limitador para operaciones de creación
 */
const createLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 20, // Máximo 20 creaciones por ventana
  message: {
    success: false,
    message:
      "Demasiadas operaciones de creación, por favor espera unos minutos",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  generalLimiter,
  loginLimiter,
  registerLimiter,
  createLimiter,
};
