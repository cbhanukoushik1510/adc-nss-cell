import DashboardLayout from "@/components/layout/DashboardLayout";

import WelcomeBanner from "@/components/dashboard/WelcomeBanner";
import StatsCards from "@/components/dashboard/StatsCards";
import UpcomingEvents from "@/components/dashboard/UpcomingEvents";
import Announcements from "@/components/dashboard/Announcements";
import RecentActivities from "@/components/dashboard/RecentActivities";
import QuickAccess from "@/components/dashboard/QuickAccess";
import ActionCenter from "@/components/dashboard/ActionCenter";
import TodaysTasks from "@/components/dashboard/TodaysTasks";
import MyProgress from "@/components/dashboard/MyProgress";
export default function DashboardPage() {
  return (
    <DashboardLayout>
      <WelcomeBanner />
      <StatsCards />
<ActionCenter />
    
      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <UpcomingEvents />
        <Announcements />
      </div>
<div className="mt-8 grid gap-8 xl:grid-cols-2">
    <TodaysTasks /> 
    <MyProgress />
  </div>
      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <RecentActivities />
        <QuickAccess />
      </div>
    </DashboardLayout>
  );
}