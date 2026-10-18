export const API_PREFIX = "/api/v1";

export function getApiBaseUrl(): string {
	return process.env.API_BASE_URL ?? "http://localhost:8080";
}
