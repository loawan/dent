import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Stethoscope, 
  Receipt, 
  Package, 
  Activity 
} from "lucide-react";
import { clsx } from "clsx";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/patients", label: "Patients", icon: Users },
  { href: "/appointments", label: "Appointments", icon: Calendar },
  { href: "/treatments", label: "Treatments", icon: Stethoscope },
  { href: "/billing", label: "Billing", icon: Receipt },
  { href: "/inventory", label: "Inventory", icon: Package },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="w-64 bg-white border-r border-border min-h-screen flex flex-col shadow-sm fixed left-0 top-0 bottom-0 z-50">
      <div className="p-6 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Activity className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg leading-tight text-foreground">CNS Dental</h1>
            <p className="text-xs text-muted-foreground">Corporation</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={clsx(
                  "sidebar-link cursor-pointer",
                  isActive ? "sidebar-link-active" : "sidebar-link-inactive"
                )}
              >
                <item.icon className={clsx("w-5 h-5", isActive ? "text-primary" : "text-muted-foreground")} />
                <span>{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 m-4 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl border border-primary/10">
        <h4 className="font-semibold text-sm text-primary mb-1">Support</h4>
        <p className="text-xs text-muted-foreground mb-3">Need help with the system?</p>
        <button className="w-full text-xs font-medium bg-white text-foreground py-2 rounded-lg border shadow-sm hover:bg-gray-50 transition-colors">
          Contact Admin
        </button>
      </div>
    </div>
  );
}
