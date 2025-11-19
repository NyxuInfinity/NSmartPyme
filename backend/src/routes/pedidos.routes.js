// backend/src/routes/pedidos.routes.js
const express = require("express");
const router = express.Router();
const PedidoController = require("../controllers/pedidoController");

// Obtener estadísticas (antes de /:id para evitar conflictos)
router.get("/estadisticas", PedidoController.getStats);

// CRUD básico
router.get("/", PedidoController.getAll);
router.get("/:id", PedidoController.getById);
router.post("/", PedidoController.create);
router.put("/:id", PedidoController.update);

// Operaciones específicas
router.patch("/:id/estado", PedidoController.updateStatus);
router.patch("/:id/cancelar", PedidoController.cancel);

module.exports = router;
