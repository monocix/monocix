import { getApiBaseUrl } from "./infrastructure/config";
import { HttpTenantRepository } from "./infrastructure/http/tenant-http.repository";

export function createTenantRepository() {
	return new HttpTenantRepository(getApiBaseUrl());
}
