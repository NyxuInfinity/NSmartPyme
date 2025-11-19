// backend/server.js
require("dotenv").config();
const app = require("./src/app");
const { checkConnection } = require("./src/config/database");

const PORT = process.env.PORT || 5000;

// Función para iniciar el servidor
const startServer = async () => {
  try {
    // Verificar conexión a la base de datos
    const dbConnected = await checkConnection();

    if (!dbConnected) {
      console.error("❌ No se pudo conectar a la base de datos");
      console.error("⚠️  Verifica tu archivo .env y que MySQL esté corriendo");
      process.exit(1);
    }

    // Iniciar el servidor
    app.listen(PORT, () => {
      console.log("");
      console.log("========================================");
      console.log("🚀 Servidor SmartPyme iniciado");
      console.log("========================================");
      console.log(`📡 Servidor corriendo en: http://localhost:${PORT}`);
      console.log(`🌍 Entorno: ${process.env.NODE_ENV || "development"}`);
      console.log(`📊 Base de datos: ${process.env.DB_NAME}`);
      console.log("========================================");
      console.log("");
      console.log("📝 Rutas disponibles:");
      console.log(`   GET  http://localhost:${PORT}/`);
      console.log(`   GET  http://localhost:${PORT}/health`);
      console.log("");
      console.log("⏹️  Presiona CTRL+C para detener el servidor");
      console.log("");
    });
  } catch (error) {
    console.error("❌ Error al iniciar el servidor:", error);
    process.exit(1);
  }
};

// Manejo de errores no capturados
process.on("unhandledRejection", (err) => {
  console.error("❌ Error no manejado:", err);
  process.exit(1);
});

process.on("SIGTERM", () => {
  console.log("👋 SIGTERM recibido, cerrando servidor...");
  process.exit(0);
});

// Iniciar el servidor
startServer();
