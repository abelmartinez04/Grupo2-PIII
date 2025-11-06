// Archivo: controllers/ventaController.js

import db from '../config/db.js'; // Importar el pool de conexión

const ventaController = {

    /**
     * Muestra el formulario de ventas.
     * Carga los medicamentos (desde v_stock_actual) y los clientes.
     */
    mostrarFormularioVenta: async (req, res) => {
        try {
            // 1. Obtener la lista de medicamentos disponibles
            // Usamos tu vista v_stock_actual, ¡es perfecta para esto!
            const [medicamentos] = await db.query(
                'SELECT id, nombre, precio_venta, stock_total FROM v_stock_actual WHERE stock_total > 0 ORDER BY nombre ASC'
            );

            // 2. Obtener la lista de clientes existentes (similar al PHP)
            const [clientes] = await db.query(
                'SELECT id, nombre_completo, cedula FROM clientes ORDER BY nombre_completo ASC'
            );

            // 3. Renderizar la vista 'ventas.ejs'
            // (Aún no la hemos creado, pero esto es lo que le pasaremos)
            res.render('ventas', {
                medicamentos: medicamentos,
                clientes: clientes,
                user: req.session.user, // Pasar info del usuario para el header/footer
                activePage: 'ventas'
            });

        } catch (error) {
            console.error('Error al mostrar formulario de venta:', error);
            // (Idealmente, renderizar una vista de error)
            res.status(500).send('Error interno del servidor al cargar la página de ventas.');
        }
    },


    /**
     * Registra la nueva venta en la base de datos.
     * Esta es la función compleja que requiere una transacción.
     */
    registrarVenta: async (req, res) => {
        
        let connection; // Definimos la conexión fuera del try para poder usarla en el finally
        
        try {
            // =================================================================
            // PASO 1: OBTENER CONEXIÓN Y DATOS
            // =================================================================
            
            // Obtenemos una conexión del pool
            connection = await db.getConnection(); 
            // Iniciamos la transacción
            await connection.beginTransaction(); 

            const { 
                tipo_cliente, 
                cliente_existente, 
                nombre_cliente_nuevo, 
                cedula_cliente_nuevo, 
                metodo_pago, 
                articulos // Esto debe ser un array de {id, cantidad, precio}
            } = req.body;

            const usuario_id = req.session.user.id; // Obtenemos el ID del cajero desde la sesión

            if (!articulos || !Array.isArray(articulos) || articulos.length === 0) {
                throw new Error('No se puede registrar una venta sin artículos.');
            }

            // =================================================================
            // PASO 2: GESTIONAR EL CLIENTE
            // =================================================================
            let cliente_id_final = null;

            if (tipo_cliente === 'existente' && cliente_existente) {
                // Usar cliente existente
                cliente_id_final = parseInt(cliente_existente, 10);
            } else if (tipo_cliente === 'nuevo' && nombre_cliente_nuevo) {
                // Crear nuevo cliente
                const [resultCliente] = await connection.query(
                    'INSERT INTO clientes (nombre_completo, cedula) VALUES (?, ?)',
                    [nombre_cliente_nuevo, cedula_cliente_nuevo || null]
                );
                cliente_id_final = resultCliente.insertId;
            }
            // Si no es ninguno, cliente_id_final queda NULL (venta a "Cliente General")
            // Esto es válido porque la tabla 'ventas' permite cliente_id NULL.

            // =================================================================
            // PASO 3: CREAR REGISTRO MAESTRO DE VENTA
            // =================================================================
            
            // Insertamos la venta con totales temporales en 0. Los actualizaremos al final.
            const [resultVenta] = await connection.query(
                `INSERT INTO ventas (numero_factura, cliente_id, usuario_id, subtotal, descuento, itbis, total, metodo_pago, estado) 
                 VALUES (?, ?, ?, 0, 0, 0, 0, ?, 'completada')`,
                ['TEMP-000', cliente_id_final, usuario_id, metodo_pago || 'efectivo']
            );
            
            const venta_id = resultVenta.insertId;
            
            // Generamos el número de factura real basado en el ID (Ej: FAC-0000123)
            const numero_factura_final = `FAC-${String(venta_id).padStart(8, '0')}`;
            
            // Actualizamos la venta con su número de factura real
            await connection.query('UPDATE ventas SET numero_factura = ? WHERE id = ?', [numero_factura_final, venta_id]);

            // =================================================================
            // PASO 4: PROCESAR ARTÍCULOS, DESCONTAR DE LOTES (LÓGICA FEFO)
            // =================================================================
            let gran_subtotal = 0;

            for (const item of articulos) {
                const medicamento_id = parseInt(item.id, 10);
                let cantidad_a_vender = parseInt(item.cantidad, 10);
                const precio_unitario_venta = parseFloat(item.precio);

                if (isNaN(medicamento_id) || isNaN(cantidad_a_vender) || isNaN(precio_unitario_venta) || cantidad_a_vender <= 0) {
                    continue; // Saltar item inválido
                }

                // Buscar lotes disponibles para este medicamento
                // Ordenados por fecha_vencimiento ASC (Primero que Vence, Primero que Sale)
                const [lotes] = await connection.query(
                    `SELECT id, cantidad_actual 
                     FROM lotes_medicamentos 
                     WHERE medicamento_id = ? AND cantidad_actual > 0 AND estado = 'disponible'
                     ORDER BY fecha_vencimiento ASC`,
                    [medicamento_id]
                );

                if (lotes.length === 0) {
                    throw new Error(`No hay lotes disponibles para el medicamento ID: ${medicamento_id}`);
                }

                // Recorrer los lotes hasta satisfacer la cantidad_a_vender
                for (const lote of lotes) {
                    if (cantidad_a_vender === 0) break; // Ya completamos este item

                    const lote_id = lote.id;
                    const cantidad_en_lote = lote.cantidad_actual;
                    
                    const cantidad_a_descontar_de_lote = Math.min(cantidad_a_vender, cantidad_en_lote);
                    const nueva_cantidad_lote = cantidad_en_lote - cantidad_a_descontar_de_lote;
                    const nuevo_estado_lote = (nueva_cantidad_lote === 0) ? 'agotado' : 'disponible';

                    // 4.a: Actualizar el inventario del lote
                    await connection.query(
                        'UPDATE lotes_medicamentos SET cantidad_actual = ?, estado = ? WHERE id = ?',
                        [nueva_cantidad_lote, nuevo_estado_lote, lote_id]
                    );

                    // 4.b: Registrar el detalle de la venta (qué lote se usó)
                    const subtotal_item_lote = cantidad_a_descontar_de_lote * precio_unitario_venta;
                    await connection.query(
                        `INSERT INTO detalle_ventas (venta_id, lote_medicamento_id, cantidad, precio_unitario, descuento, subtotal)
                         VALUES (?, ?, ?, ?, 0, ?)`,
                        [venta_id, lote_id, cantidad_a_descontar_de_lote, precio_unitario_venta, subtotal_item_lote]
                    );

                    // 4.c: (Buena Práctica) Registrar el movimiento de inventario
                    await connection.query(
                        `INSERT INTO movimientos_inventario 
                         (tipo_movimiento, lote_medicamento_id, cantidad, cantidad_anterior, cantidad_nueva, usuario_id, referencia_tipo, referencia_id, motivo)
                         VALUES ('salida', ?, ?, ?, ?, ?, 'venta', ?, ?)`,
                        [lote_id, cantidad_a_descontar_de_lote, cantidad_en_lote, nueva_cantidad_lote, usuario_id, venta_id, `Venta ${numero_factura_final}`]
                    );
                    
                    // 4.d: Sumar al total y restar de la cantidad pendiente
                    gran_subtotal += subtotal_item_lote;
                    cantidad_a_vender -= cantidad_a_descontar_de_lote;
                } // Fin del bucle de lotes

                // Si después de revisar todos los lotes aún falta cantidad...
                if (cantidad_a_vender > 0) {
                    // Esto significa que el stock total (v_stock_actual) era incorrecto o hubo una venta simultánea
                    throw new Error(`Stock insuficiente para Medicamento ID: ${medicamento_id}. Se intentó vender ${item.cantidad} pero solo se encontraron ${parseInt(item.cantidad, 10) - cantidad_a_vender}.`);
                }
            } // Fin del bucle de artículos

            // =================================================================
            // PASO 5: ACTUALIZAR TOTALES EN LA VENTA MAESTRA
            // =================================================================
            // (Para este ejemplo, ITBIS y Descuento son 0. Se pueden añadir en el futuro)
            const subtotal_final = gran_subtotal;
            const itbis_final = 0.00; 
            const descuento_final = 0.00;
            const total_final = (subtotal_final + itbis_final) - descuento_final;

            await connection.query(
                'UPDATE ventas SET subtotal = ?, itbis = ?, descuento = ?, total = ? WHERE id = ?',
                [subtotal_final, itbis_final, descuento_final, total_final, venta_id]
            );

            // =================================================================
            // PASO 6: ¡COMMIT! TODO SALIÓ BIEN
            // =================================================================
            await connection.commit();
            console.log(`Venta registrada exitosamente: ID ${venta_id}, Factura ${numero_factura_final}`);

            // =================================================================
            // PASO 7: REDIRIGIR A IMPRIMIR
            // =================================================================
            res.redirect(`/ventas/imprimir/${venta_id}`);

        } catch (error) {
            // =================================================================
            // ERROR: ¡ROLLBACK! ALGO SALIÓ MAL
            // =================================================================
            if (connection) {
                await connection.rollback(); // Revertir todos los cambios de la transacción
            }
            console.error('Error en transacción de venta:', error.message);
            
            // (Idealmente: redirigir a /ventas/nueva con un mensaje de error)
            // Por ahora, enviamos un error 500 claro
            res.status(500).send(`Error al registrar la venta: ${error.message}`);
            
        } finally {
            // =================================================================
            // FINAL: SIEMPRE LIBERAR LA CONEXIÓN
            // =================================================================
            if (connection) {
                connection.release(); // Devolver la conexión al pool
            }
        }
    },


    /**
     * Muestra la factura para imprimir (adaptación de tu imprimir.php)
     */
    mostrarImpresionFactura: async (req, res) => {
        try {
            const facturaId = req.params.id;

            // 1. Obtener datos de la factura (venta)
            const [ventas] = await db.query(
                `SELECT v.*, c.nombre_completo AS cliente_nombre, c.cedula AS cliente_cedula, u.nombre_completo AS usuario_nombre 
                 FROM ventas v 
                 LEFT JOIN clientes c ON v.cliente_id = c.id
                 JOIN usuarios u ON v.usuario_id = u.id
                 WHERE v.id = ?`, [facturaId]
            );

            if (ventas.length === 0) {
                return res.status(404).send('Factura no encontrada');
            }

            // 2. Obtener detalles de la factura
            // Necesitamos el nombre del medicamento desde la tabla 'medicamentos'
            // uniéndolo a través de 'lotes_medicamentos'
            const [detalles] = await db.query(
                `SELECT dv.*, m.nombre AS medicamento_nombre, lm.numero_lote 
                 FROM detalle_ventas dv
                 JOIN lotes_medicamentos lm ON dv.lote_medicamento_id = lm.id
                 JOIN medicamentos m ON lm.medicamento_id = m.id
                 WHERE dv.venta_id = ?`, [facturaId]
            );

            // 3. Renderizar una vista 'factura_imprimir.ejs'
            res.render('facturaImprimir', {
                factura: ventas[0],
                detalles: detalles,
                user: req.session.user
            });

        } catch (error) {
            console.error('Error al mostrar factura para imprimir:', error);
            res.status(500).send('Error interno del servidor al cargar la factura.');
        }
    }
};

export default ventaController;