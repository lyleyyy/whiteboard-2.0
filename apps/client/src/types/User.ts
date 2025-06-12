export interface User {
  userId: string;
  username: string;
  role: "owner" | "guest";
}
