// backend/src/routes/roles.routes.js
const express = require("express");
const router = express.Router();
const RolController = require("../controllers/rolController");

router.get("/", RolController.getAll);
router.get("/:id", RolController.getById);
router.post("/", RolController.create);
router.put("/:id", RolController.update);
router.delete("/:id", RolController.delete);

module.exports = router;
