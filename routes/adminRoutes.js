import express from "express";
import {
  renderAdminPanel,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
} from "../controllers/adminController.js";

const router = express.Router();

// Vista principal del panel
router.get("/", renderAdminPanel);

// Crear usuario
router.post("/crear", crearUsuario);

// Actualizar usuario
router.post("/editar/:id", actualizarUsuario);

// Eliminar usuario
router.delete("/eliminar/:id", eliminarUsuario);

export default router;
