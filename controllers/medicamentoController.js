import { Medicamento } from "../models/Medicamento.js";

export const getMedicamentos = async (req, res) => {
  try {
    const meds = await Medicamento.findAll();
    res.json({ success: true, data: meds });
  } catch (error) {
    console.error("Error al obtener medicamentos:", error);
    res.status(500).json({ success: false, error: "Error en la base de datos" });
  }
};

export const getMedicamentoById = async (req, res) => {
  try {
    const med = await Medicamento.findById(req.params.id);
    if (!med) return res.status(404).json({ success: false, error: "No encontrado" });
    res.json({ success: true, data: med });
  } catch (error) {
    console.error("Error al obtener medicamento:", error);
    res.status(500).json({ success: false, error: "Error en la base de datos" });
  }
};

export const createMedicamento = async (req, res) => {
  try {
    const result = await Medicamento.createConLote(req.body);
    res.status(201).json({ success: true, message: "Medicamento y lote registrados correctamente", data: result });
  } catch (error) {
    console.error("Error al crear medicamento:", error);
    res.status(500).json({ success: false, error: "Error en la base de datos" });
  }
};

export const updateMedicamento = async (req, res) => {
  try {
    const med = await Medicamento.update(req.params.id, req.body);
    if (!med) return res.status(404).json({ success: false, error: "No encontrado o sin cambios" });
    res.json({ success: true, data: med });
  } catch (error) {
    console.error("Error al actualizar medicamento:", error);
    res.status(500).json({ success: false, error: "Error en la base de datos" });
  }
};

export const deleteMedicamento = async (req, res) => {
  try {
    const deleted = await Medicamento.delete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, error: "No encontrado" });
    res.json({ success: true, message: "Eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar medicamento:", error);
    res.status(500).json({ success: false, error: "Error en la base de datos" });
  }
};
