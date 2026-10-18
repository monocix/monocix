"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

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

import { createLabel } from "../actions/create-label";

export function LabelDialog({ tenantId }: { tenantId: string }) {
	const router = useRouter();
	const [open, setOpen] = React.useState(false);
	const [error, setError] = React.useState<string | null>(null);
	const [pending, startTransition] = React.useTransition();

	async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setError(null);
		const formData = new FormData(event.currentTarget);
		startTransition(async () => {
			const result = await createLabel(tenantId, formData);
			if (!result.ok) {
				setError(result.error ?? "No se pudo crear la etiqueta");
				return;
			}
			setOpen(false);
			router.refresh();
		});
	}

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
					<Input name="name" placeholder="Nombre de etiqueta" required />
					{error ? <p className="text-sm text-destructive">{error}</p> : null}
					<DialogFooter>
						<Button type="submit" disabled={pending}>
							{pending ? "Creando…" : "Crear"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
