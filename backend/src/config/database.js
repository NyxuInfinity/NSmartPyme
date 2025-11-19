// backend/src/config/database.js
const mysql = require("mysql2/promise");
require("dotenv").config();

// Configuración del pool de conexiones
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

// Función para verificar la conexión
const checkConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log("✅ Conexión exitosa a MySQL");
    console.log(`📊 Base de datos: ${process.env.DB_NAME}`);
    connection.release();
    return true;
  } catch (error) {
    console.error("❌ Error al conectar con MySQL:", error.message);
    return false;
  }
};

module.exports = { pool, checkConnection };
