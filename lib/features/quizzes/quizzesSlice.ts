import build from "next/dist/build";
import { quizzy } from "../api/api";
import CategoryReponse, { QuizResponse } from "@/lib/types/quiz";

    export const quizzyApi = quizzy.injectEndpoints({
        endpoints:(builder)=>({
            getQuizzes: builder.query<QuizResponse[],void>({
                query:()=>'/quiz',
                providesTags:['quiz']
            }),
            addQuiz:builder.mutation({
                query:(newQuiz)=>({
                    url:'/quiz',
                    method:"POST",
                    body:newQuiz
                }),
                invalidatesTags:['quiz']
            })
        })
    })

    export const {useGetQuizzesQuery, useAddQuizMutation} = quizzyApi