// backend/src/models/Producto.js
const { pool } = require("../config/database");

class Producto {
  /**
   * Obtener todos los productos activos con información de categoría
   */
  static async findAll() {
    try {
      const [rows] = await pool.query(
        `SELECT 
                    p.id_producto,
                    p.id_categoria,
                    p.sku,
                    p.nombre,
                    p.descripcion,
                    p.precio,
                    p.stock,
                    p.stock_minimo,
                    p.imagen_url,
                    p.activo,
                    p.fecha_creacion,
                    p.fecha_actualizacion,
                    c.nombre as categoria_nombre
                FROM productos p
                INNER JOIN categorias c ON p.id_categoria = c.id_categoria
                WHERE p.activo = 1
                ORDER BY p.nombre ASC`
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener productos por categoría
   */
  static async findByCategory(idCategoria) {
    try {
      const [rows] = await pool.query(
        `SELECT 
                    p.id_producto,
                    p.id_categoria,
                    p.sku,
                    p.nombre,
                    p.descripcion,
                    p.precio,
                    p.stock,
                    p.stock_minimo,
                    p.imagen_url,
                    p.activo,
                    c.nombre as categoria_nombre
                FROM productos p
                INNER JOIN categorias c ON p.id_categoria = c.id_categoria
                WHERE p.id_categoria = ? AND p.activo = 1
                ORDER BY p.nombre ASC`,
        [idCategoria]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener un producto por ID
   */
  static async findById(id) {
    try {
      const [rows] = await pool.query(
        `SELECT 
                    p.id_producto,
                    p.id_categoria,
                    p.sku,
                    p.nombre,
                    p.descripcion,
                    p.precio,
                    p.stock,
                    p.stock_minimo,
                    p.imagen_url,
                    p.activo,
                    p.fecha_creacion,
                    p.fecha_actualizacion,
                    c.nombre as categoria_nombre
                FROM productos p
                INNER JOIN categorias c ON p.id_categoria = c.id_categoria
                WHERE p.id_producto = ?`,
        [id]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Buscar producto por SKU
   */
  static async findBySKU(sku) {
    try {
      const [rows] = await pool.query(
        `SELECT 
                    p.id_producto,
                    p.id_categoria,
                    p.sku,
                    p.nombre,
                    p.descripcion,
                    p.precio,
                    p.stock,
                    p.stock_minimo,
                    p.imagen_url,
                    p.activo,
                    c.nombre as categoria_nombre
                FROM productos p
                INNER JOIN categorias c ON p.id_categoria = c.id_categoria
                WHERE p.sku = ?`,
        [sku]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Buscar productos por nombre
   */
  static async searchByName(nombre) {
    try {
      const [rows] = await pool.query(
        `SELECT 
                    p.id_producto,
                    p.id_categoria,
                    p.sku,
                    p.nombre,
                    p.descripcion,
                    p.precio,
                    p.stock,
                    p.stock_minimo,
                    p.imagen_url,
                    c.nombre as categoria_nombre
                FROM productos p
                INNER JOIN categorias c ON p.id_categoria = c.id_categoria
                WHERE p.nombre LIKE ? AND p.activo = 1
                ORDER BY p.nombre ASC`,
        [`%${nombre}%`]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Generar un SKU único automáticamente
   */
  static async generateSKU() {
    try {
      const [rows] = await pool.query(
        `SELECT MAX(id_producto) as max_id FROM productos`
      );
      const nextId = (rows[0].max_id || 0) + 1;
      return `PROD-${String(nextId).padStart(4, "0")}`;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Crear un nuevo producto
   */
  static async create(productoData) {
    try {
      const {
        id_categoria,
        sku,
        nombre,
        descripcion,
        precio,
        stock,
        stock_minimo,
        imagen_url,
      } = productoData;

      // Si no se proporciona SKU, generar uno automáticamente
      const skuFinal = sku || (await this.generateSKU());

      const [result] = await pool.query(
        `INSERT INTO productos 
                (id_categoria, sku, nombre, descripcion, precio, stock, stock_minimo, imagen_url) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id_categoria,
          skuFinal,
          nombre,
          descripcion || null,
          precio,
          stock || 0,
          stock_minimo || 5,
          imagen_url || null,
        ]
      );

      return await this.findById(result.insertId);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Actualizar un producto
   */
  static async update(id, productoData) {
    try {
      const {
        id_categoria,
        sku,
        nombre,
        descripcion,
        precio,
        stock,
        stock_minimo,
        imagen_url,
      } = productoData;

      const [result] = await pool.query(
        `UPDATE productos 
                SET id_categoria = ?,
                    sku = ?,
                    nombre = ?,
                    descripcion = ?,
                    precio = ?,
                    stock = ?,
                    stock_minimo = ?,
                    imagen_url = ?
                WHERE id_producto = ?`,
        [
          id_categoria,
          sku,
          nombre,
          descripcion || null,
          precio,
          stock,
          stock_minimo,
          imagen_url || null,
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
   * Actualizar solo el stock de un producto
   */
  static async updateStock(id, nuevoStock) {
    try {
      const [result] = await pool.query(
        `UPDATE productos 
                SET stock = ?
                WHERE id_producto = ?`,
        [nuevoStock, id]
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Eliminar un producto (soft delete)
   */
  static async delete(id) {
    try {
      const [result] = await pool.query(
        `UPDATE productos 
                SET activo = 0 
                WHERE id_producto = ?`,
        [id]
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener productos con stock bajo
   */
  static async findLowStock() {
    try {
      const [rows] = await pool.query(
        `SELECT 
                    p.id_producto,
                    p.sku,
                    p.nombre,
                    p.stock,
                    p.stock_minimo,
                    c.nombre as categoria_nombre
                FROM productos p
                INNER JOIN categorias c ON p.id_categoria = c.id_categoria
                WHERE p.stock <= p.stock_minimo AND p.activo = 1
                ORDER BY p.stock ASC`
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Producto;
