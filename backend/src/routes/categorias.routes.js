const express = require("express");
const router = express.Router();
const CategoriaController = require("../controllers/categoriaController");

// Rutas temporales sin verificación de permisos
router.get("/", CategoriaController.getAll);
router.get("/:id", CategoriaController.getById);
router.post("/", CategoriaController.create);
router.put("/:id", CategoriaController.update);
router.delete("/:id", CategoriaController.delete);

module.exports = router;
