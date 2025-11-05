import express from "express";
import authController from "../controllers/authController.js";
import {
  showForgotPassword,
  sendResetCode,
  showResetForm,
  resetPassword
} from "../controllers/forgotPasswordController.js";

const router = express.Router();

router.get("/login", authController.showLogin);
router.post("/login", authController.login);

router.get("/register", (req, res) => {
  res.render("auth/register", { message: null });
});
router.post("/register", authController.register);

router.get("/logout", authController.logout);

router.get("/forgotPassword", showForgotPassword);
router.post("/forgotPassword", sendResetCode);
router.get("/resetPassword", showResetForm);
router.post("/resetPassword", resetPassword);

export default router;
