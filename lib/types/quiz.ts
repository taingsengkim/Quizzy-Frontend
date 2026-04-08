export default interface CategoryReponse{
    id:number,
    name:String,
    totalQuiz:number,
    description:string,
    imageUrl:string
}
export interface AnswerResponse  {
  id: number;
  text: string;
  correct: boolean;
}
export interface QuestionResponse {
  id: number;
  text: string;
  answers: AnswerResponse [];
  questionType: "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "TRUE_FALSE";
  points: number;
  difficulty: "EASY" | "MEDIUM" | "HARD";
}
export interface QuizResponse {
  id: number;
  title: string;
  description: string;
  duration: number;
  categoryId: number;
  questions: QuestionResponse [];
}
export interface CreateAnswer  {
  text: string;
  correct: boolean;
};

export interface CreateQuestion  {
  text: string;
  questionType: "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "TRUE_FALSE";
  points: number;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  answers: CreateAnswer[];
};
export interface CreateQuiz  {
  title: string;
  description: string;
  duration: number;
  categoryId: number;
  questions: CreateQuestion[];
};