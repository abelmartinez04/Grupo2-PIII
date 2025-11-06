// Archivo NUEVO: routes/reporteFacturaRoutes.js

import express from 'express';
// ¡Importamos el nuevo controlador!
import reporteFacturaController from '../controllers/reporteFacturaController.js'; 

const router = express.Router();

/**
 * @route GET /
 * @description Muestra el historial de ventas (con filtros de fecha).
 */
router.get('/', reporteFacturaController.mostrarReporteVentas);

/**
 * @route POST /eliminar/:id
 * @description Marca una venta como 'cancelada' (Soft Delete).
 */
router.post('/eliminar/:id', reporteFacturaController.eliminarVenta);

export default router;