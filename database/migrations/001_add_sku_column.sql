-- ============================================
-- MIGRACIÓN: Agregar columna SKU a productos
-- Fecha: 2025-11-19
-- Descripción: Agrega columna sku UNIQUE a la tabla productos
-- ============================================

USE smartpyme_db;

-- Agregar columna SKU después de id_categoria
ALTER TABLE productos 
ADD COLUMN sku VARCHAR(50) UNIQUE AFTER id_categoria;

-- Generar SKUs automáticos para productos existentes
-- Formato: PROD-{id_producto con padding de 4 dígitos}
UPDATE productos 
SET sku = CONCAT('PROD-', LPAD(id_producto, 4, '0'))
WHERE sku IS NULL;

-- Crear índice para búsquedas rápidas por SKU
CREATE INDEX idx_sku ON productos(sku);

-- Verificar que se aplicó correctamente
SELECT 'Migración completada exitosamente' AS status,
       COUNT(*) AS total_productos,
       COUNT(sku) AS productos_con_sku
FROM productos;

-- ============================================
-- FIN DE MIGRACIÓN
-- ============================================
