import {
  User,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Award,
  ImageIcon,
} from "lucide-react";

export const quickAccess = [
  {
    title: "My Profile",
    href: "/volunteer/profile",
    icon: User,
    color: "blue",
  },
  {
    title: "My Events",
    href: "/volunteer/events",
    icon: CalendarDays,
    color: "green",
  },
  {
    title: "Attendance",
    href: "/volunteer/attendance",
    icon: CheckCircle2,
    color: "orange",
  },
  {
    title: "Service Hours",
    href: "/volunteer/service-hours",
    icon: Clock3,
    color: "purple",
  },
  {
    title: "Certificates",
    href: "/volunteer/certificates",
    icon: Award,
    color: "yellow",
  },
  {
    title: "Gallery",
    href: "/volunteer/gallery",
    icon: ImageIcon,
    color: "pink",
  },
];