import type { HealthStatus } from "@backend/modules/health/domain/health-status";

export const getHealthStatus = (): HealthStatus => ({
  status: "ok",
  service: "moviescore-api",
});
