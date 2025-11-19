// backend/src/controllers/usuarioController.js
const Usuario = require("../models/Usuario");
const Rol = require("../models/Rol");
const {
  successResponse,
  errorResponse,
  notFoundResponse,
  validationErrorResponse,
} = require("../utils/response.util");

class UsuarioController {
  static async getAll(req, res) {
    try {
      const { rol } = req.query;

      let usuarios;
      if (rol) {
        usuarios = await Usuario.findByRole(rol);
      } else {
        usuarios = await Usuario.findAll();
      }

      // Remover el password de la respuesta
      usuarios = usuarios.map(({ password, ...usuario }) => usuario);

      return successResponse(res, usuarios, "Usuarios obtenidos exitosamente");
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
      return errorResponse(res, "Error al obtener los usuarios");
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;

      if (isNaN(id)) {
        return validationErrorResponse(res, null, "ID inválido");
      }

      const usuario = await Usuario.findById(id);

      if (!usuario) {
        return notFoundResponse(res, "Usuario no encontrado");
      }

      // Remover el password
      const { password, ...usuarioSinPassword } = usuario;

      return successResponse(
        res,
        usuarioSinPassword,
        "Usuario obtenido exitosamente"
      );
    } catch (error) {
      console.error("Error al obtener usuario:", error);
      return errorResponse(res, "Error al obtener el usuario");
    }
  }

  static async create(req, res) {
    try {
      const { id_rol, nombre, apellido, email, password } = req.body;

      // Validaciones
      const errores = {};

      if (!nombre || nombre.trim() === "") {
        errores.nombre = "El nombre es requerido";
      }

      if (!apellido || apellido.trim() === "") {
        errores.apellido = "El apellido es requerido";
      }

      if (!email || email.trim() === "") {
        errores.email = "El email es requerido";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errores.email = "El email no es válido";
      }

      if (!password || password.length < 6) {
        errores.password = "La contraseña debe tener al menos 6 caracteres";
      }

      if (!id_rol) {
        errores.id_rol = "El rol es requerido";
      }

      if (Object.keys(errores).length > 0) {
        return validationErrorResponse(res, errores, "Datos inválidos");
      }

      // Verificar que el rol existe
      const rol = await Rol.findById(id_rol);
      if (!rol) {
        return validationErrorResponse(
          res,
          { id_rol: "El rol no existe" },
          "Rol inválido"
        );
      }

      // Verificar que no exista un usuario con el mismo email
      const usuarioExistente = await Usuario.findByEmail(email);
      if (usuarioExistente) {
        return validationErrorResponse(
          res,
          { email: "Ya existe un usuario con ese email" },
          "Email duplicado"
        );
      }

      const nuevoUsuario = await Usuario.create({
        id_rol,
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        email: email.trim().toLowerCase(),
        password,
      });

      // Remover el password de la respuesta
      const { password: _, ...usuarioSinPassword } = nuevoUsuario;

      return successResponse(
        res,
        usuarioSinPassword,
        "Usuario creado exitosamente",
        201
      );
    } catch (error) {
      console.error("Error al crear usuario:", error);
      return errorResponse(res, "Error al crear el usuario");
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const { id_rol, nombre, apellido, email } = req.body;

      if (isNaN(id)) {
        return validationErrorResponse(res, null, "ID inválido");
      }

      // Validaciones
      const errores = {};

      if (!nombre || nombre.trim() === "") {
        errores.nombre = "El nombre es requerido";
      }

      if (!apellido || apellido.trim() === "") {
        errores.apellido = "El apellido es requerido";
      }

      if (!email || email.trim() === "") {
        errores.email = "El email es requerido";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errores.email = "El email no es válido";
      }

      if (!id_rol) {
        errores.id_rol = "El rol es requerido";
      }

      if (Object.keys(errores).length > 0) {
        return validationErrorResponse(res, errores, "Datos inválidos");
      }

      // Verificar que el usuario existe
      const usuarioExistente = await Usuario.findById(id);
      if (!usuarioExistente) {
        return notFoundResponse(res, "Usuario no encontrado");
      }

      // Verificar que el rol existe
      const rol = await Rol.findById(id_rol);
      if (!rol) {
        return validationErrorResponse(
          res,
          { id_rol: "El rol no existe" },
          "Rol inválido"
        );
      }

      // Verificar que no exista otro usuario con el mismo email
      const usuarioConMismoEmail = await Usuario.findByEmail(email);
      if (usuarioConMismoEmail && usuarioConMismoEmail.id_usuario != id) {
        return validationErrorResponse(
          res,
          { email: "Ya existe otro usuario con ese email" },
          "Email duplicado"
        );
      }

      const usuarioActualizado = await Usuario.update(id, {
        id_rol,
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        email: email.trim().toLowerCase(),
      });

      // Remover el password
      const { password, ...usuarioSinPassword } = usuarioActualizado;

      return successResponse(
        res,
        usuarioSinPassword,
        "Usuario actualizado exitosamente"
      );
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
      return errorResponse(res, "Error al actualizar el usuario");
    }
  }

  static async updatePassword(req, res) {
    try {
      const { id } = req.params;
      const { password, newPassword } = req.body;

      if (isNaN(id)) {
        return validationErrorResponse(res, null, "ID inválido");
      }

      if (!newPassword || newPassword.length < 6) {
        return validationErrorResponse(
          res,
          {
            newPassword: "La nueva contraseña debe tener al menos 6 caracteres",
          },
          "Contraseña inválida"
        );
      }

      const usuario = await Usuario.findByEmail(
        (
          await Usuario.findById(id)
        ).email
      );

      if (!usuario) {
        return notFoundResponse(res, "Usuario no encontrado");
      }

      // Verificar contraseña actual (opcional - puedes comentar esto si no lo necesitas)
      if (password) {
        const passwordValida = await Usuario.verifyPassword(
          password,
          usuario.password
        );
        if (!passwordValida) {
          return validationErrorResponse(
            res,
            { password: "La contraseña actual es incorrecta" },
            "Contraseña incorrecta"
          );
        }
      }

      await Usuario.updatePassword(id, newPassword);

      return successResponse(res, null, "Contraseña actualizada exitosamente");
    } catch (error) {
      console.error("Error al actualizar contraseña:", error);
      return errorResponse(res, "Error al actualizar la contraseña");
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;

      if (isNaN(id)) {
        return validationErrorResponse(res, null, "ID inválido");
      }

      const usuario = await Usuario.findById(id);
      if (!usuario) {
        return notFoundResponse(res, "Usuario no encontrado");
      }

      await Usuario.delete(id);
      return successResponse(res, null, "Usuario eliminado exitosamente");
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
      return errorResponse(res, "Error al eliminar el usuario");
    }
  }
}

module.exports = UsuarioController;
