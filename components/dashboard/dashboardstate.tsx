"use client";

import { useGetCategoriesQuery } from "@/lib/features/categories/categoriesSlice";
import { useGetQuizzesQuery } from "@/lib/features/quizzes/quizzesSlice";
import { BookOpen, LayoutGrid, TrendingUp, Loader2 } from "lucide-react";

export function DashboardStats() {
  const { data: categoriesData, isLoading: catLoading } = useGetCategoriesQuery(
    { page: 0, size: 1 },
  );

  const { data: quizzesData, isLoading: quizLoading } = useGetQuizzesQuery({
    page: 0,
    size: 1,
  });
  const totalQuizzes = quizzesData?.totalElements ?? 0;
  const totalCategories = categoriesData?.totalElements ?? 0;

  const stats = [
    {
      label: "Total Categories",
      value: totalCategories,
      icon: LayoutGrid,
      loading: catLoading,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Total Quizzes",
      value: totalQuizzes,
      icon: BookOpen,
      loading: quizLoading,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="rounded-xl border bg-card p-5 flex items-center gap-4 shadow-sm"
          >
            <div className={`${stat.bg} ${stat.color} rounded-lg p-3`}>
              <Icon className="h-6 w-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">
                {stat.label}
              </span>
              {stat.loading ? (
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mt-1" />
              ) : (
                <span className="text-2xl font-bold tracking-tight">
                  {stat.value}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
