interface HeaderProps {
  email: string;
  onLogout: () => void;
}

export function Header({ email, onLogout }: HeaderProps) {
  return (
    <header className="header">
      <div className="header-inner">
        <span className="header-title">Список сотрудников</span>
        <div className="header-user">
          <span className="header-email">{email}</span>
          <button type="button" className="btn btn-secondary" onClick={onLogout}>
            Выйти
          </button>
        </div>
      </div>
    </header>
  );
}