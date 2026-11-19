import { useState, type FormEvent } from "react";
import { api, ApiError } from "../api/client";
import type { AuthResponse } from "../types";

interface AuthPageProps {
  onSuccess: (response: AuthResponse) => void;
}

type AuthMode = "login" | "register";

interface FieldErrors {
  email?: string;
  password?: string;
}

function validate(email: string, password: string): FieldErrors {
  const errors: FieldErrors = {};
  if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
    errors.email = "Введите корректный email";
  }
  if (password.length < 8) {
    errors.password = "Пароль должен быть не короче 8 символов";
  }
  return errors;
}

export function AuthPage({ onSuccess }: AuthPageProps) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLogin = mode === "login";

  function switchMode(nextMode: AuthMode): void {
    setMode(nextMode);
    setFieldErrors({});
    setServerError("");
  }

  async function handleSubmit(event: FormEvent): Promise<void> {
    event.preventDefault();
    setServerError("");

    const errors = validate(email, password);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = isLogin
        ? await api.login(email.trim(), password)
        : await api.register(email.trim(), password);
      onSuccess(response);
    } catch (error) {
      setServerError(error instanceof ApiError ? error.message : "Не удалось выполнить запрос");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-layout">
      <div className="card auth-card">
        <h1 className="auth-title">Список сотрудников</h1>
        <div className="auth-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={isLogin}
            className={isLogin ? "auth-tab auth-tab-active" : "auth-tab"}
            onClick={() => switchMode("login")}
          >
            Вход
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={!isLogin}
            className={!isLogin ? "auth-tab auth-tab-active" : "auth-tab"}
            onClick={() => switchMode("register")}
          >
            Регистрация
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="auth-email">Email</label>
            <input
              id="auth-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              aria-invalid={Boolean(fieldErrors.email)}
            />
            {fieldErrors.email && <p className="field-error">{fieldErrors.email}</p>}
          </div>

          <div className="field">
            <label htmlFor="auth-password">Пароль</label>
            <input
              id="auth-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete={isLogin ? "current-password" : "new-password"}
              aria-invalid={Boolean(fieldErrors.password)}
            />
            {fieldErrors.password && <p className="field-error">{fieldErrors.password}</p>}
          </div>

          {serverError && <p className="form-error">{serverError}</p>}

          <button type="submit" className="btn btn-primary btn-block" disabled={isSubmitting}>
            {isSubmitting ? "Подождите…" : isLogin ? "Войти" : "Зарегистрироваться"}
          </button>
        </form>
      </div>
    </main>
  );
}