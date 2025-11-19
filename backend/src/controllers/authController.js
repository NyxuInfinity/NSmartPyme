// backend/src/controllers/authController.js
const jwt = require("jsonwebtoken");
const Usuario = require("../models/Usuario");
const {
  successResponse,
  errorResponse,
  validationErrorResponse,
  unauthorizedResponse,
} = require("../utils/response.util");

class AuthController {
  /**
   * Login de usuario
   */
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      console.log("🔐 === INICIO DE LOGIN ===");
      console.log("📧 Email recibido:", email);
      console.log("🔑 Contraseña recibida:", password);

      // Buscar usuario por email
      const usuario = await Usuario.findByEmail(email.toLowerCase());

      console.log("👤 Usuario encontrado:", usuario ? "SÍ" : "NO");
      if (usuario) {
        console.log("  - ID:", usuario.id_usuario);
        console.log("  - Nombre:", usuario.nombre, usuario.apellido);
        console.log("  - Email:", usuario.email);
        console.log("  - Activo:", usuario.activo);
        console.log(
          "  - Hash guardado:",
          usuario.password.substring(0, 20) + "..."
        );
      }

      if (!usuario) {
        console.log("❌ Usuario no encontrado");
        return unauthorizedResponse(res, "Credenciales inválidas");
      }

      // Verificar que el usuario esté activo
      if (!usuario.activo) {
        console.log("⚠️ Usuario inactivo");
        return unauthorizedResponse(
          res,
          "Usuario inactivo. Contacta al administrador"
        );
      }

      // Verificar la contraseña
      console.log("🔑 Verificando contraseña...");
      const passwordValida = await Usuario.verifyPassword(
        password,
        usuario.password
      );

      console.log(
        "🔑 Resultado de verificación:",
        passwordValida ? "✅ CORRECTA" : "❌ INCORRECTA"
      );

      if (!passwordValida) {
        console.log("❌ Contraseña incorrecta");
        return unauthorizedResponse(res, "Credenciales inválidas");
      }

      // Actualizar último acceso
      await Usuario.updateLastAccess(usuario.id_usuario);

      // Generar token JWT
      const token = jwt.sign(
        {
          id_usuario: usuario.id_usuario,
          email: usuario.email,
          rol: usuario.rol_nombre,
          nombre: usuario.nombre,
          apellido: usuario.apellido,
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "24h" }
      );

      console.log("✅ === LOGIN EXITOSO ===");
      console.log("🎫 Token generado");

      // Remover la contraseña de la respuesta
      const { password: _, ...usuarioSinPassword } = usuario;

      return successResponse(
        res,
        {
          token,
          usuario: usuarioSinPassword,
        },
        "Inicio de sesión exitoso"
      );
    } catch (error) {
      console.error("❌ === ERROR EN LOGIN ===");
      console.error("Error:", error.message);
      console.error("Stack:", error.stack);
      return errorResponse(res, "Error al iniciar sesión");
    }
  }

  /**
   * Obtener información del usuario autenticado
   */
  static async getProfile(req, res) {
    try {
      const { id_usuario } = req.user;

      // Obtener usuario
      const usuario = await Usuario.findById(id_usuario);

      if (!usuario) {
        return unauthorizedResponse(res, "Usuario no encontrado");
      }

      // Obtener permisos del rol del usuario
      const Permiso = require("../models/Permiso");
      const permisos = await Permiso.findByRol(usuario.id_rol);

      // Remover la contraseña
      const { password, ...usuarioSinPassword } = usuario;

      return successResponse(
        res,
        {
          ...usuarioSinPassword,
          permisos: permisos.map((p) => p.codigo), // Solo los códigos de permisos
        },
        "Perfil obtenido exitosamente"
      );
    } catch (error) {
      console.error("Error al obtener perfil:", error);
      return errorResponse(res, "Error al obtener el perfil");
    }
  }

  /**
   * Actualizar perfil del usuario autenticado
   */
  static async updateProfile(req, res) {
    try {
      const { nombre, apellido, email } = req.body;
      const userId = req.user.id_usuario;

      // Validaciones básicas
      if (!nombre || !apellido || !email) {
        return validationErrorResponse(
          res,
          { message: "Nombre, apellido y email son requeridos" },
          "Datos incompletos"
        );
      }

      // Verificar si el email ya existe (para otro usuario)
      const usuarioConEmail = await Usuario.findByEmail(email);
      if (usuarioConEmail && usuarioConEmail.id_usuario !== userId) {
        return validationErrorResponse(
          res,
          { email: "El email ya está en uso" },
          "Email duplicado"
        );
      }

      // Obtener rol actual del usuario
      const usuarioActual = await Usuario.findById(userId);

      // Actualizar usuario (manteniendo su rol actual)
      const usuarioActualizado = await Usuario.update(userId, {
        id_rol: usuarioActual.id_rol,
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        email: email.trim().toLowerCase(),
      });

      const { password, ...usuarioSinPassword } = usuarioActualizado;

      return successResponse(
        res,
        usuarioSinPassword,
        "Perfil actualizado exitosamente"
      );
    } catch (error) {
      console.error("Error al actualizar perfil:", error);
      return errorResponse(res, "Error al actualizar el perfil");
    }
  }

  /**
   * Cambiar contraseña del usuario autenticado
   */
  static async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.id_usuario;

      // Obtener usuario con contraseña
      const usuario = await Usuario.findByEmail(req.user.email);

      // Verificar contraseña actual
      const passwordValida = await Usuario.verifyPassword(
        currentPassword,
        usuario.password
      );

      if (!passwordValida) {
        return validationErrorResponse(
          res,
          { currentPassword: "La contraseña actual es incorrecta" },
          "Contraseña incorrecta"
        );
      }

      // Actualizar contraseña
      await Usuario.updatePassword(userId, newPassword);

      return successResponse(res, null, "Contraseña actualizada exitosamente");
    } catch (error) {
      console.error("Error al cambiar contraseña:", error);
      return errorResponse(res, "Error al cambiar la contraseña");
    }
  }

  /**
   * Verificar si el token es válido
   */
  static async verifyToken(req, res) {
    try {
      // Si llegamos aquí, el token es válido (verificado por middleware)
      return successResponse(
        res,
        {
          valid: true,
          user: req.user,
        },
        "Token válido"
      );
    } catch (error) {
      console.error("Error al verificar token:", error);
      return errorResponse(res, "Error al verificar el token");
    }
  }

  /**
   * Logout (invalidar token del lado del cliente)
   */
  static async logout(req, res) {
    try {
      // En este caso simple, el logout se maneja en el cliente eliminando el token
      // En implementaciones más avanzadas, podrías mantener una blacklist de tokens
      return successResponse(res, null, "Sesión cerrada exitosamente");
    } catch (error) {
      console.error("Error en logout:", error);
      return errorResponse(res, "Error al cerrar sesión");
    }
  }
}

module.exports = AuthController;
