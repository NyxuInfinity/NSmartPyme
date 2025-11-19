// backend/src/controllers/pedidoController.js
const Pedido = require("../models/Pedido");
const Cliente = require("../models/Cliente");
const Usuario = require("../models/Usuario");
const Producto = require("../models/Producto");
const {
  successResponse,
  errorResponse,
  notFoundResponse,
  validationErrorResponse,
} = require("../utils/response.util");

class PedidoController {
  static async getAll(req, res) {
    try {
      const { estado, cliente, fecha_desde, fecha_hasta } = req.query;

      const filtros = {};
      if (estado) filtros.id_estado = estado;
      if (cliente) filtros.id_cliente = cliente;
      if (fecha_desde) filtros.fecha_desde = fecha_desde;
      if (fecha_hasta) filtros.fecha_hasta = fecha_hasta;

      const pedidos = await Pedido.findAll(filtros);

      return successResponse(res, pedidos, "Pedidos obtenidos exitosamente");
    } catch (error) {
      console.error("Error al obtener pedidos:", error);
      return errorResponse(res, "Error al obtener los pedidos");
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;

      if (isNaN(id)) {
        return validationErrorResponse(res, null, "ID inválido");
      }

      const pedido = await Pedido.findById(id);

      if (!pedido) {
        return notFoundResponse(res, "Pedido no encontrado");
      }

      return successResponse(res, pedido, "Pedido obtenido exitosamente");
    } catch (error) {
      console.error("Error al obtener pedido:", error);
      return errorResponse(res, "Error al obtener el pedido");
    }
  }

  static async getStats(req, res) {
    try {
      const { fecha_desde, fecha_hasta, estado } = req.query;

      const filtros = {};
      if (fecha_desde) filtros.fecha_desde = fecha_desde;
      if (fecha_hasta) filtros.fecha_hasta = fecha_hasta;
      if (estado) filtros.id_estado = estado;

      const stats = await Pedido.getStats(filtros);
      const countByStatus = await Pedido.countByStatus();

      return successResponse(
        res,
        {
          resumen: stats,
          por_estado: countByStatus,
        },
        "Estadísticas obtenidas exitosamente"
      );
    } catch (error) {
      console.error("Error al obtener estadísticas:", error);
      return errorResponse(res, "Error al obtener las estadísticas");
    }
  }

  static async create(req, res) {
    try {
      const {
        id_cliente,
        id_usuario,
        id_estado,
        metodo_pago,
        fecha_entrega,
        direccion_entrega,
        notas,
        productos, // Array de { id_producto, cantidad }
      } = req.body;

      // Validaciones básicas
      const errores = {};

      if (!id_cliente) {
        errores.id_cliente = "El cliente es requerido";
      }

      if (!id_usuario) {
        errores.id_usuario = "El usuario es requerido";
      }

      if (!productos || productos.length === 0) {
        errores.productos = "Debe incluir al menos un producto";
      }

      if (Object.keys(errores).length > 0) {
        return validationErrorResponse(res, errores, "Datos inválidos");
      }

      // Verificar que el cliente existe
      const cliente = await Cliente.findById(id_cliente);
      if (!cliente) {
        return validationErrorResponse(
          res,
          { id_cliente: "El cliente no existe" },
          "Cliente inválido"
        );
      }

      // Verificar que el usuario existe
      const usuario = await Usuario.findById(id_usuario);
      if (!usuario) {
        return validationErrorResponse(
          res,
          { id_usuario: "El usuario no existe" },
          "Usuario inválido"
        );
      }

      // Validar y calcular totales de productos
      let subtotal = 0;
      const productosValidos = [];

      for (const item of productos) {
        if (!item.id_producto || !item.cantidad || item.cantidad <= 0) {
          return validationErrorResponse(
            res,
            { productos: "Datos de productos inválidos" },
            "Productos inválidos"
          );
        }

        // Verificar que el producto existe y tiene stock
        const producto = await Producto.findById(item.id_producto);
        if (!producto) {
          return validationErrorResponse(
            res,
            { productos: `Producto con ID ${item.id_producto} no encontrado` },
            "Producto no encontrado"
          );
        }

        if (producto.stock < item.cantidad) {
          return validationErrorResponse(
            res,
            {
              productos: `Stock insuficiente para ${producto.nombre}. Disponible: ${producto.stock}`,
            },
            "Stock insuficiente"
          );
        }

        const precio_unitario = producto.precio;
        const subtotalProducto = item.cantidad * precio_unitario;
        subtotal += subtotalProducto;

        productosValidos.push({
          id_producto: item.id_producto,
          cantidad: item.cantidad,
          precio_unitario: precio_unitario,
        });
      }

      // Calcular descuento y total
      const descuento = 0; // Puedes implementar lógica de descuentos aquí
      const total = subtotal - descuento;

      // Crear el pedido
      const nuevoPedido = await Pedido.create({
        id_cliente,
        id_usuario,
        id_estado: id_estado || 1, // Por defecto "Pendiente"
        subtotal,
        descuento,
        total,
        metodo_pago: metodo_pago || null,
        fecha_entrega: fecha_entrega || null,
        direccion_entrega: direccion_entrega || null,
        notas: notas || null,
        productos: productosValidos,
      });

      return successResponse(
        res,
        nuevoPedido,
        "Pedido creado exitosamente",
        201
      );
    } catch (error) {
      console.error("Error al crear pedido:", error);
      return errorResponse(res, "Error al crear el pedido");
    }
  }

