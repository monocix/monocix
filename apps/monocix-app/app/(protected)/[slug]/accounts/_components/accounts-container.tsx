"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { CreateAccountForm } from "@/lib/references/account/presentation/create-account-form";
import { EditAccountForm } from "@/lib/references/account/presentation/edit-account-form";
import { AccountList } from "@/lib/references/account/presentation/account-list";
import type { Account } from "@/lib/references/account/domain/account";
import { createAccount } from "../actions/create-account";
import { deleteAccount } from "../actions/delete-account";
import { updateAccount } from "../actions/update-account";
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

export function AccountsContainer({
	tenantId,
	accounts,
	loadError,
}: {
	tenantId: string;
	accounts: Account[];
	loadError: string | null;
}) {
	const router = useRouter();
	const [editingAccount, setEditingAccount] = React.useState<Account | null>(
		null,
	);
	const [accountToDelete, setAccountToDelete] = React.useState<Account | null>(
		null,
	);
	const [isDeleting, startDeleting] = React.useTransition();

	const confirmDelete = React.useCallback(() => {
		if (!accountToDelete) return;
		const selected = accountToDelete;
		startDeleting(async () => {
			const result = await deleteAccount(tenantId, selected.id);
			if (result.ok) {
				toast.success("Cuenta eliminada correctamente");
				router.refresh();
				setAccountToDelete(null);
				return;
			}
			toast.error(result.error ?? "No se pudo eliminar la cuenta");
			setAccountToDelete(null);
		});
	}, [accountToDelete, tenantId, router]);

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between gap-4">
				<h1 className="text-2xl font-heading font-semibold tracking-tight">
					Cuentas
				</h1>
				<CreateAccountForm tenantId={tenantId} createAction={createAccount} />
			</div>
			{loadError !== null ? (
				<p className="text-sm text-muted-foreground">{loadError}</p>
			) : (
				<AccountList
					accounts={accounts}
					onEdit={setEditingAccount}
					onDelete={setAccountToDelete}
				/>
			)}
			<EditAccountForm
				open={editingAccount !== null}
				account={editingAccount ?? undefined}
				onOpenChange={(open) => {
					if (!open) setEditingAccount(null);
				}}
				tenantId={tenantId}
				updateAction={updateAccount}
			/>
			<AlertDialog
				open={accountToDelete !== null}
				onOpenChange={(open) => {
					if (!open) setAccountToDelete(null);
				}}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Eliminar cuenta</AlertDialogTitle>
						<AlertDialogDescription>
							¿Eliminar la cuenta &quot;{accountToDelete?.name}&quot;?
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
