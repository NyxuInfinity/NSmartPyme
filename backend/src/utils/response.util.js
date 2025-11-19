// backend/src/utils/response.util.js

/**
* Utilidad para estandarizar las respuestas de la API
*/

const successResponse = (
  res,
  data,
  message = "Operación exitosa",
  statusCode = 200
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const errorResponse = (
  res,
  message = "Error en la operación",
  statusCode = 500,
  errors = null
) => {
  const response = {
    success: false,
    message,
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

const notFoundResponse = (res, message = "Recurso no encontrado") => {
  return errorResponse(res, message, 404);
};

const validationErrorResponse = (
  res,
  errors,
  message = "Error de validación"
) => {
  return errorResponse(res, message, 400, errors);
};

const unauthorizedResponse = (res, message = "No autorizado") => {
  return errorResponse(res, message, 401);
};

const forbiddenResponse = (res, message = "Acceso prohibido") => {
  return errorResponse(res, message, 403);
};

module.exports = {
  successResponse,
  errorResponse,
  notFoundResponse,
  validationErrorResponse,
  unauthorizedResponse,
  forbiddenResponse,
};
