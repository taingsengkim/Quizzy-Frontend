import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const quizzy = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({
        baseUrl : `/api`,
        credentials: "include",
    }),
    
    tagTypes:['categories','quizzes','profile','quizResults'],
    endpoints:()=>({})
})