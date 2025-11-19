// backend/src/controllers/productoController.js
const Producto = require("../models/Producto");
const Categoria = require("../models/Categoria");
const {
  successResponse,
  errorResponse,
  notFoundResponse,
  validationErrorResponse,
} = require("../utils/response.util");

class ProductoController {
  static async getAll(req, res) {
    try {
      const { categoria, buscar } = req.query;

      let productos;

      if (categoria) {
        productos = await Producto.findByCategory(categoria);
      } else if (buscar) {
        productos = await Producto.searchByName(buscar);
      } else {
        productos = await Producto.findAll();
      }

      return successResponse(
        res,
        productos,
        "Productos obtenidos exitosamente"
      );
    } catch (error) {
      console.error("Error al obtener productos:", error);
      return errorResponse(res, "Error al obtener los productos");
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;

      if (isNaN(id)) {
        return validationErrorResponse(res, null, "ID inválido");
      }

      const producto = await Producto.findById(id);

      if (!producto) {
        return notFoundResponse(res, "Producto no encontrado");
      }

      return successResponse(res, producto, "Producto obtenido exitosamente");
    } catch (error) {
      console.error("Error al obtener producto:", error);
      return errorResponse(res, "Error al obtener el producto");
    }
  }

  static async getLowStock(req, res) {
    try {
      const productos = await Producto.findLowStock();
      return successResponse(
        res,
        productos,
        "Productos con stock bajo obtenidos exitosamente"
      );
    } catch (error) {
      console.error("Error al obtener productos con stock bajo:", error);
      return errorResponse(res, "Error al obtener productos con stock bajo");
    }
  }

  static async create(req, res) {
    try {
      const {
        id_categoria,
        nombre,
        descripcion,
        precio,
        stock,
        stock_minimo,
        imagen_url,
      } = req.body;

      // Validaciones
      const errores = {};

      if (!nombre || nombre.trim() === "") {
        errores.nombre = "El nombre es requerido";
      }

      if (!id_categoria) {
        errores.id_categoria = "La categoría es requerida";
      }

      if (!precio || precio <= 0) {
        errores.precio = "El precio debe ser mayor a 0";
      }

      if (Object.keys(errores).length > 0) {
        return validationErrorResponse(res, errores, "Datos inválidos");
      }

      // Verificar que la categoría existe
      const categoria = await Categoria.findById(id_categoria);
      if (!categoria) {
        return validationErrorResponse(
          res,
          { id_categoria: "La categoría no existe" },
          "Categoría inválida"
        );
      }

      const nuevoProducto = await Producto.create({
        id_categoria,
        nombre: nombre.trim(),
        descripcion: descripcion?.trim(),
        precio: parseFloat(precio),
        stock: parseInt(stock) || 0,
        stock_minimo: parseInt(stock_minimo) || 5,
        imagen_url: imagen_url?.trim(),
      });

      return successResponse(
        res,
        nuevoProducto,
        "Producto creado exitosamente",
        201
      );
    } catch (error) {
      console.error("Error al crear producto:", error);
      return errorResponse(res, "Error al crear el producto");
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const {
        id_categoria,
        nombre,
        descripcion,
        precio,
        stock,
        stock_minimo,
        imagen_url,
      } = req.body;

      if (isNaN(id)) {
        return validationErrorResponse(res, null, "ID inválido");
      }

      // Validaciones
      const errores = {};

      if (!nombre || nombre.trim() === "") {
        errores.nombre = "El nombre es requerido";
      }

      if (!id_categoria) {
        errores.id_categoria = "La categoría es requerida";
      }

      if (!precio || precio <= 0) {
        errores.precio = "El precio debe ser mayor a 0";
      }

      if (Object.keys(errores).length > 0) {
        return validationErrorResponse(res, errores, "Datos inválidos");
      }

      // Verificar que el producto existe
      const productoExistente = await Producto.findById(id);
      if (!productoExistente) {
        return notFoundResponse(res, "Producto no encontrado");
      }

      // Verificar que la categoría existe
      const categoria = await Categoria.findById(id_categoria);
      if (!categoria) {
        return validationErrorResponse(
          res,
          { id_categoria: "La categoría no existe" },
          "Categoría inválida"
        );
      }

      const productoActualizado = await Producto.update(id, {
        id_categoria,
        nombre: nombre.trim(),
        descripcion: descripcion?.trim(),
        precio: parseFloat(precio),
        stock: parseInt(stock),
        stock_minimo: parseInt(stock_minimo),
        imagen_url: imagen_url?.trim(),
      });

      return successResponse(
        res,
        productoActualizado,
        "Producto actualizado exitosamente"
      );
    } catch (error) {
      console.error("Error al actualizar producto:", error);
      return errorResponse(res, "Error al actualizar el producto");
    }
  }

  static async updateStock(req, res) {
    try {
      const { id } = req.params;
      const { stock } = req.body;

      if (isNaN(id)) {
        return validationErrorResponse(res, null, "ID inválido");
      }

      if (stock === undefined || stock < 0) {
        return validationErrorResponse(
          res,
          { stock: "El stock debe ser un número válido mayor o igual a 0" },
          "Datos inválidos"
        );
      }

      const producto = await Producto.findById(id);
      if (!producto) {
        return notFoundResponse(res, "Producto no encontrado");
      }

      await Producto.updateStock(id, parseInt(stock));
      const productoActualizado = await Producto.findById(id);

      return successResponse(
        res,
        productoActualizado,
        "Stock actualizado exitosamente"
      );
    } catch (error) {
      console.error("Error al actualizar stock:", error);
      return errorResponse(res, "Error al actualizar el stock");
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;

      if (isNaN(id)) {
        return validationErrorResponse(res, null, "ID inválido");
      }

      const producto = await Producto.findById(id);
      if (!producto) {
        return notFoundResponse(res, "Producto no encontrado");
      }

      await Producto.delete(id);
      return successResponse(res, null, "Producto eliminado exitosamente");
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      return errorResponse(res, "Error al eliminar el producto");
    }
  }
}

module.exports = ProductoController;
