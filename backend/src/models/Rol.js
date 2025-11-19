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
          r.id_rol,
          r.nombre,
          r.descripcion,
          r.activo,
          r.fecha_creacion,
          r.fecha_actualizacion,
          COUNT(rp.id_permiso) as cantidad_permisos
        FROM roles r
        LEFT JOIN rol_permisos rp ON r.id_rol = rp.id_rol
        WHERE r.activo = 1
        GROUP BY r.id_rol
        ORDER BY r.nombre ASC`
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener un rol por ID con sus permisos
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

      if (rows.length === 0) return null;

      const rol = rows[0];

      // Obtener permisos del rol
      const [permisos] = await pool.query(
        `SELECT 
          p.id_permiso,
          p.codigo,
          p.nombre,
          p.modulo
        FROM permisos p
        INNER JOIN rol_permisos rp ON p.id_permiso = rp.id_permiso
        WHERE rp.id_rol = ? AND p.activo = 1
        ORDER BY p.modulo, p.nombre`,
        [id]
      );

      rol.permisos = permisos;
      return rol;
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
        `INSERT INTO roles (nombre, descripcion) VALUES (?, ?)`,
        [nombre, descripcion || null]
      );

      return await this.findById(result.insertId);
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
        SET nombre = ?, descripcion = ?
        WHERE id_rol = ?`,
        [nombre, descripcion || null, id]
      );

      if (result.affectedRows === 0) return null;

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
        `UPDATE roles SET activo = 0 WHERE id_rol = ?`,
        [id]
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Verificar si un nombre de rol ya existe
   */
  static async existsByName(nombre, excludeId = null) {
    try {
      let query = `SELECT COUNT(*) as count FROM roles WHERE nombre = ? AND activo = 1`;
      let params = [nombre];

      if (excludeId) {
        query += ` AND id_rol != ?`;
        params.push(excludeId);
      }

      const [rows] = await pool.query(query, params);
      return rows[0].count > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Rol;
