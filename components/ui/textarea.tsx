import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex w-full min-h-24 rounded-lg border-2 border-gray-300 dark:border-gray-600",
        "bg-white dark:bg-zinc-900 px-3 py-2 text-base text-black dark:text-white",
        "outline-none transition",
        "placeholder:text-gray-400",
        "focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-200",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
