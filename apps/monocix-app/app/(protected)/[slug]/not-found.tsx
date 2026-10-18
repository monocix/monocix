import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
	return (
		<div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
			<Image
				src="/logo.svg"
				alt="Monocix"
				width={56}
				height={56}
				priority
				className="dark:invert"
			/>
			<div className="space-y-2">
				<h1 className="text-3xl font-heading font-semibold tracking-tight">
					404
				</h1>
				<p className="text-sm text-muted-foreground">
					Este espacio de trabajo no existe o no está disponible.
				</p>
			</div>
			<Button asChild>
				<Link href="/">Volver al inicio</Link>
			</Button>
		</div>
	);
}
