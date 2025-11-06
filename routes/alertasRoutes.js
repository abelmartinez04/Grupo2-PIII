import express from "express";
import db from "../config/db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM v_alertas");
    res.json({ success: true, data: rows });
  } catch (error) {
    res.json({ success: false, error: "Error al obtener alertas" });
  }
});

export default router;
