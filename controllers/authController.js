import bcrypt from "bcrypt";
import Usuario from "../models/usuarioModel.js";

const authController = {
  showLogin(req, res) {
    res.render("auth/login", { message: null });
  },

  async login(req, res) {
    const { username, password } = req.body;
    try {
      let usuario = await Usuario.findByUsername(username);
      if (!usuario) usuario = await Usuario.findByEmail(username);

      if (!usuario) {
        return res.render("auth/login", { message: "Usuario o correo no encontrado" });
      }

      const passwordValido = await bcrypt.compare(password, usuario.password_hash);
      if (!passwordValido) {
        return res.render("auth/login", { message: "Contraseña incorrecta" });
      }

      let rolNombre = "usuario";
      if (usuario.rol_id === 1) rolNombre = "admin";
      else if (usuario.rol_id === 2) rolNombre = "empleado";

      req.session.user = {
        id: usuario.id,
        username: usuario.username,
        rol_id: usuario.rol_id,
        rol: rolNombre,
        nombre: usuario.nombre_completo,
      };

      if (usuario.rol_id === 1) {
        return res.redirect("/admin");
    } else {
        return res.redirect("/");
    }
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      res.render("auth/login", { message: "Error interno del servidor" });
    }
  },

  async register(req, res) {
    const { nombre_completo, email, username, password, telefono } = req.body;
    try {
      const userExist = await Usuario.findByUsername(username);
      const emailExist = await Usuario.findByEmail(email);

      if (userExist) return res.render("auth/register", { message: "El nombre de usuario ya está en uso." });
      if (emailExist) return res.render("auth/register", { message: "El correo electrónico ya está registrado." });

      const password_hash = await bcrypt.hash(password, 10);
      const rol_id = 3;

      await Usuario.create({ nombre_completo, email, username, password_hash, rol_id, telefono });
      res.render("auth/login", { message: "Registro exitoso. Ahora puedes iniciar sesión." });
    } catch (error) {
      console.error("Error al registrar usuario:", error);
      res.render("auth/register", { message: "Error interno del servidor." });
    }
  },

  logout(req, res) {
    req.session.destroy(() => res.redirect("/login"));
  },
};

export default authController;
