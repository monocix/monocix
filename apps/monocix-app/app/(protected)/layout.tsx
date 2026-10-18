"use client";

import { useParams } from "next/navigation";

import { AppSidebar } from "@/components/app-sidebar";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";

export default function ProtectedLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const params = useParams<{ slug?: string }>();

	return (
		<SidebarProvider>
			<AppSidebar slug={params?.slug} />
			<SidebarInset>
				<header className="flex h-16 items-center gap-2 px-4">
					<SidebarTrigger className="-ml-1" />
				</header>
				<main className="flex-1 p-6">{children}</main>
			</SidebarInset>
		</SidebarProvider>
	);
}
