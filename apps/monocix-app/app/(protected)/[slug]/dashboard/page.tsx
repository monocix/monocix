"use client";

import { useTenant } from "@/lib/references/tenant/presentation/tenant-context";

export default function DashboardPage() {
	const tenant = useTenant();
	return (
		<div className="space-y-2">
			<h1 className="text-2xl font-heading font-semibold tracking-tight">
				{tenant.name}
			</h1>
			<p className="text-sm text-muted-foreground">
				Área protegida para {tenant.slug}. La autenticación se agregará más
				adelante.
			</p>
		</div>
	);
}
