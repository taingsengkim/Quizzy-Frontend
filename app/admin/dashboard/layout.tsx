import { TooltipProvider } from "@/components/ui/tooltip";
import React, { ReactNode } from "react";

export default function DashboardLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <div>
      <TooltipProvider>{children}</TooltipProvider>
    </div>
  );
}
