const express = require("express");
const router = express.Router();
const ProductoController = require("../controllers/productoController");

// Rutas temporales sin verificación de permisos
router.get("/", ProductoController.getAll);
router.get("/low-stock", ProductoController.getLowStock);
router.get("/:id", ProductoController.getById);
router.post("/", ProductoController.create);
router.put("/:id", ProductoController.update);
router.patch("/:id/stock", ProductoController.updateStock);
router.delete("/:id", ProductoController.delete);

module.exports = router;
