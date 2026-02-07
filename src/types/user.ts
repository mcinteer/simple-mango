export interface User {
  _id?: string;
  email: string;
  name: string;
  passwordHash?: string; // undefined for OAuth users
  provider: "credentials" | "google";
  ageVerified: boolean;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}
