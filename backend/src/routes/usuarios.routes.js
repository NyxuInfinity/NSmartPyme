const express = require("express");
const router = express.Router();
const UsuarioController = require("../controllers/usuarioController");

// Rutas temporales sin verificación de permisos
router.get("/", UsuarioController.getAll);
router.get("/:id", UsuarioController.getById);
router.post("/", UsuarioController.create);
router.put("/:id", UsuarioController.update);
router.delete("/:id", UsuarioController.delete);

module.exports = router;
