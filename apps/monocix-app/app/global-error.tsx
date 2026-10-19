"use client";

import Image from "next/image";
import Link from "next/link";

import "./globals.css";

export default function GlobalError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	return (
		<html lang="es">
			<body className="min-h-screen bg-background text-foreground antialiased">
				<div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
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
						<button
							type="button"
							onClick={() => reset()}
							className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:opacity-90"
						>
							Reintentar
						</button>
						<Link
							href="/"
							className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent"
						>
							Volver al inicio
						</Link>
					</div>
				</div>
			</body>
		</html>
	);
}
