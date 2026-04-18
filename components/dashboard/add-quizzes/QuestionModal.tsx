"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import QuestionForm, { QuestionFormValues } from "./QuestionForm";

import {
  useAddQuestionToQuizMutation,
  useUpdateQuestionMutation,
} from "@/lib/features/quizzes/quizzesSlice";
import { Question } from "./QuestionCard";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  quizId: string;
  mode: "create" | "edit";
  question?: Question;
};

export default function QuestionModal({
  open,
  onOpenChange,
  quizId,
  mode,
  question,
}: Props) {
  const [addQuestion, { isLoading: creating }] = useAddQuestionToQuizMutation();

  const [updateQuestion, { isLoading: updating }] = useUpdateQuestionMutation();

  const loading = creating || updating;

  const isEdit = mode === "edit";

  const handleSubmit = async (values: QuestionFormValues) => {
    if (isEdit && question) {
      await updateQuestion({
        id: question.id,
        body: values,
      }).unwrap();
    } else {
      await addQuestion({
        quizId,
        ...values,
      }).unwrap();
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Question" : "Create Question"}
          </DialogTitle>
        </DialogHeader>

        <QuestionForm
          key={question?.id || "create"}
          defaultValues={question}
          onSubmit={handleSubmit}
          loading={loading}
          submitLabel={isEdit ? "Save Changes" : "Create Question"}
        />
      </DialogContent>
    </Dialog>
  );
}
