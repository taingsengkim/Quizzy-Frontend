"use client";

import { useAddQuizMutation } from "@/lib/features/quizzes/quizzesSlice";
import { CreateAnswer, CreateQuestion, CreateQuiz } from "@/lib/types/quiz";
import { useState } from "react";

const DIFFICULTY_STYLES = {
  EASY: "bg-green-100 text-green-700",
  MEDIUM: "bg-yellow-100 text-yellow-700",
  HARD: "bg-red-100 text-red-700",
};

const TYPE_LABELS = {
  SINGLE_CHOICE: "Single Choice",
  MULTIPLE_CHOICE: "Multiple Choice",
  TRUE_FALSE: "True / False",
};

export default function CreateQuizPage() {
  const [quiz, setQuiz] = useState<CreateQuiz>({
    title: "",
    description: "",
    duration: 30,
    categoryId: 1,
    questions: [],
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);

  const addQuestion = () => {
    setQuiz((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          text: "",
          questionType: "SINGLE_CHOICE",
          points: 5,
          difficulty: "EASY",
          answers: [],
        },
      ],
    }));
  };

  const removeQuestion = (qIndex: number) => {
    setQuiz((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== qIndex),
    }));
  };

  const updateQuestion = (
    index: number,
    field: keyof CreateQuestion,
    value: any,
  ) => {
    setQuiz((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) =>
        i === index ? { ...q, [field]: value } : q,
      ),
    }));
  };

  const addAnswer = (qIndex: number) => {
    setQuiz((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) =>
        i === qIndex
          ? { ...q, answers: [...q.answers, { text: "", correct: false }] }
          : q,
      ),
    }));
  };

  const removeAnswer = (qIndex: number, aIndex: number) => {
    setQuiz((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) =>
        i === qIndex
          ? { ...q, answers: q.answers.filter((_, j) => j !== aIndex) }
          : q,
      ),
    }));
  };

  const updateAnswer = (
    qIndex: number,
    aIndex: number,
    field: keyof CreateAnswer,
    value: any,
  ) => {
    setQuiz((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) => {
        if (i !== qIndex) return q;
        const isSingleSelect =
          q.questionType === "SINGLE_CHOICE" || q.questionType === "TRUE_FALSE";
        const answers = q.answers.map((a, j) => {
          if (
            field === "correct" &&
            value === true &&
            isSingleSelect &&
            j !== aIndex
          ) {
            return { ...a, correct: false };
          }
          return j === aIndex ? { ...a, [field]: value } : a;
        });
        return { ...q, answers };
      }),
    }));
  };

  const [createQuiz, { isLoading }] = useAddQuizMutation();

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      createQuiz(quiz);
      setSubmitted(true);
    } catch (err) {
      alert("Failed to create quiz.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Quiz Created!
          </h2>
          <p className="text-gray-500 mb-6">
            "{quiz.title}" has been published successfully.
          </p>
          <button
            onClick={() => {
              setSubmitted(false);
              setQuiz({
                title: "",
                description: "",
                duration: 30,
                categoryId: 1,
                questions: [],
              });
            }}
            className="bg-gray-900 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-gray-700 transition-colors"
          >
            Create Another Quiz
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gray-900 rounded-md flex items-center justify-center">
              <svg
                className="w-4 h-4 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path
                  fillRule="evenodd"
                  d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <span className="font-bold text-gray-900 text-lg">QuizBuilder</span>
          </div>
          {quiz.questions.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="bg-gray-100 px-3 py-1 rounded-full">
                {quiz.questions.length} questions
              </span>
              <span className="bg-gray-100 px-3 py-1 rounded-full">
                {totalPoints} pts
              </span>
              <span className="bg-gray-100 px-3 py-1 rounded-full">
                {quiz.duration} min
              </span>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        {/* Quiz Details Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-5">
            Quiz Details
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Title
              </label>
              <input
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
                placeholder="e.g. Java Basics Quiz"
                value={quiz.title}
                onChange={(e) => setQuiz({ ...quiz, title: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Description
              </label>
              <textarea
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition resize-none"
                placeholder="What will participants be tested on?"
                rows={2}
                value={quiz.description}
                onChange={(e) =>
                  setQuiz({ ...quiz, description: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  min={1}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
                  value={quiz.duration}
                  onChange={(e) =>
                    setQuiz({ ...quiz, duration: Number(e.target.value) })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Category ID
                </label>
                <input
                  type="number"
                  min={1}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
                  value={quiz.categoryId}
                  onChange={(e) =>
                    setQuiz({ ...quiz, categoryId: Number(e.target.value) })
                  }
                />
              </div>
            </div>
          </div>
        </div>

        {/* Questions Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">
            Questions
            {quiz.questions.length > 0 && (
              <span className="ml-2 text-sm font-normal text-gray-400">
                ({quiz.questions.length})
              </span>
            )}
          </h2>
          <button
            onClick={addQuestion}
            className="flex items-center gap-1.5 bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Question
          </button>
        </div>

        {/* Empty State */}
        {quiz.questions.length === 0 && (
          <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg
                className="w-6 h-6 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-sm text-gray-500">
              No questions yet. Click "Add Question" to get started.
            </p>
          </div>
        )}

        {/* Question Cards */}
        {quiz.questions.map((q, qIndex) => (
          <div
            key={qIndex}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
          >
            {/* Question Header Bar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 bg-gray-900 text-white rounded-md text-xs font-bold flex items-center justify-center">
                  {qIndex + 1}
                </span>
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full ${DIFFICULTY_STYLES[q.difficulty]}`}
                >
                  {q.difficulty}
                </span>
                <span className="text-xs text-gray-500 bg-white border border-gray-200 px-2.5 py-1 rounded-full">
                  {TYPE_LABELS[q.questionType]}
                </span>
                <span className="text-xs text-gray-500 bg-white border border-gray-200 px-2.5 py-1 rounded-full">
                  {q.points} pts
                </span>
              </div>
              <button
                onClick={() => removeQuestion(qIndex)}
                className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Question Text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Question
                </label>
                <input
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
                  placeholder="Enter your question..."
                  value={q.text}
                  onChange={(e) =>
                    updateQuestion(qIndex, "text", e.target.value)
                  }
                />
              </div>

              {/* Controls */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Type
                  </label>
                  <select
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition appearance-none cursor-pointer"
                    value={q.questionType}
                    onChange={(e) =>
                      updateQuestion(qIndex, "questionType", e.target.value)
                    }
                  >
                    <option value="SINGLE_CHOICE">Single Choice</option>
                    <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                    <option value="TRUE_FALSE">True / False</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Difficulty
                  </label>
                  <select
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition appearance-none cursor-pointer"
                    value={q.difficulty}
                    onChange={(e) =>
                      updateQuestion(qIndex, "difficulty", e.target.value)
                    }
                  >
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Points
                  </label>
                  <input
                    type="number"
                    min={1}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
                    value={q.points}
                    onChange={(e) =>
                      updateQuestion(qIndex, "points", Number(e.target.value))
                    }
                  />
                </div>
              </div>

              {/* Answers */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-700">
                    Answers
                  </label>
                  <span className="text-xs text-gray-400">
                    {q.questionType === "MULTIPLE_CHOICE"
                      ? "Check all correct answers"
                      : "Select the correct answer"}
                  </span>
                </div>

                <div className="space-y-2">
                  {q.answers.map((a, aIndex) => (
                    <div
                      key={aIndex}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                        a.correct
                          ? "bg-green-50 border-green-200"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      {/* Correct toggle */}
                      <button
                        onClick={() =>
                          updateAnswer(qIndex, aIndex, "correct", !a.correct)
                        }
                        className={`flex-shrink-0 w-5 h-5 flex items-center justify-center transition-colors border-2 ${
                          q.questionType === "MULTIPLE_CHOICE"
                            ? "rounded"
                            : "rounded-full"
                        } ${
                          a.correct
                            ? "bg-green-500 border-green-500 text-white"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        {a.correct && (
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </button>

                      <input
                        className={`flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 focus:outline-none ${
                          a.correct ? "font-medium" : ""
                        }`}
                        placeholder={`Answer option ${aIndex + 1}`}
                        value={a.text}
                        onChange={(e) =>
                          updateAnswer(qIndex, aIndex, "text", e.target.value)
                        }
                      />

                      {a.correct && (
                        <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                          Correct
                        </span>
                      )}

                      <button
                        onClick={() => removeAnswer(qIndex, aIndex)}
                        className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => addAnswer(qIndex)}
                  className="mt-3 flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Add answer option
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Submit Bar */}
        {quiz.questions.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-900">
                {quiz.title || "Untitled Quiz"}
              </p>
              <p className="text-sm text-gray-400 mt-0.5">
                {quiz.questions.length} question
                {quiz.questions.length !== 1 ? "s" : ""} · {totalPoints} total
                points · {quiz.duration} min
              </p>
            </div>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 bg-gray-900 text-white font-medium px-6 py-2.5 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? (
                <>
                  <svg
                    className="animate-spin w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Creating...
                </>
              ) : (
                <>
                  Publish Quiz
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </>
              )}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
