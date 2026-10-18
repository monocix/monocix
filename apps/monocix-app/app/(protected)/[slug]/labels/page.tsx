export const instant = false;

import { notFound } from "next/navigation";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

import { LabelDialog } from "./label-dialog";

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
					Etiquetas
				</h1>
				<p className="text-sm text-muted-foreground">
					No se pudieron cargar las etiquetas.
				</p>
			</div>
		);
	}

	const labels = (await res.json()) as Label[];

	return (
		<div className="space-y-4">
			<h1 className="text-2xl font-heading font-semibold tracking-tight">
				Etiquetas
			</h1>
			<div className="flex items-center justify-between">
				<LabelDialog tenantId={tenant.id} />
			</div>
			{labels.length === 0 ? (
				<p className="text-sm text-muted-foreground">No hay etiquetas aún.</p>
			) : (
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Nombre</TableHead>
							<TableHead>Estado</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{labels.map((label) => (
							<TableRow key={label.id}>
								<TableCell>{label.name}</TableCell>
								<TableCell>{label.is_active ? "Activo" : "Inactivo"}</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			)}
		</div>
	);
}
