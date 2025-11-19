// backend/src/controllers/clienteController.js
const Cliente = require("../models/Cliente");
const {
  successResponse,
  errorResponse,
  notFoundResponse,
  validationErrorResponse,
} = require("../utils/response.util");

class ClienteController {
  static async getAll(req, res) {
    try {
      const { buscar } = req.query;

      let clientes;
      if (buscar) {
        clientes = await Cliente.searchByName(buscar);
      } else {
        clientes = await Cliente.findAll();
      }

      return successResponse(res, clientes, "Clientes obtenidos exitosamente");
    } catch (error) {
      console.error("Error al obtener clientes:", error);
      return errorResponse(res, "Error al obtener los clientes");
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;

      if (isNaN(id)) {
        return validationErrorResponse(res, null, "ID inválido");
      }

      const cliente = await Cliente.findById(id);

      if (!cliente) {
        return notFoundResponse(res, "Cliente no encontrado");
      }

      // Obtener cantidad de pedidos
      const cantidadPedidos = await Cliente.countPedidos(id);

      return successResponse(
        res,
        {
          ...cliente,
          cantidad_pedidos: cantidadPedidos,
        },
        "Cliente obtenido exitosamente"
      );
    } catch (error) {
      console.error("Error al obtener cliente:", error);
      return errorResponse(res, "Error al obtener el cliente");
    }
  }

  static async getPedidos(req, res) {
    try {
      const { id } = req.params;

      if (isNaN(id)) {
        return validationErrorResponse(res, null, "ID inválido");
      }

      const cliente = await Cliente.findById(id);
      if (!cliente) {
        return notFoundResponse(res, "Cliente no encontrado");
      }

      const pedidos = await Cliente.getPedidos(id);

      return successResponse(
        res,
        pedidos,
        "Pedidos del cliente obtenidos exitosamente"
      );
    } catch (error) {
      console.error("Error al obtener pedidos del cliente:", error);
      return errorResponse(res, "Error al obtener los pedidos del cliente");
    }
  }

  static async create(req, res) {
    try {
      const { nombre, apellido, email, telefono, direccion } = req.body;

      // Validaciones
      const errores = {};

      if (!nombre || nombre.trim() === "") {
        errores.nombre = "El nombre es requerido";
      }

      if (!apellido || apellido.trim() === "") {
        errores.apellido = "El apellido es requerido";
      }

      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errores.email = "El email no es válido";
      }

      if (!telefono || telefono.trim() === "") {
        errores.telefono = "El teléfono es requerido";
      }

      if (Object.keys(errores).length > 0) {
        return validationErrorResponse(res, errores, "Datos inválidos");
      }

      // Verificar email duplicado (si se proporciona)
      if (email) {
        const clienteConEmail = await Cliente.findByEmail(email);
        if (clienteConEmail) {
          return validationErrorResponse(
            res,
            { email: "Ya existe un cliente con ese email" },
            "Email duplicado"
          );
        }
      }

      // Verificar teléfono duplicado
      const clienteConTelefono = await Cliente.findByPhone(telefono);
      if (clienteConTelefono) {
        return validationErrorResponse(
          res,
          { telefono: "Ya existe un cliente con ese teléfono" },
          "Teléfono duplicado"
        );
      }

      const nuevoCliente = await Cliente.create({
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        email: email?.trim().toLowerCase(),
        telefono: telefono.trim(),
        direccion: direccion?.trim(),
      });

      return successResponse(
        res,
        nuevoCliente,
        "Cliente creado exitosamente",
        201
      );
    } catch (error) {
      console.error("Error al crear cliente:", error);
      return errorResponse(res, "Error al crear el cliente");
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const { nombre, apellido, email, telefono, direccion } = req.body;

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

      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errores.email = "El email no es válido";
      }

      if (!telefono || telefono.trim() === "") {
        errores.telefono = "El teléfono es requerido";
      }

      if (Object.keys(errores).length > 0) {
        return validationErrorResponse(res, errores, "Datos inválidos");
      }

      // Verificar que el cliente existe
      const clienteExistente = await Cliente.findById(id);
      if (!clienteExistente) {
        return notFoundResponse(res, "Cliente no encontrado");
      }

      // Verificar email duplicado (si se proporciona y es diferente)
      if (email && email !== clienteExistente.email) {
        const clienteConEmail = await Cliente.findByEmail(email);
        if (clienteConEmail && clienteConEmail.id_cliente != id) {
          return validationErrorResponse(
            res,
            { email: "Ya existe otro cliente con ese email" },
            "Email duplicado"
          );
        }
      }

      // Verificar teléfono duplicado (si es diferente)
      if (telefono !== clienteExistente.telefono) {
        const clienteConTelefono = await Cliente.findByPhone(telefono);
        if (clienteConTelefono && clienteConTelefono.id_cliente != id) {
          return validationErrorResponse(
            res,
            { telefono: "Ya existe otro cliente con ese teléfono" },
            "Teléfono duplicado"
          );
        }
      }

      const clienteActualizado = await Cliente.update(id, {
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        email: email?.trim().toLowerCase(),
        telefono: telefono.trim(),
        direccion: direccion?.trim(),
      });

      return successResponse(
        res,
        clienteActualizado,
        "Cliente actualizado exitosamente"
      );
    } catch (error) {
      console.error("Error al actualizar cliente:", error);
      return errorResponse(res, "Error al actualizar el cliente");
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;

      if (isNaN(id)) {
        return validationErrorResponse(res, null, "ID inválido");
      }

      const cliente = await Cliente.findById(id);
      if (!cliente) {
        return notFoundResponse(res, "Cliente no encontrado");
      }

      await Cliente.delete(id);
      return successResponse(res, null, "Cliente eliminado exitosamente");
    } catch (error) {
      console.error("Error al eliminar cliente:", error);
      return errorResponse(res, "Error al eliminar el cliente");
    }
  }
}

module.exports = ClienteController;
