// backend/src/middleware/checkPermission.js
const Permiso = require("../models/Permiso");

/**
 * Middleware para verificar si el usuario tiene un permiso específico
 *
 * Uso:
 * router.get('/productos', checkPermission('ver_productos'), ProductoController.getAll);
 * router.post('/productos', checkPermission('crear_productos'), ProductoController.create);
 */
const checkPermission = (codigoPermiso) => {
  return async (req, res, next) => {
    try {
      // Verificar que el usuario esté autenticado
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "No autenticado",
        });
      }

      const { id_rol } = req.user;

      // Verificar si el rol tiene el permiso
      const tienePermiso = await Permiso.hasPermission(id_rol, codigoPermiso);

      if (!tienePermiso) {
        return res.status(403).json({
          success: false,
          message: "No tienes permisos para realizar esta acción",
          permiso_requerido: codigoPermiso,
        });
      }

      // El usuario tiene el permiso, continuar
      next();
    } catch (error) {
      console.error("Error al verificar permisos:", error);
      return res.status(500).json({
        success: false,
        message: "Error al verificar permisos",
      });
    }
  };
};

/**
 * Middleware para verificar si el usuario tiene AL MENOS UNO de los permisos especificados
 *
 * Uso:
 * router.get('/reportes', checkAnyPermission(['ver_reportes_ventas', 'ver_reportes_inventario']), ...);
 */
const checkAnyPermission = (codigosPermisos) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "No autenticado",
        });
      }

      const { id_rol } = req.user;

      // Verificar cada permiso
      const checks = await Promise.all(
        codigosPermisos.map((codigo) => Permiso.hasPermission(id_rol, codigo))
      );

      // Si tiene al menos uno, continuar
      const tieneAlMenosUno = checks.some((tiene) => tiene);

      if (!tieneAlMenosUno) {
        return res.status(403).json({
          success: false,
          message: "No tienes permisos para realizar esta acción",
          permisos_requeridos: codigosPermisos,
        });
      }

      next();
    } catch (error) {
      console.error("Error al verificar permisos:", error);
      return res.status(500).json({
        success: false,
        message: "Error al verificar permisos",
      });
    }
  };
};

/**
 * Middleware para verificar si el usuario tiene TODOS los permisos especificados
 *
 * Uso:
 * router.post('/admin/config', checkAllPermissions(['ver_roles', 'asignar_permisos']), ...);
 */
const checkAllPermissions = (codigosPermisos) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "No autenticado",
        });
      }

      const { id_rol } = req.user;

      // Verificar cada permiso
      const checks = await Promise.all(
        codigosPermisos.map((codigo) => Permiso.hasPermission(id_rol, codigo))
      );

      // Todos deben ser true
      const tieneTodos = checks.every((tiene) => tiene);

      if (!tieneTodos) {
        return res.status(403).json({
          success: false,
          message: "No tienes todos los permisos necesarios para esta acción",
          permisos_requeridos: codigosPermisos,
        });
      }

      next();
    } catch (error) {
      console.error("Error al verificar permisos:", error);
      return res.status(500).json({
        success: false,
        message: "Error al verificar permisos",
      });
    }
  };
};

module.exports = {
  checkPermission,
  checkAnyPermission,
  checkAllPermissions,
};
