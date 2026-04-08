import { quizzy } from "../api/api";
import CategoryReponse, { QuizResponse } from "@/lib/types/quiz";

export const quizzyApi = quizzy.injectEndpoints({
  endpoints: (builder) => ({
    getQuizzes: builder.query<QuizResponse[], void>({
      query: () => '/quizzes',
      providesTags: ['quizzes'],
    }),
    getQuizById: builder.query({
      query: (id: number) => ({
        url: `/quizzes/${id}`,
        method: "GET",
      }),
    }),
    getQuizzesByCategory: builder.query({
      query: (categoryId) => `/quizzes/categories/${categoryId}`,
      providesTags: ['quizzes'],
    }),
    addQuiz: builder.mutation({
      query: (newQuiz) => ({
        url: '/quizzes',
        method: "POST",
        body: newQuiz,
      }),
      invalidatesTags: ['quizzes'],
    }),
    deleteQuiz: builder.mutation({
      query: (id) => ({
        url: `/quizzes/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ['quizzes'],
    }),
    getQuizToPlay: builder.query({
      query: (id: number | string) =>
        `http://localhost:8090/api/v1/quizzes/${id}/play`,
    }),
    submitQuizResult: builder.mutation({
      query: (payload: {
        quizId: number;
        duration: number;
        answers: {
          questionId: number;
          answerId: number[];
        }[];
      }) => ({
        url: "/quizzes/submit-quiz",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["quizResults"],
    }),
    getQuizResultById: builder.query({
      query: (resultId: number | string) =>
        `/quizzes/result/${resultId}`,
      providesTags: ["quizResults"],
    }),
    getQuizHistory: builder.query({
      query: () => "http://localhost:8090/api/v1/quizzes/result/history",
      providesTags: ["quizResults"],
    }),
  }),
});

export const {
  useGetQuizzesQuery,
  useGetQuizByIdQuery,
  useGetQuizzesByCategoryQuery,
  useAddQuizMutation,
  useDeleteQuizMutation,
  useGetQuizToPlayQuery,
  useSubmitQuizResultMutation,
  useGetQuizResultByIdQuery,
  useGetQuizHistoryQuery,
} = quizzyApi;