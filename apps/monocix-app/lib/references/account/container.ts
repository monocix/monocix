import { getApiBaseUrl } from "@/lib/references/tenant/infrastructure/config";
import { HttpAccountRepository } from "./infrastructure/http/account-http.repository";

export function createAccountRepository() {
	return new HttpAccountRepository(getApiBaseUrl());
}
