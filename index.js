import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import session from "express-session";

dotenv.config({ path: "./config/.env" });

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



app.use(
  session({
    secret: process.env.CLAVE_SESION || "clave_por_defecto",
    resave: false,
    saveUninitialized: false,
  })
);

// Importar rutas
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import medicamentoRoutes from "./routes/medicamentoRoutes.js";
// import ventaRoutes from "./routes/ventaRoutes.js";
// import usuarioRoutes from "./routes/usuarioRoutes.js";



// Configurar EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  next();
}


// Registrar rutas
app.use("/", authRoutes);   
app.use("/admin", adminRoutes);
app.use('/api/medicamentos', medicamentoRoutes);

// Rutas principales
app.get("/", requireLogin, (req, res) => res.render("index", { activePage: 'inicio' }));
app.get("/inventario", requireLogin, (req, res) => res.render("medicamentos/inventario", { activePage: 'inventario' })); // Verificar con Robert
app.get("/ventas", requireLogin, (req, res) => res.render("ventas", { activePage: 'ventas' }));
app.get("/reportes", requireLogin, (req, res) => res.render("reportes", { activePage: 'reportes' }));

// Puerto
const PORT = 3000;
app.listen(PORT, () => console.log(`✅ Servidor corriendo en http://localhost:${PORT}`));
