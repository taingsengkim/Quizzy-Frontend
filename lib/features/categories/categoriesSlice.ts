import build from "next/dist/build";
import { quizzy } from "../api/api";
import CategoryReponse from "@/lib/types/quiz";

    export const quizzyApi = quizzy.injectEndpoints({
        endpoints:(builder)=>({
            getCategories: builder.query<CategoryReponse[],void>({
                query:()=>'/categories',
                providesTags:['categories']
            })
        })
    })

    export const {useGetCategoriesQuery } = quizzyApi