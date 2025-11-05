import { Categoria } from "../models/Categoria.js";

export const getCategorias = async (req, res) => {
  try {
    const categorias = await Categoria.getAll();
    res.json({ success: true, data: categorias });
  } catch (error) {
    console.error("Error al obtener categorías:", error);
    res.status(500).json({ success: false, error: "Error al obtener categorías" });
  }
};

export const getCategoriaById = async (req, res) => {
  try {
    const { id } = req.params;
    const categoria = await Categoria.getById(id);
    if (!categoria) return res.status(404).json({ success: false, error: "Categoría no encontrada" });
    res.json({ success: true, data: categoria });
  } catch (error) {
    console.error("Error al obtener categoría:", error);
    res.status(500).json({ success: false, error: "Error al obtener categoría" });
  }
};

export const crearCategoria = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    const nueva = await Categoria.create({ nombre, descripcion });
    res.json({ success: true, data: nueva });
  } catch (error) {
    console.error("Error al crear categoría:", error);
    res.status(500).json({ success: false, error: "Error al crear categoría" });
  }
};

export const actualizarCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;
    await Categoria.update(id, { nombre, descripcion });
    res.json({ success: true });
  } catch (error) {
    console.error("Error al actualizar categoría:", error);
    res.status(500).json({ success: false, error: "Error al actualizar categoría" });
  }
};

export const eliminarCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    await Categoria.delete(id);
    res.json({ success: true });
  } catch (error) {
    console.error("Error al eliminar categoría:", error);
    res.status(500).json({ success: false, error: "Error al eliminar categoría" });
  }
};
