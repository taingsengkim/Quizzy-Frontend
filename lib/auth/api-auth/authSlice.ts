import build from "next/dist/build";
import CategoryReponse, { QuizResponse } from "@/lib/types/quiz";
import { quizzy } from "@/lib/features/api/api";

    export const quizzyApi = quizzy.injectEndpoints({
        endpoints:(builder)=>({
            login:builder.mutation({
                query:(requestBody)=>({
                    url:'/auth/login',
                    method:"POST",
                    body:requestBody
                }),
                invalidatesTags:['auth']
            }),
        })
    })

    export const {useLoginMutation} = quizzyApi