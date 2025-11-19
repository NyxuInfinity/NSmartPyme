// backend/src/controllers/rolController.js
const Rol = require("../models/Rol");
const Permiso = require("../models/Permiso");
const {
  successResponse,
  errorResponse,
  notFoundResponse,
  validationErrorResponse,
} = require("../utils/response.util");

class RolController {
  /**
   * Obtener todos los roles
   */
  static async getAll(req, res) {
    try {
      const roles = await Rol.findAll();
      return successResponse(res, roles, "Roles obtenidos exitosamente");
    } catch (error) {
      console.error("Error al obtener roles:", error);
      return errorResponse(res, "Error al obtener los roles");
    }
  }

  /**
   * Obtener un rol por ID con sus permisos
   */
  static async getById(req, res) {
    try {
      const { id } = req.params;

      if (isNaN(id)) {
        return validationErrorResponse(res, null, "ID inválido");
      }

      const rol = await Rol.findById(id);

      if (!rol) {
        return notFoundResponse(res, "Rol no encontrado");
      }

      return successResponse(res, rol, "Rol obtenido exitosamente");
    } catch (error) {
      console.error("Error al obtener rol:", error);
      return errorResponse(res, "Error al obtener el rol");
    }
  }

  /**
   * Crear un nuevo rol
   */
  static async create(req, res) {
    try {
      const { nombre, descripcion } = req.body;

      // Validaciones
      const errores = {};

      if (!nombre || nombre.trim() === "") {
        errores.nombre = "El nombre es requerido";
      }

      // Verificar si el nombre ya existe
      if (nombre) {
        const existe = await Rol.existsByName(nombre.trim());
        if (existe) {
          errores.nombre = "Ya existe un rol con ese nombre";
        }
      }

      if (Object.keys(errores).length > 0) {
        return validationErrorResponse(res, errores, "Datos inválidos");
      }

      const nuevoRol = await Rol.create({
        nombre: nombre.trim(),
        descripcion: descripcion?.trim(),
      });

      return successResponse(res, nuevoRol, "Rol creado exitosamente", 201);
    } catch (error) {
      console.error("Error al crear rol:", error);
      return errorResponse(res, "Error al crear el rol");
    }
  }

  /**
   * Actualizar un rol
   */
  static async update(req, res) {
    try {
      const { id } = req.params;
      const { nombre, descripcion } = req.body;

      if (isNaN(id)) {
        return validationErrorResponse(res, null, "ID inválido");
      }

      // Validaciones
      const errores = {};

      if (!nombre || nombre.trim() === "") {
        errores.nombre = "El nombre es requerido";
      }

      // Verificar si el rol existe
      const rolExistente = await Rol.findById(id);
      if (!rolExistente) {
        return notFoundResponse(res, "Rol no encontrado");
      }

      // Verificar si el nombre ya existe en otro rol
      if (nombre) {
        const existe = await Rol.existsByName(nombre.trim(), id);
        if (existe) {
          errores.nombre = "Ya existe otro rol con ese nombre";
        }
      }

      if (Object.keys(errores).length > 0) {
        return validationErrorResponse(res, errores, "Datos inválidos");
      }

      const rolActualizado = await Rol.update(id, {
        nombre: nombre.trim(),
        descripcion: descripcion?.trim(),
      });

      return successResponse(
        res,
        rolActualizado,
        "Rol actualizado exitosamente"
      );
    } catch (error) {
      console.error("Error al actualizar rol:", error);
      return errorResponse(res, "Error al actualizar el rol");
    }
  }

  /**
   * Eliminar un rol
   */
  static async delete(req, res) {
    try {
      const { id } = req.params;

      if (isNaN(id)) {
        return validationErrorResponse(res, null, "ID inválido");
      }

      const rol = await Rol.findById(id);
      if (!rol) {
        return notFoundResponse(res, "Rol no encontrado");
      }

      // Evitar eliminar roles del sistema (Administrador, Gerente, etc.)
      const rolesProtegidos = [1, 2, 3, 4]; // IDs de roles del sistema
      if (rolesProtegidos.includes(parseInt(id))) {
        return validationErrorResponse(
          res,
          null,
          "No se puede eliminar un rol del sistema"
        );
      }

      await Rol.delete(id);
      return successResponse(res, null, "Rol eliminado exitosamente");
    } catch (error) {
      console.error("Error al eliminar rol:", error);
      return errorResponse(res, "Error al eliminar el rol");
    }
  }

  /**
   * Obtener todos los permisos disponibles (para asignar a roles)
   */
  static async getPermisos(req, res) {
    try {
      const permisos = await Permiso.findGroupedByModule();
      return successResponse(res, permisos, "Permisos obtenidos exitosamente");
    } catch (error) {
      console.error("Error al obtener permisos:", error);
      return errorResponse(res, "Error al obtener los permisos");
    }
  }

  /**
   * Asignar permisos a un rol
   */
  static async assignPermisos(req, res) {
    try {
      const { id } = req.params;
      const { permisos } = req.body;

      if (isNaN(id)) {
        return validationErrorResponse(res, null, "ID inválido");
      }

      const rol = await Rol.findById(id);
      if (!rol) {
        return notFoundResponse(res, "Rol no encontrado");
      }

      // Validar que permisos sea un array
      if (!Array.isArray(permisos)) {
        return validationErrorResponse(
          res,
          { permisos: "Los permisos deben ser un array de IDs" },
          "Datos inválidos"
        );
      }

      await Permiso.assignToRole(id, permisos);
      const rolActualizado = await Rol.findById(id);

      return successResponse(
        res,
        rolActualizado,
        "Permisos asignados exitosamente"
      );
    } catch (error) {
      console.error("Error al asignar permisos:", error);
      return errorResponse(res, "Error al asignar permisos");
    }
  }
}

module.exports = RolController;
