import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const quizzy = createApi({
    baseQuery: fetchBaseQuery({
        baseUrl : `/api`,
    }),
    
    tagTypes:['categories','quizzes','auth'],
    endpoints:()=>({})
})