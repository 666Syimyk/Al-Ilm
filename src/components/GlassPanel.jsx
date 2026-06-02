export default function GlassPanel({ as: Component = "section", className = "", children, ...props }) {
  return (
    <Component className={`glass-panel ${className}`} {...props}>
      {children}
    </Component>
  );
}
