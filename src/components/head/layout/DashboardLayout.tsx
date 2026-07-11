import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  return (
    <main className="min-h-screen bg-slate-100">

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