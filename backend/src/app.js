// backend/src/app.js
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const errorHandler = require("./middlewares/errorHandler");
const { generalLimiter } = require("./middlewares/rateLimiter");

const app = express();

// ============================================
// MIDDLEWARES DE SEGURIDAD
// ============================================

// Helmet - Headers de seguridad HTTP
app.use(helmet());

// CORS - Permitir peticiones desde el frontend
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Rate limiting general
app.use(generalLimiter);

// Parser de JSON
app.use(express.json({ limit: "10mb" }));

// Parser de URL encoded
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ============================================
// RUTAS PÚBLICAS
// ============================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API SmartPyme - Sistema de Gestión de Ventas",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

app.get("/health", (req, res) => {
  res.json({
    success: true,
    status: "OK",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// ============================================
// RUTAS DE AUTENTICACIÓN
// ============================================

const authRoutes = require("./routes/auth.routes");
app.use("/api/auth", authRoutes);

// ============================================
// RUTAS PROTEGIDAS DE LA API
// ============================================

const { verifyToken } = require("./middlewares/auth.middleware");

// Rutas de Categorías
const categoriasRoutes = require("./routes/categorias.routes");
app.use("/api/categorias", verifyToken, categoriasRoutes);

// Rutas de Roles
const rolesRoutes = require("./routes/roles.routes");
app.use("/api/roles", verifyToken, rolesRoutes);

// Rutas de Productos
const productosRoutes = require("./routes/productos.routes");
app.use("/api/productos", verifyToken, productosRoutes);

// Rutas de Usuarios
const usuariosRoutes = require("./routes/usuarios.routes");
app.use("/api/usuarios", verifyToken, usuariosRoutes);

// Rutas de Clientes
const clientesRoutes = require("./routes/clientes.routes");
app.use("/api/clientes", verifyToken, clientesRoutes);

// Rutas de Pedidos
const pedidosRoutes = require("./routes/pedidos.routes");
app.use("/api/pedidos", verifyToken, pedidosRoutes);

// ============================================
// MANEJO DE ERRORES
// ============================================

// Ruta no encontrada
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: "Ruta no encontrada",
    path: req.originalUrl,
  });
});

// Middleware de manejo de errores
app.use(errorHandler);

module.exports = app;
