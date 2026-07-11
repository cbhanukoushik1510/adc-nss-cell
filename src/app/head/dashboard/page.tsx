import DashboardLayout from "@/components/head/layout/DashboardLayout";

import WelcomeBanner from "@/components/head/dashboard/WelcomeBanner";
import OverviewCards from "@/components/head/dashboard/OverviewCards";
import QuickActions from "@/components/head/dashboard/QuickActions";
import CoordinatorStatus from "@/components/head/dashboard/CoordinatorStatus";
import TodaysTasks from "@/components/head/dashboard/TodaysTasks";
import UpcomingEvents from "@/components/head/dashboard/UpcomingEvents";
import RecentActivity from "@/components/head/dashboard/RecentActivity";

export default function HeadDashboardPage() {
  return (
    <DashboardLayout>

      <WelcomeBanner />

      <OverviewCards />

      <div className="mt-8 grid gap-8 xl:grid-cols-2">
        <QuickActions />
        <CoordinatorStatus />
      </div>

      <div className="mt-8 grid gap-8 xl:grid-cols-2">
        <TodaysTasks />
        <UpcomingEvents />
      </div>

      <div className="mt-8">
        <RecentActivity />
      </div>

    </DashboardLayout>
  );
}