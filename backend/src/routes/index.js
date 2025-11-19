// backend/src/routes/index.js (o app.js)
const express = require("express");
const router = express.Router();

// Importar rutas
const authRoutes = require("./auth.routes");
const productosRoutes = require("./productos.routes");
const categoriasRoutes = require("./categorias.routes");
const clientesRoutes = require("./clientes.routes");
const pedidosRoutes = require("./pedidos.routes");
const usuariosRoutes = require("./usuarios.routes");
const rolesRoutes = require("./roles.routes"); // ✅ NUEVO

// Middleware de autenticación
const { verificarToken } = require("../middleware/auth.middleware");

// Rutas públicas
router.use("/auth", authRoutes);

// Rutas protegidas (requieren autenticación)
router.use("/productos", verificarToken, productosRoutes);
router.use("/categorias", verificarToken, categoriasRoutes);
router.use("/clientes", verificarToken, clientesRoutes);
router.use("/pedidos", verificarToken, pedidosRoutes);
router.use("/usuarios", verificarToken, usuariosRoutes);
router.use("/roles", verificarToken, rolesRoutes); // ✅ NUEVO

module.exports = router;
