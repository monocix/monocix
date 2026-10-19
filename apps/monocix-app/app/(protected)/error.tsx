"use client";

import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function Error({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	return (
		<div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4 text-center">
			<Image
				src="/logo.svg"
				alt="Monocix"
				width={64}
				height={64}
				priority
				className="dark:invert"
			/>
			<div className="space-y-2">
				<h1 className="text-4xl font-heading font-semibold tracking-tight">
					Algo salió mal
				</h1>
				<p className="text-sm text-muted-foreground">
					Ocurrió un error inesperado o el servidor no está disponible.
					Inténtalo de nuevo.
				</p>
				{error?.digest ? (
					<p className="text-xs text-muted-foreground">
						Referencia: {error.digest}
					</p>
				) : null}
			</div>
			<div className="flex gap-3">
				<Button onClick={() => reset()}>Reintentar</Button>
				<Button variant="outline" asChild>
					<Link href="/">Volver al inicio</Link>
				</Button>
			</div>
		</div>
	);
}
