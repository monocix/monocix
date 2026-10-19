import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TenantProvider, useTenant } from "./tenant-context";

function Consumer() {
	const tenant = useTenant();
	return <span>{tenant.slug}</span>;
}

describe("TenantProvider", () => {
	it("provides tenant to children", () => {
		render(
			<TenantProvider
				tenant={{
					id: "1",
					name: "Demo",
					slug: "demo",
					isActive: true,
				}}
			>
				<Consumer />
			</TenantProvider>,
		);
		expect(screen.getByText("demo")).toBeInTheDocument();
	});
});
