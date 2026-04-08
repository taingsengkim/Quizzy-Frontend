import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { ChartAreaInteractive } from "@/components/dashboard/chart-area-interactive";
import { DataTable } from "@/components/dashboard/data-table";
import { SectionCards } from "@/components/dashboard/section-cards";
import { SiteHeader } from "@/components/dashboard/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

import data from "./data.json";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QuizAdminTable } from "@/components/dashboard/quiz-card";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAdminData } from "@/lib/auth/admin-data";

export default async function DashboardPage() {
  return (
    <div className="text-black">
      <SectionCards />
      <div className="flex flex-col">
        <QuizAdminTable />
      </div>
    </div>
  );
}
