import pool from "../config/db.js";
import bcrypt from "bcrypt";

export const renderAdminPanel = async (req, res) => {
  try {
    // Verificamos si el usuario logueado es admin
    if (req.session.user?.rol_id !== 1) {
      return res.status(403).render("errors/accessDenied", { activePage: "" });
    }

    // Traemos también el nombre del rol
    const [users] = await pool.query(`
      SELECT u.id, u.nombre_completo, u.email, r.nombre AS rol_nombre, u.rol_id
      FROM usuarios u
      JOIN roles r ON u.rol_id = r.id
    `);

    res.render("admin/panel", { users, activePage: "admin" });
  } catch (error) {
    console.error("Error al cargar el panel:", error);
    res.status(500).send("Error interno del servidor");
  }
};

export const crearUsuario = async (req, res) => {
  try {
    const { nombre_completo, email, rol_id, contraseña } = req.body;

    // Encriptar contraseña
    const password_hash = await bcrypt.hash(contraseña, 10);

    await pool.query(
      "INSERT INTO usuarios (nombre_completo, email, username, password_hash, rol_id) VALUES (?, ?, ?, ?, ?)",
      [nombre_completo, email, email.split("@")[0], password_hash, rol_id]
    );

    res.redirect("/admin");
  } catch (error) {
    console.error("Error al crear usuario:", error);
    res.status(500).send("Error al crear el usuario");
  }
};

export const actualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre_completo, email, rol_id } = req.body;

    await pool.query(
      "UPDATE usuarios SET nombre_completo = ?, email = ?, rol_id = ? WHERE id = ?",
      [nombre_completo, email, rol_id, id]
    );

    res.status(200).json({ message: "Usuario actualizado correctamente" });
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    res.status(500).json({ message: "Error al actualizar el usuario" });
  }
};

export const eliminarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM usuarios WHERE id = ?", [id]);
    res.json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    res.status(500).json({ message: "Error al eliminar usuario" });
  }
};

