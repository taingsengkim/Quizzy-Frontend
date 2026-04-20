import { PageResponse } from "@/lib/pagination";
import { quizzy } from "../api/api";
import CategoryReponse, { QuizResponse } from "@/lib/types/quiz";

export const quizzyApi = quizzy.injectEndpoints({
  endpoints: (builder) => ({
   
    getQuizzes: builder.query<PageResponse<QuizResponse>, { page: number; size: number; search?: string ;categoryId?: number} >({
      query: ({ page, size, search,categoryId  }) => {
        const params = new URLSearchParams();

        params.append("page", String(page));
        params.append("size", String(size));

        if (search && search.trim() !== "") {
          params.append("search", search);
        }
        if (categoryId) params.append("categoryId", String(categoryId));

        return `/quizzes?${params.toString()}`;
      },
      providesTags: ["quizzes"],
    }),
    getQuizById: builder.query({
      query: (id: string) => ({
        url: `/quizzes/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _err, id) => [{ type: "quizzes", id }],
    }),
    getQuizzesByCategory: builder.query({
      query: (categoryId) => `/quizzes/categories/${categoryId}`,
      providesTags: ["quizzes"],
    }),
    addQuiz: builder.mutation({
      query: (newQuiz) => ({
        url: "/quizzes",
        method: "POST",
        body: newQuiz,
      }),
      invalidatesTags: ["quizzes"],
    }),
    updateQuiz: builder.mutation<
      QuizResponse,
      { id: number; body: Partial<Omit<QuizResponse, "id" | "questions">> }
    >({
      query: ({ id, body }) => ({
        url: `/quizzes/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _err, { id }) => [
        "quizzes",
        { type: "quizzes", id },
      ],
    }),
    updateQuestion: builder.mutation<
      QuizResponse,
      { id: number; body: Partial<Omit<any, "id" | "questions">> }
    >({
      query: ({ id, body }) => ({
        url: `/questions/${id}`,
        method: "PUT",
        body,
      }),
    }),
    addQuestionToQuiz: builder.mutation<
      unknown,
      {
        quizId: string;
        text: string;
        questionType: "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "TRUE_FALSE";
        points: number;
        difficulty: "EASY" | "MEDIUM" | "HARD";
        code?: string | null;
        answers: { text: string; correct: boolean }[];
      }
    >({
      query: ({ quizId, ...body }) => ({
        url: `/quizzes/${quizId}/questions`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _err, { quizId }) => [
        "quizzes",
        { type: "quizzes", id: quizId },
      ],
    }),
    deleteQuestion: builder.mutation({
      query: (id) => ({
        url: `/questions/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["quizzes"],
    }),
    deleteQuiz: builder.mutation({
      query: (id) => ({
        url: `/quizzes/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["quizzes"],
    }),
    getQuizToPlay: builder.query({
      query: (id: number | string) =>
        `/quizzes/${id}/play`,
    }),
    submitQuizResult: builder.mutation({
      query: (payload: {
        quizId: number;
        duration: number;
        answers: { questionId: number; answerId: number[] }[];
      }) => ({
        url: "/quizzes/submit-quiz",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["quizResults"],
    }),
    getQuizResultById: builder.query({
      query: (resultId: number | string) => `/quizzes/result/${resultId}`,
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
  useUpdateQuizMutation,    
  useUpdateQuestionMutation,       
  useAddQuestionToQuizMutation,
  useDeleteQuestionMutation,    
  useDeleteQuizMutation,
  useGetQuizToPlayQuery,
  useSubmitQuizResultMutation,
  useGetQuizResultByIdQuery,
  useGetQuizHistoryQuery,
} = quizzyApi;