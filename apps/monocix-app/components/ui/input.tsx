import * as React from "react";
import { cn } from "cn";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
	({ className, type, ...props }, ref) => {
		return (
			<div className="relative w-full">
				<input
					ref={ref}
					type={type}
					data-slot="input"
					className={cn(
						"h-8 w-full min-w-0 border-b border-input bg-transparent px-2 py-2.5 text-base font-semibold transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-b-destructive md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 peer",
						className,
					)}
					{...props}
				/>
				<span
					aria-hidden
					className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 bg-primary transition-transform duration-300 peer-focus:scale-x-100"
				/>
			</div>
		);
	},
);

Input.displayName = "Input";

export { Input };
