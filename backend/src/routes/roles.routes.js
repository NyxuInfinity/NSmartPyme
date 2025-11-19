const express = require("express");
const router = express.Router();
const RolController = require("../controllers/rolController");

// Obtener todos los roles
router.get("/", RolController.getAll);

// Obtener un rol específico por ID
router.get("/:id", RolController.getById);

// Crear un nuevo rol
router.post("/", RolController.create);

// Actualizar un rol
router.put("/:id", RolController.update);

// Eliminar un rol
router.delete("/:id", RolController.delete);

// Obtener todos los permisos disponibles (agrupados por módulo)
router.get("/permisos/disponibles", RolController.getPermisos);

// Asignar permisos a un rol
router.post("/:id/permisos", RolController.assignPermisos);

module.exports = router;
