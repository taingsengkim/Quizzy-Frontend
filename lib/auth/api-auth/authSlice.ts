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
            getProfile: builder.query<any, void>({
                query: () => ({
                    url: 'http://localhost:3000/api/profile',
                    method: 'GET',
                     credentials: 'include',
                }),
                providesTags: ['auth'],
                }),
        })
    })

    export const {useLoginMutation,useGetProfileQuery} = quizzyApi