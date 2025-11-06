// controllers/movimientosController.js
import Movimiento from "../models/Movimiento.js";

/**
 * Renderiza la vista inicial del historial de movimientos.
 * Carga el historial sin filtros (o con filtros por defecto).
 */
export const getHistorial = async (req, res) => {
try {
    // Filtros por defecto (vacíos => trae todo)
    const filtros = {
    fecha_desde: null,
    fecha_hasta: null,
      tipo_movimiento: "todos" // 'todos' trae todos los tipos
    };

    const historial = await Movimiento.obtenerHistorial(filtros);

    // Renderiza la vista EJS: views/movimientos/historial.ejs
    // Proporcionamos historial y filtros actuales para la UI
    res.render("movimientos/historial", { historial, filtros });
} catch (error) {
    console.error("getHistorial:", error);
    res.status(500).send("Error al cargar el historial de movimientos");
}
};

/**
 * Maneja peticiones AJAX/POST para filtrar el historial.
 * Espera body con: fecha_desde, fecha_hasta, tipo_movimiento
 * Devuelve JSON { historial: [...] }
 */
export const filtrarHistorial = async (req, res) => {
try {
    const { fecha_desde, fecha_hasta, tipo_movimiento } = req.body;

    const filtros = {
fecha_desde: fecha_desde || null,
fecha_hasta: fecha_hasta || null,
tipo_movimiento: tipo_movimiento || "todos"
    };

    const historialFiltrado = await Movimiento.obtenerHistorial(filtros);

    return res.json({ historial: historialFiltrado });
} catch (error) {
    console.error("filtrarHistorial:", error);
    return res.status(500).json({ error: "Error al filtrar historial" });
}
};

