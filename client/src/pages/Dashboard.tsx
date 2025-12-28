import { Layout } from "@/components/Layout";
import { useAppointments } from "@/hooks/use-appointments";
import { useInvoices } from "@/hooks/use-invoices";
import { useInventory } from "@/hooks/use-inventory";
import { Calendar, DollarSign, Users, AlertTriangle, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { format } from "date-fns";

export default function Dashboard() {
  const { data: appointments } = useAppointments();
  const { data: invoices } = useInvoices();
  const { data: inventory } = useInventory();

  // Calculate stats
  const today = format(new Date(), "yyyy-MM-dd");
  const todayAppointments = appointments?.filter(a => format(new Date(a.date), "yyyy-MM-dd") === today) || [];
  
  const totalRevenue = invoices?.reduce((sum, inv) => sum + Number(inv.totalAmount), 0) || 0;
  const pendingRevenue = invoices?.filter(i => i.status !== "Paid").reduce((sum, inv) => sum + (Number(inv.totalAmount) - Number(inv.paidAmount)), 0) || 0;
  
  const lowStockItems = inventory?.filter(i => i.quantity <= i.minQuantity) || [];

  // Mock data for the chart since we don't have historical aggregation backend yet
  const chartData = [
    { name: 'Mon', revenue: 4000 },
    { name: 'Tue', revenue: 3000 },
    { name: 'Wed', revenue: 2000 },
    { name: 'Thu', revenue: 2780 },
    { name: 'Fri', revenue: 1890 },
    { name: 'Sat', revenue: 2390 },
    { name: 'Sun', revenue: 3490 },
  ];

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back, Dr. Sai Latt Win Tun. Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard 
          title="Today's Appointments" 
          value={todayAppointments.length} 
          icon={Calendar} 
          trend="+12% from yesterday"
          trendUp={true}
        />
        <StatsCard 
          title="Total Revenue" 
          value={`${totalRevenue.toLocaleString()} MMK`} 
          icon={DollarSign} 
          trend="+8% this month"
          trendUp={true}
        />
        <StatsCard 
          title="Clinic Expenses" 
          value="0 MMK" 
          icon={TrendingUp} 
          trend="Track costs"
          trendUp={true}
          className="border-blue-200 bg-blue-50/50"
        />
        <StatsCard 
          title="Net Profit" 
          value={`${totalRevenue.toLocaleString()} MMK`} 
          icon={DollarSign} 
          trend="Profitability"
          trendUp={true}
        />
        <StatsCard 
          title="Low Stock Alerts" 
          value={lowStockItems.length} 
          icon={AlertTriangle} 
          trend={lowStockItems.length > 0 ? "Restock needed" : "Stock healthy"}
          trendUp={lowStockItems.length === 0}
          className={lowStockItems.length > 0 ? "border-red-200 bg-red-50/50" : ""}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-border p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display font-bold text-lg">Revenue Overview</h3>
            <select className="text-sm border border-border rounded-md px-2 py-1 bg-transparent">
              <option>This Week</option>
              <option>Last Week</option>
            </select>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 12}} tickFormatter={(val) => `${val} MMK`} />
                <Tooltip 
                  cursor={{fill: 'rgba(0,0,0,0.02)'}}
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Side Lists */}
        <div className="space-y-6">
          {/* Today's Schedule */}
          <div className="bg-white rounded-xl border border-border p-6 shadow-sm h-full">
            <h3 className="font-display font-bold text-lg mb-4">Today's Schedule</h3>
            {todayAppointments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No appointments today.</p>
            ) : (
              <div className="space-y-4">
                {todayAppointments.slice(0, 5).map((apt) => (
                  <div key={apt.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-border/50">
                    <div>
                      <p className="font-medium text-sm text-foreground">
                        {format(new Date(apt.date), "h:mm a")}
                      </p>
                      <p className="text-xs text-muted-foreground">Patient #{apt.patientId}</p>
                    </div>
                    <StatusBadge status={apt.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

function StatsCard({ title, value, icon: Icon, trend, trendUp, className }: any) {
  return (
    <div className={`bg-white rounded-xl border border-border p-6 shadow-sm flex flex-col justify-between MMK{className}`}>
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-primary/10 rounded-lg text-primary">
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <span className={`text-xs font-medium px-2 py-1 rounded-full MMK{trendUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {trend}
          </span>
        )}
      </div>
      <div>
        <h4 className="text-sm text-muted-foreground font-medium mb-1">{title}</h4>
        <div className="text-2xl font-bold font-display text-foreground">{value}</div>
      </div>
    </div>
  );
}
