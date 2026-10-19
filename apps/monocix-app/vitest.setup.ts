import { afterAll, afterEach, beforeAll } from "vitest";
import { server } from "./test/msw-server";
import "@testing-library/jest-dom/vitest";

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

class ResizeObserverMock {
	observe() {}
	unobserve() {}
	disconnect() {}
}

if (!("ResizeObserver" in globalThis)) {
	(
		globalThis as unknown as { ResizeObserver: typeof ResizeObserverMock }
	).ResizeObserver = ResizeObserverMock;
}
