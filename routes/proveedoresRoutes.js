import express from "express";
import {
  listarProveedores,
  crearProveedor,
  editarProveedor,
  eliminarProveedor,
} from "../controllers/proveedorController.js";

const router = express.Router();

// CRUD completo
router.get("/", listarProveedores);
router.post("/", crearProveedor);
router.put("/:id", editarProveedor);
router.delete("/:id", eliminarProveedor);

export default router;
