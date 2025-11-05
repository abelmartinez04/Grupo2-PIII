import pool from "../config/db.js";

export const getAllProveedores = async () => {
  const [rows] = await pool.query("SELECT * FROM proveedores");
  return rows;
};

export const createProveedor = async ({ nombre, rnc, telefono, email, estado }) => {
  const [result] = await pool.query(
    "INSERT INTO proveedores (nombre, rnc, telefono, email, estado) VALUES (?, ?, ?, ?, ?)",
    [nombre, rnc, telefono, email, estado || "activo"]
  );
  return result.insertId;
};

export const updateProveedor = async (id, nombre) => {
  await pool.query("UPDATE proveedores SET nombre = ? WHERE id = ?", [nombre, id]);
};

export const deleteProveedor = async (id) => {
  await pool.query("DELETE FROM proveedores WHERE id = ?", [id]);
};
