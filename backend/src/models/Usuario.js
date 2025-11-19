// backend/src/models/Usuario.js
const { pool } = require("../config/database");
const bcrypt = require("bcryptjs");

class Usuario {
  /**
   * Obtener todos los usuarios activos con información de rol
   */
  static async findAll() {
    try {
      const [rows] = await pool.query(
        `SELECT 
                    u.id_usuario,
                    u.id_rol,
                    u.nombre,
                    u.apellido,
                    u.email,
                    u.activo,
                    u.fecha_creacion,
                    u.fecha_actualizacion,
                    u.ultimo_acceso,
                    r.nombre as rol_nombre
                FROM usuarios u
                INNER JOIN roles r ON u.id_rol = r.id_rol
                WHERE u.activo = 1
                ORDER BY u.nombre ASC, u.apellido ASC`
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener usuarios por rol
   */
  static async findByRole(idRol) {
    try {
      const [rows] = await pool.query(
        `SELECT 
                    u.id_usuario,
                    u.id_rol,
                    u.nombre,
                    u.apellido,
                    u.email,
                    u.activo,
                    u.ultimo_acceso,
                    r.nombre as rol_nombre
                FROM usuarios u
                INNER JOIN roles r ON u.id_rol = r.id_rol
                WHERE u.id_rol = ? AND u.activo = 1
                ORDER BY u.nombre ASC`,
        [idRol]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener un usuario por ID
   */
  static async findById(id) {
    try {
      const [rows] = await pool.query(
        `SELECT 
                    u.id_usuario,
                    u.id_rol,
                    u.nombre,
                    u.apellido,
                    u.email,
                    u.activo,
                    u.fecha_creacion,
                    u.fecha_actualizacion,
                    u.ultimo_acceso,
                    r.nombre as rol_nombre
                FROM usuarios u
                INNER JOIN roles r ON u.id_rol = r.id_rol
                WHERE u.id_usuario = ?`,
        [id]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Buscar usuario por email
   */
  static async findByEmail(email) {
    try {
      const [rows] = await pool.query(
        `SELECT 
                    u.id_usuario,
                    u.id_rol,
                    u.nombre,
                    u.apellido,
                    u.email,
                    u.password,
                    u.activo,
                    r.nombre as rol_nombre
                FROM usuarios u
                INNER JOIN roles r ON u.id_rol = r.id_rol
                WHERE u.email = ?`,
        [email]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Crear un nuevo usuario
   */
  static async create(usuarioData) {
    try {
      const { id_rol, nombre, apellido, email, password } = usuarioData;

      // Encriptar la contraseña
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const [result] = await pool.query(
        `INSERT INTO usuarios 
                (id_rol, nombre, apellido, email, password) 
                VALUES (?, ?, ?, ?, ?)`,
        [id_rol, nombre, apellido, email, hashedPassword]
      );

      return await this.findById(result.insertId);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Actualizar un usuario
   */
  static async update(id, usuarioData) {
    try {
      const { id_rol, nombre, apellido, email } = usuarioData;

      const [result] = await pool.query(
        `UPDATE usuarios 
                SET id_rol = ?,
                    nombre = ?,
                    apellido = ?,
                    email = ?
                WHERE id_usuario = ?`,
        [id_rol, nombre, apellido, email, id]
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
   * Actualizar contraseña
   */
  static async updatePassword(id, newPassword) {
    try {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      const [result] = await pool.query(
        `UPDATE usuarios 
                SET password = ?
                WHERE id_usuario = ?`,
        [hashedPassword, id]
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Actualizar último acceso
   */
  static async updateLastAccess(id) {
    try {
      await pool.query(
        `UPDATE usuarios 
                SET ultimo_acceso = CURRENT_TIMESTAMP
                WHERE id_usuario = ?`,
        [id]
      );
    } catch (error) {
      throw error;
    }
  }

  /**
   * Eliminar un usuario (soft delete)
   */
  static async delete(id) {
    try {
      const [result] = await pool.query(
        `UPDATE usuarios 
                SET activo = 0 
                WHERE id_usuario = ?`,
        [id]
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Verificar contraseña
   */
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = Usuario;
