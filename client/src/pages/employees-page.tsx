import { useEffect, useState } from "react";
import { api, ApiError } from "../api/client";
import { EmployeeForm } from "../components/employee-form";
import { EmployeeTable } from "../components/employee-table";
import type { Employee, EmployeeInput } from "../types";

interface EmployeesPageProps {
  onUnauthorized: () => void;
}

export function EmployeesPage({ onUnauthorized }: EmployeesPageProps) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);
    setLoadError("");

    api
      .listEmployees(debouncedSearch, department)
      .then((data) => {
        if (!isCancelled) {
          setEmployees(data.employees);
        }
      })
      .catch((error: unknown) => {
        if (isCancelled) {
          return;
        }
        if (error instanceof ApiError && error.status === 401) {
          onUnauthorized();
          return;
        }
        setLoadError(error instanceof ApiError ? error.message : "Не удалось загрузить список");
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [debouncedSearch, department, refreshKey, onUnauthorized]);

  useEffect(() => {
    api
      .listDepartments()
      .then((data) => setDepartments(data.departments))
      .catch((error: unknown) => {
        if (error instanceof ApiError && error.status === 401) {
          onUnauthorized();
        }
      });
  }, [refreshKey, onUnauthorized]);

  async function handleAdd(input: EmployeeInput): Promise<void> {
    setIsSubmitting(true);
    setFormError("");
    try {
      await api.addEmployee(input);
      setIsFormOpen(false);
      setRefreshKey((key) => key + 1);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        onUnauthorized();
        return;
      }
      setFormError(error instanceof ApiError ? error.message : "Не удалось добавить сотрудника");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="layout">
      <div className="toolbar">
        <div className="field toolbar-search">
          <label htmlFor="employee-search">Поиск по ФИО</label>
          <input
            id="employee-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Например, Иванова"
          />
        </div>
        <div className="field toolbar-filter">
          <label htmlFor="department-filter">Отдел</label>
          <select
            id="department-filter"
            value={department}
            onChange={(event) => setDepartment(event.target.value)}
          >
            <option value="">Все отделы</option>
            {departments.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          className="btn btn-primary toolbar-add"
          onClick={() => setIsFormOpen((isOpen) => !isOpen)}
        >
          {isFormOpen ? "Скрыть форму" : "Добавить сотрудника"}
        </button>
      </div>

      {isFormOpen && (
        <>
          <EmployeeForm
            departments={departments}
            isSubmitting={isSubmitting}
            onSubmit={handleAdd}
            onCancel={() => setIsFormOpen(false)}
          />
          {formError && <p className="form-error">{formError}</p>}
        </>
      )}

      <div className="card">
        {isLoading ? (
          <p className="empty-state">Загрузка…</p>
        ) : loadError ? (
          <p className="form-error">{loadError}</p>
        ) : (
          <EmployeeTable employees={employees} />
        )}
      </div>
    </main>
  );
}