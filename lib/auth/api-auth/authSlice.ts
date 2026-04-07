import build from "next/dist/build";
import CategoryReponse, { QuizResponse } from "@/lib/types/quiz";
import { quizzy } from "@/lib/features/api/api";

    export const quizzyApi = quizzy.injectEndpoints({
        endpoints:(builder)=>({
            login:builder.mutation({
                query:(requestBody)=>({
                    url:'/login',
                    method:"POST",
                    body:requestBody,
                    credentials: 'include',
                }), 
                invalidatesTags:['auth']
            }),
            register:builder.mutation({
                query:(requestBody)=>({
                    url:'/register',
                    method:"POST",
                    body:requestBody,
                    credentials: 'include',
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

    export const {useLoginMutation,useRegisterMutation,useGetProfileQuery} = quizzyApi