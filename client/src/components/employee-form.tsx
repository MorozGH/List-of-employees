import { useState, type FormEvent } from "react";
import type { EmployeeInput } from "../types";

interface EmployeeFormProps {
  departments: string[];
  isSubmitting: boolean;
  onSubmit: (input: EmployeeInput) => void;
  onCancel: () => void;
}

type FieldErrors = Partial<Record<keyof EmployeeInput, string>>;

function validate(input: EmployeeInput): FieldErrors {
  const errors: FieldErrors = {};
  if (!input.fullName.trim()) {
    errors.fullName = "Укажите ФИО";
  }
  if (!input.position.trim()) {
    errors.position = "Укажите должность";
  }
  if (!input.department.trim()) {
    errors.department = "Укажите отдел";
  }
  return errors;
}

const emptyInput: EmployeeInput = { fullName: "", position: "", department: "" };

export function EmployeeForm({ departments, isSubmitting, onSubmit, onCancel }: EmployeeFormProps) {
  const [input, setInput] = useState<EmployeeInput>(emptyInput);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  function setField(field: keyof EmployeeInput, value: string): void {
    setInput((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(event: FormEvent): void {
    event.preventDefault();
    const errors = validate(input);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }
    onSubmit({
      fullName: input.fullName.trim(),
      position: input.position.trim(),
      department: input.department.trim(),
    });
  }

  return (
    <form className="card employee-form" onSubmit={handleSubmit} noValidate>
      <h2 className="form-title">Новый сотрудник</h2>

      <div className="employee-form-grid">
        <div className="field">
          <label htmlFor="employee-name">ФИО</label>
          <input
            id="employee-name"
            value={input.fullName}
            onChange={(event) => setField("fullName", event.target.value)}
            aria-invalid={Boolean(fieldErrors.fullName)}
            placeholder="Иванов Иван Иванович"
          />
          {fieldErrors.fullName && <p className="field-error">{fieldErrors.fullName}</p>}
        </div>

        <div className="field">
          <label htmlFor="employee-position">Должность</label>
          <input
            id="employee-position"
            value={input.position}
            onChange={(event) => setField("position", event.target.value)}
            aria-invalid={Boolean(fieldErrors.position)}
            placeholder="Разработчик"
          />
          {fieldErrors.position && <p className="field-error">{fieldErrors.position}</p>}
        </div>

        <div className="field">
          <label htmlFor="employee-department">Отдел</label>
          <input
            id="employee-department"
            value={input.department}
            onChange={(event) => setField("department", event.target.value)}
            aria-invalid={Boolean(fieldErrors.department)}
            list="department-options"
            placeholder="Разработка"
          />
          <datalist id="department-options">
            {departments.map((department) => (
              <option key={department} value={department} />
            ))}
          </datalist>
          {fieldErrors.department && <p className="field-error">{fieldErrors.department}</p>}
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? "Сохранение…" : "Добавить"}
        </button>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Отмена
        </button>
      </div>
    </form>
  );
}