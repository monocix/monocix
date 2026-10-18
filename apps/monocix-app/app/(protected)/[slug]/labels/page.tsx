export const instant = false;

import { notFound } from "next/navigation";

import { LabelDialog } from "./label-dialog";
import { LabelsView } from "./labels-view";

import { getTenantBySlug } from "@/lib/references/tenant/application/get-tenant-by-slug";
import { createTenantRepository } from "@/lib/references/tenant/container";
import { TenantNotFoundError } from "@/lib/references/tenant/domain/tenant";
import { createLabelRepository } from "@/lib/references/label/container";
import { getLabels as getLabelsUseCase } from "@/lib/references/label/application/get-labels";
import type { Label } from "@/lib/references/label/domain/label";

export default async function LabelsPage({
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

	const labelRepository = createLabelRepository();
	let labels: Label[] = [];
	let loadError: string | null = null;
	try {
		labels = await getLabelsUseCase(labelRepository, tenant.id);
	} catch {
		loadError = "No se pudieron cargar las etiquetas.";
	}

	return (
		<div className="space-y-4">
			<LabelsView labels={labels} loadError={loadError} />
			<LabelDialog tenantId={tenant.id} />
		</div>
	);
}
