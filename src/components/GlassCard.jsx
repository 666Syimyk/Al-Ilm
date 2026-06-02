import GlassPanel from "./GlassPanel.jsx";

export default function GlassCard({ className = "", children, ...props }) {
  return (
    <GlassPanel className={`glass-card ${className}`} {...props}>
      {children}
    </GlassPanel>
  );
}
