import type { Label } from "@/lib/references/label/domain/label";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

type LabelListProps = {
	labels: Label[];
};

export function LabelList({ labels }: LabelListProps) {
	if (labels.length === 0) {
		return (
			<p className="text-sm text-muted-foreground">No hay etiquetas aún.</p>
		);
	}

	return (
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
	);
}
