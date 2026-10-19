"use client";

import * as React from "react";
import { toast } from "sonner";
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
	editAccountSchema,
	type EditAccountFormValues,
} from "@/lib/references/account/domain/edit-account-schema";
import type { Account } from "@/lib/references/account/domain/account";

export function EditAccountForm({
	account,
	open = true,
	onOpenChange,
	tenantId,
	updateAction,
}: {
	account?: Account;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	tenantId: string;
	updateAction: (
		tenantId: string,
		id: string,
		input: EditAccountFormValues,
	) => Promise<{ ok: boolean; error?: string }>;
}) {
	const router = useRouter();
	const [serverError, setServerError] = React.useState<string | null>(null);

	const form = useForm<EditAccountFormValues>({
		resolver: zodResolver(editAccountSchema),
		defaultValues: {
			name: account?.name ?? "",
			description: account?.description ?? "",
			isActive: account?.isActive ?? true,
		},
	});

	React.useEffect(() => {
		form.reset({
			name: account?.name ?? "",
			description: account?.description ?? "",
			isActive: account?.isActive ?? true,
		});
	}, [account, form]);

	const onSubmit = form.handleSubmit(async (values) => {
		setServerError(null);

		if (!account) {
			setServerError("No hay cuenta seleccionada");
			return;
		}

		const result = await updateAction(tenantId, account.id, values);
		if (!result.ok) {
			setServerError(result.error ?? "No se pudo actualizar la cuenta");
			toast.error(result.error ?? "No se pudo actualizar la cuenta");
			return;
		}

		onOpenChange?.(false);
		toast.success("Cuenta actualizada correctamente");
		router.refresh();
	});

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Editar cuenta</DialogTitle>
					<DialogDescription>
						Actualiza el nombre, la descripción y el estado de la cuenta.
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
