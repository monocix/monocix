"use client";

import * as React from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

import { createLabel } from "./actions"

export function LabelDialog({ tenantId }: { tenantId: string }) {
	const router = useRouter()
	const [open, setOpen] = React.useState(false)
	const [error, setError] = React.useState<string | null>(null)
	const [pending, startTransition] = React.useTransition()

	async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault()
		setError(null)
		const formData = new FormData(event.currentTarget)
		startTransition(async () => {
			const result = await createLabel(tenantId, formData)
			if (!result.ok) {
				setError(result.error ?? "Could not create label")
				return
			}
			setOpen(false)
			router.refresh()
		})
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button>New label</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>New label</DialogTitle>
					<DialogDescription>
						Create a label for this workspace.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={onSubmit} className="space-y-4">
					<Input name="name" placeholder="Label name" required />
					{error ? (
						<p className="text-sm text-destructive">{error}</p>
					) : null}
					<DialogFooter>
						<Button type="submit" disabled={pending}>
							{pending ? "Creating…" : "Create"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
}
