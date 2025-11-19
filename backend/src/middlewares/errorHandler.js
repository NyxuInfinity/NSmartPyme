// backend/src/middlewares/errorHandler.js

const errorHandler = (err, req, res, next) => {
  console.error("❌ Error:", err);

  // Error de MySQL
  if (err.code && err.code.startsWith("ER_")) {
    return res.status(500).json({
      success: false,
      message: "Error en la base de datos",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }

  // Error de validación
  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: "Error de validación",
      errors: err.errors,
    });
  }

  // Error de JWT
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Token inválido",
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Token expirado",
    });
  }

  // Error genérico
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Error interno del servidor",
    error: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};

module.exports = errorHandler;
