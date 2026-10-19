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
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	createChartOfAccountSchema,
	type CreateChartOfAccountFormValues,
} from "@/lib/references/chart-of-account/domain/chart-of-account-schema";
import type { Label } from "@/lib/references/label/domain/label";

export function CreateChartOfAccountForm({
	tenantId,
	labels,
	createAction,
}: {
	tenantId: string;
	labels: Label[];
	createAction: (
		tenantId: string,
		input: CreateChartOfAccountFormValues,
	) => Promise<{ ok: boolean; error?: string }>;
}) {
	const router = useRouter();
	const [serverError, setServerError] = React.useState<string | null>(null);
	const [open, setOpen] = React.useState(false);
	const [comboboxOpen, setComboboxOpen] = React.useState(false);

	const form = useForm<CreateChartOfAccountFormValues>({
		resolver: zodResolver(createChartOfAccountSchema),
		defaultValues: { name: "", labelId: "" },
	});

	const onSubmit = form.handleSubmit(async (values) => {
		setServerError(null);
		const result = await createAction(tenantId, values);
		if (!result.ok) {
			setServerError(result.error ?? "No se pudo crear el concepto");
			toast.error(result.error ?? "No se pudo crear el concepto");
			return;
		}
		form.reset();
		setOpen(false);
		toast.success("Concepto creado correctamente");
		router.refresh();
	});

	const selectedLabel = labels.find((l) => l.id === form.watch("labelId"));

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button>Nuevo concepto</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Nuevo concepto</DialogTitle>
					<DialogDescription>
						Crea un concepto asociado a una etiqueta.
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
