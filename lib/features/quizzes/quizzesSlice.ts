import build from "next/dist/build";
import { quizzy } from "../api/api";
import CategoryReponse, { QuizResponse } from "@/lib/types/quiz";

    export const quizzyApi = quizzy.injectEndpoints({
        endpoints:(builder)=>({
            getQuizzes: builder.query<QuizResponse[],void>({
                query:()=>'/quizzes',
                providesTags:['quizzes']
            }),
            getQuizById: builder.query({
                query: (id: number) => ({
                    url: `/quizzes/${id}`,
                    method: "GET",
                }),
            }),
            getQuizzesByCategory: builder.query({
                query: (categoryId) => `/quizzes/categories/${categoryId}`,
                providesTags: ['quizzes'],
            }),
            addQuiz:builder.mutation({
                query:(newQuiz)=>({
                    url:'/quizzes',
                    method:"POST",
                    body:newQuiz
                }),
                invalidatesTags:['quizzes']
            }),
            deleteQuiz:builder.mutation({
                query:(id)=>({
                    url:`/quizzes/${id}`,
                    method:"DELETE",
                }),
                invalidatesTags:['quizzes']
            })
        })
    })

    export const {useGetQuizzesQuery,useGetQuizByIdQuery,useGetQuizzesByCategoryQuery, useAddQuizMutation, useDeleteQuizMutation} = quizzyApi