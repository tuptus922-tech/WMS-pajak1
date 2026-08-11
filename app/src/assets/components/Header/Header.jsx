import './Header.css';

export default function Header({ roleLabel, today, roleInitials }) {
  return (
    <div className="header">
      <div>
        <div className="header__title">MAGAZYN · BAZA PAJĄK</div>
        <div className="header__subtitle">{roleLabel} · {today}</div>
      </div>
      <div className="header__avatar">{roleInitials}</div>
    </div>
  );
}
