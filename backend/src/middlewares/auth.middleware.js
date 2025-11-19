// backend/src/middlewares/auth.middleware.js
const jwt = require("jsonwebtoken");
const {
  unauthorizedResponse,
  forbiddenResponse,
} = require("../utils/response.util");

/**
 * Middleware para verificar el token JWT
 */
const verifyToken = (req, res, next) => {
  try {
    // Obtener el token del header
    const authHeader = req.headers["authorization"];

    if (!authHeader) {
      return unauthorizedResponse(
        res,
        "No se proporcionó token de autenticación"
      );
    }

    // El token viene en formato: "Bearer TOKEN"
    const token = authHeader.split(" ")[1];

    if (!token) {
      return unauthorizedResponse(res, "Token inválido");
    }

    // Verificar el token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          return unauthorizedResponse(res, "Token expirado");
        }
        return unauthorizedResponse(res, "Token inválido");
      }

      // Agregar la información del usuario al request
      req.user = {
        id_usuario: decoded.id_usuario,
        email: decoded.email,
        rol: decoded.rol,
        nombre: decoded.nombre,
        apellido: decoded.apellido,
      };

      next();
    });
  } catch (error) {
    console.error("Error en middleware de autenticación:", error);
    return unauthorizedResponse(res, "Error de autenticación");
  }
};

/**
 * Middleware para verificar roles específicos
 */
const verifyRole = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.user) {
      return unauthorizedResponse(res, "Usuario no autenticado");
    }

    if (!rolesPermitidos.includes(req.user.rol)) {
      return forbiddenResponse(
        res,
        `Acceso denegado. Se requiere uno de los siguientes roles: ${rolesPermitidos.join(
          ", "
        )}`
      );
    }

    next();
  };
};

/**
 * Middleware para verificar que el usuario es administrador
 */
const verifyAdmin = (req, res, next) => {
  return verifyRole("Administrador")(req, res, next);
};

/**
 * Middleware para verificar que el usuario puede modificar su propio perfil
 */
const verifyOwnerOrAdmin = (req, res, next) => {
  if (!req.user) {
    return unauthorizedResponse(res, "Usuario no autenticado");
  }

  const { id } = req.params;
  const userId = req.user.id_usuario;
  const userRole = req.user.rol;

  // Permitir si es admin o si está modificando su propio perfil
  if (userRole === "Administrador" || userId == id) {
    return next();
  }

  return forbiddenResponse(res, "No tienes permiso para realizar esta acción");
};

module.exports = {
  verifyToken,
  verifyRole,
  verifyAdmin,
  verifyOwnerOrAdmin,
};
