import './Header.css';

export default function Header({ title = 'MAGAZYN · BAZA PAJĄK', roleLabel, today, roleInitials }) {
  return (
    <div className="header">
      <div>
        <div className="header__title">{title}</div>
        <div className="header__subtitle">{roleLabel} · {today}</div>
      </div>
      <div className="header__avatar">{roleInitials}</div>
    </div>
  );
}
