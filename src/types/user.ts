export type UserRole =
  | "volunteer"
  | "programme_officer"
  | "principal"
  | "vice_principal";

export interface VolunteerProfile {
  id: string;
  volunteerId: string;

  firstName: string;
  lastName: string;
  fullName: string;

  email: string;
  phone: string;

  course: string;
  year: string;
  section: string;

  unit: string;

  role: UserRole;

  joinedDate: string;

  avatar: string;

  profileCompletion: number;
}