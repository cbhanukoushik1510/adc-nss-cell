import { ReactNode } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  return (
    <main className="bg-slate-100 min-h-screen">
      <Sidebar />

      <div className="ml-72 min-h-screen">
        <div className="p-8">
          <Topbar />
          {children}
        </div>
      </div>
    </main>
  );
}