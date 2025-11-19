// backend/src/models/Pedido.js
const { pool } = require("../config/database");

class Pedido {
  /**
   * Obtener todos los pedidos con información completa
   */
  static async findAll(filtros = {}) {
    try {
      let query = `
                SELECT 
                    p.id_pedido,
                    p.numero_pedido,
                    p.id_cliente,
                    p.id_usuario,
                    p.id_estado,
                    p.subtotal,
                    p.descuento,
                    p.total,
                    p.metodo_pago,
                    p.fecha_pedido,
                    p.fecha_entrega,
                    p.direccion_entrega,
                    p.notas,
                    c.nombre as cliente_nombre,
                    c.apellido as cliente_apellido,
                    c.telefono as cliente_telefono,
                    u.nombre as usuario_nombre,
                    u.apellido as usuario_apellido,
                    e.nombre as estado_nombre
                FROM pedidos p
                INNER JOIN clientes c ON p.id_cliente = c.id_cliente
                INNER JOIN usuarios u ON p.id_usuario = u.id_usuario
                INNER JOIN estados_pedido e ON p.id_estado = e.id_estado
                WHERE 1=1
            `;

      const params = [];

      // Filtros opcionales
      if (filtros.id_estado) {
        query += " AND p.id_estado = ?";
        params.push(filtros.id_estado);
      }

      if (filtros.id_cliente) {
        query += " AND p.id_cliente = ?";
        params.push(filtros.id_cliente);
      }

      if (filtros.fecha_desde) {
        query += " AND DATE(p.fecha_pedido) >= ?";
        params.push(filtros.fecha_desde);
      }

      if (filtros.fecha_hasta) {
        query += " AND DATE(p.fecha_pedido) <= ?";
        params.push(filtros.fecha_hasta);
      }

      query += " ORDER BY p.fecha_pedido DESC";

      const [rows] = await pool.query(query, params);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener un pedido por ID con todos sus detalles
   */
  static async findById(id) {
    try {
      const [pedidos] = await pool.query(
        `SELECT 
                    p.id_pedido,
                    p.numero_pedido,
                    p.id_cliente,
                    p.id_usuario,
                    p.id_estado,
                    p.subtotal,
                    p.descuento,
                    p.total,
                    p.metodo_pago,
                    p.fecha_pedido,
                    p.fecha_entrega,
                    p.direccion_entrega,
                    p.notas,
                    c.nombre as cliente_nombre,
                    c.apellido as cliente_apellido,
                    c.email as cliente_email,
                    c.telefono as cliente_telefono,
                    u.nombre as usuario_nombre,
                    u.apellido as usuario_apellido,
                    e.nombre as estado_nombre
                FROM pedidos p
                INNER JOIN clientes c ON p.id_cliente = c.id_cliente
                INNER JOIN usuarios u ON p.id_usuario = u.id_usuario
                INNER JOIN estados_pedido e ON p.id_estado = e.id_estado
                WHERE p.id_pedido = ?`,
        [id]
      );

      if (pedidos.length === 0) {
        return null;
      }

      const pedido = pedidos[0];

      // Obtener los detalles (productos) del pedido
      const [detalles] = await pool.query(
        `SELECT 
                    d.id_detalle,
                    d.id_producto,
                    d.cantidad,
                    d.precio_unitario,
                    d.subtotal,
                    pr.nombre as producto_nombre,
                    pr.descripcion as producto_descripcion
                FROM detalle_pedido d
                INNER JOIN productos pr ON d.id_producto = pr.id_producto
                WHERE d.id_pedido = ?`,
        [id]
      );

      pedido.detalles = detalles;

      return pedido;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Generar número de pedido único
   */
  static async generateOrderNumber() {
    try {
      const fecha = new Date();
      const year = fecha.getFullYear();
      const month = String(fecha.getMonth() + 1).padStart(2, "0");
      const day = String(fecha.getDate()).padStart(2, "0");

      // Obtener el último pedido del día
      const [rows] = await pool.query(
        `SELECT numero_pedido 
                FROM pedidos 
                WHERE numero_pedido LIKE ? 
                ORDER BY id_pedido DESC 
                LIMIT 1`,
        [`PED-${year}${month}${day}-%`]
      );

      let secuencia = 1;
      if (rows.length > 0) {
        const ultimoNumero = rows[0].numero_pedido;
        const ultimaSecuencia = parseInt(ultimoNumero.split("-")[2]);
        secuencia = ultimaSecuencia + 1;
      }

      return `PED-${year}${month}${day}-${String(secuencia).padStart(4, "0")}`;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Crear un nuevo pedido (con transacción)
   */
  static async create(pedidoData) {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const {
        id_cliente,
        id_usuario,
        id_estado,
        subtotal,
        descuento,
        total,
        metodo_pago,
        fecha_entrega,
        direccion_entrega,
        notas,
        productos, // Array de { id_producto, cantidad, precio_unitario }
      } = pedidoData;

      // Generar número de pedido
      const numeroPedido = await this.generateOrderNumber();

      // Insertar el pedido
      const [resultPedido] = await connection.query(
        `INSERT INTO pedidos 
                (numero_pedido, id_cliente, id_usuario, id_estado, subtotal, descuento, 
                 total, metodo_pago, fecha_entrega, direccion_entrega, notas) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          numeroPedido,
          id_cliente,
          id_usuario,
          id_estado,
          subtotal,
          descuento || 0,
          total,
          metodo_pago,
          fecha_entrega || null,
          direccion_entrega || null,
          notas || null,
        ]
      );

      const idPedido = resultPedido.insertId;

      // Insertar los detalles del pedido
      for (const producto of productos) {
        const subtotalProducto = producto.cantidad * producto.precio_unitario;

        await connection.query(
          `INSERT INTO detalle_pedido 
                    (id_pedido, id_producto, cantidad, precio_unitario, subtotal) 
                    VALUES (?, ?, ?, ?, ?)`,
          [
            idPedido,
            producto.id_producto,
            producto.cantidad,
            producto.precio_unitario,
            subtotalProducto,
          ]
        );

        // Actualizar el stock del producto
        await connection.query(
          `UPDATE productos 
                    SET stock = stock - ? 
                    WHERE id_producto = ?`,
          [producto.cantidad, producto.id_producto]
        );
      }

      await connection.commit();

      // Obtener el pedido completo
      return await this.findById(idPedido);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Actualizar el estado de un pedido
   */
  static async updateStatus(id, idEstado) {
    try {
      const [result] = await pool.query(
        `UPDATE pedidos 
                SET id_estado = ? 
                WHERE id_pedido = ?`,
        [idEstado, id]
      );

      if (result.affectedRows === 0) {
        return null;
      }

      return await this.findById(id);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Actualizar información general del pedido
   */
  static async update(id, pedidoData) {
    try {
      const { metodo_pago, fecha_entrega, direccion_entrega, notas } =
        pedidoData;

      const [result] = await pool.query(
        `UPDATE pedidos 
                SET metodo_pago = ?,
                    fecha_entrega = ?,
                    direccion_entrega = ?,
                    notas = ?
                WHERE id_pedido = ?`,
        [
          metodo_pago,
          fecha_entrega || null,
          direccion_entrega || null,
          notas || null,
          id,
        ]
      );

      if (result.affectedRows === 0) {
        return null;
      }

      return await this.findById(id);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Cancelar un pedido (devuelve stock)
   */
  static async cancel(id) {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Obtener los detalles del pedido
      const [detalles] = await connection.query(
        `SELECT id_producto, cantidad 
                FROM detalle_pedido 
                WHERE id_pedido = ?`,
        [id]
      );

      // Devolver el stock de cada producto
      for (const detalle of detalles) {
        await connection.query(
          `UPDATE productos 
                    SET stock = stock + ? 
                    WHERE id_producto = ?`,
          [detalle.cantidad, detalle.id_producto]
        );
      }

      // Actualizar el estado del pedido a "Cancelado" (estado 5)
      await connection.query(
        `UPDATE pedidos 
                SET id_estado = 5 
                WHERE id_pedido = ?`,
        [id]
      );

      await connection.commit();

      return await this.findById(id);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Obtener estadísticas de pedidos
   */
  static async getStats(filtros = {}) {
    try {
      let query = `
                SELECT 
                    COUNT(*) as total_pedidos,
                    SUM(total) as total_ventas,
                    AVG(total) as promedio_venta,
                    MAX(total) as venta_maxima,
                    MIN(total) as venta_minima
                FROM pedidos
                WHERE 1=1
            `;

      const params = [];

      if (filtros.fecha_desde) {
        query += " AND DATE(fecha_pedido) >= ?";
        params.push(filtros.fecha_desde);
      }

      if (filtros.fecha_hasta) {
        query += " AND DATE(fecha_pedido) <= ?";
        params.push(filtros.fecha_hasta);
      }

      if (filtros.id_estado) {
        query += " AND id_estado = ?";
        params.push(filtros.id_estado);
      }

      const [rows] = await pool.query(query, params);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener pedidos por estado
   */
  static async countByStatus() {
    try {
      const [rows] = await pool.query(
        `SELECT 
                    e.id_estado,
                    e.nombre as estado_nombre,
                    COUNT(p.id_pedido) as cantidad
                FROM estados_pedido e
                LEFT JOIN pedidos p ON e.id_estado = p.id_estado
                WHERE e.activo = 1
                GROUP BY e.id_estado, e.nombre
                ORDER BY e.orden`
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Pedido;
