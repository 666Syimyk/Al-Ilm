export default function Header({ title, subtitle, eyebrow = "Аль-Ильм", children, compact = false, className = "" }) {
  return (
    <header className={`page-header ${compact ? "page-header--compact" : ""} ${className}`.trim()}>
      <div className="page-header__copy">
        {eyebrow ? <p className="brand-mark">{eyebrow}</p> : null}
        <h1>{title}</h1>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      {children ? <div className="page-header__side">{children}</div> : null}
    </header>
  );
}
