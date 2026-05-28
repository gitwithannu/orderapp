// /types/user.ts

export type User = {
  _id: string;
  name: string;
  email: string;
  role: "agent" | "admin" | "market" | "superadmin";
  permissions: string[];
  createdAt?: string;
};

export type FormState = {
  name: string;
  email: string;
  password: string;
  role: string;
  permissions: string[];
};
