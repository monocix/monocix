"use client";

import * as React from "react";

import { CreateLabelForm } from "@/lib/references/label/presentation/create-label-form";
import { EditLabelForm } from "@/lib/references/label/presentation/edit-label-form";
import { LabelList } from "@/lib/references/label/presentation/label-list";
import type { Label } from "@/lib/references/label/domain/label";
import { createLabel } from "../actions/create-label";
import { updateLabel } from "../actions/update-label";

export function LabelsContainer({
	tenantId,
	labels,
	loadError,
}: {
	tenantId: string;
	labels: Label[];
	loadError: string | null;
}) {
	const [editingLabel, setEditingLabel] = React.useState<Label | null>(null);

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
				<LabelList labels={labels} onEdit={setEditingLabel} />
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
		</div>
	);
}
