import { ok, delay } from "./http";
import { mockKpis } from "@/mocks/fixtures";
import type { DashboardKpis } from "@/types/domain";
import type { ApiResponse } from "@/types/api";

export const relatoriosService = {
  async kpis(): Promise<ApiResponse<DashboardKpis>> {
    return delay(ok(mockKpis));
  },
};
