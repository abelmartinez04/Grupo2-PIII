-- Insertions for farmacia_db
USE farmacia_db;

-- ===========================
-- PROVEEDORES (2 registros)
-- ===========================
INSERT INTO proveedores (nombre, rnc, direccion, telefono, email, contacto_principal, estado, notas)
VALUES
('Distribuidora Médica RD', '131234567', 'Av. Independencia #123, Santo Domingo', '809-555-1234', 'ventas@distmedica.com', 'Carlos Pérez', 'activo', 'Proveedor mayorista local'),
('Farmacéuticos Unidos SRL', '402345678', 'C/ Duarte 45, Santiago', '809-555-5678', 'contacto@farmunidos.com', 'María López', 'activo', 'Especializado en genéricos');

-- ===========================
-- CATEGORÍAS (5 registros)
-- ===========================
INSERT INTO categorias (nombre, descripcion)
VALUES
('Analgésicos', 'Medicamentos para el alivio del dolor'),
('Antibióticos', 'Medicamentos para infecciones bacterianas'),
('Antihipertensivos', 'Medicamentos para control de la presión arterial'),
('Antidiabéticos', 'Medicamentos para control de glucosa'),
('Gastroprotector', 'Medicamentos para protección gástrica');

-- ===========================
-- UBICACIONES (10 registros)
-- ===========================
INSERT INTO ubicaciones (codigo, descripcion, seccion, nivel)
VALUES
('A1-01', 'Estante A1, Nivel 1', 'A', '1'),
('A1-02', 'Estante A1, Nivel 2', 'A', '2'),
('A1-03', 'Estante A1, Nivel 3', 'A', '3'),
('A2-01', 'Estante A2, Nivel 1', 'A', '1'),
('A2-02', 'Estante A2, Nivel 2', 'A', '2'),
('A2-03', 'Estante A2, Nivel 3', 'A', '3'),
('B1-01', 'Estante B1, Nivel 1', 'B', '1'),
('B1-02', 'Estante B1, Nivel 2', 'B', '2'),
('B1-03', 'Estante B1, Nivel 3', 'B', '3'),
('B2-01', 'Estante B2, Nivel 1', 'B', '1');

-- ===========================
-- MEDICAMENTOS (10 registros)
-- Notas: Los nombres elegidos son medicamentos de uso común en RD.
-- Asegúrate de tener las categorías creadas (ids 1..5 en este script).
-- ===========================
INSERT INTO medicamentos (nombre, nombre_generico, descripcion, categoria_id, codigo_barras, registro_sanitario, precio_compra, precio_venta, stock_minimo, requiere_receta, estado)
VALUES
('Paracetamol 500 mg', 'Paracetamol', 'Analgésico y antipirético de uso común', 1, '7890000000011', 'RS-PA-2024-0001', 20.00, 35.00, 20, FALSE, 'activo'),
('Ibuprofeno 400 mg', 'Ibuprofeno', 'Antiinflamatorio no esteroideo', 1, '7890000000028', 'RS-IB-2024-0002', 25.00, 45.00, 15, FALSE, 'activo'),
('Amoxicilina 500 mg', 'Amoxicilina', 'Antibiótico de amplio espectro', 2, '7890000000035', 'RS-AM-2024-0003', 40.00, 70.00, 10, TRUE, 'activo'),
('Amoxicilina/Ácido Clavulánico 500/125 mg', 'Amoxicilina + Ác. Clavulánico', 'Antibiótico combinado', 2, '7890000000042', 'RS-AC-2024-0004', 80.00, 130.00, 10, TRUE, 'activo'),
('Amlodipina 5 mg', 'Amlodipino', 'Antihipertensivo (bloqueador de canales de calcio)', 3, '7890000000059', 'RS-AML-2024-0005', 10.00, 25.00, 10, FALSE, 'activo'),
('Metformina 850 mg', 'Metformina', 'Antidiabético oral', 4, '7890000000066', 'RS-MET-2024-0006', 8.00, 20.00, 15, TRUE, 'activo'),
('Omeprazol 20 mg', 'Omeprazol', 'Inhibidor de bomba de protones (gastroprotector)', 5, '7890000000073', 'RS-OME-2024-0007', 12.00, 30.00, 10, FALSE, 'activo'),
('Loratadina 10 mg', 'Loratadina', 'Antihistamínico para alergias', 1, '7890000000080', 'RS-LOR-2024-0008', 6.00, 18.00, 10, FALSE, 'activo'),
('Salbutamol Inhalador 100 mcg', 'Salbutamol', 'Broncodilatador para asma', 1, '7890000000097', 'RS-SAL-2024-0009', 150.00, 250.00, 5, TRUE, 'activo'),
('Atorvastatina 20 mg', 'Atorvastatina', 'Hipolipemiante para control de colesterol', 3, '7890000000103', 'RS-ATO-2024-0010', 30.00, 75.00, 10, TRUE, 'activo');

-- ===========================
-- LOTES_MEDICAMENTOS (10 registros) -- 1 lote por medicamento
-- Se asignan proveedor_id = 1 o 2 y ubicacion_id = 1..10
-- ===========================
INSERT INTO lotes_medicamentos (medicamento_id, numero_lote, fecha_fabricacion, fecha_vencimiento, cantidad_inicial, cantidad_actual, proveedor_id, ubicacion_id, fecha_ingreso, costo_unitario, estado)
VALUES
(1, 'LOT-2025-001', '2024-10-01', '2026-10-01', 200, 200, 1, 1, CURDATE(), 20.00, 'disponible'),
(2, 'LOT-2025-002', '2024-09-15', '2026-09-15', 150, 150, 1, 2, CURDATE(), 25.00, 'disponible'),
(3, 'LOT-2025-003', '2024-08-20', '2025-12-31', 100, 100, 1, 3, CURDATE(), 40.00, 'disponible'),
(4, 'LOT-2025-004', '2024-07-10', '2026-07-10', 80, 80, 2, 4, CURDATE(), 80.00, 'disponible'),
(5, 'LOT-2025-005', '2024-06-05', '2026-06-05', 120, 120, 2, 5, CURDATE(), 10.00, 'disponible'),
(6, 'LOT-2025-006', '2024-05-01', '2026-05-01', 200, 200, 2, 6, CURDATE(), 8.00, 'disponible'),
(7, 'LOT-2025-007', '2024-04-12', '2026-04-12', 90, 90, 1, 7, CURDATE(), 12.00, 'disponible'),
(8, 'LOT-2025-008', '2024-03-22', '2026-03-22', 140, 140, 1, 8, CURDATE(), 6.00, 'disponible'),
(9, 'LOT-2025-009', '2024-02-18', '2025-11-30', 60, 60, 2, 9, CURDATE(), 150.00, 'disponible'),
(10, 'LOT-2025-010', '2024-01-10', '2026-01-10', 110, 110, 2, 10, CURDATE(), 30.00, 'disponible');

-- Fin del archivo
