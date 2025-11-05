// models/Medicamento.js
import db from '../config/db.js';

export const Medicamento = {
  async findAll() {
    const [rows] = await db.query(`
      SELECT 
        m.id,
        m.nombre,
        m.nombre_generico,
        c.nombre AS categoria,
        COALESCE(SUM(lm.cantidad_actual), 0) AS stock_total,
        m.stock_minimo,
        CASE 
            WHEN COALESCE(SUM(lm.cantidad_actual), 0) = 0 THEN 'Agotado'
            WHEN COALESCE(SUM(lm.cantidad_actual), 0) <= m.stock_minimo THEN 'Stock Bajo'
            ELSE 'Disponible'
        END AS estado_stock,
        m.precio_venta
      FROM medicamentos m
      LEFT JOIN lotes_medicamentos lm ON m.id = lm.medicamento_id AND lm.estado = 'disponible'
      LEFT JOIN categorias c ON m.categoria_id = c.id
      WHERE m.estado = 'activo'
      GROUP BY m.id, m.nombre, m.nombre_generico, c.nombre, m.stock_minimo, m.precio_venta
    `);
    return rows.map(r => ({
      ...r,
      precio_venta: parseFloat(r.precio_venta) || 0,
      precio_compra: parseFloat(r.precio_compra) || 0,
    }));
  },

  async findById(id) {
  const [rows] = await db.query(`
    SELECT 
      m.id,
      m.nombre,
      m.nombre_generico,
      m.descripcion,
      m.categoria_id,
      c.nombre AS categoria,
      m.precio_compra,
      m.precio_venta,
      m.stock_minimo,
      m.requiere_receta,
      lm.numero_lote,
      lm.cantidad_actual AS cantidad,
      lm.proveedor_id,
      lm.fecha_vencimiento
    FROM medicamentos m
    LEFT JOIN categorias c ON m.categoria_id = c.id
    LEFT JOIN lotes_medicamentos lm 
      ON lm.medicamento_id = m.id 
      AND lm.estado = 'disponible'
    WHERE m.id = ?
    LIMIT 1
  `, [id]);

  return rows[0] || null;
},


  async create(data) {
    const {
      nombre,
      nombre_generico = null,
      descripcion = null,
      categoria_id = null,
      codigo_barras = null,
      registro_sanitario = null,
      precio_compra = 0,
      precio_venta = 0,
      stock_minimo = 10,
      requiere_receta = 0
    } = data;

    const [result] = await db.query(
      `INSERT INTO medicamentos 
       (nombre, nombre_generico, descripcion, categoria_id, codigo_barras, registro_sanitario, precio_compra, precio_venta, stock_minimo, requiere_receta, estado)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'activo')`,
      [nombre, nombre_generico, descripcion, categoria_id, codigo_barras, registro_sanitario, precio_compra, precio_venta, stock_minimo, requiere_receta]
    );

    return this.findById(result.insertId);
  },

  async createConLote(data) {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      // 1️⃣ Crear medicamento
      const {
        nombre,
        nombre_generico = null,
        descripcion = null,
        categoria_id = null,
        codigo_barras = null,
        registro_sanitario = null,
        precio_compra = 0,
        precio_venta = 0,
        stock_minimo = 10,
        requiere_receta = 0,
        numero_lote,
        cantidad,
        proveedor_id,
        fecha_vencimiento
      } = data;

      const [medResult] = await conn.query(
        `INSERT INTO medicamentos 
         (nombre, nombre_generico, descripcion, categoria_id, codigo_barras, registro_sanitario, 
          precio_compra, precio_venta, stock_minimo, requiere_receta, estado)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'activo')`,
        [nombre, nombre_generico, descripcion, categoria_id, codigo_barras, registro_sanitario,
         precio_compra, precio_venta, stock_minimo, requiere_receta]
      );

      const medicamentoId = medResult.insertId;

      // 2️⃣ Crear lote vinculado
      await conn.query(
        `INSERT INTO lotes_medicamentos 
        (medicamento_id, numero_lote, cantidad_inicial, cantidad_actual, proveedor_id, fecha_vencimiento, fecha_ingreso, estado)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'disponible')`,
        [medicamentoId, numero_lote, cantidad, cantidad, proveedor_id, fecha_vencimiento, new Date()]
      );

      await conn.commit();

      return await this.findById(medicamentoId);
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  },


  async update(id, fields) {
    const allowed = [
      'nombre',
      'nombre_generico',
      'descripcion',
      'categoria_id',
      'codigo_barras',
      'registro_sanitario',
      'precio_compra',
      'precio_venta',
      'stock_minimo',
      'requiere_receta',
      'estado'
    ];

    const keys = Object.keys(fields).filter(k => allowed.includes(k));
    if (keys.length === 0) return null;

    const set = keys.map(k => `${k} = ?`).join(', ');
    const values = keys.map(k => fields[k]);
    values.push(id);

    const [result] = await db.query(`UPDATE medicamentos SET ${set} WHERE id = ?`, values);
    if (result.affectedRows === 0) return null;
    return this.findById(id);
  },

  async delete(id) {
    const [result] = await db.query("DELETE FROM medicamentos WHERE id = ?", [id]);
    return result.affectedRows > 0;
  }
};
