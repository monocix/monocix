"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { CreateLabelForm } from "@/lib/references/label/presentation/create-label-form";
import { EditLabelForm } from "@/lib/references/label/presentation/edit-label-form";
import { LabelList } from "@/lib/references/label/presentation/label-list";
import type { Label } from "@/lib/references/label/domain/label";
import { createLabel } from "../actions/create-label";
import { deleteLabel } from "../actions/delete-label";
import { updateLabel } from "../actions/update-label";
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

export function LabelsContainer({
	tenantId,
	labels,
	loadError,
}: {
	tenantId: string;
	labels: Label[];
	loadError: string | null;
}) {
	const router = useRouter();
	const [editingLabel, setEditingLabel] = React.useState<Label | null>(null);
	const [labelToDelete, setLabelToDelete] = React.useState<Label | null>(null);
	const [isDeleting, startDeleting] = React.useTransition();

	const confirmDelete = React.useCallback(() => {
		if (!labelToDelete) return;
		const selected = labelToDelete;
		startDeleting(async () => {
			const result = await deleteLabel(tenantId, selected.id);
			if (result.ok) {
				toast.success("Etiqueta eliminada correctamente");
				router.refresh();
				setLabelToDelete(null);
				return;
			}
			toast.error(result.error ?? "No se pudo eliminar la etiqueta");
			setLabelToDelete(null);
		});
	}, [labelToDelete, tenantId, router]);

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between gap-4">
				<h1 className="text-2xl font-heading font-semibold tracking-tight">
					Etiquetas
				</h1>
				<CreateLabelForm tenantId={tenantId} createAction={createLabel} />
			</div>
			{loadError !== null ? (
				<p className="text-sm text-muted-foreground">{loadError}</p>
			) : (
				<LabelList
					labels={labels}
					onEdit={setEditingLabel}
					onDelete={setLabelToDelete}
				/>
			)}
			<EditLabelForm
				open={editingLabel !== null}
				label={editingLabel ?? undefined}
				onOpenChange={(open) => {
					if (!open) setEditingLabel(null);
				}}
				tenantId={tenantId}
				updateAction={updateLabel}
			/>
			<AlertDialog
				open={labelToDelete !== null}
				onOpenChange={(open) => {
					if (!open) setLabelToDelete(null);
				}}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Eliminar etiqueta</AlertDialogTitle>
						<AlertDialogDescription>
							¿Eliminar la etiqueta &quot;{labelToDelete?.name}&quot;?
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
