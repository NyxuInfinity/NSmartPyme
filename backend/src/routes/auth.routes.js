// backend/src/routes/auth.routes.js
const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/authController");
const { verifyToken } = require("../middlewares/auth.middleware");
const { loginLimiter } = require("../middlewares/rateLimiter");
const {
  loginValidators,
  passwordChangeValidators,
  handleValidationErrors,
} = require("../middlewares/validator");

/**
 * @route   POST /api/auth/login
 * @desc    Login de usuario
 * @access  Public
 */
router.post(
  "/login",
  loginLimiter,
  loginValidators,
  handleValidationErrors,
  AuthController.login
);

/**
 * @route   GET /api/auth/profile
 * @desc    Obtener perfil del usuario autenticado
 * @access  Private
 */
router.get("/profile", verifyToken, AuthController.getProfile);

/**
 * @route   PUT /api/auth/profile
 * @desc    Actualizar perfil del usuario autenticado
 * @access  Private
 */
router.put("/profile", verifyToken, AuthController.updateProfile);

/**
 * @route   POST /api/auth/change-password
 * @desc    Cambiar contraseña del usuario autenticado
 * @access  Private
 */
router.post(
  "/change-password",
  verifyToken,
  passwordChangeValidators,
  handleValidationErrors,
  AuthController.changePassword
);

/**
 * @route   GET /api/auth/verify
 * @desc    Verificar si el token es válido
 * @access  Private
 */
router.get("/verify", verifyToken, AuthController.verifyToken);

/**
 * @route   POST /api/auth/logout
 * @desc    Cerrar sesión
 * @access  Private
 */
router.post("/logout", verifyToken, AuthController.logout);

module.exports = router;
