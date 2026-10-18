import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
	return (
		<div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4 text-center">
			<Image src="/logo.svg" alt="Monocix" width={64} height={64} priority className="dark:invert" />
			<div className="space-y-2">
				<h1 className="text-4xl font-heading font-semibold tracking-tight">
					404
				</h1>
				<p className="text-sm text-muted-foreground">
					La página que buscas no existe o fue movida.
				</p>
			</div>
			<Button asChild>
				<Link href="/">Volver al inicio</Link>
			</Button>
		</div>
	);
}
