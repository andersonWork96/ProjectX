export type AuthResponse = {
  id: number;
  name: string;
  email: string;
  permission: number;
  token: string;
};

export type RegisterRequest = {
  name: string;
  email: string;
  password: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type ChangePasswordRequest = {
  email: string;
  currentPassword: string;
  newPassword: string;
};

export type MeResponse = {
  id: string;
  name: string;
  email: string;
  permission: string;
};
