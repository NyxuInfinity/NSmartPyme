// backend/src/controllers/categoriaController.js
const Categoria = require("../models/Categoria");
const {
  successResponse,
  errorResponse,
  notFoundResponse,
  validationErrorResponse,
} = require("../utils/response.util");

class CategoriaController {
  /**
   * GET /api/categorias
   * Obtener todas las categorías
   */
  static async getAll(req, res) {
    try {
      const categorias = await Categoria.findAll();

      return successResponse(
        res,
        categorias,
        "Categorías obtenidas exitosamente",
        200
      );
    } catch (error) {
      console.error("Error al obtener categorías:", error);
      return errorResponse(res, "Error al obtener las categorías");
    }
  }

  /**
   * GET /api/categorias/:id
   * Obtener una categoría por ID
   */
  static async getById(req, res) {
    try {
      const { id } = req.params;

      // Validar que el ID sea un número
      if (isNaN(id)) {
        return validationErrorResponse(res, null, "ID inválido");
      }

      const categoria = await Categoria.findById(id);

      if (!categoria) {
        return notFoundResponse(res, "Categoría no encontrada");
      }

      // Obtener la cantidad de productos
      const cantidadProductos = await Categoria.countProducts(id);

      return successResponse(
        res,
        {
          ...categoria,
          cantidad_productos: cantidadProductos,
        },
        "Categoría obtenida exitosamente"
      );
    } catch (error) {
      console.error("Error al obtener categoría:", error);
      return errorResponse(res, "Error al obtener la categoría");
    }
  }

  /**
   * POST /api/categorias
   * Crear una nueva categoría
   */
  static async create(req, res) {
    try {
      const { nombre, descripcion } = req.body;

      // Validaciones
      if (!nombre || nombre.trim() === "") {
        return validationErrorResponse(
          res,
          { nombre: "El nombre es requerido" },
          "Datos inválidos"
        );
      }

      // Verificar si ya existe una categoría con ese nombre
      const categoriaExistente = await Categoria.findByName(nombre);
      if (categoriaExistente) {
        return validationErrorResponse(
          res,
          { nombre: "Ya existe una categoría con ese nombre" },
          "Categoría duplicada"
        );
      }

      // Crear la categoría
      const nuevaCategoria = await Categoria.create({
        nombre: nombre.trim(),
        descripcion: descripcion?.trim(),
      });

      return successResponse(
        res,
        nuevaCategoria,
        "Categoría creada exitosamente",
        201
      );
    } catch (error) {
      console.error("Error al crear categoría:", error);
      return errorResponse(res, "Error al crear la categoría");
    }
  }

  /**
   * PUT /api/categorias/:id
   * Actualizar una categoría
   */
  static async update(req, res) {
    try {
      const { id } = req.params;
      const { nombre, descripcion } = req.body;

      // Validar ID
      if (isNaN(id)) {
        return validationErrorResponse(res, null, "ID inválido");
      }

      // Validar nombre
      if (!nombre || nombre.trim() === "") {
        return validationErrorResponse(
          res,
          { nombre: "El nombre es requerido" },
          "Datos inválidos"
        );
      }

      // Verificar que la categoría existe
      const categoriaExistente = await Categoria.findById(id);
      if (!categoriaExistente) {
        return notFoundResponse(res, "Categoría no encontrada");
      }

      // Verificar que no exista otra categoría con el mismo nombre
      const categoriaConMismoNombre = await Categoria.findByName(nombre);
      if (
        categoriaConMismoNombre &&
        categoriaConMismoNombre.id_categoria != id
      ) {
        return validationErrorResponse(
          res,
          { nombre: "Ya existe otra categoría con ese nombre" },
          "Categoría duplicada"
        );
      }

      // Actualizar la categoría
      const categoriaActualizada = await Categoria.update(id, {
        nombre: nombre.trim(),
        descripcion: descripcion?.trim(),
      });

      return successResponse(
        res,
        categoriaActualizada,
        "Categoría actualizada exitosamente"
      );
    } catch (error) {
      console.error("Error al actualizar categoría:", error);
      return errorResponse(res, "Error al actualizar la categoría");
    }
  }

  /**
   * DELETE /api/categorias/:id
   * Eliminar una categoría (soft delete)
   */
  static async delete(req, res) {
    try {
      const { id } = req.params;

      // Validar ID
      if (isNaN(id)) {
        return validationErrorResponse(res, null, "ID inválido");
      }

      // Verificar que la categoría existe
      const categoria = await Categoria.findById(id);
      if (!categoria) {
        return notFoundResponse(res, "Categoría no encontrada");
      }

      // Verificar si tiene productos asociados
      const tieneProductos = await Categoria.hasProducts(id);
      if (tieneProductos) {
        return validationErrorResponse(
          res,
          null,
          "No se puede eliminar la categoría porque tiene productos asociados"
        );
      }

      // Eliminar la categoría (soft delete)
      await Categoria.delete(id);

      return successResponse(res, null, "Categoría eliminada exitosamente");
    } catch (error) {
      console.error("Error al eliminar categoría:", error);
      return errorResponse(res, "Error al eliminar la categoría");
    }
  }
}

module.exports = CategoriaController;
