import db from '../config/db.js';

export const Categoria = {
  async getAll() {
    const [rows] = await db.query('SELECT * FROM categorias ORDER BY id DESC');
    return rows;
  },

  async getById(id) {
    const [rows] = await db.query('SELECT * FROM categorias WHERE id = ?', [id]);
    return rows[0];
  },

  async create({ nombre, descripcion }) {
    const [result] = await db.query(
      'INSERT INTO categorias (nombre, descripcion) VALUES (?, ?)',
      [nombre, descripcion]
    );
    return { id: result.insertId, nombre, descripcion };
  },

  async update(id, { nombre, descripcion }) {
    await db.query(
      'UPDATE categorias SET nombre = ?, descripcion = ? WHERE id = ?',
      [nombre, descripcion, id]
    );
    return true;
  },

  async delete(id) {
    await db.query('DELETE FROM categorias WHERE id = ?', [id]);
    return true;
  }
};
