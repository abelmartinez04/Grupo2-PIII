import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import medicamentosRouter from './routes/medicamentos.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurar EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Archivos estáticos
app.use(express.static(path.join(__dirname, "public")));

// Parsear JSON en el body
app.use(express.json());

// API rutas
app.use('/api/medicamentos', medicamentosRouter);

// Rutas principales
app.get("/", (req, res) => res.render("index", { activePage: 'inicio' }));
app.get("/inventario", (req, res) => res.render("medicamentos/inventario", { activePage: 'inventario' }));
app.get("/ventas", (req, res) => res.render("ventas", { activePage: 'ventas' }));
app.get("/reportes", (req, res) => res.render("reportes", { activePage: 'reportes' }));

// Puerto
const PORT = 3000;
app.listen(PORT, () => console.log(`✅ Servidor corriendo en http://localhost:${PORT}`));
