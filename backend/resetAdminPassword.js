const Usuario = require("./src/models/Usuario");
const bcrypt = require("bcrypt");

async function resetPassword() {
  try {
    console.log("🔄 Actualizando contraseña del admin...");

    const newPassword = "admin123";
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar directamente en la DB
    const db = require("./src/config/database"); // O tu conexión a DB

    await db.query("UPDATE usuarios SET password = ? WHERE email = ?", [
      hashedPassword,
      "admin@smartpyme.com",
    ]);

    console.log("✅ Contraseña actualizada exitosamente");
    console.log("Hash:", hashedPassword);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

resetPassword();
