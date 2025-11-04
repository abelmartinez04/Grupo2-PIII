import bcrypt from "bcrypt";
import Usuario from "../models/usuarioModel.js";
import { transporter } from "../config/mailer.js";

let verificationCodes = {}; // temporal en memoria

// Mostrar vista para pedir correo
export const showForgotPassword = (req, res) => {
  res.render("auth/forgotPassword", { message: null });
};

// Enviar código por correo
export const sendResetCode = async (req, res) => {
  const { email } = req.body;
  const user = await Usuario.findByEmail(email);

  if (!user) {
    return res.render("auth/forgotPassword", { message: "Correo no encontrado." });
  }

  const code = Math.floor(100000 + Math.random() * 900000);
  verificationCodes[email] = code;

  await transporter.sendMail({
    from: '"Soporte del sistema" <abelrobles0409@gmail.com>',
    to: email,
    subject: "Código para restablecer contraseña",
    text: `Tu código de verificación es: ${code}`,
  });

  res.render("auth/resetPassword", { email, message: "Código enviado a tu correo." });
};

// Mostrar formulario para ingresar código y nueva contraseña
export const showResetForm = (req, res) => {
  res.render("auth/resetPassword", { email: "", message: null });
};

// Procesar nueva contraseña
export const resetPassword = async (req, res) => {
  const { email, code, password } = req.body;

  if (verificationCodes[email] != code) {
    return res.render("auth/resetPassword", { email, message: "Código incorrecto." });
  }

  const password_hash = await bcrypt.hash(password, 10);
  await Usuario.updatePassword(email, password_hash);
  delete verificationCodes[email];

  res.render("auth/login", { message: "Contraseña actualizada con éxito." });
};
