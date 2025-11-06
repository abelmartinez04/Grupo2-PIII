// Archivo NUEVO: controllers/reporteFacturaController.js

import db from '../config/db.js';

// ... (todas las funciones auxiliares de fecha van aquí: formatToSQLDate, formatToFriendlyDate, getTodaySQL) ...
function formatToSQLDate(dateStr) {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toISOString().split('T')[0];
}
function formatToFriendlyDate(dateStr) {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('es-DO');
}
function getTodaySQL() {
    return new Date().toISOString().split('T')[0];
}


const reporteFacturaController = {

    mostrarReporteVentas: async (req, res) => {
        try {
            // ... (TODA la lógica de 'mostrarReporteVentas' que te pasé antes va aquí) ...
            let { fecha_desde, fecha_hasta } = req.query;
            if (!fecha_desde) fecha_desde = getTodaySQL();
            if (!fecha_hasta) fecha_hasta = getTodaySQL();
            const params = [`${fecha_desde} 00:00:00`, `${fecha_hasta} 23:59:59`];
            
            const queryVentas = `
                SELECT 
                    v.id, v.numero_factura, v.fecha_venta, v.total, v.estado,
                    COALESCE(c.nombre_completo, 'Cliente General') AS cliente_nombre
                FROM ventas v
                LEFT JOIN clientes c ON v.cliente_id = c.id
                WHERE v.estado = 'completada'
                  AND v.fecha_venta BETWEEN ? AND ?
                ORDER BY v.fecha_venta DESC;
            `;
            const [ventas] = await db.query(queryVentas, params);

            const queryResumen = `
                SELECT 
                    COUNT(*) AS total_facturas, 
                    COALESCE(SUM(total), 0) AS total_cobrado
                FROM ventas
                WHERE estado = 'completada'
                  AND fecha_venta BETWEEN ? AND ?;
            `;
            const [resumenRows] = await db.query(queryResumen, params);
            const resumen = resumenRows[0];
            
            // ¡¡CAMBIO IMPORTANTE!! -> renderiza el nuevo nombre de la vista
            res.render('reporteFacturas', {
                ventas: ventas,
                resumen: resumen,
                filtros: {
                    fecha_desde: fecha_desde,
                    fecha_hasta: fecha_hasta,
                    fecha_desde_amigable: formatToFriendlyDate(fecha_desde),
                    fecha_hasta_amigable: formatToFriendlyDate(fecha_hasta)
                },
                activePage: 'reportes', // Dejamos esto para que 'Reportes' se ilumine en el menú
                user: req.session.user
            });

        } catch (error) {
            console.error('Error al cargar el reporte de facturas:', error);
            res.status(500).send('Error interno del servidor al cargar el reporte.');
        }
    },

    eliminarVenta: async (req, res) => {
        const { id } = req.params;
        try {
            await db.query(
                "UPDATE ventas SET estado = 'cancelada' WHERE id = ?", 
                [id]
            );
            
            // ¡¡CAMBIO IMPORTANTE!! -> redirige a la nueva ruta
            res.redirect('/reporte-facturas');

        } catch (error) {
            console.error('Error al eliminar la venta:', error);
            res.status(500).send('Error interno del servidor al eliminar la venta.');
        }
    }
};

export default reporteFacturaController;