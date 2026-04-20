import { PageResponse } from "@/lib/pagination";
import { quizzy } from "../api/api";
import CategoryReponse from "@/lib/types/quiz";

export const quizzyApi = quizzy.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query<
      PageResponse<CategoryReponse>,
      { page: number; size: number; search?: string }
    >({
      query: ({ page, size, search }) => {
        const params = new URLSearchParams({
          page: String(page),
          size: String(size),
        });
        if (search && search.trim() !== "") {
          params.append("search", search.trim());
        }
        return `/categories?${params.toString()}`;
      },
      providesTags: ["categories"],
    }),
    addCategory: builder.mutation({
      query: (newCategory) => ({
        url: "/categories",
        method: "POST",
        body: newCategory,
      }),
      invalidatesTags: ["categories"],
    }),
    deleteCategory: builder.mutation({
      query: (id) => ({
        url: `/categories/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["categories"],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useAddCategoryMutation,
  useDeleteCategoryMutation,
} = quizzyApi;