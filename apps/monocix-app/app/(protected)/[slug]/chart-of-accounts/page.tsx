export const instant = false;

import { notFound } from "next/navigation";

import { ChartOfAccountsContainer } from "./_components/chart-of-accounts-container";

import { getTenantBySlug } from "@/lib/references/tenant/application/get-tenant-by-slug";
import { createTenantRepository } from "@/lib/references/tenant/container";
import { TenantNotFoundError } from "@/lib/references/tenant/domain/tenant";
import { createChartOfAccountRepository } from "@/lib/references/chart-of-account/container";
import { getChartOfAccounts as getChartOfAccountsUseCase } from "@/lib/references/chart-of-account/application/get-chart-of-accounts";
import { createLabelRepository } from "@/lib/references/label/container";
import { getLabels as getLabelsUseCase } from "@/lib/references/label/application/get-labels";
import type { ChartOfAccount } from "@/lib/references/chart-of-account/domain/chart-of-account";
import type { Label } from "@/lib/references/label/domain/label";

export default async function ChartOfAccountsPage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;

	const tenantRepository = createTenantRepository();
	const tenant = await getTenantBySlug(tenantRepository, slug).catch(
		(error: unknown) => {
			if (error instanceof TenantNotFoundError) notFound();
			throw error;
		},
	);

	const chartOfAccountRepository = createChartOfAccountRepository();
	const labelRepository = createLabelRepository();

	let chartOfAccounts: ChartOfAccount[] = [];
	let labels: Label[] = [];
	let loadError: string | null = null;
	try {
		[chartOfAccounts, labels] = await Promise.all([
			getChartOfAccountsUseCase(chartOfAccountRepository, tenant.id),
			getLabelsUseCase(labelRepository, tenant.id),
		]);
	} catch {
		loadError = "No se pudieron cargar los conceptos.";
	}

	return (
		<ChartOfAccountsContainer
			tenantId={tenant.id}
			chartOfAccounts={chartOfAccounts}
			labels={labels}
			loadError={loadError}
		/>
	);
}
