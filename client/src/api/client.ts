import type { AuthResponse, AuthUser, Employee, EmployeeInput } from "../types";

const TOKEN_KEY = "employees_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null): void {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(path, { ...init, headers });
  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      typeof body === "object" && body !== null && "error" in body && typeof body.error === "string"
        ? body.error
        : "Ошибка запроса";
    throw new ApiError(response.status, message);
  }
  return body as T;
}

export const api = {
  register(email: string, password: string): Promise<AuthResponse> {
    return request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  login(email: string, password: string): Promise<AuthResponse> {
    return request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  me(): Promise<{ user: AuthUser }> {
    return request("/api/auth/me");
  },

  listEmployees(search: string, department: string): Promise<{ employees: Employee[] }> {
    const params = new URLSearchParams();
    if (search) {
      params.set("search", search);
    }
    if (department) {
      params.set("department", department);
    }
    const query = params.toString();
    return request(`/api/employees${query ? `?${query}` : ""}`);
  },

  listDepartments(): Promise<{ departments: string[] }> {
    return request("/api/employees/departments");
  },

  addEmployee(input: EmployeeInput): Promise<{ employee: Employee }> {
    return request("/api/employees", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
};