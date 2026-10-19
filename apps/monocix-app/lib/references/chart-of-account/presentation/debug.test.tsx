import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { EditChartOfAccountForm } from "./edit-chart-of-account-form";

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

describe("debug edit", () => {
	it("renders", () => {
		render(
			<EditChartOfAccountForm
				chartOfAccount={{
					id: "1",
					name: "Caja",
					tenantId: "t1",
					labelId: "l1",
					isActive: true,
				}}
				tenantId="t1"
				labels={[{ id: "l1", name: "Bug", isActive: true }]}
				updateAction={vi.fn()}
			/>,
		);
		screen.debug();
	});
});
