import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const quizzy = createApi({
    baseQuery: fetchBaseQuery({
        baseUrl : `${process.env.NEXT_PUBLIC_API_URL}`,
    }),
    
    tagTypes:['categories','quiz','auth'],
    endpoints:()=>({})
})