import type { Account } from "@/lib/references/account/domain/account";

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

type AccountListProps = {
	accounts: Account[];
	onEdit: (account: Account) => void;
	onDelete: (account: Account) => void;
};

export function AccountList({ accounts, onEdit, onDelete }: AccountListProps) {
	if (accounts.length === 0) {
		return <p className="text-sm text-muted-foreground">No hay cuentas aún.</p>;
	}

	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Nombre</TableHead>
					<TableHead>Descripción</TableHead>
					<TableHead>Estado</TableHead>
					<TableHead className="text-right">Acciones</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{accounts.map((account) => (
					<TableRow key={account.id}>
						<TableCell>{account.name}</TableCell>
						<TableCell className="max-w-xs truncate">
							{account.description || "—"}
						</TableCell>
						<TableCell>{account.isActive ? "Activa" : "Inactiva"}</TableCell>
						<TableCell className="text-right">
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="ghost" size="icon">
										<MoreHorizontal className="size-4" />
										<span className="sr-only">Abrir acciones</span>
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end" className="w-44">
									<DropdownMenuItem onSelect={() => onEdit(account)}>
										<Pencil className="size-4" />
										Editar cuenta
									</DropdownMenuItem>
									<DropdownMenuSeparator />
									<DropdownMenuItem
										variant="destructive"
										onSelect={() => onDelete(account)}
									>
										<Trash2 className="size-4" />
										Eliminar cuenta
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
