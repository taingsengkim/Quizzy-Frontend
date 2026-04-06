import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const quizzy = createApi({
    reducerPath: "categoryApi",
    baseQuery: fetchBaseQuery({
        baseUrl : "http://localhost:8090/api/v1"
    }),
    tagTypes:['categories','quiz'],
    endpoints:()=>({})
})