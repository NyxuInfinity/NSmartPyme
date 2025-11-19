// backend/src/models/Permiso.js
const { pool } = require("../config/database");

class Permiso {
  /**
   * Obtener todos los permisos
   */
  static async findAll() {
    try {
      const [rows] = await pool.query(
        `SELECT 
          id_permiso,
          codigo,
          nombre,
          descripcion,
          modulo,
          activo,
          fecha_creacion
        FROM permisos
        WHERE activo = 1
        ORDER BY modulo, nombre ASC`
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener permisos agrupados por módulo
   */
  static async findGroupedByModule() {
    try {
      const [rows] = await pool.query(
        `SELECT 
          modulo,
          JSON_ARRAYAGG(
            JSON_OBJECT(
              'id_permiso', id_permiso,
              'codigo', codigo,
              'nombre', nombre,
              'descripcion', descripcion
            )
          ) as permisos
        FROM permisos
        WHERE activo = 1
        GROUP BY modulo
        ORDER BY modulo ASC`
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener permisos de un rol específico
   */
  static async findByRol(idRol) {
    try {
      const [rows] = await pool.query(
        `SELECT 
          p.id_permiso,
          p.codigo,
          p.nombre,
          p.descripcion,
          p.modulo
        FROM permisos p
        INNER JOIN rol_permisos rp ON p.id_permiso = rp.id_permiso
        WHERE rp.id_rol = ? AND p.activo = 1
        ORDER BY p.modulo, p.nombre ASC`,
        [idRol]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Verificar si un rol tiene un permiso específico
   */
  static async hasPermission(idRol, codigoPermiso) {
    try {
      const [rows] = await pool.query(
        `SELECT COUNT(*) as tiene_permiso
        FROM rol_permisos rp
        INNER JOIN permisos p ON rp.id_permiso = p.id_permiso
        WHERE rp.id_rol = ? AND p.codigo = ? AND p.activo = 1`,
        [idRol, codigoPermiso]
      );
      return rows[0].tiene_permiso > 0;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Asignar permisos a un rol (reemplaza los permisos existentes)
   */
  static async assignToRole(idRol, permisoIds) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Eliminar permisos actuales del rol
      await connection.query(`DELETE FROM rol_permisos WHERE id_rol = ?`, [
        idRol,
      ]);

      // Insertar nuevos permisos
      if (permisoIds && permisoIds.length > 0) {
        const values = permisoIds.map((id) => [idRol, id]);
        await connection.query(
          `INSERT INTO rol_permisos (id_rol, id_permiso) VALUES ?`,
          [values]
        );
      }

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = Permiso;
