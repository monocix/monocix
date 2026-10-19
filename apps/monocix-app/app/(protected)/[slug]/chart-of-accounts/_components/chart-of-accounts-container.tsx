"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { CreateChartOfAccountForm } from "@/lib/references/chart-of-account/presentation/create-chart-of-account-form";
import { EditChartOfAccountForm } from "@/lib/references/chart-of-account/presentation/edit-chart-of-account-form";
import { ChartOfAccountList } from "@/lib/references/chart-of-account/presentation/chart-of-account-list";
import type { ChartOfAccount } from "@/lib/references/chart-of-account/domain/chart-of-account";
import type { Label } from "@/lib/references/label/domain/label";
import { createChartOfAccount } from "../actions/create-chart-of-account";
import { deleteChartOfAccount } from "../actions/delete-chart-of-account";
import { updateChartOfAccount } from "../actions/update-chart-of-account";
import { toast } from "sonner";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function ChartOfAccountsContainer({
	tenantId,
	chartOfAccounts,
	labels,
	loadError,
}: {
	tenantId: string;
	chartOfAccounts: ChartOfAccount[];
	labels: Label[];
	loadError: string | null;
}) {
	const router = useRouter();
	const [editingItem, setEditingItem] = React.useState<ChartOfAccount | null>(
		null,
	);
	const [itemToDelete, setItemToDelete] = React.useState<ChartOfAccount | null>(
		null,
	);
	const [isDeleting, startDeleting] = React.useTransition();

	const confirmDelete = React.useCallback(() => {
		if (!itemToDelete) return;
		const selected = itemToDelete;
		startDeleting(async () => {
			const result = await deleteChartOfAccount(tenantId, selected.id);
			if (result.ok) {
				toast.success("Concepto eliminado correctamente");
				router.refresh();
				setItemToDelete(null);
				return;
			}
			toast.error(result.error ?? "No se pudo eliminar el concepto");
			setItemToDelete(null);
		});
	}, [itemToDelete, tenantId, router]);

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between gap-4">
				<h1 className="text-2xl font-heading font-semibold tracking-tight">
					Conceptos
				</h1>
				<CreateChartOfAccountForm
					tenantId={tenantId}
					labels={labels}
					createAction={createChartOfAccount}
				/>
			</div>
			{loadError !== null ? (
				<p className="text-sm text-muted-foreground">{loadError}</p>
			) : (
				<ChartOfAccountList
					chartOfAccounts={chartOfAccounts}
					labels={labels}
					onEdit={setEditingItem}
					onDelete={setItemToDelete}
				/>
			)}
			<EditChartOfAccountForm
				open={editingItem !== null}
				chartOfAccount={editingItem ?? undefined}
				onOpenChange={(open) => {
					if (!open) setEditingItem(null);
				}}
				tenantId={tenantId}
				labels={labels}
				updateAction={updateChartOfAccount}
			/>
			<AlertDialog
				open={itemToDelete !== null}
				onOpenChange={(open) => {
					if (!open) setItemToDelete(null);
				}}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Eliminar concepto</AlertDialogTitle>
						<AlertDialogDescription>
							¿Eliminar el concepto &quot;{itemToDelete?.name}&quot;?
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancelar</AlertDialogCancel>
						<AlertDialogAction
							disabled={isDeleting}
							onClick={(event) => {
								event.preventDefault();
								confirmDelete();
							}}
						>
							{isDeleting ? "Eliminando…" : "Eliminar"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
