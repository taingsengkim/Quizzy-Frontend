import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-8 w-full min-w-0 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-900 px-2.5 py-1 text-base transition-colors outline-none",
        "focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-200",
        "disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
