import { BookOpen, BookOpenCheck, Home, Landmark, UserRound } from "lucide-react";
import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/home", label: "Главная", icon: Home },
  { to: "/lessons", label: "Уроки", icon: BookOpen },
  { to: "/namaz", label: "Намаз", icon: Landmark },
  { to: "/quran", label: "Коран", icon: BookOpenCheck },
  { to: "/profile", label: "Профиль", icon: UserRound }
];

export default function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Детское меню">
      {navItems.map(({ to, label, icon: Icon }) => (
        <NavLink key={to} to={to} className={({ isActive }) => `bottom-nav__item ${isActive ? "is-active" : ""}`}>
          <Icon size={21} strokeWidth={2.2} aria-hidden="true" />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
