import { getApiBaseUrl } from "@/lib/references/tenant/infrastructure/config";
import { HttpChartOfAccountRepository } from "./infrastructure/http/chart-of-account-http.repository";

export function createChartOfAccountRepository() {
	return new HttpChartOfAccountRepository(getApiBaseUrl());
}
