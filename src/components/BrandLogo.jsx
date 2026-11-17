import logo from "../assets/brand/al-ilm-logo.webp";

export default function BrandLogo({ className = "" }) {
  return (
    <div className={`brand-logo ${className}`}>
      <div className="brand-logo__mark" aria-hidden="true">
        <img src={logo} alt="" />
      </div>
      <strong>Аль-Ильм</strong>
      <span>Путь к знаниям и свету</span>
    </div>
  );
}
