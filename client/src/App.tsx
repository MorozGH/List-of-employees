import { useCallback, useEffect, useState } from "react";
import { api, getToken, setToken } from "./api/client";
import { Header } from "./components/header";
import { AuthPage } from "./pages/auth-page";
import { EmployeesPage } from "./pages/employees-page";
import type { AuthResponse, AuthUser } from "./types";

export function App() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isInitializing, setIsInitializing] = useState(Boolean(getToken()));

  useEffect(() => {
    if (!getToken()) {
      return;
    }
    api
      .me()
      .then((data) => setUser(data.user))
      .catch(() => setToken(null))
      .finally(() => setIsInitializing(false));
  }, []);

  const handleLogout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  function handleAuthSuccess(response: AuthResponse): void {
    setToken(response.token);
    setUser(response.user);
  }

  if (isInitializing) {
    return <p className="empty-state">Загрузка…</p>;
  }

  if (!user) {
    return <AuthPage onSuccess={handleAuthSuccess} />;
  }

  return (
    <>
      <Header email={user.email} onLogout={handleLogout} />
      <EmployeesPage onUnauthorized={handleLogout} />
    </>
  );
}