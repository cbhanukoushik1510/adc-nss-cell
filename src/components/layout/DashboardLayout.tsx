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

      <div className="min-h-screen lg:ml-72">
        <div className="p-4 sm:p-6 lg:p-8">
          <Topbar />
          {children}
        </div>
      </div>
    </main>
  );
}