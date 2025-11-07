// Archivo: routes/ventaRoutes.js

import express from 'express';
import ventaController from '../controllers/ventaController.js';
// (Opcional) Aquí podrías importar tu middleware que verifica si el usuario está logueado
// import { isLoggedIn } from '../middleware/auth.js';

const router = express.Router();

// ---- RUTAS PÚBLICAS (Ejemplo) ----
// (No parece haber rutas públicas para ventas)

// ---- RUTAS PROTEGIDAS (Requieren Login) ----
// Usaríamos el middleware así: router.get('/nueva', isLoggedIn, ventaController.mostrarFormularioVenta);
// Por ahora, lo dejo comentado para simplificar.

/**
 * @route GET /ventas/
 * @description Muestra el formulario para crear una nueva venta.
 * (Nota: La ruta base es '/' porque en index.js ya pusimos '/ventas')
 */
router.get('/', ventaController.mostrarFormularioVenta);

/**
 * @route POST /ventas/
 * @description Recibe los datos del formulario para registrar la venta.
 */
router.post('/', ventaController.registrarVenta);

/**
 * @route GET /ventas/imprimir/:id
 * @description Muestra la vista de impresión para una factura específica.
 */
router.get('/imprimir/:id', ventaController.mostrarImpresionFactura);

export default router;