  static async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { id_estado } = req.body;

      if (isNaN(id)) {
        return validationErrorResponse(res, null, "ID inválido");
      }

      if (!id_estado) {
        return validationErrorResponse(
          res,
          { id_estado: "El estado es requerido" },
          "Datos inválidos"
        );
      }

      // Verificar que el pedido existe
      const pedido = await Pedido.findById(id);
      if (!pedido) {
        return notFoundResponse(res, "Pedido no encontrado");
      }

      const pedidoActualizado = await Pedido.updateStatus(id, id_estado);

      return successResponse(
        res,
        pedidoActualizado,
        "Estado del pedido actualizado exitosamente"
      );
    } catch (error) {
      console.error("Error al actualizar estado del pedido:", error);
      return errorResponse(res, "Error al actualizar el estado del pedido");
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const { metodo_pago, fecha_entrega, direccion_entrega, notas } = req.body;

      if (isNaN(id)) {
        return validationErrorResponse(res, null, "ID inválido");
      }

      // Verificar que el pedido existe
      const pedido = await Pedido.findById(id);
      if (!pedido) {
        return notFoundResponse(res, "Pedido no encontrado");
      }

      const pedidoActualizado = await Pedido.update(id, {
        metodo_pago,
        fecha_entrega,
        direccion_entrega,
        notas,
      });

      return successResponse(
        res,
        pedidoActualizado,
        "Pedido actualizado exitosamente"
      );
    } catch (error) {
      console.error("Error al actualizar pedido:", error);
      return errorResponse(res, "Error al actualizar el pedido");
    }
  }

  static async cancel(req, res) {
    try {
      const { id } = req.params;

      if (isNaN(id)) {
        return validationErrorResponse(res, null, "ID inválido");
      }

      // Verificar que el pedido existe
      const pedido = await Pedido.findById(id);
      if (!pedido) {
        return notFoundResponse(res, "Pedido no encontrado");
      }

      // Verificar que el pedido no esté ya cancelado o entregado
      if (pedido.id_estado === 5) {
        return validationErrorResponse(
          res,
          null,
          "El pedido ya está cancelado"
        );
      }

      if (pedido.id_estado === 4) {
        return validationErrorResponse(
          res,
          null,
          "No se puede cancelar un pedido ya entregado"
        );
      }

      const pedidoCancelado = await Pedido.cancel(id);

      return successResponse(
        res,
        pedidoCancelado,
        "Pedido cancelado exitosamente"
      );
    } catch (error) {
      console.error("Error al cancelar pedido:", error);
      return errorResponse(res, "Error al cancelar el pedido");
    }
  }

  static async updateEstado(req, res) {
    try {
      const { id } = req.params;
      const { id_estado } = req.body;

      if (isNaN(id)) {
        return validationErrorResponse(res, null, "ID inválido");
      }

      if (!id_estado) {
        return validationErrorResponse(
          res,
          { id_estado: "El estado es requerido" },
          "Datos inválidos"
        );
      }

      const pedido = await Pedido.findById(id);
      if (!pedido) {
        return notFoundResponse(res, "Pedido no encontrado");
      }

      // Actualizar solo el estado
      await Pedido.updateEstado(id, id_estado);
      const pedidoActualizado = await Pedido.findById(id);

      return successResponse(
        res,
        pedidoActualizado,
        "Estado del pedido actualizado exitosamente"
      );
    } catch (error) {
      console.error("Error al actualizar estado del pedido:", error);
      return errorResponse(res, "Error al actualizar el estado del pedido");
    }
  }
}

module.exports = PedidoController;
