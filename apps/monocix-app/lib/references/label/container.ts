import { getApiBaseUrl } from "../tenant/infrastructure/config";
import { HttpLabelRepository } from "./infrastructure/http/label-http.repository";

export function createLabelRepository(): HttpLabelRepository {
	return new HttpLabelRepository(getApiBaseUrl());
}
