"use client";

import * as React from "react";
import { toast } from "sonner";
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
	createAccountSchema,
	type CreateAccountFormValues,
} from "@/lib/references/account/domain/account-schema";

export function CreateAccountForm({
	tenantId,
	createAction,
}: {
	tenantId: string;
	createAction: (
		tenantId: string,
		input: CreateAccountFormValues,
	) => Promise<{ ok: boolean; error?: string }>;
}) {
	const router = useRouter();
	const [serverError, setServerError] = React.useState<string | null>(null);
	const [open, setOpen] = React.useState(false);

	const form = useForm<CreateAccountFormValues>({
		resolver: zodResolver(createAccountSchema),
		defaultValues: {
			name: "",
			description: "",
		},
	});

	const onSubmit = form.handleSubmit(async (values) => {
		setServerError(null);

		const result = await createAction(tenantId, values);
		if (!result.ok) {
			setServerError(result.error ?? "No se pudo crear la cuenta");
			toast.error(result.error ?? "No se pudo crear la cuenta");
			return;
		}

		form.reset();
		setOpen(false);
		toast.success("Cuenta creada correctamente");
		router.refresh();
	});

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button>Nueva cuenta</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Nueva cuenta</DialogTitle>
					<DialogDescription>
						Crea una cuenta para este espacio de trabajo.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={onSubmit} className="space-y-4">
					<Input
						{...form.register("name")}
						placeholder="Nombre de la cuenta"
						message={form.formState.errors.name?.message}
					/>
					<div className="space-y-1">
						<textarea
							{...form.register("description")}
							placeholder="Descripción (opcional)"
							rows={3}
							className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
						/>
						{form.formState.errors.description?.message ? (
							<p className="text-sm text-destructive">
								{form.formState.errors.description.message}
							</p>
						) : null}
					</div>
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
