// backend/src/controllers/rolController.js
const Rol = require("../models/Rol");
const {
  successResponse,
  errorResponse,
  notFoundResponse,
  validationErrorResponse,
} = require("../utils/response.util");

class RolController {
  static async getAll(req, res) {
    try {
      const roles = await Rol.findAll();
      return successResponse(res, roles, "Roles obtenidos exitosamente");
    } catch (error) {
      console.error("Error al obtener roles:", error);
      return errorResponse(res, "Error al obtener los roles");
    }
  }

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

      const cantidadUsuarios = await Rol.countUsers(id);

      return successResponse(
        res,
        {
          ...rol,
          cantidad_usuarios: cantidadUsuarios,
        },
        "Rol obtenido exitosamente"
      );
    } catch (error) {
      console.error("Error al obtener rol:", error);
      return errorResponse(res, "Error al obtener el rol");
    }
  }

  static async create(req, res) {
    try {
      const { nombre, descripcion } = req.body;

      if (!nombre || nombre.trim() === "") {
        return validationErrorResponse(
          res,
          { nombre: "El nombre es requerido" },
          "Datos inválidos"
        );
      }

      const rolExistente = await Rol.findByName(nombre);
      if (rolExistente) {
        return validationErrorResponse(
          res,
          { nombre: "Ya existe un rol con ese nombre" },
          "Rol duplicado"
        );
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

  static async update(req, res) {
    try {
      const { id } = req.params;
      const { nombre, descripcion } = req.body;

      if (isNaN(id)) {
        return validationErrorResponse(res, null, "ID inválido");
      }

      if (!nombre || nombre.trim() === "") {
        return validationErrorResponse(
          res,
          { nombre: "El nombre es requerido" },
          "Datos inválidos"
        );
      }

      const rolExistente = await Rol.findById(id);
      if (!rolExistente) {
        return notFoundResponse(res, "Rol no encontrado");
      }

      const rolConMismoNombre = await Rol.findByName(nombre);
      if (rolConMismoNombre && rolConMismoNombre.id_rol != id) {
        return validationErrorResponse(
          res,
          { nombre: "Ya existe otro rol con ese nombre" },
          "Rol duplicado"
        );
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

      const tieneUsuarios = await Rol.hasUsers(id);
      if (tieneUsuarios) {
        return validationErrorResponse(
          res,
          null,
          "No se puede eliminar el rol porque tiene usuarios asociados"
        );
      }

      await Rol.delete(id);
      return successResponse(res, null, "Rol eliminado exitosamente");
    } catch (error) {
      console.error("Error al eliminar rol:", error);
      return errorResponse(res, "Error al eliminar el rol");
    }
  }
}

module.exports = RolController;
