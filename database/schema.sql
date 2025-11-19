-- ============================================
-- SMARTPYME - SCHEMA DE BASE DE DATOS
-- Sistema de Gestión de Ventas y Pedidos
-- ============================================

-- Configuración inicial
SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

-- Eliminar base de datos si existe y crearla nuevamente
DROP DATABASE IF EXISTS smartpyme_db;
CREATE DATABASE smartpyme_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE smartpyme_db;

-- ============================================
-- TABLAS PRINCIPALES
-- ============================================

-- Tabla: roles
CREATE TABLE roles (
    id_rol INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla: usuarios (personal del sistema)
CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    id_rol INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    ultimo_acceso TIMESTAMP NULL,
    FOREIGN KEY (id_rol) REFERENCES roles(id_rol) ON DELETE RESTRICT,
    INDEX idx_email (email),
    INDEX idx_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla: categorias
CREATE TABLE categorias (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_nombre (nombre),
    INDEX idx_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla: productos
CREATE TABLE productos (
    id_producto INT AUTO_INCREMENT PRIMARY KEY,
    id_categoria INT NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    stock_minimo INT DEFAULT 5,
    imagen_url VARCHAR(255),
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_categoria) REFERENCES categorias(id_categoria) ON DELETE RESTRICT,
    INDEX idx_nombre (nombre),
    INDEX idx_categoria (id_categoria),
    INDEX idx_activo (activo),
    INDEX idx_precio (precio)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla: clientes
CREATE TABLE clientes (
    id_cliente INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    telefono VARCHAR(20),
    direccion TEXT,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_nombre (nombre, apellido),
    INDEX idx_email (email),
    INDEX idx_telefono (telefono)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla: estados_pedido
CREATE TABLE estados_pedido (
    id_estado INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT,
    orden INT NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_orden (orden)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla: pedidos
CREATE TABLE pedidos (
    id_pedido INT AUTO_INCREMENT PRIMARY KEY,
    numero_pedido VARCHAR(50) NOT NULL UNIQUE,
    id_cliente INT NOT NULL,
    id_usuario INT NOT NULL,
    id_estado INT NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    descuento DECIMAL(10,2) DEFAULT 0.00,
    total DECIMAL(10,2) NOT NULL,
    metodo_pago VARCHAR(50),
    fecha_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_entrega DATETIME,
    direccion_entrega TEXT,
    notas TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente) ON DELETE RESTRICT,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE RESTRICT,
    FOREIGN KEY (id_estado) REFERENCES estados_pedido(id_estado) ON DELETE RESTRICT,
    INDEX idx_numero_pedido (numero_pedido),
    INDEX idx_cliente (id_cliente),
    INDEX idx_estado (id_estado),
    INDEX idx_fecha_pedido (fecha_pedido)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla: detalle_pedido
CREATE TABLE detalle_pedido (
    id_detalle INT AUTO_INCREMENT PRIMARY KEY,
    id_pedido INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido) ON DELETE CASCADE,
    FOREIGN KEY (id_producto) REFERENCES productos(id_producto) ON DELETE RESTRICT,
    INDEX idx_pedido (id_pedido),
    INDEX idx_producto (id_producto)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- DATOS INICIALES
-- ============================================

-- Insertar roles por defecto
INSERT INTO roles (nombre, descripcion) VALUES
('Administrador', 'Acceso completo al sistema'),
('Gerente', 'Gestión de ventas y reportes'),
('Vendedor', 'Registro de ventas y pedidos'),
('Almacenero', 'Gestión de inventario');

-- Insertar usuario administrador por defecto
-- Password: admin123 (hasheado con bcrypt)
INSERT INTO usuarios (id_rol, nombre, apellido, email, password) VALUES
(1, 'Admin', 'Sistema', 'admin@smartpyme.com', '$2a$10$xKqXXw5YzJNGqQfLHxEW5u8P7yJGKGZLxVz8W7xK.zMzGQJZvQg0W');

-- Insertar categorías por defecto
INSERT INTO categorias (nombre, descripcion) VALUES
('Pastelería', 'Pasteles, tortas y postres'),
('Panadería', 'Panes y masas'),
('Empanadas', 'Empanadas dulces y saladas'),
('Bebidas', 'Bebidas frías y calientes'),
('Otros', 'Productos varios');

-- Insertar estados de pedido
INSERT INTO estados_pedido (nombre, descripcion, orden) VALUES
('Pendiente', 'Pedido registrado, pendiente de preparación', 1),
('En Preparación', 'Pedido en proceso de preparación', 2),
('Listo', 'Pedido listo para entrega', 3),
('Entregado', 'Pedido entregado al cliente', 4),
('Cancelado', 'Pedido cancelado', 5);

-- Insertar algunos productos de ejemplo
INSERT INTO productos (id_categoria, nombre, descripcion, precio, stock, stock_minimo) VALUES
(1, 'Torta de Chocolate', 'Deliciosa torta de chocolate para 10 personas', 15000.00, 20, 5),
(1, 'Kuchen de Manzana', 'Kuchen casero de manzana para 8 personas', 12000.00, 15, 3),
(2, 'Pan Amasado', 'Pan amasado tradicional', 500.00, 100, 20),
(2, 'Hallulla', 'Hallulla recién horneada', 300.00, 150, 30),
(3, 'Empanada de Queso', 'Empanada de queso horneada', 1200.00, 50, 10),
(4, 'Jugo Natural Naranja', 'Jugo natural de naranja 500ml', 2000.00, 30, 5);

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- FIN DEL SCHEMA
-- ============================================
