"use client";

import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useGetCategoriesQuery } from "@/lib/features/categories/categoriesSlice";
import { useGetQuizzesQuery } from "@/lib/features/quizzes/quizzesSlice";
import { TrendingUpIcon, TrendingDownIcon } from "lucide-react";

export function SectionCards() {
  const {
    data: categories,
    isLoading: categoryLoading,
    isError: categoryError,
  } = useGetCategoriesQuery();
  const {
    data: quizzes,
    isLoading: quizLoading,
    isError: quizError,
  } = useGetQuizzesQuery();
  console.log(categories);
  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Categories</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {categories?.length}
          </CardTitle>
          <CardAction></CardAction>
        </CardHeader>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Quizzes</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {quizzes?.length}
          </CardTitle>
          <CardAction></CardAction>
        </CardHeader>
      </Card>
    </div>
  );
}
