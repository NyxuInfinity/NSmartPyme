// backend/src/routes/usuarios.routes.js
const express = require("express");
const router = express.Router();
const UsuarioController = require("../controllers/usuarioController");

router.get("/", UsuarioController.getAll);
router.get("/:id", UsuarioController.getById);
router.post("/", UsuarioController.create);
router.put("/:id", UsuarioController.update);
router.patch("/:id/password", UsuarioController.updatePassword);
router.delete("/:id", UsuarioController.delete);

module.exports = router;
