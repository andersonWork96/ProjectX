import { me } from "../../login/service/auth.service";
import type { MeResponse } from "../../../../lib/types/auth";

export async function getCurrentUser(token: string): Promise<MeResponse> {
  return me(token);
}
