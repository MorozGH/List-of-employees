import express, { type NextFunction, type Request, type Response } from "express";
import { ZodError } from "zod";
import { authRouter } from "./routes/auth";
import { employeesRouter } from "./routes/employees";

export const app = express();

app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/employees", employeesRouter);

app.use("/api", (_req, res) => {
  res.status(404).json({ error: "Не найдено" });
});

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ZodError) {
    res.status(400).json({ error: err.issues[0]?.message ?? "Некорректные данные" });
    return;
  }
  if (err instanceof SyntaxError && "body" in err) {
    res.status(400).json({ error: "Некорректный JSON" });
    return;
  }
  console.error(err);
  res.status(500).json({ error: "Внутренняя ошибка сервера" });
});