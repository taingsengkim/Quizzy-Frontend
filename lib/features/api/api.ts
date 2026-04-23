import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// 1. base query (normal request)
const baseQuery = fetchBaseQuery({
  baseUrl: "/api",
  credentials: "include",
});
// 2. refresh logic wrapper
const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  let result = await baseQuery(args, api, extraOptions);
  // if access token expired
  if (result.error?.status === 401) {
    console.log("Access token expired → refreshing...");
    const refreshResult = await baseQuery(
      {
        url: `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
        method: "POST",
      },
      api,
      extraOptions
    );
    if (refreshResult.data) {
      console.log("Refresh success → retry original request");
      // retry original request
      result = await baseQuery(args, api, extraOptions);
    } else {
      console.log("Refresh failed → logout user");
    }
  }

  return result;
};

export const quizzy = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth, 
  tagTypes: ["categories", "quizzes", "profile", "quizResults"],
  endpoints: () => ({}),
});