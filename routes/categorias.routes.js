import express from "express";
import {
  getCategorias,
  getCategoriaById,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria,
} from "../controllers/categoriasController.js";

const router = express.Router();

// Obtener todas las categorías
router.get('/', getCategorias);
router.get("/:id", getCategoriaById);
router.post("/", crearCategoria);
router.put("/:id", actualizarCategoria);
router.delete("/:id", eliminarCategoria);

export default router;
