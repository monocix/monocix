import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between gap-4">
				<Skeleton className="h-8 w-32" />
				<Skeleton className="h-9 w-32" />
			</div>
			<Skeleton className="h-40 w-full" />
		</div>
	);
}
