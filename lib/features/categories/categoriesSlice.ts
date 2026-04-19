import { quizzy } from "../api/api";
import CategoryReponse from "@/lib/types/quiz";

    export const quizzyApi = quizzy.injectEndpoints({
        endpoints:(builder)=>({
            getCategories: builder.query<CategoryReponse[],void>({
                query:()=>'/categories',
                providesTags:['categories']
            }),
            addCategory: builder.mutation({
                query: (newCategory) => ({
                    url: '/categories',
                    method: "POST",
                    body: newCategory,
                }),
                invalidatesTags: ['categories'],
            }),
             deleteCategory: builder.mutation({
                query: (id) => ({
                    url: `/categories/${id}`,
                    method: "DELETE",
                }),
                invalidatesTags: ["categories"],
                }),
        })
    })

    export const {useGetCategoriesQuery,useAddCategoryMutation,useDeleteCategoryMutation} = quizzyApi