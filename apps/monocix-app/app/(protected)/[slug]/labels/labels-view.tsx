import type { Label } from "@/lib/references/label/domain/label";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

type LabelsViewProps = {
	labels: Label[];
	loadError: string | null;
};

export function LabelsView({ labels, loadError }: LabelsViewProps) {
	if (loadError !== null) {
		return (
			<div className="space-y-2">
				<h1 className="text-2xl font-heading font-semibold tracking-tight">
					Etiquetas
				</h1>
				<p className="text-sm text-muted-foreground">{loadError}</p>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<h1 className="text-2xl font-heading font-semibold tracking-tight">
				Etiquetas
			</h1>
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
								<TableCell>{label.isActive ? "Activo" : "Inactivo"}</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			)}
		</div>
	);
}
