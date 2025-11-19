// backend/src/models/Rol.js
const { pool } = require("../config/database");

class Rol {
  /**
   * Obtener todos los roles activos
   */
  static async findAll() {
    try {
      const [rows] = await pool.query(
        `SELECT 
                    id_rol, 
                    nombre, 
                    descripcion, 
                    activo,
                    fecha_creacion,
                    fecha_actualizacion
                FROM roles 
                WHERE activo = 1
                ORDER BY nombre ASC`
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener un rol por ID
   */
  static async findById(id) {
    try {
      const [rows] = await pool.query(
        `SELECT 
                    id_rol, 
                    nombre, 
                    descripcion, 
                    activo,
                    fecha_creacion,
                    fecha_actualizacion
                FROM roles 
                WHERE id_rol = ?`,
        [id]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Buscar rol por nombre
   */
  static async findByName(nombre) {
    try {
      const [rows] = await pool.query(
        `SELECT 
                    id_rol, 
                    nombre, 
                    descripcion, 
                    activo
                FROM roles 
                WHERE LOWER(nombre) = LOWER(?)`,
        [nombre]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Crear un nuevo rol
   */
  static async create(rolData) {
    try {
      const { nombre, descripcion } = rolData;

      const [result] = await pool.query(
        `INSERT INTO roles (nombre, descripcion) 
                 VALUES (?, ?)`,
        [nombre, descripcion || null]
      );

      return {
        id_rol: result.insertId,
        nombre,
        descripcion,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Actualizar un rol
   */
  static async update(id, rolData) {
    try {
      const { nombre, descripcion } = rolData;

      const [result] = await pool.query(
        `UPDATE roles 
                 SET nombre = ?, 
                     descripcion = ?
                 WHERE id_rol = ?`,
        [nombre, descripcion || null, id]
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
   * Eliminar un rol (soft delete)
   */
  static async delete(id) {
    try {
      const [result] = await pool.query(
        `UPDATE roles 
                 SET activo = 0 
                 WHERE id_rol = ?`,
        [id]
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Verificar si un rol tiene usuarios asociados
   */
  static async hasUsers(id) {
    try {
      const [rows] = await pool.query(
        `SELECT COUNT(*) as count 
                 FROM usuarios 
                 WHERE id_rol = ? AND activo = 1`,
        [id]
      );
      return rows[0].count > 0;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Contar usuarios por rol
   */
  static async countUsers(id) {
    try {
      const [rows] = await pool.query(
        `SELECT COUNT(*) as count 
                 FROM usuarios 
                 WHERE id_rol = ? AND activo = 1`,
        [id]
      );
      return rows[0].count;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Rol;
