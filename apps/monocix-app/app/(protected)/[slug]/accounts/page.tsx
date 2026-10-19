export const instant = false;

import { notFound } from "next/navigation";

import { AccountsContainer } from "./_components/accounts-container";

import { getTenantBySlug } from "@/lib/references/tenant/application/get-tenant-by-slug";
import { createTenantRepository } from "@/lib/references/tenant/container";
import { TenantNotFoundError } from "@/lib/references/tenant/domain/tenant";
import { createAccountRepository } from "@/lib/references/account/container";
import { getAccounts as getAccountsUseCase } from "@/lib/references/account/application/get-accounts";
import type { Account } from "@/lib/references/account/domain/account";

export default async function AccountsPage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;

	const tenantRepository = createTenantRepository();
	const tenant = await getTenantBySlug(tenantRepository, slug).catch(
		(error: unknown) => {
			if (error instanceof TenantNotFoundError) notFound();
			throw error;
		},
	);

	const accountRepository = createAccountRepository();
	let accounts: Account[] = [];
	let loadError: string | null = null;
	try {
		accounts = await getAccountsUseCase(accountRepository, tenant.id);
	} catch {
		loadError = "No se pudieron cargar las cuentas.";
	}

	return (
		<AccountsContainer
			tenantId={tenant.id}
			accounts={accounts}
			loadError={loadError}
		/>
	);
}
