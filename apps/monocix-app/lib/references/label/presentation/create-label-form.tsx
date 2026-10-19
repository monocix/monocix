"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
	createLabelSchema,
	type CreateLabelFormValues,
} from "@/lib/references/label/domain/label-schema";

export function CreateLabelForm({
	tenantId,
	createAction,
}: {
	tenantId: string;
	createAction: (
		tenantId: string,
		input: CreateLabelFormValues,
	) => Promise<{ ok: boolean; error?: string }>;
}) {
	const router = useRouter();
	const [serverError, setServerError] = React.useState<string | null>(null);
	const [open, setOpen] = React.useState(false);

	const form = useForm<CreateLabelFormValues>({
		resolver: zodResolver(createLabelSchema),
		defaultValues: {
			name: "",
		},
	});

	const onSubmit = form.handleSubmit(async (values) => {
		setServerError(null);

		const result = await createAction(tenantId, values);
		if (!result.ok) {
			setServerError(result.error ?? "No se pudo crear la etiqueta");
			return;
		}

		form.reset();
		setOpen(false);
		router.refresh();
	});

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button>Nueva etiqueta</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Nueva etiqueta</DialogTitle>
					<DialogDescription>
						Crea una etiqueta para este espacio de trabajo.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={onSubmit} className="space-y-4">
					<Input
						{...form.register("name")}
						placeholder="Nombre de etiqueta"
						message={form.formState.errors.name?.message}
					/>
					{serverError ? (
						<p className="text-sm text-destructive">{serverError}</p>
					) : null}
					<DialogFooter>
						<Button type="submit" disabled={form.formState.isSubmitting}>
							{form.formState.isSubmitting ? "Creando…" : "Crear"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
