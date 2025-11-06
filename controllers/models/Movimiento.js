// models/Movimiento.js
import pool from "../config/db.js"; // Debes tener pool exportado desde config/db.js

class Movimiento {
  /**
   * Obtener historial de movimientos con filtros opcionales.
   * filtros = { fecha_desde: 'YYYY-MM-DD' | null, fecha_hasta: 'YYYY-MM-DD' | null, tipo_movimiento: 'entrada'|'salida'|...|'todos' }
   *
   * Retorna rows con:
   *  id, fecha_movimiento, usuario (nombre_completo), tipo_movimiento, lote_id, numero_lote,
   *  medicamento_id, nombre_medicamento, cantidad, cantidad_anterior, cantidad_nueva, referencia_tipo, referencia_id, motivo
   */
  static async obtenerHistorial(filtros = {}) {
    try {
      let query = `
        SELECT
          mi.id,
          mi.fecha_movimiento,
          u.id AS usuario_id,
          u.nombre_completo AS usuario,
          mi.tipo_movimiento,
          mi.lote_medicamento_id AS lote_id,
          lm.numero_lote,
          m.id AS medicamento_id,
          m.nombre AS nombre_medicamento,
          mi.cantidad,
          mi.cantidad_anterior,
          mi.cantidad_nueva,
          mi.referencia_tipo,
          mi.referencia_id,
          mi.motivo
        FROM movimientos_inventario mi
        LEFT JOIN lotes_medicamentos lm ON mi.lote_medicamento_id = lm.id
        LEFT JOIN medicamentos m ON lm.medicamento_id = m.id
        LEFT JOIN usuarios u ON mi.usuario_id = u.id
        WHERE 1=1
      `;

      const params = [];

      // Fecha: manejamos fechas tipo 'YYYY-MM-DD' (si fecha_hasta existe agregamos 23:59:59)
      if (filtros.fecha_desde && filtros.fecha_hasta) {
        // Aseguramos incluir todo el día de fecha_hasta
        const desde = `${filtros.fecha_desde} 00:00:00`;
        const hasta = filtros.fecha_hasta.includes(" ") ? filtros.fecha_hasta : `${filtros.fecha_hasta} 23:59:59`;
        query += " AND mi.fecha_movimiento BETWEEN ? AND ?";
        params.push(desde, hasta);
      } else if (filtros.fecha_desde) {
        query += " AND mi.fecha_movimiento >= ?";
        params.push(`${filtros.fecha_desde} 00:00:00`);
      } else if (filtros.fecha_hasta) {
        query += " AND mi.fecha_movimiento <= ?";
        params.push(filtros.fecha_hasta.includes(" ") ? filtros.fecha_hasta : `${filtros.fecha_hasta} 23:59:59`);
      }

      // Tipo de movimiento
      if (filtros.tipo_movimiento && filtros.tipo_movimiento !== "todos") {
        query += " AND mi.tipo_movimiento = ?";
        params.push(filtros.tipo_movimiento);
      }

      // Orden descendente por fecha
      query += " ORDER BY mi.fecha_movimiento DESC, mi.id DESC";

      const [rows] = await pool.query(query, params);
      return rows;
    } catch (error) {
      console.error("Movimiento.obtenerHistorial:", error);
      throw error;
    }
  }
}

export default Movimiento;
