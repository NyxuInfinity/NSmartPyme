/**
 * Utilidades para normalizar datos entre frontend y backend
 */

// Conversión segura string -> number
export const toNumber = (value: any, defaultValue: number = 0): number => {
  if (typeof value === 'number' && !isNaN(value)) return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
  }
  return defaultValue;
};

// Conversión segura para precio (2 decimales)
export const toPrice = (value: any): number => {
  return Math.round(toNumber(value, 0) * 100) / 100;
};

// Conversión segura para enteros (stock, cantidad)
export const toInteger = (value: any, defaultValue: number = 0): number => {
  return Math.floor(toNumber(value, defaultValue));
};

/**
 * Transforma datos de producto del frontend al formato del backend
 */
export const transformProductoToBackend = (data: any) => {
  return {
    id_categoria: toInteger(data.id_categoria),
    nombre: String(data.nombre || '').trim(),
    descripcion: data.descripcion ? String(data.descripcion).trim() : undefined,
    precio: toPrice(data.precio),
    stock: toInteger(data.cantidad_stock || data.stock), // ✅ Mapeo correcto
    sku: data.sku ? String(data.sku).trim() : undefined,
    activo: Boolean(data.activo),
  };
};

/**
 * Transforma respuesta de producto del backend al frontend
 */
export const transformProductoFromBackend = (data: any) => {
  return {
    ...data,
    cantidad_stock: toInteger(data.stock || data.cantidad_stock), // ✅ Normalización
    precio: toPrice(data.precio),
  };
};

/**
 * Transforma datos de pedido del frontend al backend
 */
export const transformPedidoToBackend = (data: any) => {
  return {
    id_cliente: toInteger(data.id_cliente),
    detalles: (data.detalles || []).map((detalle: any) => ({
      id_producto: toInteger(detalle.id_producto),
      cantidad: toInteger(detalle.cantidad),
      precio_unitario: toPrice(detalle.precio_unitario),
    })),
  };
};

/**
 * Valida que un objeto tenga los campos requeridos
 */
export const validateRequiredFields = (
  data: any,
  requiredFields: string[]
): { valid: boolean; missing: string[] } => {
  const missing = requiredFields.filter(field => {
    const value = data[field];
    return value === undefined || value === null || value === '';
  });
  return { valid: missing.length === 0, missing };
};
