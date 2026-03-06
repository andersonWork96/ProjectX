import { buildBackendUrl } from "../../../../lib/constants";
import { http } from "../../../../lib/http";
import type {
  AuthResponse,
  ChangePasswordRequest,
  LoginRequest,
  MeResponse,
  RegisterRequest,
} from "../../../../lib/types/auth";

export async function register(
  payload: RegisterRequest
): Promise<AuthResponse> {
  return http<AuthResponse>(buildBackendUrl("/auth/register"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function login(payload: LoginRequest): Promise<AuthResponse> {
  return http<AuthResponse>(buildBackendUrl("/auth/login"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function me(token: string): Promise<MeResponse> {
  return http<MeResponse>(buildBackendUrl("/auth/me"), {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function changePassword(
  payload: ChangePasswordRequest
): Promise<{ message: string }> {
  return http<{ message: string }>(buildBackendUrl("/auth/change-password"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}
