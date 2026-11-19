import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

const dataDir = path.join(__dirname, "..", "..", "data");
fs.mkdirSync(dataDir, { recursive: true });

export const db = new Database(path.join(dataDir, "employees.db"));

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    -- SQLite lower()/NOCASE работают только с ASCII; для регистронезависимого
    -- поиска по кириллице храним нижний регистр, вычисленный в JS.
    full_name_lower TEXT NOT NULL,
    position TEXT NOT NULL,
    department TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

interface EmployeeSeed {
  fullName: string;
  position: string;
  department: string;
}

const seedEmployees: EmployeeSeed[] = [
  { fullName: "Иванова Анна Сергеевна", position: "Frontend-разработчик", department: "Разработка" },
  { fullName: "Петров Дмитрий Алексеевич", position: "Backend-разработчик", department: "Разработка" },
  { fullName: "Смирнова Ольга Викторовна", position: "UX/UI-дизайнер", department: "Дизайн" },
  { fullName: "Кузнецов Максим Игоревич", position: "Менеджер по маркетингу", department: "Маркетинг" },
  { fullName: "Соколова Мария Павловна", position: "HR-специалист", department: "HR" },
];

function seedIfEmpty(): void {
  const { count } = db.prepare("SELECT COUNT(*) AS count FROM employees").get() as { count: number };
  if (count > 0) {
    return;
  }
  const insert = db.prepare(
    "INSERT INTO employees (full_name, full_name_lower, position, department) VALUES (?, ?, ?, ?)",
  );
  const insertMany = db.transaction((rows: EmployeeSeed[]) => {
    for (const row of rows) {
      insert.run(row.fullName, row.fullName.toLowerCase(), row.position, row.department);
    }
  });
  insertMany(seedEmployees);
}

seedIfEmpty();