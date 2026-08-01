export interface Volunteer {
  id: string;
  name: string;
  rollNo: string;
  department: string;
  year: string;
  unit: "Unit 1" | "Unit 2";
  gender: "Male" | "Female";
  phone: string;
  email: string;
  status: "Active" | "Inactive" | "Pending";
}