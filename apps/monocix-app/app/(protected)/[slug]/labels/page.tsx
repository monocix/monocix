export const instant = false;

import { notFound } from "next/navigation";

import {
	getApiBaseUrl,
	API_PREFIX,
} from "@/lib/references/tenant/infrastructure/config";
import { createTenantRepository } from "@/lib/references/tenant/container";
import { getTenantBySlug } from "@/lib/references/tenant/application/get-tenant-by-slug";
import { TenantNotFoundError } from "@/lib/references/tenant/domain/tenant";

type Label = {
	id: string;
	name: string;
	is_active: boolean;
};

export default async function LabelsPage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;

	const repository = createTenantRepository();
	const tenant = await getTenantBySlug(repository, slug).catch(
		(error: unknown) => {
			if (error instanceof TenantNotFoundError) notFound();
			throw error;
		},
	);

	const res = await fetch(`${getApiBaseUrl()}${API_PREFIX}/labels`, {
		headers: { tenantId: tenant.id },
		cache: "no-store",
	});

	if (!res.ok) {
		return (
			<div className="space-y-2">
				<h1 className="text-2xl font-heading font-semibold tracking-tight">
					Labels
				</h1>
				<p className="text-sm text-muted-foreground">Could not load labels.</p>
			</div>
		);
	}

	const labels = (await res.json()) as Label[];

	return (
		<div className="space-y-4">
			<h1 className="text-2xl font-heading font-semibold tracking-tight">
				Labels
			</h1>
			{labels.length === 0 ? (
				<p className="text-sm text-muted-foreground">No labels yet.</p>
			) : (
				<ul className="space-y-2">
					{labels.map((label) => (
						<li key={label.id} className="rounded-md border px-3 py-2 text-sm">
							{label.name}
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
