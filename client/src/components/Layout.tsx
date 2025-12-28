import { Sidebar } from "./Sidebar";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <Sidebar />
      <main className="pl-64 min-h-screen">
        <div className="max-w-7xl mx-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
