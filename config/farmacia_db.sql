-- ====================================================
-- BASE DE DATOS: farmacia_db
-- ====================================================

CREATE DATABASE IF NOT EXISTS farmacia_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE farmacia_db;
-- ====================================================
-- TABLA: roles / Descripción: Define los roles del sistema
-- ====================================================
CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================
-- TABLA: usuarios / Descripción: Gestión de usuarios del sistema con diferentes niveles de acceso
-- ====================================================
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_completo VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol_id INT NOT NULL,
    telefono VARCHAR(20),
    estado ENUM('activo', 'inactivo', 'suspendido') DEFAULT 'activo',
    ultimo_acceso TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (rol_id) REFERENCES roles(id) ON DELETE RESTRICT,
    INDEX idx_email (email),
    INDEX idx_username (username),
    INDEX idx_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================
-- TABLA: proveedores / Descripción: Información de proveedores de medicamentos
-- ====================================================
CREATE TABLE proveedores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    rnc VARCHAR(20) UNIQUE,
    direccion TEXT,
    telefono VARCHAR(20),
    email VARCHAR(100),
    contacto_principal VARCHAR(100),
    estado ENUM('activo', 'inactivo') DEFAULT 'activo',
    notas TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_nombre (nombre),
    INDEX idx_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================
