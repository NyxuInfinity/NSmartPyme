const express = require("express");
const router = express.Router();
const ClienteController = require("../controllers/clienteController");

// Rutas temporales sin verificación de permisos
router.get("/", ClienteController.getAll);
router.get("/:id", ClienteController.getById);
router.post("/", ClienteController.create);
router.put("/:id", ClienteController.update);
router.delete("/:id", ClienteController.delete);

module.exports = router;
