import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "../db";
import { requireAuth, signToken } from "../middleware/auth";

const credentialsSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email("Некорректный email")),
  password: z.string().min(8, "Пароль должен быть не короче 8 символов").max(72),
});

interface UserRow {
  id: number;
  email: string;
  password_hash: string;
}

export const authRouter = Router();

authRouter.post("/register", async (req, res) => {
  const { email, password } = credentialsSchema.parse(req.body);

  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
  if (existing) {
    res.status(409).json({ error: "Пользователь с таким email уже зарегистрирован" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const result = db
    .prepare("INSERT INTO users (email, password_hash) VALUES (?, ?)")
    .run(email, passwordHash);

  const user = { id: Number(result.lastInsertRowid), email };
  res.status(201).json({ token: signToken(user), user });
});

authRouter.post("/login", async (req, res) => {
  const { email, password } = credentialsSchema.parse(req.body);

  const row = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as UserRow | undefined;
  const passwordMatches = row ? await bcrypt.compare(password, row.password_hash) : false;
  if (!row || !passwordMatches) {
    res.status(401).json({ error: "Неверный email или пароль" });
    return;
  }

  const user = { id: row.id, email: row.email };
  res.json({ token: signToken(user), user });
});

authRouter.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});