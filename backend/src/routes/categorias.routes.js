// backend/src/routes/categorias.routes.js
const express = require("express");
const router = express.Router();
const CategoriaController = require("../controllers/categoriaController");

/**
 * @route   GET /api/categorias
 * @desc    Obtener todas las categorías
 * @access  Public
 */
router.get("/", CategoriaController.getAll);

/**
 * @route   GET /api/categorias/:id
 * @desc    Obtener una categoría por ID
 * @access  Public
 */
router.get("/:id", CategoriaController.getById);

/**
 * @route   POST /api/categorias
 * @desc    Crear una nueva categoría
 * @access  Private (TODO: agregar middleware de autenticación)
 */
router.post("/", CategoriaController.create);

/**
 * @route   PUT /api/categorias/:id
 * @desc    Actualizar una categoría
 * @access  Private (TODO: agregar middleware de autenticación)
 */
router.put("/:id", CategoriaController.update);

/**
 * @route   DELETE /api/categorias/:id
 * @desc    Eliminar una categoría (soft delete)
 * @access  Private (TODO: agregar middleware de autenticación)
 */
router.delete("/:id", CategoriaController.delete);

module.exports = router;
