"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
	editLabelSchema,
	type EditLabelFormValues,
} from "@/lib/references/label/domain/edit-label-schema";
import type { Label } from "@/lib/references/label/domain/label";

export function EditLabelForm({
	label,
	open = true,
	onOpenChange,
	updateAction,
}: {
	label?: Label;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	updateAction?: (
		id: string,
		input: EditLabelFormValues,
	) => Promise<{ ok: boolean; error?: string }>;
}) {
	const router = useRouter();
	const [serverError, setServerError] = React.useState<string | null>(null);

	const form = useForm<EditLabelFormValues>({
		resolver: zodResolver(editLabelSchema),
		defaultValues: {
			name: label?.name ?? "",
			isActive: label?.isActive ?? true,
		},
	});

	const onSubmit = form.handleSubmit(async (values) => {
		setServerError(null);

		if (!label || !updateAction) {
			setServerError("No hay etiqueta seleccionada");
			return;
		}

		const result = await updateAction(label.id, values);
		if (!result.ok) {
			setServerError(result.error ?? "No se pudo actualizar la etiqueta");
			return;
		}

		onOpenChange?.(false);
		router.refresh();
	});

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Editar etiqueta</DialogTitle>
					<DialogDescription>
						Actualiza el nombre y el estado de la etiqueta.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={onSubmit} className="space-y-4">
					<Input
						{...form.register("name")}
						placeholder="Nombre de etiqueta"
						message={form.formState.errors.name?.message}
					/>
					<Controller
						control={form.control}
						name="isActive"
						render={({ field }) => (
							<div className="flex items-center justify-between rounded-md border border-input px-3 py-2">
								<span className="text-sm font-medium">
									{field.value ? "Activa" : "Inactiva"}
								</span>
								<Switch
									checked={field.value}
									onCheckedChange={field.onChange}
								/>
							</div>
						)}
					/>
					{serverError ? (
						<p className="text-sm text-destructive">{serverError}</p>
					) : null}
					<DialogFooter>
						<Button type="submit" disabled={form.formState.isSubmitting}>
							{form.formState.isSubmitting ? "Guardando…" : "Guardar"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
