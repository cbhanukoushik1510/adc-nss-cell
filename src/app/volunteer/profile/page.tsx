import DashboardLayout from "@/components/layout/DashboardLayout";

import ProfileCard from "@/components/profile/ProfileCard";
import ProfileStats from "@/components/profile/ProfileStats";
import Achievements from "@/components/profile/Achievements";
import RecentActivities from "@/components/profile/RecentActivities";

export default function ProfilePage() {
  return (
    <DashboardLayout>
      <ProfileCard />
      <ProfileStats />
      <Achievements />
      <RecentActivities />
    </DashboardLayout>
  );
}