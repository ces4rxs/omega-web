// src/routes/server_auth.ts — 🔒 Autenticación OMEGA SEGURA v2.0 (con Email Real)

import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import bodyParser from "body-parser";
import cors from "cors";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();
router.use(bodyParser.json());
router.use(
  cors({
    origin: ["http://localhost:3000", "http://192.168.1.90:3000"],
    methods: ["GET", "POST"],
  })
);

// 🧩 Configuración base
const SECRET = process.env.JWT_SECRET || "omega_secret_fallback";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://192.168.1.90:3000";

// 🧠 Simulación simple en memoria (en producción usar Prisma/SQLite)
interface User {
  id: number;
  email: string;
  password: string;
  resetToken?: string;
  resetExpires?: number;
}

const users: User[] = [];
let idCounter = 1;

// ✉️ Transporter SMTP (correo real)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true, // TLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// -----------------------------------------------------
// 🧩 REGISTRO
// -----------------------------------------------------
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (users.find((u) => u.email === email)) {
      return res.status(400).json({ message: "El usuario ya existe" });
    }

    const hashed = bcrypt.hashSync(password, 10);
    const user: User = { id: idCounter++, email, password: hashed };
    users.push(user);

    const accessToken = jwt.sign({ id: user.id, email: user.email }, SECRET, { expiresIn: "2h" });
    console.log(`✅ Nuevo usuario registrado: ${email}`);
    res.json({ user: { id: user.id, email: user.email }, accessToken });
  } catch (err: any) {
    console.error("❌ Error en registro:", err.message);
    res.status(500).json({ message: "Error interno en registro" });
  }
});

// -----------------------------------------------------
// 🧠 LOGIN
// -----------------------------------------------------
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = users.find((u) => u.email === email);
    if (!user) return res.status(401).json({ message: "Usuario no encontrado" });

    const valid = bcrypt.compareSync(password, user.password);
    if (!valid) return res.status(401).json({ message: "Contraseña incorrecta" });

    const accessToken = jwt.sign({ id: user.id, email: user.email }, SECRET, { expiresIn: "2h" });
    res.json({ user: { id: user.id, email: user.email }, accessToken });
  } catch (err: any) {
    console.error("❌ Error en login:", err.message);
    res.status(500).json({ message: "Error interno en login" });
  }
});

// -----------------------------------------------------
// 🧩 PERFIL (verificación de token)
// -----------------------------------------------------
router.get("/me", (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ message: "Falta token" });

  const token = auth.split(" ")[1];
  try {
    const decoded = jwt.verify(token, SECRET) as { id: number; email: string };
    const user = users.find((u) => u.id === decoded.id);
    if (!user) throw new Error();
    res.json({ user: { id: user.id, email: user.email } });
  } catch {
    res.status(401).json({ message: "Token inválido o expirado" });
  }
});

// -----------------------------------------------------
// 🔐 FORGOT PASSWORD (envía correo real con token temporal)
// -----------------------------------------------------
router.post("/forgot", async (req, res) => {
  try {
    const { email } = req.body;
    const user = users.find((u) => u.email === email);
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    const resetToken = jwt.sign({ id: user.id }, SECRET, { expiresIn: "30m" });
    user.resetToken = resetToken;
    user.resetExpires = Date.now() + 30 * 60 * 1000; // 30 minutos

    const resetLink = `${FRONTEND_URL}/reset?token=${resetToken}`;

    // ✉️ Envío real
    await transporter.sendMail({
      from: `"OMEGA Security" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "🔒 Recuperación de contraseña OMEGA",
      html: `
        <h2>Recuperación de contraseña</h2>
        <p>Has solicitado restablecer tu contraseña.</p>
        <p>Haz clic en el siguiente enlace para continuar:</p>
        <a href="${resetLink}" style="background:#2563eb;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;">Restablecer contraseña</a>
        <p>Este enlace expirará en 30 minutos.</p>
      `,
    });

    console.log(`📩 Email de recuperación enviado a ${email}`);
    res.json({ message: "Correo de recuperación enviado correctamente" });
  } catch (err: any) {
    console.error("❌ Error en forgot:", err.message);
    res.status(500).json({ message: "Error enviando correo" });
  }
});

// -----------------------------------------------------
// 🧠 RESET PASSWORD
// -----------------------------------------------------
router.post("/reset", (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ message: "Faltan datos" });

    const decoded = jwt.verify(token, SECRET) as { id: number };
    const user = users.find((u) => u.id === decoded.id && u.resetToken === token);
    if (!user) return res.status(400).json({ message: "Token inválido o expirado" });
    if (Date.now() > (user.resetExpires || 0)) {
      return res.status(400).json({ message: "Token expirado" });
    }

    user.password = bcrypt.hashSync(password, 10);
    user.resetToken = undefined;
    user.resetExpires = undefined;

    console.log(`✅ Contraseña restablecida para ${user.email}`);
    res.json({ message: "Contraseña actualizada correctamente" });
  } catch (err: any) {
    console.error("❌ Error en reset:", err.message);
    res.status(500).json({ message: "Error interno al restablecer contraseña" });
  }
});

export default router;
