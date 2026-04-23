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
                invalidatesTags:['profile']
            }),
            register:builder.mutation({
                query:(requestBody)=>({
                    url:'/register',
                    method:"POST",
                    body:requestBody,
                    credentials: 'include',
                }), 
                invalidatesTags:['profile']
            }),
            getProfile: builder.query<any, void>({
                query: () => ({
                    url: '/profile',
                    method: 'GET',
                     credentials: 'include',
                }),
                providesTags: ['profile'],
                }),
            refreshToken: builder.mutation({
                query: () => ({
                    url: "/refresh",
                    method: "POST",
                    credentials: "include",
                }),
            })
        })
    })

    export const {useLoginMutation,useRegisterMutation,useGetProfileQuery,useRefreshTokenMutation} = quizzyApi