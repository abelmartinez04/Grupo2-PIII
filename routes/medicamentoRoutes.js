import express from 'express';
import db from '../config/db.js';

const router = express.Router();

// Listar todos los medicamentos
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM medicamentos');
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Error en la base de datos' });
  }
});

// Obtener 1 medicamento
router.get('/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const [rows] = await db.query('SELECT * FROM medicamentos WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ success: false, error: 'No encontrado' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Error en la base de datos' });
  }
});

// Crear medicamento
router.post('/', async (req, res) => {
  const {
    nombre,
    nombre_generico = null,
    descripcion = null,
    categoria_id = null,
    codigo_barras = null,
    registro_sanitario = null,
    precio_compra,
    precio_venta,
    stock_minimo = 10,
    requiere_receta = 0
  } = req.body;

  if (!nombre || precio_compra == null || precio_venta == null) {
    return res.status(400).json({ success: false, error: 'Campos requeridos: nombre, precio_compra, precio_venta' });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO medicamentos (nombre, nombre_generico, descripcion, categoria_id, codigo_barras, registro_sanitario, precio_compra, precio_venta, stock_minimo, requiere_receta)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nombre, nombre_generico, descripcion, categoria_id, codigo_barras, registro_sanitario, precio_compra, precio_venta, stock_minimo, requiere_receta]
    );

    const insertedId = result.insertId;
    const [rows] = await db.query('SELECT * FROM medicamentos WHERE id = ?', [insertedId]);
    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    console.error(err);
    if (err.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ success: false, error: 'Entrada duplicada (codigo_barras?)' });
    } else {
      res.status(500).json({ success: false, error: 'Error en la base de datos' });
    }
  }
});

// Actualizar medicamento
router.put('/:id', async (req, res) => {
  const id = req.params.id;
  const fields = req.body;

  // Construir SET dinámico
  const allowed = ['nombre','nombre_generico','descripcion','categoria_id','codigo_barras','registro_sanitario','precio_compra','precio_venta','stock_minimo','requiere_receta','estado'];
  const keys = Object.keys(fields).filter(k => allowed.includes(k));
  if (keys.length === 0) return res.status(400).json({ success: false, error: 'No hay campos válidos para actualizar' });

  const set = keys.map(k => `${k} = ?`).join(', ');
  const values = keys.map(k => fields[k]);
  values.push(id);

  try {
    const [result] = await db.query(`UPDATE medicamentos SET ${set} WHERE id = ?`, values);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, error: 'No encontrado' });
    const [rows] = await db.query('SELECT * FROM medicamentos WHERE id = ?', [id]);
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Error en la base de datos' });
  }
});

// Eliminar (marcar inactivo)
router.delete('/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const [result] = await db.query("UPDATE medicamentos SET estado = 'inactivo' WHERE id = ?", [id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, error: 'No encontrado' });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Error en la base de datos' });
  }
});

export default router;
