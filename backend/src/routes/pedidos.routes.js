const express = require("express");
const router = express.Router();
const PedidoController = require("../controllers/pedidoController");

// Rutas temporales sin verificación de permisos
router.get("/", PedidoController.getAll);
router.get("/:id", PedidoController.getById);
router.post("/", PedidoController.create);
router.put("/:id", PedidoController.update);
router.patch("/:id/estado", PedidoController.updateEstado);
router.delete("/:id/cancel", PedidoController.cancel);

module.exports = router;
