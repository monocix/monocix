import type { Label } from "@/lib/references/label/domain/label";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
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
	onEdit: (label: Label) => void;
};

export function LabelList({ labels, onEdit }: LabelListProps) {
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
					<TableHead className="text-right">Acciones</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{labels.map((label) => (
					<TableRow key={label.id}>
						<TableCell>{label.name}</TableCell>
						<TableCell>{label.isActive ? "Activo" : "Inactivo"}</TableCell>
						<TableCell className="text-right">
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="ghost" size="icon">
										<MoreHorizontal className="size-4" />
										<span className="sr-only">Abrir acciones</span>
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									<DropdownMenuItem onSelect={() => onEdit(label)}>
										Editar etiqueta
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}
