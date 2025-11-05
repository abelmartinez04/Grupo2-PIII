import {
  getAllProveedores,
  createProveedor,
  updateProveedor,
  deleteProveedor,
} from "../models/proveedorModel.js";

export const listarProveedores = async (req, res) => {
  try {
    const proveedores = await getAllProveedores();
    res.json({ success: true, data: proveedores });
  } catch (err) {
    console.error(err);
    res.json({ success: false, error: "Error al obtener proveedores" });
  }
};

export const crearProveedor = async (req, res) => {
  try {
    const { nombre, rnc, telefono, email, estado } = req.body;
    if (!nombre) return res.json({ success: false, error: "El nombre es obligatorio" });

    const id = await createProveedor({ nombre, rnc, telefono, email, estado });
    res.json({ success: true, id });
  } catch (err) {
    console.error(err);
    res.json({ success: false, error: "Error al crear proveedor" });
  }
};


export const editarProveedor = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, rnc, telefono, email, estado } = req.body;
    await updateProveedor(id, { nombre, rnc, telefono, email, estado });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.json({ success: false, error: "Error al editar proveedor" });
  }
};

export const eliminarProveedor = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteProveedor(id);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.json({ success: false, error: "Error al eliminar proveedor" });
  }
};
