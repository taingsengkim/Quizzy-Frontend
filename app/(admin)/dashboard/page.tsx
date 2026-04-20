import { QuizAdminTable } from "@/components/dashboard/quiz-card";
import { DashboardStats } from "@/components/dashboard/dashboardstate";

export default async function DashboardPage() {
  return (
    <div className="text-black">
      <DashboardStats />
      <div className="flex flex-col">
        <QuizAdminTable />
      </div>
    </div>
  );
}
