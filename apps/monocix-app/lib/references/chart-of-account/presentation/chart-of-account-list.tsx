import type { ChartOfAccount } from "@/lib/references/chart-of-account/domain/chart-of-account";
import type { Label } from "@/lib/references/label/domain/label";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

type ChartOfAccountListProps = {
	chartOfAccounts: ChartOfAccount[];
	labels: Label[];
	onEdit: (item: ChartOfAccount) => void;
	onDelete: (item: ChartOfAccount) => void;
};

export function ChartOfAccountList({
	chartOfAccounts,
	labels,
	onEdit,
	onDelete,
}: ChartOfAccountListProps) {
	if (chartOfAccounts.length === 0) {
		return (
			<p className="text-sm text-muted-foreground">No hay conceptos aún.</p>
		);
	}

	const labelName = (id: string) =>
		labels.find((label) => label.id === id)?.name ?? id;

	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Nombre</TableHead>
					<TableHead>Etiqueta</TableHead>
					<TableHead>Estado</TableHead>
					<TableHead className="text-right">Acciones</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{chartOfAccounts.map((item) => (
					<TableRow key={item.id}>
						<TableCell>{item.name}</TableCell>
						<TableCell>{labelName(item.labelId)}</TableCell>
						<TableCell>{item.isActive ? "Activo" : "Inactivo"}</TableCell>
						<TableCell className="text-right">
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="ghost" size="icon">
										<MoreHorizontal className="size-4" />
										<span className="sr-only">Abrir acciones</span>
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end" className="w-44">
									<DropdownMenuItem onSelect={() => onEdit(item)}>
										<Pencil className="size-4" />
										Editar concepto
									</DropdownMenuItem>
									<DropdownMenuSeparator />
									<DropdownMenuItem
										variant="destructive"
										onSelect={() => onDelete(item)}
									>
										<Trash2 className="size-4" />
										Eliminar concepto
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
