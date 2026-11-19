export interface AuthUser {
  id: number;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface Employee {
  id: number;
  fullName: string;
  position: string;
  department: string;
}

export interface EmployeeInput {
  fullName: string;
  position: string;
  department: string;
}