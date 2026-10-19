"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import {
	editChartOfAccountSchema,
	type EditChartOfAccountFormValues,
} from "@/lib/references/chart-of-account/domain/chart-of-account-schema";
import type { ChartOfAccount } from "@/lib/references/chart-of-account/domain/chart-of-account";
import type { Label } from "@/lib/references/label/domain/label";

export function EditChartOfAccountForm({
	chartOfAccount,
	open = true,
	onOpenChange,
	tenantId,
	labels,
	updateAction,
}: {
	chartOfAccount?: ChartOfAccount;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	tenantId: string;
	labels: Label[];
	updateAction: (
		tenantId: string,
		id: string,
		input: EditChartOfAccountFormValues,
	) => Promise<{ ok: boolean; error?: string }>;
}) {
	const router = useRouter();
	const [serverError, setServerError] = React.useState<string | null>(null);
	const [comboboxOpen, setComboboxOpen] = React.useState(false);

	const form = useForm<EditChartOfAccountFormValues>({
		resolver: zodResolver(editChartOfAccountSchema),
		defaultValues: {
			name: chartOfAccount?.name ?? "",
			labelId: chartOfAccount?.labelId ?? "",
			isActive: chartOfAccount?.isActive ?? true,
		},
	});

	React.useEffect(() => {
		form.reset({
			name: chartOfAccount?.name ?? "",
			labelId: chartOfAccount?.labelId ?? "",
			isActive: chartOfAccount?.isActive ?? true,
		});
	}, [chartOfAccount, form]);

	const selectedLabel = labels.find((l) => l.id === form.watch("labelId"));

	const onSubmit = form.handleSubmit(async (values) => {
		setServerError(null);

		if (!chartOfAccount) {
			setServerError("No hay concepto seleccionado");
			return;
		}

		const result = await updateAction(tenantId, chartOfAccount.id, values);
		if (!result.ok) {
			setServerError(result.error ?? "No se pudo actualizar el concepto");
			toast.error(result.error ?? "No se pudo actualizar el concepto");
			return;
		}

		onOpenChange?.(false);
		toast.success("Concepto actualizado correctamente");
		router.refresh();
	});

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Editar concepto</DialogTitle>
					<DialogDescription>
						Actualiza el nombre, la etiqueta y el estado del concepto.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={onSubmit} className="space-y-4">
					<Input
						{...form.register("name")}
						placeholder="Nombre del concepto"
						message={form.formState.errors.name?.message}
					/>
					<Controller
						control={form.control}
						name="labelId"
						render={({ field }) => (
							<div className="space-y-1">
								<Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
									<PopoverTrigger asChild>
										<Button
											type="button"
											variant="outline"
											role="combobox"
											aria-expanded={comboboxOpen}
											className="w-full justify-between"
										>
											{selectedLabel?.name ?? "Selecciona una etiqueta"}
											<ChevronsUpDown className="opacity-50" />
										</Button>
									</PopoverTrigger>
									<PopoverContent className="w-[--radix-popover-trigger-width] p-0">
										<Command>
											<CommandInput placeholder="Buscar etiqueta..." />
											<CommandList>
												<CommandEmpty>Sin resultados.</CommandEmpty>
												<CommandGroup>
													{labels.map((label) => (
														<CommandItem
															key={label.id}
															value={label.name}
															onSelect={() => {
																field.onChange(label.id);
																setComboboxOpen(false);
															}}
														>
															{label.name}
															<Check
																className={cn(
																	"ml-auto",
																	label.id === field.value
																		? "opacity-100"
																		: "opacity-0",
																)}
															/>
														</CommandItem>
													))}
												</CommandGroup>
											</CommandList>
										</Command>
									</PopoverContent>
								</Popover>
								{form.formState.errors.labelId?.message ? (
									<p className="text-sm text-destructive">
										{form.formState.errors.labelId.message}
									</p>
								) : null}
							</div>
						)}
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
