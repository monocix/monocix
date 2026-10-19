"use client";

import Image from "next/image";
import Link from "next/link";
import {
	ChevronDown,
	FolderOpen,
	LayoutDashboard,
	Tag,
	Wallet,
} from "lucide-react";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Sidebar,
	SidebarContent,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";

export function AppSidebar({ slug }: { slug?: string }) {
	const dashboardHref = slug ? `/${slug}/dashboard` : "/dashboard";
	const labelsHref = slug ? `/${slug}/labels` : "/labels";
	const accountsHref = slug ? `/${slug}/accounts` : "/accounts";

	return (
		<Sidebar collapsible="offcanvas">
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton size="lg" asChild>
							<Link href={dashboardHref}>
								<div className="bg-sidebar-primarys text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
									<Image
										src="/logo.svg"
										alt="Monocix logo"
										width={12}
										height={12}
										className="size-12 dark:invert"
									/>
								</div>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-semibold">Monocix</span>
								</div>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<SidebarMenu className="px-2 py-2">
					<SidebarMenuItem>
						<SidebarMenuButton asChild>
							<Link href={dashboardHref}>
								<LayoutDashboard className="size-4" />
								Panel
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
					<SidebarMenuItem>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<SidebarMenuButton>
									<FolderOpen className="size-4" />
									Datos de referencia
									<ChevronDown className="ml-auto size-4" />
								</SidebarMenuButton>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="start" className="w-52" side="right">
								<DropdownMenuItem asChild>
									<Link href={labelsHref}>
										<Tag className="size-4" />
										Etiquetas
									</Link>
								</DropdownMenuItem>
								<DropdownMenuItem asChild>
									<Link href={accountsHref}>
										<Wallet className="size-4" />
										Cuentas
									</Link>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarContent>
		</Sidebar>
	);
}
