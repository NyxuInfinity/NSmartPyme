// backend/src/models/Categoria.js
const { pool } = require("../config/database");

class Categoria {
  /**
   * Obtener todas las categorías activas
   */
  static async findAll() {
    try {
      const [rows] = await pool.query(
        `SELECT 
                    id_categoria, 
                    nombre, 
                    descripcion, 
                    activo,
                    fecha_creacion,
                    fecha_actualizacion
                FROM categorias 
                WHERE activo = 1
                ORDER BY nombre ASC`
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener una categoría por ID
   */
  static async findById(id) {
    try {
      const [rows] = await pool.query(
        `SELECT 
                    id_categoria, 
                    nombre, 
                    descripcion, 
                    activo,
                    fecha_creacion,
                    fecha_actualizacion
                FROM categorias 
                WHERE id_categoria = ?`,
        [id]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Buscar categoría por nombre
   */
  static async findByName(nombre) {
    try {
      const [rows] = await pool.query(
        `SELECT 
                    id_categoria, 
                    nombre, 
                    descripcion, 
                    activo
                FROM categorias 
                WHERE LOWER(nombre) = LOWER(?)`,
        [nombre]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Crear una nueva categoría
   */
  static async create(categoriaData) {
    try {
      const { nombre, descripcion } = categoriaData;

      const [result] = await pool.query(
        `INSERT INTO categorias (nombre, descripcion) 
                 VALUES (?, ?)`,
        [nombre, descripcion || null]
      );

      return {
        id_categoria: result.insertId,
        nombre,
        descripcion,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Actualizar una categoría
   */
  static async update(id, categoriaData) {
    try {
      const { nombre, descripcion } = categoriaData;

      const [result] = await pool.query(
        `UPDATE categorias 
                 SET nombre = ?, 
                     descripcion = ?
                 WHERE id_categoria = ?`,
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
   * Eliminar una categoría (soft delete)
   */
  static async delete(id) {
    try {
      const [result] = await pool.query(
        `UPDATE categorias 
                 SET activo = 0 
                 WHERE id_categoria = ?`,
        [id]
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Verificar si una categoría tiene productos asociados
   */
  static async hasProducts(id) {
    try {
      const [rows] = await pool.query(
        `SELECT COUNT(*) as count 
                 FROM productos 
                 WHERE id_categoria = ? AND activo = 1`,
        [id]
      );
      return rows[0].count > 0;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Contar productos por categoría
   */
  static async countProducts(id) {
    try {
      const [rows] = await pool.query(
        `SELECT COUNT(*) as count 
                 FROM productos 
                 WHERE id_categoria = ? AND activo = 1`,
        [id]
      );
      return rows[0].count;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Categoria;