-- TABLA: categorias / Descripción: Categorías de medicamentos (antibióticos, analgésicos, etc.)
-- ====================================================
CREATE TABLE categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================
-- TABLA: ubicaciones / Descripción: Ubicaciones físicas en el almacén
-- ====================================================
CREATE TABLE ubicaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    descripcion VARCHAR(100),
    seccion VARCHAR(50),
    nivel VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_codigo (codigo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================
-- TABLA: medicamentos / Descripción: Catálogo principal de medicamentos
-- ====================================================
CREATE TABLE medicamentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    nombre_generico VARCHAR(200),
    descripcion TEXT,
    categoria_id INT,
    codigo_barras VARCHAR(50) UNIQUE,
    registro_sanitario VARCHAR(50),
    precio_compra DECIMAL(10, 2) NOT NULL,
    precio_venta DECIMAL(10, 2) NOT NULL,
    stock_minimo INT DEFAULT 10,
    requiere_receta BOOLEAN DEFAULT FALSE,
    estado ENUM('activo', 'inactivo', 'descontinuado') DEFAULT 'activo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE SET NULL,
    INDEX idx_nombre (nombre),
    INDEX idx_codigo_barras (codigo_barras),
    INDEX idx_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================
-- TABLA: lotes_medicamentos /  Descripción: Control de lotes individuales con fecha de vencimiento
-- ====================================================
CREATE TABLE lotes_medicamentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    medicamento_id INT NOT NULL,
    numero_lote VARCHAR(50) NOT NULL,
    fecha_fabricacion DATE,
    fecha_vencimiento DATE NOT NULL,
    cantidad_inicial INT NOT NULL,
    cantidad_actual INT NOT NULL,
    proveedor_id INT,
    ubicacion_id INT,
    fecha_ingreso DATE NOT NULL,
    costo_unitario DECIMAL(10, 2),
    estado ENUM('disponible', 'proximo_vencer', 'vencido', 'agotado') DEFAULT 'disponible',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (medicamento_id) REFERENCES medicamentos(id) ON DELETE CASCADE,
    FOREIGN KEY (proveedor_id) REFERENCES proveedores(id) ON DELETE SET NULL,
    FOREIGN KEY (ubicacion_id) REFERENCES ubicaciones(id) ON DELETE SET NULL,
    INDEX idx_numero_lote (numero_lote),
    INDEX idx_fecha_vencimiento (fecha_vencimiento),
    INDEX idx_estado (estado),
    INDEX idx_medicamento (medicamento_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================
-- TABLA: clientes / Descripción: Información de clientes (opcional para programa de fidelización futuro)
-- ====================================================
CREATE TABLE clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_completo VARCHAR(100) NOT NULL,
    cedula VARCHAR(20) UNIQUE,
    telefono VARCHAR(20),
    email VARCHAR(100),
    direccion TEXT,
    fecha_nacimiento DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_cedula (cedula)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================
-- TABLA: ventas / Descripción: Registro de ventas realizadas
-- ====================================================
CREATE TABLE ventas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero_factura VARCHAR(50) NOT NULL UNIQUE,
    fecha_venta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    cliente_id INT NULL,
    usuario_id INT NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    descuento DECIMAL(10, 2) DEFAULT 0.00,
    itbis DECIMAL(10, 2) DEFAULT 0.00,
    total DECIMAL(10, 2) NOT NULL,
    metodo_pago ENUM('efectivo', 'tarjeta', 'transferencia', 'mixto') DEFAULT 'efectivo',
    estado ENUM('completada', 'cancelada', 'pendiente') DEFAULT 'completada',
    notas TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE SET NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
    INDEX idx_numero_factura (numero_factura),
    INDEX idx_fecha_venta (fecha_venta),
    INDEX idx_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================
-- TABLA: detalle_ventas / Descripción: Detalle de productos vendidos en cada venta
-- ====================================================
CREATE TABLE detalle_ventas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    venta_id INT NOT NULL,
    lote_medicamento_id INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10, 2) NOT NULL,
    descuento DECIMAL(10, 2) DEFAULT 0.00,
    subtotal DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (venta_id) REFERENCES ventas(id) ON DELETE CASCADE,
    FOREIGN KEY (lote_medicamento_id) REFERENCES lotes_medicamentos(id) ON DELETE RESTRICT,
    INDEX idx_venta (venta_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================
-- TABLA: compras / Descripción: Registro de compras a proveedores
-- ====================================================
CREATE TABLE compras (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero_orden VARCHAR(50) NOT NULL UNIQUE,
    proveedor_id INT NOT NULL,
    usuario_id INT NOT NULL,
    fecha_compra DATE NOT NULL,
    fecha_entrega_estimada DATE,
    fecha_entrega_real DATE,
    subtotal DECIMAL(10, 2) NOT NULL,
    itbis DECIMAL(10, 2) DEFAULT 0.00,
    total DECIMAL(10, 2) NOT NULL,
    estado ENUM('pendiente', 'recibida', 'cancelada') DEFAULT 'pendiente',
    notas TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (proveedor_id) REFERENCES proveedores(id) ON DELETE RESTRICT,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
    INDEX idx_numero_orden (numero_orden),
    INDEX idx_fecha_compra (fecha_compra),
    INDEX idx_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================
-- TABLA: detalle_compras / Descripción: Detalle de medicamentos en cada compra
-- ====================================================
CREATE TABLE detalle_compras (
    id INT AUTO_INCREMENT PRIMARY KEY,
    compra_id INT NOT NULL,
    medicamento_id INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (compra_id) REFERENCES compras(id) ON DELETE CASCADE,
    FOREIGN KEY (medicamento_id) REFERENCES medicamentos(id) ON DELETE RESTRICT,
    INDEX idx_compra (compra_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================
-- TABLA: alertas / Descripción: Sistema de alertas automáticas
-- ====================================================
CREATE TABLE alertas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo ENUM('vencimiento', 'stock_bajo', 'stock_critico', 'vencido') NOT NULL,
    prioridad ENUM('baja', 'media', 'alta', 'critica') DEFAULT 'media',
    medicamento_id INT,
    lote_medicamento_id INT,
    titulo VARCHAR(200) NOT NULL,
    mensaje TEXT NOT NULL,
    fecha_generacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado ENUM('activa', 'leida', 'resuelta', 'ignorada') DEFAULT 'activa',
    usuario_asignado_id INT,
    fecha_resolucion TIMESTAMP NULL,
    FOREIGN KEY (medicamento_id) REFERENCES medicamentos(id) ON DELETE CASCADE,
    FOREIGN KEY (lote_medicamento_id) REFERENCES lotes_medicamentos(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_asignado_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_tipo (tipo),
    INDEX idx_estado (estado),
    INDEX idx_prioridad (prioridad),
    INDEX idx_fecha (fecha_generacion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================
-- TABLA: movimientos_inventario /  Descripción: Historial completo de movimientos de inventario
-- ====================================================
CREATE TABLE movimientos_inventario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo_movimiento ENUM('entrada', 'salida', 'ajuste', 'devolucion', 'merma') NOT NULL,
    lote_medicamento_id INT NOT NULL,
    cantidad INT NOT NULL,
    cantidad_anterior INT NOT NULL,
    cantidad_nueva INT NOT NULL,
    usuario_id INT NOT NULL,
    referencia_tipo ENUM('venta', 'compra', 'ajuste_manual', 'otro'),
    referencia_id INT,
    motivo TEXT,
    fecha_movimiento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lote_medicamento_id) REFERENCES lotes_medicamentos(id) ON DELETE RESTRICT,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
    INDEX idx_tipo (tipo_movimiento),
    INDEX idx_fecha (fecha_movimiento),
    INDEX idx_lote (lote_medicamento_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================
-- TABLA: auditoria / Descripción: Registro de auditoría de acciones del sistema
-- ====================================================
CREATE TABLE auditoria (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    accion VARCHAR(100) NOT NULL,
    tabla_afectada VARCHAR(50),
    registro_id INT,
    datos_anteriores JSON,
    datos_nuevos JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    fecha_accion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_usuario (usuario_id),
    INDEX idx_fecha (fecha_accion),
    INDEX idx_tabla (tabla_afectada)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================
-- INSERCIÓN DE DATOS INICIALES
-- ====================================================

-- Roles del sistema
INSERT INTO roles (nombre, descripcion) VALUES
('Administrador', 'Control total del sistema'),
('Gerente', 'Supervisión de reportes y operaciones'),
('Empleado', 'Encargado de inventario y registro de medicamentos'),
('Cajero', 'Registro de ventas');

-- Usuarios por defecto (uno por cada rol)
-- IMPORTANTE: Estos son hashes de ejemplo. En producción, genera hashes reales con bcrypt
-- Todos usan la contraseña temporal: "temp123" para pruebas

INSERT INTO usuarios (nombre_completo, email, username, password_hash, rol_id, telefono, estado) VALUES
-- Administrador (Rol 1)
('Abel Martinez', 'abel04@farmaciasalud.com', 'admin', '$2b$10$rXjz5Y5XQ5z5Y5XQ5z5Y5uN1Y5XQ5z5Y5XQ5z5Y5XQ5z5Y5XQ5z5Y5', 1, '809-555-0001', 'activo')

-- ====================================================
-- VISTAS ÚTILES
-- ====================================================

-- Vista: Stock actual por medicamento
CREATE VIEW v_stock_actual AS
SELECT 
    m.id,
    m.nombre,
    m.nombre_generico,
    c.nombre AS categoria,
    SUM(lm.cantidad_actual) AS stock_total,
    m.stock_minimo,
    CASE 
        WHEN SUM(lm.cantidad_actual) = 0 THEN 'Agotado'
        WHEN SUM(lm.cantidad_actual) <= m.stock_minimo THEN 'Stock Bajo'
        ELSE 'Disponible'
    END AS estado_stock,
    m.precio_venta
FROM medicamentos m
LEFT JOIN lotes_medicamentos lm ON m.id = lm.medicamento_id AND lm.estado = 'disponible'
LEFT JOIN categorias c ON m.categoria_id = c.id
WHERE m.estado = 'activo'
GROUP BY m.id, m.nombre, m.nombre_generico, c.nombre, m.stock_minimo, m.precio_venta;

-- Vista: Medicamentos próximos a vencer (30 días)
CREATE VIEW v_proximos_vencer AS
SELECT 
    m.nombre,
    lm.numero_lote,
    lm.fecha_vencimiento,
    lm.cantidad_actual,
    DATEDIFF(lm.fecha_vencimiento, CURDATE()) AS dias_restantes,
    u.descripcion AS ubicacion,
    p.nombre AS proveedor
FROM lotes_medicamentos lm
JOIN medicamentos m ON lm.medicamento_id = m.id
LEFT JOIN ubicaciones u ON lm.ubicacion_id = u.id
LEFT JOIN proveedores p ON lm.proveedor_id = p.id
WHERE lm.fecha_vencimiento BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)
    AND lm.cantidad_actual > 0
ORDER BY lm.fecha_vencimiento ASC;

-- ====================================================
-- STORED PROCEDURES
-- ====================================================

DELIMITER //

-- Procedimiento: Registrar venta y actualizar inventario
CREATE PROCEDURE sp_registrar_venta(
    IN p_usuario_id INT,
    IN p_cliente_id INT,
    IN p_items JSON,
    IN p_metodo_pago VARCHAR(20),
    OUT p_venta_id INT,
    OUT p_numero_factura VARCHAR(50)
)
BEGIN
    DECLARE v_subtotal DECIMAL(10,2) DEFAULT 0;
    DECLARE v_total DECIMAL(10,2) DEFAULT 0;
    DECLARE v_contador INT DEFAULT 0;
    
    START TRANSACTION;
    
    -- Generar número de factura
    SET p_numero_factura = CONCAT('FAC-', LPAD((SELECT COALESCE(MAX(id), 0) + 1 FROM ventas), 8, '0'));
    
    -- Insertar venta
    INSERT INTO ventas (numero_factura, cliente_id, usuario_id, subtotal, total, metodo_pago)
    VALUES (p_numero_factura, p_cliente_id, p_usuario_id, 0, 0, p_metodo_pago);
    
    SET p_venta_id = LAST_INSERT_ID();
    
    -- Aquí se procesarían los items del JSON y se actualizaría el inventario
    -- (Implementación completa requeriría iteración del JSON)
    
    COMMIT;
END //

DELIMITER ;

-- ====================================================
-- TRIGGERS
-- ====================================================

DELIMITER //

-- Trigger: Generar alerta de stock bajo
CREATE TRIGGER trg_alerta_stock_bajo
AFTER UPDATE ON lotes_medicamentos
FOR EACH ROW
BEGIN
    DECLARE v_stock_total INT;
    DECLARE v_stock_minimo INT;
    DECLARE v_nombre_medicamento VARCHAR(200);
    
    SELECT SUM(cantidad_actual), m.stock_minimo, m.nombre
    INTO v_stock_total, v_stock_minimo, v_nombre_medicamento
    FROM lotes_medicamentos lm
    JOIN medicamentos m ON lm.medicamento_id = m.id
    WHERE lm.medicamento_id = NEW.medicamento_id
        AND lm.estado = 'disponible'
    GROUP BY m.stock_minimo, m.nombre;
    
    IF v_stock_total <= v_stock_minimo THEN
        INSERT INTO alertas (tipo, prioridad, medicamento_id, titulo, mensaje)
        VALUES (
            'stock_bajo',
            'alta',
            NEW.medicamento_id,
            CONCAT('Stock bajo: ', v_nombre_medicamento),
            CONCAT('El medicamento ', v_nombre_medicamento, ' tiene solo ', v_stock_total, ' unidades disponibles. Stock mínimo: ', v_stock_minimo)
        );
    END IF;
END //

DELIMITER ;
