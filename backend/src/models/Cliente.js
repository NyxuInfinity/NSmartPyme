// backend/src/models/Cliente.js
const { pool } = require("../config/database");

class Cliente {
  /**
   * Obtener todos los clientes activos
   */
  static async findAll() {
    try {
      const [rows] = await pool.query(
        `SELECT 
                    id_cliente,
                    nombre,
                    apellido,
                    email,
                    telefono,
                    direccion,
                    activo,
                    fecha_creacion,
                    fecha_actualizacion
                FROM clientes 
                WHERE activo = 1
                ORDER BY nombre ASC, apellido ASC`
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener un cliente por ID
   */
  static async findById(id) {
    try {
      const [rows] = await pool.query(
        `SELECT 
                    id_cliente,
                    nombre,
                    apellido,
                    email,
                    telefono,
                    direccion,
                    activo,
                    fecha_creacion,
                    fecha_actualizacion
                FROM clientes 
                WHERE id_cliente = ?`,
        [id]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Buscar cliente por email
   */
  static async findByEmail(email) {
    try {
      const [rows] = await pool.query(
        `SELECT 
                    id_cliente,
                    nombre,
                    apellido,
                    email,
                    telefono,
                    direccion,
                    activo
                FROM clientes 
                WHERE email = ?`,
        [email]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Buscar cliente por teléfono
   */
  static async findByPhone(telefono) {
    try {
      const [rows] = await pool.query(
        `SELECT 
                    id_cliente,
                    nombre,
                    apellido,
                    email,
                    telefono,
                    direccion,
                    activo
                FROM clientes 
                WHERE telefono = ? AND activo = 1`,
        [telefono]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Buscar clientes por nombre o apellido
   */
  static async searchByName(busqueda) {
    try {
      const [rows] = await pool.query(
        `SELECT 
                    id_cliente,
                    nombre,
                    apellido,
                    email,
                    telefono,
                    direccion,
                    activo
                FROM clientes 
                WHERE (nombre LIKE ? OR apellido LIKE ?) AND activo = 1
                ORDER BY nombre ASC, apellido ASC`,
        [`%${busqueda}%`, `%${busqueda}%`]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Crear un nuevo cliente
   */
  static async create(clienteData) {
    try {
      const { nombre, apellido, email, telefono, direccion } = clienteData;

      const [result] = await pool.query(
        `INSERT INTO clientes 
                (nombre, apellido, email, telefono, direccion) 
                VALUES (?, ?, ?, ?, ?)`,
        [nombre, apellido, email || null, telefono || null, direccion || null]
      );

      return await this.findById(result.insertId);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Actualizar un cliente
   */
  static async update(id, clienteData) {
    try {
      const { nombre, apellido, email, telefono, direccion } = clienteData;

      const [result] = await pool.query(
        `UPDATE clientes 
                SET nombre = ?,
                    apellido = ?,
                    email = ?,
                    telefono = ?,
                    direccion = ?
                WHERE id_cliente = ?`,
        [
          nombre,
          apellido,
          email || null,
          telefono || null,
          direccion || null,
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
   * Eliminar un cliente (soft delete)
   */
  static async delete(id) {
    try {
      const [result] = await pool.query(
        `UPDATE clientes 
                SET activo = 0 
                WHERE id_cliente = ?`,
        [id]
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener historial de pedidos de un cliente
   */
  static async getPedidos(id) {
    try {
      const [rows] = await pool.query(
        `SELECT 
                    p.id_pedido,
                    p.numero_pedido,
                    p.total,
                    p.fecha_pedido,
                    e.nombre as estado
                FROM pedidos p
                INNER JOIN estados_pedido e ON p.id_estado = e.id_estado
                WHERE p.id_cliente = ?
                ORDER BY p.fecha_pedido DESC
                LIMIT 10`,
        [id]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Contar pedidos de un cliente
   */
  static async countPedidos(id) {
    try {
      const [rows] = await pool.query(
        `SELECT COUNT(*) as count 
                FROM pedidos 
                WHERE id_cliente = ?`,
        [id]
      );
      return rows[0].count;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Cliente;
