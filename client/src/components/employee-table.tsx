import type { Employee } from "../types";

interface EmployeeTableProps {
  employees: Employee[];
}

export function EmployeeTable({ employees }: EmployeeTableProps) {
  if (employees.length === 0) {
    return <p className="empty-state">Сотрудники не найдены. Измените поиск или фильтр.</p>;
  }

  return (
    <table className="employee-table">
      <thead>
        <tr>
          <th>ФИО</th>
          <th>Должность</th>
          <th>Отдел</th>
        </tr>
      </thead>
      <tbody>
        {employees.map((employee) => (
          <tr key={employee.id}>
            <td className="employee-name">{employee.fullName}</td>
            <td>{employee.position}</td>
            <td>
              <span className="badge">{employee.department}</span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}