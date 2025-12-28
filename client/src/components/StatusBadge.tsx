import { clsx } from "clsx";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const lowerStatus = status.toLowerCase();
  
  let colors = "bg-gray-100 text-gray-700 border-gray-200"; // default
  
  if (["completed", "paid", "success"].includes(lowerStatus)) {
    colors = "bg-emerald-50 text-emerald-700 border-emerald-200";
  } else if (["pending", "unpaid", "scheduled"].includes(lowerStatus)) {
    colors = "bg-amber-50 text-amber-700 border-amber-200";
  } else if (["cancelled", "failed", "overdue"].includes(lowerStatus)) {
    colors = "bg-red-50 text-red-700 border-red-200";
  } else if (["partial"].includes(lowerStatus)) {
    colors = "bg-blue-50 text-blue-700 border-blue-200";
  }

  return (
    <span className={clsx(
      "px-2.5 py-0.5 rounded-full text-xs font-medium border uppercase tracking-wide",
      colors,
      className
    )}>
      {status}
    </span>
  );
}
