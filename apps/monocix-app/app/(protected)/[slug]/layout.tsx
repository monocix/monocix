export const instant = false;

import { notFound } from "next/navigation";

import { AppSidebar } from "@/components/app-sidebar";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";

import { TenantProvider } from "@/lib/references/tenant/presentation/tenant-context";
import { createTenantRepository } from "@/lib/references/tenant/container";
import { getTenantBySlug } from "@/lib/references/tenant/application/get-tenant-by-slug";
import { TenantNotFoundError } from "@/lib/references/tenant/domain/tenant";

export default async function SlugLayout({
	children,
	params,
}: {
	children: React.ReactNode;
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;

	const repository = createTenantRepository();
	const tenant = await getTenantBySlug(repository, slug).catch(
		(error: unknown) => {
			if (error instanceof TenantNotFoundError) notFound();
			throw error;
		},
	);

	return (
		<SidebarProvider>
			<AppSidebar slug={slug} />
			<SidebarInset>
				<header className="flex h-16 items-center gap-2 px-4">
					<SidebarTrigger className="-ml-1" />
				</header>
				<main className="flex-1 p-6">
					<TenantProvider tenant={tenant}>{children}</TenantProvider>
				</main>
			</SidebarInset>
		</SidebarProvider>
	);
}
