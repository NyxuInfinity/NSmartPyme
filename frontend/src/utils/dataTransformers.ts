/**
 * Utilidades para normalizar datos entre frontend y backend
 * ✅ Actualizado para usar 'stock' en lugar de 'cantidad_stock'
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
 * ✅ Ahora usa 'stock' en lugar de 'cantidad_stock'
 */
export const transformProductoToBackend = (data: any) => {
  return {
    id_categoria: toInteger(data.id_categoria),
    sku: data.sku ? String(data.sku).trim() : undefined,
    nombre: String(data.nombre || '').trim(),
    descripcion: data.descripcion ? String(data.descripcion).trim() : undefined,
    precio: toPrice(data.precio),
    stock: toInteger(data.stock), // ✅ Usa 'stock' directamente
    stock_minimo: toInteger(data.stock_minimo),
    activo: Boolean(data.activo),
  };
};

/**
 * Transforma respuesta de producto del backend al frontend
 * ✅ El backend ya devuelve 'stock', solo normalizar
 */
export const transformProductoFromBackend = (data: any) => {
  return {
    ...data,
    stock: toInteger(data.stock), // ✅ Normaliza el stock
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
