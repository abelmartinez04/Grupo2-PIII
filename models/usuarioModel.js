import db from "../config/db.js";

const Usuario = {
  // Buscar usuario por nombre de usuario
  async findByUsername(username) {
    const [rows] = await db.query("SELECT * FROM usuarios WHERE username = ?", [username]);
    return rows.length > 0 ? rows[0] : null;
  },

  // Buscar usuario por email (por si lo necesitas en registro)
  async findByEmail(email) {
    const [rows] = await db.query("SELECT * FROM usuarios WHERE email = ?", [email]);
    return rows.length > 0 ? rows[0] : null;
  },

  // Registrar nuevo usuario
  async create({ nombre_completo, email, username, password_hash, rol_id, telefono }) {
    const [result] = await db.query(
      `INSERT INTO usuarios (nombre_completo, email, username, password_hash, rol_id, telefono)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nombre_completo, email, username, password_hash, rol_id, telefono]
    );
    return result.insertId;
  },

  // Actualizar contraseña por email
  async updatePassword(email, password_hash) {
    const [result] = await db.query(
      "UPDATE usuarios SET password_hash = ? WHERE email = ?",
      [password_hash, email]
    );
    return result;
  },
};



export default Usuario;
