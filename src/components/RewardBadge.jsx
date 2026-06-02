import { Lock, Medal } from "lucide-react";

export default function RewardBadge({ title, received = false }) {
  return (
    <div className={`reward-badge ${received ? "is-received" : "is-locked"}`}>
      {received ? <Medal size={22} aria-hidden="true" /> : <Lock size={20} aria-hidden="true" />}
      <span>{title}</span>
      <small>{received ? "получено" : "заблокировано"}</small>
    </div>
  );
}
