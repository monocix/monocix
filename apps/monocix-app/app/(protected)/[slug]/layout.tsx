import { notFound } from "next/navigation";

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

	return <TenantProvider tenant={tenant}>{children}</TenantProvider>;
}
