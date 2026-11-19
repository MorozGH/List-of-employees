import { Router } from "express";
import { z } from "zod";
import { db } from "../db";
import { requireAuth } from "../middleware/auth";

const requiredField = (label: string) =>
  z
    .string({ error: `Поле «${label}» обязательно` })
    .trim()
    .min(1, `Поле «${label}» обязательно`)
    .max(120, `Поле «${label}» слишком длинное`);

const employeeSchema = z.object({
  fullName: requiredField("ФИО"),
  position: requiredField("Должность"),
  department: requiredField("Отдел"),
});

const querySchema = z.object({
  search: z.string().trim().max(120).optional().default(""),
  department: z.string().trim().max(120).optional().default(""),
});

interface EmployeeRow {
  id: number;
  full_name: string;
  position: string;
  department: string;
}

function toEmployee(row: EmployeeRow) {
  return {
    id: row.id,
    fullName: row.full_name,
    position: row.position,
    department: row.department,
  };
}

export const employeesRouter = Router();

employeesRouter.use(requireAuth);

employeesRouter.get("/", (req, res) => {
  const { search, department } = querySchema.parse(req.query);

  const conditions: string[] = [];
  const params: string[] = [];
  if (search) {
    conditions.push("full_name_lower LIKE ?");
    params.push(`%${search.toLowerCase()}%`);
  }
  if (department) {
    conditions.push("department = ?");
    params.push(department);
  }
  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const rows = db
    .prepare(`SELECT * FROM employees ${where} ORDER BY full_name COLLATE NOCASE, id`)
    .all(...params) as EmployeeRow[];

  res.json({ employees: rows.map(toEmployee) });
});

employeesRouter.get("/departments", (_req, res) => {
  const rows = db
    .prepare("SELECT DISTINCT department FROM employees ORDER BY department COLLATE NOCASE")
    .all() as { department: string }[];
  res.json({ departments: rows.map((row) => row.department) });
});

employeesRouter.post("/", (req, res) => {
  const { fullName, position, department } = employeeSchema.parse(req.body);

  const result = db
    .prepare(
      "INSERT INTO employees (full_name, full_name_lower, position, department) VALUES (?, ?, ?, ?)",
    )
    .run(fullName, fullName.toLowerCase(), position, department);

  res.status(201).json({
    employee: { id: Number(result.lastInsertRowid), fullName, position, department },
  });
});