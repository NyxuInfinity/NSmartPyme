// backend/src/routes/clientes.routes.js
const express = require("express");
const router = express.Router();
const ClienteController = require("../controllers/clienteController");

router.get("/", ClienteController.getAll);
router.get("/:id", ClienteController.getById);
router.get("/:id/pedidos", ClienteController.getPedidos);
router.post("/", ClienteController.create);
router.put("/:id", ClienteController.update);
router.delete("/:id", ClienteController.delete);

module.exports = router;
