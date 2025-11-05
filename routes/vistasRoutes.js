import express from "express";

const router = express.Router();

router.get("/medicamentos/proveedores", (req, res) => {
  res.render("medicamentos/proveedores/index", { activePage: "proveedores" });
});

export default router;
