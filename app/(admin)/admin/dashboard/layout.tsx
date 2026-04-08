import React, { ReactNode } from "react";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { ChartAreaInteractive } from "@/components/dashboard/chart-area-interactive";
import { DataTable } from "@/components/dashboard/data-table";
import { SectionCards } from "@/components/dashboard/section-cards";
import { SiteHeader } from "@/components/dashboard/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getAdminData } from "@/lib/auth/admin-data";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
export default async function DashboardLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const cookieStore = await cookies();
  const authToken = cookieStore.get("better-auth.session_data");

  console.log("auth token", authToken);

  if (!authToken) {
    redirect("/admin/login");
  }
  const token = authToken?.value;
  const repsonse = await getAdminData(token);
  console.log("Response", repsonse.role[0]);
  if (repsonse.role[0].name != "ADMIN") {
    redirect("/");
  }
  return (
    <TooltipProvider>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                {/* <div className="px-4 lg:px-6">
                <ChartAreaInteractive />
              </div> */}
                {/* <DataTable data={data} /> */}
                {children}
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
