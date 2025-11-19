// backend/src/routes/productos.routes.js
const express = require("express");
const router = express.Router();
const ProductoController = require("../controllers/productoController");

router.get("/", ProductoController.getAll);
router.get("/stock-bajo", ProductoController.getLowStock);
router.get("/:id", ProductoController.getById);
router.post("/", ProductoController.create);
router.put("/:id", ProductoController.update);
router.patch("/:id/stock", ProductoController.updateStock);
router.delete("/:id", ProductoController.delete);

module.exports = router;
